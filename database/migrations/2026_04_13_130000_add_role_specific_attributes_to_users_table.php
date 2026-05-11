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
            // Admin attributes
            $table->string('access_level')->nullable()->after('role');
            $table->timestamp('last_login_at')->nullable()->after('access_level');
            
            // Operation Manager attributes
            $table->string('manager_attribute')->nullable()->after('last_login_at');
            
            // Office Staff attributes
            $table->string('extension_no')->nullable()->after('manager_attribute');
            $table->string('assigned_shift')->nullable()->after('extension_no');
            
            // Information attributes
            $table->string('firstname')->nullable()->after('assigned_shift');
            $table->string('lastname')->nullable()->after('firstname');
            $table->string('contact_number')->nullable()->after('lastname');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'access_level',
                'last_login_at',
                'manager_attribute',
                'extension_no',
                'assigned_shift',
                'firstname',
                'lastname',
                'contact_number'
            ]);
        });
    }
};
