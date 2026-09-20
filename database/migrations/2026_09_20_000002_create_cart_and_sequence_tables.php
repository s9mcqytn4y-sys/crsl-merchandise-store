<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations for Cart and Daily Order Sequence Counter.
     */
    public function up(): void
    {
        // 1. Tabel Keranjang Belanja
        Schema::create('keranjang', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->foreignId('pengguna_id')->nullable()->constrained('users')->cascadeOnDelete();
            $table->string('session_id', 100)->nullable()->index();
            $table->timestamps();
        });

        // 2. Tabel Item Keranjang Belanja
        Schema::create('item_keranjang', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->foreignId('keranjang_id')->constrained('keranjang')->cascadeOnDelete();
            $table->foreignId('produk_id')->constrained('produk')->cascadeOnDelete();
            $table->foreignId('produk_varian_id')->nullable()->constrained('produk_varian')->cascadeOnDelete();
            $table->integer('jumlah')->default(1);
            $table->timestamps();
        });

        // 3. Tabel Urutan Nomor Pesanan Harian (Locking Safe)
        Schema::create('nomor_pesanan_harian', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->date('tanggal')->unique();
            $table->integer('urutan')->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('nomor_pesanan_harian');
        Schema::dropIfExists('item_keranjang');
        Schema::dropIfExists('keranjang');
    }
};
