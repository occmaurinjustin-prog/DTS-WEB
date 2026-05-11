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
        Schema::table('trucks', function (Blueprint $table) {
            if (Schema::hasColumn('trucks', 'driver_id')) {
                // Drop foreign key first, then column
                $table->dropForeign(['driver_id']);
                $table->dropColumn('driver_id');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('trucks', function (Blueprint $table) {
            $table->unsignedBigInteger('driver_id')->nullable()->after('truck_id');
            $table->foreign('driver_id')->references('driver_id')->on('drivers')->onDelete('set null');
        });
    }
};
