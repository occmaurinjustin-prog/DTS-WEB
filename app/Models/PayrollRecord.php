<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PayrollRecord extends Model
{
    use HasFactory;

    protected $primaryKey = 'payroll_record_id';

    protected $fillable = [
        'user_id',
        'pay_period_start',
        'pay_period_end',
        'working_days',
        'present_days',
        'whole_day',
        'half_day',
        'absent_days',
        'late_days',
        'daily_rate',
        'gross_pay',
        'deductions_absent',
        'deductions_late',
        'deductions_others',
        'total_deductions',
        'net_pay',
        'status',
        'payment_method',
        'paid_at',
        'processed_by',
    ];

    protected $casts = [
        'pay_period_start' => 'date',
        'pay_period_end' => 'date',
        'paid_at' => 'datetime',
        'daily_rate' => 'decimal:2',
        'gross_pay' => 'decimal:2',
        'deductions_absent' => 'decimal:2',
        'deductions_late' => 'decimal:2',
        'deductions_others' => 'decimal:2',
        'total_deductions' => 'decimal:2',
        'net_pay' => 'decimal:2',
        'whole_day' => 'integer',
        'half_day' => 'integer',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id', 'user_id');
    }
}
