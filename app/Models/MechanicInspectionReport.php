<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MechanicInspectionReport extends Model
{
    protected $fillable = [
        'mechanic_id',
        'truck_id',
        'inspection_date',
        'overall_condition',
        'mileage',
        'findings',
        'issues_found',
        'status',
    ];

    protected $casts = [
        'inspection_date' => 'date',
        'mileage' => 'decimal:2',
        'issues_found' => 'array',
    ];

    public function mechanic(): BelongsTo
    {
        return $this->belongsTo(User::class, 'mechanic_id');
    }

    public function truck(): BelongsTo
    {
        return $this->belongsTo(Truck::class, 'truck_id');
    }
}
