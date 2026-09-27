<?php

namespace App\Domains\Inventori\Services;

use App\Models\ProdukVarian;
use Exception;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class InventoriService
{
    /**
     * Memeriksa ketersediaan stok varian produk secara real-time.
     */
    public function cekStokVarian(int $varianId, int $jumlahDiminta = 1): array
    {
        $varian = ProdukVarian::find($varianId);

        if (!$varian) {
            return [
                'tersedia' => false,
                'pesan' => 'Varian produk tidak ditemukan.',
                'stok_saat_ini' => 0,
            ];
        }

        if (!$varian->aktif) {
            return [
                'tersedia' => false,
                'pesan' => 'Varian produk sedang tidak aktif.',
                'stok_saat_ini' => $varian->stok,
            ];
        }

        if ($varian->stok < $jumlahDiminta) {
            return [
                'tersedia' => false,
                'pesan' => "Stok untuk varian {$varian->nama_varian} tidak mencukupi (sisa: {$varian->stok}).",
                'stok_saat_ini' => $varian->stok,
            ];
        }

        return [
            'tersedia' => true,
            'pesan' => 'Stok varian mencukupi.',
            'stok_saat_ini' => $varian->stok,
        ];
    }

    /**
     * Mengunci baris stok varian produk dengan lockForUpdate() dan mengurangi stok secara aman.
     *
     * @param array $items Array item keranjang [{varian_id, jumlah}]
     * @return bool
     * @throws Exception
     */
    public function kunciDanKurangiStok(array $items): bool
    {
        foreach ($items as $item) {
            $varianId = $item['varian_id'] ?? $item['produk_varian_id'] ?? $item['id'] ?? null;
            $jumlah = (int)($item['jumlah'] ?? $item['quantity'] ?? 1);

            if (!$varianId) {
                continue;
            }

            // Pessimistic Row Locking pada tabel produk_varian
            $varian = ProdukVarian::where('id', $varianId)
                ->lockForUpdate()
                ->first();

            if (!$varian || $varian->stok < $jumlah) {
                $nama = $varian ? $varian->nama_varian : "ID #{$varianId}";
                throw new Exception("Stok untuk varian {$nama} tiba-tiba habis atau tidak mencukupi.");
            }

            $varian->stok -= $jumlah;
            $varian->save();

            Log::info("Inventori Lock: Stok varian ID {$varianId} berkurang {$jumlah}, sisa: {$varian->stok}");
        }

        return true;
    }

    /**
     * Skenario Rollback: Mengembalikan stok varian produk saat pesanan dibatalkan/expired.
     */
    public function kembalikanStokVarian(int $varianId, int $jumlah): bool
    {
        if ($jumlah <= 0) {
            return false;
        }

        $varian = ProdukVarian::find($varianId);
        if ($varian) {
            $varian->stok += $jumlah;
            $varian->save();

            Log::info("Inventori Rollback: Stok varian ID {$varianId} ditambah {$jumlah}, total: {$varian->stok}");
            return true;
        }

        return false;
    }

    /**
     * Mengembalikan stok varian produk secara massal berdasarkan array item.
     * Digunakan pada skenario kompensasi pembatalan pesanan atau kegagalan gateway.
     *
     * @param array $items Array item pesanan/keranjang [{varian_id, jumlah}, ...]
     * @return bool
     */
    public function kembalikanStok(array $items): bool
    {
        foreach ($items as $item) {
            $varianId = $item['varian_id'] ?? $item['produk_varian_id'] ?? $item['id'] ?? null;
            $jumlah = (int)($item['jumlah'] ?? $item['quantity'] ?? 0);

            if (!$varianId || $jumlah <= 0) {
                continue;
            }

            // Kunci baris varian untuk memastikan integritas data saat kompensasi
            $varian = ProdukVarian::where('id', $varianId)
                ->lockForUpdate()
                ->first();

            if ($varian) {
                $varian->increment('stok', $jumlah);

                Log::info("Inventori Rollback: Stok varian ID {$varianId} berhasil dikembalikan {$jumlah}, total sekarang: {$varian->fresh()->stok}");
            } else {
                Log::warning("Inventori Rollback: Gagal mengembalikan stok, varian ID {$varianId} tidak ditemukan.");
            }
        }

        return true;
    }
}
