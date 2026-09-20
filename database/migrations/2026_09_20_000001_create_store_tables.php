<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations for CRSL Official Store v2 (PostgreSQL Specifications).
     */
    public function up(): void
    {
        // 1. Kategori Produk
        Schema::create('kategori', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->string('nama', 100);
            $table->string('slug', 120)->unique();
            $table->text('deskripsi')->nullable();
            $table->string('emoji', 10)->nullable();
            $table->integer('urutan')->default(0);
            $table->boolean('aktif')->default(true);
            $table->timestamps();
        });

        // 2. Produk Utama
        Schema::create('produk', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->foreignId('kategori_id')->nullable()->constrained('kategori')->nullOnDelete();
            $table->string('nama', 255);
            $table->string('slug', 255)->unique();
            $table->text('deskripsi')->nullable();
            $table->decimal('harga_dasar', 12, 2);
            $table->decimal('harga_diskon', 12, 2)->nullable();
            $table->integer('stok_total')->default(0);
            $table->integer('berat_gram')->default(250);
            $table->string('tipe_produk', 30)->default('regular'); // regular, pre_order
            $table->string('estimasi_po', 100)->nullable();
            $table->string('status_stok', 30)->default('in_stock'); // in_stock, low_stock, out_of_stock
            $table->integer('terjual')->default(0);
            $table->boolean('is_best_seller')->default(false);
            $table->string('gambar_utama', 500)->nullable();
            $table->boolean('aktif')->default(true);
            $table->timestamps();

            $table->index('kategori_id', 'idx_produk_kategori');
            $table->index('slug', 'idx_produk_slug');
            $table->index(['aktif', 'status_stok', 'is_best_seller'], 'idx_produk_filter');
        });

        // 3. Spesifikasi Produk
        Schema::create('produk_spesifikasi', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->foreignId('produk_id')->constrained('produk')->cascadeOnDelete();
            $table->string('kunci', 100);
            $table->text('nilai');
            $table->integer('urutan')->default(0);
            $table->timestamps();
        });

        // 4. Varian Produk (SKU Matriks)
        Schema::create('produk_varian', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->foreignId('produk_id')->constrained('produk')->cascadeOnDelete();
            $table->string('sku', 80)->unique();
            $table->string('nama_varian', 150);
            $table->string('tipe_varian', 50)->default('warna'); // warna, ukuran, karakter
            $table->string('warna', 50)->nullable();
            $table->string('warna_hex', 20)->nullable();
            $table->string('warna_gambar', 500)->nullable();
            $table->string('ukuran', 50)->nullable();
            $table->decimal('harga_tambahan', 12, 2)->default(0);
            $table->integer('stok')->default(0);
            $table->string('gambar_varian', 500)->nullable();
            $table->boolean('aktif')->default(true);
            $table->timestamps();
        });

        // 5. Galeri Gambar Produk
        Schema::create('gambar_produk', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->foreignId('produk_id')->constrained('produk')->cascadeOnDelete();
            $table->string('url', 500);
            $table->string('alt_teks', 255)->nullable();
            $table->integer('urutan')->default(0);
            $table->timestamps();
        });

        // 6. Tier Loyalitas
        Schema::create('tier_loyalitas', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->string('nama', 100)->unique(); // New Freen, Bestfreen, CRSL Gengs
            $table->string('slug', 100)->unique();
            $table->decimal('syarat_belanja', 12, 2)->default(0);
            $table->integer('durasi_bulan')->default(12);
            $table->integer('bonus_poin_masuk')->default(0);
            $table->integer('poin_per_ulasan')->default(200);
            $table->string('warna_aksen', 20)->default('#e52027');
            $table->integer('urutan')->default(0);
            $table->timestamps();
        });

        // 7. Pengguna Loyalitas
        Schema::create('pengguna_loyalitas', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->foreignId('pengguna_id')->unique()->constrained('users')->cascadeOnDelete();
            $table->foreignId('tier_id')->nullable()->constrained('tier_loyalitas')->nullOnDelete();
            $table->decimal('total_belanja', 12, 2)->default(0);
            $table->integer('poin')->default(0);
            $table->timestampTz('diperbarui_pada')->useCurrent();
            $table->timestamps();
        });

        // 8. Voucher
        Schema::create('voucher', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->string('kode', 50)->unique();
            $table->string('judul', 200);
            $table->string('tipe', 20)->default('nominal'); // ongkir, nominal, persen
            $table->decimal('nilai', 12, 2);
            $table->decimal('min_belanja', 12, 2)->default(0);
            $table->string('syarat_kurir', 50)->default('all');
            $table->integer('kuota')->default(1000);
            $table->timestampTz('berlaku_dari')->nullable();
            $table->timestampTz('berlaku_sampai')->nullable();
            $table->boolean('aktif')->default(true);
            $table->timestamps();
        });

        // 9. Voucher Terpakai
        Schema::create('voucher_terpakai', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->foreignId('voucher_id')->constrained('voucher')->cascadeOnDelete();
            $table->foreignId('pengguna_id')->constrained('users')->cascadeOnDelete();
            $table->unsignedBigInteger('pesanan_id')->nullable();
            $table->timestampTz('dipakai_pada')->useCurrent();
            $table->timestamps();

            $table->unique(['voucher_id', 'pengguna_id', 'pesanan_id'], 'uniq_voucher_pakai');
        });

        // 10. Wilayah Indonesia (Biteship Mapping Engine)
        Schema::create('wilayah_indonesia', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->string('provinsi', 100);
            $table->string('kota', 100);
            $table->string('tipe', 20)->default('Kota');
            $table->string('kecamatan', 100);
            $table->string('kelurahan', 100)->nullable();
            $table->string('kode_pos', 10);
            $table->string('biteship_area_id', 64)->nullable();
            $table->timestamps();

            $table->index('biteship_area_id', 'idx_wilayah_biteship_area');
            $table->index(['provinsi', 'kota', 'kecamatan', 'kelurahan'], 'idx_wilayah_hirarki');
        });

        // 11. Alamat Pengguna
        Schema::create('alamat_pengguna', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->foreignId('pengguna_id')->constrained('users')->cascadeOnDelete();
            $table->string('label', 50)->default('Rumah');
            $table->string('nama_penerima', 150);
            $table->string('telepon', 30);
            $table->string('email', 150)->nullable();
            $table->string('negara', 50)->default('Indonesia');
            $table->string('area_id', 64)->nullable(); // Biteship Area ID
            $table->string('provinsi', 100);
            $table->string('kota', 100);
            $table->string('kecamatan', 100);
            $table->string('kelurahan', 100)->nullable();
            $table->string('kode_pos', 10);
            $table->text('alamat_lengkap');
            $table->string('rt_rw', 50)->nullable();
            $table->string('no_rumah', 50)->nullable();
            $table->string('patokan', 150)->nullable();
            $table->boolean('adalah_utama')->default(false);
            $table->timestamps();
        });

        // 12. Pesanan Utama
        Schema::create('pesanan', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('nomor_pesanan', 50)->unique(); // INV/CRSL/20260920/XXXX
            $table->foreignId('pengguna_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('status', 30)->default('belum_bayar'); // belum_bayar, akan_dikirim, dikirim, selesai, dibatalkan, dikembalikan
            $table->decimal('subtotal', 12, 2);
            $table->decimal('ongkir', 12, 2)->default(0);
            $table->decimal('biaya_asuransi', 12, 2)->default(0);
            $table->decimal('diskon', 12, 2)->default(0);
            $table->decimal('total', 12, 2);
            $table->string('mata_uang', 5)->default('IDR');
            $table->text('catatan')->nullable();
            $table->string('kode_voucher', 50)->nullable();
            $table->integer('poin_digunakan')->default(0);
            $table->integer('poin_didapat')->default(0);
            $table->boolean('is_dropship')->default(false);
            $table->string('dropship_pengirim', 150)->nullable();
            $table->string('dropship_telepon', 30)->nullable();
            $table->timestamps();

            $table->index('status', 'idx_pesanan_status');
            $table->index('pengguna_id', 'idx_pesanan_pengguna');
        });

        // 13. Pesanan Pengiriman (Terisolasi)
        Schema::create('pesanan_pengiriman', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->uuid('pesanan_id');
            $table->foreign('pesanan_id')->references('id')->on('pesanan')->cascadeOnDelete();
            $table->string('kurir', 50);
            $table->string('layanan', 100);
            $table->string('nomor_resi', 100)->nullable();
            $table->string('biteship_order_id', 100)->nullable();
            $table->string('tracking_status', 50)->default('allocated');
            $table->jsonb('json_payload')->nullable();
            $table->timestamps();
        });

        // 14. Pesanan Pembayaran (Terisolasi)
        Schema::create('pesanan_pembayaran', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->uuid('pesanan_id');
            $table->foreign('pesanan_id')->references('id')->on('pesanan')->cascadeOnDelete();
            $table->string('metode_bayar', 50);
            $table->string('midtrans_id', 100)->nullable();
            $table->string('midtrans_status', 50)->nullable();
            $table->string('nomor_va', 100)->nullable();
            $table->string('kode_biller', 50)->nullable();
            $table->text('qr_string')->nullable();
            $table->text('qr_code_url')->nullable();
            $table->timestampTz('waktu_kedaluwarsa')->nullable();
            $table->timestampTz('waktu_bayar')->nullable();
            $table->jsonb('instruksi_bayar')->nullable();
            $table->jsonb('payment_payload')->nullable();
            $table->timestamps();
        });

        // 15. Item Pesanan
        Schema::create('item_pesanan', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->uuid('pesanan_id');
            $table->foreign('pesanan_id')->references('id')->on('pesanan')->cascadeOnDelete();
            $table->foreignId('produk_id')->nullable()->constrained('produk')->nullOnDelete();
            $table->foreignId('produk_varian_id')->nullable()->constrained('produk_varian')->nullOnDelete();
            $table->string('nama_produk', 255);
            $table->string('sku', 80)->nullable();
            $table->decimal('harga', 12, 2);
            $table->integer('jumlah')->default(1);
            $table->string('ukuran', 50)->nullable();
            $table->string('warna', 50)->nullable();
            $table->string('gambar', 500)->nullable();
            $table->timestamps();
        });

        // 16. Wishlist (Ril)
        Schema::create('wishlist', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->foreignId('pengguna_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('produk_id')->constrained('produk')->cascadeOnDelete();
            $table->timestampTz('dibuat_pada')->useCurrent();
            $table->timestamps();

            $table->unique(['pengguna_id', 'produk_id'], 'uniq_wishlist_pengguna_produk');
        });

        // 17. Pesan / Inquiry Produk
        Schema::create('pesan_produk', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->foreignId('pengguna_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('produk_id')->nullable()->constrained('produk')->nullOnDelete();
            $table->string('nama_produk', 255);
            $table->string('varian', 150)->nullable();
            $table->text('pesan');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pesan_produk');
        Schema::dropIfExists('wishlist');
        Schema::dropIfExists('item_pesanan');
        Schema::dropIfExists('pesanan_pembayaran');
        Schema::dropIfExists('pesanan_pengiriman');
        Schema::dropIfExists('pesanan');
        Schema::dropIfExists('alamat_pengguna');
        Schema::dropIfExists('wilayah_indonesia');
        Schema::dropIfExists('voucher_terpakai');
        Schema::dropIfExists('voucher');
        Schema::dropIfExists('pengguna_loyalitas');
        Schema::dropIfExists('tier_loyalitas');
        Schema::dropIfExists('gambar_produk');
        Schema::dropIfExists('produk_varian');
        Schema::dropIfExists('produk_spesifikasi');
        Schema::dropIfExists('produk');
        Schema::dropIfExists('kategori');
    }
};
