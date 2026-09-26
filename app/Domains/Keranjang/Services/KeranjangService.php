<?php

namespace App\Domains\Keranjang\Services;

use App\Models\ItemKeranjang;
use App\Models\Keranjang;
use App\Models\Produk;
use App\Models\ProdukVarian;

class KeranjangService
{
    /**
     * Sinkronkan item keranjang ke database PostgreSQL untuk pengguna login.
     */
    public function tambahItem(int $produkId, ?int $varianId, int $jumlah, ?int $penggunaId, string $sessionId): array
    {
        $produk = Produk::find($produkId);
        if (!$produk) {
            return ['sukses' => false, 'pesan' => 'Produk tidak ditemukan.'];
        }

        $varian = $varianId ? ProdukVarian::find($varianId) : null;
        $harga = $varian && $varian->harga_tambahan > 0
            ? ($produk->harga_diskon ?? $produk->harga_dasar) + $varian->harga_tambahan
            : ($produk->harga_diskon ?? $produk->harga_dasar);

        // Session Cart (Fallback & Unauthenticated)
        $keranjangSession = session()->get('keranjang', []);
        $cartKey = $produkId . ($varianId ? '_' . $varianId : '');

        if (isset($keranjangSession[$cartKey])) {
            $keranjangSession[$cartKey]['jumlah'] += $jumlah;
        } else {
            $keranjangSession[$cartKey] = [
                'id' => $cartKey,
                'produk_id' => $produk->id,
                'varian_id' => $varian?->id,
                'nama_produk' => $produk->nama . ($varian ? " ({$varian->nama_varian})" : ''),
                'sku' => $varian?->sku ?? "CRSL-{$produk->id}",
                'harga' => (float)$harga,
                'jumlah' => $jumlah,
                'ukuran' => $varian?->ukuran,
                'warna' => $varian?->warna,
                'gambar' => $varian?->gambar_varian ?? $produk->gambar_utama,
            ];
        }

        session()->put('keranjang', $keranjangSession);

        // Database Cart Persistence if authenticated
        if ($penggunaId) {
            $dbKeranjang = Keranjang::firstOrCreate([
                'pengguna_id' => $penggunaId,
            ], [
                'session_id' => $sessionId,
            ]);

            $dbItem = ItemKeranjang::where('keranjang_id', $dbKeranjang->id)
                ->where('produk_id', $produkId)
                ->where('produk_varian_id', $varianId)
                ->first();

            if ($dbItem) {
                $dbItem->jumlah += $jumlah;
                $dbItem->save();
            } else {
                ItemKeranjang::create([
                    'keranjang_id' => $dbKeranjang->id,
                    'produk_id' => $produkId,
                    'produk_varian_id' => $varianId,
                    'jumlah' => $jumlah,
                ]);
            }
        }

        return [
            'sukses' => true,
            'pesan' => 'Produk berhasil ditambahkan ke keranjang.',
            'keranjang' => $keranjangSession,
        ];
    }

    /**
     * Perbarui kuantitas item keranjang.
     */
    public function perbaruiKuantitas(string $cartKey, int $jumlahBaru, ?int $penggunaId): void
    {
        $keranjangSession = session()->get('keranjang', []);
        if (isset($keranjangSession[$cartKey])) {
            $keranjangSession[$cartKey]['jumlah'] = max(1, $jumlahBaru);
            session()->put('keranjang', $keranjangSession);
        }

        if ($penggunaId) {
            $parts = explode('_', $cartKey);
            $produkId = (int)$parts[0];
            $varianId = isset($parts[1]) ? (int)$parts[1] : null;

            $dbKeranjang = Keranjang::where('pengguna_id', $penggunaId)->first();
            if ($dbKeranjang) {
                ItemKeranjang::where('keranjang_id', $dbKeranjang->id)
                    ->where('produk_id', $produkId)
                    ->where('produk_varian_id', $varianId)
                    ->update(['jumlah' => max(1, $jumlahBaru)]);
            }
        }
    }

    /**
     * Hapus item dari keranjang.
     */
    public function hapusItem(string $cartKey, ?int $penggunaId): void
    {
        $keranjangSession = session()->get('keranjang', []);
        if (isset($keranjangSession[$cartKey])) {
            unset($keranjangSession[$cartKey]);
            session()->put('keranjang', $keranjangSession);
        }

        if ($penggunaId) {
            $parts = explode('_', $cartKey);
            $produkId = (int)$parts[0];
            $varianId = isset($parts[1]) ? (int)$parts[1] : null;

            $dbKeranjang = Keranjang::where('pengguna_id', $penggunaId)->first();
            if ($dbKeranjang) {
                ItemKeranjang::where('keranjang_id', $dbKeranjang->id)
                    ->where('produk_id', $produkId)
                    ->where('produk_varian_id', $varianId)
                    ->delete();
            }
        }
    }

    /**
     * Kosongkan keranjang.
     */
    public function kosongkan(?int $penggunaId): void
    {
        session()->forget('keranjang');

        if ($penggunaId) {
            $dbKeranjang = Keranjang::where('pengguna_id', $penggunaId)->first();
            if ($dbKeranjang) {
                ItemKeranjang::where('keranjang_id', $dbKeranjang->id)->delete();
            }
        }
    }
}
