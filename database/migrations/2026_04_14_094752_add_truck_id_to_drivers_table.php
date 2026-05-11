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
        Schema::table('drivers', function (Blueprint $table) {
            if (!Schema::hasColumn('drivers', 'truck_id')) {
                $table->unsignedBigInteger('truck_id')->nullable()->after('user_id');
                $table->foreign('truck_id')->references('truck_id')->on('trucks')->onDelete('set null');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('drivers', function (Blueprint $table) {
            if (Schema::hasColumn('drivers', 'truck_id')) {
                $table->dropForeign(['truck_id']);
                $table->dropColumn('truck_id');
            }
        });
    }
};
