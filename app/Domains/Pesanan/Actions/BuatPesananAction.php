<?php

namespace App\Domains\Pesanan\Actions;

use App\Domains\Inventori\Services\InventoriService;
use App\Domains\Pembayaran\Services\MidtransService;
use App\Domains\Pengiriman\Services\BiteshipService;
use App\Models\AlamatPengguna;
use App\Models\ItemPesanan;
use App\Models\PenggunaLoyalitas;
use App\Models\Pesanan;
use App\Models\PesananPembayaran;
use App\Models\PesananPengiriman;
use App\Models\Produk;
use App\Models\ProdukVarian;
use App\Models\Voucher;
use App\Models\VoucherTerpakai;
use Exception;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class BuatPesananAction
{
    public function __construct(
        protected InventoriService $inventoriService,
        protected BiteshipService $biteshipService,
        protected MidtransService $midtransService
    ) {}

    public function eksekusi(array $dataInput, array $keranjang = [], ?int $penggunaId = null): Pesanan
    {
        if (empty($keranjang) && isset($dataInput['items'])) {
            $keranjang = $dataInput['items'];
        }
        return $this->execute($dataInput, $keranjang, $penggunaId);
    }

    /**
     * Eksekusi pembuatan pesanan baru dengan pemisahan database transaction dan eksternal API.
     */
    public function execute(array $dataInput, array $keranjang = [], ?int $penggunaId = null): Pesanan
    {
        if (isset($dataInput['items']) && !isset($keranjang['items']) && !isset($keranjang[0])) {
            $temp = $keranjang;
            $keranjang = $dataInput['items'];
            $dataInput = array_merge($temp, $dataInput);
        } elseif (empty($keranjang) && isset($dataInput['items'])) {
            $keranjang = $dataInput['items'];
        }

        if (empty($keranjang)) {
            throw new Exception("Keranjang belanja kosong.");
        }

        // 1. Ambil data asli varian & produk dari database untuk cegah manipulasi harga
        $validatedCart = $this->validasiDanHitungKeranjang($keranjang);
        $subtotal = $validatedCart['subtotal'];
        $itemsDiproses = $validatedCart['items'];

        // 2. Tentukan Ongkos Kirim sebelum masuk transaksi database
        $biayaOngkir = isset($dataInput['ongkir']) ? (float)$dataInput['ongkir'] : null;
        $layananKurir = $dataInput['layanan_kurir'] ?? null;
        $areaId = $dataInput['biteship_area_id'] ?? 'IDNP11KOT789311';

        if ($biayaOngkir === null) {
            $rates = $this->biteshipService->kalkulasiOngkir($areaId, $itemsDiproses, $dataInput['kurir'] ?? 'sicepat');
            $matchedRate = collect($rates)->firstWhere('kurir_kode', strtolower($dataInput['kurir'] ?? 'sicepat'));
            $biayaOngkir = (float)($matchedRate['harga'] ?? 18000);
            $layananKurir = $matchedRate['layanan_kode'] ?? 'reg';
        }

        $namaPenerima = $dataInput['nama_penerima'] ?? $dataInput['nama_lengkap'] ?? 'Pelanggan';

        // 3. Simpan Pesanan & Resource Terproteksi di dalam DB Transaction
        $statePesanan = DB::transaction(function () use ($dataInput, $itemsDiproses, $subtotal, $biayaOngkir, $layananKurir, $areaId, $namaPenerima, $penggunaId) {
            // A. Kunci dan Kurangi Stok Varian via InventoriService
            $this->inventoriService->kunciDanKurangiStok($itemsDiproses);

            // B. Generate Nomor Pesanan Harian Unik
            $nomorPesanan = $this->generateNomorPesanan();

            // C. Validasi & Kalkulasi Voucher dari Database (Server-side calculation)
            $voucherDipakai = null;
            $diskonVoucher = 0;
            if (!empty($dataInput['kode_voucher'])) {
                $voucher = Voucher::where('kode', strtoupper(trim($dataInput['kode_voucher'])))
                    ->where('aktif', true)
                    ->lockForUpdate()
                    ->first();

                if (!$voucher) {
                    throw new Exception("Voucher tidak valid atau sudah tidak aktif.");
                }

                $minBelanja = (float)($voucher->min_belanja ?? $voucher->minimal_belanja ?? 0);
                if ($minBelanja > 0 && $subtotal < $minBelanja) {
                    throw new Exception("Subtotal belanja belum memenuhi syarat minimum voucher ini (min: Rp " . number_format($minBelanja, 0, ',', '.') . ").");
                }

                if ($penggunaId) {
                    $sudahPernahPakai = VoucherTerpakai::where('voucher_id', $voucher->id)
                        ->where('pengguna_id', $penggunaId)
                        ->exists();

                    if ($sudahPernahPakai) {
                        throw new Exception("Voucher {$voucher->kode} telah digunakan sebelumnya oleh akun Anda.");
                    }
                }

                if ($voucher->kuota !== null) {
                    if ($voucher->kuota <= 0) {
                        throw new Exception("Kuota voucher {$voucher->kode} telah habis.");
                    }
                    $voucher->decrement('kuota', 1);
                }

                // Hitung diskon riil (nominal atau persentase)
                if (isset($voucher->tipe) && in_array($voucher->tipe, ['persen', 'persentase'])) {
                    $diskonKalkulasi = round($subtotal * ($voucher->nilai / 100));
                    $diskonVoucher = !empty($voucher->maksimal_diskon) ? min($diskonKalkulasi, (float)$voucher->maksimal_diskon) : $diskonKalkulasi;
                } else {
                    $diskonVoucher = (float)($voucher->nilai ?? $voucher->nominal ?? 0);
                }
                $voucherDipakai = $voucher;
            }

            // D. Proteksi Pemotongan Saldo Loyalty Points
            $poinDigunakan = 0;
            if (!empty($dataInput['use_loyalty_point']) && $penggunaId) {
                $loyalitas = PenggunaLoyalitas::where('pengguna_id', $penggunaId)
                    ->lockForUpdate()
                    ->first();

                if ($loyalitas && $loyalitas->poin > 0) {
                    $sisaSetelahVoucher = max(0, $subtotal - $diskonVoucher);
                    $poinDigunakan = (int)min((float)$loyalitas->poin, $sisaSetelahVoucher);
                    if ($poinDigunakan > 0) {
                        $loyalitas->decrement('poin', $poinDigunakan);
                        Cache::forget("pengguna:akun:{$penggunaId}");
                        Cache::forget("pengguna:profil:{$penggunaId}");
                    }
                }
            }

            $totalDiskon = $diskonVoucher + $poinDigunakan;
            $asuransi = !empty($dataInput['asuransi_pengiriman']);
            $biayaAsuransi = $asuransi ? (float)($dataInput['biaya_asuransi'] ?? 2500) : 0;
            $total = max(0, ($subtotal + $biayaOngkir + $biayaAsuransi) - $totalDiskon);

            $isDropship = !empty($dataInput['is_dropship']);

            // E. Simpan Header Pesanan
            $pesanan = Pesanan::create([
                'pengguna_id' => $penggunaId,
                'nomor_pesanan' => $nomorPesanan,
                'status' => 'belum_bayar',
                'subtotal' => $subtotal,
                'ongkir' => $biayaOngkir,
                'biaya_asuransi' => $biayaAsuransi,
                'diskon' => $totalDiskon,
                'total' => $total,
                'mata_uang' => 'IDR',
                'catatan' => $dataInput['catatan'] ?? null,
                'kode_voucher' => $voucherDipakai?->kode ?? null,
                'poin_digunakan' => $poinDigunakan,
                'poin_didapat' => (int)floor($total / 10000) * 10,
                'is_dropship' => $isDropship,
                'dropship_pengirim' => $isDropship ? ($dataInput['dropship_pengirim'] ?? null) : null,
                'dropship_telepon' => $isDropship ? ($dataInput['dropship_telepon'] ?? null) : null,
            ]);

            // F. Catat Voucher Terpakai
            if ($voucherDipakai && $penggunaId) {
                VoucherTerpakai::create([
                    'voucher_id' => $voucherDipakai->id,
                    'pengguna_id' => $penggunaId,
                    'pesanan_id' => $pesanan->id,
                    'dipakai_pada' => now(),
                ]);
            }

            // G. Simpan Alamat (Gunakan firstOrCreate untuk menghindari duplikasi record yang sama)
            if ($penggunaId) {
                $sudahPunyaUtama = AlamatPengguna::where('pengguna_id', $penggunaId)->where('adalah_utama', true)->exists();

                AlamatPengguna::firstOrCreate(
                    [
                        'pengguna_id' => $penggunaId,
                        'area_id' => $areaId,
                        'alamat_lengkap' => $dataInput['alamat_lengkap'] ?? '',
                    ],
                    [
                        'label' => 'Alamat Pengiriman',
                        'nama_penerima' => $namaPenerima,
                        'telepon' => $dataInput['telepon'] ?? '',
                        'email' => $dataInput['email'] ?? '',
                        'provinsi' => $dataInput['provinsi'] ?? 'D.I. Yogyakarta',
                        'kota' => $dataInput['kota'] ?? 'Sleman',
                        'kecamatan' => $dataInput['kecamatan'] ?? 'Depok',
                        'kode_pos' => $dataInput['kode_pos'] ?? '55281',
                        'adalah_utama' => !$sudahPunyaUtama,
                    ]
                );
            }

            // H. Simpan Item Pesanan
            foreach ($itemsDiproses as $item) {
                ItemPesanan::create([
                    'pesanan_id' => $pesanan->id,
                    'produk_id' => $item['produk_id'],
                    'produk_varian_id' => $item['varian_id'],
                    'nama_produk' => $item['nama_produk'],
                    'sku' => $item['sku'],
                    'harga' => $item['harga'], // Harga asli dari DB
                    'jumlah' => $item['jumlah'],
                    'ukuran' => $item['ukuran'],
                    'warna' => $item['warna'],
                    'gambar' => $item['gambar'],
                ]);
            }

            // I. Simpan Detail Pengiriman
            PesananPengiriman::create([
                'pesanan_id' => $pesanan->id,
                'kurir' => strtolower($dataInput['kurir'] ?? 'sicepat'),
                'layanan' => $layananKurir ?? 'reg',
                'tracking_status' => 'allocated',
                'json_payload' => [
                    'nama_penerima' => $namaPenerima,
                    'telepon' => $dataInput['telepon'] ?? '',
                    'email' => $dataInput['email'] ?? '',
                    'alamat_lengkap' => $dataInput['alamat_lengkap'] ?? '',
                    'provinsi' => $dataInput['provinsi'] ?? '',
                    'kota' => $dataInput['kota'] ?? '',
                    'kecamatan' => $dataInput['kecamatan'] ?? '',
                    'kode_pos' => $dataInput['kode_pos'] ?? '',
                    'area_id' => $areaId,
                ],
            ]);

            return [
                'pesanan' => $pesanan,
                'nomor_pesanan' => $nomorPesanan,
                'total' => $total,
                'voucher_id' => $voucherDipakai?->id,
                'poin_digunakan' => $poinDigunakan,
                'items' => $itemsDiproses,
            ];
        });

        $pesanan = $statePesanan['pesanan'];

        // 4. Inisialisasi Midtrans di LUAR DB Transaction
        try {
            $pembeli = [
                'nama' => $namaPenerima,
                'email' => $dataInput['email'] ?? '',
                'telepon' => $dataInput['telepon'] ?? '',
            ];

            $metode = strtolower(str_replace(['va_', 'va-'], '', (string) ($dataInput['metode_pembayaran'] ?? 'qris')));
            $pesananData = [
                'nomor_pesanan' => $statePesanan['nomor_pesanan'],
                'total' => $statePesanan['total'],
            ];

            if ($metode === 'qris') {
                $chargeRes = $this->midtransService->chargeQris($pesananData, $pembeli);
            } elseif ($metode === 'mandiri' || $metode === 'echannel') {
                $chargeRes = $this->midtransService->chargeMandiriBill($pesananData, $pembeli);
            } else {
                $chargeRes = $this->midtransService->chargeBankTransfer($metode, $pesananData, $pembeli);
            }

            if (empty($chargeRes['sukses'])) {
                throw new Exception($chargeRes['pesan'] ?? 'Gagal memproses pembayaran melalui Midtrans.');
            }

            // Simpan detail pembayaran setelah Midtrans berhasil merespons
            PesananPembayaran::create([
                'pesanan_id' => $pesanan->id,
                'metode_bayar' => $chargeRes['metode_bayar'] ?? strtoupper($metode),
                'midtrans_id' => $chargeRes['transaction_id'] ?? null,
                'midtrans_status' => $chargeRes['status_transaksi'] ?? 'pending',
                'nomor_va' => $chargeRes['nomor_va'] ?? null,
                'kode_biller' => $chargeRes['kode_biller'] ?? null,
                'qr_string' => $chargeRes['qr_string'] ?? null,
                'qr_code_url' => $chargeRes['qr_code_url'] ?? null,
                'waktu_kedaluwarsa' => $chargeRes['waktu_kadaluarsa'] ?? (str_contains($metode, 'qris') ? now()->addMinutes(15) : now()->addHours(24)),
                'instruksi_bayar' => $chargeRes['instruksi_bayar'] ?? [],
            ]);

            Log::info("Pesanan Domain Action Success: Nomor {$statePesanan['nomor_pesanan']}, Total: {$statePesanan['total']}");

            return $pesanan;
        } catch (Exception $e) {
            // 5. Compensating Transaction: Rollback stok, kuota, poin jika gateway gagal
            $this->kompensasiKegagalanPembayaran($pesanan, $statePesanan, $penggunaId);

            Log::error("Midtrans Charge Error untuk Pesanan {$pesanan->nomor_pesanan}: " . $e->getMessage());
            throw new Exception("Gagal menghubungi gateway pembayaran: " . $e->getMessage());
        }
    }

    /**
     * Membaca dan memvalidasi harga asli dari tabel database untuk mencegah manipulasi client-side.
     */
    protected function validasiDanHitungKeranjang(array $keranjang): array
    {
        $varianIds = [];
        $produkIds = [];

        foreach ($keranjang as $item) {
            $vid = $item['varian_id'] ?? $item['produk_varian_id'] ?? null;
            $pid = $item['produk_id'] ?? ($item['id'] ?? null);
            if ($vid) $varianIds[] = (int)$vid;
            if ($pid) $produkIds[] = (int)$pid;
        }

        $varians = ProdukVarian::with('produk')->whereIn('id', array_filter($varianIds))->get()->keyBy('id');
        $produks = Produk::whereIn('id', array_filter($produkIds))->get()->keyBy('id');

        $subtotal = 0;
        $items = [];

        foreach ($keranjang as $item) {
            $vid = (int)($item['varian_id'] ?? $item['produk_varian_id'] ?? 0);
            $pid = (int)($item['produk_id'] ?? ($item['id'] ?? 0));
            $jumlah = max(1, (int)($item['jumlah'] ?? $item['quantity'] ?? 1));

            $varian = $varians->get($vid);
            $produk = $produks->get($pid) ?? $varian?->produk;

            if (!$produk && !$varian) {
                throw new Exception("Produk atau varian tidak ditemukan di database.");
            }

            // Harga WAJIB bersumber dari DB: varian > produk > harga dasar produk + tambahan
            $hargaDb = (float)($varian?->harga ?? $produk?->harga ?? 0);
            if ($hargaDb <= 0 && $produk) {
                $hargaDb = (float)($produk->harga_diskon ?? $produk->harga_dasar ?? 0) + (float)($varian?->harga_tambahan ?? 0);
            }
            if ($hargaDb <= 0) {
                throw new Exception("Harga produk tidak valid.");
            }

            $subtotal += ($hargaDb * $jumlah);

            $gambar = $varian?->gambar_varian ?? $produk?->gambar_utama ?? '/assets/gambar/drinke-tumblr.webp';
            $namaVarian = $varian?->nama_varian ?? $varian?->nama ?? '';

            $items[] = [
                'produk_id' => $produk?->id,
                'varian_id' => $varian?->id,
                'nama_produk' => $varian && $namaVarian !== '' ? ($produk->nama . ' - ' . $namaVarian) : ($produk->nama ?? 'Produk'),
                'sku' => $varian?->sku ?? $produk?->sku ?? ('CRSL-' . ($produk?->id ?? 'ITEM')),
                'harga' => $hargaDb,
                'jumlah' => $jumlah,
                'ukuran' => $item['ukuran'] ?? $varian?->ukuran ?? null,
                'warna' => $item['warna'] ?? $varian?->warna ?? null,
                'gambar' => $gambar,
            ];
        }

        return [
            'subtotal' => $subtotal,
            'items' => $items,
        ];
    }

    /**
     * Mengembalikan kondisi database jika request ke Midtrans gagal/timeout.
     */
    protected function kompensasiKegagalanPembayaran(Pesanan $pesanan, array $state, ?int $penggunaId): void
    {
        DB::transaction(function () use ($pesanan, $state, $penggunaId) {
            // Tandai pesanan gagal/dibatalkan
            $pesanan->update(['status' => 'batal']);

            // Kembalikan stok inventori
            if (method_exists($this->inventoriService, 'kembalikanStok')) {
                $this->inventoriService->kembalikanStok($state['items']);
            }

            // Kembalikan kuota voucher
            if (!empty($state['voucher_id'])) {
                Voucher::where('id', $state['voucher_id'])->increment('kuota', 1);
                if ($penggunaId) {
                    VoucherTerpakai::where('voucher_id', $state['voucher_id'])
                        ->where('pesanan_id', $pesanan->id)
                        ->delete();
                }
            }

            // Kembalikan poin loyalitas
            if (!empty($state['poin_digunakan']) && $penggunaId) {
                PenggunaLoyalitas::where('pengguna_id', $penggunaId)
                    ->increment('poin', $state['poin_digunakan']);
                Cache::forget("pengguna:akun:{$penggunaId}");
                Cache::forget("pengguna:profil:{$penggunaId}");
            }
        });
    }

    /**
     * Membentuk nomor pesanan harian dengan locking aman: INV/CRSL/YYYYMMDD/0001
     */
    protected function generateNomorPesanan(): string
    {
        $today = date('Y-m-d');
        $dateStr = date('Ymd');

        $sequence = DB::table('nomor_pesanan_harian')
            ->where('tanggal', $today)
            ->lockForUpdate()
            ->first();

        if ($sequence) {
            $nextVal = $sequence->urutan + 1;
            DB::table('nomor_pesanan_harian')
                ->where('tanggal', $today)
                ->update(['urutan' => $nextVal, 'updated_at' => now()]);
        } else {
            $nextVal = 1;
            DB::table('nomor_pesanan_harian')->insert([
                'tanggal' => $today,
                'urutan' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        $paddedCounter = str_pad((string)$nextVal, 4, '0', STR_PAD_LEFT);
        $candidate = "INV/CRSL/{$dateStr}/{$paddedCounter}";

        $pattern = "INV/CRSL/{$dateStr}/%";
        $maxExisting = (int) DB::table('pesanan')
            ->where('nomor_pesanan', 'like', $pattern)
            ->selectRaw("MAX(CAST(RIGHT(nomor_pesanan, 4) AS INTEGER)) as max_val")
            ->value('max_val');

        if ($maxExisting >= $nextVal) {
            $nextVal = $maxExisting + 1;
            DB::table('nomor_pesanan_harian')
                ->where('tanggal', $today)
                ->update(['urutan' => $nextVal, 'updated_at' => now()]);
            $paddedCounter = str_pad((string)$nextVal, 4, '0', STR_PAD_LEFT);
            $candidate = "INV/CRSL/{$dateStr}/{$paddedCounter}";
        }

        return $candidate;
    }
}
