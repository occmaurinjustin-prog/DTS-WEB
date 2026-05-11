<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Delivery extends Model
{
    protected $primaryKey = 'delivery_id';
    
    protected $fillable = [
        'user_id',
        'driver_id',
        'client_id',
        'truck_id',
        'delivery_status',
        'navigation_phase',
        'weight_tons',
        'item_description',
        'tracking_number',
        'priority',
        'estimated_delivery_time',
        'pickup_address',
        'pickup_latitude',
        'pickup_longitude',
        'delivery_address',
        'delivery_latitude',
        'delivery_longitude',
        'approved_at',
        'rejected_at',
        'sent_to_driver_at',
        'sent_to_driver_by',
    ];

    protected $casts = [
        'weight_tons' => 'decimal:2',
        'approved_at' => 'datetime',
        'rejected_at' => 'datetime',
        'estimated_delivery_time' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id', 'user_id');
    }

    public function driver(): BelongsTo
    {
        return $this->belongsTo(Driver::class, 'driver_id', 'driver_id');
    }

    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class, 'client_id', 'client_id');
    }

    public function truck(): BelongsTo
    {
        return $this->belongsTo(Truck::class, 'truck_id', 'truck_id');
    }

    public function locationLogs(): HasMany
    {
        return $this->hasMany(LocationLog::class, 'delivery_id', 'delivery_id');
    }

    public function sentToDriverBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'sent_to_driver_by', 'user_id');
    }
}
