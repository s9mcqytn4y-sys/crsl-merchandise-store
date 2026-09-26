<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | File konfigurasi kredensial layanan pihak ketiga (Biteship, Midtrans, dll).
    | Jangan pernah memanggil env() langsung di dalam Controller/Service jika
    | aplikasi Anda menggunakan `php artisan config:cache`.
    |
    */

    'postmark' => [
        'key' => env('POSTMARK_API_KEY'),
    ],

    'resend' => [
        'key' => env('RESEND_API_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    // ============================================================
    // BITESIP LOGISTICS GATEWAY
    // ============================================================
    'biteship' => [
        'api_key' => env('BITESHIP_API_KEY'),
        'base_url' => env('BITESHIP_BASE_URL', 'https://api.biteship.com'),
        // Default area ID resmi untuk Depok, Sleman, DIY (gudang asal CRSL)
        'origin_area_id' => env('BITESHIP_ORIGIN_AREA_ID', 'IDNP5IDNC412IDND5043IDZ55281'),
        'origin_postal_code' => env('BITESHIP_ORIGIN_POSTAL_CODE', 55281),
        'origin_city' => env('BITESHIP_ORIGIN_CITY', 'Sleman, D.I. Yogyakarta'),
    ],

    // ============================================================
    // MIDTRANS PAYMENT GATEWAY
    // ============================================================
    'midtrans' => [
        'merchant_id' => env('MIDTRANS_MERCHANT_ID'),
        'server_key' => env('MIDTRANS_SERVER_KEY'),
        'client_key' => env('MIDTRANS_CLIENT_KEY'),
        'is_production' => (bool) env('MIDTRANS_IS_PRODUCTION', false),
        'allowed_ip' => env('MIDTRANS_ALLOWED_IP', '103.101.228.215'),
        'webhook_url' => env('MIDTRANS_WEBHOOK_URL'),
    ],

];
