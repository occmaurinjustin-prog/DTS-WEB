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
        Schema::create('driver_location_histories', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('driver_id');
            $table->unsignedBigInteger('delivery_id')->nullable();
            $table->decimal('latitude', 10, 7);
            $table->decimal('longitude', 10, 7);
            $table->decimal('speed', 8, 2)->default(0);
            $table->decimal('heading', 6, 2)->nullable();
            $table->boolean('is_gps_enabled')->default(true);
            $table->boolean('was_offline')->default(false); // true if this point was queued offline
            $table->timestamp('recorded_at'); // actual GPS timestamp from device
            $table->timestamps();

            $table->foreign('driver_id')->references('driver_id')->on('drivers')->onDelete('cascade');
            $table->index(['driver_id', 'recorded_at']);
            $table->index(['delivery_id', 'driver_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('driver_location_histories');
    }
};
