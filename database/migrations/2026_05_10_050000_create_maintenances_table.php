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
            $table->unsignedBigInteger('maintenance_report_id')->nullable();
            $table->date('repair_date')->nullable();
            $table->time('repair_time')->nullable();
            $table->string('repair_location')->nullable();
            $table->decimal('estimated_total_cost', 10, 2)->nullable();
            $table->timestamps();

            $table->foreign('maintenance_report_id')
                  ->references('id')
                  ->on('maintenance_reports')
                  ->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('maintenances');
    }
};
