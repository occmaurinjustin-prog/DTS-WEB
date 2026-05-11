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
        Schema::table('attendance', function (Blueprint $table) {
            $table->date('date')->nullable()->after('user_id');
            $table->enum('status', ['completed', 'in', 'absent', 'on_leave'])->default('in')->after('time_out');
            $table->enum('attendance_type', ['whole_day', 'half_day', 'leave'])->default('whole_day')->after('status');
            $table->string('leave_type')->nullable()->after('attendance_type');
            $table->text('leave_note')->nullable()->after('leave_type');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('attendance', function (Blueprint $table) {
            $table->dropColumn([
                'date',
                'status',
                'attendance_type',
                'leave_type',
                'leave_note',
            ]);
        });
    }
};
