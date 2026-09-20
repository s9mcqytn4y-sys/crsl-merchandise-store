<?php

namespace App\Http\Controllers;

use App\Models\Pesanan;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PesananController extends Controller
{
    public function faktur(string $nomorPesanan): Response
    {
        $pesanan = Pesanan::with(['item.produk'])
            ->where('nomor_pesanan', $nomorPesanan)
            ->firstOrFail();

        return Inertia::render('Invoice', [
            'pesanan' => $pesanan,
            'detailBank' => [
                'bca' => [
                    'bank' => 'Bank BCA',
                    'nomor' => '8730-8888-21',
                    'nama' => 'PT CRSL MERCHANDISE INDONESIA',
                ],
                'mandiri' => [
                    'bank' => 'Bank Mandiri',
                    'nomor' => '1370-0099-8812',
                    'nama' => 'PT CRSL MERCHANDISE INDONESIA',
                ],
            ],
            'keranjang' => session()->get('keranjang', []),
        ]);
    }

    public function lacak(Request $request): Response
    {
        $nomorPesanan = $request->get('nomor');
        $pesanan = null;

        if ($nomorPesanan) {
            $pesanan = Pesanan::with(['item'])
                ->where('nomor_pesanan', trim($nomorPesanan))
                ->first();
        }

        return Inertia::render('TrackOrder', [
            'nomorPesanan' => $nomorPesanan,
            'pesanan' => $pesanan,
            'keranjang' => session()->get('keranjang', []),
        ]);
    }
}
