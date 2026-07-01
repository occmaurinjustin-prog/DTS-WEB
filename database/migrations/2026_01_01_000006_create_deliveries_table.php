<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('deliveries', function (Blueprint $table) {
            $table->id('delivery_id');
            $table->foreignId('user_id')->constrained('users', 'user_id')->cascadeOnDelete();
            $table->foreignId('driver_id')->constrained('drivers', 'driver_id')->cascadeOnDelete();
            $table->foreignId('client_id')->constrained('clients', 'client_id')->cascadeOnDelete();
            $table->foreignId('truck_id')->nullable()->constrained('trucks', 'truck_id');
            $table->enum('delivery_status', ['pending','approved','rejected','assigned','in_transit','delivered','cancelled'])->default('pending')->nullable();
            $table->enum('navigation_phase', ['pickup','delivery'])->default('pickup');
            $table->string('proof_image')->nullable();
            $table->text('remarks')->nullable();
            $table->timestamp('delivered_at')->nullable();
            $table->decimal('actual_delivery_latitude', 10, 8)->nullable();
            $table->decimal('actual_delivery_longitude', 11, 8)->nullable();
            $table->timestamp('approved_at')->nullable();
            $table->timestamp('rejected_at')->nullable();
            $table->timestamp('sent_to_driver_at')->nullable();
            $table->foreignId('sent_to_driver_by')->nullable()->constrained('users', 'user_id')->nullOnDelete();
            $table->decimal('weight_tons', 8, 2);
            $table->text('item_description');
            $table->string('waybill')->unique();
            $table->string('pickup_address')->nullable();
            $table->decimal('pickup_latitude', 10, 8)->nullable();
            $table->decimal('pickup_longitude', 11, 8)->nullable();
            $table->string('delivery_address')->nullable();
            $table->decimal('delivery_latitude', 10, 8)->nullable();
            $table->decimal('delivery_longitude', 11, 8)->nullable();
            $table->enum('priority', ['normal','high','urgent'])->default('normal');
            $table->timestamp('estimated_delivery_time')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('deliveries');
    }
};