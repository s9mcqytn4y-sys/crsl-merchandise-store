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

    public function __construct(PDO $db)
    {
        $this->db = $db;
    }

    /**
     * Membuat pesanan baru
     */
    public function buatPesanan(array $data, int $penggunaId): array
    {
        try {
            $items = $data['items'] ?? [];
            if (empty($items) || !is_array($items)) {
                return ['sukses' => false, 'pesan' => 'Keranjang pesanan kosong.', 'status' => 400];
            }

            // Validasi data pengiriman
            $namaLengkap = trim($data['nama_lengkap'] ?? '');
            $telepon = trim($data['telepon'] ?? '');
            $alamatLengkap = trim($data['alamat_lengkap'] ?? '');
            $kota = trim($data['kota'] ?? '');
            $kodePos = trim($data['kode_pos'] ?? '');
            $kurir = trim($data['kurir'] ?? 'JNE Regular');
            $ongkir = (int)($data['ongkir'] ?? 15000);
            $metodeBayar = trim($data['metode_bayar'] ?? 'qris');
            $catatan = trim($data['catatan'] ?? '');

            if (empty($namaLengkap) || empty($telepon) || empty($alamatLengkap)) {
                return ['sukses' => false, 'pesan' => 'Informasi alamat pengiriman belum lengkap.', 'status' => 422];
            }

            // Hitung total dari item
            $subtotal = 0;
            $itemsBersih = [];
            foreach ($items as $item) {
                $qty = max(1, (int)($item['jumlah'] ?? $item['qty'] ?? 1));
                $harga = (int)($item['harga'] ?? 0);
                $subtotal += ($harga * $qty);

                $itemsBersih[] = [
                    'produk_id' => (int)($item['produk_id'] ?? 1),
                    'nama_produk' => htmlspecialchars(trim($item['nama_produk'] ?? $item['nama'] ?? 'Item CRSL'), ENT_QUOTES, 'UTF-8'),
                    'harga' => $harga,
                    'jumlah' => $qty,
                    'ukuran' => htmlspecialchars(trim($item['ukuran'] ?? 'All Size'), ENT_QUOTES, 'UTF-8'),
                    'warna' => htmlspecialchars(trim($item['warna'] ?? '-'), ENT_QUOTES, 'UTF-8'),
                    'gambar' => htmlspecialchars(trim($item['gambar'] ?? '/aset/gambar/bundle-miflo-cover.webp'), ENT_QUOTES, 'UTF-8'),
                ];
            }

            $totalAkhir = $subtotal + $ongkir;
            $nomorPesanan = 'CRSL-ORD-' . date('Ymd') . '-' . strtoupper(substr(bin2hex(random_bytes(3)), 0, 5));
            $alamatGabungan = "$namaLengkap ($telepon)\n$alamatLengkap, $kota $kodePos";
            $itemJson = json_encode($itemsBersih, JSON_UNESCAPED_UNICODE);

            $this->db->beginTransaction();

            $sqlPesanan = "INSERT INTO pesanan (
                pengguna_id, nomor_pesanan, status, total, ongkir, kurir,
                mata_uang, alamat_kirim, metode_bayar, catatan, item_json, dibuat_pada, diperbarui_pada
            ) VALUES (
                :pengguna_id, :nomor_pesanan, 'belum_bayar', :total, :ongkir, :kurir,
                'IDR', :alamat_kirim, :metode_bayar, :catatan, :item_json, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
            )";

            $stmtPesanan = $this->db->prepare($sqlPesanan);
            $stmtPesanan->execute([
                ':pengguna_id' => $penggunaId,
                ':nomor_pesanan' => $nomorPesanan,
                ':total' => $totalAkhir,
                ':ongkir' => $ongkir,
                ':kurir' => $kurir,
                ':alamat_kirim' => $alamatGabungan,
                ':metode_bayar' => $metodeBayar,
                ':catatan' => $catatan,
                ':item_json' => $itemJson,
            ]);

            $pesananId = (int)$this->db->lastInsertId();

            // Masukkan ke tabel item_pesanan
            $sqlItem = "INSERT INTO item_pesanan (
                pesanan_id, produk_id, nama_produk, harga, jumlah, ukuran, warna
            ) VALUES (
                :pesanan_id, :produk_id, :nama_produk, :harga, :jumlah, :ukuran, :warna
            )";
            $stmtItem = $this->db->prepare($sqlItem);

            foreach ($itemsBersih as $it) {
                $stmtItem->execute([
                    ':pesanan_id' => $pesananId,
                    ':produk_id' => $it['produk_id'],
                    ':nama_produk' => $it['nama_produk'],
                    ':harga' => $it['harga'],
                    ':jumlah' => $it['jumlah'],
                    ':ukuran' => $it['ukuran'],
                    ':warna' => $it['warna'],
                ]);
            }

            $this->db->commit();

            return [
                'sukses' => true,
                'status' => 201,
                'pesan' => 'Pesanan berhasil dibuat.',
                'pesanan' => [
                    'id' => $pesananId,
                    'nomor_pesanan' => $nomorPesanan,
                    'total' => $totalAkhir,
                    'ongkir' => $ongkir,
                    'status' => 'belum_bayar',
                    'metode_bayar' => $metodeBayar,
                ]
            ];
        } catch (Exception $e) {
            if ($this->db->inTransaction()) {
                $this->db->rollBack();
            }
            return [
                'sukses' => false,
                'status' => 500,
                'pesan' => 'Gagal memproses pesanan: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Ambil daftar pesanan pengguna berdasarkan status filter
     */
    public function ambilDaftarPesananPengguna(int $penggunaId, ?string $statusFilter = null): array
    {
        $sql = "SELECT id, nomor_pesanan, status, total, ongkir, kurir, nomor_resi,
                       metode_bayar, alamat_kirim, catatan, item_json, dibuat_pada, waktu_bayar
                FROM pesanan
                WHERE pengguna_id = :pengguna_id";

        $params = [':pengguna_id' => $penggunaId];

        if ($statusFilter && $statusFilter !== 'semua') {
            $sql .= " AND status = :status";
            $params[':status'] = $statusFilter;
        }

        $sql .= " ORDER BY dibuat_pada DESC";

        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        $daftar = $stmt->fetchAll(PDO::FETCH_ASSOC);

        foreach ($daftar as &$pesanan) {
            $pesanan['items'] = json_decode($pesanan['item_json'] ?? '[]', true) ?: [];
        }

        return $daftar;
    }

    /**
     * Ambil detail pesanan berdasarkan nomor pesanan
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
     * Update status pesanan & simulasi pembayaran
     */
    public function updateStatusPesanan(string $nomorPesanan, string $statusBaru): array
    {
        $allowedStatuses = ['belum_bayar', 'akan_dikirim', 'dikirim', 'selesai', 'dibatalkan'];
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
                waktu_bayar = CASE WHEN :status IN ('akan_dikirim', 'dikirim', 'selesai') AND waktu_bayar IS NULL THEN CURRENT_TIMESTAMP ELSE waktu_bayar END,
                diperbarui_pada = CURRENT_TIMESTAMP
                WHERE nomor_pesanan = :nomor_pesanan";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            ':status' => $statusBaru,
            ':nomor_resi' => $resi,
            ':nomor_pesanan' => $nomorPesanan
        ]);

        return [
            'sukses' => true,
            'pesan' => 'Status pesanan berhasil diperbarui.',
            'status' => 200,
            'statusBaru' => $statusBaru,
            'nomor_resi' => $resi
        ];
    }
}
