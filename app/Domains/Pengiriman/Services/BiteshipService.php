<?php

declare(strict_types=1);

namespace App\Domains\Pengiriman\Services;

use App\Domains\Pengiriman\DTOs\BiteshipArea;
use App\Domains\Pengiriman\DTOs\BiteshipRateOption;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use RuntimeException;

class BiteshipService
{
    protected string $apiKey;
    protected string $originAreaId;
    protected string $baseUrl;
    protected int $timeoutSeconds;
    protected bool $testingZeroBalance;
    protected bool $useRealMaps;
    protected bool $useRealRates;
    protected bool $useRealOrders;
    protected bool $useRealTracking;
    protected bool $usePublicTracking;

    public function __construct()
    {
        $this->apiKey = (string) config('services.biteship.api_key', '');
        $this->originAreaId = (string) config('services.biteship.origin_area_id', 'IDNP5IDNC412IDND5043IDZ55281');
        $this->baseUrl = rtrim((string) config('services.biteship.base_url', 'https://api.biteship.com'), '/');
        $this->timeoutSeconds = 10;
        $this->testingZeroBalance = (bool) config('services.biteship.testing_zero_balance', true);
        $this->useRealMaps = (bool) config('services.biteship.use_real_maps', false);
        $this->useRealRates = (bool) config('services.biteship.use_real_rates', false);
        $this->useRealOrders = (bool) config('services.biteship.use_real_orders', true);
        $this->useRealTracking = (bool) config('services.biteship.use_real_tracking', true);
        $this->usePublicTracking = (bool) config('services.biteship.use_public_tracking', false);
    }

    /**
     * Inisialisasi HTTP Client dengan header otentikasi resmi Biteship.
     */
    protected function newRequest(int $timeout = 0): \Illuminate\Http\Client\PendingRequest
    {
        $req = Http::withHeaders([
            'Authorization' => $this->apiKey,
            'Content-Type'  => 'application/json',
        ])->timeout($timeout > 0 ? $timeout : $this->timeoutSeconds);

        if (app()->isLocal()) {
            $req = $req->withoutVerifying();
        }

        return $req;
    }

    /**
     * Cari lokasi/wilayah berdasarkan kata kunci autocomplete.
     * Dalam mode Zero Balance, pencarian dilakukan secara lokal menggunakan database master wilayah_indonesia.
     *
     * @param string $kataKunci
     * @return array<int, array<string, mixed>>
     */
    public function cariArea(string $kataKunci): array
    {
        $kataKunci = trim($kataKunci);
        if (mb_strlen($kataKunci) < 2) {
            return [];
        }

        $cacheKey = 'biteship_area_' . hash('xxh128', mb_strtolower($kataKunci));

        // 1. Ambil dari cache jika ada
        if (Cache::has($cacheKey)) {
            return (array) Cache::get($cacheKey, []);
        }

        // 2. Jika Zero Balance atau Real Maps dinonaktifkan: gunakan master data lokal PostgreSQL
        if ($this->testingZeroBalance || !$this->useRealMaps || empty($this->apiKey)) {
            $hasilLokal = $this->cariAreaLokal($kataKunci);
            if (!empty($hasilLokal)) {
                Cache::put($cacheKey, $hasilLokal, now()->addHours(24));
                return $hasilLokal;
            }
            return $this->filterFallbackAreas($kataKunci);
        }

        try {
            $response = $this->newRequest()
                ->get("{$this->baseUrl}/v1/maps/areas", [
                    'countries' => 'ID',
                    'input'     => $kataKunci,
                    'type'      => 'single',
                ]);

            if ($response->successful()) {
                $areas = $response->json('areas', []);

                if (!is_array($areas)) {
                    return [];
                }

                $formatted = array_map(function (array $area): array {
                    return BiteshipArea::fromArray($area)->toArray();
                }, $areas);

                // HANYA simpan ke cache jika API menghasilkan respons valid
                if (!empty($formatted)) {
                    Cache::put($cacheKey, $formatted, now()->addHours(24));
                }

                return $formatted;
            }

            Log::warning("[Biteship Maps Error] Status {$response->status()}: {$response->body()}");
        } catch (\Throwable $e) {
            Log::error("[Biteship Maps Exception] {$e->getMessage()}", [
                'keyword' => $kataKunci,
                'trace'   => $e->getTraceAsString(),
            ]);
        }

        return $this->cariAreaLokal($kataKunci) ?: $this->filterFallbackAreas($kataKunci);
    }

    /**
     * Pencarian wilayah lokal dari tabel PostgreSQL master wilayah_indonesia.
     *
     * @param string $kataKunci
     * @return array<int, array<string, mixed>>
     */
    public function cariAreaLokal(string $kataKunci): array
    {
        try {
            $rows = \App\Models\WilayahIndonesia::query()
                ->where(function ($q) use ($kataKunci) {
                    $q->where('kota', 'ilike', "%{$kataKunci}%")
                      ->orWhere('kecamatan', 'ilike', "%{$kataKunci}%")
                      ->orWhere('kelurahan', 'ilike', "%{$kataKunci}%")
                      ->orWhere('provinsi', 'ilike', "%{$kataKunci}%")
                      ->orWhere('kode_pos', 'like', "%{$kataKunci}%");
                })
                ->limit(20)
                ->get();

            if ($rows->isEmpty()) {
                return [];
            }

            return $rows->map(function ($row) {
                $nama = "{$row->kecamatan}, {$row->kota}, {$row->provinsi} ({$row->kode_pos})";
                return [
                    'id'                                   => $row->biteship_area_id ?: "AREA-LOCAL-{$row->id}",
                    'nama'                                 => $nama,
                    'name'                                 => $nama,
                    'kota'                                 => $row->kota,
                    'city'                                 => $row->kota,
                    'kecamatan'                            => $row->kecamatan,
                    'district'                             => $row->kecamatan,
                    'kelurahan'                            => $row->kelurahan,
                    'administrative_division_level_3_name' => $row->kecamatan,
                    'administrative_division_level_2_name' => $row->kota,
                    'administrative_division_level_1_name' => $row->provinsi,
                    'provinsi'                             => $row->provinsi,
                    'province'                             => $row->provinsi,
                    'kode_pos'                             => (string) $row->kode_pos,
                    'postal_code'                          => (string) $row->kode_pos,
                    'sumber'                               => 'Master Data Wilayah',
                ];
            })->toArray();
        } catch (\Throwable $e) {
            Log::warning("[Biteship cariAreaLokal Exception] {$e->getMessage()}");
            return [];
        }
    }

    /**
     * Kalkulasi tarif ongkir multi-kurir berdasarkan bobot dan alamat tujuan.
     *
     * @param string $destinationAreaId
     * @param array<int, array<string, mixed>> $items
     * @param string $couriers
     * @return array<int, array<string, mixed>>
     */
    public function kalkulasiOngkir(
        string $destinationAreaId,
        array $items,
        string $couriers = 'jne,jnt,sicepat,anteraja'
    ): array {
        $destinationAreaId = trim($destinationAreaId);
        if (empty($destinationAreaId) || empty($items)) {
            return [];
        }

        $formattedItems = array_map(function (array $item): array {
            return [
                'name'        => (string) ($item['nama'] ?? $item['name'] ?? 'Merchandise CRSL'),
                'description' => (string) ($item['deskripsi'] ?? 'Apparel & Accessories'),
                'value'       => max(1000, (int) ($item['harga'] ?? $item['value'] ?? 10000)),
                'quantity'    => max(1, (int) ($item['jumlah'] ?? $item['quantity'] ?? 1)),
                'weight'      => max(100, (int) ($item['berat_gram'] ?? $item['weight'] ?? 250)),
            ];
        }, $items);

        $totalWeight = array_sum(array_map(fn($item) => ($item['weight'] ?? 250) * ($item['quantity'] ?? 1), $formattedItems));

        // Jika testing zero balance atau real rates dinonaktifkan: gunakan tarif mock lokal terkalibrasi
        if ($this->testingZeroBalance || !$this->useRealRates || empty($this->apiKey)) {
            return $this->getMockCouriers($totalWeight);
        }

        try {
            $response = $this->newRequest()
                ->post("{$this->baseUrl}/v1/rates/couriers", [
                    'origin_area_id'      => $this->originAreaId,
                    'destination_area_id' => $destinationAreaId,
                    'couriers'            => $couriers,
                    'items'               => $formattedItems,
                ]);

            if ($response->successful()) {
                $pricing = $response->json('pricing', []);

                if (!is_array($pricing) || empty($pricing)) {
                    return $isMock ? $this->getMockCouriers($totalWeight) : [];
                }

                $rates = array_map(function (array $rate): array {
                    return BiteshipRateOption::fromArray($rate)->toArray();
                }, $pricing);

                // Sortir otomatis harga termurah di posisi paling atas
                usort($rates, fn(array $a, array $b): int => ($a['harga'] ?? 0) <=> ($b['harga'] ?? 0));

                return $rates;
            }

            if ($isMock) {
                Log::info("[Biteship Rates] Menggunakan fallback tarif mock kurir lokal (Status {$response->status()})");
                return $this->getMockCouriers($totalWeight);
            }

            Log::warning("[Biteship Rates Failed] Status {$response->status()}: {$response->body()}");
        } catch (\Throwable $e) {
            Log::error("[Biteship Rates Exception] {$e->getMessage()}");
            if ($isMock) {
                return $this->getMockCouriers($totalWeight);
            }
        }

        return $isMock ? $this->getMockCouriers($totalWeight) : [];
    }

    /**
     * Tarif mock kurir standar khusus environment development / testing lokal.
     *
     * @param int $totalWeightGram
     * @return array<int, array<string, mixed>>
     */
    protected function getMockCouriers(int $totalWeightGram): array
    {
        $weightKg = max(1, (int) ceil($totalWeightGram / 1000));
        return [
            [
                'kurir'         => 'jne',
                'kurir_kode'    => 'jne',
                'kurir_nama'    => 'JNE',
                'layanan_kode'  => 'reg',
                'layanan_nama'  => 'Reguler',
                'kurir_layanan' => 'Reguler',
                'nama'          => 'JNE Reguler',
                'layanan'       => 'Reguler',
                'harga'         => 18000 * $weightKg,
                'biaya'         => 18000 * $weightKg,
                'estimasi'      => '2 - 3 hari',
                'estimasi_hari' => '2 - 3 hari',
                'etd'           => '2 - 3 hari',
                'tipe'          => 'standard',
                'ikon'          => '/assets/ikon/kurir-jne.svg',
                'logo_url'      => '/assets/ikon/kurir-jne.svg',
                'is_mock'       => true,
                'sumber'        => 'Sandbox Simulasi',
            ],
            [
                'kurir'         => 'sicepat',
                'kurir_kode'    => 'sicepat',
                'kurir_nama'    => 'SiCepat',
                'layanan_kode'  => 'siuntung',
                'layanan_nama'  => 'SiUntung',
                'kurir_layanan' => 'SiUntung',
                'nama'          => 'SiCepat SiUntung',
                'layanan'       => 'SiUntung',
                'harga'         => 17000 * $weightKg,
                'biaya'         => 17000 * $weightKg,
                'estimasi'      => '2 - 3 hari',
                'estimasi_hari' => '2 - 3 hari',
                'etd'           => '2 - 3 hari',
                'tipe'          => 'standard',
                'ikon'          => '/assets/ikon/kurir-sicepat.svg',
                'logo_url'      => '/assets/ikon/kurir-sicepat.svg',
                'is_mock'       => true,
                'sumber'        => 'Sandbox Simulasi',
            ],
            [
                'kurir'         => 'jnt',
                'kurir_kode'    => 'jnt',
                'kurir_nama'    => 'J&T Express',
                'layanan_kode'  => 'ez',
                'layanan_nama'  => 'EZ',
                'kurir_layanan' => 'EZ',
                'nama'          => 'J&T EZ',
                'layanan'       => 'EZ',
                'harga'         => 19000 * $weightKg,
                'biaya'         => 19000 * $weightKg,
                'estimasi'      => '1 - 2 hari',
                'estimasi_hari' => '1 - 2 hari',
                'etd'           => '1 - 2 hari',
                'tipe'          => 'express',
                'ikon'          => '/assets/ikon/kurir-jnt.svg',
                'logo_url'      => '/assets/ikon/kurir-jnt.svg',
                'is_mock'       => true,
                'sumber'        => 'Sandbox Simulasi',
            ],
            [
                'kurir'         => 'anteraja',
                'kurir_kode'    => 'anteraja',
                'kurir_nama'    => 'Anteraja',
                'layanan_kode'  => 'reg',
                'layanan_nama'  => 'Reguler',
                'kurir_layanan' => 'Reguler',
                'nama'          => 'Anteraja Reguler',
                'layanan'       => 'Reguler',
                'harga'         => 16000 * $weightKg,
                'biaya'         => 16000 * $weightKg,
                'estimasi'      => '2 - 3 hari',
                'estimasi_hari' => '2 - 3 hari',
                'etd'           => '2 - 3 hari',
                'tipe'          => 'standard',
                'ikon'          => '/assets/ikon/kurir-anteraja.svg',
                'logo_url'      => '/assets/ikon/kurir-anteraja.svg',
                'is_mock'       => true,
                'sumber'        => 'Sandbox Simulasi',
            ],
        ];
    }

    /**
     * Buat order pickup pengiriman resmi pada Biteship API.
     *
     * @param array<string, mixed> $dataPesanan
     * @return array<string, mixed>
     */
    public function buatOrderPengiriman(array $dataPesanan): array
    {
        if (empty($this->apiKey) || !$this->useRealOrders) {
            $simulasiResi = strtoupper($dataPesanan['kurir'] ?? 'JNE') . '-MOCK-' . date('Ymd') . '-' . strtoupper(Str::random(6));
            $mockTrackingId = 'mock_track_' . Str::uuid();
            Log::channel('single')->info('[Biteship Pickup Simulation]', [
                'resi' => $simulasiResi,
                'tracking_id' => $mockTrackingId,
                'data' => $dataPesanan,
            ]);

            return [
                'sukses'               => true,
                'biteship_order_id'    => 'mock_order_' . Str::uuid(),
                'biteship_tracking_id' => $mockTrackingId,
                'biteship_waybill_id'  => $simulasiResi,
                'waybill_id'           => $simulasiResi,
                'status'               => 'allocated',
                'tracking_url'         => 'https://track.biteship.com/' . $simulasiResi,
                'is_simulasi'          => true,
            ];
        }

        $isDropship = !empty($dataPesanan['is_dropship']);
        $shipperName = $isDropship ? ($dataPesanan['dropship_pengirim'] ?? 'CRSL Partner') : 'CRSL Official Store';
        $shipperPhone = $isDropship ? ($dataPesanan['dropship_telepon'] ?? '081234567890') : '081234567890';
        $originAddress = (string) config('services.biteship.origin_address', 'Jl. Affandi No. 20, Condongcatur, Sleman, D.I. Yogyakarta');
        $originPostalCode = (int) config('services.biteship.origin_postal_code', 55281);

        $kurirKode = strtolower((string) ($dataPesanan['kurir'] ?? 'jne'));
        $layananKode = strtolower((string) ($dataPesanan['layanan'] ?? 'reg'));

        // Payload yang telah disesuaikan penuh dengan Biteship API v1
        $payload = [
            // 1. Data Asal (Origin / Pickup)
            'origin_contact_name'  => (string) $shipperName,
            'origin_contact_phone' => (string) $shipperPhone,
            'origin_contact_email' => 'shipping@crslstore.com',
            'origin_address'       => $originAddress,
            'origin_postal_code'   => $originPostalCode,
            'origin_area_id'       => $this->originAreaId,

            'origin' => [
                'contact_name'  => (string) $shipperName,
                'contact_phone' => (string) $shipperPhone,
                'contact_email' => 'shipping@crslstore.com',
                'address'       => $originAddress,
                'postal_code'   => $originPostalCode,
                'area_id'       => $this->originAreaId,
            ],

            // 2. Data Tujuan (Destination)
            'destination_contact_name'  => (string) ($dataPesanan['nama_penerima'] ?? 'Pelanggan'),
            'destination_contact_phone' => (string) ($dataPesanan['telepon'] ?? '081234567890'),
            'destination_contact_email' => (string) ($dataPesanan['email'] ?? 'customer@crslstore.com'),
            'destination_address'       => (string) ($dataPesanan['alamat_lengkap'] ?? ''),
            'destination_postal_code'   => (int) ($dataPesanan['kode_pos'] ?? 0),
            'destination_area_id'       => (string) ($dataPesanan['area_id'] ?? ''),

            'destination' => [
                'contact_name'  => (string) ($dataPesanan['nama_penerima'] ?? 'Pelanggan'),
                'contact_phone' => (string) ($dataPesanan['telepon'] ?? '081234567890'),
                'contact_email' => (string) ($dataPesanan['email'] ?? 'customer@crslstore.com'),
                'address'       => (string) ($dataPesanan['alamat_lengkap'] ?? ''),
                'postal_code'   => (int) ($dataPesanan['kode_pos'] ?? 0),
                'area_id'       => (string) ($dataPesanan['area_id'] ?? ''),
            ],

            // 3. Konfigurasi Kurir & Waktu
            'courier_company' => $kurirKode,
            'courier_type'    => $layananKode,
            'courier' => [
                'company' => $kurirKode,
                'type'    => $layananKode,
            ],
            'delivery_type'   => 'now',
            'items'           => (array) ($dataPesanan['items'] ?? []),
        ];

        try {
            $response = $this->newRequest(15)->post("{$this->baseUrl}/v1/orders", $payload);

            if ($response->successful()) {
                $orderId = (string) $response->json('id');
                $waybillId = (string) ($response->json('courier.waybill_id') ?? '');
                $trackingId = (string) ($response->json('courier.tracking_id') ?? $orderId);
                $status = (string) $response->json('status', 'allocated');
                $trackingUrl = $response->json('courier.link') ?? $response->json('courier.tracking_url') ?? (!empty($waybillId) ? "https://track.biteship.com/{$waybillId}" : null);

                return [
                    'sukses'               => true,
                    'biteship_order_id'    => $orderId,
                    'biteship_tracking_id' => $trackingId,
                    'biteship_waybill_id'  => $waybillId ?: null,
                    'waybill_id'           => $waybillId ?: null,
                    'status'               => $status,
                    'tracking_url'         => $trackingUrl,
                    'raw'                  => $response->json(),
                ];
            }

            Log::warning("[Biteship Create Order Error] {$response->body()}", [
                'payload' => $payload,
            ]);

            if (app()->isLocal()) {
                $simulasiResi = strtoupper($kurirKode) . '-DEV-' . date('Ymd') . '-' . strtoupper(Str::random(6));
                $devTrackingId = 'dev_track_' . Str::uuid();
                Log::info("[Biteship Order Dev Fallback] Resi: {$simulasiResi}");
                return [
                    'sukses'               => true,
                    'biteship_order_id'    => 'dev_order_' . Str::uuid(),
                    'biteship_tracking_id' => $devTrackingId,
                    'biteship_waybill_id'  => $simulasiResi,
                    'waybill_id'           => $simulasiResi,
                    'status'               => 'allocated',
                    'tracking_url'         => 'https://track.biteship.com/' . $simulasiResi,
                    'is_simulasi'          => true,
                ];
            }

            return [
                'sukses' => false,
                'pesan'  => 'Gagal membuat order ke kurir: ' . ($response->json('error') ?? 'Terjadi kesalahan sistem ekspedisi.'),
            ];
        } catch (\Throwable $e) {
            Log::error("[Biteship Dispatch Crash] {$e->getMessage()}");

            if (app()->isLocal()) {
                $simulasiResi = strtoupper($kurirKode) . '-DEV-' . date('Ymd') . '-' . strtoupper(Str::random(6));
                $devTrackingId = 'dev_track_' . Str::uuid();
                Log::info("[Biteship Order Dev Fallback on Exception] Resi: {$simulasiResi}");
                return [
                    'sukses'               => true,
                    'biteship_order_id'    => 'dev_order_' . Str::uuid(),
                    'biteship_tracking_id' => $devTrackingId,
                    'biteship_waybill_id'  => $simulasiResi,
                    'waybill_id'           => $simulasiResi,
                    'status'               => 'allocated',
                    'tracking_url'         => 'https://track.biteship.com/' . $simulasiResi,
                    'is_simulasi'          => true,
                ];
            }

            return [
                'sukses' => false,
                'pesan'  => 'Koneksi ke server ekspedisi terputus.',
            ];
        }
    }

    /**
     * Filter fallback area lokal jika koneksi ke Biteship Maps terputus.
     * Strict filter: Hanya mengembalikan data yang benar-benar cocok.
     *
     * @param string $kataKunci
     * @return array<int, array<string, mixed>>
     */
    protected function filterFallbackAreas(string $kataKunci): array
    {
        $sample = [
            [
                'id'        => 'IDNP5IDNC412IDND5043IDZ55281',
                'nama'      => 'Condongcatur, Depok, Sleman, D.I. Yogyakarta (55281)',
                'kota'      => 'Sleman',
                'kecamatan' => 'Depok',
                'provinsi'  => 'D.I. Yogyakarta',
                'kode_pos'  => '55281',
            ],
            [
                'id'        => 'IDNP6IDNC147IDND830IDZ10560',
                'nama'      => 'Johar Baru, Jakarta Pusat, DKI Jakarta (10560)',
                'kota'      => 'Jakarta Pusat',
                'kecamatan' => 'Johar Baru',
                'provinsi'  => 'DKI Jakarta',
                'kode_pos'  => '10560',
            ],
            [
                'id'        => 'IDnp317401',
                'nama'      => 'Kebayoran Baru, Jakarta Selatan, DKI Jakarta (12110)',
                'kota'      => 'Jakarta Selatan',
                'kecamatan' => 'Kebayoran Baru',
                'provinsi'  => 'DKI Jakarta',
                'kode_pos'  => '12110',
            ],
            [
                'id'        => 'IDnp327301',
                'nama'      => 'Coblong, Bandung, Jawa Barat (40132)',
                'kota'      => 'Bandung',
                'kecamatan' => 'Coblong',
                'provinsi'  => 'Jawa Barat',
                'kode_pos'  => '40132',
            ],
        ];

        return array_values(array_filter($sample, function (array $area) use ($kataKunci): bool {
            return stripos($area['nama'], $kataKunci) !== false
                || stripos($area['kecamatan'], $kataKunci) !== false
                || stripos($area['kota'], $kataKunci) !== false
                || stripos((string) $area['kode_pos'], $kataKunci) !== false;
        }));
    }

    /**
     * Lacak pengiriman paket via Biteship Tracking API.
     * Mendukung tracking_id (Sandbox Zero Balance) dan waybill + kurir.
     *
     * @param string $identifier Nomor tracking_id atau waybill_id
     * @param string $courierCode Kode kurir (jne, jnt, sicepat, anteraja)
     * @return array<string, mixed>
     */
    public function lacakPengiriman(string $identifier, string $courierCode = 'jne'): array
    {
        $identifier = trim($identifier);
        $courierCode = strtolower(trim($courierCode));

        if (empty($identifier)) {
            return [
                'sukses' => false,
                'pesan'  => 'Nomor resi atau ID pelacakan tidak valid.',
            ];
        }

        // Cache 60 detik agar tidak membebani rate limit Biteship
        $cacheKey = "biteship_track_{$courierCode}_{$identifier}";

        return Cache::remember($cacheKey, 60, function () use ($identifier, $courierCode) {
            if (empty($this->apiKey) || str_contains($identifier, 'MOCK') || str_contains($identifier, 'DEV')) {
                return $this->getMockTracking($identifier, $courierCode);
            }

            // Jika tracking real diaktifkan
            if ($this->useRealTracking) {
                try {
                    // Coba via /v1/trackings/{tracking_id} jika formatnya ID Biteship
                    $url = "{$this->baseUrl}/v1/trackings/{$identifier}";
                    $response = $this->newRequest(15)->get($url);

                    if ($response->successful()) {
                        $json = $response->json();
                        return [
                            'sukses'      => true,
                            'waybill_id'  => $json['courier']['waybill_id'] ?? $identifier,
                            'tracking_id' => $identifier,
                            'kurir'       => strtolower($json['courier']['company'] ?? $courierCode),
                            'status'      => $json['status'] ?? 'allocated',
                            'history'     => $json['history'] ?? [],
                            'link'        => $json['link'] ?? "https://track.biteship.com/{$identifier}",
                            'raw'         => $json,
                        ];
                    }

                    // Hanya panggil public tracking jika diizinkan (pada zero balance testing dilarang)
                    if ($this->usePublicTracking) {
                        $pubResponse = $this->newRequest(15)->get("{$this->baseUrl}/v1/trackings/{$identifier}/couriers/{$courierCode}");
                        if ($pubResponse->successful()) {
                            $pubJson = $pubResponse->json();
                            return [
                                'sukses'     => true,
                                'waybill_id' => $identifier,
                                'kurir'      => $courierCode,
                                'status'     => $pubJson['status'] ?? 'allocated',
                                'history'    => $pubJson['history'] ?? [],
                                'link'       => $pubJson['link'] ?? "https://track.biteship.com/{$identifier}",
                                'raw'        => $pubJson,
                            ];
                        }
                    }

                    Log::warning("[Biteship Tracking Error] Status {$response->status()}: {$response->body()}");
                } catch (\Throwable $e) {
                    Log::error("[Biteship Tracking Exception] {$e->getMessage()}");
                }
            }

            return $this->getMockTracking($identifier, $courierCode);
        });
    }

    /**
     * Riwayat tracking simulasi untuk testing dev / fallback.
     */
    protected function getMockTracking(string $waybillId, string $courierCode): array
    {
        return [
            'sukses'     => true,
            'is_mock'    => true,
            'waybill_id' => $waybillId,
            'kurir'      => strtoupper($courierCode),
            'status'     => 'on_process',
            'link'       => "https://track.biteship.com/{$waybillId}",
            'history'    => [
                [
                    'note'       => 'Paket telah diserahkan ke kurir ' . strtoupper($courierCode) . ' di Drop Point Sleman.',
                    'updated_at' => now()->subHours(6)->toIso8601String(),
                    'status'     => 'allocated',
                ],
                [
                    'note'       => 'Paket telah tiba di Sorting Hub Yogyakarta.',
                    'updated_at' => now()->subHours(4)->toIso8601String(),
                    'status'     => 'picking_up',
                ],
                [
                    'note'       => 'Paket sedang dalam perjalanan menuju kota tujuan.',
                    'updated_at' => now()->subHours(1)->toIso8601String(),
                    'status'     => 'on_process',
                ],
            ],
        ];
    }
}
