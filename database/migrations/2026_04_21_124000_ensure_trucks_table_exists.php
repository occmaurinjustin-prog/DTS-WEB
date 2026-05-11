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
        // Create trucks table if it doesn't exist
        if (!Schema::hasTable('trucks')) {
            Schema::create('trucks', function (Blueprint $table) {
                $table->id('truck_id');
                $table->string('plate_number')->unique();
                $table->string('vehicle_type');
                $table->decimal('capacity', 10, 2); // in tons
                $table->enum('condition', ['excellent', 'good', 'fair', 'poor', 'needs_maintenance'])->default('good');
                $table->enum('status', ['available', 'in_use', 'maintenance', 'inactive'])->default('available');
                $table->timestamps();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Don't drop on rollback to preserve data
    }
};
