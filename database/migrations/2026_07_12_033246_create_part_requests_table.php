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
        Schema::create('part_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('mechanic_id')->constrained('users', 'user_id')->onDelete('cascade');
            $table->foreignId('inventory_id')->nullable()->constrained('inventory', 'Inventory_id')->onDelete('set null');
            $table->string('part_name');
            $table->integer('quantity')->default(1);
            $table->text('reason')->nullable();
            $table->enum('status', ['pending', 'approved', 'purchased', 'completed', 'rejected'])->default('pending');
            $table->foreignId('approved_by')->nullable()->constrained('users', 'user_id')->onDelete('set null');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('part_requests');
    }
};
