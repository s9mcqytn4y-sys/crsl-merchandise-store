<?php

namespace App\Domains\Shipping\Services;

use App\Domains\Shipping\DTOs\BiteshipArea;
use App\Domains\Shipping\DTOs\BiteshipRateOption;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class BiteshipService
{
    protected string $apiKey;
    protected string $originAreaId;
    protected string $baseUrl;

    public function __construct()
    {
        $this->apiKey = config('services.biteship.api_key', '');
        $this->originAreaId = config('services.biteship.origin_area_id', 'IDNP11KOT789311');
        $this->baseUrl = config('services.biteship.base_url', 'https://api.biteship.com');
    }

    /**
     * Cari lokasi/wilayah berdasarkan kata kunci (Pencarian Area Biteship).
     *
     * @param string $kataKunci
     * @return array<int, array>
     */
    public function cariArea(string $kataKunci): array
    {
        $kataKunci = trim($kataKunci);
        if (strlen($kataKunci) < 3) {
            return [];
        }

        $cacheKey = 'biteship_area_' . md5(strtolower($kataKunci));

        return Cache::remember($cacheKey, 86400, function () use ($kataKunci) {
            try {
                $response = Http::withHeaders([
                    'Authorization' => $this->apiKey,
                    'Content-Type' => 'application/json',
                ])
                ->timeout(10)
                ->get("{$this->baseUrl}/v1/maps/areas", [
                    'countries' => 'ID',
                    'input' => $kataKunci,
                    'type' => 'single',
                ]);

                if ($response->successful()) {
                    $areas = $response->json('areas', []);
                    return array_map(function ($area) {
                        return BiteshipArea::fromArray($area)->toArray();
                    }, $areas);
                }

                Log::warning("Biteship Area Search API Non-200: " . $response->body());
            } catch (\Throwable $e) {
                Log::error("Biteship Area Search Exception: " . $e->getMessage());
            }

            // Fallback area lokal jika API tidak dapat dijangkau
            return $this->getFallbackAreas($kataKunci);
        });
    }

    /**
     * Kalkulasi tarif ongkir multi-kurir berdasarkan area asal & tujuan.
     *
     * @param string $destinationAreaId
     * @param array $items
     * @param string $couriers
     * @return array<int, array>
     */
    public function kalkulasiOngkir(string $destinationAreaId, array $items, string $couriers = 'jne,jnt,sicepat,anteraja'): array
    {
        if (empty($destinationAreaId)) {
            return $this->getFallbackRates();
        }

        $formattedItems = array_map(function ($item) {
            return [
                'name' => $item['nama'] ?? $item['name'] ?? 'Produk CRSL',
                'description' => $item['deskripsi'] ?? 'Merchandise CRSL Official',
                'value' => (int)($item['harga'] ?? $item['value'] ?? 100000),
                'quantity' => (int)($item['jumlah'] ?? $item['quantity'] ?? 1),
                'weight' => (int)($item['berat_gram'] ?? $item['weight'] ?? 250),
            ];
        }, $items);

        try {
            $response = Http::withHeaders([
                'Authorization' => $this->apiKey,
                'Content-Type' => 'application/json',
            ])
            ->timeout(10)
            ->post("{$this->baseUrl}/v1/rates/couriers", [
                'origin_area_id' => $this->originAreaId,
                'destination_area_id' => $destinationAreaId,
                'couriers' => $couriers,
                'items' => $formattedItems,
            ]);

            if ($response->successful()) {
                $pricing = $response->json('pricing', []);
                return array_map(function ($rate) {
                    return BiteshipRateOption::fromArray($rate)->toArray();
                }, $pricing);
            }

            Log::warning("Biteship Rates API Non-200: " . $response->body());
        } catch (\Throwable $e) {
            Log::error("Biteship Rates Exception: " . $e->getMessage());
        }

        return $this->getFallbackRates();
    }

    /**
     * Buat order pengiriman pada Biteship API.
     *
     * @param array $dataPesanan
     * @return array
     */
    public function buatOrderPengiriman(array $dataPesanan): array
    {
        try {
            $isDropship = !empty($dataPesanan['is_dropship']);
            $shipperName = $isDropship ? ($dataPesanan['dropship_pengirim'] ?? 'Reseller CRSL') : 'CRSL Official Store';
            $shipperPhone = $isDropship ? ($dataPesanan['dropship_telepon'] ?? '081234567890') : '081234567890';

            $response = Http::withHeaders([
                'Authorization' => $this->apiKey,
                'Content-Type' => 'application/json',
            ])
            ->timeout(15)
            ->post("{$this->baseUrl}/v1/orders", [
                'shipper' => [
                    'name' => $shipperName,
                    'phone' => $shipperPhone,
                    'email' => 'shipping@crslstore.com',
                ],
                'origin' => [
                    'area_id' => $this->originAreaId,
                    'postal_code' => (int)config('services.biteship.origin_postal_code', 55281),
                ],
                'destination' => [
                    'area_id' => $dataPesanan['area_id'] ?? '',
                    'contact_name' => $dataPesanan['nama_penerima'] ?? 'Pelanggan',
                    'contact_phone' => $dataPesanan['telepon'] ?? '081200000000',
                    'address' => $dataPesanan['alamat_lengkap'] ?? '',
                    'postal_code' => (int)($dataPesanan['kode_pos'] ?? 55281),
                ],
                'courier' => [
                    'company' => $dataPesanan['kurir'] ?? 'jne',
                    'type' => $dataPesanan['layanan'] ?? 'reg',
                ],
                'delivery_type' => 'now',
                'items' => $dataPesanan['items'] ?? [],
            ]);

            if ($response->successful()) {
                return [
                    'sukses' => true,
                    'biteship_order_id' => $response->json('id'),
                    'waybill_id' => $response->json('courier.waybill_id'),
                    'status' => $response->json('status', 'allocated'),
                    'raw' => $response->json(),
                ];
            }

            Log::error("Biteship Create Order Failed: " . $response->body());
        } catch (\Throwable $e) {
            Log::error("Biteship Create Order Exception: " . $e->getMessage());
        }

        return [
            'sukses' => false,
            'biteship_order_id' => 'BS-MOCK-' . time(),
            'waybill_id' => 'RESI-MOCK-' . rand(100000, 999999),
            'status' => 'allocated',
            'pesan' => 'Pengiriman diproses dalam mode simulasi.',
        ];
    }

    /**
     * Fallback wilayah jika Biteship API tidak merespons.
     */
    protected function getFallbackAreas(string $kataKunci): array
    {
        $sample = [
            [
                'id' => 'IDNP11KOT789311',
                'nama' => 'Condongcatur, Depok, Sleman, D.I. Yogyakarta (55281)',
                'negara' => 'Indonesia',
                'provinsi' => 'D.I. Yogyakarta',
                'kota' => 'Sleman',
                'kecamatan' => 'Depok',
                'kelurahan' => 'Condongcatur',
                'kode_pos' => '55281',
            ],
            [
                'id' => 'IDNP31KOT123456',
                'nama' => 'Kebayoran Baru, Jakarta Selatan, DKI Jakarta (12110)',
                'negara' => 'Indonesia',
                'provinsi' => 'DKI Jakarta',
                'kota' => 'Jakarta Selatan',
                'kecamatan' => 'Kebayoran Baru',
                'kelurahan' => 'Gunung',
                'kode_pos' => '12110',
            ],
            [
                'id' => 'IDNP35KOT654321',
                'nama' => 'Coblong, Bandung, Jawa Barat (40132)',
                'negara' => 'Indonesia',
                'provinsi' => 'Jawa Barat',
                'kota' => 'Bandung',
                'kecamatan' => 'Coblong',
                'kelurahan' => 'Dago',
                'kode_pos' => '40132',
            ],
        ];

        return array_values(array_filter($sample, function ($area) use ($kataKunci) {
            return stripos($area['nama'], $kataKunci) !== false;
        })) ?: $sample;
    }

    /**
     * Fallback tarif ongkir standar jika API tidak merespons.
     */
    protected function getFallbackRates(): array
    {
        return [
            [
                'kurir_kode' => 'jne',
                'kurir_nama' => 'JNE Express',
                'layanan_kode' => 'reg',
                'layanan_nama' => 'REG (Regular Service)',
                'harga' => 18000,
                'estimasi_hari' => '2-3 Hari',
                'logo_url' => '/assets/ikon/shipment-jne.svg',
            ],
            [
                'kurir_kode' => 'jnt',
                'kurir_nama' => 'J&T Express',
                'layanan_kode' => 'ez',
                'layanan_nama' => 'EZ (Reguler Express)',
                'harga' => 20000,
                'estimasi_hari' => '1-2 Hari',
                'logo_url' => '/assets/ikon/shipment-jnt.svg',
            ],
            [
                'kurir_kode' => 'sicepat',
                'kurir_nama' => 'SiCepat Ekspres',
                'layanan_kode' => 'siuntung',
                'layanan_nama' => 'SIUNTUNG (Reguler)',
                'harga' => 17000,
                'estimasi_hari' => '2-3 Hari',
                'logo_url' => '/assets/ikon/kurir-sicepat.svg',
            ],
        ];
    }
}
