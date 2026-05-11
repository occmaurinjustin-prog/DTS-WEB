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
        Schema::table('inventory', function (Blueprint $table) {
            // Remove user_id column
            $table->dropForeign(['user_id']);
            $table->dropColumn('user_id');
            
            // Add new columns for maintenance parts
            $table->string('part_name')->after('Inventory_id');
            $table->string('part_number')->nullable()->after('part_name');
            $table->text('description')->nullable()->after('part_number');
            $table->string('category')->nullable()->after('description');
            $table->integer('quantity')->default(0)->after('category');
            $table->integer('min_stock_level')->default(5)->after('quantity');
            $table->string('unit')->default('pcs')->after('min_stock_level');
            $table->decimal('unit_cost', 10, 2)->default(0)->after('unit');
            $table->string('supplier')->nullable()->after('unit_cost');
            $table->enum('status', ['available', 'low_stock', 'out_of_stock'])->default('available')->after('supplier');
            
            // Drop old columns if not needed, or keep them for backward compatibility
            // Keeping tire_type and rim_type for backward compatibility
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('inventory', function (Blueprint $table) {
            $table->unsignedBigInteger('user_id')->nullable();
            $table->foreign('user_id')->references('user_id')->on('users')->onDelete('cascade');
            
            $table->dropColumn([
                'part_name',
                'part_number',
                'description',
                'category',
                'quantity',
                'min_stock_level',
                'unit',
                'unit_cost',
                'supplier',
                'status'
            ]);
        });
    }
};
