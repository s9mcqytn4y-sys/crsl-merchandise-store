<?php
/**
 * Inisialisasi Basis Data SQLite
 * Menjalankan skema dan data bibit (seed) ke dalam file data/toko.db
 */

define('CRSL_APP', true);
require_once __DIR__ . '/../konfigurasi/aplikasi.php';

try {
    $dbDir = dirname(DB_PATH);
    if (!is_dir($dbDir)) {
        mkdir($dbDir, 0755, true);
    }

    $pdo = new PDO('sqlite:' . DB_PATH);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Eksekusi skema
    $skemaSql = file_get_contents(__DIR__ . '/skema.sql');
    $pdo->exec($skemaSql);
    echo "✓ Skema database berhasil diterapkan.\n";

    // Cek apakah kategori sudah ada
    $stmt = $pdo->query("SELECT COUNT(*) FROM kategori");
    if ($stmt->fetchColumn() == 0) {
        $bibitSql = file_get_contents(__DIR__ . '/bibit.sql');
        $pdo->exec($bibitSql);
        echo "✓ Data awal (seed) berhasil dimasukkan.\n";
    } else {
        echo "ℹ Data awal sudah ada, melewati seed.\n";
    }

    echo "Basis data siap di: " . DB_PATH . "\n";
} catch (PDOException $e) {
    echo "Gagal inisialisasi basis data: " . $e->getMessage() . "\n";
    exit(1);
}
