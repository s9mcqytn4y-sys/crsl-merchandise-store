<?php

namespace App\Http\Controllers;

use App\Domains\Payment\Services\MidtransService;
use App\Models\Pesanan;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class PesananController extends Controller
{
    public function __construct(
        protected MidtransService $midtransService
    ) {}

    /**
     * Tampilkan halaman faktur/invoice pesanan beserta instruksi pembayaran native.
     */
    public function faktur(string $nomorPesanan): Response
    {
        $nomorPesananAsli = str_replace('-', '/', $nomorPesanan);

        $pesanan = Pesanan::with(['items', 'pembayaran', 'pengiriman'])
            ->where('nomor_pesanan', $nomorPesananAsli)
            ->orWhere('nomor_pesanan', $nomorPesanan)
            ->firstOrFail();

        return Inertia::render('Faktur', [
            'pesanan' => $pesanan,
            'is_baru' => session()->has('sukses'),
            'keranjang' => session()->get('keranjang', []),
        ]);
    }

    /**
     * Endpoint API pengecekan status pembayaran real-time dari Midtrans API.
     */
    public function cekStatusRealtime(string $nomorPesanan): JsonResponse
    {
        $nomorPesananAsli = str_replace('-', '/', $nomorPesanan);
        $pesanan = Pesanan::with(['pembayaran'])
            ->where('nomor_pesanan', $nomorPesananAsli)
            ->orWhere('nomor_pesanan', $nomorPesanan)
            ->first();

        if (!$pesanan) {
            return response()->json(['sukses' => false, 'pesan' => 'Pesanan tidak ditemukan'], 404);
        }

        // Jika pesanan sudah berada di status terminal (sudah lunas / dikirim / selesai / batal),
        // segera kembalikan status dari DB tanpa perlu request HTTP outbound ke Midtrans
        if (in_array($pesanan->status, ['akan_dikirim', 'dikirim', 'selesai', 'dibatalkan', 'kedaluwarsa'])) {
            return response()->json([
                'sukses' => true,
                'status' => $pesanan->status,
                'midtrans' => [
                    'sukses' => true,
                    'status_pesanan' => $pesanan->status,
                ],
            ]);
        }

        // Cache 3 detik untuk mencegah burst / rate limit dari polling interval pendek
        $cacheKey = "pesanan:midtrans_status:" . md5($pesanan->nomor_pesanan);
        $res = \Illuminate\Support\Facades\Cache::remember($cacheKey, 3, function () use ($pesanan) {
            return $this->midtransService->cekStatus($pesanan->nomor_pesanan);
        });

        if ($res['sukses'] && !empty($res['status_pesanan'])) {
            if ($res['status_pesanan'] === 'akan_dikirim' && $pesanan->status === 'belum_bayar') {
                $pesanan->status = 'akan_dikirim';
                $pesanan->save();
            }
        }

        return response()->json([
            'sukses' => true,
            'status' => $pesanan->status,
            'midtrans' => $res,
        ]);
    }

    /**
     * Halaman lacak status pesanan & resi kurir.
     */
    public function lacak(Request $request): Response
    {
        $nomorPesanan = $request->input('nomor');
        $pesanan = null;

        if ($nomorPesanan) {
            $pesanan = Pesanan::with(['items', 'pembayaran', 'pengiriman'])
                ->where('nomor_pesanan', trim($nomorPesanan))
                ->first();
        }

        return Inertia::render('LacakPesanan', [
            'nomorPesanan' => $nomorPesanan,
            'pesanan' => $pesanan,
            'keranjang' => session()->get('keranjang', []),
        ]);
    }

    /**
     * Konfirmasi pesanan selesai (barang diterima oleh pembeli).
     */
    public function konfirmasiDiterima(string $nomorPesanan): RedirectResponse
    {
        $nomorPesananAsli = str_replace('-', '/', $nomorPesanan);

        $pesanan = Pesanan::where('nomor_pesanan', $nomorPesananAsli)
            ->orWhere('nomor_pesanan', $nomorPesanan)
            ->firstOrFail();

        if (Auth::check() && $pesanan->pengguna_id && $pesanan->pengguna_id !== Auth::id()) {
            return redirect()->back()->with('error', 'Anda tidak memiliki akses ke pesanan ini.');
        }

        $pesanan->status = 'selesai';
        $pesanan->save();

        // Tambah poin loyalitas & akumulasi total belanja
        if ($pesanan->pengguna_id) {
            $loyalitas = \App\Models\PenggunaLoyalitas::firstOrCreate(
                ['pengguna_id' => $pesanan->pengguna_id],
                ['poin' => 0, 'total_belanja' => 0]
            );

            $poinReward = $pesanan->poin_didapat ?: (int)floor($pesanan->total / 10000) * 10;
            $loyalitas->poin += $poinReward;
            $loyalitas->total_belanja += (float)$pesanan->total;
            $loyalitas->save();

            \Illuminate\Support\Facades\Cache::forget("pengguna:akun:{$pesanan->pengguna_id}");
            \Illuminate\Support\Facades\Cache::forget("pengguna:profil:{$pesanan->pengguna_id}");
        }

        return redirect()->back()->with('sukses', "Pesanan {$pesanan->nomor_pesanan} telah selesai. Terima kasih!");
    }

    /**
     * Ubah detail penerima & catatan pengiriman langsung dari halaman faktur.
     */
    public function ubahAlamat(Request $request, string $nomorPesanan): RedirectResponse
    {
        $nomorPesananAsli = str_replace('-', '/', $nomorPesanan);

        $pesanan = Pesanan::with(['pengiriman'])
            ->where('nomor_pesanan', $nomorPesananAsli)
            ->orWhere('nomor_pesanan', $nomorPesanan)
            ->firstOrFail();

        if (in_array($pesanan->status, ['dikirim', 'selesai', 'dibatalkan'])) {
            return redirect()->back()->with('error', 'Pesanan yang sudah diproses pengiriman atau dibatalkan tidak dapat diubah alamatnya.');
        }

        $validated = $request->validate([
            'nama_penerima' => 'required|string|max:255',
            'telepon' => 'required|string|max:25',
            'alamat_lengkap' => 'required|string|max:1000',
            'catatan' => 'nullable|string|max:500',
        ]);

        if ($pesanan->pengiriman) {
            $currentPayload = $pesanan->pengiriman->json_payload ?? [];
            $currentPayload['nama_penerima'] = $validated['nama_penerima'];
            $currentPayload['telepon'] = $validated['telepon'];
            $currentPayload['alamat_lengkap'] = $validated['alamat_lengkap'];

            $pesanan->pengiriman->json_payload = $currentPayload;
            $pesanan->pengiriman->save();
        }

        if (isset($validated['catatan'])) {
            $pesanan->catatan = $validated['catatan'];
            $pesanan->save();
        }

        return redirect()->back()->with('sukses', 'Data penerima berhasil diperbarui.');
    }

    /**
     * Ganti metode pembayaran in-place dengan membatalkan tagihan lama dan membuat charge baru.
     */
    public function gantiMetodeBayar(Request $request, string $nomorPesanan): RedirectResponse
    {
        $nomorPesananAsli = str_replace('-', '/', $nomorPesanan);

        $pesanan = Pesanan::with(['pembayaran', 'pengiriman', 'items'])
            ->where('nomor_pesanan', $nomorPesananAsli)
            ->orWhere('nomor_pesanan', $nomorPesanan)
            ->firstOrFail();

        if ($pesanan->status !== 'belum_bayar') {
            return redirect()->back()->with('error', 'Hanya pesanan berstatus Belum Bayar yang dapat diubah metode pembayarannya.');
        }

        $validated = $request->validate([
            'metode_pembayaran' => 'required|string',
        ]);

        $metodeBaru = strtolower(trim($validated['metode_pembayaran']));
        $metodeKey = str_replace('va_', '', $metodeBaru);

        try {
            // 1. Batalkan transaksi lama di Midtrans jika ada
            if ($pesanan->pembayaran && $pesanan->pembayaran->midtrans_status === 'pending') {
                $this->midtransService->batalkanTransaksi($pesanan->nomor_pesanan);
            }

            // 2. Siapkan data pembeli
            $payloadPengiriman = $pesanan->pengiriman?->json_payload ?? [];
            $pembeli = [
                'nama' => $payloadPengiriman['nama_penerima'] ?? ($pesanan->pengguna?->name ?? 'Adopter CRSL'),
                'email' => $payloadPengiriman['email'] ?? ($pesanan->pengguna?->email ?? 'adopter@crsl-store.id'),
                'telepon' => $payloadPengiriman['telepon'] ?? ($pesanan->pengguna?->telepon ?? '08123456789'),
            ];

            $pesananData = [
                'nomor_pesanan' => $pesanan->nomor_pesanan,
                'total' => $pesanan->total,
            ];

            // 3. Charge baru sesuai metode
            if ($metodeKey === 'qris' || $metodeKey === 'ovo') {
                $chargeRes = $this->midtransService->chargeQris($pesananData, $pembeli);
            } elseif ($metodeKey === 'mandiri') {
                $chargeRes = $this->midtransService->chargeMandiriBill($pesananData, $pembeli);
            } else {
                $chargeRes = $this->midtransService->chargeBankTransfer($metodeKey, $pesananData, $pembeli);
            }

            if (empty($chargeRes['sukses'])) {
                return redirect()->back()->with('error', $chargeRes['pesan'] ?? 'Gagal membuat tagihan baru ke Midtrans.');
            }

            // 4. Update tabel pesanan_pembayaran
            if ($pesanan->pembayaran) {
                $pesanan->pembayaran->update([
                    'metode_bayar' => $chargeRes['metode_bayar'] ?? strtoupper($metodeBaru),
                    'midtrans_id' => $chargeRes['transaction_id'] ?? null,
                    'midtrans_status' => $chargeRes['status_transaksi'] ?? 'pending',
                    'nomor_va' => $chargeRes['nomor_va'] ?? null,
                    'kode_biller' => $chargeRes['kode_biller'] ?? null,
                    'qr_string' => $chargeRes['qr_string'] ?? null,
                    'qr_code_url' => $chargeRes['qr_code_url'] ?? null,
                    'waktu_kedaluwarsa' => $chargeRes['waktu_kadaluarsa'] ?? now()->addMinutes(15),
                    'instruksi_bayar' => $chargeRes['instruksi_bayar'] ?? [],
                ]);
            }

            return redirect()->back()->with('sukses', "Metode pembayaran berhasil diubah ke {$chargeRes['metode_bayar']}.");
        } catch (\Throwable $e) {
            report($e);
            return redirect()->back()->with('error', 'Gagal mengganti metode pembayaran: ' . $e->getMessage());
        }
    }

    /**
     * Batalkan pesanan, kembalikan stok varian, dan pulihkan saldo poin loyalty serta voucher.
     */
    public function batalkanPesanan(string $nomorPesanan): RedirectResponse
    {
        $nomorPesananAsli = str_replace('-', '/', $nomorPesanan);

        $pesanan = Pesanan::with(['items', 'pembayaran'])
            ->where('nomor_pesanan', $nomorPesananAsli)
            ->orWhere('nomor_pesanan', $nomorPesanan)
            ->firstOrFail();

        if ($pesanan->status !== 'belum_bayar') {
            return redirect()->back()->with('error', 'Hanya pesanan yang belum dibayar yang dapat dibatalkan.');
        }

        try {
            DB::transaction(function () use ($pesanan) {
                // 1. Kembalikan stok varian produk
                foreach ($pesanan->items as $item) {
                    if ($item->produk_varian_id) {
                        \App\Models\ProdukVarian::where('id', $item->produk_varian_id)
                            ->increment('stok', $item->jumlah);
                    }
                }

                // 2. Kembalikan poin loyalitas jika digunakan
                if ($pesanan->pengguna_id && $pesanan->poin_digunakan > 0) {
                    $loyalitas = \App\Models\PenggunaLoyalitas::firstOrCreate(
                        ['pengguna_id' => $pesanan->pengguna_id],
                        ['poin' => 0, 'total_belanja' => 0]
                    );
                    $loyalitas->increment('poin', $pesanan->poin_digunakan);
                    \Illuminate\Support\Facades\Cache::forget("pengguna:akun:{$pesanan->pengguna_id}");
                    \Illuminate\Support\Facades\Cache::forget("pengguna:profil:{$pesanan->pengguna_id}");
                }

                // 3. Kembalikan kuota voucher
                if ($pesanan->kode_voucher) {
                    \App\Models\Voucher::where('kode', $pesanan->kode_voucher)->increment('kuota', 1);
                    \App\Models\VoucherTerpakai::where('pesanan_id', $pesanan->id)->delete();
                }

                // 4. Batalkan transaksi di Midtrans
                if ($pesanan->pembayaran) {
                    $this->midtransService->batalkanTransaksi($pesanan->nomor_pesanan);
                    $pesanan->pembayaran->midtrans_status = 'cancel';
                    $pesanan->pembayaran->save();
                }

                // 5. Update status pesanan
                $pesanan->status = 'dibatalkan';
                $pesanan->save();
            });

            return redirect()->back()->with('sukses', "Pesanan {$pesanan->nomor_pesanan} berhasil dibatalkan dan stok produk telah dikembalikan.");
        } catch (\Throwable $e) {
            report($e);
            return redirect()->back()->with('error', 'Gagal membatalkan pesanan: ' . $e->getMessage());
        }
    }

    /**
     * Refresh / Regenerate QRIS jika kode QRIS kedaluwarsa.
     */
    public function refreshQris(string $nomorPesanan): RedirectResponse
    {
        $nomorPesananAsli = str_replace('-', '/', $nomorPesanan);

        $pesanan = Pesanan::with(['pembayaran', 'pengiriman'])
            ->where('nomor_pesanan', $nomorPesananAsli)
            ->orWhere('nomor_pesanan', $nomorPesanan)
            ->firstOrFail();

        if ($pesanan->status !== 'belum_bayar') {
            return redirect()->back()->with('error', 'Kode QRIS tidak dapat diperbarui.');
        }

        try {
            $payloadPengiriman = $pesanan->pengiriman?->json_payload ?? [];
            $pembeli = [
                'nama' => $payloadPengiriman['nama_penerima'] ?? ($pesanan->pengguna?->name ?? 'Adopter CRSL'),
                'email' => $payloadPengiriman['email'] ?? ($pesanan->pengguna?->email ?? 'adopter@crsl-store.id'),
                'telepon' => $payloadPengiriman['telepon'] ?? ($pesanan->pengguna?->telepon ?? '08123456789'),
            ];

            $chargeRes = $this->midtransService->chargeQris([
                'nomor_pesanan' => $pesanan->nomor_pesanan,
                'total' => $pesanan->total,
            ], $pembeli);

            if (!empty($chargeRes['sukses']) && $pesanan->pembayaran) {
                $pesanan->pembayaran->update([
                    'qr_string' => $chargeRes['qr_string'] ?? null,
                    'qr_code_url' => $chargeRes['qr_code_url'] ?? null,
                    'waktu_kedaluwarsa' => $chargeRes['waktu_kadaluarsa'] ?? now()->addMinutes(15),
                ]);
                return redirect()->back()->with('sukses', 'Kode QRIS baru berhasil dimuat.');
            }

            return redirect()->back()->with('error', $chargeRes['pesan'] ?? 'Gagal memuat ulang kode QRIS.');
        } catch (\Throwable $e) {
            report($e);
            return redirect()->back()->with('error', 'Terjadi kesalahan saat memuat ulang QRIS.');
        }
    }

    /**
     * Simulasi pembayaran instan khusus environment development / testing lokal.
     */
    public function simulasiBayarDev(string $nomorPesanan): RedirectResponse
    {
        $nomorPesananAsli = str_replace('-', '/', $nomorPesanan);

        $pesanan = Pesanan::where('nomor_pesanan', $nomorPesananAsli)
            ->orWhere('nomor_pesanan', $nomorPesanan)
            ->firstOrFail();

        $pesanan->status = 'akan_dikirim';
        $pesanan->save();

        if ($pesanan->pembayaran) {
            $pesanan->pembayaran->midtrans_status = 'settlement';
            $pesanan->pembayaran->save();
        }

        if ($pesanan->pengguna_id) {
            \Illuminate\Support\Facades\Cache::forget("pengguna:akun:{$pesanan->pengguna_id}");
            \Illuminate\Support\Facades\Cache::forget("pengguna:profil:{$pesanan->pengguna_id}");
        }

        return redirect()->back()->with('sukses', 'Simulasi pembayaran berhasil! Status pesanan kini: Perlu Dikirim.');
    }
}
