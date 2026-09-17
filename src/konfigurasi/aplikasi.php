<?php
/**
 * Konfigurasi Aplikasi
 * Memuat environment variables dan konstanta
 */

// Cegah akses langsung
if (!defined('CRSL_APP')) {
    exit('Akses langsung tidak diizinkan.');
}

// Root paths
define('ROOT_DIR', dirname(__DIR__, 2));
define('PUBLIK_DIR', ROOT_DIR . '/publik');
define('SRC_DIR', ROOT_DIR . '/src');
define('DATA_DIR', ROOT_DIR . '/data');

// App config
define('APP_NAMA', 'CRSL Merchandise Store');
define('APP_DEBUG', true);
define('APP_URL', 'http://localhost:8000');

// Database
define('DB_PATH', DATA_DIR . '/toko.db');

// Defaults
define('BAHASA_DEFAULT', 'id');
define('MATA_UANG_DEFAULT', 'IDR');
