<?php

namespace App\Http\Controllers;

use App\Models\ItemPesanan;
use App\Models\Pesanan;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class PembayaranController extends Controller
{
    public function index(): Response|RedirectResponse
    {
        $keranjang = session()->get('keranjang', []);

        if (empty($keranjang)) {
            return redirect()->route('katalog')->with('error', 'Keranjang belanja Anda masih kosong.');
        }

        $subtotal = collect($keranjang)->sum(fn ($item) => $item['harga'] * $item['jumlah']);

        return Inertia::render('Checkout', [
            'keranjang' => $keranjang,
            'subtotal' => $subtotal,
            'kurirList' => [
                ['id' => 'jne', 'nama' => 'JNE Reguler (2-3 hari)', 'biaya' => 18000],
                ['id' => 'jnt', 'nama' => 'J&T Express (1-2 hari)', 'biaya' => 20000],
                ['id' => 'sicepat', 'nama' => 'SiCepat BEST (1 hari)', 'biaya' => 24000],
            ],
            'metodeBayarList' => [
                ['id' => 'qris', 'nama' => 'QRIS (GoPay, OVO, ShopeePay, Dana)', 'ikon' => '📱'],
                ['id' => 'bca', 'nama' => 'Transfer Bank BCA', 'ikon' => '🏦'],
                ['id' => 'mandiri', 'nama' => 'Transfer Bank Mandiri', 'ikon' => '💳'],
            ],
        ]);
    }

    public function proses(Request $request): RedirectResponse
    {
        $keranjang = session()->get('keranjang', []);

        if (empty($keranjang)) {
            return redirect()->route('katalog');
        }

        $validated = $request->validate([
            'nama_lengkap' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'telepon' => 'required|string|max:20',
            'alamat_lengkap' => 'required|string',
            'kota' => 'required|string|max:100',
            'kode_pos' => 'required|string|max:10',
            'kurir' => 'required|string',
            'metode_pembayaran' => 'required|string',
            'catatan' => 'nullable|string|max:500',
        ]);

        $subtotal = collect($keranjang)->sum(fn ($item) => $item['harga'] * $item['jumlah']);
        $biayaOngkir = match ($validated['kurir']) {
            'sicepat' => 24000,
            'jnt' => 20000,
            default => 18000,
        };
        $total = $subtotal + $biayaOngkir;

        $nomorPesanan = 'INV/CRSL/' . date('Ymd') . '/' . strtoupper(Str::random(5));

        $pesanan = Pesanan::create([
            'pengguna_id' => auth()->id(),
            'nomor_pesanan' => $nomorPesanan,
            'status' => 'belum_bayar',
            'subtotal' => $subtotal,
            'ongkir' => $biayaOngkir,
            'total' => $total,
            'mata_uang' => 'IDR',
            'catatan' => $validated['catatan'] ?? null,
        ]);

        foreach ($keranjang as $item) {
            ItemPesanan::create([
                'pesanan_id' => $pesanan->id,
                'produk_id' => $item['produk_id'],
                'produk_varian_id' => $item['varian_id'] ?? null,
                'nama_produk' => $item['nama_produk'],
                'sku' => $item['sku'] ?? 'CRSL-' . $item['produk_id'],
                'harga' => $item['harga'],
                'jumlah' => $item['jumlah'],
                'ukuran' => $item['ukuran'],
                'warna' => $item['warna'],
                'gambar' => $item['gambar'],
            ]);
        }

        session()->forget('keranjang');

        return redirect()->route('faktur', ['nomorPesanan' => $nomorPesanan]);
    }
}
