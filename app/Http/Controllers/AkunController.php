<?php

namespace App\Http\Controllers;

use App\Models\Pesanan;
use App\Models\Wishlist;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AkunController extends Controller
{
    public function index(): Response
    {
        $penggunaId = auth()->id();

        $pesananList = $penggunaId
            ? Pesanan::with('item')->where('pengguna_id', $penggunaId)->orderBy('created_at', 'desc')->get()
            : Pesanan::with('item')->orderBy('created_at', 'desc')->take(3)->get();

        $wishlistList = $penggunaId
            ? Wishlist::with('produk')->where('pengguna_id', $penggunaId)->get()
            : [];

        return Inertia::render('Account', [
            'pengguna' => auth()->user() ?? [
                'name' => 'CRSL Bestie',
                'email' => 'bestie@crslstore.com',
                'phone' => '+62 812-3456-7890',
            ],
            'pesananList' => $pesananList,
            'wishlistList' => $wishlistList,
            'keranjang' => session()->get('keranjang', []),
        ]);
    }

    public function toggleWishlist(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'produk_id' => 'required|exists:produk,id',
        ]);

        $penggunaId = auth()->id();
        if (!$penggunaId) {
            return redirect()->back()->with('error', 'Silakan login untuk menyimpan wishlist.');
        }

        $ada = Wishlist::where('pengguna_id', $penggunaId)
            ->where('produk_id', $validated['produk_id'])
            ->first();

        if ($ada) {
            $ada->delete();
            $msg = 'Produk dihapus dari wishlist.';
        } else {
            Wishlist::create([
                'pengguna_id' => $penggunaId,
                'produk_id' => $validated['produk_id'],
            ]);
            $msg = 'Produk disimpan ke wishlist!';
        }

        return redirect()->back()->with('sukses', $msg);
    }
}
