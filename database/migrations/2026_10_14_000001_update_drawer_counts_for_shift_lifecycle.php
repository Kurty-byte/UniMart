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
        Schema::table('drawer_counts', function (Blueprint $table) {
            $table->decimal('opening_cash', 10, 2)->default(0.00)->after('staff_id');
            $table->timestamp('shift_ended_at')->nullable()->change();
            $table->decimal('expected_cash', 10, 2)->nullable()->change();
            $table->decimal('actual_cash', 10, 2)->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('drawer_counts', function (Blueprint $table) {
            $table->dropColumn('opening_cash');
            $table->timestamp('shift_ended_at')->nullable(false)->change();
            $table->decimal('expected_cash', 10, 2)->nullable(false)->change();
            $table->decimal('actual_cash', 10, 2)->nullable(false)->change();
        });
    }
};
