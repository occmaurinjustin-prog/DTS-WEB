<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('trucks', function (Blueprint $table) {
            $table->id('truck_id');
            $table->string('unique_id', 20)->unique();
            $table->string('plate_number')->unique();
            $table->string('vehicle_type');
            $table->decimal('capacity', 10, 2);
            $table->enum('condition', ['excellent','good','fair','poor','needs_maintenance'])->default('good');
            $table->enum('truck_status', ['available','in_use','maintenance','inactive'])->default('available')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('trucks');
    }
};