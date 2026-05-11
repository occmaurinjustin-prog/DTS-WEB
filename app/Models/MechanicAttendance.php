<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MechanicAttendance extends Model
{
    use HasFactory;

    protected $table = 'mechanic_attendances';
    protected $primaryKey = 'attendance_id';

    protected $fillable = [
        'user_id',
        'date',
        'check_in',
        'check_out',
        'hours_worked',
        'status',
        'notes',
    ];

    protected $casts = [
        'date' => 'date',
        'check_in' => 'datetime',
        'check_out' => 'datetime',
        'hours_worked' => 'decimal:2',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id', 'user_id');
    }
}
