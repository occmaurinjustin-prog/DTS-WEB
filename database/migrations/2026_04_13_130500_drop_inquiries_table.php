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

        // Drop the inquiries table
        Schema::dropIfExists('inquiries');

        // Re-enable foreign key checks
        DB::statement('SET FOREIGN_KEY_CHECKS=1');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Recreate the inquiries table
        Schema::create('inquiries', function (Blueprint $table) {
            $table->id('inquiry_id');
            $table->unsignedBigInteger('staff_id');
            $table->string('sender_name');
            $table->string('subject');
            $table->text('message_body');
            $table->enum('status', ['open', 'in_progress', 'closed'])->default('open');
            $table->timestamps();
            
            // Note: This references the deleted office_staff table
            // Would need to be updated to reference users table instead
            $table->foreign('staff_id')->references('staff_id')->on('office_staff')->onDelete('cascade');
        });
    }
};
