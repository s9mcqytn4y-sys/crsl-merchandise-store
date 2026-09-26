<?php

namespace App\Domains\Order\Actions;

use App\Domains\Inventory\Services\InventoriService;
use App\Domains\Payment\Services\MidtransService;
use App\Domains\Shipping\Services\BiteshipService;
use App\Models\AlamatPengguna;
use App\Models\ItemPesanan;
use App\Models\Pesanan;
use App\Models\PesananPembayaran;
use App\Models\PesananPengiriman;
use App\Models\Produk;
use App\Models\ProdukVarian;
use Exception;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class BuatPesananAction
{
    public function __construct(
        protected InventoriService $inventoriService,
        protected BiteshipService $biteshipService,
        protected MidtransService $midtransService
    ) {}

    /**
     * Eksekusi pembuatan pesanan baru dengan transaksi database terproteksi.
     *
     * @param array $dataInput
     * @param array $keranjang
     * @param int|null $penggunaId
     * @return Pesanan
     * @throws Exception
     */
    public function execute(array $dataInput, array $keranjang, ?int $penggunaId = null): Pesanan
    {
        if (empty($keranjang)) {
            throw new Exception("Keranjang belanja kosong.");
        }

        return DB::transaction(function () use ($dataInput, $keranjang, $penggunaId) {
            // 1. Kunci dan Kurangi Stok Varian via InventoriService
            $this->inventoriService->kunciDanKurangiStok(array_values($keranjang));

            // 2. Generate Nomor Pesanan Harian Unik (Format: INV/CRSL/YYYYMMDD/0001)
            $nomorPesanan = $this->generateNomorPesanan();

            // 3. Kalkulasi Subtotal & Ongkir
            $subtotal = collect($keranjang)->sum(fn ($item) => $item['harga'] * $item['jumlah']);

            $biayaOngkir = isset($dataInput['ongkir']) ? (float)$dataInput['ongkir'] : null;
            $layananKurir = $dataInput['layanan_kurir'] ?? null;
            $areaId = $dataInput['biteship_area_id'] ?? 'IDNP11KOT789311';

            if ($biayaOngkir === null) {
                $rates = $this->biteshipService->kalkulasiOngkir($areaId, array_values($keranjang), $dataInput['kurir']);
                $matchedRate = collect($rates)->firstWhere('kurir_kode', strtolower($dataInput['kurir']));
                $biayaOngkir = (float)($matchedRate['harga'] ?? 18000);
                $layananKurir = $matchedRate['layanan_kode'] ?? 'reg';
            }

            // 4. Hitung Diskon Voucher & Loyalty Points (Atomic DB Protection)
            $diskonVoucher = (float)($dataInput['nilai_diskon'] ?? ($dataInput['diskon'] ?? 0));
            $poinDigunakan = 0;

            // 4a. Proteksi Pemotongan Saldo Loyalty Points
            if (!empty($dataInput['use_loyalty_point']) && $penggunaId) {
                $loyalitas = \App\Models\PenggunaLoyalitas::where('pengguna_id', $penggunaId)
                    ->lockForUpdate()
                    ->first();

                if ($loyalitas && $loyalitas->poin > 0) {
                    $sisaSetelahVoucher = max(0, $subtotal - $diskonVoucher);
                    $poinDigunakan = (int)min((float)$loyalitas->poin, $sisaSetelahVoucher);
                    if ($poinDigunakan > 0) {
                        $loyalitas->decrement('poin', $poinDigunakan);
                        \Illuminate\Support\Facades\Cache::forget("pengguna:akun:{$penggunaId}");
                        \Illuminate\Support\Facades\Cache::forget("pengguna:profil:{$penggunaId}");
                    }
                }
            }

            $totalDiskon = $diskonVoucher + $poinDigunakan;
            $asuransi = !empty($dataInput['asuransi_pengiriman']);
            $biayaAsuransi = $asuransi ? (float)($dataInput['biaya_asuransi'] ?? 2500) : 0;

            // EQUATION: Total = Subtotal + Ongkir + Asuransi - Total Diskon
            $total = max(0, ($subtotal + $biayaOngkir + $biayaAsuransi) - $totalDiskon);

            // 5. Buat Header Pesanan
            $isDropship = !empty($dataInput['is_dropship']);

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
                'kode_voucher' => $dataInput['kode_voucher'] ?? null,
                'poin_digunakan' => $poinDigunakan,
                'poin_didapat' => (int)floor($total / 10000) * 10,
                'is_dropship' => $isDropship,
                'dropship_pengirim' => $isDropship ? ($dataInput['dropship_pengirim'] ?? null) : null,
                'dropship_telepon' => $isDropship ? ($dataInput['dropship_telepon'] ?? null) : null,
            ]);

            // 5b. Catat Penggunaan Voucher (Cegah Unlimited Claim)
            if (!empty($dataInput['kode_voucher'])) {
                $voucher = \App\Models\Voucher::where('kode', strtoupper(trim($dataInput['kode_voucher'])))
                    ->where('aktif', true)
                    ->lockForUpdate()
                    ->first();

                if ($voucher) {
                    if ($penggunaId) {
                        $sudahPernahPakai = \App\Models\VoucherTerpakai::where('voucher_id', $voucher->id)
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

                    if ($penggunaId) {
                        \App\Models\VoucherTerpakai::create([
                            'voucher_id' => $voucher->id,
                            'pengguna_id' => $penggunaId,
                            'pesanan_id' => $pesanan->id,
                            'dipakai_pada' => now(),
                        ]);
                    }
                }
            }

            // 6. Simpan Alamat Pengguna
            if ($penggunaId) {
                $sudahPunyaUtama = AlamatPengguna::where('pengguna_id', $penggunaId)
                    ->where('adalah_utama', true)
                    ->exists();

                AlamatPengguna::create([
                    'pengguna_id' => $penggunaId,
                    'label' => 'Alamat Pengiriman',
                    'nama_penerima' => $dataInput['nama_lengkap'],
                    'telepon' => $dataInput['telepon'],
                    'email' => $dataInput['email'],
                    'area_id' => $areaId,
                    'provinsi' => $dataInput['provinsi'] ?? 'D.I. Yogyakarta',
                    'kota' => $dataInput['kota'],
                    'kecamatan' => $dataInput['kecamatan'] ?? 'Depok',
                    'kode_pos' => $dataInput['kode_pos'],
                    'alamat_lengkap' => $dataInput['alamat_lengkap'],
                    'adalah_utama' => !$sudahPunyaUtama,
                ]);
            }

            // 7. Simpan Detail Item Pesanan
            foreach ($keranjang as $item) {
                $rawProdukId = $item['produk_id'] ?? ($item['id'] ?? null);
                $produkId = (!empty($rawProdukId) && is_numeric($rawProdukId)) ? (int) $rawProdukId : null;
                if ($produkId && !Produk::where('id', $produkId)->exists()) {
                    $produkId = null;
                }

                $rawVarianId = $item['varian_id'] ?? null;
                $varianId = (!empty($rawVarianId) && is_numeric($rawVarianId)) ? (int) $rawVarianId : null;
                if ($varianId && !ProdukVarian::where('id', $varianId)->exists()) {
                    $varianId = null;
                }

                ItemPesanan::create([
                    'pesanan_id' => $pesanan->id,
                    'produk_id' => $produkId,
                    'produk_varian_id' => $varianId,
                    'nama_produk' => $item['nama_produk'] ?? 'Produk CRSL',
                    'sku' => $item['sku'] ?? ($produkId ? ('CRSL-' . $produkId) : 'CRSL-ITEM'),
                    'harga' => $item['harga'] ?? 0,
                    'jumlah' => $item['jumlah'] ?? 1,
                    'ukuran' => $item['ukuran'] ?? null,
                    'warna' => $item['warna'] ?? null,
                    'gambar' => $item['gambar'] ?? null,
                ]);
            }

            // 8. Simpan Detail Pesanan Pengiriman
            PesananPengiriman::create([
                'pesanan_id' => $pesanan->id,
                'kurir' => strtolower($dataInput['kurir']),
                'layanan' => $layananKurir ?? 'reg',
                'tracking_status' => 'allocated',
                'json_payload' => [
                    'nama_penerima' => $dataInput['nama_lengkap'],
                    'telepon' => $dataInput['telepon'],
                    'email' => $dataInput['email'],
                    'alamat_lengkap' => $dataInput['alamat_lengkap'],
                    'provinsi' => $dataInput['provinsi'] ?? '',
                    'kota' => $dataInput['kota'] ?? '',
                    'kecamatan' => $dataInput['kecamatan'] ?? '',
                    'kode_pos' => $dataInput['kode_pos'] ?? '',
                    'area_id' => $areaId,
                ],
            ]);

            // 9. Inisialisasi Charge Midtrans Core API (Real Sandbox Execution)
            $pembeli = [
                'nama' => $dataInput['nama_lengkap'],
                'email' => $dataInput['email'],
                'telepon' => $dataInput['telepon'],
            ];

            $metode = strtolower(str_replace(['va_', 'va-'], '', (string) $dataInput['metode_pembayaran']));
            $pesananData = [
                'nomor_pesanan' => $nomorPesanan,
                'total' => $total,
            ];

            if ($metode === 'qris') {
                $chargeRes = $this->midtransService->chargeQris($pesananData, $pembeli);
            } elseif ($metode === 'mandiri' || $metode === 'echannel') {
                $chargeRes = $this->midtransService->chargeMandiriBill($pesananData, $pembeli);
            } else {
                $chargeRes = $this->midtransService->chargeBankTransfer($metode, $pesananData, $pembeli);
            }

            if (empty($chargeRes['sukses'])) {
                $pesanError = $chargeRes['pesan'] ?? 'Gagal memproses pembayaran melalui Midtrans.';
                throw new Exception($pesanError);
            }

            // 10. Simpan Detail Pesanan Pembayaran
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

            Log::info("Pesanan Domain Action Success: Nomor {$nomorPesanan}, Total: {$total}");

            return $pesanan;
        });
    }

    /**
     * Membentuk nomor pesanan harian dengan locking aman: INV/CRSL/YYYYMMDD/0001
     */
    protected function generateNomorPesanan(): string
    {
        $today = date('Y-m-d');
        $dateStr = date('Ymd');

        // Pessimistic Lock pada baris urutan harian
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
        return "INV/CRSL/{$dateStr}/{$paddedCounter}";
    }
}
