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

            $areaId = $dataInput['biteship_area_id'] ?? 'IDNP11KOT789311';
            $rates = $this->biteshipService->kalkulasiOngkir($areaId, array_values($keranjang), $dataInput['kurir']);
            $matchedRate = collect($rates)->firstWhere('kurir_kode', strtolower($dataInput['kurir']));
            $biayaOngkir = (float)($matchedRate['harga'] ?? 18000);

            // 4. Hitung Diskon
            $diskon = (float)($dataInput['nilai_diskon'] ?? 0);

            // EQUATION: Total = Subtotal + Ongkir - Diskon
            $total = max(0, ($subtotal + $biayaOngkir) - $diskon);

            // 5. Buat Header Pesanan
            $pesanan = Pesanan::create([
                'pengguna_id' => $penggunaId,
                'nomor_pesanan' => $nomorPesanan,
                'status' => 'belum_bayar',
                'subtotal' => $subtotal,
                'ongkir' => $biayaOngkir,
                'diskon' => $diskon,
                'total' => $total,
                'mata_uang' => 'IDR',
                'catatan' => $dataInput['catatan'] ?? null,
                'kode_voucher' => $dataInput['kode_voucher'] ?? null,
                'poin_didapat' => (int)floor($total / 10000) * 10,
            ]);

            // 6. Simpan Alamat Pengguna
            if ($penggunaId) {
                AlamatPengguna::create([
                    'pengguna_id' => $penggunaId,
                    'label' => 'Alamat Utama',
                    'nama_penerima' => $dataInput['nama_lengkap'],
                    'telepon' => $dataInput['telepon'],
                    'email' => $dataInput['email'],
                    'area_id' => $areaId,
                    'provinsi' => $dataInput['provinsi'] ?? 'D.I. Yogyakarta',
                    'kota' => $dataInput['kota'],
                    'kecamatan' => $dataInput['kecamatan'] ?? 'Depok',
                    'kode_pos' => $dataInput['kode_pos'],
                    'alamat_lengkap' => $dataInput['alamat_lengkap'],
                    'adalah_utama' => true,
                ]);
            }

            // 7. Simpan Detail Item Pesanan
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
            }

            // 8. Simpan Detail Pesanan Pengiriman
            PesananPengiriman::create([
                'pesanan_id' => $pesanan->id,
                'kurir' => strtolower($dataInput['kurir']),
                'layanan' => $matchedRate['layanan_kode'] ?? 'reg',
                'tracking_status' => 'allocated',
            ]);

            // 9. Inisialisasi Charge Midtrans Core API
            $pembeli = [
                'nama' => $dataInput['nama_lengkap'],
                'email' => $dataInput['email'],
                'telepon' => $dataInput['telepon'],
            ];

            $metode = strtolower($dataInput['metode_pembayaran']);
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
