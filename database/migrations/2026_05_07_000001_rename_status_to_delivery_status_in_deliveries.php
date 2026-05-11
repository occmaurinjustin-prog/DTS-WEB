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
        // Rename status column to delivery_status in deliveries table
        DB::statement("ALTER TABLE deliveries CHANGE status delivery_status ENUM('pending', 'approved', 'rejected', 'assigned', 'in_transit', 'delivered', 'cancelled') DEFAULT 'pending'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Rename delivery_status back to status
        DB::statement("ALTER TABLE deliveries CHANGE delivery_status status ENUM('pending', 'approved', 'rejected', 'assigned', 'in_transit', 'delivered', 'cancelled') DEFAULT 'pending'");
    }
};
