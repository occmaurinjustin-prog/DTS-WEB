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
            if (!Schema::hasColumn('drivers', 'current_latitude')) {
                $table->decimal('current_latitude', 10, 8)->nullable()->after('truck_id');
            }
            if (!Schema::hasColumn('drivers', 'current_longitude')) {
                $table->decimal('current_longitude', 11, 8)->nullable()->after('current_latitude');
            }
            if (!Schema::hasColumn('drivers', 'last_location_update')) {
                $table->timestamp('last_location_update')->nullable()->after('current_longitude');
            }
            if (!Schema::hasColumn('drivers', 'current_speed')) {
                $table->integer('current_speed')->default(0)->after('last_location_update');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('drivers', function (Blueprint $table) {
            $columns = [];
            if (Schema::hasColumn('drivers', 'current_latitude')) $columns[] = 'current_latitude';
            if (Schema::hasColumn('drivers', 'current_longitude')) $columns[] = 'current_longitude';
            if (Schema::hasColumn('drivers', 'last_location_update')) $columns[] = 'last_location_update';
            if (Schema::hasColumn('drivers', 'current_speed')) $columns[] = 'current_speed';
            if (!empty($columns)) {
                $table->dropColumn($columns);
            }
        });
    }
};
