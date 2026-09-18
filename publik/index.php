<?php
/**
 * CRSL Merchandise Store - Entry Point & Router
 * Menangani routing request ke halaman yang sesuai
 */

define('CRSL_APP', true);
require_once __DIR__ . '/../src/konfigurasi/aplikasi.php';

use CRSL\BasisData\PengelolaDatabase;
use CRSL\Otentikasi\PengelolaOtentikasi;
use CRSL\Pesanan\PengelolaPesanan;

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

// Inisialisasi sesi persisten global
if (session_status() === PHP_SESSION_NONE) {
    session_set_cookie_params([
        'lifetime' => 2592000,
        'path' => '/',
        'httponly' => true,
        'samesite' => 'Lax'
    ]);
    session_start();
}

// API routes
if (str_starts_with($uri, '/api/auth/')) {
    header('Content-Type: application/json; charset=utf-8');
    require_once ROOT_DIR . '/src/basis-data/PengelolaDatabase.php';
    require_once ROOT_DIR . '/src/otentikasi/PengelolaOtentikasi.php';

    $db = PengelolaDatabase::dapatkanKoneksi();
    $auth = new PengelolaOtentikasi($db);

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

// Pesanan API routes
if (str_starts_with($uri, '/api/pesanan/')) {
    header('Content-Type: application/json; charset=utf-8');
    $db = PengelolaDatabase::dapatkanKoneksi();
    $auth = new PengelolaOtentikasi($db);
    $pengelolaPesanan = new PengelolaPesanan($db);

    $user = $auth->getActiveUser();
    $rawInput = file_get_contents('php://input');
    $data = json_decode($rawInput, true) ?: $_POST;

    if ($uri === '/api/pesanan/buat') {
        if (!$user) {
            http_response_code(401);
            echo json_encode(['sukses' => false, 'pesan' => 'Silakan masuk ke akun Anda terlebih dahulu untuk menyelesaikan pesanan.']);
            exit;
        }
        $res = $pengelolaPesanan->buatPesanan($data, (int)$user['id']);
        http_response_code($res['status']);
        echo json_encode($res);
        exit;
    }

    if ($uri === '/api/pesanan/daftar') {
        if (!$user) {
            http_response_code(401);
            echo json_encode(['sukses' => false, 'pesan' => 'Sesi login telah berakhir.']);
            exit;
        }
        $statusFilter = $_GET['status'] ?? null;
        $daftar = $pengelolaPesanan->ambilDaftarPesananPengguna((int)$user['id'], $statusFilter);
        http_response_code(200);
        echo json_encode(['sukses' => true, 'pesanan' => $daftar]);
        exit;
    }

    if ($uri === '/api/pesanan/detail') {
        $nomor = $_GET['nomor'] ?? '';
        $pesanan = $pengelolaPesanan->ambilDetailPesanan($nomor, $user ? (int)$user['id'] : null);
        if (!$pesanan) {
            http_response_code(404);
            echo json_encode(['sukses' => false, 'pesan' => 'Pesanan tidak ditemukan.']);
            exit;
        }
        http_response_code(200);
        echo json_encode(['sukses' => true, 'pesanan' => $pesanan]);
        exit;
    }

    if ($uri === '/api/pesanan/bayar-simulasi') {
        $nomor = $data['nomor_pesanan'] ?? '';
        $res = $pengelolaPesanan->updateStatusPesanan($nomor, 'akan_dikirim');
        http_response_code($res['status']);
        echo json_encode($res);
        exit;
    }

    http_response_code(404);
    echo json_encode(['sukses' => false, 'pesan' => 'Endpoint pesanan tidak ditemukan.']);
    exit;
}

// Dynamic PDP routing: /products/{id}/{slug}, /products/{slug}, /produk/{id}/{slug}, /produk/{slug}
if (preg_match('#^/(?:produk|products)/(?:([0-9]+)/)?([^/]+)$#', $uri, $matches)) {
    $produkIdParam = !empty($matches[1]) ? (int)$matches[1] : null;
    $produkSlugRaw = urldecode($matches[2]);
    // Ekstrak base slug
    $produkSlug = explode('|', $produkSlugRaw)[0];
    $produkSlug = trim(explode('(', $produkSlug)[0]);
    $produkSlug = strtolower(preg_replace('/[^a-zA-Z0-9_-]+/', '-', trim($produkSlug)));
    $produkSlug = trim($produkSlug, '-');

    require_once __DIR__ . '/halaman/produk.php';
    exit;
}

// Dynamic Bundle routing: /bundles/{id}/{slug}, /bundles/{slug}, /bundle/{slug}
if (preg_match('#^/(?:bundle|bundles)/(?:([0-9]+)/)?([^/]+)$#', $uri, $matches)) {
    $bundleIdParam = !empty($matches[1]) ? (int)$matches[1] : null;
    $bundleSlug = urldecode($matches[2]);
    require_once __DIR__ . '/halaman/bundle-detail.php';
    exit;
}

// Dynamic Invoice/Pesanan routing: /invoice atau /invoice/{id} atau /pesanan/{id}
if ($uri === '/invoice' || preg_match('#^/(?:invoice|pesanan)/([a-zA-Z0-9_-]+)$#', $uri, $matches)) {
    $pesananId = $matches[1] ?? null;
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
