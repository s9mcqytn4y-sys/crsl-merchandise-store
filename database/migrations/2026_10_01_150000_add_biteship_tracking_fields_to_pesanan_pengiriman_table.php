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
        Schema::table('pesanan_pengiriman', function (Blueprint $table) {
            $table->string('biteship_tracking_id', 100)->nullable()->after('biteship_order_id');
            $table->string('biteship_waybill_id', 100)->nullable()->after('biteship_tracking_id');
            $table->string('tracking_url', 255)->nullable()->after('biteship_waybill_id');

            $table->index('biteship_tracking_id', 'idx_pesanan_pengiriman_biteship_tracking');
            $table->index('biteship_order_id', 'idx_pesanan_pengiriman_biteship_order');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('pesanan_pengiriman', function (Blueprint $table) {
            $table->dropIndex('idx_pesanan_pengiriman_biteship_tracking');
            $table->dropIndex('idx_pesanan_pengiriman_biteship_order');
            $table->dropColumn(['biteship_tracking_id', 'biteship_waybill_id', 'tracking_url']);
        });
    }
};
