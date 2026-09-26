<?php

namespace App\Http\Controllers;

use App\Models\AlamatPengguna;
use App\Models\Pesanan;
use App\Models\TierLoyalitas;
use App\Models\Voucher;
use App\Models\Wishlist;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AkunController extends Controller
{
    /**
     * Halaman Dashboard Akun Pelanggan (crsl-store.id/account).
     * Menampilkan tampilan Guest jika belum login, atau tampilan Akun jika sudah login.
     */
    public function index(Request $request): Response
    {
        $pengguna = auth()->user();

        if (!$pengguna) {
            return Inertia::render('Akun', [
                'user'            => null,
                'orders'          => [],
                'wishlists'       => [],
                'loyalty'         => [
                    'tier'          => 'Non-Member',
                    'progress_text' => 'Spend Rp 200.000 more to reach New Freen',
                ],
                'vouchers'        => [],
                'reseller_status' => null,
                'addresses'       => [],
                'harusBukaLogin'  => $request->boolean('login') || $request->query('auth') === 'login',
            ]);
        }

        // Cache profil akun & relasi selama 10 menit dengan auto-invalidation
        $cacheKey = "pengguna:akun:{$pengguna->id}";
        $akunData = \Illuminate\Support\Facades\Cache::remember($cacheKey, now()->addMinutes(10), function () use ($pengguna) {
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
                'dibatalkan'    => 'Cancelled',
                'dikembalikan'  => 'Dikembalikan',
            ];

            $orders = $rawPesanan->map(function ($p) use ($statusMapping) {
                return [
                    'id'           => $p->id,
                    'order_number' => $p->nomor_pesanan,
                    'created_at'   => $p->created_at->format('M d, Y'),
                    'status'       => $statusMapping[$p->status] ?? ucfirst($p->status),
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
            })->all();

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
            })->all();

            // Hitung Loyalitas Dinamis dari Database
            $allTiers = TierLoyalitas::orderBy('syarat_belanja', 'asc')->get();
            $loyalitas = $pengguna->loyalitas;
            $totalBelanja = (float) ($loyalitas ? $loyalitas->total_belanja : 0);

            $currentTier = $allTiers->first();
            $nextTier = null;

            foreach ($allTiers as $t) {
                if ($totalBelanja >= $t->syarat_belanja) {
                    $currentTier = $t;
                } else {
                    $nextTier = $t;
                    break;
                }
            }

            $tierName = $currentTier ? $currentTier->nama : 'New Freen';
            if ($nextTier) {
                $selisih = $nextTier->syarat_belanja - $totalBelanja;
                $progressText = 'Spend Rp ' . number_format($selisih, 0, ',', '.') . ' more to reach ' . $nextTier->nama;
            } else {
                $progressText = 'You have reached the highest tier!';
            }

            // Ambil Voucher Aktif Dinamis dari Database
            $rawVouchers = Voucher::where('aktif', true)
                ->where(function ($q) {
                    $q->whereNull('berlaku_sampai')
                      ->orWhere('berlaku_sampai', '>=', now());
                })
                ->orderBy('created_at', 'desc')
                ->get();

            $vouchers = $rawVouchers->map(function ($v) {
                $sisaWaktu = 'Berlaku';
                if ($v->berlaku_sampai) {
                    $diff = now()->diff($v->berlaku_sampai);
                    if ($diff->days > 0) {
                        $sisaWaktu = "{$diff->days}d left";
                    } else {
                        $sisaWaktu = sprintf("%02d:%02d:%02d left", $diff->h, $diff->i, $diff->s);
                    }
                }

                return [
                    'id'       => $v->id,
                    'title'    => $v->judul,
                    'code'     => $v->kode,
                    'discount' => $v->tipe === 'persen' ? "{$v->nilai}%" : 'Rp ' . number_format($v->nilai, 0, ',', '.'),
                    'timeLeft' => $sisaWaktu,
                ];
            })->all();

            return [
                'orders'    => $orders,
                'wishlists' => $wishlists,
                'loyalty'   => [
                    'tier'          => $tierName,
                    'progress_text' => $progressText,
                    'points'        => $loyalitas ? (int) $loyalitas->poin : 0,
                    'total_spend'   => $totalBelanja,
                    'tiers'         => $allTiers->map(fn ($t) => [
                        'id'             => $t->id,
                        'nama'           => $t->nama,
                        'syarat_belanja' => (float) $t->syarat_belanja,
                        'multiplier'     => (float) ($t->multiplier_poin ?? 1.0),
                        'deskripsi'      => $t->deskripsi,
                    ])->all(),
                ],
                'vouchers'  => $vouchers,
            ];
        });

        return Inertia::render('Akun', [
            'user' => [
                'name'        => $pengguna->name,
                'email'       => $pengguna->email,
                'phone'       => $pengguna->telepon,
                'birth_day'   => $pengguna->birth_day ?? '14',
                'birth_month' => $pengguna->birth_month ?? '09',
                'birth_year'  => $pengguna->birth_year ?? '2003',
            ],
            'orders'          => $akunData['orders'],
            'wishlists'       => $akunData['wishlists'],
            'loyalty'         => $akunData['loyalty'],
            'vouchers'        => $akunData['vouchers'],
            'reseller_status' => 'Settings Requested',
            'flash_message'   => session('login_success') ? 'Login Success' : null,
        ]);
    }

    /**
     * Halaman Informasi Profil Pelanggan (crsl-store.id/profile/myinfo).
     */
    public function infoProfil(Request $request): Response|RedirectResponse
    {
        $pengguna = auth()->user();
        if (!$pengguna) {
            return redirect()->route('account', ['login' => 1]);
        }

        return Inertia::render('ProfileMyInfo', [
            'user' => [
                'name'        => $pengguna->name,
                'email'       => $pengguna->email,
                'phone'       => $pengguna->telepon,
                'birth_day'   => $pengguna->birth_day ?? '14',
                'birth_month' => $pengguna->birth_month ?? '09',
                'birth_year'  => $pengguna->birth_year ?? '2003',
            ],
        ]);
    }

    /**
     * Halaman Informasi Pengiriman & Multi-Alamat (crsl-store.id/profile/delivery).
     */
    public function infoPengiriman(Request $request): Response|RedirectResponse
    {
        $pengguna = auth()->user();
        if (!$pengguna) {
            return redirect()->route('account', ['login' => 1]);
        }

        $addresses = AlamatPengguna::where('pengguna_id', $pengguna->id)
            ->orderByDesc('adalah_utama')
            ->orderByDesc('id')
            ->get()
            ->map(function ($a) {
                return [
                    'id'             => $a->id,
                    'label'          => $a->label ?? 'Rumah',
                    'nama_penerima'  => $a->nama_penerima,
                    'telepon'        => $a->telepon,
                    'email'          => $a->email ?? '',
                    'area_id'        => $a->area_id ?? '',
                    'provinsi'       => $a->provinsi ?? '',
                    'kota'           => $a->kota ?? '',
                    'kecamatan'      => $a->kecamatan ?? '',
                    'kelurahan'      => $a->kelurahan ?? '',
                    'kode_pos'       => $a->kode_pos ?? '',
                    'alamat_lengkap' => $a->alamat_lengkap,
                    'format_lengkap' => $a->alamat_lengkap . ', ' . $a->kota . ', ' . $a->kecamatan . ', ' . ($a->provinsi ?? 'Indonesia'),
                    'adalah_utama'   => (bool) $a->adalah_utama,
                ];
            });

        return Inertia::render('ProfileDelivery', [
            'user' => [
                'name'  => $pengguna->name,
                'email' => $pengguna->email,
            ],
            'addresses' => $addresses,
        ]);
    }

    /**
     * Halaman Informasi Akun (crsl-store.id/profile/account).
     */
    public function infoAkun(Request $request): Response|RedirectResponse
    {
        $pengguna = auth()->user();
        if (!$pengguna) {
            return redirect()->route('account', ['login' => 1]);
        }

        return Inertia::render('ProfileAccount', [
            'user' => [
                'name'  => $pengguna->name,
                'email' => $pengguna->email,
            ],
        ]);
    }

    /**
     * Memperbarui Nama dan Tanggal Lahir Pengguna.
     */
    public function perbaruiProfil(Request $request): RedirectResponse
    {
        $pengguna = auth()->user();
        if (!$pengguna) {
            return redirect()->route('account', ['login' => 1]);
        }

        $validated = $request->validate([
            'name'        => 'required|string|max:100',
            'birth_day'   => 'nullable|string|max:2',
            'birth_month' => 'nullable|string|max:2',
            'birth_year'  => 'nullable|string|max:4',
        ]);

        $pengguna->name = $validated['name'];
        if (isset($validated['birth_day'])) {
            $pengguna->birth_day = $validated['birth_day'];
        }
        if (isset($validated['birth_month'])) {
            $pengguna->birth_month = $validated['birth_month'];
        }
        if (isset($validated['birth_year'])) {
            $pengguna->birth_year = $validated['birth_year'];
        }
        $pengguna->save();
        $this->flushUserCache($pengguna->id);

        return redirect()->back()->with('sukses', 'Profil berhasil diperbarui!');
    }

    /**
     * Helper invalidasi cache data pengguna.
     */
    private function flushUserCache(int $userId): void
    {
        \Illuminate\Support\Facades\Cache::forget("pengguna:akun:{$userId}");
        \Illuminate\Support\Facades\Cache::forget("pengguna:profil:{$userId}");
    }

    /**
     * Menyimpan Alamat Pengiriman Baru.
     */
    public function simpanAlamat(Request $request): RedirectResponse
    {
        $pengguna = auth()->user();
        if (!$pengguna) {
            return redirect()->route('account', ['login' => 1]);
        }

        $validated = $request->validate([
            'label'          => 'nullable|string|max:50',
            'nama_penerima'  => 'required|string|max:100',
            'telepon'        => 'required|string|max:25',
            'email'          => 'nullable|email|max:100',
            'area_id'        => 'nullable|string|max:64',
            'provinsi'       => 'nullable|string|max:100',
            'kota'           => 'nullable|string|max:100',
            'kecamatan'      => 'nullable|string|max:100',
            'kelurahan'      => 'nullable|string|max:100',
            'kode_pos'       => 'nullable|string|max:10',
            'alamat_lengkap' => 'required|string|max:500',
            'adalah_utama'   => 'boolean',
        ]);

        $isUtama = $request->boolean('adalah_utama');

        // Jika alamat pertama pengguna atau dipilih jadi utama, reset lainnya
        $alamatPertama = AlamatPengguna::where('pengguna_id', $pengguna->id)->doesntExist();
        if ($isUtama || $alamatPertama) {
            $isUtama = true;
            AlamatPengguna::where('pengguna_id', $pengguna->id)->update(['adalah_utama' => false]);
        }

        AlamatPengguna::create([
            'pengguna_id'    => $pengguna->id,
            'label'          => $validated['label'] ?? 'Alamat',
            'nama_penerima'  => $validated['nama_penerima'],
            'telepon'        => $validated['telepon'],
            'email'          => $validated['email'] ?? $pengguna->email,
            'negara'         => 'Indonesia',
            'area_id'        => $validated['area_id'] ?? null,
            'provinsi'       => $validated['provinsi'] ?? 'DKI Jakarta',
            'kota'           => $validated['kota'] ?? 'Jakarta Pusat',
            'kecamatan'      => $validated['kecamatan'] ?? 'Johar Baru',
            'kelurahan'      => $validated['kelurahan'] ?? null,
            'kode_pos'       => $validated['kode_pos'] ?? '10560',
            'alamat_lengkap' => $validated['alamat_lengkap'],
            'adalah_utama'   => $isUtama,
        ]);
        $this->flushUserCache($pengguna->id);

        return redirect()->back()->with('sukses', 'Alamat pengiriman berhasil ditambahkan!');
    }

    /**
     * Memperbarui Alamat Pengiriman yang Sudah Ada.
     */
    public function perbaruiAlamat(Request $request, int $id): RedirectResponse
    {
        $pengguna = auth()->user();
        if (!$pengguna) {
            return redirect()->route('account', ['login' => 1]);
        }

        $alamat = AlamatPengguna::where('pengguna_id', $pengguna->id)->findOrFail($id);

        $validated = $request->validate([
            'label'          => 'nullable|string|max:50',
            'nama_penerima'  => 'required|string|max:100',
            'telepon'        => 'required|string|max:25',
            'email'          => 'nullable|email|max:100',
            'area_id'        => 'nullable|string|max:64',
            'provinsi'       => 'nullable|string|max:100',
            'kota'           => 'nullable|string|max:100',
            'kecamatan'      => 'nullable|string|max:100',
            'kelurahan'      => 'nullable|string|max:100',
            'kode_pos'       => 'nullable|string|max:10',
            'alamat_lengkap' => 'required|string|max:500',
            'adalah_utama'   => 'boolean',
        ]);

        $isUtama = $request->boolean('adalah_utama');
        if ($isUtama) {
            AlamatPengguna::where('pengguna_id', $pengguna->id)->where('id', '!=', $id)->update(['adalah_utama' => false]);
        }

        $alamat->update([
            'label'          => $validated['label'] ?? $alamat->label,
            'nama_penerima'  => $validated['nama_penerima'],
            'telepon'        => $validated['telepon'],
            'email'          => $validated['email'] ?? $alamat->email,
            'area_id'        => $validated['area_id'] ?? $alamat->area_id,
            'provinsi'       => $validated['provinsi'] ?? $alamat->provinsi,
            'kota'           => $validated['kota'] ?? $alamat->kota,
            'kecamatan'      => $validated['kecamatan'] ?? $alamat->kecamatan,
            'kelurahan'      => $validated['kelurahan'] ?? $alamat->kelurahan,
            'kode_pos'       => $validated['kode_pos'] ?? $alamat->kode_pos,
            'alamat_lengkap' => $validated['alamat_lengkap'],
            'adalah_utama'   => $isUtama,
        ]);
        $this->flushUserCache($pengguna->id);

        return redirect()->back()->with('sukses', 'Alamat pengiriman berhasil diperbarui!');
    }

    /**
     * Menghapus Alamat Pengiriman.
     */
    public function hapusAlamat(int $id): RedirectResponse
    {
        $pengguna = auth()->user();
        if (!$pengguna) {
            return redirect()->route('account', ['login' => 1]);
        }

        $alamat = AlamatPengguna::where('pengguna_id', $pengguna->id)->findOrFail($id);
        $wasUtama = $alamat->adalah_utama;
        $alamat->delete();

        // Jika alamat utama dihapus, jadikan alamat berikutnya sebagai utama
        if ($wasUtama) {
            $nextAlamat = AlamatPengguna::where('pengguna_id', $pengguna->id)->first();
            if ($nextAlamat) {
                $nextAlamat->update(['adalah_utama' => true]);
            }
        }
        $this->flushUserCache($pengguna->id);

        return redirect()->back()->with('sukses', 'Alamat berhasil dihapus!');
    }

    /**
     * Menjadikan Alamat Tertentu Sebagai Alamat Utama.
     */
    public function jadikanAlamatUtama(int $id): RedirectResponse
    {
        $pengguna = auth()->user();
        if (!$pengguna) {
            return redirect()->route('account', ['login' => 1]);
        }

        AlamatPengguna::where('pengguna_id', $pengguna->id)->update(['adalah_utama' => false]);
        AlamatPengguna::where('pengguna_id', $pengguna->id)->where('id', $id)->update(['adalah_utama' => true]);
        $this->flushUserCache($pengguna->id);

        return redirect()->back()->with('sukses', 'Alamat utama berhasil diperbarui!');
    }

    /**
     * Menambah atau Menghapus Wishlist Produk.
     */
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
        $this->flushUserCache($penggunaId);

        return redirect()->back()->with('sukses', $msg);
    }

    /**
     * Tautkan pesanan tamu (guest checkout) ke akun pengguna aktif.
     */
    public function klaimPesananTamu(Request $request): RedirectResponse
    {
        $user = auth()->user();
        if (!$user) {
            return redirect()->route('account')->with('error', 'Silakan login terlebih dahulu untuk menautkan pesanan.');
        }

        $validated = $request->validate([
            'nomor_pesanan' => 'nullable|string|max:100',
            'email'         => 'nullable|email|max:255',
            'telepon'       => 'nullable|string|max:50',
        ]);

        $nomorInput = trim($validated['nomor_pesanan'] ?? '');
        $emailInput = trim($validated['email'] ?? $user->email);
        $teleponInput = trim($validated['telepon'] ?? ($user->telepon ?? ''));

        if (empty($nomorInput) && empty($emailInput) && empty($teleponInput)) {
            return redirect()->back()->with('error', 'Mohon masukkan nomor pesanan, email, atau nomor telepon.');
        }

        $query = Pesanan::with('pengiriman')->whereNull('pengguna_id');

        if (!empty($nomorInput)) {
            $query->where(function ($q) use ($nomorInput) {
                $q->where('nomor_pesanan', $nomorInput)
                  ->orWhere('nomor_pesanan', str_replace('-', '/', $nomorInput));
            });
        } else {
            $query->where(function ($q) use ($emailInput, $teleponInput) {
                if (!empty($emailInput)) {
                    $q->whereRaw("json_payload->>'email' ILIKE ?", ['%' . $emailInput . '%']);
                }
                if (!empty($teleponInput)) {
                    $q->orWhereRaw("json_payload->>'telepon' ILIKE ?", ['%' . $teleponInput . '%']);
                }
            });
        }

        $orders = $query->get();

        if ($orders->isEmpty()) {
            return redirect()->back()->with('error', 'Tidak ditemukan pesanan tamu yang cocok untuk ditautkan.');
        }

        $claimedCount = 0;
        foreach ($orders as $order) {
            $order->pengguna_id = $user->id;
            $order->save();
            $claimedCount++;
        }

        $this->flushUserCache($user->id);

        return redirect()->back()->with('sukses', "Berhasil menautkan {$claimedCount} pesanan ke akun Anda!");
    }
}
