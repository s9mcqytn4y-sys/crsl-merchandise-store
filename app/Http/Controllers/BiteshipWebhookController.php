<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\Pesanan;
use App\Models\PesananPengiriman;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class BiteshipWebhookController extends Controller
{
    /**
     * Handle incoming webhook notification from Biteship.
     */
    public function handle(Request $request): JsonResponse
    {
        $payload = $request->all();
        $event = (string) ($payload['event'] ?? 'order.status');
        $biteshipOrderId = (string) ($payload['order_id'] ?? $payload['id'] ?? '');
        $status = strtolower((string) ($payload['status'] ?? $payload['order_status'] ?? ''));
        $courierWaybill = (string) ($payload['courier_waybill_id'] ?? $payload['courier']['waybill_id'] ?? '');
        $courierTrackingId = (string) ($payload['courier_tracking_id'] ?? $payload['courier']['tracking_id'] ?? '');
        $trackingUrl = (string) ($payload['courier_link'] ?? $payload['courier']['link'] ?? '');

        Log::info("[Biteship Webhook Received] Order: {$biteshipOrderId}, Event: {$event}, Status: {$status}", [
            'waybill'     => $courierWaybill,
            'tracking_id' => $courierTrackingId,
        ]);

        if (empty($biteshipOrderId) && empty($courierTrackingId) && empty($courierWaybill)) {
            return response()->json([
                'sukses' => false,
                'pesan'  => 'Payload Biteship tidak memiliki identitas pengiriman valid.',
            ], 400);
        }

        // 1. Verifikasi Keamanan Webhook Secret jika dikonfigurasi
        $configuredSecret = (string) config('services.biteship.webhook_secret', '');
        if (!empty($configuredSecret)) {
            $incomingHeader = (string) (
                $request->header('X-Biteship-Signature')
                ?? $request->header('X-Biteship-Secret')
                ?? $request->header('X-Biteship-Token')
                ?? ''
            );

            $isValid = hash_equals($configuredSecret, $incomingHeader)
                || hash_equals(hash_hmac('sha256', $request->getContent(), $configuredSecret), $incomingHeader);

            if (!$isValid) {
                Log::warning("[Biteship Webhook] Secret / Signature Key tidak valid: {$incomingHeader}");
                return response()->json(['sukses' => false, 'pesan' => 'Unauthorized signature'], 403);
            }
        }

        // 2. Proteksi Idempotensi Webhook Event
        $idempotencyKey = "biteship_wh_" . md5($biteshipOrderId . '_' . $status . '_' . $courierWaybill);
        if (Cache::has($idempotencyKey)) {
            Log::info("[Biteship Webhook Duplicate] Event sudah diproses sebelumnya: {$idempotencyKey}");
            return response()->json([
                'sukses' => true,
                'pesan'  => 'Event Biteship terduplikasi telah dilewati.',
            ]);
        }

        try {
            DB::beginTransaction();

            /** @var PesananPengiriman|null $pengiriman */
            $pengiriman = PesananPengiriman::where('biteship_order_id', $biteshipOrderId)
                ->when(!empty($courierTrackingId), fn($q) => $q->orWhere('biteship_tracking_id', $courierTrackingId))
                ->when(!empty($courierWaybill), fn($q) => $q->orWhere('biteship_waybill_id', $courierWaybill)->orWhere('nomor_resi', $courierWaybill))
                ->lockForUpdate()
                ->first();

            if (!$pengiriman) {
                DB::rollBack();
                Log::warning("[Biteship Webhook Order Not Found] ID: {$biteshipOrderId}");
                return response()->json([
                    'sukses' => true,
                    'pesan'  => 'Data pengiriman tidak ditemukan di database.',
                ]);
            }

            // Update Kolom Pengiriman
            if (!empty($courierWaybill)) {
                $pengiriman->biteship_waybill_id = $courierWaybill;
                $pengiriman->nomor_resi = $courierWaybill;
            }
            if (!empty($courierTrackingId)) {
                $pengiriman->biteship_tracking_id = $courierTrackingId;
            }
            if (!empty($trackingUrl)) {
                $pengiriman->tracking_url = $trackingUrl;
            }

            $currentPayload = is_array($pengiriman->json_payload) ? $pengiriman->json_payload : [];
            $currentPayload['last_webhook_event'] = [
                'event'      => $event,
                'status'     => $status,
                'updated_at' => now()->toIso8601String(),
                'payload'    => $payload,
            ];
            $pengiriman->json_payload = $currentPayload;

            // Normalisasi Status Ekspedisi ke Domain Internal
            if (!empty($status)) {
                $pengiriman->tracking_status = $status;
            }

            $pengiriman->save();

            // 3. Sinkronisasi Status Header Pesanan
            $pesanan = Pesanan::where('id', $pengiriman->pesanan_id)->lockForUpdate()->first();
            if ($pesanan && !in_array($pesanan->status, ['selesai', 'dibatalkan'])) {
                if (in_array($status, ['picked', 'dropping_off', 'in_transit'])) {
                    if ($pesanan->status !== 'dikirim') {
                        $pesanan->status = 'dikirim';
                        $pesanan->save();
                    }
                } elseif ($status === 'delivered') {
                    $pesanan->status = 'selesai';
                    $pesanan->save();
                } elseif (in_array($status, ['cancelled', 'rejected'])) {
                    Log::warning("[Biteship Webhook] Pengiriman dibatalkan/ditolak kurir untuk pesanan {$pesanan->nomor_pesanan}");
                }
            }

            DB::commit();

            // Cache Key Idempotensi (12 Jam)
            Cache::put($idempotencyKey, true, now()->addHours(12));

            // Bersihkan Cache Pelacakan
            $courierCode = strtolower((string) ($pengiriman->kurir ?? 'jne'));
            if (!empty($pengiriman->nomor_resi)) {
                Cache::forget("biteship_track_{$courierCode}_{$pengiriman->nomor_resi}");
            }
            if (!empty($pengiriman->biteship_tracking_id)) {
                Cache::forget("biteship_track_{$courierCode}_{$pengiriman->biteship_tracking_id}");
            }

            return response()->json([
                'sukses' => true,
                'pesan'  => 'Status pengiriman Biteship berhasil diperbarui.',
            ]);
        } catch (\Throwable $e) {
            DB::rollBack();
            Log::error("[Biteship Webhook Exception] {$e->getMessage()}", [
                'trace' => $e->getTraceAsString(),
            ]);
            return response()->json([
                'sukses' => false,
                'pesan'  => 'Terjadi kesalahan pemrosesan webhook Biteship.',
            ], 500);
        }
    }
}
