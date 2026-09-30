<?php

declare(strict_types=1);

namespace App\Domains\Pengiriman\Services;

use App\Domains\Pengiriman\DTOs\RajaOngkirRateOption;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class RajaOngkirService
{
    protected string $apiKey;
    protected string $baseUrl;
    protected string $originCityId;
    protected string $defaultCouriers;

    public function __construct()
    {
        $this->apiKey = (string) config('services.rajaongkir.api_key', '');
        $this->baseUrl = rtrim((string) config('services.rajaongkir.base_url', 'https://api.rajaongkir.com/starter'), '/');
        $this->originCityId = (string) config('services.rajaongkir.origin_city_id', '152'); // Jakarta Pusat
        $this->defaultCouriers = (string) config('services.rajaongkir.couriers', 'jne,pos,tiki');
    }

    /**
     * Inisialisasi HTTP Request Client khusus RajaOngkir API.
     * Menggunakan force IPv4 (CURLOPT_IPRESOLVE_V4) untuk mencegah hang cURL di Windows.
     */
    protected function client(int $timeout = 8): \Illuminate\Http\Client\PendingRequest
    {
        return Http::withHeaders([
            'key'          => $this->apiKey,
            'Accept'       => 'application/json',
        ])
        ->timeout($timeout)
        ->withOptions([
            'verify'     => false,
            'curl'       => [
                CURLOPT_IPRESOLVE => CURL_IPRESOLVE_V4,
            ],
        ]);
    }

    /**
     * Mengambil daftar seluruh kota dari database RajaOngkir atau filter pencarian nama kota.
     *
     * @return array<int, array<string, mixed>>
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

                Log::warning("[RajaOngkir City] Status {$response->status()}: {$response->body()}");
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

    /**
     * Hitung ongkos kirim resmi via POST /cost ke API RajaOngkir.
     *
     * @param string $destinationCityId ID kota tujuan dari RajaOngkir (misal: 419 untuk Sleman, 152 untuk Jakarta Pusat)
     * @param int $totalWeightGram Total bobot dalam gram
     * @param string|null $couriers Kurir dipisahkan koma (jne,pos,tiki)
     * @return array<int, array<string, mixed>>
     */
    public function kalkulasiOngkir(string $destinationCityId, int $totalWeightGram, ?string $couriers = null): array
    {
        $destinationCityId = trim($destinationCityId);
        if (empty($destinationCityId)) {
            return [];
        }

        $weight = max(100, $totalWeightGram);
        $courierList = array_filter(array_map('trim', explode(',', strtolower($couriers ?: $this->defaultCouriers))));
        $allRates = [];

        foreach ($courierList as $courier) {
            $cacheKey = "ro_cost_{$this->originCityId}_{$destinationCityId}_{$weight}_{$courier}";

            $rates = Cache::remember($cacheKey, now()->addHours(3), function () use ($destinationCityId, $weight, $courier) {
                if (empty($this->apiKey)) {
                    return $this->getFallbackRateSimulator($courier, $weight);
                }

                try {
                    // RajaOngkir mewajibkan form-urlencoded
                    $response = $this->client(8)->asForm()->post("{$this->baseUrl}/cost", [
                        'origin'      => $this->originCityId,
                        'destination' => $destinationCityId,
                        'weight'      => $weight,
                        'courier'     => $courier,
                    ]);

                    if ($response->successful()) {
                        $courierData = $response->json('rajaongkir.results.0', []);
                        $code = (string) ($courierData['code'] ?? $courier);
                        $name = (string) ($courierData['name'] ?? strtoupper($courier));
                        $costs = (array) ($courierData['costs'] ?? []);

                        $parsed = [];
                        foreach ($costs as $costItem) {
                            $costDetail = $costItem['cost'][0] ?? [];
                            $harga = (int) ($costDetail['value'] ?? 0);
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
                            return $parsed;
                        }
                    }

                    Log::warning("[RajaOngkir Rate Error] Kurir {$courier}: {$response->body()}");
                } catch (\Throwable $e) {
                    Log::warning("[RajaOngkir Cost Exception] {$courier}: {$e->getMessage()}");
                }

                // Jika API RajaOngkir timeout, berikan fallback tarif dinamis
                return $this->getFallbackRateSimulator($courier, $weight);
            });

            if (!empty($rates)) {
                $allRates = array_merge($allRates, $rates);
            }
        }

        // Sortir tarif termurah ke termahal
        usort($allRates, fn(array $a, array $b): int => ($a['harga'] ?? 0) <=> ($b['harga'] ?? 0));

        return $allRates;
    }

    /**
     * Fallback kalkulasi otomatis jika API RajaOngkir sedang timeout / jaringan offline.
     */
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

    /**
     * Dataset cadangan kota penting Indonesia jika koneksi internet terputus.
     */
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
}
