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
        Schema::create('maintenance_parts', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('maintenance_report_id');
            $table->unsignedBigInteger('inventory_id');
            $table->integer('quantity_used');
            $table->decimal('unit_cost', 10, 2);
            $table->timestamps();
            
            // Foreign key constraints
            $table->foreign('maintenance_report_id')->references('id')->on('maintenance_reports')->onDelete('cascade');
            $table->foreign('inventory_id')->references('Inventory_id')->on('inventory')->onDelete('cascade');
            
            // Indexes for performance
            $table->index('maintenance_report_id');
            $table->index('inventory_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('maintenance_parts');
    }
};
