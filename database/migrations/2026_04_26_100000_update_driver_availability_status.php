<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Use raw SQL to modify enum column in MySQL
        DB::statement("ALTER TABLE drivers MODIFY COLUMN availability_status ENUM('available', 'busy', 'in_transit', 'off_duty') DEFAULT 'available'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement("ALTER TABLE drivers MODIFY COLUMN availability_status ENUM('available', 'busy', 'off_duty') DEFAULT 'available'");
    }
};
