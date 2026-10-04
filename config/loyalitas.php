<?php

/*
|--------------------------------------------------------------------------
| Aturan Bisnis Loyalitas CRSL Freen Membership
|--------------------------------------------------------------------------
| Satu sumber kebenaran untuk perhitungan poin. Data tier (ambang belanja,
| pengali, benefit) disimpan di tabel `tier_loyalitas`.
|
| Rumus poin didapat per pesanan lunas:
|   floor(total / kelipatan_belanja) * poin_per_kelipatan * pengali_poin_tier
|
| Poin & total belanja dikreditkan SEKALI saat pembayaran settlement
| (idempoten melalui tabel `riwayat_poin`).
*/

return [
    // Setiap kelipatan Rp 10.000 menghasilkan 10 poin dasar
    'kelipatan_belanja'   => (int) env('LOYALITAS_KELIPATAN_BELANJA', 10000),
    'poin_per_kelipatan'  => (int) env('LOYALITAS_POIN_PER_KELIPATAN', 10),

    // 1 poin = Rp 1 potongan saat checkout
    'nilai_tukar_poin'    => (int) env('LOYALITAS_NILAI_TUKAR_POIN', 1),

    // Batas maksimal porsi subtotal (setelah voucher) yang boleh dibayar dengan poin
    'maks_persen_tukar'   => (int) env('LOYALITAS_MAKS_PERSEN_TUKAR', 100),

    // Bonus poin registrasi akun baru
    'bonus_registrasi'    => (int) env('LOYALITAS_BONUS_REGISTRASI', 100),

    // TTL cache daftar tier & voucher publik (detik)
    'cache_ttl'           => 300,
];
