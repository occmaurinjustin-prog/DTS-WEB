<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Disable foreign key checks temporarily
        DB::statement('SET FOREIGN_KEY_CHECKS=0');

        Schema::table('deliveries', function (Blueprint $table) {
            // Change manager_id to user_id and reference users table
            $table->renameColumn('manager_id', 'user_id');
        });

        Schema::table('deliveries', function (Blueprint $table) {
            // Add the new foreign key to users table
            $table->foreign('user_id')->references('user_id')->on('users')->onDelete('cascade');
        });

        // Re-enable foreign key checks
        DB::statement('SET FOREIGN_KEY_CHECKS=1');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Disable foreign key checks temporarily
        DB::statement('SET FOREIGN_KEY_CHECKS=0');

        Schema::table('deliveries', function (Blueprint $table) {
            // Drop the new foreign key
            $table->dropForeign(['user_id']);
            
            // Change user_id back to manager_id
            $table->renameColumn('user_id', 'manager_id');
        });

        // Re-enable foreign key checks
        DB::statement('SET FOREIGN_KEY_CHECKS=1');

        // Note: This rollback won't recreate the operation_managers table
        // The role-specific tables would need to be recreated separately
    }
};
