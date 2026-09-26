<?php

namespace App\Domains\Autentikasi\Services;

use App\Mail\OtpVerifikasiMail;
use App\Mail\ResetPasswordMail;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class OtpService
{
    /**
     * Durasi masa aktif kode OTP (5 Menit sesuai standar industri)
     */
    protected int $ttlMinutes = 5;

    /**
     * Batas maksimal permintaan OTP per email dalam kurun waktu 10 menit
     */
    protected int $maxGenerationAttempts = 3;

    /**
     * Batas maksimal percobaan verifikasi salah sebelum kode dihanguskan
     */
    protected int $maxVerificationAttempts = 3;

    /**
     * Generate 6-digit OTP code using cryptographically secure random_int.
     * Stored in Cache with 5-minute TTL and rate-limiting.
     *
     * @throws \Exception When rate limit exceeded
     */
    public function generateOtp(string $email, string $nama = 'Bestie'): string
    {
        $emailKey = strtolower(trim($email));
        $hash = md5($emailKey);

        // 1. Rate Limiting Request OTP (Maks 3 kali per 10 menit)
        $rateLimitKey = "otp_rate_limit_{$hash}";
        $requestsCount = (int)Cache::get($rateLimitKey, 0);

        if ($requestsCount >= $this->maxGenerationAttempts) {
            Log::warning("[AUTH-OTP] Rate limit exceeded for {$emailKey} ({$requestsCount} requests in 10m)");
            throw new \Exception("Terlalu banyak permintaan OTP. Silakan tunggu beberapa saat lagi.");
        }

        // Increment request count with 10 min expiry
        Cache::put($rateLimitKey, $requestsCount + 1, now()->addMinutes(10));

        // 2. Cryptographically secure 6-digit number
        $otpCode = (string)random_int(100000, 999999);
        $cacheKey = "otp_code_{$hash}";
        $attemptsKey = "otp_attempts_{$hash}";

        // Simpan ke Cache dengan TTL 5 menit
        Cache::put($cacheKey, $otpCode, now()->addMinutes($this->ttlMinutes));
        Cache::put($attemptsKey, 0, now()->addMinutes($this->ttlMinutes));

        Log::info("[AUTH-OTP] 6-Digit OTP generated for {$emailKey} (Masa berlaku {$this->ttlMinutes} menit)");

        // 3. Kirim Email (Asinkron / Queued via ShouldQueue)
        try {
            Mail::to($emailKey)->send(new OtpVerifikasiMail($nama, $otpCode));
        } catch (\Throwable $e) {
            Log::error("[AUTH-OTP] Gagal mengirim email OTP ke {$emailKey}: " . $e->getMessage());
        }

        return $otpCode;
    }

    /**
     * Generate & Kirim OTP untuk Reset Password Akun
     *
     * @throws \Exception
     */
    public function sendPasswordResetOtp(string $email, string $nama = 'Bestie', string $resetUrl = ''): string
    {
        $emailKey = strtolower(trim($email));
        $hash = md5($emailKey);

        $rateLimitKey = "otp_pwd_rate_{$hash}";
        $requestsCount = (int)Cache::get($rateLimitKey, 0);

        if ($requestsCount >= $this->maxGenerationAttempts) {
            Log::warning("[AUTH-RESET] Rate limit reset password exceeded for {$emailKey}");
            throw new \Exception("Terlalu banyak permintaan reset kata sandi. Silakan tunggu 10 menit.");
        }

        Cache::put($rateLimitKey, $requestsCount + 1, now()->addMinutes(10));

        $otpCode = (string)random_int(100000, 999999);
        $cacheKey = "otp_pwd_{$hash}";
        $attemptsKey = "otp_pwd_attempts_{$hash}";

        Cache::put($cacheKey, $otpCode, now()->addMinutes($this->ttlMinutes));
        Cache::put($attemptsKey, 0, now()->addMinutes($this->ttlMinutes));

        Log::info("[AUTH-RESET] OTP Reset Password dibuat untuk {$emailKey} (TTL {$this->ttlMinutes}m)");

        try {
            Mail::to($emailKey)->send(new ResetPasswordMail($nama, $otpCode, $resetUrl ?: url('/lupa-password/verifikasi')));
        } catch (\Throwable $e) {
            Log::error("[AUTH-RESET] Gagal mengirim email Reset Password ke {$emailKey}: " . $e->getMessage());
        }

        return $otpCode;
    }

    /**
     * Verifikasi kode 6-digit OTP dengan perlindungan Brute-force (Max 3 failed attempts)
     */
    public function verifyOtp(string $email, string $otpCode): bool
    {
        $emailKey = strtolower(trim($email));
        $hash = md5($emailKey);
        $cacheKey = "otp_code_{$hash}";
        $attemptsKey = "otp_attempts_{$hash}";

        $storedOtp = Cache::get($cacheKey);
        $failedAttempts = (int)Cache::get($attemptsKey, 0);

        if (!$storedOtp) {
            Log::info("[AUTH-OTP] Verifikasi gagal: Kode OTP sudah kedaluwarsa atau belum dibuat untuk {$emailKey}");
            return false;
        }

        // Cek jika sudah melebihi batas percobaan salah
        if ($failedAttempts >= $this->maxVerificationAttempts) {
            Cache::forget($cacheKey);
            Cache::forget($attemptsKey);
            Log::warning("[AUTH-OTP] Percobaan salah melebihi batas ({$this->maxVerificationAttempts}x). Kode OTP dibatalkan untuk {$emailKey}");
            return false;
        }

        $inputClean = trim($otpCode);

        // Fallback testing local OTP '123456' untuk environment lokal bila diizinkan
        $isLocalMatch = app()->environment('local') && $inputClean === '123456';
        $isMatch = $inputClean === $storedOtp;

        if ($isMatch || $isLocalMatch) {
            Cache::forget($cacheKey);
            Cache::forget($attemptsKey);
            Log::info("[AUTH-OTP] Verifikasi OTP SUKSES untuk {$emailKey}");
            return true;
        }

        // Catat percobaan gagal
        $newFailed = $failedAttempts + 1;
        Cache::put($attemptsKey, $newFailed, now()->addMinutes($this->ttlMinutes));
        Log::warning("[AUTH-OTP] Kode OTP salah untuk {$emailKey}. Percobaan gagal: {$newFailed}/{$this->maxVerificationAttempts}");

        return false;
    }

    /**
     * Verifikasi kode OTP Reset Password
     */
    public function verifyPasswordResetOtp(string $email, string $otpCode): bool
    {
        $emailKey = strtolower(trim($email));
        $hash = md5($emailKey);
        $cacheKey = "otp_pwd_{$hash}";
        $attemptsKey = "otp_pwd_attempts_{$hash}";

        $storedOtp = Cache::get($cacheKey);
        $failedAttempts = (int)Cache::get($attemptsKey, 0);

        if (!$storedOtp || $failedAttempts >= $this->maxVerificationAttempts) {
            Cache::forget($cacheKey);
            Cache::forget($attemptsKey);
            return false;
        }

        $inputClean = trim($otpCode);
        $isLocalMatch = app()->environment('local') && $inputClean === '123456';

        if ($inputClean === $storedOtp || $isLocalMatch) {
            Cache::forget($cacheKey);
            Cache::forget($attemptsKey);
            // Berikan token otorisasi reset password selama 15 menit
            Cache::put("pwd_reset_authorized_{$hash}", true, now()->addMinutes(15));
            return true;
        }

        Cache::put($attemptsKey, $failedAttempts + 1, now()->addMinutes($this->ttlMinutes));
        return false;
    }
}
