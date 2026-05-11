<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class OperationManager extends Model
{
    protected $primaryKey = 'manager_id';
    
    protected $fillable = [
        'user_id',
        'attribute',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id', 'user_id');
    }

    public function deliveries(): HasMany
    {
        return $this->hasMany(Delivery::class, 'manager_id', 'manager_id');
    }
}
