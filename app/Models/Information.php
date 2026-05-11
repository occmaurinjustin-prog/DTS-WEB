<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Information extends Model
{
    protected $primaryKey = 'info_id';
    
    protected $fillable = [
        'user_id',
        'firstname',
        'lastname',
        'contact_number',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id', 'user_id');
    }
}
