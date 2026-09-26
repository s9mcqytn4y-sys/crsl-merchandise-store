<?php

namespace App\Http\Controllers;

use App\Models\Kategori;
use App\Models\Produk;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class KatalogController extends Controller
{
    /**
     * Menampilkan katalog produk lengkap dengan filter multi-parameter dan sorting resmi CRSL.
     */
    public function index(Request $request): Response
    {
        $query = Produk::with(['kategori', 'varian', 'gambar'])
            ->where('aktif', true);

        // 1. Filter Kategori
        $kategoriParam = $request->get('kategori');
        if (!empty($kategoriParam) && $kategoriParam !== 'all-products') {
            $kategoriObj = Kategori::where('slug', $kategoriParam)->first();
            if ($kategoriObj) {
                $query->where('kategori_id', $kategoriObj->id);
            }
        }

        // 2. Pencarian (Search by Name / Description / SKU)
        $cari = trim($request->get('cari', ''));
        if (!empty($cari)) {
            $query->where(function ($q) use ($cari) {
                $q->where('nama', 'ilike', "%{$cari}%")
                  ->orWhere('deskripsi', 'ilike', "%{$cari}%")
                  ->orWhereHas('varian', function ($vq) use ($cari) {
                      $vq->where('sku', 'ilike', "%{$cari}%")
                         ->orWhere('nama_varian', 'ilike', "%{$cari}%");
                  });
            });
        }

        // 3. Filter Tipe Produk (Product Type)
        $productType = $request->get('tipe', $request->get('product_type', 'all_products'));
        if ($productType === 'featured_products') {
            $query->where('is_best_seller', true);
        } elseif ($productType === 'discount') {
            $query->whereNotNull('harga_diskon')
                  ->whereRaw('harga_diskon < harga_dasar');
        } elseif ($productType === 'bundled_products') {
            $query->where(function ($q) {
                $q->where('tipe_produk', 'bundle')
                  ->orWhere('slug', 'like', '%bundle%');
            });
        }

        // 4. Filter Ketersediaan Stok (Availability)
        $availability = $request->get('ketersediaan', $request->get('availability', 'all'));
        if ($availability === 'in_stock') {
            $query->where(function ($q) {
                $q->where('status_stok', 'in_stock')
                  ->orWhere('stok_total', '>', 0);
            });
        }

        // 5. Filter Rentang Harga (Price Range)
        $minHarga = $request->get('min_harga', $request->get('min_price'));
        $maxHarga = $request->get('max_harga', $request->get('max_price'));
        if (!empty($minHarga) && is_numeric($minHarga)) {
            $query->where('harga_dasar', '>=', (float)$minHarga);
        }
        if (!empty($maxHarga) && is_numeric($maxHarga)) {
            $query->where('harga_dasar', '<=', (float)$maxHarga);
        }

        // 6. Filter Warna (Color)
        $warna = $request->get('warna', $request->get('color'));
        if (!empty($warna)) {
            $query->whereHas('varian', function ($q) use ($warna) {
                $q->where('warna', 'ilike', "%{$warna}%")
                  ->orWhere('nama_varian', 'ilike', "%{$warna}%");
            });
        }

        // 7. Filter Ukuran (Size)
        $ukuran = $request->get('ukuran', $request->get('size'));
        if (!empty($ukuran)) {
            $query->whereHas('varian', function ($q) use ($ukuran) {
                $q->where('ukuran', 'ilike', "%{$ukuran}%");
            });
        }

        // 8. Pengurutan (Sort By)
        $sort = $request->get('urutkan', $request->get('sort', 'featured'));
        match ($sort) {
            'recent' => $query->orderBy('created_at', 'desc'),
            'oldest' => $query->orderBy('created_at', 'asc'),
            'popular' => $query->orderBy('terjual', 'desc')->orderBy('is_best_seller', 'desc'),
            'lowest_price', 'harga_rendah' => $query->orderBy('harga_dasar', 'asc'),
            'highest_price', 'harga_tinggi' => $query->orderBy('harga_dasar', 'desc'),
            'name_asc' => $query->orderBy('nama', 'asc'),
            'name_desc' => $query->orderBy('nama', 'desc'),
            default => $query->orderBy('is_best_seller', 'desc')->orderBy('id', 'asc'),
        };

        $produk = $query->get();
        $kategori = Kategori::where('aktif', true)->orderBy('urutan')->get();

        // Hitung batas harga dinamis untuk slider filter
        $minPossible = (int)(Produk::where('aktif', true)->min('harga_dasar') ?? 0);
        $maxPossible = (int)(Produk::where('aktif', true)->max('harga_dasar') ?? 600000);

        return Inertia::render('Katalog', [
            'produk' => $produk,
            'kategori' => $kategori,
            'filter' => [
                'kategori' => $kategoriParam ?: 'all-products',
                'cari' => $cari,
                'urutkan' => $sort,
                'tipe' => $productType,
                'ketersediaan' => $availability,
                'min_harga' => $minHarga ?: '',
                'max_harga' => $maxHarga ?: '',
                'warna' => $warna ?: '',
                'ukuran' => $ukuran ?: '',
            ],
            'priceRangeBounds' => [
                'min' => $minPossible,
                'max' => $maxPossible,
            ],
            'keranjang' => session()->get('keranjang', []),
        ]);
    }

    /**
     * Menampilkan detail halaman produk tunggal.
     */
    public function detail(string $slug): Response
    {
        $produk = Produk::with(['kategori', 'varian', 'spesifikasi', 'gambar'])
            ->where('slug', $slug)
            ->where('aktif', true)
            ->firstOrFail();

        $rekomendasi = Produk::with(['kategori'])
            ->where('aktif', true)
            ->where('id', '!=', $produk->id)
            ->take(4)
            ->get();

        return Inertia::render('DetailProduk', [
            'produk' => $produk,
            'rekomendasi' => $rekomendasi,
            'keranjang' => session()->get('keranjang', []),
        ]);
    }
}
