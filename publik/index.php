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
    require_once ROOT_DIR . '/src/pesanan/PengelolaPesanan.php';
    $db = PengelolaDatabase::dapatkanKoneksi();
    $auth = new PengelolaOtentikasi($db);
    $pengelolaPesanan = new PengelolaPesanan($db);

    $user = $auth->getActiveUser();
    $rawInput = file_get_contents('php://input');
    $data = json_decode($rawInput, true) ?: [];

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
        $userId = $user ? (int)$user['id'] : 0;
        if (!$userId) { http_response_code(401); echo json_encode(['sukses' => false, 'pesan' => 'Login diperlukan.']); exit; }
        $statusFilter = $_GET['status'] ?? null;
        $daftar = $pengelolaPesanan->ambilDaftarPesananPengguna($userId, $statusFilter);
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

    // Retry pembayaran untuk pesanan kedaluwarsa
    if ($uri === '/api/pesanan/retry-bayar') {
        if (!$user) { http_response_code(401); echo json_encode(['sukses' => false, 'pesan' => 'Login diperlukan.']); exit; }
        $nomor = $data['nomor_pesanan'] ?? '';
        $res = $pengelolaPesanan->retryBayar($nomor, (int)$user['id']);
        http_response_code($res['status']);
        echo json_encode($res);
        exit;
    }

    // Polling status pesanan tunggal
    if (preg_match('#^/api/pesanan/status/(.+)$#', $uri, $mPesanan)) {
        if (!$user) { http_response_code(401); echo json_encode(['sukses' => false, 'pesan' => 'Login diperlukan.']); exit; }
        $nomor = urldecode($mPesanan[1]);
        $detail = $pengelolaPesanan->statusPesanan($nomor, (int)$user['id']);
        if (!$detail) { http_response_code(404); echo json_encode(['sukses' => false, 'pesan' => 'Pesanan tidak ditemukan.']); exit; }
        echo json_encode(['sukses' => true, 'pesanan' => $detail]);
        exit;
    }

    http_response_code(404);
    echo json_encode(['sukses' => false, 'pesan' => 'Endpoint pesanan tidak ditemukan.']);
    exit;
}

// Produk API routes (Dynamic search & catalog)
if (str_starts_with($uri, '/api/produk/')) {
    header('Content-Type: application/json; charset=utf-8');
    $db = PengelolaDatabase::dapatkanKoneksi();
    if ($uri === '/api/produk/daftar' || $uri === '/api/produk/cari') {
        $q = trim($_GET['q'] ?? '');
        if ($q !== '') {
            $stmt = $db->prepare("
                SELECT p.*, k.nama as nama_kategori
                FROM produk p
                LEFT JOIN kategori k ON p.kategori_id = k.id
                WHERE p.aktif = 1 AND (
                    p.nama LIKE :q OR p.slug LIKE :q OR p.deskripsi LIKE :q OR k.nama LIKE :q
                )
                ORDER BY p.id DESC
                LIMIT 20
            ");
            $stmt->execute([':q' => "%$q%"]);
        } else {
            $stmt = $db->query("
                SELECT p.*, k.nama as nama_kategori
                FROM produk p
                LEFT JOIN kategori k ON p.kategori_id = k.id
                WHERE p.aktif = 1
                ORDER BY p.id DESC
                LIMIT 20
            ");
        }
        $produk = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode(['sukses' => true, 'produk' => $produk]);
        exit;
    }
    http_response_code(404);
    echo json_encode(['sukses' => false, 'pesan' => 'Endpoint produk tidak ditemukan.']);
    exit;
}

// Pesan Produk API route (Inquiry pop-up Gambar 5)
if ($uri === '/api/pesan/kirim') {
    header('Content-Type: application/json; charset=utf-8');
    $db = PengelolaDatabase::dapatkanKoneksi();
    $rawInput = file_get_contents('php://input');
    $data = json_decode($rawInput, true) ?: $_POST;

    $produkId = (int)($data['produk_id'] ?? 0);
    $pesan = trim($data['pesan'] ?? '');
    $identitas = trim($data['identitas'] ?? 'Pelanggan');

    if ($pesan === '') {
        http_response_code(422);
        echo json_encode(['sukses' => false, 'pesan' => 'Pesan tidak boleh kosong.']);
        exit;
    }

    $stmt = $db->prepare("INSERT INTO pesan_produk (produk_id, identitas_pengguna, pesan) VALUES (:pid, :identitas, :pesan)");
    $stmt->execute([
        ':pid' => $produkId,
        ':identitas' => $identitas,
        ':pesan' => $pesan
    ]);

    http_response_code(200);
    echo json_encode(['sukses' => true, 'pesan' => 'Pesan berhasil terkirim ke tim CRSL!']);
    exit;
}

// Voucher & Loyalty API routes
if (str_starts_with($uri, '/api/voucher/')) {
    header('Content-Type: application/json; charset=utf-8');
    require_once ROOT_DIR . '/src/pesanan/PengelolaPesanan.php';
    $db = PengelolaDatabase::dapatkanKoneksi();
    $auth = new PengelolaOtentikasi($db);
    $user = $auth->getActiveUser();
    $rawInput = file_get_contents('php://input');
    $vData = json_decode($rawInput, true) ?: [];

    if ($uri === '/api/voucher/tersedia') {
        $stmt = $db->query("SELECT id, kode, judul, tipe, nilai, min_belanja, berlaku_sampai FROM voucher WHERE aktif = 1 ORDER BY id ASC");
        $vouchers = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode(['sukses' => true, 'voucher' => $vouchers]);
        exit;
    }

    if ($uri === '/api/voucher/validasi') {
        $kode    = trim($vData['kode'] ?? '');
        $subtotal = (int)($vData['subtotal'] ?? 0);
        $userId   = $user ? (int)$user['id'] : 0;
        $pengelolaPesanan = new PengelolaPesanan($db);
        $res = $pengelolaPesanan->validasiVoucher($kode, $subtotal, $userId);
        http_response_code($res['status']);
        echo json_encode($res);
        exit;
    }

    http_response_code(404);
    echo json_encode(['sukses' => false, 'pesan' => 'Endpoint voucher tidak ditemukan.']);
    exit;
}

// Pesanan API routes (Checkout, Status, Bayar Simulasi, Retry)
if (str_starts_with($uri, '/api/pesanan/')) {
    header('Content-Type: application/json; charset=utf-8');
    require_once ROOT_DIR . '/src/pesanan/PengelolaPesanan.php';
    $db = PengelolaDatabase::dapatkanKoneksi();
    $auth = new PengelolaOtentikasi($db);
    $user = $auth->getActiveUser();
    $pengelolaPesanan = new PengelolaPesanan($db);
    $rawInput = file_get_contents('php://input');
    $pData = json_decode($rawInput, true) ?: $_POST ?: [];

    if ($uri === '/api/pesanan/buat') {
        if (!$user) {
            http_response_code(401);
            echo json_encode(['sukses' => false, 'pesan' => 'Silakan masuk ke akun Anda terlebih dahulu untuk menyelesaikan pesanan.']);
            exit;
        }
        $res = $pengelolaPesanan->buatPesanan($pData, (int)$user['id']);
        http_response_code($res['status']);
        echo json_encode($res);
        exit;
    }

    if ($uri === '/api/pesanan/status') {
        $nomor = trim($pData['nomor_pesanan'] ?? $_GET['nomor'] ?? '');
        if (!$nomor) {
            http_response_code(400);
            echo json_encode(['sukses' => false, 'pesan' => 'Nomor pesanan harus dicantumkan.']);
            exit;
        }
        $userId = $user ? (int)$user['id'] : 0;
        $order = $pengelolaPesanan->statusPesanan($nomor, $userId);
        if (!$order) {
            http_response_code(404);
            echo json_encode(['sukses' => false, 'pesan' => 'Pesanan tidak ditemukan.']);
            exit;
        }
        echo json_encode(['sukses' => true, 'pesanan' => $order]);
        exit;
    }

    if ($uri === '/api/pesanan/bayar-simulasi') {
        $nomor = trim($pData['nomor_pesanan'] ?? '');
        if (!$nomor) {
            http_response_code(400);
            echo json_encode(['sukses' => false, 'pesan' => 'Nomor pesanan harus dicantumkan.']);
            exit;
        }
        $res = $pengelolaPesanan->bayarSimulasi($nomor);
        http_response_code($res['status']);
        echo json_encode($res);
        exit;
    }

    if ($uri === '/api/pesanan/retry') {
        $nomor = trim($pData['nomor_pesanan'] ?? '');
        if (!$nomor) {
            http_response_code(400);
            echo json_encode(['sukses' => false, 'pesan' => 'Nomor pesanan harus dicantumkan.']);
            exit;
        }
        $userId = $user ? (int)$user['id'] : 0;
        $res = $pengelolaPesanan->retryBayar($nomor, $userId);
        http_response_code($res['status']);
        echo json_encode($res);
        exit;
    }

    http_response_code(404);
    echo json_encode(['sukses' => false, 'pesan' => 'Endpoint pesanan tidak ditemukan.']);
    exit;
}

if (str_starts_with($uri, '/api/loyalitas/')) {
    header('Content-Type: application/json; charset=utf-8');
    $db = PengelolaDatabase::dapatkanKoneksi();
    if ($uri === '/api/loyalitas/tiers') {
        $stmt = $db->query("SELECT * FROM tier_loyalitas ORDER BY urutan ASC");
        $tiers = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode(['sukses' => true, 'tiers' => $tiers]);
        exit;
    }
    http_response_code(404);
    echo json_encode(['sukses' => false, 'pesan' => 'Endpoint loyalitas tidak ditemukan.']);
    exit;
}

// Katalog All Products: /products, /produk, /katalog
if ($uri === '/products' || $uri === '/produk' || $uri === '/katalog') {
    require_once __DIR__ . '/halaman/katalog.php';
    exit;
}

// Kategori Filter: /kategori/{slug}
if (preg_match('#^/kategori/([^/]+)$#', $uri, $matches)) {
    $kategoriSlugParam = urldecode($matches[1]);
    require_once __DIR__ . '/halaman/katalog.php';
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

// Dynamic Invoice/Pesanan routing: /invoice/{nomor} - support INV/CRSL/... format
if ($uri === '/invoice' || preg_match('#^/(?:invoice|pesanan)/(.+)$#', $uri, $matches)) {
    $nomorPesanan = isset($matches[1]) ? urldecode($matches[1]) : ($_GET['nomor'] ?? null);
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
