<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\HasMany;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $primaryKey = 'user_id';
    
    protected $fillable = [
        'username',
        'password',
        'role',
        'is_active',
        'firstname',
        'middle_name',
        'lastname',
        'contact_number',
        'address',
        'last_login_at',
        'extension_no',
        'assigned_shift',
        'face_encoding',
        'face_registered_at',
        'face_status',
        'email',
        'exchangepassword',
        'current_latitude',
        'current_longitude',
        'last_location_update',
        'profile_image',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'current_latitude' => 'float',
            'current_longitude' => 'float',
            'last_location_update' => 'datetime',
        ];
    }

    public function driver(): HasOne
    {
        return $this->hasOne(Driver::class, 'user_id', 'user_id');
    }

    public function attendances(): HasMany
    {
        return $this->hasMany(Attendance::class, 'user_id', 'user_id');
    }

    public function faceRegistration(): HasOne
    {
        return $this->hasOne(FaceRegistration::class, 'user_id', 'user_id');
    }

    public function payrolls(): HasMany
    {
        return $this->hasMany(Payroll::class, 'user_id', 'user_id');
    }
}
