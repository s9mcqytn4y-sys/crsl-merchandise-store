<?php

declare(strict_types=1);

return [
    /*
    |--------------------------------------------------------------------------
    | Konfigurasi Kurir & Ekspedisi Pengiriman Resmi CRSL Store
    |--------------------------------------------------------------------------
    */
    'kurir' => [
        [
            'id'          => 'jne',
            'kurir_kode'  => 'jne',
            'nama'        => 'JNE Express',
            'layanan'     => 'Reguler (2 - 3 hari kerja)',
            'biaya'       => 18000,
            'ikon'        => '/assets/ikon/kurir-jne.svg',
            'aktif'       => true,
        ],
        [
            'id'          => 'sicepat',
            'kurir_kode'  => 'sicepat',
            'nama'        => 'SiCepat Ekspres',
            'layanan'     => 'SiUntung (2 - 3 hari kerja)',
            'biaya'       => 17000,
            'ikon'        => '/assets/ikon/kurir-sicepat.svg',
            'aktif'       => true,
        ],
        [
            'id'          => 'jnt',
            'kurir_kode'  => 'jnt',
            'nama'        => 'J&T Express',
            'layanan'     => 'EZ (2 - 3 hari kerja)',
            'biaya'       => 19000,
            'ikon'        => '/assets/ikon/kurir-jnt.svg',
            'aktif'       => true,
        ],
        [
            'id'          => 'pos',
            'kurir_kode'  => 'pos',
            'nama'        => 'POS Indonesia',
            'layanan'     => 'Pos Reguler (2 - 4 hari kerja)',
            'biaya'       => 15000,
            'ikon'        => '/assets/ikon/kurir-pos.svg',
            'aktif'       => true,
        ],
        [
            'id'          => 'tiki',
            'kurir_kode'  => 'tiki',
            'nama'        => 'TIKI',
            'layanan'     => 'Regular Service (2 - 3 hari kerja)',
            'biaya'       => 17000,
            'ikon'        => '/assets/ikon/kurir-tiki.svg',
            'aktif'       => true,
        ],
    ],

    /*
    | Default asal pengiriman (Warehouse CRSL Johar Baru, Jakarta Pusat)
    */
    'asal' => [
        'area_id'      => env('BITESHIP_ORIGIN_AREA_ID', 'IDNP5IDNC412IDND5043IDZ55281'),
        'provinsi'     => env('SHIPPING_ORIGIN_PROVINCE', 'D.I. Yogyakarta'),
        'kota'         => env('SHIPPING_ORIGIN_CITY', 'Sleman'),
        'kecamatan'    => env('SHIPPING_ORIGIN_SUBDISTRICT', 'Johar Baru'),
        'kode_pos'     => env('SHIPPING_ORIGIN_POSTAL_CODE', '10560'),
        'alamat'       => env('SHIPPING_ORIGIN_ADDRESS', 'Jl. Percetakan Negara 2, Johar Baru'),
    ],
];
