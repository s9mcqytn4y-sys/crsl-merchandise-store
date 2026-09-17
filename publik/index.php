<?php
/**
 * CRSL Merchandise Store - Entry Point & Router
 * Menangani routing request ke halaman yang sesuai
 */

define('CRSL_APP', true);
require_once __DIR__ . '/../src/konfigurasi/aplikasi.php';

// Parse request URI
$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$uri = rtrim($uri, '/') ?: '/';

// Static file serving for PHP built-in server
if (php_sapi_name() === 'cli-server') {
    $staticExtensions = ['css', 'js', 'svg', 'png', 'jpg', 'jpeg', 'gif', 'woff2', 'json', 'ico'];
    $ext = pathinfo($uri, PATHINFO_EXTENSION);

    if (in_array($ext, $staticExtensions)) {
        // Check in publik/ first
        $filePath = __DIR__ . $uri;
        if (file_exists($filePath)) {
            return false; // Let PHP built-in server handle it
        }

        // Check in project root (for /aset/ and /src/ paths)
        $rootPath = ROOT_DIR . $uri;
        if (file_exists($rootPath)) {
            $mimeTypes = [
                'css' => 'text/css',
                'js' => 'text/javascript',
                'svg' => 'image/svg+xml',
                'png' => 'image/png',
                'jpg' => 'image/jpeg',
                'jpeg' => 'image/jpeg',
                'gif' => 'image/gif',
                'woff2' => 'font/woff2',
                'json' => 'application/json',
                'ico' => 'image/x-icon',
            ];
            header('Content-Type: ' . ($mimeTypes[$ext] ?? 'application/octet-stream'));
            readfile($rootPath);
            return;
        }
    }
}

// Routing
switch ($uri) {
    case '/':
        require_once __DIR__ . '/halaman/beranda.php';
        break;

    case '/akun':
        require_once __DIR__ . '/halaman/akun.php';
        break;

    default:
        http_response_code(404);
        echo '<!DOCTYPE html><html lang="id"><head><meta charset="utf-8"><title>404</title></head>';
        echo '<body><h1>Halaman tidak ditemukan</h1><a href="/">Kembali ke beranda</a></body></html>';
        break;
}
