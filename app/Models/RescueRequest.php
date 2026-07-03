<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RescueRequest extends Model
{
    use HasFactory;

    protected $primaryKey = 'rescue_id';

    protected $fillable = [
        'driver_id',
        'truck_id',
        'mechanic_id',
        'issue_category',
        'description',
        'latitude',
        'longitude',
        'address',
        'mechanic_latitude',
        'mechanic_longitude',
        'status',
        'notes',
        'resolved_at',
    ];

    protected $casts = [
        'latitude' => 'float',
        'longitude' => 'float',
        'mechanic_latitude' => 'float',
        'mechanic_longitude' => 'float',
        'resolved_at' => 'datetime',
    ];

    public function driver()
    {
        return $this->belongsTo(Driver::class, 'driver_id', 'driver_id');
    }

    public function truck()
    {
        return $this->belongsTo(Truck::class, 'truck_id', 'truck_id');
    }

    public function mechanic()
    {
        // mechanics are stored in users table with role 'mechanic'
        return $this->belongsTo(User::class, 'mechanic_id', 'user_id');
    }

    public function media()
    {
        return $this->hasMany(RescueMedia::class, 'rescue_id', 'rescue_id');
    }

    public function parts()
    {
        return $this->belongsToMany(
            \App\Models\Inventory::class,
            'rescue_parts',
            'rescue_request_id',
            'inventory_id',
            'rescue_id',
            'Inventory_id'
        )->withPivot('quantity', 'created_at', 'updated_at')->withTimestamps();
    }
}
