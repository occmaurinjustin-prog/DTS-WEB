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
        Schema::dropIfExists('notifications');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::create('notifications', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('driver_id');
            $table->foreign('driver_id')->references('id')->on('drivers')->onDelete('cascade');
            $table->string('title');
            $table->text('message');
            $table->string('type'); // maintenance, success, delivery, warning, default
            $table->boolean('read')->default(false);
            $table->json('data')->nullable(); // Additional notification data
            $table->timestamps();
            
            $table->index(['driver_id', 'created_at']);
            $table->index(['driver_id', 'read']);
        });
    }
};
