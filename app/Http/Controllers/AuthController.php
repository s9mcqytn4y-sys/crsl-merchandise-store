<?php

namespace App\Http\Controllers;

use App\Domains\Auth\Actions\RegistrasiPenggunaAction;
use App\Domains\Auth\Actions\VerifikasiOtpAction;
use App\Domains\Auth\Services\AuthService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AuthController extends Controller
{
    public function __construct(
        protected AuthService $authService,
        protected RegistrasiPenggunaAction $registrasiAction,
        protected VerifikasiOtpAction $verifikasiOtpAction
    ) {}

    /**
     * Endpoint pendaftaran akun baru.
     */
    public function register(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'nama' => 'required|string|min:3|max:255',
            'email' => 'required|email|max:255',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $res = $this->registrasiAction->execute($validated);

        return response()->json($res, $res['status'] ?? 200);
    }

    /**
     * Endpoint verifikasi kode OTP 6 digit.
     */
    public function verifyOtp(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => 'required|email',
            'kode_otp' => 'required|string|size:6',
        ]);

        $res = $this->verifikasiOtpAction->execute($validated['email'], $validated['kode_otp']);

        return response()->json($res, $res['status'] ?? 200);
    }

    /**
     * Endpoint login pengguna.
     */
    public function login(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => 'required|string',
            'password' => 'required|string',
        ]);

        $res = $this->authService->login($validated['email'], $validated['password']);

        return response()->json($res, $res['status'] ?? 200);
    }

    /**
     * Endpoint logout pengguna.
     */
    public function logout(Request $request): RedirectResponse
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('beranda')->with('sukses', 'Logout berhasil.');
    }

    /**
     * Endpoint hapus / nonaktifkan akun pengguna (Soft Delete).
     */
    public function hapusAkun(Request $request): RedirectResponse
    {
        $userId = auth()->id();
        if ($userId) {
            $this->authService->hapusAkun($userId);
            return redirect()->route('beranda')->with('sukses', 'Akun Anda berhasil dinonaktifkan.');
        }

        return redirect()->back()->with('error', 'Gagal menonaktifkan akun.');
    }
}
