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
            if (!Schema::hasColumn('deliveries', 'approved_at')) {
                $table->timestamp('approved_at')->nullable()->after('status');
            }
            if (!Schema::hasColumn('deliveries', 'rejected_at')) {
                $table->timestamp('rejected_at')->nullable()->after('approved_at');
            }
            if (!Schema::hasColumn('deliveries', 'sent_to_driver_at')) {
                $table->timestamp('sent_to_driver_at')->nullable()->after('rejected_at');
            }
            if (!Schema::hasColumn('deliveries', 'sent_to_driver_by')) {
                $table->unsignedBigInteger('sent_to_driver_by')->nullable()->after('sent_to_driver_at');
                $table->foreign('sent_to_driver_by')->references('user_id')->on('users')->onDelete('set null');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('deliveries', function (Blueprint $table) {
            $table->dropForeign(['sent_to_driver_by']);
            $table->dropColumnIfExists('sent_to_driver_at');
            $table->dropColumnIfExists('sent_to_driver_by');
            $table->dropColumnIfExists('approved_at');
            $table->dropColumnIfExists('rejected_at');
        });
    }
};
