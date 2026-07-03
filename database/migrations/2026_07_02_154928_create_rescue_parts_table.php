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
        Schema::create('rescue_parts', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('rescue_request_id');
            $table->unsignedBigInteger('inventory_id');
            $table->integer('quantity');
            $table->timestamps();

            $table->foreign('rescue_request_id')->references('rescue_id')->on('rescue_requests')->onDelete('cascade');
            $table->foreign('inventory_id')->references('Inventory_id')->on('inventory')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('rescue_parts');
    }
};
