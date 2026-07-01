<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('maintenance_parts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('maintenance_report_id')->constrained('maintenance_reports', 'id')->cascadeOnDelete();
            $table->foreignId('inventory_id')->constrained('inventory', 'Inventory_id')->cascadeOnDelete();
            $table->integer('quantity_used');
            $table->decimal('unit_cost', 10, 2);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('maintenance_parts');
    }
};