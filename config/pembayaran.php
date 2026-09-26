<?php

declare(strict_types=1);

return [
    /*
    |--------------------------------------------------------------------------
    | Saluran Pembayaran Resmi CRSL Store
    |--------------------------------------------------------------------------
    |
    | Konfigurasi metode pembayaran yang aktif dan didukung oleh sistem Direct
    | Core API Payment. Dapat ditambah atau dinonaktifkan tanpa mengubah kode.
    |
    */
    'metode' => [
        [
            'id'        => 'qris',
            'nama'      => 'QRIS',
            'subjudul'  => 'GoPay, OVO, ShopeePay, Dana, LinkAja, BCA Mobile',
            'tipe'      => 'Instant Payment',
            'ikon'      => '/assets/ikon/payment-qris.svg',
            'aktif'     => true,
        ],
        [
            'id'        => 'bca',
            'nama'      => 'BCA Virtual Account',
            'subjudul'  => 'Verifikasi Otomatis 24 Jam',
            'tipe'      => 'Virtual Account',
            'ikon'      => '/assets/ikon/payment-bca.svg',
            'aktif'     => true,
        ],
        [
            'id'        => 'mandiri',
            'nama'      => 'Mandiri Bill Payment',
            'subjudul'  => "Livin' by Mandiri & ATM Mandiri",
            'tipe'      => 'Virtual Account',
            'ikon'      => '/assets/ikon/payment-mandiri.svg',
            'aktif'     => true,
        ],
        [
            'id'        => 'bni',
            'nama'      => 'BNI Virtual Account',
            'subjudul'  => 'BNI Mobile Banking & ATM BNI',
            'tipe'      => 'Virtual Account',
            'ikon'      => '/assets/ikon/payment-bni.svg',
            'aktif'     => true,
        ],
        [
            'id'        => 'bri',
            'nama'      => 'BRI Virtual Account (BRIVA)',
            'subjudul'  => 'BRImo & ATM BRI',
            'tipe'      => 'Virtual Account',
            'ikon'      => '/assets/ikon/payment-bri.svg',
            'aktif'     => true,
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Biaya Tambahan & Asuransi
    |--------------------------------------------------------------------------
    */
    'biaya_asuransi' => 2500,
    'maksimal_potongan_loyalitas_persen' => 50,
];
