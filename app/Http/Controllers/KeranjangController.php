<?php

namespace App\Http\Controllers;

use App\Domains\Keranjang\Services\KeranjangService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class KeranjangController extends Controller
{
    public function __construct(
        protected KeranjangService $keranjangService
    ) {}

    public function tambah(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'produk_id' => 'required|exists:produk,id',
            'varian_id' => 'nullable|exists:produk_varian,id',
            'jumlah' => 'required|integer|min:1',
        ]);

        $res = $this->keranjangService->tambahItem(
            (int)$validated['produk_id'],
            isset($validated['varian_id']) ? (int)$validated['varian_id'] : null,
            (int)$validated['jumlah'],
            auth()->id(),
            session()->getId()
        );

        if (!$res['sukses']) {
            return redirect()->back()->with('error', $res['pesan']);
        }

        return redirect()->back()->with('sukses', $res['pesan']);
    }

    public function perbarui(Request $request, string $id): RedirectResponse
    {
        $validated = $request->validate([
            'jumlah' => 'required|integer|min:1',
        ]);

        $this->keranjangService->perbaruiKuantitas($id, (int)$validated['jumlah'], auth()->id());

        return redirect()->back();
    }

    public function hapus(string $id): RedirectResponse
    {
        $this->keranjangService->hapusItem($id, auth()->id());

        return redirect()->back()->with('sukses', 'Item dihapus dari keranjang.');
    }

    public function kosongkan(): RedirectResponse
    {
        $this->keranjangService->kosongkan(auth()->id());

        return redirect()->back()->with('sukses', 'Keranjang dikosongkan.');
    }
}
