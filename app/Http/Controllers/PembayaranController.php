<?php

namespace App\Http\Controllers;

use App\Domains\Payment\Services\MidtransService;
use App\Domains\Shipping\Services\BiteshipService;
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
        protected BiteshipService $biteshipService
    ) {}

    public function index(): Response|RedirectResponse
    {
        $keranjang = session()->get('keranjang', []);

        if (empty($keranjang)) {
            // Sediakan fallback item sampel (CRSL Cassie Wallet) agar halaman /pembayaran & /checkout dapat langsung dievaluasi
            $keranjang = [
                'demo-cassie-wallet' => [
                    'id' => 'demo-cassie-wallet',
                    'produk_id' => 1,
                    'varian_id' => 1,
                    'nama_produk' => 'CRSL Cassie Wallet | Dompet Lipat Canvas Wanita Pattern Plaid | Compact & Stylish',
                    'harga' => 179100,
                    'harga_asli' => 199000,
                    'jumlah' => 1,
                    'warna' => 'CHILO PINK',
                    'gambar' => '/aset/produk/cassie-wallet-pink.webp',
                ]
            ];
            session()->put('keranjang', $keranjang);
        }

        $subtotal = collect($keranjang)->sum(fn ($item) => ($item['harga'] ?? 0) * ($item['jumlah'] ?? 1));

        return Inertia::render('Pembayaran', [
            'keranjang' => $keranjang,
            'subtotal' => $subtotal,
            'kurirList' => [
                ['id' => 'jne', 'kurir_kode' => 'jne', 'nama' => 'JNE Reguler (2-3 hari)', 'biaya' => 18000],
                ['id' => 'jnt', 'kurir_kode' => 'jnt', 'nama' => 'J&T Express (1-2 hari)', 'biaya' => 20000],
                ['id' => 'sicepat', 'kurir_kode' => 'sicepat', 'nama' => 'SiCepat BEST (1 hari)', 'biaya' => 24000],
            ],
            'metodeBayarList' => [
                ['id' => 'qris', 'nama' => 'QRIS (GoPay, OVO, ShopeePay, Dana, BCA)', 'ikon' => '📱'],
                ['id' => 'bca', 'nama' => 'Transfer Virtual Account BCA', 'ikon' => '🏦'],
                ['id' => 'bni', 'nama' => 'Transfer Virtual Account BNI', 'ikon' => '🏛️'],
                ['id' => 'bri', 'nama' => 'Transfer Virtual Account BRI', 'ikon' => '🏢'],
                ['id' => 'mandiri', 'nama' => 'Mandiri Bill Payment (E-Channel)', 'ikon' => '💳'],
            ],
        ]);
    }

    /**
     * Validasi kode voucher dan hitung diskon real-time.
     */
    public function validasiVoucher(Request $request): JsonResponse
    {
        $request->validate([
            'kode' => 'required|string',
            'subtotal' => 'required|numeric|min:0',
        ]);

        $kode = strtoupper(trim($request->input('kode')));
        $subtotal = (float)$request->input('subtotal');

        if ($kode === 'FREEONGKIR10K') {
            if ($subtotal < 179000) {
                return response()->json(['sukses' => false, 'pesan' => 'Minimum belanja Rp 179.000 untuk voucher ini.'], 422);
            }
            return response()->json([
                'sukses' => true,
                'kode' => 'FREEONGKIR10K',
                'judul' => 'Diskon Ongkir Rp 10.000',
                'tipe' => 'ongkir',
                'nilai_diskon' => 10000,
                'pesan' => 'Voucher Diskon Ongkir Rp 10.000 Terpasang!',
            ]);
        }

        if (in_array($kode, ['NEWADOPTER10', 'AUTO10', 'CRSLHEMAT'])) {
            $minBelanja = ($kode === 'NEWADOPTER10') ? 100000 : 200000;
            if ($subtotal < $minBelanja) {
                return response()->json([
                    'sukses' => false,
                    'pesan' => 'Minimum belanja Rp ' . number_format($minBelanja, 0, ',', '.') . ' untuk voucher ini.'
                ], 422);
            }
            $nilaiDiskon = (float)round($subtotal * 0.10);
            return response()->json([
                'sukses' => true,
                'kode' => $kode,
                'judul' => 'Diskon 10% All Items',
                'tipe' => 'persen',
                'nilai_diskon' => $nilaiDiskon,
                'pesan' => 'Voucher Diskon 10% Terpasang! Hemat Rp ' . number_format($nilaiDiskon, 0, ',', '.') . '!',
            ]);
        }

        $voucher = Voucher::where('kode', $kode)->where('aktif', true)->first();
        if (!$voucher) {
            return response()->json(['sukses' => false, 'pesan' => 'Kode voucher tidak valid atau tidak berlaku.'], 404);
        }

        if ($subtotal < (float)$voucher->min_belanja) {
            return response()->json([
                'sukses' => false,
                'pesan' => 'Minimum belanja Rp ' . number_format($voucher->min_belanja, 0, ',', '.') . ' untuk voucher ini.'
            ], 422);
        }

        $nilaiDiskon = ($voucher->tipe === 'persen')
            ? round($subtotal * ($voucher->nilai / 100))
            : $voucher->nilai;

        return response()->json([
            'sukses' => true,
            'kode' => $voucher->kode,
            'judul' => $voucher->judul,
            'tipe' => $voucher->tipe,
            'nilai_diskon' => (float)$nilaiDiskon,
            'pesan' => 'Voucher ' . $voucher->judul . ' Terpasang!',
        ]);
    }

    /**
     * Memproses checkout dan inisialisasi Midtrans Direct Charge.
     */
    public function proses(Request $request): RedirectResponse
    {
        $keranjang = session()->get('keranjang', []);

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

        DB::beginTransaction();
        try {
            $subtotal = collect($keranjang)->sum(fn ($item) => $item['harga'] * $item['jumlah']);

            // Kalkulasi Ongkir Biteship
            $areaId = $validated['biteship_area_id'] ?? 'IDNP11KOT789311';
            $rates = $this->biteshipService->kalkulasiOngkir($areaId, array_values($keranjang), $validated['kurir']);
            $matchedRate = collect($rates)->firstWhere('kurir_kode', strtolower($validated['kurir']));
            $biayaOngkir = (float)($matchedRate['harga'] ?? 18000);

            // Hitung Diskon Voucher jika ada
            $diskon = 0;
            if (!empty($validated['kode_voucher'])) {
                $vRes = $this->validasiVoucher(new Request(['kode' => $validated['kode_voucher'], 'subtotal' => $subtotal]));
                if ($vRes->getData()->sukses ?? false) {
                    $diskon = (float)($vRes->getData()->nilai_diskon ?? 0);
                }
            }

            // EQUATION: Total = Subtotal + Ongkir - Diskon
            $total = max(0, ($subtotal + $biayaOngkir) - $diskon);

            $nomorPesanan = 'INV/CRSL/' . date('Ymd') . '/' . strtoupper(Str::random(5));

            // 1. Simpan Pesanan Utama
            $pesanan = Pesanan::create([
                'pengguna_id' => auth()->id(),
                'nomor_pesanan' => $nomorPesanan,
                'status' => 'belum_bayar',
                'subtotal' => $subtotal,
                'ongkir' => $biayaOngkir,
                'diskon' => $diskon,
                'total' => $total,
                'mata_uang' => 'IDR',
                'catatan' => $validated['catatan'] ?? null,
                'kode_voucher' => $validated['kode_voucher'] ?? null,
                'poin_didapat' => (int)floor($total / 10000) * 10,
            ]);

            // 2. Simpan Alamat Pengguna
            if (auth()->check()) {
                AlamatPengguna::create([
                    'pengguna_id' => auth()->id(),
                    'label' => 'Alamat Utama',
                    'nama_penerima' => $validated['nama_lengkap'],
                    'telepon' => $validated['telepon'],
                    'email' => $validated['email'],
                    'area_id' => $areaId,
                    'provinsi' => $validated['provinsi'] ?? 'D.I. Yogyakarta',
                    'kota' => $validated['kota'],
                    'kecamatan' => $validated['kecamatan'] ?? 'Depok',
                    'kode_pos' => $validated['kode_pos'],
                    'alamat_lengkap' => $validated['alamat_lengkap'],
                    'adalah_utama' => true,
                ]);
            }

            // 3. Simpan Item Pesanan & Kurangi Stok Varian
            foreach ($keranjang as $item) {
                ItemPesanan::create([
                    'pesanan_id' => $pesanan->id,
                    'produk_id' => $item['produk_id'],
                    'produk_varian_id' => $item['varian_id'] ?? null,
                    'nama_produk' => $item['nama_produk'],
                    'sku' => $item['sku'] ?? ('CRSL-' . $item['produk_id']),
                    'harga' => $item['harga'],
                    'jumlah' => $item['jumlah'],
                    'ukuran' => $item['ukuran'] ?? null,
                    'warna' => $item['warna'] ?? null,
                    'gambar' => $item['gambar'] ?? null,
                ]);

                if (!empty($item['varian_id'])) {
                    ProdukVarian::where('id', $item['varian_id'])->decrement('stok', $item['jumlah']);
                }
            }

            // 4. Simpan Pesanan Pengiriman
            PesananPengiriman::create([
                'pesanan_id' => $pesanan->id,
                'kurir' => strtolower($validated['kurir']),
                'layanan' => $matchedRate['layanan_kode'] ?? 'reg',
                'tracking_status' => 'allocated',
            ]);

            // 5. Inisialisasi Midtrans Direct Charge Core API
            $pembeli = [
                'nama' => $validated['nama_lengkap'],
                'email' => $validated['email'],
                'telepon' => $validated['telepon'],
            ];

            $metode = strtolower($validated['metode_pembayaran']);
            $pesananData = [
                'nomor_pesanan' => $nomorPesanan,
                'total' => $total,
            ];

            if ($metode === 'qris') {
                $chargeRes = $this->midtransService->chargeQris($pesananData, $pembeli);
            } elseif ($metode === 'mandiri') {
                $chargeRes = $this->midtransService->chargeMandiriBill($pesananData, $pembeli);
            } else {
                $chargeRes = $this->midtransService->chargeBankTransfer($metode, $pesananData, $pembeli);
            }

            // 6. Simpan Detail Pesanan Pembayaran
            PesananPembayaran::create([
                'pesanan_id' => $pesanan->id,
                'metode_bayar' => $chargeRes['metode_bayar'] ?? strtoupper($metode),
                'midtrans_id' => $chargeRes['transaction_id'] ?? null,
                'midtrans_status' => $chargeRes['status_transaksi'] ?? 'pending',
                'nomor_va' => $chargeRes['nomor_va'] ?? null,
                'kode_biller' => $chargeRes['kode_biller'] ?? null,
                'qr_string' => $chargeRes['qr_string'] ?? null,
                'qr_code_url' => $chargeRes['qr_code_url'] ?? null,
                'waktu_kedaluwarsa' => $chargeRes['waktu_kadaluarsa'] ?? now()->addMinutes(15),
                'instruksi_bayar' => $chargeRes['instruksi_bayar'] ?? [],
            ]);

            DB::commit();
            session()->forget('keranjang');

            return redirect()->route('faktur', ['nomorPesanan' => $nomorPesanan])
                ->with('sukses', 'Pesanan berhasil dibuat. Silakan selesaikan pembayaran!');

        } catch (\Throwable $e) {
            DB::rollBack();
            report($e);
            return redirect()->back()->with('error', 'Gagal memproses pesanan: ' . $e->getMessage());
        }
    }
}
