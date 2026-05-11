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
        Schema::create('location_logs', function (Blueprint $table) {
            $table->id('log_id');
            $table->unsignedBigInteger('delivery_id');
            $table->decimal('lat', 10, 8);
            $table->decimal('long', 11, 8);
            $table->decimal('speed_kmh', 5, 2);
            $table->timestamp('recorded_at')->useCurrent();
            $table->timestamps();
            
            $table->foreign('delivery_id')->references('delivery_id')->on('deliveries')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('location_logs');
    }
};
