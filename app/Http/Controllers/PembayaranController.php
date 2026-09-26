<?php

namespace App\Http\Controllers;

use App\Domains\Pembayaran\Services\MidtransService;
use App\Domains\Pengiriman\Services\BiteshipService;
use App\Domains\Pesanan\Actions\BuatPesananAction;
use App\Models\AlamatPengguna;
use App\Models\ItemPesanan;
use App\Models\Pesanan;
use App\Models\PesananPembayaran;
use App\Models\PesananPengiriman;
use App\Models\ProdukVarian;
use App\Models\Voucher;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class PembayaranController extends Controller
{
    public function __construct(
        protected MidtransService $midtransService,
        protected BiteshipService $biteshipService,
        protected BuatPesananAction $buatPesananAction
    ) {}

    public function index(): Response|RedirectResponse
    {
        $keranjang = session()->get('keranjang', []);

        $allAddresses = [];
        $alamatUtama = null;
        $loyaltyPoint = 0;
        $currentUser = null;

        if (auth()->check()) {
            $user = auth()->user();
            $currentUser = [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'telepon' => $user->telepon,
            ];

            $loyaltyPoint = (int) ($user->loyalitas?->poin ?? 0);

            $rawAddresses = AlamatPengguna::where('pengguna_id', $user->id)
                ->orderByDesc('adalah_utama')
                ->orderByDesc('id')
                ->get();

            $allAddresses = $rawAddresses->map(function ($a) {
                return [
                    'id'             => $a->id,
                    'label'          => $a->label ?? 'Rumah',
                    'nama_penerima'  => $a->nama_penerima,
                    'telepon'        => $a->telepon,
                    'email'          => $a->email ?? auth()->user()->email,
                    'area_id'        => $a->area_id ?? '',
                    'provinsi'       => $a->provinsi ?? '',
                    'kota'           => $a->kota ?? '',
                    'kecamatan'      => $a->kecamatan ?? '',
                    'kelurahan'      => $a->kelurahan ?? '',
                    'kode_pos'       => $a->kode_pos ?? '',
                    'alamat_lengkap' => $a->alamat_lengkap,
                    'format_lengkap' => trim(($a->alamat_lengkap ?? '') . ', ' . ($a->kecamatan ?? '') . ', ' . ($a->kota ?? '') . ', ' . ($a->provinsi ?? '') . ' ' . ($a->kode_pos ?? '')),
                    'adalah_utama'   => (bool)$a->adalah_utama,
                ];
            })->all();

            $alamatUtama = !empty($allAddresses) ? $allAddresses[0] : null;

            $dbKeranjang = \App\Models\Keranjang::with(['items.produk', 'items.produk_varian'])
                ->where('pengguna_id', $user->id)
                ->first();
            if ($dbKeranjang && $dbKeranjang->items->isNotEmpty() && empty($keranjang)) {
                $keranjang = [];
                foreach ($dbKeranjang->items as $item) {
                    $p = $item->produk;
                    $v = $item->produk_varian;
                    if ($p) {
                        $cartKey = $p->id . ($v ? '_' . $v->id : '');
                        $harga = $v && $v->harga_tambahan > 0
                            ? ($p->harga_diskon ?? $p->harga_dasar) + $v->harga_tambahan
                            : ($p->harga_diskon ?? $p->harga_dasar);
                        $keranjang[$cartKey] = [
                            'id' => $cartKey,
                            'produk_id' => $p->id,
                            'varian_id' => $v?->id,
                            'nama_produk' => $p->nama . ($v ? " ({$v->nama_varian})" : ''),
                            'sku' => $v?->sku ?? "CRSL-{$p->id}",
                            'harga' => (float)$harga,
                            'jumlah' => $item->jumlah,
                            'ukuran' => $v?->ukuran,
                            'warna' => $v?->warna,
                            'gambar' => $v?->gambar_varian ?? $p->gambar_utama,
                        ];
                    }
                }
                session()->put('keranjang', $keranjang);
            }
        }

        $subtotal = collect($keranjang)->sum(fn ($item) => ($item['harga'] ?? 0) * ($item['jumlah'] ?? 1));

        // Ambil voucher aktif dari database
        $vouchers = Voucher::where('aktif', true)
            ->where(function ($q) {
                $q->whereNull('berlaku_sampai')
                  ->orWhere('berlaku_sampai', '>=', now());
            })
            ->get()
            ->map(function ($v) {
                return [
                    'id'          => $v->id,
                    'kode'        => $v->kode,
                    'code'        => $v->kode,
                    'judul'       => $v->judul,
                    'title'       => $v->judul,
                    'tipe'        => $v->tipe,
                    'nilai'       => (float) $v->nilai,
                    'min_belanja' => (float) $v->min_belanja,
                    'discount'    => $v->tipe === 'persen' ? "{$v->nilai}%" : 'Rp ' . number_format($v->nilai, 0, ',', '.'),
                ];
            })
            ->all();

        return Inertia::render('Pembayaran', [
            'keranjang' => $keranjang,
            'subtotal' => $subtotal,
            'user' => $currentUser,
            'alamatUtama' => $alamatUtama,
            'addresses' => $allAddresses,
            'loyaltyPoint' => $loyaltyPoint,
            'vouchers' => $vouchers,
            'kurirList' => collect(config('pengiriman.kurir', []))
                ->filter(fn ($k) => !empty($k['aktif']))
                ->values()
                ->all(),
            'metodeBayarList' => collect(config('pembayaran.metode', []))
                ->filter(fn ($m) => !empty($m['aktif']))
                ->values()
                ->all(),
        ]);
    }

    /**
     * Validasi kode voucher dan hitung diskon real-time langsung dari database dan cache.
     */
    public function validasiVoucher(Request $request): JsonResponse
    {
        $request->validate([
            'kode' => 'required|string|max:50',
            'subtotal' => 'required|numeric|min:0',
        ]);

        $kode = strtoupper(trim($request->input('kode')));
        $subtotal = (float)$request->input('subtotal');

        $cacheKey = "voucher:detail:{$kode}";
        $voucher = \Illuminate\Support\Facades\Cache::remember($cacheKey, 300, function () use ($kode) {
            return Voucher::where('kode', $kode)->where('aktif', true)->first();
        });

        if (!$voucher) {
            return response()->json([
                'sukses' => false,
                'pesan' => 'Kode voucher tidak valid atau tidak aktif.'
            ], 404);
        }

        // Cek masa berlaku
        if ($voucher->berlaku_sampai && now()->greaterThan($voucher->berlaku_sampai)) {
            return response()->json([
                'sukses' => false,
                'pesan' => "Voucher {$voucher->kode} telah kedaluwarsa."
            ], 422);
        }

        // Cek kuota
        if ($voucher->kuota !== null && $voucher->kuota <= 0) {
            return response()->json([
                'sukses' => false,
                'pesan' => "Kuota voucher {$voucher->kode} telah habis."
            ], 422);
        }

        // Cek minimum belanja
        if ($subtotal < (float)$voucher->min_belanja) {
            return response()->json([
                'sukses' => false,
                'pesan' => 'Minimum belanja Rp ' . number_format($voucher->min_belanja, 0, ',', '.') . ' untuk voucher ini.'
            ], 422);
        }

        $nilaiDiskon = ($voucher->tipe === 'persen')
            ? round($subtotal * ($voucher->nilai / 100))
            : (float)$voucher->nilai;

        return response()->json([
            'sukses' => true,
            'kode' => $voucher->kode,
            'judul' => $voucher->judul,
            'tipe' => $voucher->tipe,
            'nilai_diskon' => (float)$nilaiDiskon,
            'pesan' => "Voucher {$voucher->judul} Terpasang! Hemat Rp " . number_format($nilaiDiskon, 0, ',', '.') . "!",
        ]);
    }

    /**
     * Memproses checkout dan inisialisasi Midtrans Direct Charge.
     */
    public function proses(Request $request): RedirectResponse
    {
        $keranjang = [];

        $buyNowJson = $request->input('buy_now_item');
        if (!empty($buyNowJson)) {
            $buyNowData = is_array($buyNowJson) ? $buyNowJson : json_decode($buyNowJson, true);
            if ($buyNowData && isset($buyNowData['produk_id'])) {
                $cartKey = 'buynow-' . $buyNowData['produk_id'] . (!empty($buyNowData['varian_id']) ? '_' . $buyNowData['varian_id'] : '');
                $keranjang = [$cartKey => $buyNowData];
            }
        } elseif ($request->has('items') && is_array($request->input('items')) && count($request->input('items')) > 0) {
            foreach ($request->input('items') as $idx => $it) {
                $pId = $it['id'] ?? ($it['produk_id'] ?? $idx);
                $vId = $it['varian_id'] ?? null;
                $cartKey = "req-{$pId}" . ($vId ? "_{$vId}" : '');
                $keranjang[$cartKey] = [
                    'id'          => $cartKey,
                    'produk_id'   => $pId,
                    'varian_id'   => $vId,
                    'nama_produk' => $it['nama'] ?? ($it['nama_produk'] ?? 'Produk CRSL'),
                    'harga'       => (float)($it['harga'] ?? 0),
                    'jumlah'      => (int)($it['jumlah'] ?? 1),
                    'warna'       => $it['warna'] ?? null,
                    'ukuran'      => $it['ukuran'] ?? null,
                    'gambar'      => $it['gambar'] ?? ($it['gambar_utama'] ?? null),
                ];
            }
        } else {
            $keranjang = session()->get('keranjang', []);
        }

        if (empty($keranjang)) {
            return redirect()->route('katalog')->with('error', 'Keranjang belanja Anda kosong.');
        }

        $validated = $request->validate([
            'nama_lengkap' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'telepon' => 'required|string|max:20',
            'biteship_area_id' => 'nullable|string|max:64',
            'alamat_lengkap' => 'required|string',
            'provinsi' => 'nullable|string|max:100',
            'kota' => 'required|string|max:100',
            'kecamatan' => 'nullable|string|max:100',
            'kode_pos' => 'required|string|max:10',
            'kurir' => 'required|string',
            'metode_pembayaran' => 'required|string',
            'kode_voucher' => 'nullable|string|max:50',
            'catatan' => 'nullable|string|max:500',
        ]);

        try {
            // Kalkulasi Diskon Voucher awal
            $subtotalAwal = collect($keranjang)->sum(fn ($item) => ($item['harga'] ?? 0) * ($item['jumlah'] ?? 1));
            $diskon = 0;
            if (!empty($validated['kode_voucher'])) {
                $voucher = Voucher::where('kode', strtoupper(trim($validated['kode_voucher'])))
                    ->where('aktif', true)
                    ->first();
                if ($voucher && $subtotalAwal >= (float)$voucher->min_belanja) {
                    $diskon = ($voucher->tipe === 'persen')
                        ? round($subtotalAwal * ($voucher->nilai / 100))
                        : (float)$voucher->nilai;
                }
            }

            // Delegasi Eksekusi ke Domain Action BuatPesananAction
            $pesanan = $this->buatPesananAction->execute(
                dataInput: array_merge($validated, [
                    'nilai_diskon' => $diskon,
                    'is_dropship' => !empty($request->input('is_dropship')),
                    'dropship_pengirim' => $request->input('dropship_pengirim'),
                    'dropship_telepon' => $request->input('dropship_telepon'),
                    'asuransi_pengiriman' => !empty($request->input('asuransi_pengiriman')),
                    'biaya_asuransi' => $request->input('biaya_asuransi'),
                    'ongkir' => $request->input('ongkir'),
                    'layanan_kurir' => $request->input('layanan_kurir'),
                ]),
                keranjang: $keranjang,
                penggunaId: auth()->id()
            );

            session()->forget('keranjang');
            session(['nomor_pesanan_terakhir' => $pesanan->nomor_pesanan]);

            if (auth()->check()) {
                \Illuminate\Support\Facades\Cache::forget('pengguna:akun:' . auth()->id());
            }

            $urlNomorPesanan = str_replace('/', '-', $pesanan->nomor_pesanan);
            return redirect()->route('faktur', ['nomorPesanan' => $urlNomorPesanan])
                ->with('sukses', 'Pesanan berhasil dibuat. Silakan selesaikan pembayaran!');

        } catch (\Throwable $e) {
            report($e);
            return redirect()->back()->with('error', 'Gagal memproses pesanan: ' . $e->getMessage());
        }
    }
}
