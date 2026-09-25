<?php

namespace App\Http\Controllers;

use App\Models\AlamatPengguna;
use App\Models\Pesanan;
use App\Models\Wishlist;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AkunController extends Controller
{
    public function index(Request $request): Response
    {
        return $this->renderAccount($request, 'dashboard');
    }

    public function myinfo(Request $request): Response
    {
        return $this->renderAccount($request, 'profile');
    }

    private function renderAccount(Request $request, string $defaultView): Response
    {
        $pengguna = auth()->user();
        $initialView = $request->query('view', $defaultView);

        if (!$pengguna) {
            return Inertia::render('Akun', [
                'user'            => null,
                'orders'          => [],
                'wishlists'       => [],
                'loyalty'         => [
                    'tier'          => 'Non-Member',
                    'progress_text' => 'Spend Rp 200,000 more to reach New Freen',
                ],
                'vouchers'        => [],
                'reseller_status' => null,
                'addresses'       => [],
                'initialView'     => $initialView,
            ]);
        }

        // Ambil riwayat pesanan pengguna
        $rawPesanan = Pesanan::with('item')
            ->where('pengguna_id', $pengguna->id)
            ->orderBy('created_at', 'desc')
            ->get();

        $statusMapping = [
            'belum_bayar'   => 'Belum Bayar',
            'akan_dikirim'  => 'Perlu Dikirim',
            'dikirim'       => 'Dikirim',
            'selesai'       => 'Selesai',
            'dibatalkan'    => 'Dibatalkan',
            'dikembalikan'  => 'Dikembalikan',
        ];

        $orders = $rawPesanan->map(function ($p) use ($statusMapping) {
            return [
                'id'           => $p->id,
                'order_number' => $p->nomor_pesanan,
                'created_at'   => $p->created_at->translatedFormat('d M Y') ?? $p->created_at->format('d M Y'),
                'status'       => $statusMapping[$p->status] ?? 'Diproses',
                'status_raw'   => $p->status,
                'total'        => (float) $p->total,
                'item_count'   => $p->item->sum('jumlah'),
                'items'        => $p->item->map(function ($it) {
                    return [
                        'id'     => $it->id,
                        'nama'   => $it->nama_produk,
                        'varian' => trim(($it->warna ?? '') . ' ' . ($it->ukuran ?? '')),
                        'gambar' => $it->gambar,
                        'harga'  => (float) $it->harga,
                        'jumlah' => (int) $it->jumlah,
                    ];
                }),
            ];
        });

        // Ambil wishlist pengguna
        $rawWishlist = Wishlist::with('produk')
            ->where('pengguna_id', $pengguna->id)
            ->get();

        $wishlists = $rawWishlist->map(function ($w) {
            $prod = $w->produk;
            return [
                'id'     => $w->id,
                'nama'   => $prod ? $prod->nama : 'Produk',
                'gambar' => $prod ? $prod->gambar_utama : null,
                'harga'  => $prod ? (float) ($prod->harga_diskon ?? $prod->harga_dasar) : 0,
                'slug'   => $prod ? $prod->slug : '',
            ];
        });

        // Ambil alamat pengiriman pengguna
        $addresses = AlamatPengguna::where('pengguna_id', $pengguna->id)
            ->orderByDesc('adalah_utama')
            ->get()
            ->map(function ($a) {
                return [
                    'id'             => $a->id,
                    'nama_penerima'  => $a->nama_penerima,
                    'telepon'        => $a->telepon,
                    'email'          => $a->email ?? '',
                    'alamat_lengkap' => $a->alamat_lengkap . ', ' . $a->kecamatan . ', ' . $a->kota . ', ' . $a->provinsi . ' ' . $a->kode_pos,
                ];
            });

        return Inertia::render('Akun', [
            'user' => [
                'name'        => $pengguna->name,
                'email'       => $pengguna->email,
                'birth_day'   => $pengguna->birth_day ?? '14',
                'birth_month' => $pengguna->birth_month ?? '09',
                'birth_year'  => $pengguna->birth_year ?? '2000',
            ],
            'orders'          => $orders,
            'wishlists'       => $wishlists,
            'loyalty'         => [
                'tier'          => 'Non-Member',
                'progress_text' => 'Belanja Rp 200.000 lagi untuk mencapai New Freen',
            ],
            'vouchers'        => [
                [
                    'id' => 1,
                    'judul' => 'PAYDAY MEMBERSHIP',
                    'kode' => 'CRSLYAY25',
                    'deskripsi' => 'Diskon 25% Spesial Anggota',
                    'sisa_waktu' => '04:25:00',
                ]
            ],
            'reseller_status' => 'Pengajuan Reseller Sedang Ditinjau',
            'addresses'       => $addresses,
            'initialView'     => $initialView,
        ]);
    }

    public function perbaruiProfil(Request $request): RedirectResponse
    {
        $pengguna = auth()->user();
        if (!$pengguna) {
            return redirect()->route('akun')->with('error', 'Silakan masuk terlebih dahulu.');
        }

        $validated = $request->validate([
            'name' => 'required|string|max:100',
        ]);

        $pengguna->name = $validated['name'];
        $pengguna->save();

        return redirect()->back()->with('sukses', 'Profil berhasil diperbarui!');
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
                'produk_id'   => $validated['produk_id'],
            ]);
            $msg = 'Produk disimpan ke wishlist!';
        }

        return redirect()->back()->with('sukses', $msg);
    }
}
