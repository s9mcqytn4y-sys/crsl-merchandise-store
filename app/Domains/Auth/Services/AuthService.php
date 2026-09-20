<?php

namespace App\Domains\Auth\Services;

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
     * Login pengguna dengan email & password.
     */
    public function login(string $identitas, string $password): array
    {
        $identitas = trim($identitas);
        $user = User::where('email', $identitas)->first();

        if (!$user || !Hash::check($password, $user->password)) {
            return [
                'sukses' => false,
                'pesan' => 'Email atau kata sandi tidak cocok. Silakan periksa kembali.',
                'status' => 401,
            ];
        }

        Auth::login($user, true);

        return [
            'sukses' => true,
            'pesan' => 'Login berhasil. Selamat datang kembali ' . $user->name . '!',
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
