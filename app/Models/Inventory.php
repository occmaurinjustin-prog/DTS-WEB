<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Inventory extends Model
{
    use HasFactory;

    protected $table = 'inventory';
    protected $primaryKey = 'Inventory_id';

    protected $fillable = [
        'part_name',
        'category',
        'quantity',
        'min_stock_level',
        'part_status',
    ];

    protected $casts = [
        'quantity' => 'integer',
        'min_stock_level' => 'integer',
        'part_status' => 'string',
    ];

    // Check if stock is low
    public function isLowStock(): bool
    {
        return $this->quantity <= $this->min_stock_level && $this->quantity > 0;
    }

    // Check if out of stock
    public function isOutOfStock(): bool
    {
        return $this->quantity <= 0;
    }

    // Update status based on quantity
    public function updateStatus(): void
    {
        if ($this->quantity <= 0) {
            $this->part_status = 'out_of_stock';
        } elseif ($this->quantity <= $this->min_stock_level) {
            $this->part_status = 'low_stock';
        } else {
            $this->part_status = 'available';
        }
        $this->save();
    }

    // Deduct quantity
    public function deduct(int $amount): bool
    {
        if ($this->quantity < $amount) {
            return false;
        }
        $this->quantity -= $amount;
        $this->updateStatus();
        return true;
    }

    // Add quantity
    public function add(int $amount): void
    {
        $this->quantity += $amount;
        $this->updateStatus();
    }

    // Scope for low stock items
    public function scopeLowStock($query)
    {
        return $query->where('quantity', '<=', 5)
                     ->where('quantity', '>', 0);
    }

    // Scope for out of stock
    public function scopeOutOfStock($query)
    {
        return $query->where('quantity', '<=', 0);
    }

    public function transactions()
    {
        return $this->hasMany(InventoryTransaction::class, 'inventory_id', 'Inventory_id');
    }
}
