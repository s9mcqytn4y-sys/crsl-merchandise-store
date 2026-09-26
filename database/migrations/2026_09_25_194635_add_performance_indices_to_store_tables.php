<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations to add high-performance composite indices.
     */
    public function up(): void
    {
        // 1. Produk - indeks harga & status aktif untuk query katalog & sorting
        Schema::table('produk', function (Blueprint $table) {
            $table->index(['aktif', 'harga_dasar'], 'idx_produk_aktif_harga');
        });

        // 2. Produk Varian - indeks ketersediaan stok & varian aktif
        Schema::table('produk_varian', function (Blueprint $table) {
            $table->index(['produk_id', 'aktif', 'stok'], 'idx_varian_produk_stok');
        });

        // 3. Pesanan - riwayat pesanan pengguna per status dan kronologis waktu
        Schema::table('pesanan', function (Blueprint $table) {
            $table->index(['pengguna_id', 'status', 'created_at'], 'idx_pesanan_pengguna_status');
        });

        // 4. Voucher - validasi instan kode voucher aktif
        Schema::table('voucher', function (Blueprint $table) {
            $table->index(['kode', 'aktif', 'berlaku_sampai'], 'idx_voucher_kode_aktif');
        });

        // 5. Alamat Pengguna - query alamat utama checkout
        Schema::table('alamat_pengguna', function (Blueprint $table) {
            $table->index(['pengguna_id', 'adalah_utama'], 'idx_alamat_pengguna_utama');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('produk', function (Blueprint $table) {
            $table->dropIndex('idx_produk_aktif_harga');
        });

        Schema::table('produk_varian', function (Blueprint $table) {
            $table->dropIndex('idx_varian_produk_stok');
        });

        Schema::table('pesanan', function (Blueprint $table) {
            $table->dropIndex('idx_pesanan_pengguna_status');
        });

        Schema::table('voucher', function (Blueprint $table) {
            $table->dropIndex('idx_voucher_kode_aktif');
        });

        Schema::table('alamat_pengguna', function (Blueprint $table) {
            $table->dropIndex('idx_alamat_pengguna_utama');
        });
    }
};
