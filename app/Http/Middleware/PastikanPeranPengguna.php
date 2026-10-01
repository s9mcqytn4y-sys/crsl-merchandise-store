<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class PastikanPeranPengguna
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     * @param  string  ...$peranYangDiizinkan
     */
    public function handle(Request $request, Closure $next, string ...$peranYangDiizinkan): Response
    {
        $user = $request->user();

        if (!$user) {
            if ($request->expectsJson()) {
                return response()->json([
                    'status' => 'error',
                    'pesan' => 'Otentikasi dibutuhkan untuk mengakses layanan ini.',
                ], 401);
            }

            return redirect()->route('beranda')->with('error', 'Silakan masuk terlebih dahulu.');
        }

        if (empty($peranYangDiizinkan)) {
            return $next($request);
        }

        // Periksa apakah peran pengguna cocok dengan salah satu peran yang diizinkan
        if (in_array($user->peran, $peranYangDiizinkan, true) || $user->peran === 'owner') {
            return $next($request);
        }

        if ($request->expectsJson()) {
            return response()->json([
                'status' => 'error',
                'pesan' => 'Akses ditolak. Anda tidak memiliki izin untuk tindakan ini.',
            ], 403);
        }

        abort(403, 'Akses ditolak. Peran Anda tidak memiliki wewenang untuk halaman ini.');
    }
}
