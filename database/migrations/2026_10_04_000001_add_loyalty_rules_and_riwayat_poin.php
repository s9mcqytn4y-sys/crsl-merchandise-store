<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Skema aturan bisnis loyalitas & voucher terpusat:
 * - tier_loyalitas: pengali poin, deskripsi, daftar benefit
 * - voucher: deskripsi, tier minimal (voucher eksklusif member), visibilitas publik
 * - riwayat_poin: buku besar (ledger) mutasi poin yang idempoten per pesanan
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tier_loyalitas', function (Blueprint $table) {
            $table->decimal('pengali_poin', 4, 2)->default(1.00)->after('syarat_belanja');
            $table->text('deskripsi')->nullable()->after('pengali_poin');
            $table->json('benefit')->nullable()->after('deskripsi');
        });

        Schema::table('voucher', function (Blueprint $table) {
            $table->string('deskripsi', 255)->nullable()->after('judul');
            $table->foreignId('tier_minimal_id')->nullable()->after('syarat_kurir')
                ->constrained('tier_loyalitas')->nullOnDelete();
            $table->boolean('tampil_publik')->default(true)->after('aktif');
        });

        Schema::create('riwayat_poin', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->foreignId('pengguna_id')->constrained('users')->cascadeOnDelete();
            $table->uuid('pesanan_id')->nullable();
            // didapat | digunakan | dikembalikan | bonus_registrasi | penyesuaian
            $table->string('tipe', 30);
            $table->integer('jumlah'); // bertanda: positif = masuk, negatif = keluar
            $table->integer('saldo_akhir')->default(0);
            $table->string('keterangan', 255)->nullable();
            $table->timestamps();

            $table->index(['pengguna_id', 'created_at']);
            $table->unique(['pesanan_id', 'tipe'], 'uniq_riwayat_poin_pesanan_tipe');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('riwayat_poin');

        Schema::table('voucher', function (Blueprint $table) {
            $table->dropConstrainedForeignId('tier_minimal_id');
            $table->dropColumn(['deskripsi', 'tampil_publik']);
        });

        Schema::table('tier_loyalitas', function (Blueprint $table) {
            $table->dropColumn(['pengali_poin', 'deskripsi', 'benefit']);
        });
    }
};
