<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('trucks', function (Blueprint $table) {
            if (!Schema::hasColumn('trucks', 'current_mileage')) {
                $table->integer('current_mileage')->default(0)->after('capacity');
            }
            if (!Schema::hasColumn('trucks', 'last_maintenance_mileage')) {
                $table->integer('last_maintenance_mileage')->default(0)->after('current_mileage');
            }
            if (!Schema::hasColumn('trucks', 'last_maintenance_date')) {
                $table->date('last_maintenance_date')->nullable()->after('last_maintenance_mileage');
            }
            if (!Schema::hasColumn('trucks', 'maintenance_interval_mileage')) {
                $table->integer('maintenance_interval_mileage')->default(5000)->after('last_maintenance_date');
            }
            if (!Schema::hasColumn('trucks', 'model')) {
                $table->string('model')->nullable()->after('vehicle_type');
            }
            if (!Schema::hasColumn('trucks', 'year_manufactured')) {
                $table->year('year_manufactured')->nullable()->after('model');
            }
        });
    }

    public function down(): void
    {
        Schema::table('trucks', function (Blueprint $table) {
            $columns = ['current_mileage', 'last_maintenance_mileage', 'last_maintenance_date', 'maintenance_interval_mileage', 'model', 'year_manufactured'];
            foreach ($columns as $column) {
                if (Schema::hasColumn('trucks', $column)) {
                    $table->dropColumn($column);
                }
            }
        });
    }
};
