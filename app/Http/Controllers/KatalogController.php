<?php

namespace App\Http\Controllers;

use App\Models\Kategori;
use App\Models\Produk;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class KatalogController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Produk::with(['kategori', 'varian', 'gambar'])->where('aktif', true);

        if ($request->has('kategori') && $request->get('kategori') !== 'all-products') {
            $catSlug = $request->get('kategori');
            $kategoriObj = Kategori::where('slug', $catSlug)->first();
            if ($kategoriObj) {
                $query->where('kategori_id', $kategoriObj->id);
            }
        }

        if ($request->has('cari') && !empty($request->get('cari'))) {
            $searchTerm = $request->get('cari');
            $query->where(function ($q) use ($searchTerm) {
                $q->where('nama', 'like', "%{$searchTerm}%")
                  ->orWhere('deskripsi', 'like', "%{$searchTerm}%");
            });
        }

        if ($request->has('urutkan')) {
            match ($request->get('urutkan')) {
                'harga_rendah' => $query->orderBy('harga_dasar', 'asc'),
                'harga_tinggi' => $query->orderBy('harga_dasar', 'desc'),
                'terbaru' => $query->orderBy('created_at', 'desc'),
                default => $query->orderBy('id', 'asc'),
            };
        } else {
            $query->orderBy('id', 'asc');
        }

        $produk = $query->get();
        $kategori = Kategori::where('aktif', true)->orderBy('urutan')->get();

        return Inertia::render('Katalog', [
            'produk' => $produk,
            'kategori' => $kategori,
            'filter' => [
                'kategori' => $request->get('kategori', 'all-products'),
                'cari' => $request->get('cari', ''),
                'urutkan' => $request->get('urutkan', 'default'),
            ],
            'keranjang' => session()->get('keranjang', []),
        ]);
    }

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
