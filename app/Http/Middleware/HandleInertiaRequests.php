<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $user ? [
                    'id'                => $user->id,
                    'name'              => $user->name,
                    'email'             => $user->email,
                    'telepon'           => $user->telepon ?? null,
                    'avatar'            => $user->avatar ?? null,
                    'birth_day'         => $user->birth_day ?? null,
                    'birth_month'       => $user->birth_month ?? null,
                    'birth_year'        => $user->birth_year ?? null,
                    'poin'              => $user->loyalitas ? (int) $user->loyalitas->poin : 0,
                    'total_belanja'     => $user->loyalitas ? (float) $user->loyalitas->total_belanja : 0,
                    'tier'              => $user->loyalitas?->tier?->nama ?? 'New Freen',
                    'email_verified_at' => $user->email_verified_at ? $user->email_verified_at->toIso8601String() : null,
                ] : null,
            ],
            'loyalitas' => function () use ($user) {
                try {
                    $tiers = \Illuminate\Support\Facades\Cache::remember('tier_loyalitas_shared', 300, function () {
                        return \App\Models\TierLoyalitas::orderBy('urutan', 'asc')->get();
                    });

                    return [
                        'tiers' => $tiers->map(fn ($t) => [
                            'id'             => $t->id,
                            'name'           => $t->nama,
                            'nama'           => $t->nama,
                            'slug'           => $t->slug,
                            'minSpend'       => (float) $t->syarat_belanja,
                            'syarat_belanja' => (float) $t->syarat_belanja,
                            'pengali_poin'   => (float) ($t->pengali_poin ?? 1.0),
                            'multiplier'     => (float) ($t->pengali_poin ?? 1.0),
                            'warna_aksen'    => $t->warna_aksen ?? '#3b82f6',
                            'deskripsi'      => $t->deskripsi,
                            'benefit'        => $t->benefit ?? [],
                        ])->all(),
                        'config' => [
                            'kelipatan_belanja'  => config('loyalitas.kelipatan_belanja', 10000),
                            'poin_per_kelipatan' => config('loyalitas.poin_per_kelipatan', 10),
                            'nilai_tukar_poin'   => config('loyalitas.nilai_tukar_poin', 1),
                            'maks_persen_tukar'  => config('loyalitas.maks_persen_tukar', 100),
                        ],
                    ];
                } catch (\Throwable $e) {
                    return [
                        'tiers' => [],
                        'config' => [],
                    ];
                }
            },
            'flash' => [
                'sukses' => fn () => $request->session()->get('sukses'),
                'error'  => fn () => $request->session()->get('error'),
                'info'   => fn () => $request->session()->get('info'),
            ],
            'pesanan_belum_bayar' => function () use ($request, $user) {
                try {
                    $unpaidOrder = null;
                    if ($user) {
                        $unpaidOrder = \App\Models\Pesanan::with('pembayaran')
                            ->where('pengguna_id', $user->id)
                            ->where('status', 'belum_bayar')
                            ->latest()
                            ->first();
                    } else {
                        $nomorPesananTerakhir = $request->session()->get('nomor_pesanan_terakhir');
                        if ($nomorPesananTerakhir) {
                            $unpaidOrder = \App\Models\Pesanan::with('pembayaran')
                                ->where('nomor_pesanan', $nomorPesananTerakhir)
                                ->where('status', 'belum_bayar')
                                ->first();
                        }
                    }

                    if (!$unpaidOrder) {
                        return null;
                    }

                    return [
                        'nomor_pesanan' => $unpaidOrder->nomor_pesanan,
                        'total' => (float) $unpaidOrder->total,
                        'batas_waktu' => $unpaidOrder->pembayaran?->waktu_kedaluwarsa 
                            ? \Carbon\Carbon::parse($unpaidOrder->pembayaran->waktu_kedaluwarsa)->toIso8601String()
                            : $unpaidOrder->created_at->addHours(24)->toIso8601String(),
                        'metode' => $unpaidOrder->pembayaran?->metode_bayar ?? 'Midtrans',
                    ];
                } catch (\Throwable $e) {
                    return null;
                }
            },
        ];
    }
}
