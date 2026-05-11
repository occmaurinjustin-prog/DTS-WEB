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
        Schema::table('maintenance_reports', function (Blueprint $table) {
            $table->dropColumn('assigned_to');
            $table->dropColumn('assigned_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('maintenance_reports', function (Blueprint $table) {
            $table->unsignedBigInteger('assigned_to')->nullable()->after('admin_notes');
            $table->foreign('assigned_to')->references('user_id')->on('users')->onDelete('set null');
            $table->timestamp('assigned_at')->nullable()->after('assigned_to');
        });
    }
};
