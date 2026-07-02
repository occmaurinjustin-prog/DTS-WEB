<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('rescue_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('driver_id')->constrained('drivers', 'driver_id')->cascadeOnDelete();
            $table->foreignId('truck_id')->constrained('trucks', 'truck_id')->cascadeOnDelete();
            $table->foreignId('delivery_id')->nullable()->constrained('deliveries', 'delivery_id')->nullOnDelete();
            $table->string('waybill')->nullable();
            $table->decimal('latitude', 10, 8);
            $table->decimal('longitude', 11, 8);
            $table->string('address');
            $table->json('categories');
            $table->text('description');
            $table->enum('severity', ['low', 'medium', 'high', 'critical'])->default('medium');
            $table->boolean('is_drivable')->default(true);
            $table->enum('status', [
                'pending', 
                'assigned', 
                'accepted', 
                'on_the_way', 
                'arrived', 
                'inspection_started', 
                'repair_in_progress', 
                'waiting_for_parts', 
                'repair_completed', 
                'cannot_repair', 
                'closed'
            ])->default('pending');
            $table->foreignId('mechanic_id')->nullable()->constrained('users', 'user_id')->nullOnDelete();
            $table->integer('eta_minutes')->nullable();
            $table->text('inspection_findings')->nullable();
            $table->text('repair_notes')->nullable();
            $table->timestamp('closed_at')->nullable();
            $table->timestamps();

            $table->index(['driver_id', 'status']);
            $table->index(['mechanic_id', 'status']);
        });

        Schema::create('rescue_request_media', function (Blueprint $table) {
            $table->id();
            $table->foreignId('rescue_request_id')->constrained('rescue_requests')->cascadeOnDelete();
            $table->string('file_path');
            $table->enum('media_type', ['photo', 'video'])->default('photo');
            $table->enum('type', ['before', 'after'])->default('before');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('rescue_request_media');
        Schema::dropIfExists('rescue_requests');
    }
};
