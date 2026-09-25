<?php

namespace App\Http\Controllers;

use App\Models\Kategori;
use App\Models\Produk;
use Inertia\Inertia;
use Inertia\Response;

class BerandaController extends Controller
{
    public function index(): Response
    {
        // Kategori aktif untuk grid navigasi
        $kategori = Kategori::where('aktif', true)
            ->orderBy('urutan')
            ->select(['id', 'nama', 'slug', 'emoji'])
            ->get();

        // Best seller — produk dengan flag is_best_seller
        $produkBestSeller = Produk::with('varian')->where('aktif', true)
            ->where('is_best_seller', true)
            ->orderByDesc('terjual')
            ->take(8)
            ->get();

        // Produk terbaru (fallback jika best seller kosong)
        $produkTerbaru = Produk::with('varian')->where('aktif', true)
            ->orderByDesc('created_at')
            ->take(8)
            ->get();

        // Produk promo / diskon aktif
        $produkPromo = Produk::with('varian')->where('aktif', true)
            ->whereNotNull('harga_diskon')
            ->whereRaw('harga_diskon < harga_dasar')
            ->orderByDesc('terjual')
            ->take(4)
            ->get();

        return Inertia::render('Beranda', [
            'kategori'          => $kategori,
            'produkBestSeller'  => $produkBestSeller,
            'produkTerbaru'     => $produkTerbaru,
            'produkPromo'       => $produkPromo,
        ]);
    }
}
