<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Client extends Model
{
    protected $primaryKey = 'client_id';
    
    protected $fillable = [
        'client_name',
        'phone',
        'address',
    ];

    public function deliveries(): HasMany
    {
        return $this->hasMany(Delivery::class, 'client_id', 'client_id');
    }
}
