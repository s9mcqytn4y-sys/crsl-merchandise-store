<?php

declare(strict_types=1);

namespace App\Domains\Pembayaran\Services;

use Illuminate\Http\Client\PendingRequest;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class MidtransService
{
    protected string $serverKey;
    protected string $clientKey;
    protected bool $isProduction;
    protected string $apiBaseUrl;

    public function __construct()
    {
        $this->serverKey = (string) config('services.midtrans.server_key', '');
        $this->clientKey = (string) config('services.midtrans.client_key', '');
        $this->isProduction = (bool) config('services.midtrans.is_production', false);
        $this->apiBaseUrl = $this->isProduction
            ? 'https://api.midtrans.com/v2'
            : 'https://api.sandbox.midtrans.com/v2';
    }

    /**
     * Factory HTTP Client terpadu khusus Midtrans API.
     * Menggunakan force IPv4 (CURLOPT_IPRESOLVE_V4) untuk mengatasi cURL Error 28 Timeout di OS Windows.
     */
    protected function client(int $timeout = 10, int $connectTimeout = 4): PendingRequest
    {
        $authHeader = 'Basic ' . base64_encode($this->serverKey . ':');

        $options = [
            'force_ip_resolve' => 'v4',
        ];

        // Nonaktifkan verifikasi SSL di local/sandbox jika CA bundle lokal tidak terkonfigurasi
        if (!$this->isProduction || app()->isLocal()) {
            $options['verify'] = false;
        }

        return Http::withHeaders([
            'Accept'        => 'application/json',
            'Content-Type'  => 'application/json',
            'Authorization' => $authHeader,
        ])
            ->connectTimeout($connectTimeout)
            ->timeout($timeout)
            ->withOptions($options);
    }

    /**
     * Kirim permintaan Direct Charge (/v2/charge) ke Midtrans Core API.
     */
    protected function buatDirectCharge(array $payload): array
    {
        try {
            $response = $this->client(15, 5)->post("{$this->apiBaseUrl}/charge", $payload);

            if ($response->successful()) {
                return [
                    'sukses' => true,
                    'data'   => $response->json(),
                ];
            }

            Log::error("Midtrans Direct Charge Error: Status {$response->status()} - " . $response->body());
            return [
                'sukses' => false,
                'pesan'  => $response->json('status_message', 'Gagal memproses pembayaran ke Midtrans'),
                'raw'    => $response->json() ?? [],
            ];
        } catch (\Throwable $e) {
            Log::error("Midtrans Direct Charge Exception: " . $e->getMessage());
            return [
                'sukses' => false,
                'pesan'  => 'Terjadi kesalahan koneksi ke server Midtrans: ' . $e->getMessage(),
            ];
        }
    }

    /**
     * Charge Virtual Account Bank (BCA, BNI, BRI, Permata, CIMB).
     */
    public function chargeBankTransfer(string $bank, array $pesanan, array $pembeli): array
    {
        $normalized = strtolower(trim($bank));
        if (str_contains($normalized, 'mandiri') || str_contains($normalized, 'echannel')) {
            return $this->chargeMandiriBill($pesanan, $pembeli);
        }

        $targetBank = 'bca';
        if (str_contains($normalized, 'bni')) {
            $targetBank = 'bni';
        } elseif (str_contains($normalized, 'bri')) {
            $targetBank = 'bri';
        } elseif (str_contains($normalized, 'permata')) {
            $targetBank = 'permata';
        } elseif (str_contains($normalized, 'cimb')) {
            $targetBank = 'cimb';
        }

        $orderId = str_replace('/', '-', $pesanan['nomor_pesanan']);
        $grossAmount = (int) round((float) $pesanan['total']);

        $payload = [
            'payment_type' => 'bank_transfer',
            'transaction_details' => [
                'order_id'     => $orderId,
                'gross_amount' => $grossAmount,
            ],
            'customer_details' => [
                'first_name' => $pembeli['nama'] ?? 'Adopter CRSL',
                'email'      => $pembeli['email'] ?? 'adopter@crsl-store.id',
                'phone'      => $pembeli['telepon'] ?? '08123456789',
            ],
            'bank_transfer' => [
                'bank' => $targetBank,
            ],
        ];

        $res = $this->buatDirectCharge($payload);
        if (!$res['sukses']) {
            return $res;
        }

        $data = $res['data'];
        $vaNumber = '';
        $actualBank = $targetBank;

        if (!empty($data['va_numbers'][0]['va_number'])) {
            $vaNumber = (string) $data['va_numbers'][0]['va_number'];
            if (!empty($data['va_numbers'][0]['bank'])) {
                $actualBank = strtolower($data['va_numbers'][0]['bank']);
            }
        } elseif (!empty($data['permata_va_number'])) {
            $vaNumber = (string) $data['permata_va_number'];
            $actualBank = 'permata';
        }

        if (str_starts_with($vaNumber, '41400')) {
            $actualBank = 'permata';
        }

        $bankLabel = strtoupper($actualBank);
        if ($actualBank === 'permata') {
            $bankLabel = 'Permata';
        }

        return [
            'sukses'           => true,
            'metode_bayar'     => "{$bankLabel} Virtual Account",
            'bank'             => strtoupper($actualBank),
            'nomor_va'         => $vaNumber,
            'transaction_id'   => $data['transaction_id'] ?? null,
            'waktu_transaksi'  => $data['transaction_time'] ?? date('Y-m-d H:i:s'),
            'waktu_kadaluarsa' => $data['expiry_time'] ?? date('Y-m-d H:i:s', strtotime('+24 hours')),
            'status_transaksi' => $data['transaction_status'] ?? 'pending',
            'instruksi_bayar'  => [
                "Buka aplikasi Mobile Banking {$bankLabel} atau kunjungi ATM {$bankLabel}",
                "Pilih menu Transfer > Virtual Account",
                "Masukkan Nomor Virtual Account: {$vaNumber}",
                "Pastikan nominal sesuai tagihan dan simpan bukti transaksi",
            ],
        ];
    }

    /**
     * Charge Mandiri Bill Payment (E-Channel).
     */
    public function chargeMandiriBill(array $pesanan, array $pembeli): array
    {
        $orderId = str_replace('/', '-', $pesanan['nomor_pesanan']);
        $grossAmount = (int) round((float) $pesanan['total']);

        $payload = [
            'payment_type' => 'echannel',
            'transaction_details' => [
                'order_id'     => $orderId,
                'gross_amount' => $grossAmount,
            ],
            'echannel' => [
                'bill_info1' => 'Pembayaran Pesanan:',
                'bill_info2' => 'CRSL Official Store',
            ],
            'customer_details' => [
                'first_name' => $pembeli['nama'] ?? 'Adopter CRSL',
                'email'      => $pembeli['email'] ?? 'adopter@crsl-store.id',
                'phone'      => $pembeli['telepon'] ?? '08123456789',
            ],
        ];

        $res = $this->buatDirectCharge($payload);
        if (!$res['sukses']) {
            return $res;
        }

        $data = $res['data'];
        $billerCode = (string) ($data['biller_code'] ?? '70012');
        $billKey = (string) ($data['bill_key'] ?? '');

        return [
            'sukses'           => true,
            'metode_bayar'     => 'Mandiri Bill Payment',
            'bank'             => 'MANDIRI',
            'kode_biller'      => $billerCode,
            'bill_key'         => $billKey,
            'nomor_va'         => $billKey,
            'transaction_id'   => $data['transaction_id'] ?? null,
            'waktu_transaksi'  => $data['transaction_time'] ?? date('Y-m-d H:i:s'),
            'waktu_kadaluarsa' => $data['expiry_time'] ?? date('Y-m-d H:i:s', strtotime('+24 hours')),
            'status_transaksi' => $data['transaction_status'] ?? 'pending',
            'instruksi_bayar'  => [
                "Buka Livin' by Mandiri atau ATM Mandiri",
                "Pilih menu Bayar / Pembayaran > Multi Payment",
                "Masukkan Kode Perusahaan (Biller Code): {$billerCode}",
                "Masukkan Nomor Tagihan (Bill Key): {$billKey}",
                "Konfirmasi rincian pembayaran dan selesaikan transaksi",
            ],
        ];
    }

    /**
     * Charge QRIS (GoPay, ShopeePay, BCA QR, Livin, OVO, Dana).
     */
    public function chargeQris(array $pesanan, array $pembeli): array
    {
        $orderId = str_replace('/', '-', $pesanan['nomor_pesanan']);
        $grossAmount = (int) round((float) $pesanan['total']);

        $payload = [
            'payment_type' => 'qris',
            'transaction_details' => [
                'order_id'     => $orderId,
                'gross_amount' => $grossAmount,
            ],
            'qris' => [
                'acquirer' => 'gopay',
            ],
            'customer_details' => [
                'first_name' => $pembeli['nama'] ?? 'Adopter CRSL',
                'email'      => $pembeli['email'] ?? 'adopter@crsl-store.id',
                'phone'      => $pembeli['telepon'] ?? '08123456789',
            ],
        ];

        $res = $this->buatDirectCharge($payload);
        if (!$res['sukses']) {
            return $res;
        }

        $data = $res['data'];
        $qrCodeUrl = '';
        if (!empty($data['actions'])) {
            foreach ($data['actions'] as $act) {
                if (($act['name'] ?? '') === 'generate-qr-code') {
                    $qrCodeUrl = $act['url'] ?? '';
                    break;
                }
            }
        }

        return [
            'sukses'           => true,
            'metode_bayar'     => 'QRIS (All E-Wallet & Mobile Banking)',
            'bank'             => 'QRIS',
            'qr_code_url'      => $qrCodeUrl,
            'qr_string'        => $data['qr_string'] ?? '',
            'transaction_id'   => $data['transaction_id'] ?? null,
            'waktu_transaksi'  => $data['transaction_time'] ?? date('Y-m-d H:i:s'),
            'waktu_kadaluarsa' => $data['expiry_time'] ?? date('Y-m-d H:i:s', strtotime('+15 minutes')),
            'status_transaksi' => $data['transaction_status'] ?? 'pending',
            'instruksi_bayar'  => [
                "Buka aplikasi e-wallet atau mobile banking apa saja (GoPay, BCA, Livin, OVO, Dana, ShopeePay)",
                "Pilih menu Bayar / Scan QRIS",
                "Arahkan kamera ke QR Code di layar",
                "Periksa nominal pembayaran dan selesaikan transaksi",
            ],
        ];
    }

    /**
     * Memeriksa status transaksi pembayaran terkini via Midtrans Status API.
     */
    public function cekStatus(string $orderId): array
    {
        $sanitizedOrderId = str_replace('/', '-', $orderId);

        try {
            // Gunakan timeout cepat (6 detik) dan connect timeout (3 detik) agar UI tidak freeze
            $response = $this->client(6, 3)->get("{$this->apiBaseUrl}/" . urlencode($sanitizedOrderId) . "/status");

            if ($response->successful()) {
                $json = $response->json();
                $txStatus = $json['transaction_status'] ?? 'unknown';

                $statusPesanan = 'belum_bayar';
                if (in_array($txStatus, ['settlement', 'capture'], true)) {
                    $statusPesanan = 'akan_dikirim';
                } elseif (in_array($txStatus, ['deny', 'cancel', 'expire'], true)) {
                    $statusPesanan = 'dibatalkan';
                }

                return [
                    'sukses'           => true,
                    'nomor_pesanan'    => $orderId,
                    'status_transaksi' => $txStatus,
                    'status_pesanan'   => $statusPesanan,
                    'waktu_pembayaran' => $json['settlement_time'] ?? ($json['transaction_time'] ?? null),
                    'tipe_pembayaran'  => $json['payment_type'] ?? null,
                    'raw'              => $json,
                ];
            }

            Log::warning("Midtrans Status Check non-200: Order {$orderId}, Status {$response->status()}");
        } catch (\Throwable $e) {
            // Catat sebagai warning agar log error tidak bising saat sandbox lambat
            Log::warning("Midtrans Status Check Warning [{$sanitizedOrderId}]: " . $e->getMessage());
        }

        return [
            'sukses' => false,
            'status' => 'unknown',
            'pesan'  => 'Gagal mengecek status ke Midtrans (Koneksi timeout/lambat)',
        ];
    }

    /**
     * Membatalkan transaksi di server Midtrans via Cancel API (/v2/{id}/cancel).
     */
    public function batalkanTransaksi(string $orderId): array
    {
        $sanitizedOrderId = str_replace('/', '-', $orderId);

        try {
            $response = $this->client(8, 3)->post("{$this->apiBaseUrl}/" . urlencode($sanitizedOrderId) . "/cancel");

            if ($response->successful()) {
                return [
                    'sukses' => true,
                    'pesan'  => 'Transaksi berhasil dibatalkan di Midtrans',
                    'data'   => $response->json(),
                ];
            }

            return [
                'sukses' => false,
                'pesan'  => $response->json('status_message', 'Gagal membatalkan transaksi di Midtrans'),
            ];
        } catch (\Throwable $e) {
            Log::error("Midtrans Cancel Exception: " . $e->getMessage());
            return [
                'sukses' => false,
                'pesan'  => 'Terjadi kesalahan saat membatalkan transaksi',
            ];
        }
    }

    /**
     * Verifikasi Signature Key SHA-512 dari Webhook Midtrans.
     */
    public function verifikasiSignature(string $orderId, string $statusCode, string $grossAmount, string $signatureKey): bool
    {
        $expectedSignature = hash('sha512', $orderId . $statusCode . $grossAmount . $this->serverKey);
        return hash_equals($expectedSignature, $signatureKey);
    }
}
