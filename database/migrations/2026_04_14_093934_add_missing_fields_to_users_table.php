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
        Schema::table('users', function (Blueprint $table) {
            $table->date('date_installed')->nullable()->after('assigned_shift');
            $table->string('current_mileage')->nullable()->after('date_installed');
            $table->text('work_description')->nullable()->after('current_mileage');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['date_installed', 'current_mileage', 'work_description']);
        });
    }
};
