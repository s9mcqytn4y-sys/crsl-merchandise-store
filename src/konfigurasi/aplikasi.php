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

// Autoloader untuk namespace CRSL
spl_autoload_register(function ($class) {
    $prefix = 'CRSL\\';
    $base_dir = SRC_DIR . '/';
    $len = strlen($prefix);
    if (strncmp($prefix, $class, $len) !== 0) {
        return;
    }
    $relative_class = substr($class, $len);
    $map = [
        'BasisData\\' => 'basis-data/',
        'Otentikasi\\' => 'otentikasi/',
        'Pesanan\\' => 'pesanan/',
        'Konfigurasi\\' => 'konfigurasi/'
    ];
    foreach ($map as $ns => $dir) {
        if (str_starts_with($relative_class, $ns)) {
            $file = $base_dir . $dir . str_replace('\\', '/', substr($relative_class, strlen($ns))) . '.php';
            if (file_exists($file)) {
                require_once $file;
                return;
            }
        }
    }
});

require_once SRC_DIR . '/basis-data/PengelolaDatabase.php';
