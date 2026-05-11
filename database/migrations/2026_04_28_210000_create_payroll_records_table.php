<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payroll_records', function (Blueprint $table) {
            $table->id('payroll_record_id');
            $table->unsignedBigInteger('user_id');
            $table->date('pay_period_start');
            $table->date('pay_period_end');
            $table->integer('working_days')->default(0);
            $table->integer('present_days')->default(0);
            $table->integer('absent_days')->default(0);
            $table->integer('late_days')->default(0);
            $table->decimal('daily_rate', 10, 2)->default(500.00);
            $table->decimal('gross_pay', 10, 2)->default(0.00);
            $table->decimal('deductions_absent', 10, 2)->default(0.00);
            $table->decimal('deductions_late', 10, 2)->default(0.00);
            $table->decimal('deductions_others', 10, 2)->default(0.00);
            $table->decimal('total_deductions', 10, 2)->default(0.00);
            $table->decimal('net_pay', 10, 2)->default(0.00);
            $table->enum('status', ['pending', 'paid'])->default('pending');
            $table->enum('payment_method', ['cash', 'bank', 'gcash'])->nullable();
            $table->timestamp('paid_at')->nullable();
            $table->string('processed_by')->nullable();
            $table->timestamps();

            $table->foreign('user_id')->references('user_id')->on('users')->onDelete('cascade');
            $table->index(['user_id', 'pay_period_start', 'pay_period_end']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payroll_records');
    }
};
