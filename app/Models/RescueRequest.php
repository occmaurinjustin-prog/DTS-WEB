<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class RescueRequest extends Model
{
    use HasFactory;

    protected $fillable = [
        'driver_id',
        'truck_id',
        'delivery_id',
        'waybill',
        'latitude',
        'longitude',
        'address',
        'categories',
        'description',
        'severity',
        'is_drivable',
        'status',
        'mechanic_id',
        'eta_minutes',
        'inspection_findings',
        'repair_notes',
        'closed_at'
    ];

    protected $casts = [
        'categories' => 'array',
        'is_drivable' => 'boolean',
        'latitude' => 'float',
        'longitude' => 'float',
        'closed_at' => 'datetime'
    ];

    public function driver(): BelongsTo
    {
        return $this->belongsTo(Driver::class, 'driver_id', 'driver_id');
    }

    public function truck(): BelongsTo
    {
        return $this->belongsTo(Truck::class, 'truck_id', 'truck_id');
    }

    public function delivery(): BelongsTo
    {
        return $this->belongsTo(Delivery::class, 'delivery_id', 'delivery_id');
    }

    public function mechanic(): BelongsTo
    {
        return $this->belongsTo(User::class, 'mechanic_id', 'user_id');
    }

    public function media(): HasMany
    {
        return $this->hasMany(RescueRequestMedia::class, 'rescue_request_id');
    }
}
