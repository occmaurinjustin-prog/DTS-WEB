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
        Schema::create('inventory_transactions', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('inventory_id');
            $table->unsignedBigInteger('user_id'); // the user who performed the transaction
            $table->enum('type', ['stock_in', 'stock_out']);
            $table->integer('quantity');
            $table->string('reference_type')->nullable(); // 'maintenance', 'rescue', 'purchase', 'manual'
            $table->unsignedBigInteger('reference_id')->nullable(); // e.g. maintenance_report_id, rescue_id
            $table->decimal('unit_cost', 10, 2)->default(0); // Cost at the time of transaction
            $table->string('remarks')->nullable();
            $table->timestamps();

            // Foreign keys
            $table->foreign('inventory_id')->references('Inventory_id')->on('inventory')->onDelete('cascade');
            $table->foreign('user_id')->references('user_id')->on('users')->onDelete('cascade');
        });

        Schema::dropIfExists('maintenance_parts');
        Schema::dropIfExists('rescue_parts');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('inventory_transactions');
    }
};
