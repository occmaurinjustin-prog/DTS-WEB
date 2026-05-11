<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Inquiry extends Model
{
    protected $primaryKey = 'inquiry_id';
    
    protected $fillable = [
        'staff_id',
        'sender_name',
        'subject',
        'message_body',
        'status',
    ];
}
