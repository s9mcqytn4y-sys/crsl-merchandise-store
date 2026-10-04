<?php

declare(strict_types=1);

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
use App\Models\RiwayatPoin;
use App\Models\TierLoyalitas;
use App\Models\Voucher;
use App\Models\VoucherTerpakai;
use Exception;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class BuatPesananAction
{
    public function __construct(
        protected InventoriService $inventoriService,
        protected BiteshipService $biteshipService,
        protected MidtransService $midtransService
    ) {}

    public function eksekusi(array $dataInput, array $keranjang = [], ?int $penggunaId = null): Pesanan
    {
        return $this->execute($dataInput, $keranjang, $penggunaId);
    }

    public function execute(array $dataInput, array $keranjang = [], ?int $penggunaId = null): Pesanan
    {
        // 0. Proteksi Idempotensi Checkout Berulang
        $idempotencyKey = (string)($dataInput['idempotency_key'] ?? '');
        if (!empty($idempotencyKey)) {
            $cachedPesananId = Cache::get("idempotency_order:{$idempotencyKey}");
            if ($cachedPesananId) {
                $existingPesanan = Pesanan::find($cachedPesananId);
                if ($existingPesanan) {
                    return $existingPesanan;
                }
            }
        }

        // Validasi input ongkir tidak boleh negatif jika dikirim
        if (isset($dataInput['ongkir']) && (float)$dataInput['ongkir'] < 0) {
            throw new Exception("Biaya ongkos kirim tidak boleh bernilai negatif.");
        }

        // Normalisasi format item keranjang
        if (isset($dataInput['items']) && !isset($keranjang['items']) && !isset($keranjang[0])) {
            $temp = $keranjang;
            $keranjang = $dataInput['items'];
            $dataInput = array_merge($temp, $dataInput);
        } elseif (empty($keranjang) && isset($dataInput['items'])) {
            $keranjang = $dataInput['items'];
        }

        if (empty($keranjang) || !is_array($keranjang)) {
            throw new Exception("Keranjang belanja kosong.");
        }

        // 1. Validasi item dan kalkulasi harga & bobot server-side
        $validatedCart = $this->validasiDanHitungKeranjang($keranjang);
        $subtotal = $validatedCart['subtotal'];
        $itemsDiproses = $validatedCart['items'];
        $totalBeratGram = $validatedCart['total_berat'];

        // 2. Resolusi ID Area Tujuan Biteship (Server-Authoritative)
        $areaId = $this->resolveDestinationAreaId($dataInput);

        // 3. Kalkulasi Server-Authoritative Ongkir & Layanan Kurir
        $kurirDipilih = strtolower((string)($dataInput['kurir'] ?? 'jne'));
        $layananInput = strtolower((string)($dataInput['layanan_kurir'] ?? $dataInput['layanan'] ?? ''));

        $rates = $this->biteshipService->kalkulasiOngkir($areaId, $itemsDiproses, $kurirDipilih);

        $matchedRate = collect($rates)->first(function ($r) use ($kurirDipilih, $layananInput) {
            $rKurir = strtolower((string)($r['kurir_kode'] ?? $r['kurir'] ?? ''));
            $rLayanan = strtolower((string)($r['layanan_kode'] ?? $r['layanan'] ?? ''));
            return $rKurir === $kurirDipilih && (!empty($layananInput) ? $rLayanan === $layananInput : true);
        }) ?? collect($rates)->firstWhere('kurir_kode', $kurirDipilih) ?? collect($rates)->first();

        // Nilai ongkir mutlak ditentukan oleh backend (Server-Authoritative)
        $biayaOngkir = (float)($matchedRate['harga'] ?? $matchedRate['biaya'] ?? 18000);
        $layananKurir = $matchedRate['layanan_kode'] ?? ($matchedRate['layanan'] ?? ($layananInput ?: 'reg'));

        $namaPenerima = $dataInput['nama_penerima'] ?? $dataInput['nama_lengkap'] ?? 'Pelanggan';

        // 4. Simpan Pesanan di dalam DB Transaction
        $statePesanan = DB::transaction(function () use (
            $dataInput,
            $itemsDiproses,
            $subtotal,
            $totalBeratGram,
            $biayaOngkir,
            $layananKurir,
            $kurirDipilih,
            $areaId,
            $namaPenerima,
            $penggunaId
        ) {
            $this->inventoriService->kunciDanKurangiStok($itemsDiproses);

            $nomorPesanan = $this->generateNomorPesanan();

            $voucherDipakai = null;
            $diskonVoucher = 0;
            if (!empty($dataInput['kode_voucher'])) {
                $voucher = Voucher::where('kode', strtoupper(trim((string)$dataInput['kode_voucher'])))
                    ->where('aktif', true)
                    ->lockForUpdate()
                    ->first();

                if (!$voucher) {
                    throw new Exception("Voucher tidak valid atau sudah tidak aktif.");
                }

                if ($voucher->berlaku_sampai && now()->greaterThan($voucher->berlaku_sampai)) {
                    throw new Exception("Voucher {$voucher->kode} telah kedaluwarsa.");
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

                if (isset($voucher->tipe) && in_array($voucher->tipe, ['persen', 'persentase'], true)) {
                    $diskonKalkulasi = round($subtotal * ($voucher->nilai / 100));
                    $diskonVoucher = !empty($voucher->maksimal_diskon) ? min($diskonKalkulasi, (float)$voucher->maksimal_diskon) : $diskonKalkulasi;
                } else {
                    $diskonVoucher = (float)($voucher->nilai ?? $voucher->nominal ?? 0);
                }
                $diskonVoucher = min($diskonVoucher, $subtotal);
                $voucherDipakai = $voucher;
            }

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
            $rawAsuransi = (float)($dataInput['biaya_asuransi'] ?? 2500);
            if ($asuransi && $rawAsuransi < 0) {
                throw new Exception("Biaya asuransi pengiriman tidak boleh bernilai negatif.");
            }
            $biayaAsuransi = $asuransi ? max(0, $rawAsuransi) : 0;

            $total = (int) round(max(0, ($subtotal + $biayaOngkir + $biayaAsuransi) - $totalDiskon));
            $isDropship = !empty($dataInput['is_dropship']);

            // Hitung Poin Didapat Berdasarkan Tier Loyalitas Pelanggan
            $kelipatanBelanja = config('loyalitas.kelipatan_belanja', 10000);
            $poinPerKelipatan = config('loyalitas.poin_per_kelipatan', 10);
            $pengaliTier = 1.0;

            if ($penggunaId && $loyalitas) {
                $activeTier = TierLoyalitas::where('syarat_belanja', '<=', (float) $loyalitas->total_belanja)
                    ->orderBy('syarat_belanja', 'desc')
                    ->first();
                if ($activeTier && $activeTier->pengali_poin) {
                    $pengaliTier = (float) $activeTier->pengali_poin;
                }
            }

            $poinDidapat = (int) round(floor($total / $kelipatanBelanja) * $poinPerKelipatan * $pengaliTier);

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
                'poin_didapat' => $poinDidapat,
                'is_dropship' => $isDropship,
                'dropship_pengirim' => $isDropship ? ($dataInput['dropship_pengirim'] ?? null) : null,
                'dropship_telepon' => $isDropship ? ($dataInput['dropship_telepon'] ?? null) : null,
            ]);

            // Catat Buku Besar Penggunaan Poin Loyalitas
            if ($penggunaId && $poinDigunakan > 0 && $loyalitas) {
                RiwayatPoin::create([
                    'pengguna_id' => $penggunaId,
                    'pesanan_id' => $pesanan->id,
                    'tipe' => RiwayatPoin::TIPE_DIGUNAKAN,
                    'jumlah' => -$poinDigunakan,
                    'saldo_akhir' => $loyalitas->poin,
                    'keterangan' => "Penggunaan poin pada pesanan {$pesanan->nomor_pesanan}",
                ]);
            }

            if ($voucherDipakai && $penggunaId) {
                try {
                    VoucherTerpakai::create([
                        'voucher_id' => $voucherDipakai->id,
                        'pengguna_id' => $penggunaId,
                        'pesanan_id' => $pesanan->id,
                        'dipakai_pada' => now(),
                    ]);
                } catch (\Illuminate\Database\UniqueConstraintViolationException $e) {
                    throw new Exception("Voucher {$voucherDipakai->kode} sedang atau sudah pernah digunakan oleh akun Anda.");
                }
            }

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

            foreach ($itemsDiproses as $item) {
                ItemPesanan::create([
                    'pesanan_id' => $pesanan->id,
                    'produk_id' => $item['produk_id'],
                    'produk_varian_id' => $item['varian_id'],
                    'nama_produk' => $item['nama_produk'],
                    'sku' => $item['sku'],
                    'harga' => $item['harga'],
                    'jumlah' => $item['jumlah'],
                    'ukuran' => $item['ukuran'],
                    'warna' => $item['warna'],
                    'gambar' => $item['gambar'],
                ]);
            }

            PesananPengiriman::create([
                'pesanan_id' => $pesanan->id,
                'kurir' => strtolower($kurirDipilih),
                'layanan' => strtolower((string)$layananKurir),
                'tracking_status' => 'pending',
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
                    'destination_area_id' => $areaId,
                    'total_berat_gram' => $totalBeratGram,
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

        // 5. Inisialisasi Midtrans di Luar Transaksi Database
        try {
            $pembeli = [
                'nama' => $namaPenerima,
                'email' => $dataInput['email'] ?? '',
                'telepon' => $dataInput['telepon'] ?? '',
            ];

            $metode = strtolower(str_replace(['va_', 'va-'], '', (string) ($dataInput['metode_pembayaran'] ?? 'qris')));
            $gatewayOrderId = str_replace('/', '-', $statePesanan['nomor_pesanan']);

            $pesananData = [
                'nomor_pesanan' => $gatewayOrderId,
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

            $resolvedVa = $chargeRes['nomor_va']
                ?? $chargeRes['bill_key']
                ?? ($chargeRes['raw']['va_numbers'][0]['va_number'] ?? null)
                ?? ($chargeRes['raw']['permata_va_number'] ?? null);

            PesananPembayaran::create([
                'pesanan_id' => $pesanan->id,
                'metode_bayar' => $chargeRes['metode_bayar'] ?? strtoupper($metode),
                'midtrans_id' => $chargeRes['transaction_id'] ?? null,
                'midtrans_status' => $chargeRes['status_transaksi'] ?? 'pending',
                'nomor_va' => $resolvedVa,
                'kode_biller' => $chargeRes['kode_biller'] ?? ($chargeRes['raw']['biller_code'] ?? null),
                'qr_string' => $chargeRes['qr_string'] ?? ($chargeRes['raw']['qr_string'] ?? null),
                'qr_code_url' => $chargeRes['qr_code_url'] ?? null,
                'waktu_kedaluwarsa' => $chargeRes['waktu_kadaluarsa'] ?? (str_contains($metode, 'qris') ? now()->addMinutes(15) : now()->addHours(24)),
                'instruksi_bayar' => $chargeRes['instruksi_bayar'] ?? [],
            ]);

            Log::info("Pesanan Domain Action Success: Nomor {$statePesanan['nomor_pesanan']}, Total: {$statePesanan['total']}");

            if (!empty($idempotencyKey)) {
                Cache::put("idempotency_order:{$idempotencyKey}", $pesanan->id, now()->addHours(1));
            }

            return $pesanan;
        } catch (Exception $e) {
            $this->kompensasiKegagalanPembayaran($pesanan, $statePesanan, $penggunaId);
            Log::error("Midtrans Charge Error untuk Pesanan {$pesanan->nomor_pesanan}: " . $e->getMessage());
            throw new Exception("Gagal menghubungi gateway pembayaran: " . $e->getMessage());
        }
    }

    protected function validasiDanHitungKeranjang(array $keranjang): array
    {
        $varianIds = [];
        $produkIds = [];

        foreach ($keranjang as $item) {
            $vid = $item['varian_id'] ?? $item['produk_varian_id'] ?? null;
            $pid = $item['produk_id'] ?? $item['bundle_id'] ?? null;
            $rawId = $item['id'] ?? null;

            if (!$pid && is_string($rawId) && preg_match('/(?:bundle|buynow)-(\d+)/', $rawId, $m)) {
                $pid = (int)$m[1];
            }

            if ($vid && is_numeric($vid)) {
                $varianIds[] = (int)$vid;
            } elseif ($rawId && is_numeric($rawId)) {
                $varianIds[] = (int)$rawId;
            }

            if ($pid && is_numeric($pid)) {
                $produkIds[] = (int)$pid;
            } elseif ($rawId && is_numeric($rawId)) {
                $produkIds[] = (int)$rawId;
            }
        }

        $varianIds = array_values(array_unique(array_filter($varianIds, fn($v) => $v !== 0 && $v !== null)));
        $produkIds = array_values(array_unique(array_filter($produkIds, fn($p) => $p !== 0 && $p !== null)));

        $varians = !empty($varianIds)
            ? ProdukVarian::with('produk')->whereIn('id', $varianIds)->get()->keyBy('id')
            : collect();

        $produks = !empty($produkIds)
            ? Produk::whereIn('id', $produkIds)->get()->keyBy('id')
            : collect();

        $subtotal = 0;
        $totalBerat = 0;
        $items = [];

        foreach ($keranjang as $index => $item) {
            $vid = (int)($item['varian_id'] ?? $item['produk_varian_id'] ?? 0);
            $pid = (int)($item['produk_id'] ?? $item['bundle_id'] ?? 0);
            $rawId = $item['id'] ?? null;

            if ($pid === 0 && is_string($rawId) && preg_match('/(?:bundle|buynow)-(\d+)/', $rawId, $m)) {
                $pid = (int)$m[1];
            }

            $numericRawId = is_numeric($rawId) ? (int)$rawId : 0;
            $rawJumlah = (int)($item['jumlah'] ?? $item['quantity'] ?? 1);
            if ($rawJumlah <= 0) {
                throw new Exception("Jumlah item belanja harus lebih dari 0.");
            }
            $jumlah = $rawJumlah;

            // Resolusi Model Varian
            $varian = null;
            if ($vid !== 0 && $varians->has($vid)) {
                $varian = $varians->get($vid);
            } elseif ($vid === 0 && $numericRawId !== 0 && $varians->has($numericRawId)) {
                $varian = $varians->get($numericRawId);
            }

            // Resolusi Model Produk
            $produk = null;
            if ($pid !== 0 && $produks->has($pid)) {
                $produk = $produks->get($pid);
            } elseif ($numericRawId !== 0 && $produks->has($numericRawId)) {
                $produk = $produks->get($numericRawId);
            }

            if (!$produk && $varian?->produk) {
                $produk = $varian->produk;
            }

            // Fallback: Jika varian belum ter-resolve tapi produk berjenis bundle atau punya varian
            if ($produk && !$varian) {
                $varian = $produk->varian()->first();
            }

            if (!$produk && !$varian) {
                Log::error("Validasi Keranjang Gagal pada item index {$index}", [
                    'payload_item' => $item,
                    'resolved_vid' => $vid,
                    'resolved_pid' => $pid,
                    'raw_id'       => $rawId,
                ]);
                $displayIdx = is_numeric($index) ? ((int)$index + 1) : $index;
                throw new Exception("Produk atau varian tidak ditemukan di database (Item #{$displayIdx}).");
            }

            // Validasi Integritas Pasangan Produk & Varian
            if ($produk && $varian && (int)$varian->produk_id !== (int)$produk->id) {
                throw new \InvalidArgumentException("Varian '{$varian->nama_varian}' tidak sesuai dengan produk '{$produk->nama}'.");
            }

            // Validasi Status Aktif
            if ($varian && !$varian->aktif) {
                throw new Exception("Varian '{$varian->nama_varian}' sedang tidak aktif.");
            }
            if ($produk && !$produk->aktif) {
                throw new Exception("Produk '{$produk->nama}' sedang tidak aktif.");
            }

            $hargaDb = (float)($varian?->harga ?? 0);
            if ($hargaDb <= 0 && $produk) {
                $hargaDasar = (float)($produk->harga_diskon ?: ($produk->harga_dasar ?: ($produk->harga ?? 0)));
                $hargaTambahan = (float)($varian?->harga_tambahan ?? 0);
                $hargaDb = $hargaDasar + $hargaTambahan;
            }

            if ($hargaDb <= 0) {
                throw new Exception("Harga produk '" . ($produk?->nama ?? 'Unknown') . "' tidak valid atau 0.");
            }

            // Resolusi Berat (gram)
            $beratPerItem = (int)($varian?->berat ?? $produk?->berat ?? 250);
            if ($beratPerItem <= 0) {
                $beratPerItem = 250;
            }

            $subtotal += ($hargaDb * $jumlah);
            $totalBerat += ($beratPerItem * $jumlah);

            $gambar = $varian?->gambar_varian ?? $produk?->gambar_utama ?? '/assets/gambar/drinke-tumblr.webp';
            $namaVarian = $varian?->nama_varian ?? $varian?->nama ?? '';

            $items[] = [
                'produk_id' => $produk?->id ?? $varian?->produk_id,
                'varian_id' => $varian?->id,
                'nama_produk' => ($varian && $namaVarian !== '') ? ($produk->nama . ' - ' . $namaVarian) : ($produk->nama ?? 'Produk'),
                'sku' => $varian?->sku ?? $produk?->sku ?? ('CRSL-' . ($produk?->id ?? 'ITEM')),
                'harga' => $hargaDb,
                'berat' => $beratPerItem,
                'jumlah' => $jumlah,
                'ukuran' => $item['ukuran'] ?? $varian?->ukuran ?? null,
                'warna' => $item['warna'] ?? $varian?->warna ?? null,
                'gambar' => $gambar,
            ];
        }

        return [
            'subtotal' => $subtotal,
            'total_berat' => max(100, $totalBerat),
            'items' => $items,
        ];
    }

    /**
     * Resolusi ID Area Tujuan Biteship (Server-Authoritative).
     */
    protected function resolveDestinationAreaId(array $dataInput): string
    {
        $candidate = trim((string)(
            $dataInput['biteship_area_id']
            ?? $dataInput['destination_area_id']
            ?? $dataInput['area_id']
            ?? $dataInput['destination_city_id']
            ?? $dataInput['city_id']
            ?? ''
        ));

        // Jika candidate format Biteship Area ID (panjang > 10 karakter, contoh IDNP... )
        if (strlen($candidate) > 10) {
            return $candidate;
        }

        // Jika hanya dikirim nama kecamatan atau kota, cari via BiteshipService (Master Data Wilayah / Maps)
        $namaPencarian = trim((string)($dataInput['kecamatan'] ?? $dataInput['kota'] ?? ''));
        if (!empty($namaPencarian)) {
            $hasilArea = $this->biteshipService->cariArea($namaPencarian);
            if (!empty($hasilArea[0]['id'])) {
                return (string) $hasilArea[0]['id'];
            }
        }

        // Default Area ID fallback: Depok, Sleman, D.I. Yogyakarta (gudang asal CRSL)
        return (string) config('services.biteship.origin_area_id', 'IDNP5IDNC412IDND5043IDZ55281');
    }

    protected function kompensasiKegagalanPembayaran(Pesanan $pesanan, array $state, ?int $penggunaId): void
    {
        DB::transaction(function () use ($pesanan, $state, $penggunaId) {
            $pesanan->update(['status' => 'dibatalkan']);

            $this->inventoriService->kembalikanStok($state['items']);

            if (!empty($state['voucher_id'])) {
                Voucher::where('id', $state['voucher_id'])->increment('kuota', 1);
                if ($penggunaId) {
                    VoucherTerpakai::where('voucher_id', $state['voucher_id'])
                        ->where('pesanan_id', $pesanan->id)
                        ->delete();
                }
            }

            if (!empty($state['poin_digunakan']) && $penggunaId) {
                $loy = PenggunaLoyalitas::lockForUpdate()->firstOrCreate(
                    ['pengguna_id' => $penggunaId],
                    ['poin' => 0, 'total_belanja' => 0]
                );
                $loy->increment('poin', $state['poin_digunakan']);

                RiwayatPoin::create([
                    'pengguna_id' => $penggunaId,
                    'pesanan_id' => $pesanan->id,
                    'tipe' => RiwayatPoin::TIPE_DIKEMBALIKAN,
                    'jumlah' => $state['poin_digunakan'],
                    'saldo_akhir' => $loy->poin,
                    'keterangan' => "Pengembalian poin kegagalan gateway pesanan {$pesanan->nomor_pesanan}",
                ]);

                Cache::forget("pengguna:akun:{$penggunaId}");
                Cache::forget("pengguna:profil:{$penggunaId}");
            }
        });
    }

    protected function generateNomorPesanan(): string
    {
        $today = date('Y-m-d');
        $dateStr = date('Ymd');

        DB::table('nomor_pesanan_harian')->insertOrIgnore([
            'tanggal' => $today,
            'urutan' => 0,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $sequence = DB::table('nomor_pesanan_harian')
            ->where('tanggal', $today)
            ->lockForUpdate()
            ->first();

        $nextVal = ($sequence->urutan ?? 0) + 1;

        DB::table('nomor_pesanan_harian')
            ->where('tanggal', $today)
            ->update([
                'urutan' => $nextVal,
                'updated_at' => now(),
            ]);

        $paddedCounter = str_pad((string)$nextVal, 4, '0', STR_PAD_LEFT);
        $entropy = app()->isProduction() ? '' : '-' . strtoupper(Str::random(3));

        return "INV/CRSL/{$dateStr}/{$paddedCounter}{$entropy}";
    }
}
