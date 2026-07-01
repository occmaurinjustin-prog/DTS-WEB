<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Driver extends Model
{
    protected $primaryKey = 'driver_id';

    protected $fillable = [
        'user_id',
        'license_no',
        'availability_status',
        'truck_id',
        'current_latitude',
        'current_longitude',
        'last_location_update',
        'current_speed',
        'is_gps_enabled',
    ];

    protected $casts = [
        'last_location_update' => 'datetime',
        'current_latitude' => 'decimal:8',
        'current_longitude' => 'decimal:8',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id', 'user_id');
    }

    public function truck(): BelongsTo
    {
        return $this->belongsTo(Truck::class, 'truck_id', 'truck_id');
    }

    public function deliveries(): HasMany
    {
        return $this->hasMany(Delivery::class, 'driver_id', 'driver_id');
    }
}
