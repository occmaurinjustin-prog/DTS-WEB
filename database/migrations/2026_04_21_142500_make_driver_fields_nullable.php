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
        Schema::table('drivers', function (Blueprint $table) {
            if (Schema::hasColumn('drivers', 'plate_number')) {
                $table->string('plate_number')->nullable()->change();
            }
            if (Schema::hasColumn('drivers', 'vehicle_type')) {
                $table->string('vehicle_type')->nullable()->change();
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('drivers', function (Blueprint $table) {
            if (Schema::hasColumn('drivers', 'plate_number')) {
                $table->string('plate_number')->nullable(false)->change();
            }
            if (Schema::hasColumn('drivers', 'vehicle_type')) {
                $table->string('vehicle_type')->nullable(false)->change();
            }
        });
    }
};
