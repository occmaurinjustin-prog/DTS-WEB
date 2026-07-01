<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Truck extends Model
{
    protected $primaryKey = 'truck_id';

    protected $fillable = [
        'unique_id',
        'plate_number',
        'vehicle_type',
        'model',
        'year_manufactured',
        'capacity',
        'last_maintenance_mileage',
        'last_maintenance_date',
        'maintenance_interval_mileage',
        'condition',
        'truck_status',
    ];

    protected $casts = [
        'capacity' => 'decimal:2',
        'last_maintenance_mileage' => 'integer',
        'maintenance_interval_mileage' => 'integer',
        'last_maintenance_date' => 'date',
        'year_manufactured' => 'integer',
    ];

    public function getCapacityAttribute($value)
    {
        return $value . ' tons';
    }

    // Relationships
    public function driverReports(): HasMany
    {
        return $this->hasMany(MaintenanceReport::class, 'truck_id', 'truck_id');
    }

    // Check if truck needs maintenance
    public function needsMaintenance(): bool
    {
        // Since current_mileage was removed, check based on maintenance interval only
        return $this->maintenance_interval_mileage > 0;
    }

    // Get next maintenance due mileage
    public function nextMaintenanceMileage(): int
    {
        if (!$this->last_maintenance_mileage) {
            return $this->maintenance_interval_mileage;
        }
        return $this->last_maintenance_mileage + $this->maintenance_interval_mileage;
    }

    // Mark maintenance completed
    public function markMaintenanceCompleted(): void
    {
        $this->last_maintenance_date = now();
        $this->condition = 'good';
        $this->truck_status = 'available';
        $this->save();
    }

    // Scope for active trucks
    public function scopeActive($query)
    {
        return $query->whereIn('truck_status', ['available', 'in_use']);
    }
}
