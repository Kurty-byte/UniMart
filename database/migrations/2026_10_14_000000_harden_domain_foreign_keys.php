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
        Schema::table('items', function (Blueprint $table) {
            $table->dropForeign(['seller_id']);
            $table->dropForeign(['category_id']);

            $table->foreign('seller_id')->references('id')->on('users')->restrictOnDelete();
            $table->foreign('category_id')->references('id')->on('categories')->restrictOnDelete();

            $table->text('rejection_reason')->nullable()->after('status');
            $table->index(['status', 'category_id']);
        });

        Schema::table('orders', function (Blueprint $table) {
            $table->dropForeign(['buyer_id']);

            $table->foreign('buyer_id')->references('id')->on('users')->restrictOnDelete();

            $table->index(['status', 'expires_at']);
        });

        Schema::table('order_items', function (Blueprint $table) {
            $table->dropForeign(['item_id']);

            $table->foreign('item_id')->references('id')->on('items')->restrictOnDelete();

            $table->index('payout_status');
        });

        Schema::table('drawer_counts', function (Blueprint $table) {
            $table->dropForeign(['staff_id']);

            $table->foreign('staff_id')->references('id')->on('users')->restrictOnDelete();
        });

        Schema::table('reports', function (Blueprint $table) {
            $table->text('resolution_notes')->nullable()->after('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('reports', function (Blueprint $table) {
            $table->dropColumn('resolution_notes');
        });

        Schema::table('drawer_counts', function (Blueprint $table) {
            $table->dropForeign(['staff_id']);
            $table->foreign('staff_id')->references('id')->on('users')->cascadeOnDelete();
        });

        Schema::table('order_items', function (Blueprint $table) {
            $table->dropIndex(['payout_status']);
            $table->dropForeign(['item_id']);
            $table->foreign('item_id')->references('id')->on('items')->cascadeOnDelete();
        });

        Schema::table('orders', function (Blueprint $table) {
            $table->dropIndex(['status', 'expires_at']);
            $table->dropForeign(['buyer_id']);
            $table->foreign('buyer_id')->references('id')->on('users')->cascadeOnDelete();
        });

        Schema::table('items', function (Blueprint $table) {
            $table->dropIndex(['status', 'category_id']);
            $table->dropColumn('rejection_reason');

            $table->dropForeign(['seller_id']);
            $table->dropForeign(['category_id']);

            $table->foreign('seller_id')->references('id')->on('users')->cascadeOnDelete();
            $table->foreign('category_id')->references('id')->on('categories')->cascadeOnDelete();
        });
    }
};
