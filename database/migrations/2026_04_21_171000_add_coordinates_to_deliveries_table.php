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
            if (!Schema::hasColumn('deliveries', 'pickup_latitude')) {
                $table->decimal('pickup_latitude', 10, 8)->nullable()->after('pickup_address');
            }
            if (!Schema::hasColumn('deliveries', 'pickup_longitude')) {
                $table->decimal('pickup_longitude', 11, 8)->nullable()->after('pickup_latitude');
            }
            if (!Schema::hasColumn('deliveries', 'delivery_latitude')) {
                $table->decimal('delivery_latitude', 10, 8)->nullable()->after('delivery_address');
            }
            if (!Schema::hasColumn('deliveries', 'delivery_longitude')) {
                $table->decimal('delivery_longitude', 11, 8)->nullable()->after('delivery_latitude');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('deliveries', function (Blueprint $table) {
            $table->dropColumnIfExists('pickup_latitude');
            $table->dropColumnIfExists('pickup_longitude');
            $table->dropColumnIfExists('delivery_latitude');
            $table->dropColumnIfExists('delivery_longitude');
        });
    }
};
