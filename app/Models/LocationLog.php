<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LocationLog extends Model
{
    protected $primaryKey = 'log_id';
    
    protected $fillable = [
        'delivery_id',
        'lat',
        'long',
        'speed_kmh',
        'recorded_at',
    ];

    protected $casts = [
        'lat' => 'decimal:8',
        'long' => 'decimal:8',
        'speed_kmh' => 'decimal:2',
        'recorded_at' => 'datetime',
    ];

    public function delivery(): BelongsTo
    {
        return $this->belongsTo(Delivery::class, 'delivery_id', 'delivery_id');
    }
}
