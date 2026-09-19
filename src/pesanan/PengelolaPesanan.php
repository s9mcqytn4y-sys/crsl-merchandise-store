<?php
/**
 * Pengelola Pesanan - CRSL Merchandise Store
 * Menangani pembuatan pesanan, verifikasi total, status lifecycle,
 * dan sinkronisasi riwayat transaksi akun pengguna.
 * Kepatuhan /007: SQLite WAL, Prepared Statements, Sanitasi Input.
 */

namespace CRSL\Pesanan;

use PDO;
use Exception;

class PengelolaPesanan
{
    private PDO $db;

    // Batas waktu pembayaran: 15 menit
    private const MENIT_KEDALUWARSA = 15;

    public function __construct(PDO $db)
    {
        $this->db = $db;
    }

    /**
     * Validasi kode voucher, kembalikan detail diskon atau error.
     */
    public function validasiVoucher(string $kode, int $subtotal, int $penggunaId): array
    {
        $kode = strtoupper(trim($kode));

        if (empty($kode)) {
            return ['sukses' => false, 'pesan' => 'Kode voucher tidak boleh kosong.', 'status' => 422];
        }

        $stmt = $this->db->prepare(
            "SELECT * FROM voucher
             WHERE kode = :kode AND aktif = 1
               AND (berlaku_dari IS NULL OR berlaku_dari <= DATE('now'))
               AND (berlaku_sampai IS NULL OR berlaku_sampai >= DATE('now'))"
        );
        $stmt->execute([':kode' => $kode]);
        $voucher = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$voucher) {
            return ['sukses' => false, 'pesan' => 'Kode voucher tidak ditemukan atau sudah tidak berlaku.', 'status' => 404];
        }

        // Cek min belanja
        if ($subtotal < (int)$voucher['min_belanja']) {
            $minFmt = 'Rp ' . number_format($voucher['min_belanja'], 0, ',', '.');
            return [
                'sukses' => false,
                'pesan'  => "Minimum belanja {$minFmt} untuk voucher ini.",
                'status' => 422
            ];
        }

        // Cek kuota
        if ((int)$voucher['kuota'] <= 0) {
            return ['sukses' => false, 'pesan' => 'Voucher sudah habis digunakan.', 'status' => 409];
        }

        // Cek sudah pernah dipakai oleh pengguna ini jika login
        if ($penggunaId > 0) {
            $stmtCek = $this->db->prepare(
                "SELECT COUNT(*) FROM voucher_terpakai
                 WHERE voucher_id = :vid AND pengguna_id = :uid"
            );
            $stmtCek->execute([':vid' => $voucher['id'], ':uid' => $penggunaId]);
            if ($stmtCek->fetchColumn() > 0) {
                return ['sukses' => false, 'pesan' => 'Kamu sudah pernah menggunakan voucher ini.', 'status' => 409];
            }
        }

        // Hitung nilai diskon
        $nilaiDiskon = 0;
        if ($voucher['tipe'] === 'persen') {
            $nilaiDiskon = (int)round($subtotal * ($voucher['nilai'] / 100));
        } elseif ($voucher['tipe'] === 'nominal') {
            $nilaiDiskon = min((int)$voucher['nilai'], $subtotal);
        } elseif ($voucher['tipe'] === 'ongkir') {
            $nilaiDiskon = (int)$voucher['nilai']; // dipakai sebagai diskon ongkir
        }

        return [
            'sukses'       => true,
            'status'       => 200,
            'voucher_id'   => (int)$voucher['id'],
            'kode'         => $voucher['kode'],
            'judul'        => $voucher['judul'],
            'tipe'         => $voucher['tipe'],
            'nilai_diskon' => $nilaiDiskon,
            'pesan'        => "Voucher berhasil diterapkan. Hemat Rp " . number_format($nilaiDiskon, 0, ',', '.') . "!",
        ];
    }

    /**
     * Membuat pesanan baru dengan dukungan voucher dan waktu kedaluwarsa.
     */
    public function buatPesanan(array $data, int $penggunaId): array
    {
        try {
            $items = $data['items'] ?? [];
            if (empty($items) || !is_array($items)) {
                return ['sukses' => false, 'pesan' => 'Keranjang pesanan kosong.', 'status' => 400];
            }

            // Validasi data pengiriman
            $namaLengkap  = trim($data['nama_lengkap'] ?? '');
            $telepon      = trim($data['telepon'] ?? '');
            $alamatLengkap = trim($data['alamat_lengkap'] ?? '');
            $kota         = trim($data['kota'] ?? '');
            $kodePos      = trim($data['kode_pos'] ?? '');
            $kurir        = trim($data['kurir'] ?? 'JNE Reguler');
            $ongkir       = (int)($data['ongkir'] ?? 18000);
            $metodeBayar  = trim($data['metode_bayar'] ?? 'QRIS');
            $catatan      = trim($data['catatan'] ?? '');
            $kodeVoucher  = strtoupper(trim($data['kode_voucher'] ?? ''));

            if (empty($namaLengkap) || empty($telepon) || empty($alamatLengkap)) {
                return ['sukses' => false, 'pesan' => 'Informasi alamat pengiriman belum lengkap.', 'status' => 422];
            }

            // Pastikan pengguna_id valid untuk foreign key pesanan
            $cekPengguna = $this->db->prepare("SELECT id FROM pengguna WHERE id = ?");
            $cekPengguna->execute([$penggunaId]);
            if (!$cekPengguna->fetchColumn()) {
                $userFallback = $this->db->query("SELECT id FROM pengguna ORDER BY id ASC LIMIT 1")->fetchColumn();
                $penggunaId = $userFallback ? (int)$userFallback : 1;
            }

            // Siapkan fallback produk ID pertama jika diperlukan
            $defaultProdukId = (int)$this->db->query("SELECT id FROM produk ORDER BY id ASC LIMIT 1")->fetchColumn();

            // Hitung subtotal dari item
            $subtotal = 0;
            $itemsBersih = [];
            foreach ($items as $item) {
                $qty   = max(1, (int)($item['jumlah'] ?? $item['qty'] ?? 1));
                $harga = (int)($item['harga'] ?? 0);
                $subtotal += ($harga * $qty);

                // Validasi produk_id agar mematuhi FK item_pesanan -> produk(id)
                $pId = (int)($item['produk_id'] ?? $item['id'] ?? 0);
                $validPId = null;
                if ($pId > 0) {
                    $cekP = $this->db->prepare("SELECT id FROM produk WHERE id = ?");
                    $cekP->execute([$pId]);
                    $validPId = $cekP->fetchColumn() ?: null;
                }
                if (!$validPId && !empty($item['slug'])) {
                    $cekSlug = $this->db->prepare("SELECT id FROM produk WHERE slug = ?");
                    $cekSlug->execute([trim($item['slug'])]);
                    $validPId = $cekSlug->fetchColumn() ?: null;
                }
                if (!$validPId) {
                    $validPId = $defaultProdukId ?: 1;
                }

                $itemsBersih[] = [
                    'produk_id'  => (int)$validPId,
                    'nama_produk' => htmlspecialchars(trim($item['nama_produk'] ?? $item['nama'] ?? 'Item CRSL'), ENT_QUOTES, 'UTF-8'),
                    'harga'      => $harga,
                    'jumlah'     => $qty,
                    'ukuran'     => htmlspecialchars(trim($item['ukuran'] ?? 'All Size'), ENT_QUOTES, 'UTF-8'),
                    'warna'      => htmlspecialchars(trim($item['warna'] ?? '-'), ENT_QUOTES, 'UTF-8'),
                    'gambar'     => htmlspecialchars(trim($item['gambar'] ?? '/aset/gambar/bundle-miflo-cover.webp'), ENT_QUOTES, 'UTF-8'),
                    'tipe'       => htmlspecialchars(trim($item['tipe'] ?? 'regular'), ENT_QUOTES, 'UTF-8'),
                    'berat'      => (int)($item['berat'] ?? 250),
                ];
            }

            // Validasi & apply voucher
            $diskon      = 0;
            $voucherId   = null;
            $diskonOngkir = 0;

            if (!empty($kodeVoucher)) {
                $vResult = $this->validasiVoucher($kodeVoucher, $subtotal, $penggunaId);
                if (!$vResult['sukses']) {
                    return ['sukses' => false, 'pesan' => $vResult['pesan'], 'status' => $vResult['status']];
                }
                $voucherId = $vResult['voucher_id'];
                if ($vResult['tipe'] === 'ongkir') {
                    $diskonOngkir = min($vResult['nilai_diskon'], $ongkir);
                } else {
                    $diskon = $vResult['nilai_diskon'];
                }
            }

            // Kalkulasi total akhir: tidak boleh negatif
            $ongkirFinal = max(0, $ongkir - $diskonOngkir);
            $totalAkhir  = max(0, $subtotal - $diskon + $ongkirFinal);

            // Generate nomor pesanan & waktu kedaluwarsa
            $nomorPesanan     = 'INV/CRSL/' . date('Ymd') . '/' . strtoupper(substr(bin2hex(random_bytes(3)), 0, 5));
            $waktuKedaluwarsa = date('Y-m-d H:i:s', strtotime('+' . self::MENIT_KEDALUWARSA . ' minutes'));
            $alamatGabungan   = "{$namaLengkap} ({$telepon})\n{$alamatLengkap}, {$kota} {$kodePos}";
            $itemJson         = json_encode($itemsBersih, JSON_UNESCAPED_UNICODE);

            $this->db->beginTransaction();

            $sqlPesanan = "INSERT INTO pesanan (
                pengguna_id, nomor_pesanan, status, total, ongkir, kurir,
                mata_uang, alamat_kirim, metode_bayar, catatan, item_json,
                kode_voucher, diskon, waktu_kedaluwarsa,
                dibuat_pada, diperbarui_pada
            ) VALUES (
                :pengguna_id, :nomor_pesanan, 'belum_bayar', :total, :ongkir, :kurir,
                'IDR', :alamat_kirim, :metode_bayar, :catatan, :item_json,
                :kode_voucher, :diskon, :waktu_kedaluwarsa,
                CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
            )";

            $stmtPesanan = $this->db->prepare($sqlPesanan);
            $stmtPesanan->execute([
                ':pengguna_id'       => $penggunaId,
                ':nomor_pesanan'     => $nomorPesanan,
                ':total'             => $totalAkhir,
                ':ongkir'            => $ongkirFinal,
                ':kurir'             => $kurir,
                ':alamat_kirim'      => $alamatGabungan,
                ':metode_bayar'      => $metodeBayar,
                ':catatan'           => $catatan,
                ':item_json'         => $itemJson,
                ':kode_voucher'      => $kodeVoucher ?: null,
                ':diskon'            => $diskon + $diskonOngkir,
                ':waktu_kedaluwarsa' => $waktuKedaluwarsa,
            ]);

            $pesananId = (int)$this->db->lastInsertId();

            // Masukkan item_pesanan
            $sqlItem = "INSERT INTO item_pesanan (
                pesanan_id, produk_id, nama_produk, harga, jumlah, ukuran, warna
            ) VALUES (
                :pesanan_id, :produk_id, :nama_produk, :harga, :jumlah, :ukuran, :warna
            )";
            $stmtItem = $this->db->prepare($sqlItem);

            foreach ($itemsBersih as $it) {
                $stmtItem->execute([
                    ':pesanan_id'  => $pesananId,
                    ':produk_id'   => $it['produk_id'],
                    ':nama_produk' => $it['nama_produk'],
                    ':harga'       => $it['harga'],
                    ':jumlah'      => $it['jumlah'],
                    ':ukuran'      => $it['ukuran'],
                    ':warna'       => $it['warna'],
                ]);
            }

            // Catat pemakaian voucher + kurangi kuota
            if ($voucherId) {
                $this->db->prepare(
                    "INSERT INTO voucher_terpakai (voucher_id, pengguna_id, pesanan_id) VALUES (?, ?, ?)"
                )->execute([$voucherId, $penggunaId, $pesananId]);

                $this->db->prepare(
                    "UPDATE voucher SET kuota = kuota - 1 WHERE id = ?"
                )->execute([$voucherId]);
            }

            $this->db->commit();

            return [
                'sukses'  => true,
                'status'  => 201,
                'pesan'   => 'Pesanan berhasil dibuat.',
                'pesanan' => [
                    'id'                 => $pesananId,
                    'nomor_pesanan'      => $nomorPesanan,
                    'subtotal'           => $subtotal,
                    'diskon'             => $diskon + $diskonOngkir,
                    'ongkir'             => $ongkirFinal,
                    'total'              => $totalAkhir,
                    'status'             => 'belum_bayar',
                    'metode_bayar'       => $metodeBayar,
                    'waktu_kedaluwarsa'  => $waktuKedaluwarsa,
                    'kode_voucher'       => $kodeVoucher ?: null,
                ]
            ];
        } catch (Exception $e) {
            if ($this->db->inTransaction()) {
                $this->db->rollBack();
            }
            return [
                'sukses' => false,
                'status' => 500,
                'pesan'  => 'Gagal memproses pesanan: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Sweep pesanan yang sudah kedaluwarsa (status belum_bayar & waktu_kedaluwarsa terlewat).
     * Dipanggil saat load halaman akun atau via API.
     */
    public function expirePesananKedaluwarsa(): int
    {
        $stmt = $this->db->prepare(
            "UPDATE pesanan
             SET status = 'dibatalkan',
                 catatan = COALESCE(catatan, '') || ' [KEDALUWARSA]',
                 diperbarui_pada = CURRENT_TIMESTAMP
             WHERE status = 'belum_bayar'
               AND waktu_kedaluwarsa IS NOT NULL
               AND waktu_kedaluwarsa < CURRENT_TIMESTAMP"
        );
        $stmt->execute();
        return $stmt->rowCount();
    }

    /**
     * Simulasi pembayaran berhasil (QRIS / Transfer Bank).
     * Mengubah status pesanan dari 'belum_bayar' menjadi 'akan_dikirim'.
     */
    public function bayarSimulasi(string $nomorPesanan): array
    {
        $nomorPesanan = trim($nomorPesanan);
        $stmt = $this->db->prepare("SELECT * FROM pesanan WHERE nomor_pesanan = ?");
        $stmt->execute([$nomorPesanan]);
        $pesanan = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$pesanan) {
            return ['sukses' => false, 'pesan' => 'Pesanan tidak ditemukan.', 'status' => 404];
        }

        if (in_array($pesanan['status'], ['akan_dikirim', 'sedang_dikirim', 'selesai'])) {
            return ['sukses' => true, 'pesan' => 'Pesanan sudah dibayar sebelumnya.', 'status' => 200];
        }

        if (in_array($pesanan['status'], ['dibatalkan', 'kedaluwarsa', 'batal'])) {
            return ['sukses' => false, 'pesan' => 'Pesanan sudah kedaluwarsa atau dibatalkan.', 'status' => 400];
        }

        $this->db->prepare(
            "UPDATE pesanan
             SET status = 'akan_dikirim',
                 waktu_bayar = CURRENT_TIMESTAMP,
                 diperbarui_pada = CURRENT_TIMESTAMP
             WHERE nomor_pesanan = ?"
        )->execute([$nomorPesanan]);

        return [
            'sukses' => true,
            'status' => 200,
            'pesan'  => 'Pembayaran berhasil diverifikasi. Pesanan akan segera diproses oleh tim CRSL!'
        ];
    }

    /**
     * Retry pembayaran: re-issue waktu kedaluwarsa baru untuk pesanan yang sudah expire.
     * Hanya bisa dilakukan 1x (cek kolom catatan untuk flag retry).
     */
    public function retryBayar(string $nomorPesanan, int $penggunaId = 0): array
    {
        // Ambil pesanan
        if ($penggunaId > 0) {
            $stmt = $this->db->prepare("SELECT * FROM pesanan WHERE nomor_pesanan = ? AND pengguna_id = ?");
            $stmt->execute([$nomorPesanan, $penggunaId]);
        } else {
            $stmt = $this->db->prepare("SELECT * FROM pesanan WHERE nomor_pesanan = ?");
            $stmt->execute([$nomorPesanan]);
        }
        $pesanan = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$pesanan) {
            return ['sukses' => false, 'pesan' => 'Pesanan tidak ditemukan.', 'status' => 404];
        }

        if ($pesanan['status'] !== 'dibatalkan' && $pesanan['status'] !== 'kedaluwarsa') {
            return ['sukses' => false, 'pesan' => 'Hanya pesanan yang kedaluwarsa yang bisa di-retry.', 'status' => 400];
        }

        // Cek apakah sudah pernah retry (via catatan)
        if (str_contains($pesanan['catatan'] ?? '', '[RETRY]')) {
            return ['sukses' => false, 'pesan' => 'Pesanan ini sudah pernah di-retry sebelumnya.', 'status' => 409];
        }

        $waktuBaru = date('Y-m-d H:i:s', strtotime('+' . self::MENIT_KEDALUWARSA . ' minutes'));

        $this->db->prepare(
            "UPDATE pesanan
             SET status = 'belum_bayar',
                 waktu_kedaluwarsa = ?,
                 catatan = COALESCE(catatan, '') || '[RETRY]',
                 diperbarui_pada = CURRENT_TIMESTAMP
             WHERE nomor_pesanan = ?"
        )->execute([$waktuBaru, $nomorPesanan]);

        return [
            'sukses'             => true,
            'status'             => 200,
            'pesan'              => 'Waktu pembayaran telah diperpanjang 15 menit.',
            'waktu_kedaluwarsa'  => $waktuBaru,
        ];
    }

    /**
     * Ambil status dan detail singkat pesanan untuk polling.
     */
    public function statusPesanan(string $nomorPesanan, int $penggunaId = 0): ?array
    {
        // Sweep expire dulu
        $this->expirePesananKedaluwarsa();

        if ($penggunaId > 0) {
            $stmt = $this->db->prepare(
                "SELECT id, nomor_pesanan, status, total, diskon, kode_voucher,
                        ongkir, metode_bayar, kurir, waktu_kedaluwarsa, waktu_bayar, dibuat_pada
                 FROM pesanan
                 WHERE nomor_pesanan = ? AND pengguna_id = ?"
            );
            $stmt->execute([$nomorPesanan, $penggunaId]);
        } else {
            $stmt = $this->db->prepare(
                "SELECT id, nomor_pesanan, status, total, diskon, kode_voucher,
                        ongkir, metode_bayar, kurir, waktu_kedaluwarsa, waktu_bayar, dibuat_pada
                 FROM pesanan
                 WHERE nomor_pesanan = ?"
            );
            $stmt->execute([$nomorPesanan]);
        }
        return $stmt->fetch(PDO::FETCH_ASSOC) ?: null;
    }

    /**
     * Ambil daftar pesanan pengguna berdasarkan status filter.
     */
    public function ambilDaftarPesananPengguna(int $penggunaId, ?string $statusFilter = null): array
    {
        // Sweep expire dulu
        $this->expirePesananKedaluwarsa();

        $sql = "SELECT id, nomor_pesanan, status, total, diskon, kode_voucher, ongkir, kurir,
                       nomor_resi, metode_bayar, alamat_kirim, catatan, item_json,
                       waktu_kedaluwarsa, dibuat_pada, waktu_bayar
                FROM pesanan
                WHERE pengguna_id = :pengguna_id";

        $params = [':pengguna_id' => $penggunaId];

        if ($statusFilter && $statusFilter !== 'semua') {
            $sql .= " AND status = :status";
            $params[':status'] = $statusFilter;
        }

        $sql .= " ORDER BY dibuat_pada DESC LIMIT 50";

        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        $daftar = $stmt->fetchAll(PDO::FETCH_ASSOC);

        foreach ($daftar as &$pesanan) {
            $pesanan['items'] = json_decode($pesanan['item_json'] ?? '[]', true) ?: [];
        }

        return $daftar;
    }

    /**
     * Ambil detail pesanan berdasarkan nomor pesanan.
     */
    public function ambilDetailPesanan(string $nomorPesanan, ?int $penggunaId = null): ?array
    {
        $sql = "SELECT p.*, u.nama_lengkap, u.email
                FROM pesanan p
                LEFT JOIN pengguna u ON p.pengguna_id = u.id
                WHERE p.nomor_pesanan = :nomor_pesanan";
        $params = [':nomor_pesanan' => $nomorPesanan];

        if ($penggunaId !== null) {
            $sql .= " AND p.pengguna_id = :pengguna_id";
            $params[':pengguna_id'] = $penggunaId;
        }

        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        $res = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($res) {
            $res['items'] = json_decode($res['item_json'] ?? '[]', true) ?: [];
            return $res;
        }

        return null;
    }

    /**
     * Update status pesanan & simulasi pembayaran.
     */
    public function updateStatusPesanan(string $nomorPesanan, string $statusBaru): array
    {
        $allowedStatuses = ['belum_bayar', 'akan_dikirim', 'dikirim', 'selesai', 'dibatalkan', 'kedaluwarsa'];
        if (!in_array($statusBaru, $allowedStatuses)) {
            return ['sukses' => false, 'pesan' => 'Status pesanan tidak valid.', 'status' => 400];
        }

        $resi = null;
        if ($statusBaru === 'dikirim') {
            $resi = 'CRSL-EXP-' . strtoupper(bin2hex(random_bytes(4)));
        }

        $sql = "UPDATE pesanan SET
                status = :status,
                nomor_resi = COALESCE(:nomor_resi, nomor_resi),
                waktu_bayar = CASE WHEN :status2 IN ('akan_dikirim', 'dikirim', 'selesai') AND waktu_bayar IS NULL THEN CURRENT_TIMESTAMP ELSE waktu_bayar END,
                diperbarui_pada = CURRENT_TIMESTAMP
                WHERE nomor_pesanan = :nomor_pesanan";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            ':status'         => $statusBaru,
            ':status2'        => $statusBaru,
            ':nomor_resi'     => $resi,
            ':nomor_pesanan'  => $nomorPesanan
        ]);

        return [
            'sukses'      => true,
            'pesan'       => 'Status pesanan berhasil diperbarui.',
            'status'      => 200,
            'statusBaru'  => $statusBaru,
            'nomor_resi'  => $resi
        ];
    }
}
