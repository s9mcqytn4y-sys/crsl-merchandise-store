<?php

namespace App\Http\Controllers;

use App\Models\Produk;
use App\Models\ProdukVarian;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class KeranjangController extends Controller
{
    public function tambah(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'produk_id' => 'required|exists:produk,id',
            'varian_id' => 'nullable|exists:produk_varian,id',
            'jumlah' => 'required|integer|min:1',
            'ukuran' => 'nullable|string',
            'warna' => 'nullable|string',
        ]);

        $produk = Produk::findOrFail($validated['produk_id']);
        $varian = isset($validated['varian_id']) ? ProdukVarian::find($validated['varian_id']) : null;

        $keyKeranjang = $produk->id . '_' . ($varian?->id ?? 'default') . '_' . ($validated['ukuran'] ?? 'default');

        $keranjang = session()->get('keranjang', []);

        $hargaSatuan = $produk->harga_diskon ?? $produk->harga_dasar;
        if ($varian && $varian->harga_tambahan > 0) {
            $hargaSatuan += $varian->harga_tambahan;
        }

        if (isset($keranjang[$keyKeranjang])) {
            $keranjang[$keyKeranjang]['jumlah'] += $validated['jumlah'];
        } else {
            $keranjang[$keyKeranjang] = [
                'id' => $keyKeranjang,
                'produk_id' => $produk->id,
                'varian_id' => $varian?->id,
                'nama_produk' => $produk->nama,
                'harga' => $hargaSatuan,
                'gambar' => $varian?->gambar_varian ?? $produk->gambar_utama,
                'jumlah' => $validated['jumlah'],
                'ukuran' => $validated['ukuran'] ?? $varian?->ukuran ?? 'All Size',
                'warna' => $validated['warna'] ?? $varian?->nama_varian ?? 'Default',
                'sku' => $varian?->sku ?? 'CRSL-' . $produk->id,
            ];
        }

        session()->put('keranjang', $keranjang);

        return redirect()->back()->with('sukses', 'Produk berhasil ditambahkan ke keranjang!');
    }

    public function perbarui(Request $request, string $id): RedirectResponse
    {
        $validated = $request->validate([
            'jumlah' => 'required|integer|min:1',
        ]);

        $keranjang = session()->get('keranjang', []);

        if (isset($keranjang[$id])) {
            $keranjang[$id]['jumlah'] = $validated['jumlah'];
            session()->put('keranjang', $keranjang);
        }

        return redirect()->back();
    }

    public function hapus(string $id): RedirectResponse
    {
        $keranjang = session()->get('keranjang', []);

        if (isset($keranjang[$id])) {
            unset($keranjang[$id]);
            session()->put('keranjang', $keranjang);
        }

        return redirect()->back()->with('sukses', 'Produk dihapus dari keranjang.');
    }

    public function kosongkan(): RedirectResponse
    {
        session()->forget('keranjang');
        return redirect()->back();
    }
}
