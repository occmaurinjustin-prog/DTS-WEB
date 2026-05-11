<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('maintenance_records', function (Blueprint $table) {
            $table->id('record_id');
            $table->foreignId('truck_id')->constrained('trucks', 'truck_id')->onDelete('cascade');
            $table->unsignedBigInteger('mechanic_id')->nullable();
            $table->foreignId('requested_by')->constrained('users', 'user_id')->onDelete('cascade');
            $table->string('work_order_id')->unique();
            $table->enum('issue_type', ['preventive', 'repair', 'inspection'])->default('repair');
            $table->text('description');
            $table->enum('priority', ['low', 'medium', 'high', 'critical'])->default('medium');
            $table->enum('status', ['pending', 'assigned', 'ongoing', 'completed', 'cancelled'])->default('pending');
            $table->date('scheduled_date')->nullable();
            $table->dateTime('started_at')->nullable();
            $table->dateTime('completed_at')->nullable();
            $table->text('repair_notes')->nullable();
            $table->text('inspection_result')->nullable();
            $table->decimal('cost', 10, 2)->default(0);
            $table->json('parts_used')->nullable(); // Array of parts with quantities
            $table->string('completion_proof')->nullable(); // Image path
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('maintenance_records');
    }
};
