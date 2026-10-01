<?php

declare(strict_types=1);

use App\Domains\Autentikasi\Services\AuthService;
use App\Domains\Autentikasi\Services\OtpService;
use App\Domains\Inventori\Services\InventoriService;
use App\Domains\Pembayaran\Services\MidtransService;
use App\Domains\Pengiriman\Services\BiteshipService;
use App\Domains\Pesanan\Actions\BuatPesananAction;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\MidtransWebhookController;
use App\Http\Controllers\PesananController;
use App\Models\ItemPesanan;
use App\Models\PenggunaLoyalitas;
use App\Models\Pesanan;
use App\Models\PesananPembayaran;
use App\Models\PesananPengiriman;
use App\Models\Produk;
use App\Models\ProdukVarian;
use App\Models\User;
use App\Models\Voucher;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Bus;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

// Setiap skenario memakai data sementara dan rollback. Nomor sequence PostgreSQL
// dapat bertambah meskipun baris di-rollback. Jangan jalankan pada basis data produksi.
(function (): void {
    if (!app()->environment('local') || DB::getDriverName() !== 'pgsql'
        || !in_array(config('database.connections.pgsql.host'), ['localhost', '127.0.0.1', '::1'], true)
        || DB::transactionLevel() !== 0) {
        throw new RuntimeException('Audit hanya diizinkan pada PostgreSQL lokal tanpa transaksi terbuka.');
    }

    $tabelDiawasi = ['users', 'produk', 'produk_varian', 'pesanan', 'item_pesanan', 'pesanan_pembayaran', 'pesanan_pengiriman', 'voucher', 'voucher_terpakai', 'pengguna_loyalitas', 'alamat_pengguna', 'nomor_pesanan_harian', 'jobs', 'failed_jobs'];
    $sidikData = static function () use ($tabelDiawasi): array {
        $hasil = [];
        foreach ($tabelDiawasi as $tabel) {
            $hasil[$tabel] = hash('sha256', DB::table($tabel)->orderBy('id')->get()->toJson());
        }
        return $hasil;
    };
    $sidikAwal = $sidikData();
    config(['cache.default' => 'array', 'session.driver' => 'array', 'logging.default' => 'null', 'mail.default' => 'log', 'services.midtrans.server_key' => 'kunci-audit-tanpa-nilai', 'services.midtrans.client_key' => 'kunci-audit-tanpa-nilai', 'services.midtrans.is_production' => false]);
    Log::forgetChannel();
    app('session')->forgetDrivers();
    session()->start();
    $cetak = static fn (array $data) => print(json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR).PHP_EOL);
    $hasil = [];
    $jalankan = static function (string $kode, string $harapan, Closure $skenario) use (&$hasil, $cetak): void {
        Cache::store('array')->flush();
        session()->flush();
        Auth::forgetGuards();
        Bus::fake();
        Mail::fake();
        Http::swap(new Illuminate\Http\Client\Factory());
        Http::preventStrayRequests();
        Http::fake(['https://api.sandbox.midtrans.com/v2/*' => Http::response([
            'status_code' => '201', 'transaction_id' => 'transaksi-audit',
            'transaction_status' => 'pending', 'qr_string' => 'qr-audit',
            'expiry_time' => now()->addMinutes(15)->format('Y-m-d H:i:s'),
        ], 201)]);
        DB::beginTransaction();
        DB::statement("SET LOCAL lock_timeout = '3s'");
        DB::statement("SET LOCAL statement_timeout = '10s'");
        try {
            [$lulus, $bukti] = $skenario();
            $baris = ['kode' => $kode, 'harapan' => $harapan, 'hasil' => $lulus ? 'LULUS' : 'GAGAL', 'bukti' => $bukti];
        } catch (Throwable $galat) {
            $baris = ['kode' => $kode, 'harapan' => $harapan, 'hasil' => 'GALAT', 'bukti' => ['kelas' => $galat::class, 'kode' => $galat->getCode(), 'berkas' => basename($galat->getFile()), 'baris' => $galat->getLine()]];
        } finally {
            while (DB::transactionLevel() > 0) {
                DB::rollBack();
            }
        }
        $hasil[] = $baris;
        $cetak($baris);
    };
    $buatPengguna = static function (): User {
        $pengguna = new User();
        $pengguna->forceFill(['id' => -900001, 'name' => 'Pengguna Audit', 'email' => 'audit@example.invalid', 'password' => 'kata-sandi-audit-sementara', 'email_verified_at' => now()])->save();
        PenggunaLoyalitas::create(['pengguna_id' => $pengguna->id, 'poin' => 0, 'total_belanja' => 0]);
        return $pengguna;
    };
    $buatProduk = static function (): array {
        $produk = new Produk();
        $produk->forceFill(['id' => -900001, 'nama' => 'Produk Audit', 'slug' => 'produk-audit-sementara', 'harga_dasar' => 100000, 'stok_total' => 10, 'aktif' => true])->save();
        $varian = new ProdukVarian();
        $varian->forceFill(['id' => -900001, 'produk_id' => $produk->id, 'sku' => 'SKU-AUDIT-SEMENTARA', 'nama_varian' => 'Varian Audit', 'stok' => 10, 'aktif' => true])->save();
        return [$produk, $varian];
    };
    $buatPesanan = static function (?int $penggunaId = null, string $nomor = 'INV/AUDIT/20260930/0001'): Pesanan {
        $pesanan = Pesanan::create(['nomor_pesanan' => $nomor, 'pengguna_id' => $penggunaId, 'status' => 'belum_bayar', 'subtotal' => 100000, 'total' => 100000, 'poin_didapat' => 100]);
        PesananPembayaran::create(['pesanan_id' => $pesanan->id, 'metode_bayar' => 'qris', 'midtrans_status' => 'pending', 'qr_string' => 'qr-audit']);
        PesananPengiriman::create(['pesanan_id' => $pesanan->id, 'kurir' => 'jne', 'layanan' => 'reg', 'json_payload' => ['email' => 'audit@example.invalid', 'alamat_lengkap' => 'Alamat sementara audit']]);
        return $pesanan;
    };
    $panggilWebhook = static function (Pesanan $pesanan, string $status, ?string $nomor = null, string $nominal = '100000.00'): array {
        $nomor ??= str_replace('/', '-', $pesanan->nomor_pesanan);
        $muatan = ['order_id' => $nomor, 'status_code' => '200', 'gross_amount' => $nominal, 'transaction_status' => $status, 'fraud_status' => 'accept', 'signature_key' => hash('sha512', $nomor.'200'.$nominal.'kunci-audit-tanpa-nilai')];
        $respons = app(MidtransWebhookController::class)->handle(Request::create('/api/midtrans/webhook', 'POST', $muatan));
        return ['http' => $respons->getStatusCode(), 'pesan' => $respons->getData(true)['pesan'], 'status' => $pesanan->fresh()->status];
    };
    $buatCheckout = static function (array $tambahan = [], ?int $penggunaId = null) use ($buatProduk): Pesanan {
        [$produk, $varian] = $buatProduk();
        return app(BuatPesananAction::class)->eksekusi(array_merge(['nama_lengkap' => 'Pembeli Audit', 'email' => 'audit@example.invalid', 'telepon' => '080000000000', 'alamat_lengkap' => 'Alamat audit', 'kota' => 'Kota Audit', 'kode_pos' => '00000', 'ongkir' => 18000, 'kurir' => 'jne', 'layanan_kurir' => 'reg', 'metode_pembayaran' => 'qris'], $tambahan), [['produk_id' => $produk->id, 'varian_id' => $varian->id, 'jumlah' => 1]], $penggunaId);
    };
    $validasiKeranjang = static function (array $barang): array {
        return (new ReflectionMethod(BuatPesananAction::class, 'validasiDanHitungKeranjang'))->invoke(app(BuatPesananAction::class), $barang);
    };

    $jalankan('T01', 'Harga item browser diabaikan', static function () use ($buatProduk, $validasiKeranjang): array {
        [$produk, $varian] = $buatProduk();
        $keranjang = $validasiKeranjang([['produk_id' => $produk->id, 'varian_id' => $varian->id, 'harga' => 1, 'jumlah' => 1]]);
        return [$keranjang['subtotal'] === 100000.0, ['subtotal' => $keranjang['subtotal']]];
    });
    $jalankan('T02', 'Ongkir negatif ditolak', static function () use ($buatCheckout): array {
        try {
            $pesanan = $buatCheckout(['ongkir' => -90000]);
            return [false, ['ongkir' => $pesanan->ongkir, 'total' => $pesanan->total]];
        } catch (\Throwable $e) {
            return [true, ['pesan' => $e->getMessage()]];
        }
    });
    $jalankan('T03', 'Jumlah negatif ditolak', static function () use ($buatProduk, $validasiKeranjang): array {
        [$produk, $varian] = $buatProduk();
        try {
            $keranjang = $validasiKeranjang([['produk_id' => $produk->id, 'varian_id' => $varian->id, 'jumlah' => -4]]);
            return [false, ['jumlah_diterima' => $keranjang['items'][0]['jumlah']]];
        } catch (\Throwable $e) {
            return [true, ['pesan' => $e->getMessage()]];
        }
    });
    $jalankan('T04', 'Pasangan produk dan varian berbeda ditolak', static function () use ($buatProduk, $validasiKeranjang): array {
        [, $varian] = $buatProduk();
        $produkLain = Produk::where('id', '>', 0)->firstOrFail();
        try {
            $keranjang = $validasiKeranjang([['produk_id' => $produkLain->id, 'varian_id' => $varian->id, 'jumlah' => 1]]);
            return [false, ['produk_diterima' => $keranjang['items'][0]['produk_id'], 'produk_pemilik_varian' => $varian->produk_id]];
        } catch (\Throwable $e) {
            return [true, ['pesan' => $e->getMessage()]];
        }
    });
    $jalankan('T05', 'Inventori menolak stok tidak cukup', static function () use ($buatProduk): array {
        [, $varian] = $buatProduk();
        try {
            app(InventoriService::class)->kunciDanKurangiStok([['varian_id' => $varian->id, 'jumlah' => 11]]);
            return [false, ['stok' => $varian->fresh()->stok]];
        } catch (Exception $galat) {
            return [$varian->fresh()->stok === 10, ['kelas_penolakan' => $galat::class, 'stok' => $varian->fresh()->stok]];
        }
    });
    $jalankan('T06', 'Inventori menolak varian nonaktif', static function () use ($buatProduk): array {
        [, $varian] = $buatProduk();
        $varian->update(['aktif' => false]);
        try {
            app(InventoriService::class)->kunciDanKurangiStok([['varian_id' => $varian->id, 'jumlah' => 1]]);
            return [false, ['stok' => $varian->fresh()->stok]];
        } catch (\Throwable $e) {
            return [true, ['pesan' => $e->getMessage()]];
        }
    });
    $jalankan('T07', 'Voucher kedaluwarsa ditolak saat membuat pesanan', static function () use ($buatCheckout): array {
        Voucher::create(['kode' => 'AUDITKEDALUWARSA', 'judul' => 'Voucher audit', 'nilai' => 50000, 'tipe' => 'nominal', 'min_belanja' => 0, 'kuota' => 10, 'aktif' => true, 'berlaku_sampai' => now()->subDay()]);
        try {
            $pesanan = $buatCheckout(['kode_voucher' => 'AUDITKEDALUWARSA']);
            return [false, ['diskon' => $pesanan->diskon, 'total' => $pesanan->total]];
        } catch (\Throwable $e) {
            return [true, ['pesan' => $e->getMessage()]];
        }
    });
    $jalankan('T08', 'Faktur pengguna tidak dapat dibaca tamu', static function () use ($buatPengguna, $buatPesanan): array {
        $pesanan = $buatPesanan($buatPengguna()->id);
        try {
            $respons = app(PesananController::class)->faktur($pesanan->nomor_pesanan);
            return [false, ['kelas_respons' => $respons::class, 'tamu' => Auth::guest()]];
        } catch (\Symfony\Component\HttpKernel\Exception\HttpException $e) {
            return [$e->getStatusCode() === 403, ['http' => $e->getStatusCode()]];
        }
    });
    $jalankan('T09', 'Tamu tidak dapat membatalkan pesanan pengguna', static function () use ($buatPengguna, $buatPesanan): array {
        $pesanan = $buatPesanan($buatPengguna()->id);
        app(PesananController::class)->batalkanPesanan($pesanan->nomor_pesanan);
        return [$pesanan->fresh()->status === 'belum_bayar', ['status' => $pesanan->fresh()->status, 'tamu' => Auth::guest()]];
    });
    $jalankan('T10', 'Simulasi bayar ditolak pada lingkungan production', static function () use ($buatPesanan): array {
        $pesanan = $buatPesanan();
        $lingkungan = app()->environment();
        try {
            app()->instance('env', 'production');
            try {
                app(PesananController::class)->simulasiBayarDev($pesanan->nomor_pesanan);
                return [false, ['status' => $pesanan->fresh()->status]];
            } catch (\Symfony\Component\HttpKernel\Exception\HttpException $e) {
                return [$e->getStatusCode() === 403 && $pesanan->fresh()->status === 'belum_bayar', ['http' => $e->getStatusCode()]];
            }
        } finally {
            app()->instance('env', $lingkungan);
        }
    });
    $jalankan('T11', 'Notifikasi kedaluwarsa berulang mengembalikan stok sekali', static function () use ($buatProduk, $buatPesanan, $panggilWebhook): array {
        [$produk, $varian] = $buatProduk();
        $pesanan = $buatPesanan();
        ItemPesanan::create(['pesanan_id' => $pesanan->id, 'produk_id' => $produk->id, 'produk_varian_id' => $varian->id, 'nama_produk' => 'Produk audit', 'harga' => 100000, 'jumlah' => 1]);
        $pertama = $panggilWebhook($pesanan, 'expire');
        $stokPertama = $varian->fresh()->stok;
        $kedua = $panggilWebhook($pesanan, 'expire');
        return [$stokPertama === $varian->fresh()->stok, ['stok_setelah_pertama' => $stokPertama, 'stok_setelah_kedua' => $varian->fresh()->stok, 'http' => [$pertama['http'], $kedua['http']]]];
    });
    $jalankan('T12', 'Notifikasi settlement berulang memberi poin sekali', static function () use ($buatPengguna, $buatPesanan, $panggilWebhook): array {
        $pengguna = $buatPengguna();
        $pesanan = $buatPesanan($pengguna->id);
        $panggilWebhook($pesanan, 'settlement');
        $panggilWebhook($pesanan, 'settlement');
        $poin = (int) PenggunaLoyalitas::where('pengguna_id', $pengguna->id)->value('poin');
        return [$poin === 100, ['poin' => $poin, 'status' => $pesanan->fresh()->status]];
    });
    $jalankan('T13', 'Nomor sandbox dengan akhiran acak dikenali webhook', static function () use ($buatPesanan, $panggilWebhook): array {
        $pesanan = $buatPesanan(null, 'INV/AUDIT/20260930/0001-XYZ');
        $bukti = $panggilWebhook($pesanan, 'settlement');
        return [$pesanan->fresh()->status === 'akan_dikirim', $bukti];
    });
    $jalankan('T14', 'Percobaan QRIS Q1 dikenali webhook', static function () use ($buatPesanan, $panggilWebhook): array {
        $pesanan = $buatPesanan();
        $bukti = $panggilWebhook($pesanan, 'settlement', str_replace('/', '-', $pesanan->nomor_pesanan).'-Q1');
        return [$pesanan->fresh()->status === 'akan_dikirim', $bukti];
    });
    $jalankan('T15', 'Konfirmasi penerimaan berulang tidak menggandakan poin', static function () use ($buatPengguna, $buatPesanan): array {
        $pengguna = $buatPengguna();
        $pesanan = $buatPesanan($pengguna->id);
        $pesanan->update(['status' => 'dikirim']);
        $pengguna->loyalitas->update(['poin' => 100]);
        app(PesananController::class)->konfirmasiDiterima($pesanan->nomor_pesanan);
        $pertama = $pengguna->loyalitas->fresh()->poin;
        app(PesananController::class)->konfirmasiDiterima($pesanan->nomor_pesanan);
        $kedua = $pengguna->loyalitas->fresh()->poin;
        return [$pertama === $kedua, ['poin_awal' => 100, 'poin_pertama' => $pertama, 'poin_kedua' => $kedua, 'tamu' => Auth::guest()]];
    });
    $jalankan('T16', 'Signature webhook palsu ditolak tanpa perubahan', static function () use ($buatPesanan): array {
        $pesanan = $buatPesanan();
        $respons = app(MidtransWebhookController::class)->handle(Request::create('/api/midtrans/webhook', 'POST', ['order_id' => $pesanan->nomor_pesanan, 'signature_key' => 'palsu', 'transaction_status' => 'settlement']));
        return [$respons->getStatusCode() === 403 && $pesanan->fresh()->status === 'belum_bayar', ['http' => $respons->getStatusCode(), 'status' => $pesanan->fresh()->status]];
    });
    $jalankan('T17', 'Respons registrasi tidak membocorkan OTP', static function (): array {
        $permintaan = Request::create('/register', 'POST', ['nama' => 'Pengguna Audit Baru', 'email' => 'pendaftaran-audit@example.invalid', 'password' => 'kata-sandi-audit-sementara', 'password_confirmation' => 'kata-sandi-audit-sementara']);
        $respons = app(AuthController::class)->register($permintaan)->getData(true);
        return [!isset($respons['otp']), ['otp_terungkap' => isset($respons['otp']), 'status' => $respons['status'] ?? null]];
    });
    $jalankan('T18', 'Login menolak akun belum terverifikasi', static function () use ($buatPengguna): array {
        $pengguna = $buatPengguna();
        $pengguna->email_verified_at = null;
        $pengguna->save();
        $respons = app(AuthService::class)->login($pengguna->email, 'kata-sandi-audit-sementara');
        return [!$respons['sukses'], ['sukses' => $respons['sukses'], 'terverifikasi' => $pengguna->fresh()->email_verified_at !== null]];
    });
    $jalankan('T19', 'OTP salah universal ditolak di lokal', static function (): array {
        $alamat = 'kode-audit@example.invalid';
        Cache::put('otp_code_'.md5($alamat), '654321', 300);
        $diterima = app(OtpService::class)->verifyOtp($alamat, '123456');
        return [!$diterima, ['kode_salah_diterima' => $diterima]];
    });
    $jalankan('T20', 'OTP valid hanya dapat dipakai sekali', static function (): array {
        $alamat = 'kode-audit@example.invalid';
        Cache::put('otp_code_'.md5($alamat), '654321', 300);
        $pertama = app(OtpService::class)->verifyOtp($alamat, '654321');
        $kedua = app(OtpService::class)->verifyOtp($alamat, '654321');
        return [$pertama && !$kedua, ['pertama' => $pertama, 'kedua' => $kedua]];
    });
    $jalankan('T21', 'Kolom yang dipakai pemeliharaan tersedia', static function (): array {
        $kolom = Illuminate\Support\Facades\Schema::getColumnListing('pesanan_pembayaran');
        $hilang = array_values(array_diff(['batas_waktu', 'midtrans_transaction_id'], $kolom));
        return [$hilang === [], ['kolom_hilang' => $hilang]];
    });
    $jalankan('T22', 'Middleware Inertia terpasang pada beranda', static function (): array {
        $middleware = app('router')->gatherRouteMiddleware(app('router')->getRoutes()->getByName('beranda'));
        $terpasang = in_array(App\Http\Middleware\HandleInertiaRequests::class, $middleware, true);
        return [$terpasang, ['terpasang' => $terpasang]];
    });
    $jalankan('T23', 'Biteship Zero Balance menghasilkan tarif simulasi tanpa api key', static function (): array {
        config(['services.biteship.testing_zero_balance' => true, 'services.biteship.use_real_rates' => false]);
        $tarif = app(BiteshipService::class)->kalkulasiOngkir('IDNP5IDNC412IDND5043IDZ55281', [['nama' => 'Test', 'harga' => 50000, 'berat' => 300, 'kuantitas' => 1]]);
        return [count($tarif) > 0 && !empty($tarif[0]['is_mock']), ['jumlah_tarif' => count($tarif), 'simulasi' => $tarif[0]['is_mock'] ?? null]];
    });
    $jalankan('T24', 'Biaya asuransi negatif ditolak', static function () use ($buatCheckout): array {
        try {
            $pesanan = $buatCheckout(['asuransi_pengiriman' => true, 'biaya_asuransi' => -90000]);
            return [false, ['asuransi' => $pesanan->biaya_asuransi, 'total' => $pesanan->total]];
        } catch (\Throwable $e) {
            return [true, ['pesan' => $e->getMessage()]];
        }
    });
    $jalankan('T25', 'Checkout berulang memiliki idempotensi', static function () use ($buatProduk): array {
        [$produk, $varian] = $buatProduk();
        $masukan = ['ongkir' => 18000, 'metode_pembayaran' => 'qris', 'idempotency_key' => 'audit-permintaan-sama'];
        $barang = [['produk_id' => $produk->id, 'varian_id' => $varian->id, 'jumlah' => 1]];
        $pertama = app(BuatPesananAction::class)->eksekusi($masukan, $barang);
        $kedua = app(BuatPesananAction::class)->eksekusi($masukan, $barang);
        return [$pertama->id === $kedua->id, ['pesanan_berbeda' => $pertama->id !== $kedua->id, 'stok_akhir' => $varian->fresh()->stok]];
    });

    $utuh = $sidikAwal === $sidikData();
    $rekap = array_count_values(array_column($hasil, 'hasil'));
    $cetak(['ringkasan' => $rekap, 'baris_basis_data_tetap' => $utuh, 'transaksi_tersisa' => DB::transactionLevel(), 'batasan' => 'Panggilan aplikasi langsung, bukan pengujian HTTP browser, konkurensi, atau integrasi sandbox nyata. HTTP diblokir kecuali respons buatan audit, email dan antrean ditahan. Sequence dapat bertambah.']);
    exit($utuh && ($rekap['GAGAL'] ?? 0) === 0 && ($rekap['GALAT'] ?? 0) === 0 ? 0 : 1);
})();
