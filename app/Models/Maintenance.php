<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Maintenance extends Model
{
    use HasFactory;

    protected $table = 'maintenances';

    protected $primaryKey = 'maintenance_id';

    protected $fillable = [
        'maintenance_report_id',
        'repair_date',
        'repair_time',
        'repair_location',
    ];

    protected $casts = [
        'repair_date' => 'date',
        'repair_time' => 'datetime:H:i',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function maintenanceReport()
    {
        return $this->belongsTo(MaintenanceReport::class, 'maintenance_report_id', 'id');
    }

    public function getFormattedRepairDateAttribute()
    {
        return $this->repair_date ? $this->repair_date->format('M d, Y') : null;
    }

    public function getFormattedRepairTimeAttribute()
    {
        return $this->repair_time ? $this->repair_time->format('h:i A') : null;
    }
}
