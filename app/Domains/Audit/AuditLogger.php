<?php

declare(strict_types=1);

namespace App\Domains\Audit;

use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class AuditLogger
{
    /**
     * Format dan catat event log standar sistem commerce dengan trace_id unik.
     */
    public static function log(
        string $event,
        string $level = 'info',
        ?int $orderId = null,
        ?int $userId = null,
        array $details = [],
        ?string $traceId = null
    ): void {
        $context = [
            'event'     => $event,
            'trace_id'  => $traceId ?: (string) Str::uuid(),
            'user_id'   => $userId ?? Auth::id(),
            'order_id'  => $orderId,
            'timestamp' => now()->toIso8601String(),
            'details'   => $details,
        ];

        Log::log($level, "[COMMERCE_AUDIT] {$event}", $context);
    }

    public static function paymentSuccess(int $orderId, array $details = [], ?int $userId = null, ?string $traceId = null): void
    {
        self::log('payment.success', 'info', $orderId, $userId, $details, $traceId);
    }

    public static function paymentFailed(int $orderId, string $reason, array $details = [], ?int $userId = null, ?string $traceId = null): void
    {
        self::log('payment.failed', 'warning', $orderId, $userId, array_merge(['alasan' => $reason], $details), $traceId);
    }

    public static function shipmentCreated(int $orderId, string $courier, string $trackingNo, array $details = [], ?int $userId = null, ?string $traceId = null): void
    {
        self::log('shipment.created', 'info', $orderId, $userId, array_merge([
            'kurir' => $courier,
            'resi'  => $trackingNo,
        ], $details), $traceId);
    }

    public static function shipmentFailed(int $orderId, string $reason, array $details = [], ?int $userId = null, ?string $traceId = null): void
    {
        self::log('shipment.failed', 'error', $orderId, $userId, array_merge(['alasan' => $reason], $details), $traceId);
    }

    public static function checkoutFailed(string $reason, array $details = [], ?int $userId = null, ?string $traceId = null): void
    {
        self::log('checkout.failed', 'warning', null, $userId, array_merge(['alasan' => $reason], $details), $traceId);
    }
}
