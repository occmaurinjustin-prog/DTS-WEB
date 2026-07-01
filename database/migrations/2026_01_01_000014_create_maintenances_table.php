<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('maintenances', function (Blueprint $table) {
            $table->id('maintenance_id');
            $table->foreignId('maintenance_report_id')->nullable()->constrained('maintenance_reports', 'id')->nullOnDelete();
            $table->date('repair_date')->nullable();
            $table->time('repair_time')->nullable();
            $table->string('repair_location')->nullable();
            $table->foreignId('assign_mechanics')->nullable()->constrained('users', 'user_id')->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('maintenances');
    }
};