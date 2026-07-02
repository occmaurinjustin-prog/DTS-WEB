<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RescueRequestMedia extends Model
{
    use HasFactory;

    protected $table = 'rescue_request_media';

    protected $fillable = [
        'rescue_request_id',
        'file_path',
        'media_type',
        'type'
    ];

    public function rescueRequest(): BelongsTo
    {
        return $this->belongsTo(RescueRequest::class, 'rescue_request_id');
    }
}
