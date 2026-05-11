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
        Schema::dropIfExists('maintenance_records');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Recreate the maintenance_records table if needed
        Schema::create('maintenance_records', function (Blueprint $table) {
            $table->id('record_id');
            $table->foreignId('truck_id')->constrained('trucks', 'truck_id');
            $table->foreignId('requested_by')->nullable()->constrained('users', 'user_id');
            $table->string('issue_type');
            $table->text('description');
            $table->string('priority');
            $table->string('status')->default('pending');
            $table->date('scheduled_date')->nullable();
            $table->decimal('cost', 10, 2)->nullable();
            $table->json('parts_used')->nullable();
            $table->timestamps();
        });
    }
};
