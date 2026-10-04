<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * Memperketat proteksi race condition voucher pada level database:
 * Mengubah constraint unik voucher_terpakai dari (voucher_id, pengguna_id, pesanan_id)
 * menjadi (voucher_id, pengguna_id) sehingga klaim paralel pada milidetik yang sama
 * secara atomik diblokir oleh engine PostgreSQL.
 */
return new class extends Migration
{
    public function up(): void
    {
        DB::statement('ALTER TABLE voucher_terpakai DROP CONSTRAINT IF EXISTS uniq_voucher_pakai');
        DB::statement('ALTER TABLE voucher_terpakai DROP CONSTRAINT IF EXISTS uniq_voucher_per_pengguna');
        DB::statement('ALTER TABLE voucher_terpakai ADD CONSTRAINT uniq_voucher_per_pengguna UNIQUE (voucher_id, pengguna_id)');
    }

    public function down(): void
    {
        DB::statement('ALTER TABLE voucher_terpakai DROP CONSTRAINT IF EXISTS uniq_voucher_per_pengguna');
        DB::statement('ALTER TABLE voucher_terpakai ADD CONSTRAINT uniq_voucher_pakai UNIQUE (voucher_id, pengguna_id, pesanan_id)');
    }
};
