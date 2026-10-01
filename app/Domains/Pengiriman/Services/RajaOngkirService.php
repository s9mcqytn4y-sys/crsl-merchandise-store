<?php

declare(strict_types=1);

namespace App\Domains\Pengiriman\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class RajaOngkirService
{
    protected string $apiKey;
    protected string $baseUrl;
    protected string $originCityId;
    protected string $defaultCouriers;
    protected string $accountType;

    public function __construct()
    {
        $this->apiKey = (string) config('services.rajaongkir.api_key', env('RAJAONGKIR_API_KEY', ''));
        $this->baseUrl = rtrim((string) config('services.rajaongkir.base_url', env('RAJAONGKIR_BASE_URL', 'https://api.rajaongkir.com/starter')), '/');
        $this->originCityId = (string) config('services.rajaongkir.origin_city_id', env('RAJAONGKIR_ORIGIN_CITY_ID', '152')); // Default: 152 (Jakarta Pusat) atau 419 (Sleman)
        $this->defaultCouriers = (string) config('services.rajaongkir.couriers', env('RAJAONGKIR_COURIERS', 'jne,pos,tiki'));
        $this->accountType = (string) config('services.rajaongkir.account_type', env('RAJAONGKIR_ACCOUNT_TYPE', 'starter'));
    }

    /**
     * Inisialisasi HTTP Client RajaOngkir.
     */
    protected function client(int $timeout = 8): \Illuminate\Http\Client\PendingRequest
    {
        $curlOptions = [
            CURLOPT_IPRESOLVE => CURL_IPRESOLVE_V4,
        ];

        return Http::withHeaders([
            'key'    => $this->apiKey,
            'Accept' => 'application/json',
        ])
            ->timeout($timeout)
            ->withOptions([
                'verify' => app()->isProduction(),
                'curl'   => $curlOptions,
            ]);
    }

    /**
     * Hitung ongkos kirim.
     * Menerima $weightOrItems berupa integer (gram) atau array item pesanan (kompatibel langsung dengan BuatPesananAction).
     *
     * @param string $destinationCityId ID kota tujuan RajaOngkir
     * @param int|array<int, mixed> $weightOrItems Bobot dalam gram atau array item pesanan
     * @param string|null $couriers Daftar kurir (misal: "jne,pos,tiki")
     * @return array<int, array<string, mixed>>
     */
    public function kalkulasiOngkir(string $destinationCityId, int|array $weightOrItems, ?string $couriers = null): array
    {
        $destinationCityId = trim($destinationCityId);
        if (empty($destinationCityId)) {
            return [];
        }

        // Kalkulasi bobot jika yang dilewatkan adalah daftar item
        $weight = is_array($weightOrItems)
            ? $this->hitungTotalBeratDariItems($weightOrItems)
            : max(100, $weightOrItems);

        $courierList = array_filter(array_map('trim', explode(',', strtolower($couriers ?: $this->defaultCouriers))));
        $allRates = [];

        foreach ($courierList as $courier) {
            $cacheKey = "ro_cost_{$this->originCityId}_{$destinationCityId}_{$weight}_{$courier}";

            // 1. Cek cache hasil sukses sebelumnya
            $cachedRates = Cache::get($cacheKey);
            if (!empty($cachedRates)) {
                $allRates = array_merge($allRates, $cachedRates);
                continue;
            }

            // 2. Jika tidak ada API key, langsung gunakan simulasi mock (tanpa cache lama)
            if (empty($this->apiKey)) {
                $mockRates = $this->getFallbackRateSimulator($courier, $weight);
                $allRates = array_merge($allRates, $mockRates);
                continue;
            }

            // 3. Request ke API resmi
            try {
                $payload = [
                    'origin'      => $this->originCityId,
                    'destination' => $destinationCityId,
                    'weight'      => $weight,
                    'courier'     => $courier,
                ];

                // Jika Pro, sertakan originType & destinationType
                if ($this->accountType === 'pro') {
                    $payload['originType'] = 'city';
                    $payload['destinationType'] = 'city';
                }

                $response = $this->client(8)->asForm()->post("{$this->baseUrl}/cost", $payload);

                if ($response->successful()) {
                    $courierData = $response->json('rajaongkir.results.0', []);
                    $code = (string) ($courierData['code'] ?? $courier);
                    $name = (string) ($courierData['name'] ?? strtoupper($courier));
                    $costs = (array) ($courierData['costs'] ?? []);

                    $parsed = [];
                    foreach ($costs as $costItem) {
                        $costDetail = $costItem['cost'][0] ?? [];
                        $harga = (int) ($costDetail['value'] ?? 0);
                        if ($harga <= 0) {
                            continue;
                        }

                        $etdRaw = trim((string) ($costDetail['etd'] ?? '2-3'));
                        $cleanEtd = trim(str_ireplace('hari', '', $etdRaw));
                        $etd = !empty($cleanEtd) ? "{$cleanEtd} hari" : '2 - 3 hari';
                        $layananKode = strtolower((string) ($costItem['service'] ?? 'reg'));

                        $parsed[] = [
                            'kurir_kode'    => strtolower($code),
                            'kurir_nama'    => strtoupper($name),
                            'layanan_kode'  => $layananKode,
                            'layanan_nama'  => (string) ($costItem['description'] ?? strtoupper($layananKode)),
                            'kurir_layanan' => (string) ($costItem['description'] ?? strtoupper($layananKode)),
                            'nama'          => "{$name} {$costItem['service']}",
                            'layanan'       => (string) ($costItem['description'] ?? $costItem['service']),
                            'harga'         => $harga,
                            'estimasi'      => $etd,
                            'estimasi_hari' => $etd,
                            'etd'           => $etd,
                            'tipe'          => 'standard',
                            'ikon'          => "/assets/ikon/kurir-{$code}.svg",
                            'logo_url'      => "/assets/ikon/kurir-{$code}.svg",
                            'is_mock'       => false,
                            'sumber'        => 'RajaOngkir API Resmi',
                        ];
                    }

                    if (!empty($parsed)) {
                        // Hanya simpan cache saat berhasil mengambil data dari API
                        Cache::put($cacheKey, $parsed, now()->addHours(6));
                        $allRates = array_merge($allRates, $parsed);
                        continue;
                    }
                }

                Log::warning("[RajaOngkir Rate Non-200] {$courier}: Status {$response->status()} - {$response->body()}");
            } catch (\Throwable $e) {
                Log::warning("[RajaOngkir Cost Exception] {$courier}: {$e->getMessage()}");
            }

            // Fallback mock sementara saat down (tanpa disimpan ke cache berjam-jam)
            $allRates = array_merge($allRates, $this->getFallbackRateSimulator($courier, $weight));
        }

        // Urutkan tarif dari yang paling murah
        usort($allRates, fn(array $a, array $b): int => ($a['harga'] ?? 0) <=> ($b['harga'] ?? 0));

        return $allRates;
    }

    /**
     * Hitung total berat dalam gram dari item pesanan.
     */
    protected function hitungTotalBeratDariItems(array $items): int
    {
        $totalBerat = 0;
        foreach ($items as $item) {
            $qty = (int) ($item['jumlah'] ?? $item['quantity'] ?? 1);
            $beratPerItem = (int) ($item['berat'] ?? $item['weight'] ?? 250); // Default 250 gram jika tidak tercatat
            $totalBerat += ($beratPerItem * $qty);
        }

        return max(100, $totalBerat);
    }

    /**
     * Daftar kota dengan cache.
     */
    public function cariKota(string $namaKota = ''): array
    {
        $namaKota = trim($namaKota);
        $cacheKey = 'rajaongkir_cities_master';

        $cities = Cache::remember($cacheKey, now()->addDays(7), function () {
            if (empty($this->apiKey)) {
                return $this->getDatasetKotaLokal();
            }

            try {
                $response = $this->client(10)->get("{$this->baseUrl}/city");

                if ($response->successful()) {
                    $results = $response->json('rajaongkir.results', []);
                    if (is_array($results) && !empty($results)) {
                        return $results;
                    }
                }
            } catch (\Throwable $e) {
                Log::warning("[RajaOngkir City Timeout/Error] Menggunakan dataset kota lokal: {$e->getMessage()}");
            }

            return $this->getDatasetKotaLokal();
        });

        if (empty($namaKota)) {
            return $cities;
        }

        return array_values(array_filter($cities, function (array $c) use ($namaKota): bool {
            $gabungan = ($c['type'] ?? '') . ' ' . ($c['city_name'] ?? '');
            return stripos($gabungan, $namaKota) !== false
                || stripos((string) ($c['postal_code'] ?? ''), $namaKota) !== false;
        }));
    }

    protected function getFallbackRateSimulator(string $courier, int $weightGram): array
    {
        $weightKg = max(1, (int) ceil($weightGram / 1000));
        $base = match (strtolower($courier)) {
            'jne'   => ['nama' => 'JNE', 'layanan' => 'Reguler', 'kode' => 'reg', 'harga' => 18000, 'etd' => '2 - 3 hari'],
            'pos'   => ['nama' => 'POS Indonesia', 'layanan' => 'Pos Reguler', 'kode' => 'pos_reguler', 'harga' => 15000, 'etd' => '2 - 4 hari'],
            'tiki'  => ['nama' => 'TIKI', 'layanan' => 'Regular Service', 'kode' => 'reg', 'harga' => 17000, 'etd' => '2 - 3 hari'],
            default => ['nama' => strtoupper($courier), 'layanan' => 'Reguler', 'kode' => 'reg', 'harga' => 16000, 'etd' => '2 - 3 hari'],
        };

        return [
            [
                'kurir_kode'    => strtolower($courier),
                'kurir_nama'    => $base['nama'],
                'layanan_kode'  => $base['kode'],
                'layanan_nama'  => $base['layanan'],
                'kurir_layanan' => $base['layanan'],
                'nama'          => "{$base['nama']} {$base['layanan']}",
                'layanan'       => $base['layanan'],
                'harga'         => $base['harga'] * $weightKg,
                'estimasi'      => $base['etd'],
                'estimasi_hari' => $base['etd'],
                'etd'           => $base['etd'],
                'tipe'          => 'standard',
                'ikon'          => "/assets/ikon/kurir-{$courier}.svg",
                'logo_url'      => "/assets/ikon/kurir-{$courier}.svg",
                'is_mock'       => true,
                'sumber'        => 'Simulasi Ekspedisi Lokal',
            ],
        ];
    }

    protected function getDatasetKotaLokal(): array
    {
        return [
            ['city_id' => '152', 'province_id' => '6', 'province' => 'DKI Jakarta', 'type' => 'Kota Administrasi', 'city_name' => 'Jakarta Pusat', 'postal_code' => '10560'],
            ['city_id' => '151', 'province_id' => '6', 'province' => 'DKI Jakarta', 'type' => 'Kota Administrasi', 'city_name' => 'Jakarta Barat', 'postal_code' => '11220'],
            ['city_id' => '153', 'province_id' => '6', 'province' => 'DKI Jakarta', 'type' => 'Kota Administrasi', 'city_name' => 'Jakarta Selatan', 'postal_code' => '12110'],
            ['city_id' => '154', 'province_id' => '6', 'province' => 'DKI Jakarta', 'type' => 'Kota Administrasi', 'city_name' => 'Jakarta Timur', 'postal_code' => '13330'],
            ['city_id' => '155', 'province_id' => '6', 'province' => 'DKI Jakarta', 'type' => 'Kota Administrasi', 'city_name' => 'Jakarta Utara', 'postal_code' => '14140'],
            ['city_id' => '419', 'province_id' => '5', 'province' => 'DI Yogyakarta', 'type' => 'Kabupaten', 'city_name' => 'Sleman', 'postal_code' => '55281'],
            ['city_id' => '501', 'province_id' => '5', 'province' => 'DI Yogyakarta', 'type' => 'Kota', 'city_name' => 'Yogyakarta', 'postal_code' => '55111'],
            ['city_id' => '23',  'province_id' => '9', 'province' => 'Jawa Barat', 'type' => 'Kota', 'city_name' => 'Bandung', 'postal_code' => '40111'],
            ['city_id' => '444', 'province_id' => '11', 'province' => 'Jawa Timur', 'type' => 'Kota', 'city_name' => 'Surabaya', 'postal_code' => '60111'],
        ];
    }

    /**
     * Lacak nomor resi / waybill pengiriman melalui RajaOngkir API.
     *
     * @return array<string, mixed>
     */
    public function lacakResi(string $waybill, string $courier): array
    {
        $waybill = trim($waybill);
        $courier = strtolower(trim($courier));

        if (empty($waybill)) {
            return ['sukses' => false, 'pesan' => 'Nomor resi tidak valid'];
        }

        $cacheKey = "ro_waybill_{$courier}_{$waybill}";

        return Cache::remember($cacheKey, now()->addMinutes(30), function () use ($waybill, $courier) {
            if (empty($this->apiKey)) {
                return [
                    'sukses'  => true,
                    'status'  => 'ON_PROCESS',
                    'kurir'   => strtoupper($courier),
                    'layanan' => 'REG',
                    'history' => [
                        [
                            'note'       => 'Paket telah diterima di sorting center (Simulasi).',
                            'updated_at' => now()->toIso8601String(),
                            'status'     => 'manifested',
                        ],
                    ],
                ];
            }

            try {
                $response = $this->client(10)->asForm()->post("{$this->baseUrl}/waybill", [
                    'waybill' => $waybill,
                    'courier' => $courier,
                ]);

                if ($response->successful()) {
                    $result = $response->json('rajaongkir.result', []);
                    $manifest = $result['manifest'] ?? [];

                    $history = array_map(function ($item) {
                        return [
                            'note'       => ($item['manifest_description'] ?? '') . ' - ' . ($item['city_name'] ?? ''),
                            'updated_at' => ($item['manifest_date'] ?? '') . ' ' . ($item['manifest_time'] ?? ''),
                            'status'     => strtolower((string) ($item['manifest_code'] ?? 'in_transit')),
                        ];
                    }, $manifest);

                    return [
                        'sukses'    => true,
                        'status'    => $result['delivery_status']['status'] ?? 'ON_PROCESS',
                        'kurir'     => strtoupper($courier),
                        'layanan'   => $result['summary']['service_code'] ?? 'REG',
                        'penerima'  => $result['delivery_status']['pod_receiver'] ?? null,
                        'history'   => !empty($history) ? $history : [
                            [
                                'note'       => 'Resi terdaftar di sistem ekspedisi ' . strtoupper($courier),
                                'updated_at' => now()->toIso8601String(),
                                'status'     => 'allocated',
                            ],
                        ],
                    ];
                }
            } catch (\Throwable $e) {
                Log::warning("[RajaOngkir Waybill Exception] {$courier} - {$waybill}: {$e->getMessage()}");
            }

            return [
                'sukses'  => true,
                'status'  => 'allocated',
                'kurir'   => strtoupper($courier),
                'layanan' => 'REG',
                'history' => [
                    [
                        'note'       => 'Resi sedang menunggu update berkala dari ekspedisi.',
                        'updated_at' => now()->toIso8601String(),
                        'status'     => 'allocated',
                    ],
                ],
            ];
        });
    }
}
