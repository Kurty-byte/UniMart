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
            $table->string('ewallet_provider', 50)->nullable()->after('ewallet_qr_code');
            $table->string('ewallet_account_name', 100)->nullable()->after('ewallet_provider');
            $table->string('ewallet_account_number', 50)->nullable()->after('ewallet_account_name');
            $table->text('ewallet_qr_payload')->nullable()->after('ewallet_account_number');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'ewallet_provider',
                'ewallet_account_name',
                'ewallet_account_number',
                'ewallet_qr_payload',
            ]);
        });
    }
};
