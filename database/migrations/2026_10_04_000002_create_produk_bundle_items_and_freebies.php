<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Skema dukungan bundle produk terpusat di database PostgreSQL:
 * - Menambahkan kolom freebies (JSON) pada tabel produk
 * - Membuat tabel produk_bundle_item untuk item komponen bundle dan varian pilihannya
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('produk', function (Blueprint $table) {
            $table->json('freebies')->nullable()->after('deskripsi');
        });

        Schema::create('produk_bundle_item', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->foreignId('produk_id')->constrained('produk')->cascadeOnDelete();
            $table->string('nama_item', 255);
            $table->bigInteger('harga')->default(0);
            $table->string('gambar', 255)->nullable();
            $table->json('varian')->nullable();
            $table->integer('urutan')->default(0);
            $table->timestamps();

            $table->index(['produk_id', 'urutan']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('produk_bundle_item');

        Schema::table('produk', function (Blueprint $table) {
            $table->dropColumn('freebies');
        });
    }
};
