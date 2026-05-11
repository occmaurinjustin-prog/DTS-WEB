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
            if (Schema::hasColumn('users', 'date_installed')) {
                $table->dropColumn('date_installed');
            }
            if (Schema::hasColumn('users', 'current_mileage')) {
                $table->dropColumn('current_mileage');
            }
            if (Schema::hasColumn('users', 'work_description')) {
                $table->dropColumn('work_description');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->date('date_installed')->nullable()->after('assigned_shift');
            $table->string('current_mileage')->nullable()->after('date_installed');
            $table->text('work_description')->nullable()->after('current_mileage');
        });
    }
};
