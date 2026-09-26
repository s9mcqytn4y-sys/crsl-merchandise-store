<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Perluas kolom ukuran & warna pada item_pesanan agar muat varian bundle panjang
        Schema::table('item_pesanan', function (Blueprint $table) {
            $table->text('ukuran')->nullable()->change();
            $table->text('warna')->nullable()->change();
        });

        // 2. Ubah kolom pesanan_id pada voucher_terpakai menjadi UUID
        // Hapus constraint unique jika ada
        DB::statement('ALTER TABLE voucher_terpakai DROP CONSTRAINT IF EXISTS uniq_voucher_pakai');

        // Ubah tipe data kolom pesanan_id menjadi UUID
        DB::statement('ALTER TABLE voucher_terpakai ALTER COLUMN pesanan_id TYPE uuid USING pesanan_id::text::uuid');

        // Buat ulang unique constraint dengan tipe data yang benar
        DB::statement('ALTER TABLE voucher_terpakai ADD CONSTRAINT uniq_voucher_pakai UNIQUE (voucher_id, pengguna_id, pesanan_id)');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('item_pesanan', function (Blueprint $table) {
            $table->string('ukuran', 50)->nullable()->change();
            $table->string('warna', 50)->nullable()->change();
        });

        DB::statement('ALTER TABLE voucher_terpakai DROP CONSTRAINT IF EXISTS uniq_voucher_pakai');
        DB::statement('ALTER TABLE voucher_terpakai ALTER COLUMN pesanan_id TYPE bigint USING NULL');
        DB::statement('ALTER TABLE voucher_terpakai ADD CONSTRAINT uniq_voucher_pakai UNIQUE (voucher_id, pengguna_id, pesanan_id)');
    }
};
