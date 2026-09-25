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
        Schema::table('users', function (Blueprint $table) {
            $table->string('telepon', 30)->nullable()->after('email');
            $table->string('birth_day', 2)->nullable()->default('14')->after('telepon');
            $table->string('birth_month', 2)->nullable()->default('09')->after('birth_day');
            $table->string('birth_year', 4)->nullable()->default('2003')->after('birth_month');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['telepon', 'birth_day', 'birth_month', 'birth_year']);
        });
    }
};
