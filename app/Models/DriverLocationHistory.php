<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DriverLocationHistory extends Model
{
    use HasFactory;

    protected $fillable = [
        'driver_id',
        'delivery_id',
        'latitude',
        'longitude',
        'speed',
        'heading',
        'is_gps_enabled',
        'was_offline',
        'recorded_at',
    ];

    protected $casts = [
        'latitude'      => 'decimal:7',
        'longitude'     => 'decimal:7',
        'speed'         => 'decimal:2',
        'heading'       => 'decimal:2',
        'is_gps_enabled'=> 'boolean',
        'was_offline'   => 'boolean',
        'recorded_at'   => 'datetime',
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
