<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('maintenances', function (Blueprint $table) {
            $table->unsignedBigInteger('mechanic_id')->nullable()->after('maintenance_report_id');
            
            $table->foreign('mechanic_id')
                  ->references('id')
                  ->on('mechanics')
                  ->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::table('maintenances', function (Blueprint $table) {
            $table->dropForeign(['mechanic_id']);
            $table->dropColumn('mechanic_id');
        });
    }
};
