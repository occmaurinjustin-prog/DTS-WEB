<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('trucks', function (Blueprint $table) {
            $table->integer('current_mileage')->default(0)->after('capacity');
            $table->integer('last_maintenance_mileage')->default(0)->after('current_mileage');
            $table->date('last_maintenance_date')->nullable()->after('last_maintenance_mileage');
            $table->integer('maintenance_interval_mileage')->default(5000)->after('last_maintenance_date'); // Default 5000 km
            $table->string('model')->nullable()->after('vehicle_type');
            $table->year('year_manufactured')->nullable()->after('model');
        });
    }

    public function down(): void
    {
        Schema::table('trucks', function (Blueprint $table) {
            $table->dropColumn([
                'current_mileage',
                'last_maintenance_mileage',
                'last_maintenance_date',
                'maintenance_interval_mileage',
                'model',
                'year_manufactured'
            ]);
        });
    }
};
