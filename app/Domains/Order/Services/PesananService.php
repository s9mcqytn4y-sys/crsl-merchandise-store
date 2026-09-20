<?php

namespace App\Domains\Order\Services;

use App\Models\Pesanan;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class PesananService
{
    /**
     * Ambil riwayat pesanan pengguna beserta relasi detail.
     */
    public function ambilPesananPengguna(int $penggunaId, int $perPage = 10): LengthAwarePaginator
    {
        return Pesanan::with(['items.produk', 'pembayaran', 'pengiriman'])
            ->where('pengguna_id', $penggunaId)
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);
    }

    /**
     * Ambil detail pesanan berdasarkan nomor pesanan.
     */
    public function ambilDetailPesanan(string $nomorPesanan): ?Pesanan
    {
        $nomorAsli = str_replace('-', '/', $nomorPesanan);

        return Pesanan::with(['items.produk', 'pembayaran', 'pengiriman'])
            ->where('nomor_pesanan', $nomorAsli)
            ->orWhere('nomor_pesanan', $nomorPesanan)
            ->first();
    }
}
