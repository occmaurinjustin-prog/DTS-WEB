<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AttendanceLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'attendance_id',
        'user_id',
        'attendance_type',
        'captured_at',
        'latitude',
        'longitude',
        'address',
        'face_confidence',
        'device_name',
        'ip_address',
        'photo_path',
    ];

    protected $casts = [
        'captured_at' => 'datetime',
        'face_confidence' => 'decimal:2',
    ];

    public function attendance(): BelongsTo
    {
        return $this->belongsTo(Attendance::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id', 'user_id');
    }
}
