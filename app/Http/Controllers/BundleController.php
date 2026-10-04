<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\Produk;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BundleController extends Controller
{
    /**
     * Menampilkan detail halaman paket bundle dinamis dari database PostgreSQL.
     */
    public function show(int $id, ?string $slug = null): Response
    {
        $dbProduk = Produk::with(['kategori', 'varian', 'gambar', 'bundleItems'])
            ->where('tipe_produk', 'bundle')
            ->find($id);

        if (! $dbProduk) {
            $dbProduk = Produk::with(['kategori', 'varian', 'gambar', 'bundleItems'])
                ->where('tipe_produk', 'bundle')
                ->where('slug', $slug)
                ->first();
        }

        if (! $dbProduk) {
            $dbProduk = Produk::with(['kategori', 'varian', 'gambar', 'bundleItems'])
                ->where('tipe_produk', 'bundle')
                ->firstOrFail();
        }

        $hargaPaket = (int) ($dbProduk->harga_diskon ?? $dbProduk->harga_dasar);
        $hargaAsli = (int) $dbProduk->harga_dasar;
        $diskonPersen = $hargaAsli > 0 ? (int) round((($hargaAsli - $hargaPaket) / $hargaAsli) * 100) : 0;
        $hematNominal = max(0, $hargaAsli - $hargaPaket);

        $galeri = $dbProduk->gambar->pluck('url')->all();
        if (empty($galeri) && $dbProduk->gambar_utama) {
            $galeri = [$dbProduk->gambar_utama];
        }

        $items = $dbProduk->bundleItems->map(fn ($item) => [
            'id' => $item->id,
            'nama' => $item->nama_item,
            'harga' => (int) $item->harga,
            'gambar' => $item->gambar,
            'varian' => $item->varian ?? [],
        ])->all();

        $bundle = [
            'id' => $dbProduk->id,
            'judul' => $dbProduk->nama,
            'slug' => $dbProduk->slug,
            'harga_paket' => $hargaPaket,
            'harga_asli' => $hargaAsli,
            'diskon_persen' => $diskonPersen,
            'hemat' => $hematNominal > 0 ? 'Hemat Rp ' . number_format($hematNominal, 0, ',', '.') . " ({$diskonPersen}% OFF)" : null,
            'berat_total' => $dbProduk->berat_gram,
            'gambar_utama' => $dbProduk->gambar_utama,
            'galeri' => $galeri,
            'deskripsi' => $dbProduk->deskripsi,
            'items' => $items,
            'freebies' => $dbProduk->freebies ?? [],
        ];

        $rekomendasi = Produk::with(['kategori', 'varian'])
            ->where('aktif', true)
            ->where('id', '!=', $dbProduk->id)
            ->inRandomOrder()
            ->take(4)
            ->get();

        return Inertia::render('DetailBundle', [
            'bundle' => $bundle,
            'rekomendasi' => $rekomendasi,
        ]);
    }
}
