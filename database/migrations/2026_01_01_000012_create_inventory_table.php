<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('inventory', function (Blueprint $table) {
            $table->id('Inventory_id');
            $table->string('part_name');
            $table->string('part_number')->nullable();
            $table->string('category')->nullable();
            $table->integer('quantity')->default(0);
            $table->integer('min_stock_level')->default(5);
            $table->string('part_status')->default('available');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('inventory');
    }
};