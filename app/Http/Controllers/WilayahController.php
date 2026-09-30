<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Domains\Pengiriman\Services\BiteshipService;
use App\Domains\Pengiriman\Services\RajaOngkirService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class WilayahController extends Controller
{
    public function __construct(
        protected BiteshipService $biteshipService,
        protected RajaOngkirService $rajaOngkirService
    ) {}

    /**
     * Endpoint API pencarian area/wilayah untuk autocomplete frontend.
     * Mendukung pencarian via Biteship Maps atau fallback daftar kota RajaOngkir.
     */
    public function cari(Request $request): JsonResponse
    {
        $kataKunci = trim((string) $request->query('q', ''));

        if (mb_strlen($kataKunci) < 3) {
            return response()->json([
                'sukses' => true,
                'data'   => [],
            ]);
        }

        // 1. Coba pencarian area Biteship Maps
        $hasil = $this->biteshipService->cariArea($kataKunci);

        // 2. Jika Biteship kosong atau mock, perkaya dengan pencarian kota RajaOngkir
        if (empty($hasil) && !empty(config('services.rajaongkir.api_key'))) {
            $kotaRajaOngkir = $this->rajaOngkirService->cariKota($kataKunci);
            $hasil = array_map(function (array $k): array {
                $namaLengkap = "{$k['type']} {$k['city_name']}, {$k['province']} ({$k['postal_code']})";
                return [
                    'id'          => (string) $k['city_id'],
                    'city_id'     => (string) $k['city_id'],
                    'nama'        => $namaLengkap,
                    'kota'        => $k['city_name'],
                    'provinsi'    => $k['province'],
                    'kode_pos'    => (string) $k['postal_code'],
                    'sumber'      => 'rajaongkir',
                ];
            }, $kotaRajaOngkir);
        }

        return response()->json([
            'sukses' => true,
            'data'   => $hasil,
        ]);
    }

    /**
     * Endpoint API kalkulasi tarif ongkos kirim multi-provider.
     * Prioritas: RajaOngkir -> Biteship -> Dev Fallback Mock.
     */
    public function ongkir(Request $request): JsonResponse
    {
        $destinationAreaId = (string) ($request->input('area_id') ?? $request->input('destination_area_id', ''));
        $cityId = (string) ($request->input('city_id') ?? '');
        $items = (array) $request->input('items', []);

        if (empty($destinationAreaId) && empty($cityId)) {
            return response()->json([
                'sukses' => false,
                'pesan'  => 'Parameter area_id atau city_id tujuan wajib diisi.',
                'data'   => [],
            ], 422);
        }

        // Kalkulasi total bobot gram riil
        $totalWeight = array_sum(array_map(function (array $item): int {
            $berat = (int) ($item['berat_gram'] ?? $item['weight'] ?? 250);
            $qty = max(1, (int) ($item['jumlah'] ?? $item['quantity'] ?? 1));
            return ($berat > 0 ? $berat : 250) * $qty;
        }, $items));

        $totalWeight = max(100, $totalWeight);
        $rates = [];
        $sumberTarif = '';

        // 1. Eksekusi RajaOngkir (jika city_id tersedia atau area_id numerik)
        $targetCityId = !empty($cityId) ? $cityId : (is_numeric($destinationAreaId) ? $destinationAreaId : '');
        if (!empty($targetCityId) && !empty(config('services.rajaongkir.api_key'))) {
            $kurirDipilih = (string) $request->input('kurir', config('services.rajaongkir.couriers', 'jne,pos,tiki'));
            $rates = $this->rajaOngkirService->kalkulasiOngkir($targetCityId, $totalWeight, $kurirDipilih);
            if (!empty($rates)) {
                $sumberTarif = 'RajaOngkir API Resmi';
            }
        }

        // 2. Eksekusi Biteship jika RajaOngkir belum menghasilkan tarif dan area_id Biteship tersedia
        if (empty($rates) && !empty($destinationAreaId)) {
            $couriers = (string) $request->input('kurir', 'jne,jnt,sicepat,anteraja');
            $rates = $this->biteshipService->kalkulasiOngkir($destinationAreaId, $items, $couriers);
            if (!empty($rates)) {
                $isMock = !empty($rates[0]['is_mock']);
                $sumberTarif = $isMock ? 'Simulasi Ekspedisi Lokal (Sandbox)' : 'Biteship API Resmi';
            }
        }

        if (empty($rates)) {
            Log::warning('[Ongkir Error] Semua provider pengiriman gagal merespons tarif.');
            return response()->json([
                'sukses'         => false,
                'kurir_tersedia' => false,
                'pesan'          => 'Layanan pengiriman kurir online sedang offline atau dalam pemeliharaan. Silakan hubungi CS kami via WhatsApp.',
                'whatsapp_url'   => 'https://api.whatsapp.com/send?phone=' . config('services.situs.whatsapp_cs', '6281234567890') . '&text=' . urlencode('Halo CS, saya mengalami kendala tarif pengiriman saat checkout.'),
                'data'           => [],
            ], 503);
        }

        $isMock = !empty($rates[0]['is_mock'] ?? false);

        return response()->json([
            'sukses'         => true,
            'kurir_tersedia' => true,
            'is_mock'        => $isMock,
            'sumber_tarif'   => $sumberTarif ?: ($isMock ? 'Simulasi Ekspedisi Lokal (Sandbox)' : 'Ekspedisi Resmi'),
            'total_berat'    => $totalWeight,
            'data'           => $rates,
        ]);
    }
}
