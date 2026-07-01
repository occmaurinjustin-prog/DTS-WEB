<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('driver_stops', function (Blueprint $table) {
            $table->id();
            $table->foreignId('driver_id')->constrained('drivers', 'driver_id')->cascadeOnDelete();
            $table->foreignId('delivery_id')->nullable()->constrained('deliveries', 'delivery_id')->cascadeOnDelete();
            $table->decimal('latitude', 10, 8);
            $table->decimal('longitude', 11, 8);
            $table->text('address')->nullable();
            $table->timestamp('stopped_at');
            $table->timestamp('resumed_at')->nullable();
            $table->integer('duration_minutes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('driver_stops');
    }
};