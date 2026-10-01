<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Domains\Pengiriman\Services\BiteshipService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class WilayahController extends Controller
{
    public function __construct(
        protected BiteshipService $biteshipService
    ) {}

    /**
     * Endpoint API pencarian area/wilayah untuk autocomplete frontend.
     * Menggunakan Biteship Maps atau Master Data Wilayah Lokal (Zero Balance).
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

        $hasil = $this->biteshipService->cariArea($kataKunci);

        return response()->json([
            'sukses' => true,
            'data'   => $hasil,
        ]);
    }

    /**
     * Endpoint API kalkulasi tarif ongkos kirim multi-kurir Biteship.
     */
    public function ongkir(Request $request): JsonResponse
    {
        $destinationAreaId = (string) (
            $request->input('area_id')
            ?? $request->input('destination_area_id')
            ?? $request->input('city_id')
            ?? ''
        );
        $items = (array) $request->input('items', []);

        if (empty($destinationAreaId)) {
            return response()->json([
                'sukses' => false,
                'pesan'  => 'Parameter area_id tujuan pengiriman wajib diisi.',
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
        $couriers = (string) $request->input('kurir', 'jne,jnt,sicepat,anteraja');

        $rates = $this->biteshipService->kalkulasiOngkir($destinationAreaId, $items, $couriers);

        if (empty($rates)) {
            Log::warning('[Ongkir Error] Biteship gagal merespons tarif pengiriman.');
            return response()->json([
                'sukses'         => false,
                'kurir_tersedia' => false,
                'pesan'          => 'Layanan pengiriman kurir online sedang offline atau dalam pemeliharaan. Silakan hubungi CS kami via WhatsApp.',
                'whatsapp_url'   => 'https://api.whatsapp.com/send?phone=' . config('services.situs.whatsapp_cs', '6281234567890') . '&text=' . urlencode('Halo CS, saya mengalami kendala tarif pengiriman saat checkout.'),
                'data'           => [],
            ], 503);
        }

        $isMock = !empty($rates[0]['is_mock'] ?? false);
        $sumberTarif = $isMock ? 'Simulasi Ekspedisi Lokal (Sandbox)' : 'Biteship API Resmi';

        return response()->json([
            'sukses'         => true,
            'kurir_tersedia' => true,
            'is_mock'        => $isMock,
            'sumber_tarif'   => $sumberTarif,
            'total_berat'    => $totalWeight,
            'data'           => $rates,
        ]);
    }
}

