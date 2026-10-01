<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('pesanan_pembayaran', function (Blueprint $table) {
            if (!Schema::hasColumn('pesanan_pembayaran', 'batas_waktu')) {
                $table->timestampTz('batas_waktu')->nullable()->after('waktu_kedaluwarsa');
            }
            if (!Schema::hasColumn('pesanan_pembayaran', 'midtrans_transaction_id')) {
                $table->string('midtrans_transaction_id', 100)->nullable()->after('midtrans_id');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('pesanan_pembayaran', function (Blueprint $table) {
            $table->dropColumn(['batas_waktu', 'midtrans_transaction_id']);
        });
    }
};
