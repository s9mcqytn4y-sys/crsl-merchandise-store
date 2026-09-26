<?php

declare(strict_types=1);

return [
    /*
    |--------------------------------------------------------------------------
    | Konfigurasi Kurir & Ekspedisi Pengiriman Resmi CRSL Store
    |--------------------------------------------------------------------------
    |
    | Mendukung integrasi Biteship API dengan fallback tarif flat terkalibrasi
    | saat lingkungan local/sandbox development.
    |
    */
    'kurir' => [
        [
            'id'          => 'jne',
            'kurir_kode'  => 'jne',
            'nama'        => 'JNE Reguler',
            'layanan'     => 'Reguler (2 - 3 hari kerja)',
            'biaya'       => 18000,
            'ikon'        => '/assets/ikon/kurir-jne.svg',
            'aktif'       => true,
        ],
        [
            'id'          => 'sicepat',
            'kurir_kode'  => 'sicepat',
            'nama'        => 'SiCepat SiUntung',
            'layanan'     => 'SiUntung (2 - 3 hari kerja)',
            'biaya'       => 17000,
            'ikon'        => '/assets/ikon/kurir-sicepat.svg',
            'aktif'       => true,
        ],
        [
            'id'          => 'jnt',
            'kurir_kode'  => 'jnt',
            'nama'        => 'J&T Express EZ',
            'layanan'     => 'EZ (2 - 3 hari kerja)',
            'biaya'       => 19000,
            'ikon'        => '/assets/ikon/kurir-jnt.svg',
            'aktif'       => true,
        ],
    ],

    /*
    | Default asal pengiriman (Warehouse CRSL Store Yogyakarta)
    */
    'asal' => [
        'area_id'      => 'IDNP11KOT789311', // Sleman / Yogyakarta
        'provinsi'     => 'DI Yogyakarta',
        'kota'         => 'Kabupaten Sleman',
        'kecamatan'    => 'Depok',
        'kode_pos'     => '55281',
    ],
];
