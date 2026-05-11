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

        // Drop the tables
        Schema::dropIfExists('admins');
        Schema::dropIfExists('operation_managers');
        Schema::dropIfExists('office_staff');
        Schema::dropIfExists('information');

        // Re-enable foreign key checks
        DB::statement('SET FOREIGN_KEY_CHECKS=1');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Recreate the tables in reverse order
        Schema::create('information', function (Blueprint $table) {
            $table->id('info_id');
            $table->unsignedBigInteger('user_id');
            $table->string('firstname');
            $table->string('lastname');
            $table->string('contact_number');
            $table->timestamps();
            
            $table->foreign('user_id')->references('user_id')->on('users')->onDelete('cascade');
        });

        Schema::create('office_staff', function (Blueprint $table) {
            $table->id('staff_id');
            $table->unsignedBigInteger('user_id');
            $table->string('extension_no');
            $table->string('assigned_shift');
            $table->timestamps();
            
            $table->foreign('user_id')->references('user_id')->on('users')->onDelete('cascade');
        });

        Schema::create('operation_managers', function (Blueprint $table) {
            $table->id('manager_id');
            $table->unsignedBigInteger('user_id');
            $table->string('attribute')->nullable();
            $table->timestamps();
            
            $table->foreign('user_id')->references('user_id')->on('users')->onDelete('cascade');
        });

        Schema::create('admins', function (Blueprint $table) {
            $table->id('admin_id');
            $table->unsignedBigInteger('user_id');
            $table->string('access_level');
            $table->timestamp('last_login_at')->nullable();
            $table->timestamps();
            
            $table->foreign('user_id')->references('user_id')->on('users')->onDelete('cascade');
        });
    }
};
