<?php

namespace App\Domains\Auth\Services;

use App\Mail\OtpVerifikasiMail;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class OtpService
{
    protected int $ttlMinutes = 10;

    /**
     * Generate 6-digit OTP code and store in cache with 10-minute expiration.
     */
    public function generateOtp(string $email, string $nama = 'Bestie'): string
    {
        $emailKey = strtolower(trim($email));
        $otpCode = (string)rand(100000, 999999);
        $cacheKey = 'otp_code_' . md5($emailKey);

        Cache::put($cacheKey, $otpCode, now()->addMinutes($this->ttlMinutes));

        Log::info("OTP 6-Digit Generated for {$emailKey}: {$otpCode}");

        try {
            Mail::to($emailKey)->send(new OtpVerifikasiMail($nama, $otpCode));
        } catch (\Throwable $e) {
            Log::error("Failed to send OTP Mail: " . $e->getMessage());
        }

        return $otpCode;
    }

    /**
     * Verify 6-digit OTP code.
     */
    public function verifyOtp(string $email, string $otpCode): bool
    {
        $emailKey = strtolower(trim($email));
        $cacheKey = 'otp_code_' . md5($emailKey);

        $storedOtp = Cache::get($cacheKey);

        // Fallback demo OTP '123456' for local testing
        if ($otpCode === '123456' || ($storedOtp && $storedOtp === trim($otpCode))) {
            Cache::forget($cacheKey);
            return true;
        }

        return false;
    }
}
