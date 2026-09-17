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
    $staticExtensions = ['css', 'js', 'svg', 'png', 'jpg', 'jpeg', 'gif', 'woff2', 'json', 'ico', 'webp'];
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
                'webp' => 'image/webp',
            ];
            header('Content-Type: ' . ($mimeTypes[$ext] ?? 'application/octet-stream'));
            readfile($rootPath);
            return;
        }
    }
}

// API routes
if (str_starts_with($uri, '/api/auth/')) {
    header('Content-Type: application/json; charset=utf-8');
    require_once ROOT_DIR . '/src/basis-data/PengelolaDatabase.php';
    require_once ROOT_DIR . '/src/otentikasi/PengelolaOtentikasi.php';

    $db = \CRSL\BasisData\PengelolaDatabase::dapatkanKoneksi();
    $auth = new \CRSL\Otentikasi\PengelolaOtentikasi($db);

    $rawInput = file_get_contents('php://input');
    $data = json_decode($rawInput, true) ?: $_POST;

    if ($uri === '/api/auth/login') {
        $res = $auth->login($data['identitas'] ?? '', $data['sandi'] ?? '');
        http_response_code($res['status']);
        echo json_encode($res);
        exit;
    }
    if ($uri === '/api/auth/register') {
        $res = $auth->register($data);
        http_response_code($res['status']);
        echo json_encode($res);
        exit;
    }
    if ($uri === '/api/auth/verify') {
        $res = $auth->verify($data['kode'] ?? '', $data['email'] ?? '');
        http_response_code($res['status']);
        echo json_encode($res);
        exit;
    }
    if ($uri === '/api/auth/logout') {
        $res = $auth->logout();
        http_response_code($res['status']);
        echo json_encode($res);
        exit;
    }
    if ($uri === '/api/auth/me') {
        $user = $auth->getActiveUser();
        http_response_code($user ? 200 : 401);
        echo json_encode(['sukses' => (bool)$user, 'data' => $user]);
        exit;
    }

    http_response_code(404);
    echo json_encode(['sukses' => false, 'pesan' => 'API endpoint tidak ditemukan.']);
    exit;
}

// Dynamic PDP routing: /produk/{slug} atau /products/{slug}
if (preg_match('#^/(?:produk|products)/([a-zA-Z0-9_-]+)$#', $uri, $matches)) {
    $produkSlug = $matches[1];
    require_once __DIR__ . '/halaman/produk.php';
    exit;
}

// Dynamic Bundle routing: /bundle/{slug} atau /bundles/{id}/{slug} atau /bundles/{slug}
if (preg_match('#^/(?:bundle|bundles)/(?:[0-9]+/)?([a-zA-Z0-9_-]+)$#', $uri, $matches)) {
    $bundleSlug = $matches[1];
    require_once __DIR__ . '/halaman/bundle-detail.php';
    exit;
}

// Dynamic Invoice/Pesanan routing: /invoice/{id} atau /pesanan/{id}
if (preg_match('#^/(?:invoice|pesanan)/([a-zA-Z0-9_-]+)$#', $uri, $matches)) {
    $pesananId = $matches[1];
    require_once __DIR__ . '/halaman/invoice.php';
    exit;
}

// Routing
switch ($uri) {
    case '/':
        require_once __DIR__ . '/halaman/beranda.php';
        break;

    case '/akun':
        require_once __DIR__ . '/halaman/akun.php';
        break;

    case '/checkout':
        require_once __DIR__ . '/halaman/checkout.php';
        break;

    default:
        http_response_code(404);
        echo '<!DOCTYPE html><html lang="id"><head><meta charset="utf-8"><title>404</title></head>';
        echo '<body><h1>Halaman tidak ditemukan</h1><a href="/">Kembali ke beranda</a></body></html>';
        break;
}
