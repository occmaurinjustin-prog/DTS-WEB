<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RescueMedia extends Model
{
    use HasFactory;

    protected $primaryKey = 'media_id';

    protected $fillable = [
        'rescue_id',
        'file_path',
        'file_type',
    ];

    public function rescueRequest()
    {
        return $this->belongsTo(RescueRequest::class, 'rescue_id', 'rescue_id');
    }
}
