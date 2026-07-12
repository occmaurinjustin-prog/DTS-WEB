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
        Schema::table('trucks', function (Blueprint $table) {
            $table->date('next_inspection_date')->nullable()->after('condition');
            $table->unsignedBigInteger('current_inspection_mechanic_id')->nullable()->after('next_inspection_date');

            $table->foreign('current_inspection_mechanic_id')->references('user_id')->on('users')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('trucks', function (Blueprint $table) {
            $table->dropForeign(['current_inspection_mechanic_id']);
            $table->dropColumn(['next_inspection_date', 'current_inspection_mechanic_id']);
        });
    }
};
