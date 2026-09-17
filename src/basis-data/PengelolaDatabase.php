<?php
/**
 * CRSL Merchandise Store - Pengelola Database
 * Wrapper PDO untuk SQLite database
 */

if (!defined('CRSL_APP')) {
    exit('Akses langsung tidak diizinkan.');
}

class PengelolaDatabase
{
    private static ?PDO $koneksi = null;

    /**
     * Dapatkan koneksi PDO singleton
     */
    public static function ambilKoneksi(): PDO
    {
        if (self::$koneksi === null) {
            $dbDir = dirname(DB_PATH);
            if (!is_dir($dbDir)) {
                mkdir($dbDir, 0755, true);
            }

            self::$koneksi = new PDO('sqlite:' . DB_PATH, null, null, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
            ]);

            // Aktifkan foreign keys di SQLite
            self::$koneksi->exec('PRAGMA foreign_keys = ON;');
        }

        return self::$koneksi;
    }

    /**
     * Jalankan query dengan parameter binding
     */
    public static function kueri(string $sql, array $params = []): PDOStatement
    {
        $stmt = self::ambilKoneksi()->prepare($sql);
        $stmt->execute($params);
        return $stmt;
    }

    /**
     * Ambil satu baris hasil
     */
    public static function ambilSatu(string $sql, array $params = []): ?array
    {
        $hasil = self::kueri($sql, $params)->fetch();
        return $hasil ?: null;
    }

    /**
     * Ambil semua baris hasil
     */
    public static function ambilSemua(string $sql, array $params = []): array
    {
        return self::kueri($sql, $params)->fetchAll();
    }

    /**
     * Ambil ID terakhir yang dimasukkan
     */
    public static function ambilIdTerakhir(): string|false
    {
        return self::ambilKoneksi()->lastInsertId();
    }
}
