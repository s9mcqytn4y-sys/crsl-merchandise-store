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
        $request->validate([
            'area_id' => 'required|string',
            'items' => 'required|array',
            'kurir' => 'nullable|string',
        ]);

        $areaId = $request->input('area_id');
        $items = $request->input('items', []);
        $couriers = $request->input('kurir', 'jne,jnt,sicepat,anteraja');

        $rates = $this->biteshipService->kalkulasiOngkir($areaId, $items, $couriers);

        return response()->json([
            'sukses' => true,
            'data' => $rates,
        ]);
    }
}
