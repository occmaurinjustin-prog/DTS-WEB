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
        Schema::create('payroll', function (Blueprint $table) {
            $table->id('payroll_id');
            $table->unsignedBigInteger('attend_id')->nullable();
            $table->text('time_In_records')->nullable();
            $table->timestamps();
            
            $table->foreign('attend_id')->references('attend_id')->on('attendance')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payroll');
    }
};
