<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DriverStop extends Model
{
    use HasFactory;

    protected $fillable = [
        'driver_id',
        'delivery_id',
        'latitude',
        'longitude',
        'address',
        'stopped_at',
        'resumed_at',
        'duration_minutes',
    ];

    protected $casts = [
        'stopped_at' => 'datetime',
        'resumed_at' => 'datetime',
        'latitude' => 'decimal:8',
        'longitude' => 'decimal:8',
    ];

    public function driver()
    {
        return $this->belongsTo(Driver::class, 'driver_id', 'driver_id');
    }

    public function delivery()
    {
        return $this->belongsTo(Delivery::class, 'delivery_id', 'delivery_id');
    }
}
