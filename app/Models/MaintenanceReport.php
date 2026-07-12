<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class MaintenanceReport extends Model
{
    protected $fillable = [
        'driver_id',
        'truck_id',
        'mechanic_id',
        'inspection_date',
        'overall_condition',
        'mileage',
        'issue_title',
        'issue_description',
        'priority_level',
        'status',
        'admin_notes',
        'started_at',
        'completed_at',
        'parts_used',
        'labor_cost',
    ];

    protected $casts = [
        'started_at' => 'datetime',
        'completed_at' => 'datetime',
        'inspection_date' => 'date',
        'parts_used' => 'array',
        'labor_cost' => 'decimal:2',
    ];

    protected $appends = ['has_scheduled'];

    /**
     * Check if maintenance has been scheduled
     */
    public function getHasScheduledAttribute(): bool
    {
        return !is_null($this->maintenance);
    }

    /**
     * Get the driver who submitted the report
     */
    public function driver(): BelongsTo
    {
        return $this->belongsTo(Driver::class, 'driver_id', 'driver_id');
    }

    /**
     * Get the mechanic who performed the inspection (if applicable)
     */
    public function mechanic(): BelongsTo
    {
        return $this->belongsTo(User::class, 'mechanic_id', 'user_id');
    }

    /**
     * Get the truck associated with the report
     */
    public function truck(): BelongsTo
    {
        return $this->belongsTo(Truck::class, 'truck_id', 'truck_id');
    }

    /**
     * Get the maintenance record associated with this report
     */
    public function maintenance(): HasOne
    {
        return $this->hasOne(Maintenance::class, 'maintenance_report_id', 'id');
    }

    /**
     * Get the parts used for this report via the transactions ledger
     */
    public function usedParts(): HasMany
    {
        return $this->hasMany(InventoryTransaction::class, 'reference_id', 'id')
                    ->where('reference_type', 'maintenance');
    }

    /**
     * Get the user assigned to handle the report
     */
    public function assignedUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_to', 'user_id');
    }

    /**
     * Get the driver user through the driver relationship
     */
    public function driverUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'driver_id', 'user_id');
    }

    /**
     * Scope to get reports by status
     */
    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    /**
     * Scope to get reports by priority
     */
    public function scopeByPriority($query, $priority)
    {
        return $query->where('priority_level', $priority);
    }

    /**
     * Scope to get pending reports
     */
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    /**
     * Scope to get reports assigned to a specific user
     */
    public function scopeAssignedTo($query, $userId)
    {
        return $query->where('assigned_to', $userId);
    }

    /**
     * Get formatted priority level
     */
    public function getFormattedPriorityAttribute(): string
    {
        return ucfirst(str_replace('_', ' ', $this->priority_level));
    }

    /**
     * Get formatted status
     */
    public function getFormattedStatusAttribute(): string
    {
        return ucfirst(str_replace('_', ' ', $this->status));
    }

    /**
     * Check if report is pending
     */
    public function isPending(): bool
    {
        return $this->status === 'pending';
    }

    /**
     * Check if report is in progress
     */
    public function isInProgress(): bool
    {
        return $this->status === 'in_progress';
    }

    /**
     * Check if report is completed
     */
    public function isCompleted(): bool
    {
        return $this->status === 'completed';
    }

    /**
     * Assign report to a user
     */
    public function assignTo($userId): void
    {
        $this->update([
            'assigned_to' => $userId,
            'assigned_at' => now(),
            'status' => 'approved',
        ]);
    }

    /**
     * Start work on the report
     */
    public function startWork(): void
    {
        $this->update([
            'status' => 'in_progress',
            'started_at' => now(),
        ]);
    }

    /**
     * Complete the report
     */
    public function complete($notes = null): void
    {
        $this->update([
            'status' => 'completed',
            'completed_at' => now(),
            'admin_notes' => $notes,
        ]);
    }

    /**
     * Reject the report
     */
    public function reject($reason = null): void
    {
        $this->update([
            'status' => 'rejected',
            'admin_notes' => $reason,
        ]);
    }
}
