<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Driver;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Enum;

class UserManagementController extends Controller
{
    public function index()
    {
        $users = User::orderBy('created_at', 'desc')->get();
        
        return inertia('Admin/Users', [
            'users' => $users,
        ]);
    }

    public function store(Request $request)
    {
        try {
            \Log::info('User creation request data:', $request->all());
            
            $isMechanic = $request->input('role') === 'mechanic';

            $data = $request->validate([
                'role' => ['required', 'string', 'in:admin,operation_manager,office_staff,driver,mechanic'],
                'username' => $isMechanic ? 'nullable|string|max:255|unique:users,username' : 'required|string|max:255|unique:users,username',
                'password' => $isMechanic ? 'nullable|string|min:8' : 'required|string|min:8|confirmed',
                'email' => $isMechanic ? 'required|email|max:255' : 'nullable|email|max:255',
                'first_name' => 'required|string|max:255',
                'middle_name' => 'nullable|string|max:255',
                'last_name' => 'required|string|max:255',
                'phone' => 'required|string|size:11|regex:/^[0-9]{11}$/',
                'is_active' => 'nullable|boolean',
                // Role-specific fields
                'department' => 'nullable|string|max:255',
                'position' => 'nullable|string|max:255',
                'extension_no' => 'nullable|string|max:50|unique:users,extension_no',
                'assigned_shift' => 'nullable|string|max:255',
                // Driver fields
                'license_number' => 'nullable|string|max:255',
                'truck_plate' => 'nullable|string|max:255',
                'truck_vehicle_type' => 'nullable|string|max:255',
                'truck_capacity' => 'nullable|string|max:255',
                'truck_condition' => 'nullable|string|max:255',
                // Mechanic face recognition
                'face_descriptor' => 'nullable|array',
            ]);

            \Log::info('Validated data:', $data);

            // Validate role-specific fields
            $this->validateRoleSpecificFields($data['role'], $request);

            \Log::info('Creating user with data:', [
                'username' => $data['username'],
                'role' => $data['role'],
                'is_active' => $request->boolean('is_active', true)
            ]);

            // For mechanics, auto-generate username from email and set default password
            if ($isMechanic) {
                $username = explode('@', $data['email'])[0] . '_' . time();
                $password = Hash::make('mechanic_default_pass_' . time());
            } else {
                $username = $data['username'];
                $password = Hash::make($data['password']);
            }

            $user = User::create([
                'username' => $username,
                'password' => $password,
                'role' => $data['role'],
                'is_active' => $request->boolean('is_active', true),
            ]);

            // Store email for mechanics
            if ($isMechanic && !empty($data['email'])) {
                $user->update(['email' => $data['email']]);
            }

            \Log::info('User created successfully:', ['user_id' => $user->user_id]);

            // Store face descriptor and generate unique_id for mechanic
            if ($isMechanic) {
                $uniqueId = 'MEC-' . date('Y') . '-' . str_pad($user->user_id, 4, '0', STR_PAD_LEFT);

                $updateData = [
                    'unique_id' => $uniqueId,
                    'email' => $data['email'] ?? null
                ];

                if (!empty($data['face_descriptor'])) {
                    $updateData['face_descriptor'] = json_encode($data['face_descriptor']);
                }

                $user->update($updateData);
                \Log::info('Mechanic created with unique_id and face_descriptor:', [
                    'user_id' => $user->user_id,
                    'unique_id' => $uniqueId,
                    'email' => $data['email'] ?? null
                ]);
            }

            // Store role-specific data
            $this->storeRoleSpecificData($user, $data);

            \Log::info('Role-specific data stored successfully');

            return redirect()->back()->with('success', 'User created successfully.');
        } catch (\Illuminate\Validation\ValidationException $e) {
            \Log::error('Validation error creating user:', $e->errors());
            return redirect()->back()
                ->withErrors($e->errors())
                ->withInput();
        } catch (\Exception $e) {
            \Log::error('Error creating user: ' . $e->getMessage());
            \Log::error('Stack trace: ' . $e->getTraceAsString());
            
            return redirect()->back()
                ->withErrors(['error' => 'Failed to create user: ' . $e->getMessage()])
                ->withInput();
        }
    }

    private function validateRoleSpecificFields($role, Request $request)
    {
        switch($role) {
            case 'office_staff':
                // No additional validation required
                break;
            case 'operation_manager':
                // No additional validation required
                break;
            case 'driver':
                $request->validate([
                    'license_number' => 'required|string|max:255',
                ]);
                break;
        }
    }

    private function storeRoleSpecificData(User $user, array $data)
    {
        try {
            \Log::info('Storing role-specific data for user:', ['user_id' => $user->user_id, 'role' => $data['role']]);
            
            // Store all data directly in users table
            $user->update([
                'firstname' => $data['first_name'],
                'middle_name' => $data['middle_name'] ?? null,
                'lastname' => $data['last_name'],
                'contact_number' => $data['phone'],
                'extension_no' => $data['extension_no'] ?? null,
                'assigned_shift' => $data['assigned_shift'] ?? null,
            ]);
            
            \Log::info('User data updated successfully');

            // Create driver and truck records if role is driver
            if ($data['role'] === 'driver') {
                \Log::info('Creating driver record for user:', ['user_id' => $user->user_id]);
                
                $driver = Driver::create([
                    'user_id' => $user->user_id,
                    'license_no' => $data['license_number'] ?? null,
                    'plate_number' => $data['truck_plate'] ?? null,
                    'vehicle_type' => $data['truck_vehicle_type'] ?? null,
                    'availability_status' => 'available',
                ]);
                
                \Log::info('Driver record created:', ['driver_id' => $driver->driver_id]);
                
                // Create truck if truck data provided
                if (!empty($data['truck_plate']) && !empty($data['truck_vehicle_type'])) {
                    \Log::info('Creating truck record for driver:', ['plate' => $data['truck_plate']]);
                    
                    $truck = \App\Models\Truck::create([
                        'plate_number' => $data['truck_plate'],
                        'vehicle_type' => $data['truck_vehicle_type'],
                        'capacity' => $data['truck_capacity'] ?? null,
                        'condition' => $data['truck_condition'] ?? 'good',
                        'status' => 'available',
                    ]);
                    
                    \Log::info('Truck record created:', ['truck_id' => $truck->truck_id]);
                    
                    // Update driver with truck_id
                    $driver->update(['truck_id' => $truck->truck_id]);
                    \Log::info('Driver updated with truck_id:', ['truck_id' => $truck->truck_id]);
                }
            }

            \Log::info('Role-specific data storage completed successfully');
        } catch (\Exception $e) {
            \Log::error('Error storing role-specific data: ' . $e->getMessage());
            \Log::error('Stack trace: ' . $e->getTraceAsString());
            throw $e;
        }
    }

    public function update(Request $request, User $user)
    {
        try {
            \Log::info('Updating user:', ['user_id' => $user->user_id]);
            \Log::info('Request data:', $request->all());

            $data = $request->validate([
                'username' => 'required|string|max:255|unique:users,username,' . $user->user_id . ',user_id',
                'role' => ['required', 'string', 'in:admin,operation_manager,office_staff,driver,mechanic'],
                'is_active' => 'nullable|boolean',
                'first_name' => 'required|string|max:255',
                'middle_name' => 'nullable|string|max:255',
                'last_name' => 'required|string|max:255',
                'phone' => 'required|string|size:11|regex:/^[0-9]{11}$/',
                // Role-specific fields
                'extension_no' => 'nullable|string|max:50|unique:users,extension_no,' . $user->user_id . ',user_id',
                'assigned_shift' => 'nullable|string|max:255',
                // Driver fields
                'license_number' => 'nullable|string|max:255',
                'truck_plate' => 'nullable|string|max:255',
                'truck_vehicle_type' => 'nullable|string|max:255',
                'truck_capacity' => 'nullable|string|max:255',
                'truck_condition' => 'nullable|string|max:255',
                // Mechanic face recognition
                'face_descriptor' => 'nullable|array',
            ]);

            \Log::info('Validated data:', $data);

            // Update user basic info (excluding role to prevent session issues)
            $user->update([
                'username' => $data['username'],
                'is_active' => $request->boolean('is_active', true),
                'firstname' => $data['first_name'],
                'middle_name' => $data['middle_name'] ?? null,
                'lastname' => $data['last_name'],
                'contact_number' => $data['phone'],
                'extension_no' => $data['extension_no'] ?? null,
                'assigned_shift' => $data['assigned_shift'] ?? null,
            ]);

            // Update face descriptor for mechanic
            if ($data['role'] === 'mechanic' && !empty($data['face_descriptor'])) {
                $user->update([
                    'face_descriptor' => json_encode($data['face_descriptor']),
                ]);
                \Log::info('Face descriptor updated for mechanic:', ['user_id' => $user->user_id]);
            }

            // Update password if provided
            if ($request->filled('password')) {
                $request->validate([
                    'password' => 'required|string|min:8|confirmed',
                ]);
                $user->update([
                    'password' => Hash::make($request->password),
                ]);
            }

            \Log::info('User basic info updated');

            // Handle driver updates
            if ($data['role'] === 'driver') {
                $driver = $user->driver;
                if ($driver) {
                    // Update driver record
                    $driver->update([
                        'license_no' => $data['license_number'] ?? $driver->license_no,
                        'plate_number' => $data['truck_plate'] ?? $driver->plate_number,
                        'vehicle_type' => $data['truck_vehicle_type'] ?? $driver->vehicle_type,
                    ]);
                    \Log::info('Driver record updated');
                    
                    // Update or create truck if data provided
                    if (!empty($data['truck_plate']) && !empty($data['truck_vehicle_type'])) {
                        if ($driver->truck) {
                            // Update existing truck
                            $driver->truck->update([
                                'plate_number' => $data['truck_plate'],
                                'vehicle_type' => $data['truck_vehicle_type'],
                                'capacity' => $data['truck_capacity'] ?? $driver->truck->capacity,
                                'condition' => $data['truck_condition'] ?? $driver->truck->condition,
                            ]);
                            \Log::info('Truck record updated');
                        } else {
                            // Create new truck
                            $truck = \App\Models\Truck::create([
                                'plate_number' => $data['truck_plate'],
                                'vehicle_type' => $data['truck_vehicle_type'],
                                'capacity' => $data['truck_capacity'] ?? null,
                                'condition' => $data['truck_condition'] ?? 'good',
                                'status' => 'available',
                            ]);
                            $driver->update(['truck_id' => $truck->truck_id]);
                            \Log::info('Truck record created and linked to driver');
                        }
                    }
                } else {
                    // Create driver record if not exists
                    $driver = Driver::create([
                        'user_id' => $user->user_id,
                        'license_no' => $data['license_number'] ?? null,
                        'plate_number' => null, // No truck assignment on create
                        'vehicle_type' => null, // No truck assignment on create
                        'availability_status' => 'available',
                    ]);
                    \Log::info('Driver record created (no truck assigned)');
                }
            }

            \Log::info('User update completed successfully');

            return redirect()->back()->with('success', 'User updated successfully.');
        } catch (\Exception $e) {
            \Log::error('Error updating user: ' . $e->getMessage());
            \Log::error('Stack trace: ' . $e->getTraceAsString());
            
            return redirect()->back()
                ->withErrors(['error' => 'Failed to update user: ' . $e->getMessage()])
                ->withInput();
        }
    }

    public function destroy(User $user)
    {
        $user->delete();
        return redirect()->back()->with('success', 'User deleted successfully.');
    }

    public function toggleStatus(User $user)
    {
        $user->update([
            'is_active' => !$user->is_active,
        ]);

        return redirect()->route('admin.users.index')->with('success', 'User status updated successfully.');
    }
}
