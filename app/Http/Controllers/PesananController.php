<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Domains\Inventori\Services\InventoriService;
use App\Domains\Pembayaran\Services\MidtransService;
use App\Domains\Pengiriman\Jobs\AlokasiPengirimanBiteshipJob;
use App\Domains\Pengiriman\Services\BiteshipService;
use App\Models\PenggunaLoyalitas;
use App\Models\Pesanan;
use App\Models\RiwayatPoin;
use App\Models\Voucher;
use App\Models\VoucherTerpakai;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class PesananController extends Controller
{
    public function __construct(
        protected MidtransService $midtransService,
        protected BiteshipService $biteshipService,
        protected InventoriService $inventoriService
    ) {}

    /**
     * Normalisasi payload pengiriman dari JSON String maupun Array.
     */
    protected function getPengirimanPayload(?Pesanan $pesanan): array
    {
        $raw = $pesanan?->pengiriman?->json_payload;
        if (is_array($raw)) {
            return $raw;
        }
        if (is_string($raw) && !empty($raw)) {
            try {
                return (array) json_decode($raw, true);
            } catch (\Throwable) {
                return [];
            }
        }
        return [];
    }

    /**
     * Helper pencarian invoice fleksibel.
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
     * Halaman faktur/invoice pesanan.
     */
    public function faktur(string $nomorPesanan): Response
    {
        $pesanan = $this->temukanPesanan($nomorPesanan, ['items.produk', 'items.varian', 'pembayaran', 'pengiriman']);

        if ($pesanan->pengguna_id && $pesanan->pengguna_id !== Auth::id()) {
            abort(403, 'Anda tidak memiliki hak akses untuk melihat faktur pesanan ini.');
        }

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
                    Log::warning("Gagal auto-sync Midtrans di faktur: " . $e->getMessage());
                }
            }
        }

        return Inertia::render('Faktur', [
            'pesanan'   => $pesanan,
            'is_baru'   => session()->has('sukses'),
            'keranjang' => session()->get('keranjang', []),
        ]);
    }

    /**
     * Endpoint API pengecekan status pembayaran real-time dari Midtrans.
     */
    public function cekStatusRealtime(string $nomorPesanan): JsonResponse
    {
        try {
            $pesanan = $this->temukanPesanan($nomorPesanan, ['pembayaran', 'pengiriman']);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException) {
            return response()->json(['sukses' => false, 'pesan' => 'Pesanan tidak ditemukan'], 404);
        }

        if (in_array($pesanan->status, ['akan_dikirim', 'dikirim', 'selesai', 'dibatalkan', 'kedaluwarsa'])) {
            return response()->json([
                'sukses'   => true,
                'status'   => $pesanan->status,
                'midtrans' => [
                    'sukses'         => true,
                    'status_pesanan' => $pesanan->status,
                ],
            ]);
        }

        $cacheKey = "pesanan:midtrans_status:" . md5($pesanan->nomor_pesanan);
        $res = Cache::remember($cacheKey, 3, function () use ($pesanan) {
            return $this->midtransService->cekStatus($pesanan->nomor_pesanan);
        });

        if (!empty($res['sukses']) && !empty($res['raw'])) {
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
                $rawGrossAmount = (float) ($raw['gross_amount'] ?? 0);

                if ((int) round((float) $pesanan->total) !== (int) round($rawGrossAmount)) {
                    Log::critical("SECURITY ALERT: Polling mismatch nominal untuk {$pesanan->nomor_pesanan}. DB: {$pesanan->total}, Gateway: {$rawGrossAmount}");

                    $pesanan->status = 'menunggu_verifikasi_manual';
                    $pesanan->save();

                    return response()->json([
                        'sukses' => false,
                        'status' => 'menunggu_verifikasi_manual',
                        'pesan'  => 'Nominal yang dibayarkan tidak sesuai dengan total tagihan.',
                    ]);
                }

                $pesanan->status = 'akan_dikirim';
                $pesanan->save();

                if ($pesanan->pembayaran) {
                    $pesanan->pembayaran->midtrans_status = 'settlement';
                    $pesanan->pembayaran->waktu_bayar = now();
                    $pesanan->pembayaran->save();
                }

                if ($pesanan->pengiriman) {
                    $pesanan->pengiriman->tracking_status = 'akan_dikirim';
                    $pesanan->pengiriman->save();
                }

                // Dispatch alokasi pengiriman otomatis ke Biteship
                AlokasiPengirimanBiteshipJob::dispatch((string) $pesanan->id);

                if ($pesanan->pengguna_id && $pesanan->poin_didapat > 0) {
                    $loyalitas = PenggunaLoyalitas::firstOrCreate(
                        ['pengguna_id' => $pesanan->pengguna_id],
                        ['poin' => 0, 'total_belanja' => 0]
                    );
                    $loyalitas->poin += $pesanan->poin_didapat;
                    $loyalitas->total_belanja += $pesanan->total;
                    $loyalitas->save();

                    Cache::forget("pengguna:akun:{$pesanan->pengguna_id}");
                    Cache::forget("pengguna:profil:{$pesanan->pengguna_id}");
                }
            }
        }

        return response()->json([
            'sukses'   => true,
            'status'   => $pesanan->status,
            'midtrans' => $res,
        ]);
    }

    /**
     * Halaman pelacakan status pesanan & resi ekspedisi via Biteship.
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
                    $kurir = strtolower((string) ($pesanan->pengiriman->kurir ?? 'jne'));
                    $trackingId = (string) ($pesanan->pengiriman?->biteship_tracking_id ?? '');
                    $nomorResi = (string) ($pesanan->pengiriman?->nomor_resi ?? '');
                    $identifier = !empty($trackingId) ? $trackingId : $nomorResi;

                    if (!empty($identifier)) {
                        $tracking = $this->biteshipService->lacakPengiriman($identifier, $kurir);
                    } else {
                        $isPaid = in_array($pesanan->status, ['akan_dikirim', 'dikirim', 'selesai']);
                        $tracking = [
                            'sukses'          => true,
                            'status'          => $isPaid ? 'allocated' : 'pending_payment',
                            'kurir'           => strtoupper($kurir),
                            'layanan'         => strtoupper($pesanan->pengiriman->layanan ?? 'REG'),
                            'is_pre_dispatch' => true,
                            'history'         => [
                                [
                                    'note' => $isPaid
                                        ? 'Pesanan telah diverifikasi. Paket sedang disiapkan oleh tim gudang CRSL.'
                                        : 'Pesanan telah dibuat. Menunggu konfirmasi pembayaran.',
                                    'updated_at' => $pesanan->created_at->toIso8601String(),
                                    'status'     => $isPaid ? 'allocated' : 'order_placed',
                                ],
                            ],
                        ];
                    }
                }
            } catch (\Illuminate\Database\Eloquent\ModelNotFoundException) {
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

    public function konfirmasiDiterima(string $nomorPesanan): RedirectResponse
    {
        $pesanan = $this->temukanPesanan($nomorPesanan);

        if (Auth::check() && $pesanan->pengguna_id && $pesanan->pengguna_id !== Auth::id()) {
            return redirect()->back()->with('error', 'Anda tidak memiliki akses ke pesanan ini.');
        }

        if ($pesanan->status === 'selesai') {
            return redirect()->back()->with('info', "Pesanan {$pesanan->nomor_pesanan} sudah selesai.");
        }

        $pesanan->status = 'selesai';
        $pesanan->save();

        if ($pesanan->pengguna_id) {
            $loyalitas = PenggunaLoyalitas::firstOrCreate(
                ['pengguna_id' => $pesanan->pengguna_id],
                ['poin' => 0, 'total_belanja' => 0]
            );

            $poinReward = $pesanan->poin_didapat ?: (int) floor($pesanan->total / 10000) * 10;
            $loyalitas->poin += $poinReward;
            $loyalitas->total_belanja += (float) $pesanan->total;
            $loyalitas->save();

            Cache::forget("pengguna:akun:{$pesanan->pengguna_id}");
            Cache::forget("pengguna:profil:{$pesanan->pengguna_id}");
        }

        return redirect()->back()->with('sukses', "Pesanan {$pesanan->nomor_pesanan} telah selesai. Terima kasih!");
    }

    public function ubahAlamat(Request $request, string $nomorPesanan): RedirectResponse
    {
        $pesanan = $this->temukanPesanan($nomorPesanan, ['pengiriman']);

        if (in_array($pesanan->status, ['dikirim', 'selesai', 'dibatalkan']) || !empty($pesanan->pengiriman?->nomor_resi)) {
            return redirect()->back()->with('error', 'Pesanan yang telah memiliki nomor resi tidak dapat diubah alamatnya.');
        }

        $validated = $request->validate([
            'nama_penerima'  => 'required|string|max:255',
            'telepon'        => 'required|string|max:25',
            'alamat_lengkap' => 'required|string|max:1000',
            'catatan'        => 'nullable|string|max:500',
        ]);

        if ($pesanan->pengiriman) {
            $currentPayload = $this->getPengirimanPayload($pesanan);
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
            if ($pesanan->pembayaran && $pesanan->pembayaran->midtrans_status === 'pending') {
                $this->midtransService->batalkanTransaksi($pesanan->nomor_pesanan);
            }

            $payloadPengiriman = $this->getPengirimanPayload($pesanan);
            $pembeli = [
                'nama'    => $payloadPengiriman['nama_penerima'] ?? ($pesanan->pengguna?->name ?? 'Pelanggan CRSL'),
                'email'   => $payloadPengiriman['email'] ?? ($pesanan->pengguna?->email ?? 'pelanggan@crsl-store.id'),
                'telepon' => $payloadPengiriman['telepon'] ?? ($pesanan->pengguna?->telepon ?? '08123456789'),
            ];

            $attempt = Cache::increment("order_attempt:{$pesanan->id}");
            $orderIdUnik = str_replace('/', '-', $pesanan->nomor_pesanan) . "-A{$attempt}";

            $pesananData = [
                'nomor_pesanan' => $orderIdUnik,
                'total'         => $pesanan->total,
            ];

            if ($metodeKey === 'qris' || $metodeKey === 'ovo') {
                $chargeRes = $this->midtransService->chargeQris($pesananData, $pembeli);
            } elseif ($metodeKey === 'mandiri') {
                $chargeRes = $this->midtransService->chargeMandiriBill($pesananData, $pembeli);
            } else {
                $chargeRes = $this->midtransService->chargeBankTransfer($metodeKey, $pesananData, $pembeli);
            }

            if (empty($chargeRes['sukses'])) {
                return redirect()->back()->with('error', $chargeRes['pesan'] ?? 'Gagal membuat tagihan baru.');
            }

            if ($pesanan->pembayaran) {
                $pesanan->pembayaran->update([
                    'metode_bayar'      => $chargeRes['metode_bayar'] ?? strtoupper($metodeBaru),
                    'midtrans_id'       => $chargeRes['transaction_id'] ?? null,
                    'midtrans_status'   => $chargeRes['status_transaksi'] ?? 'pending',
                    'nomor_va'          => $chargeRes['nomor_va'] ?? null,
                    'kode_biller'       => $chargeRes['kode_biller'] ?? null,
                    'qr_string'         => $chargeRes['qr_string'] ?? null,
                    'qr_code_url'       => $chargeRes['qr_code_url'] ?? null,
                    'waktu_kedaluwarsa' => $chargeRes['waktu_kadaluarsa'] ?? now()->addMinutes(15),
                    'instruksi_bayar'   => $chargeRes['instruksi_bayar'] ?? [],
                ]);
            }

            return redirect()->back()->with('sukses', "Metode pembayaran berhasil diubah ke {$chargeRes['metode_bayar']}.");
        } catch (\Throwable $e) {
            report($e);
            return redirect()->back()->with('error', 'Gagal mengganti metode pembayaran: ' . $e->getMessage());
        }
    }

    public function batalkanPesanan(string $nomorPesanan): RedirectResponse
    {
        $pesanan = $this->temukanPesanan($nomorPesanan, ['items', 'pembayaran']);

        if ($pesanan->pengguna_id && $pesanan->pengguna_id !== Auth::id()) {
            return redirect()->back()->with('error', 'Anda tidak memiliki hak akses untuk membatalkan pesanan ini.');
        }

        if ($pesanan->status !== 'belum_bayar') {
            return redirect()->back()->with('error', 'Hanya pesanan yang belum dibayar yang dapat dibatalkan.');
        }

        try {
            DB::transaction(function () use ($pesanan) {
                $itemsArray = $pesanan->items->map(fn($item) => [
                    'varian_id' => $item->produk_varian_id,
                    'jumlah'    => $item->jumlah,
                ])->toArray();

                $this->inventoriService->kembalikanStok($itemsArray);

                if ($pesanan->pengguna_id && $pesanan->poin_digunakan > 0) {
                    $sudahDikembalikan = RiwayatPoin::where('pesanan_id', $pesanan->id)
                        ->where('tipe', RiwayatPoin::TIPE_DIKEMBALIKAN)
                        ->exists();

                    if (! $sudahDikembalikan) {
                        $loyalitas = PenggunaLoyalitas::lockForUpdate()->firstOrCreate(
                            ['pengguna_id' => $pesanan->pengguna_id],
                            ['poin' => 0, 'total_belanja' => 0]
                        );
                        $loyalitas->increment('poin', $pesanan->poin_digunakan);

                        RiwayatPoin::create([
                            'pengguna_id' => $pesanan->pengguna_id,
                            'pesanan_id' => $pesanan->id,
                            'tipe' => RiwayatPoin::TIPE_DIKEMBALIKAN,
                            'jumlah' => $pesanan->poin_digunakan,
                            'saldo_akhir' => $loyalitas->poin,
                            'keterangan' => "Pengembalian poin pembatalan pesanan {$pesanan->nomor_pesanan}",
                        ]);

                        Cache::forget("pengguna:akun:{$pesanan->pengguna_id}");
                        Cache::forget("pengguna:profil:{$pesanan->pengguna_id}");
                    }
                }

                if ($pesanan->kode_voucher) {
                    Voucher::where('kode', $pesanan->kode_voucher)->increment('kuota', 1);
                    VoucherTerpakai::where('pesanan_id', $pesanan->id)->delete();
                }

                if ($pesanan->pembayaran) {
                    $this->midtransService->batalkanTransaksi($pesanan->nomor_pesanan);
                    $pesanan->pembayaran->midtrans_status = 'cancel';
                    $pesanan->pembayaran->save();
                }

                $pesanan->status = 'dibatalkan';
                $pesanan->save();
            });

            return redirect()->back()->with('sukses', "Pesanan {$pesanan->nomor_pesanan} berhasil dibatalkan dan stok dikembalikan.");
        } catch (\Throwable $e) {
            report($e);
            return redirect()->back()->with('error', 'Gagal membatalkan pesanan: ' . $e->getMessage());
        }
    }

    public function refreshQris(string $nomorPesanan): RedirectResponse
    {
        $pesanan = $this->temukanPesanan($nomorPesanan, ['pembayaran', 'pengiriman']);

        if ($pesanan->status !== 'belum_bayar') {
            return redirect()->back()->with('error', 'Kode QRIS tidak dapat diperbarui.');
        }

        try {
            $payloadPengiriman = $this->getPengirimanPayload($pesanan);
            $pembeli = [
                'nama'    => $payloadPengiriman['nama_penerima'] ?? ($pesanan->pengguna?->name ?? 'Pelanggan CRSL'),
                'email'   => $payloadPengiriman['email'] ?? ($pesanan->pengguna?->email ?? 'pelanggan@crsl-store.id'),
                'telepon' => $payloadPengiriman['telepon'] ?? ($pesanan->pengguna?->telepon ?? '08123456789'),
            ];

            $attempt = Cache::increment("qris_attempt:{$pesanan->id}");
            $orderIdUnik = str_replace('/', '-', $pesanan->nomor_pesanan) . "-Q{$attempt}";

            $chargeRes = $this->midtransService->chargeQris([
                'nomor_pesanan' => $orderIdUnik,
                'total'         => $pesanan->total,
            ], $pembeli);

            if (!empty($chargeRes['sukses']) && $pesanan->pembayaran) {
                $pesanan->pembayaran->update([
                    'qr_string'         => $chargeRes['qr_string'] ?? null,
                    'qr_code_url'       => $chargeRes['qr_code_url'] ?? null,
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
     * Simulasi pembayaran instan (Mode Local Development).
     */
    public function simulasiBayarDev(string $nomorPesanan): RedirectResponse
    {
        if (app()->environment('production')) {
            abort(403, 'Simulasi pembayaran dinonaktifkan pada lingkungan produksi.');
        }

        $pesanan = $this->temukanPesanan($nomorPesanan, ['pengiriman']);

        $pesanan->status = 'akan_dikirim';
        $pesanan->save();

        if ($pesanan->pembayaran) {
            $pesanan->pembayaran->midtrans_status = 'settlement';
            $pesanan->pembayaran->waktu_bayar = now();
            $pesanan->pembayaran->save();
        }

        if ($pesanan->pengiriman) {
            $pesanan->pengiriman->tracking_status = 'akan_dikirim';
            $pesanan->pengiriman->save();
        }

        // Jalankan alokasi Biteship otomatis
        AlokasiPengirimanBiteshipJob::dispatch((string) $pesanan->id);

        if ($pesanan->pengguna_id) {
            Cache::forget("pengguna:akun:{$pesanan->pengguna_id}");
            Cache::forget("pengguna:profil:{$pesanan->pengguna_id}");
        }

        return redirect()->back()->with('sukses', 'Simulasi pembayaran sukses! Status: Siap Dikemas & Dikirim.');
    }
}
