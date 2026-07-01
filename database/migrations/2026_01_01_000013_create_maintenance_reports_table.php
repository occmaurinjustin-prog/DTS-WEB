<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('maintenance_reports', function (Blueprint $table) {
            $table->id();
            $table->foreignId('driver_id')->nullable()->constrained('drivers', 'driver_id')->cascadeOnDelete();
            $table->foreignId('truck_id')->nullable()->constrained('trucks', 'truck_id')->nullOnDelete();
            $table->unsignedBigInteger('mechanic_id')->nullable();
            $table->date('inspection_date')->nullable();
            $table->enum('overall_condition', ['good','fair','poor','critical'])->nullable();
            $table->decimal('mileage', 10, 2)->nullable();
            $table->string('issue_title');
            $table->text('issue_description');
            $table->enum('priority_level', ['low','medium','high','emergency'])->default('medium');
            $table->enum('status', ['pending','in_review','reviewed','approved','scheduled','in_progress','completed','rejected'])->default('pending')->nullable();
            $table->foreignId('assigned_to')->nullable()->constrained('users', 'user_id')->nullOnDelete();
            $table->timestamp('assigned_at')->nullable();
            $table->timestamp('started_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();
            
            $table->index(['driver_id', 'status']);
            $table->index(['truck_id', 'status']);
            $table->index(['priority_level', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('maintenance_reports');
    }
};