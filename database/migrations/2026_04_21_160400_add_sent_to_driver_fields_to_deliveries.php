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
        Schema::table('deliveries', function (Blueprint $table) {
            if (!Schema::hasColumn('deliveries', 'sent_to_driver_at')) {
                $table->timestamp('sent_to_driver_at')->nullable()->after('approved_at');
            }
            if (!Schema::hasColumn('deliveries', 'sent_to_driver_by')) {
                $table->unsignedBigInteger('sent_to_driver_by')->nullable()->after('sent_to_driver_at');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('deliveries', function (Blueprint $table) {
            if (Schema::hasColumn('deliveries', 'sent_to_driver_at')) {
                $table->dropColumn('sent_to_driver_at');
            }
            if (Schema::hasColumn('deliveries', 'sent_to_driver_by')) {
                $table->dropColumn('sent_to_driver_by');
            }
        });
    }
};
