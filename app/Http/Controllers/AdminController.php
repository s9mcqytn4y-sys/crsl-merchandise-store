<?php

namespace App\Http\Controllers;

use App\Models\Pesanan;
use App\Models\PesananPengiriman;
use App\Models\Produk;
use App\Models\ProdukVarian;
use App\Models\Voucher;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AdminController extends Controller
{
    /**
     * Dashboard Ringkasan Metrik Bisnis & Operasional
     */
    public function dashboard(): Response
    {
        $statusSukses = ['dibayar', 'diproses', 'dikirim', 'selesai'];

        $totalPendapatan = (float) Pesanan::whereIn('status', $statusSukses)->sum('total');
        $pesananPerluKirim = Pesanan::where('status', 'diproses')->count();
        $pesananMenungguBayar = Pesanan::where('status', 'belum_bayar')->count();
        $totalPesananSelesai = Pesanan::where('status', 'selesai')->count();

        // Stok Kritis: Varian dengan stok <= 5
        $stokKritis = ProdukVarian::with('produk')
            ->where('stok', '<=', 5)
            ->where('aktif', true)
            ->orderBy('stok', 'asc')
            ->limit(8)
            ->get()
            ->map(fn ($v) => [
                'id' => $v->id,
                'produk_nama' => $v->produk?->nama ?? 'Produk',
                'varian_nama' => $v->nama_varian ?? $v->warna ?? 'Default',
                'sku' => $v->sku,
                'stok' => $v->stok,
            ]);

        // 6 Pesanan Terbaru
        $pesananTerbaru = Pesanan::with(['items.produk', 'pengiriman'])
            ->latest()
            ->limit(6)
            ->get()
            ->map(fn ($p) => [
                'id' => $p->id,
                'nomor_pesanan' => $p->nomor_pesanan,
                'penerima_nama' => $p->penerima_nama,
                'total' => (float) $p->total,
                'status' => $p->status,
                'kurir' => $p->pengiriman?->kurir ?? 'JNE',
                'tanggal' => $p->created_at->format('d M Y, H:i'),
            ]);

        return Inertia::render('Admin/Dashboard', [
            'statistik' => [
                'total_pendapatan' => $totalPendapatan,
                'pesanan_perlu_kirim' => $pesananPerluKirim,
                'menunggu_pembayaran' => $pesananMenungguBayar,
                'pesanan_selesai' => $totalPesananSelesai,
            ],
            'stok_kritis' => $stokKritis,
            'pesanan_terbaru' => $pesananTerbaru,
        ]);
    }

    /**
     * Manajemen & Fulfillment Pesanan
     */
    public function pesanan(Request $request): Response
    {
        $status = $request->query('status');
        $cari = $request->query('cari');

        $query = Pesanan::with(['items.produk', 'items.varian', 'pengiriman', 'pembayaran'])
            ->latest();

        if (!empty($status) && $status !== 'semua') {
            $query->where('status', $status);
        }

        if (!empty($cari)) {
            $query->where(function ($q) use ($cari) {
                $q->where('nomor_pesanan', 'ILIKE', "%{$cari}%")
                  ->orWhere('penerima_nama', 'ILIKE', "%{$cari}%")
                  ->orWhere('penerima_telepon', 'ILIKE', "%{$cari}%");
            });
        }

        $daftarPesanan = $query->paginate(15)->through(fn ($p) => [
            'id' => $p->id,
            'nomor_pesanan' => $p->nomor_pesanan,
            'penerima_nama' => $p->penerima_nama,
            'penerima_telepon' => $p->penerima_telepon,
            'alamat_lengkap' => "{$p->alamat_jalan}, {$p->kecamatan}, {$p->kota_kabupaten}, {$p->provinsi} {$p->kode_pos}",
            'total' => (float) $p->total,
            'status' => $p->status,
            'kurir' => $p->pengiriman?->kurir ?? 'JNE',
            'layanan' => $p->pengiriman?->layanan ?? 'REG',
            'nomor_resi' => $p->pengiriman?->nomor_resi,
            'metode_bayar' => $p->pembayaran?->metode_bayar ?? 'Midtrans',
            'tanggal' => $p->created_at->format('d M Y, H:i'),
            'item_count' => $p->items->sum('jumlah'),
            'items' => $p->items->map(fn ($it) => [
                'nama' => $it->nama_produk ?? $it->produk?->nama,
                'varian' => $it->nama_varian,
                'jumlah' => $it->jumlah,
                'harga' => (float) $it->harga,
            ]),
        ]);

        return Inertia::render('Admin/Pesanan', [
            'pesanan' => $daftarPesanan,
            'filter' => [
                'status' => $status ?? 'semua',
                'cari' => $cari ?? '',
            ],
        ]);
    }

    /**
     * Update Resi Pengiriman dan Ubah Status Menjadi 'dikirim'
     */
    public function updateResi(Request $request, string $nomorPesanan): RedirectResponse
    {
        $validated = $request->validate([
            'nomor_resi' => ['required', 'string', 'max:100'],
        ]);

        $pesanan = Pesanan::where('nomor_pesanan', $nomorPesanan)
            ->orWhereRaw("REPLACE(nomor_pesanan, '/', '-') = ?", [$nomorPesanan])
            ->firstOrFail();

        $pengiriman = $pesanan->pengiriman;
        if (!$pengiriman) {
            $pengiriman = new PesananPengiriman(['pesanan_id' => $pesanan->id]);
        }

        $pengiriman->nomor_resi = strtoupper(trim($validated['nomor_resi']));
        $pengiriman->status_pengiriman = 'dikirim';
        $pengiriman->save();

        $pesanan->status = 'dikirim';
        $pesanan->save();

        return back()->with('sukses', "Resi {$pengiriman->nomor_resi} berhasil disimpan untuk pesanan #{$pesanan->nomor_pesanan}");
    }

    /**
     * Update Status Operasional Pesanan
     */
    public function updateStatusPesanan(Request $request, string $nomorPesanan): RedirectResponse
    {
        $validated = $request->validate([
            'status' => ['required', 'in:belum_bayar,diproses,dikirim,selesai,dibatalkan'],
        ]);

        $pesanan = Pesanan::where('nomor_pesanan', $nomorPesanan)
            ->orWhereRaw("REPLACE(nomor_pesanan, '/', '-') = ?", [$nomorPesanan])
            ->firstOrFail();

        $pesanan->status = $validated['status'];
        $pesanan->save();

        return back()->with('sukses', "Status pesanan #{$pesanan->nomor_pesanan} berhasil diubah menjadi {$validated['status']}");
    }

    /**
     * Manajemen Katalog Produk & Stok Varian
     */
    public function produk(Request $request): Response
    {
        $cari = $request->query('cari');

        $query = Produk::with(['kategori', 'varians', 'gambarUtama'])
            ->orderBy('id', 'desc');

        if (!empty($cari)) {
            $query->where('nama', 'ILIKE', "%{$cari}%");
        }

        $produkList = $query->paginate(12)->through(fn ($p) => [
            'id' => $p->id,
            'nama' => $p->nama,
            'slug' => $p->slug,
            'kategori' => $p->kategori?->nama ?? 'Umum',
            'harga_dasar' => (float) $p->harga_dasar,
            'harga_diskon' => $p->harga_diskon ? (float) $p->harga_diskon : null,
            'stok_total' => $p->varians->sum('stok'),
            'aktif' => (bool) $p->aktif,
            'gambar' => $p->gambarUtama?->path_gambar ?? '/assets/gambar/banner-1.webp',
            'varians' => $p->varians->map(fn ($v) => [
                'id' => $v->id,
                'nama' => $v->nama_varian ?? $v->warna ?? 'Default',
                'sku' => $v->sku,
                'stok' => $v->stok,
                'harga_tambahan' => (float) $v->harga_tambahan,
            ]),
        ]);

        return Inertia::render('Admin/Produk', [
            'produk' => $produkList,
            'cari' => $cari ?? '',
        ]);
    }

    /**
     * Update Stok Varian Cepat Langsung dari CMS
     */
    public function updateStokVarian(Request $request, int $varianId): RedirectResponse
    {
        $validated = $request->validate([
            'stok' => ['required', 'integer', 'min:0'],
        ]);

        $varian = ProdukVarian::findOrFail($varianId);
        $varian->stok = $validated['stok'];
        $varian->save();

        return back()->with('sukses', "Stok varian {$varian->nama_varian} berhasil diperbarui menjadi {$validated['stok']}");
    }

    /**
     * Manajemen Kupon & Voucher Diskon
     */
    public function voucher(): Response
    {
        $vouchers = Voucher::withCount('pemakaian')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(fn ($v) => [
                'id' => $v->id,
                'kode' => $v->kode,
                'judul' => $v->judul,
                'deskripsi' => $v->deskripsi,
                'tipe' => $v->tipe,
                'nilai' => (float) $v->nilai,
                'min_belanja' => (float) $v->min_belanja,
                'maksimal_diskon' => $v->maksimal_diskon ? (float) $v->maksimal_diskon : null,
                'kuota' => $v->kuota,
                'terpakai' => $v->pemakaian_count,
                'berlaku_sampai' => $v->berlaku_sampai ? $v->berlaku_sampai->format('d M Y, H:i') : 'Tanpa Batas',
                'aktif' => (bool) $v->aktif,
            ]);

        return Inertia::render('Admin/Voucher', [
            'vouchers' => $vouchers,
        ]);
    }

    /**
     * Buat Voucher Promo Baru
     */
    public function simpanVoucher(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'kode' => ['required', 'string', 'max:50', 'unique:voucher,kode'],
            'judul' => ['required', 'string', 'max:150'],
            'deskripsi' => ['nullable', 'string'],
            'tipe' => ['required', 'in:persentase,nominal,ongkir'],
            'nilai' => ['required', 'numeric', 'min:0'],
            'min_belanja' => ['nullable', 'numeric', 'min:0'],
            'maksimal_diskon' => ['nullable', 'numeric', 'min:0'],
            'kuota' => ['required', 'integer', 'min:1'],
            'berlaku_sampai' => ['nullable', 'date'],
        ]);

        $voucher = new Voucher();
        $voucher->kode = strtoupper(trim($validated['kode']));
        $voucher->judul = $validated['judul'];
        $voucher->deskripsi = $validated['deskripsi'] ?? null;
        $voucher->tipe = $validated['tipe'];
        $voucher->nilai = $validated['nilai'];
        $voucher->min_belanja = $validated['min_belanja'] ?? 0;
        $voucher->maksimal_diskon = $validated['maksimal_diskon'] ?? null;
        $voucher->kuota = $validated['kuota'];
        $voucher->berlaku_sampai = $validated['berlaku_sampai'] ?? null;
        $voucher->aktif = true;
        $voucher->tampil_publik = true;
        $voucher->save();

        \Illuminate\Support\Facades\Cache::forget('vouchers_publik_shared');

        return back()->with('sukses', "Voucher {$voucher->kode} berhasil dibuat!");
    }

    /**
     * Toggle Aktif/Nonaktif Voucher
     */
    public function toggleVoucher(int $voucherId): RedirectResponse
    {
        $voucher = Voucher::findOrFail($voucherId);
        $voucher->aktif = !$voucher->aktif;
        $voucher->save();

        \Illuminate\Support\Facades\Cache::forget('vouchers_publik_shared');

        $statusStr = $voucher->aktif ? 'diaktifkan' : 'dinonaktifkan';
        return back()->with('sukses', "Voucher {$voucher->kode} berhasil {$statusStr}");
    }
}
