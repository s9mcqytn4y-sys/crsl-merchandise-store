<?php

namespace App\Http\Controllers;

use App\Domains\Shipping\Services\BiteshipService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class WilayahController extends Controller
{
    public function __construct(
        protected BiteshipService $biteshipService
    ) {}

    /**
     * Endpoint API pencarian area/wilayah Biteship untuk autocomplete frontend.
     */
    public function cari(Request $request): JsonResponse
    {
        $kataKunci = $request->query('q', '');

        if (strlen($kataKunci) < 3) {
            return response()->json([
                'sukses' => true,
                'data' => [],
            ]);
        }

        $hasil = $this->biteshipService->cariArea($kataKunci);

        return response()->json([
            'sukses' => true,
            'data' => $hasil,
        ]);
    }

    /**
     * Endpoint API kalkulasi tarif ongkos kirim real-time.
     */
    public function ongkir(Request $request): JsonResponse
    {
        $areaId = (string) ($request->input('area_id') ?? $request->input('destination_area_id', ''));

        if (empty($areaId)) {
            return response()->json([
                'sukses' => false,
                'pesan'  => 'Parameter area_id atau destination_area_id wajib diisi.',
                'data'   => [],
            ], 422);
        }

        $items = (array) $request->input('items', []);
        $couriers = (string) $request->input('kurir', 'jne,jnt,sicepat,anteraja');

        $rates = $this->biteshipService->kalkulasiOngkir($areaId, $items, $couriers);

        if (empty($rates)) {
            return response()->json([
                'sukses'         => false,
                'kurir_tersedia' => false,
                'pesan'          => 'Layanan pengiriman kurir online sedang offline atau dalam pemeliharaan. Silakan hubungi CS CRSL via WhatsApp untuk pemesanan manual.',
                'whatsapp_url'   => 'https://api.whatsapp.com/send?phone=' . config('services.situs.whatsapp_cs', '6281234567890') . '&text=' . urlencode('Halo CS CRSL, saya mengalami kendala tarif pengiriman saat checkout.'),
                'data'           => [],
            ], 503);
        }

        return response()->json([
            'sukses'         => true,
            'kurir_tersedia' => true,
            'data'           => $rates,
        ]);
    }
}
