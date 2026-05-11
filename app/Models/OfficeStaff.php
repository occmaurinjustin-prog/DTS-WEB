<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class OfficeStaff extends Model
{
    protected $primaryKey = 'staff_id';
    
    protected $fillable = [
        'user_id',
        'extension_no',
        'assigned_shift',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id', 'user_id');
    }

    public function inquiries(): HasMany
    {
        return $this->hasMany(Inquiry::class, 'staff_id', 'staff_id');
    }
}
