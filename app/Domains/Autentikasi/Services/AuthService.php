<?php

namespace App\Domains\Autentikasi\Services;

use App\Models\PenggunaLoyalitas;
use App\Models\User;
use Exception;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;

class AuthService
{
    public function __construct(
        protected OtpService $otpService
    ) {}

    /**
     * Registrasi akun pengguna baru & kirim kode OTP 6 digit.
     */
    public function register(array $data): array
    {
        $email = strtolower(trim($data['email']));
        $existing = User::where('email', $email)->first();

        if ($existing) {
            return [
                'sukses' => false,
                'pesan' => 'Email sudah terdaftar. Silakan login atau gunakan reset password.',
                'status' => 409,
            ];
        }

        $user = User::create([
            'name' => trim($data['nama'] ?? $data['name']),
            'email' => $email,
            'password' => Hash::make($data['password']),
            'email_verified_at' => null, // Inactive until OTP verified
        ]);

        // Inisialisasi Poin Loyalitas
        PenggunaLoyalitas::create([
            'pengguna_id' => $user->id,
            'poin' => 100, // Bonus pendaftaran
            'total_belanja' => 0,
        ]);

        $otpCode = $this->otpService->generateOtp($email);

        return [
            'sukses' => true,
            'pesan' => 'Pendaftaran berhasil. Silakan masukkan kode OTP 6 digit yang telah dikirim ke email Anda.',
            'status' => 200,
            'user' => $user,
            'otp' => $otpCode,
        ];
    }

    /**
     * Verifikasi kode OTP 6 digit dan aktifkan akun.
     */
    public function verifyOtp(string $email, string $otpCode): array
    {
        $email = strtolower(trim($email));

        if (!$this->otpService->verifyOtp($email, $otpCode)) {
            return [
                'sukses' => false,
                'pesan' => 'Kode OTP 6 digit salah atau sudah kedaluwarsa. Gunakan kode 123456.',
                'status' => 400,
            ];
        }

        $user = User::where('email', $email)->first();
        if ($user) {
            $user->email_verified_at = now();
            $user->save();

            Auth::login($user);

            return [
                'sukses' => true,
                'pesan' => 'Akun berhasil diverifikasi dan diaktifkan. Sesi Anda kini aktif!',
                'status' => 200,
                'user' => $user,
            ];
        }

        return [
            'sukses' => false,
            'pesan' => 'Pengguna tidak ditemukan.',
            'status' => 404,
        ];
    }

    /**
     * Cari pengguna berdasarkan email atau nomor telepon (dengan normalisasi format).
     */
    public function cariPenggunaBerdasarkanIdentitas(string $identitas): ?User
    {
        $identitas = trim($identitas);
        if (str_contains($identitas, '@')) {
            return User::where('email', strtolower($identitas))->first();
        }

        $cleanPhone = preg_replace('/[^0-9]/', '', $identitas);
        $phoneVariants = array_unique(array_filter([
            $identitas,
            $cleanPhone,
            '+' . $cleanPhone,
            str_starts_with($cleanPhone, '62') ? '0' . substr($cleanPhone, 2) : null,
            str_starts_with($cleanPhone, '0') ? '+62' . substr($cleanPhone, 1) : null,
            str_starts_with($cleanPhone, '0') ? '62' . substr($cleanPhone, 1) : null,
        ]));

        return User::whereIn('telepon', $phoneVariants)
            ->orWhere('email', $identitas)
            ->first();
    }

    /**
     * Login pengguna dengan email atau nomor handphone & password.
     */
    public function login(string $identitas, string $password): array
    {
        $user = $this->cariPenggunaBerdasarkanIdentitas($identitas);

        if (!$user || !Hash::check($password, $user->password)) {
            return [
                'sukses' => false,
                'pesan' => 'Email/Nomor HP atau kata sandi tidak cocok. Silakan periksa kembali.',
                'status' => 401,
            ];
        }

        Auth::login($user, true);

        // Hapus cache lama untuk memastikan state terbaru langsung aktif
        \Illuminate\Support\Facades\Cache::forget("pengguna:akun:{$user->id}");
        \Illuminate\Support\Facades\Cache::forget("pengguna:profil:{$user->id}");

        return [
            'sukses' => true,
            'pesan' => 'Login berhasil. Selamat datang kembali, ' . $user->name . '!',
            'status' => 200,
            'user' => $user,
        ];
    }

    /**
     * Kirim OTP untuk proses lupa kata sandi.
     */
    public function mintaOtpLupaPassword(string $identitas): array
    {
        $user = $this->cariPenggunaBerdasarkanIdentitas($identitas);

        if (!$user) {
            return [
                'sukses' => false,
                'pesan' => 'Akun dengan email atau nomor HP tersebut tidak ditemukan.',
                'status' => 404,
            ];
        }

        try {
            $otpCode = $this->otpService->sendPasswordResetOtp($user->email, $user->name);

            return [
                'sukses' => true,
                'pesan' => 'Kode OTP verifikasi telah dikirim ke ' . $user->email . '.' . (app()->isLocal() ? "\n(Environment Dev: gunakan kode OTP 123456)" : ''),
                'status' => 200,
                'email' => $user->email,
                'otp' => app()->isLocal() ? $otpCode : null,
            ];
        } catch (\Throwable $e) {
            return [
                'sukses' => false,
                'pesan' => $e->getMessage(),
                'status' => 429,
            ];
        }
    }

    /**
     * Reset kata sandi dengan kode OTP.
     */
    public function resetPassword(string $identitas, string $otp, string $passwordBaru): array
    {
        $user = $this->cariPenggunaBerdasarkanIdentitas($identitas);

        if (!$user) {
            return [
                'sukses' => false,
                'pesan' => 'Akun tidak ditemukan.',
                'status' => 404,
            ];
        }

        $isValid = $this->otpService->verifyPasswordResetOtp($user->email, $otp)
            || $this->otpService->verifyOtp($user->email, $otp);

        if (!$isValid) {
            return [
                'sukses' => false,
                'pesan' => 'Kode OTP salah atau sudah kedaluwarsa (maksimal 3 kali percobaan).',
                'status' => 400,
            ];
        }

        $user->password = Hash::make($passwordBaru);
        $user->save();

        \Illuminate\Support\Facades\Cache::forget("pengguna:akun:{$user->id}");
        \Illuminate\Support\Facades\Cache::forget("pengguna:profil:{$user->id}");

        // Auto login setelah reset berhasil
        Auth::login($user, true);

        return [
            'sukses' => true,
            'pesan' => 'Kata sandi berhasil diperbarui! Anda telah masuk secara otomatis.',
            'status' => 200,
            'user' => $user,
        ];
    }

    /**
     * Hapus / nonaktifkan akun pengguna (Soft Delete).
     */
    public function hapusAkun(int $userId): array
    {
        $user = User::find($userId);
        if ($user) {
            Auth::logout();
            $user->delete();

            return [
                'sukses' => true,
                'pesan' => 'Akun Anda telah dinonaktifkan.',
            ];
        }

        return [
            'sukses' => false,
            'pesan' => 'Pengguna tidak ditemukan.',
        ];
    }
}
