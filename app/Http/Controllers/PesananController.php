<?php

namespace App\Http\Controllers;

use App\Domains\Payment\Services\MidtransService;
use App\Models\Pesanan;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PesananController extends Controller
{
    public function __construct(
        protected MidtransService $midtransService
    ) {}

    /**
     * Tampilkan halaman faktur/invoice pesanan beserta instruksi pembayaran native.
     */
    public function faktur(string $nomorPesanan): Response
    {
        $nomorPesananAsli = str_replace('-', '/', $nomorPesanan);

        $pesanan = Pesanan::with(['items', 'pembayaran', 'pengiriman'])
            ->where('nomor_pesanan', $nomorPesananAsli)
            ->orWhere('nomor_pesanan', $nomorPesanan)
            ->firstOrFail();

        return Inertia::render('Invoice', [
            'pesanan' => $pesanan,
            'keranjang' => session()->get('keranjang', []),
        ]);
    }

    /**
     * Endpoint API pengecekan status pembayaran real-time dari Midtrans API.
     */
    public function cekStatusRealtime(string $nomorPesanan): JsonResponse
    {
        $pesanan = Pesanan::with(['pembayaran'])
            ->where('nomor_pesanan', $nomorPesanan)
            ->first();

        if (!$pesanan) {
            return response()->json(['sukses' => false, 'pesan' => 'Pesanan tidak ditemukan'], 404);
        }

        $res = $this->midtransService->cekStatus($nomorPesanan);

        if ($res['sukses'] && !empty($res['status_pesanan'])) {
            if ($res['status_pesanan'] === 'akan_dikirim' && $pesanan->status === 'belum_bayar') {
                $pesanan->status = 'akan_dikirim';
                $pesanan->save();
            }
        }

        return response()->json([
            'sukses' => true,
            'status' => $pesanan->status,
            'midtrans' => $res,
        ]);
    }

    /**
     * Halaman lacak status pesanan & resi kurir.
     */
    public function lacak(Request $request): Response
    {
        $nomorPesanan = $request->get('nomor');
        $pesanan = null;

        if ($nomorPesanan) {
            $pesanan = Pesanan::with(['items', 'pembayaran', 'pengiriman'])
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
