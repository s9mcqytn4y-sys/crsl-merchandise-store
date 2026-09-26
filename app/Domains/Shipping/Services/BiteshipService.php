<?php

declare(strict_types=1);

namespace App\Domains\Shipping\Services;

use App\Domains\Shipping\DTOs\BiteshipArea;
use App\Domains\Shipping\DTOs\BiteshipRateOption;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use RuntimeException;

class BiteshipService
{
    protected string $apiKey;
    protected string $originAreaId;
    protected string $baseUrl;
    protected int $timeoutSeconds;

    public function __construct()
    {
        $this->apiKey = (string) config('services.biteship.api_key', '');
        $this->originAreaId = (string) config('services.biteship.origin_area_id', 'IDNP5IDNC412IDND5043IDZ55281');
        $this->baseUrl = rtrim((string) config('services.biteship.base_url', 'https://api.biteship.com'), '/');
        $this->timeoutSeconds = 10;
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
     *
     * @param string $kataKunci
     * @return array<int, array<string, mixed>>
     */
    public function cariArea(string $kataKunci): array
    {
        $kataKunci = trim($kataKunci);
        if (mb_strlen($kataKunci) < 3) {
            return [];
        }

        $cacheKey = 'biteship_area_' . hash('xxh128', mb_strtolower($kataKunci));

        // 1. Ambil dari cache jika ada
        if (Cache::has($cacheKey)) {
            return (array) Cache::get($cacheKey, []);
        }

        // 2. Proteksi API Key
        if (empty($this->apiKey)) {
            Log::channel('single')->error('[Biteship] API Key belum dikonfigurasi di services.biteship.api_key');
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

        // Jangan simpan fallback ke cache
        return $this->filterFallbackAreas($kataKunci);
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
        $isMock = app()->isLocal() || (bool) config('services.biteship.mock', false);

        if (empty($this->apiKey)) {
            if ($isMock) {
                return $this->getMockCouriers($totalWeight);
            }
            Log::error('[Biteship] API Key kosong saat memanggil kalkulasi ongkir.');
            return [];
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
                'kurir_kode'    => 'jne',
                'kurir_nama'    => 'JNE',
                'layanan_kode'  => 'reg',
                'layanan_nama'  => 'Reguler',
                'kurir_layanan' => 'Reguler',
                'nama'          => 'JNE Reguler',
                'layanan'       => 'Reguler',
                'harga'         => 18000 * $weightKg,
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
                'kurir_kode'    => 'sicepat',
                'kurir_nama'    => 'SiCepat',
                'layanan_kode'  => 'siuntung',
                'layanan_nama'  => 'SiUntung',
                'kurir_layanan' => 'SiUntung',
                'nama'          => 'SiCepat SiUntung',
                'layanan'       => 'SiUntung',
                'harga'         => 17000 * $weightKg,
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
                'kurir_kode'    => 'jnt',
                'kurir_nama'    => 'J&T Express',
                'layanan_kode'  => 'ez',
                'layanan_nama'  => 'EZ',
                'kurir_layanan' => 'EZ',
                'nama'          => 'J&T EZ',
                'layanan'       => 'EZ',
                'harga'         => 19000 * $weightKg,
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
                'kurir_kode'    => 'anteraja',
                'kurir_nama'    => 'Anteraja',
                'layanan_kode'  => 'reg',
                'layanan_nama'  => 'Reguler',
                'kurir_layanan' => 'Reguler',
                'nama'          => 'Anteraja Reguler',
                'layanan'       => 'Reguler',
                'harga'         => 16000 * $weightKg,
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
        if (empty($this->apiKey)) {
            $simulasiResi = strtoupper($dataPesanan['kurir'] ?? 'JNE') . '-MOCK-' . date('Ymd') . '-' . strtoupper(Str::random(6));
            Log::channel('single')->info('[Biteship Pickup Simulation (Local)]', [
                'resi' => $simulasiResi,
                'data' => $dataPesanan,
            ]);

            return [
                'sukses'            => true,
                'biteship_order_id' => 'mock_order_' . Str::uuid(),
                'waybill_id'        => $simulasiResi,
                'status'            => 'allocated',
                'tracking_url'      => 'https://biteship.com/track/' . $simulasiResi,
                'is_simulasi'       => true,
            ];
        }

        $isDropship = !empty($dataPesanan['is_dropship']);
        $shipperName = $isDropship ? ($dataPesanan['dropship_pengirim'] ?? 'CRSL Partner') : 'CRSL Official Store';
        $shipperPhone = $isDropship ? ($dataPesanan['dropship_telepon'] ?? '081234567890') : '081234567890';

        $payload = [
            'shipper' => [
                'name'  => (string) $shipperName,
                'phone' => (string) $shipperPhone,
                'email' => 'shipping@crslstore.com',
            ],
            'origin' => [
                'area_id'     => $this->originAreaId,
                'postal_code' => (int) config('services.biteship.origin_postal_code', 55281),
            ],
            'destination' => [
                'area_id'       => (string) ($dataPesanan['area_id'] ?? ''),
                'contact_name'  => (string) ($dataPesanan['nama_penerima'] ?? 'Pelanggan'),
                'contact_phone' => (string) ($dataPesanan['telepon'] ?? ''),
                'address'       => (string) ($dataPesanan['alamat_lengkap'] ?? ''),
                'postal_code'   => (int) ($dataPesanan['kode_pos'] ?? 0),
            ],
            'courier' => [
                'company' => (string) ($dataPesanan['kurir'] ?? 'jne'),
                'type'    => (string) ($dataPesanan['layanan'] ?? 'reg'),
            ],
            'delivery_type' => 'now',
            'items'         => (array) ($dataPesanan['items'] ?? []),
        ];

        try {
            $response = $this->newRequest(15)
                ->post("{$this->baseUrl}/v1/orders", $payload);

            if ($response->successful()) {
                return [
                    'sukses'            => true,
                    'biteship_order_id' => $response->json('id'),
                    'waybill_id'        => $response->json('courier.waybill_id'),
                    'status'            => $response->json('status', 'allocated'),
                    'tracking_url'      => $response->json('courier.tracking_url'),
                    'raw'               => $response->json(),
                ];
            }

            Log::warning("[Biteship Create Order Error] {$response->body()}", [
                'payload' => $payload,
            ]);

            if (app()->isLocal()) {
                $simulasiResi = strtoupper($dataPesanan['kurir'] ?? 'JNE') . '-DEV-' . date('Ymd') . '-' . strtoupper(Str::random(6));
                Log::info("[Biteship Order Dev Fallback] Resi: {$simulasiResi}");
                return [
                    'sukses'            => true,
                    'biteship_order_id' => 'dev_order_' . Str::uuid(),
                    'waybill_id'        => $simulasiResi,
                    'status'            => 'allocated',
                    'tracking_url'      => 'https://biteship.com/track/' . $simulasiResi,
                    'is_simulasi'       => true,
                ];
            }

            return [
                'sukses' => false,
                'pesan'  => 'Gagal membuat order ke kurir: ' . ($response->json('error') ?? 'Terjadi kesalahan sistem ekspedisi.'),
            ];
        } catch (\Throwable $e) {
            Log::error("[Biteship Dispatch Crash] {$e->getMessage()}");

            if (app()->isLocal()) {
                $simulasiResi = strtoupper($dataPesanan['kurir'] ?? 'JNE') . '-DEV-' . date('Ymd') . '-' . strtoupper(Str::random(6));
                Log::info("[Biteship Order Dev Fallback on Exception] Resi: {$simulasiResi}");
                return [
                    'sukses'            => true,
                    'biteship_order_id' => 'dev_order_' . Str::uuid(),
                    'waybill_id'        => $simulasiResi,
                    'status'            => 'allocated',
                    'tracking_url'      => 'https://biteship.com/track/' . $simulasiResi,
                    'is_simulasi'       => true,
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
                'id'        => 'IDnp647101',
                'nama'      => 'Condongcatur, Depok, Sleman, D.I. Yogyakarta (55281)',
                'kota'      => 'Sleman',
                'kecamatan' => 'Depok',
                'provinsi'  => 'D.I. Yogyakarta',
                'kode_pos'  => '55281',
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

        // Filter ketat tanpa Elvis fallback. Jika tidak cocok, kembalikan []
        return array_values(array_filter($sample, function (array $area) use ($kataKunci): bool {
            return stripos($area['nama'], $kataKunci) !== false
                || stripos($area['kecamatan'], $kataKunci) !== false
                || stripos($area['kota'], $kataKunci) !== false
                || stripos((string) $area['kode_pos'], $kataKunci) !== false;
        }));
    }
}
