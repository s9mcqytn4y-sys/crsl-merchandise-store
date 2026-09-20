<?php

namespace App\Http\Controllers;

use App\Models\Kategori;
use App\Models\Produk;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BerandaController extends Controller
{
    public function index(): Response
    {
        $kategori = Kategori::where('aktif', true)
            ->orderBy('urutan')
            ->get();

        $produkUnggulan = Produk::with(['kategori', 'varian'])
            ->where('aktif', true)
            ->get();

        $produkBts = Produk::with(['kategori'])
            ->where('aktif', true)
            ->whereIn('kategori_id', [1, 4, 12])
            ->take(6)
            ->get();

        $produkPromo = Produk::with(['kategori'])
            ->where('aktif', true)
            ->whereRaw('harga_diskon < harga_dasar')
            ->take(6)
            ->get();

        return Inertia::render('Home', [
            'kategori' => $kategori,
            'produkUnggulan' => $produkUnggulan,
            'produkBts' => $produkBts,
            'produkPromo' => $produkPromo,
            'keranjang' => session()->get('keranjang', []),
        ]);
    }
}
