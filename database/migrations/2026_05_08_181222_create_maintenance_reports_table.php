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
        Schema::create('maintenance_reports', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('driver_id');
            $table->foreign('driver_id')->references('driver_id')->on('drivers')->onDelete('cascade');
            $table->unsignedBigInteger('truck_id')->nullable();
            $table->foreign('truck_id')->references('truck_id')->on('trucks')->onDelete('set null');
            $table->string('plate_number');
            $table->string('vehicle_type');
            $table->string('issue_title');
            $table->text('issue_description');
            $table->enum('priority_level', ['low', 'medium', 'high', 'emergency'])->default('medium');
            $table->enum('status', ['pending', 'in_review', 'approved', 'in_progress', 'completed', 'rejected'])->default('pending');
            $table->text('admin_notes')->nullable();
            $table->unsignedBigInteger('assigned_to')->nullable();
            $table->foreign('assigned_to')->references('user_id')->on('users')->onDelete('set null');
            $table->timestamp('assigned_at')->nullable();
            $table->timestamp('started_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();
            
            $table->index(['driver_id', 'status']);
            $table->index(['truck_id', 'status']);
            $table->index(['priority_level', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('maintenance_reports');
    }
};
