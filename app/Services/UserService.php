<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Exception;

class UserService
{
    /**
     * Create a new user and return the model.
     */
    public function createUser(array $data): User
    {
        return DB::transaction(function () use ($data) {
            $user = User::create([
                'username' => $data['username'],
                'password' => Hash::make($data['password']),
                'role' => $data['role'],
                'firstname' => $data['firstname'],
                'middle_name' => $data['middle_name'] ?? null,
                'lastname' => $data['lastname'],
                'contact_number' => $data['contact_number'],
                'is_active' => true,
                'face_status' => $data['role'] === 'Mechanic' ? 'Not Registered' : 'N/A',
            ]);

            return $user;
        });
    }

    /**
     * Delete user and its relations.
     */
    public function deleteUser(User $user): void
    {
        $user->delete();
    }
}
