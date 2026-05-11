<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Attendance extends Model
{
    protected $table = 'attendance';
    protected $primaryKey = 'attend_id';

    protected $fillable = [
        'user_id',
        'date',
        'time_In',
        'time_out',
        'status',
        'attendance_type',
        'leave_type',
        'leave_note',
    ];

    protected $casts = [
        'date' => 'date',
        'time_In' => 'datetime',
        'time_out' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id', 'user_id');
    }
}
