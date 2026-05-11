<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Rename status column to truck_status in trucks table
        DB::statement("ALTER TABLE trucks CHANGE status truck_status ENUM('available', 'in_use', 'maintenance', 'inactive') DEFAULT 'available'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Rename truck_status back to status
        DB::statement("ALTER TABLE trucks CHANGE truck_status status ENUM('available', 'in_use', 'maintenance', 'inactive') DEFAULT 'available'");
    }
};
