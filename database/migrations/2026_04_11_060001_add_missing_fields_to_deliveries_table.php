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
        Schema::table('deliveries', function (Blueprint $table) {
            if (!Schema::hasColumn('deliveries', 'delivery_address')) {
                $table->string('delivery_address')->nullable();
            }
            if (!Schema::hasColumn('deliveries', 'priority')) {
                $table->enum('priority', ['normal', 'high', 'urgent'])->default('normal');
            }
            if (!Schema::hasColumn('deliveries', 'estimated_delivery_time')) {
                $table->timestamp('estimated_delivery_time')->nullable();
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('deliveries', function (Blueprint $table) {
            $table->dropColumnIfExists('delivery_address');
            $table->dropColumnIfExists('priority');
            $table->dropColumnIfExists('estimated_delivery_time');
        });
    }
};
