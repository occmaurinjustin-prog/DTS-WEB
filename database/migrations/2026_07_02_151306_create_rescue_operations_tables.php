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
        Schema::create('rescue_requests', function (Blueprint $table) {
            $table->id('rescue_id');
            $table->unsignedBigInteger('driver_id');
            $table->unsignedBigInteger('truck_id');
            $table->unsignedBigInteger('mechanic_id')->nullable();
            
            $table->string('issue_category'); // e.g. Flat Tire, Engine Stall
            $table->text('description')->nullable();
            
            // Driver's location
            $table->decimal('latitude', 10, 8);
            $table->decimal('longitude', 11, 8);
            $table->string('address')->nullable();
            
            // Mechanic's real-time location while en route
            $table->decimal('mechanic_latitude', 10, 8)->nullable();
            $table->decimal('mechanic_longitude', 11, 8)->nullable();

            $table->enum('status', ['pending', 'assigned', 'en_route', 'arrived', 'resolved'])->default('pending');
            $table->text('notes')->nullable(); // Notes from dispatcher or mechanic
            
            $table->timestamp('resolved_at')->nullable();
            
            $table->timestamps();

            $table->foreign('driver_id')->references('driver_id')->on('drivers')->onDelete('cascade');
            $table->foreign('truck_id')->references('truck_id')->on('trucks')->onDelete('cascade');
            $table->foreign('mechanic_id')->references('user_id')->on('users')->onDelete('set null');
        });

        Schema::create('rescue_media', function (Blueprint $table) {
            $table->id('media_id');
            $table->unsignedBigInteger('rescue_id');
            $table->string('file_path');
            $table->string('file_type')->default('image'); // 'image' or 'video'
            $table->timestamps();

            $table->foreign('rescue_id')->references('rescue_id')->on('rescue_requests')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('rescue_media');
        Schema::dropIfExists('rescue_requests');
    }
};
