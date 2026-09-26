<?php

namespace App\Http\Controllers;

use App\Domains\Pembayaran\Services\MidtransService;
use App\Domains\Pengiriman\Services\BiteshipService;
use App\Models\Pesanan;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class PesananController extends Controller
{
    public function __construct(
        protected MidtransService $midtransService,
        protected BiteshipService $biteshipService
    ) {}

    /**
     * Helper normalisasi pencarian pesanan yang fleksibel (mendukung slash, dash, urlencoded).
     */
    protected function temukanPesanan(string $nomorPesanan, array $with = []): Pesanan
    {
        $decoded = trim(urldecode($nomorPesanan));
        $versiSlash = str_replace('-', '/', $decoded);
        $versiStrip = str_replace('/', '-', $decoded);

        $query = Pesanan::query();
        if (!empty($with)) {
            $query->with($with);
        }

        return $query->where(function ($q) use ($decoded, $versiSlash, $versiStrip) {
            $q->where('nomor_pesanan', $decoded)
              ->orWhere('nomor_pesanan', $versiSlash)
              ->orWhere('nomor_pesanan', $versiStrip)
              ->orWhereRaw('LOWER(nomor_pesanan) = ?', [strtolower($decoded)])
              ->orWhereRaw('LOWER(nomor_pesanan) = ?', [strtolower($versiSlash)])
              ->orWhereRaw('LOWER(nomor_pesanan) = ?', [strtolower($versiStrip)]);
        })->firstOrFail();
    }

    /**
     * Tampilkan halaman faktur/invoice pesanan beserta instruksi pembayaran native.
     */
    public function faktur(string $nomorPesanan): Response
    {
        $pesanan = $this->temukanPesanan($nomorPesanan, ['items.produk', 'items.varian', 'pembayaran', 'pengiriman']);

        // Proteksi Otorisasi: cegah akses silang akun jika pesanan terikat pada pengguna lain
        if (Auth::check() && $pesanan->pengguna_id && $pesanan->pengguna_id !== Auth::id()) {
            abort(403, 'Anda tidak memiliki hak akses untuk melihat faktur pesanan ini.');
        }

        // Auto-sync nomor_va / qr_string / status Midtrans jika belum terisi pada pesanan yang belum bayar
        if ($pesanan->status === 'belum_bayar' && $pesanan->pembayaran) {
            $perluSync = empty($pesanan->pembayaran->nomor_va) && empty($pesanan->pembayaran->qr_string);
            if ($perluSync) {
                try {
                    $midtransRes = $this->midtransService->cekStatus($pesanan->nomor_pesanan);
                    if (!empty($midtransRes['sukses']) && !empty($midtransRes['raw'])) {
                        $raw = $midtransRes['raw'];
                        $diupdate = false;

                        if (!empty($raw['va_numbers'][0]['va_number'])) {
                            $pesanan->pembayaran->nomor_va = $raw['va_numbers'][0]['va_number'];
                            $diupdate = true;
                        } elseif (!empty($raw['permata_va_number'])) {
                            $pesanan->pembayaran->nomor_va = $raw['permata_va_number'];
                            $diupdate = true;
                        }

                        if (!empty($raw['qr_string'])) {
                            $pesanan->pembayaran->qr_string = $raw['qr_string'];
                            $diupdate = true;
                        }

                        if (!empty($midtransRes['status_pesanan']) && $midtransRes['status_pesanan'] !== $pesanan->status) {
                            $pesanan->status = $midtransRes['status_pesanan'];
                            $pesanan->save();
                        }

                        if ($diupdate) {
                            $pesanan->pembayaran->save();
                            $pesanan->load('pembayaran');
                        }
                    }
                } catch (\Throwable $e) {
                    \Illuminate\Support\Facades\Log::warning("Gagal auto-sync Midtrans di faktur: " . $e->getMessage());
                }
            }
        }

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
        try {
            $pesanan = $this->temukanPesanan($nomorPesanan, ['pembayaran']);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
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
        $res = Cache::remember($cacheKey, 3, function () use ($pesanan) {
            return $this->midtransService->cekStatus($pesanan->nomor_pesanan);
        });

        if ($res['sukses'] && !empty($res['raw'])) {
            $raw = $res['raw'];
            if ($pesanan->pembayaran && empty($pesanan->pembayaran->nomor_va)) {
                if (!empty($raw['va_numbers'][0]['va_number'])) {
                    $pesanan->pembayaran->nomor_va = $raw['va_numbers'][0]['va_number'];
                    $pesanan->pembayaran->save();
                } elseif (!empty($raw['permata_va_number'])) {
                    $pesanan->pembayaran->nomor_va = $raw['permata_va_number'];
                    $pesanan->pembayaran->save();
                }
            }

            if (!empty($res['status_pesanan']) && $res['status_pesanan'] === 'akan_dikirim' && $pesanan->status === 'belum_bayar') {
                $pesanan->status = 'akan_dikirim';
                $pesanan->save();
                if ($pesanan->pembayaran) {
                    $pesanan->pembayaran->midtrans_status = 'settlement';
                    $pesanan->pembayaran->waktu_bayar = now();
                    $pesanan->pembayaran->save();
                }
            }
        }

        return response()->json([
            'sukses' => true,
            'status' => $pesanan->status,
            'midtrans' => $res,
        ]);
    }

    /**
     * Halaman lacak status pesanan & resi kurir terintegrasi Biteship API.
     */
    public function lacak(Request $request): Response
    {
        $nomorPesanan = $request->input('nomor');
        $pesanan = null;
        $tracking = null;

        if ($nomorPesanan) {
            try {
                $pesanan = $this->temukanPesanan($nomorPesanan, ['items.produk', 'items.varian', 'pembayaran', 'pengiriman']);
                if ($pesanan) {
                    $kurir = $pesanan->pengiriman->kurir ?? 'jne';
                    if (!empty($pesanan->pengiriman?->nomor_resi)) {
                        $tracking = $this->biteshipService->lacakPengiriman(
                            (string) $pesanan->pengiriman->nomor_resi,
                            (string) $kurir
                        );
                    } else {
                        // Smart Fulfillment Timeline saat resi kurir belum terbit
                        $isPaid = in_array($pesanan->status, ['akan_dikirim', 'dikirim', 'selesai']);
                        $tracking = [
                            'sukses' => true,
                            'status' => $isPaid ? 'allocated' : 'pending_payment',
                            'kurir' => strtoupper($kurir),
                            'layanan' => strtoupper($pesanan->pengiriman->layanan ?? 'REG'),
                            'is_pre_dispatch' => true,
                            'history' => [
                                [
                                    'note' => $isPaid
                                        ? 'Pesanan terverifikasi lunas. Sedang disiapkan & dikemas di Gudang Sleman, DI Yogyakarta.'
                                        : 'Pesanan telah berhasil dibuat. Menunggu konfirmasi pembayaran.',
                                    'updated_at' => $pesanan->created_at->toIso8601String(),
                                    'status' => $isPaid ? 'allocated' : 'order_placed',
                                ],
                            ],
                        ];
                    }
                }
            } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
                $pesanan = null;
            }
        }

        return Inertia::render('LacakPesanan', [
            'nomorPesanan' => $nomorPesanan,
            'pesanan'      => $pesanan,
            'tracking'     => $tracking,
            'keranjang'    => session()->get('keranjang', []),
        ]);
    }

    /**
     * Konfirmasi pesanan selesai (barang diterima oleh pembeli).
     */
    public function konfirmasiDiterima(string $nomorPesanan): RedirectResponse
    {
        $pesanan = $this->temukanPesanan($nomorPesanan);

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
        $pesanan = $this->temukanPesanan($nomorPesanan, ['pengiriman']);

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
        $pesanan = $this->temukanPesanan($nomorPesanan, ['pembayaran', 'pengiriman', 'items']);

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
        $pesanan = $this->temukanPesanan($nomorPesanan, ['items', 'pembayaran']);

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
                    Cache::forget("pengguna:akun:{$pesanan->pengguna_id}");
                    Cache::forget("pengguna:profil:{$pesanan->pengguna_id}");
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
        $pesanan = $this->temukanPesanan($nomorPesanan, ['pembayaran', 'pengiriman']);

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
        $pesanan = $this->temukanPesanan($nomorPesanan);

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
