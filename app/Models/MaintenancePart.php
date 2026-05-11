<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MaintenancePart extends Model
{
    use HasFactory;

    protected $fillable = [
        'maintenance_report_id',
        'inventory_id',
        'quantity_used',
        'unit_cost'
    ];

    protected $casts = [
        'quantity_used' => 'integer',
        'unit_cost' => 'decimal:2'
    ];

    public $timestamps = true;

    // Relationships
    public function maintenanceReport()
    {
        return $this->belongsTo(MaintenanceReport::class);
    }

    public function inventory()
    {
        return $this->belongsTo(Inventory::class, 'inventory_id', 'Inventory_id');
    }
}
