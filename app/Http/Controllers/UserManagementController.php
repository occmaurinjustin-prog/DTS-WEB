<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Driver;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use App\Mail\AccountCreatedMail;

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
            // Validate request and prepare data
            $data = $request->validate([
                'role' => ['required', 'string', 'in:admin,operation_manager,office_staff,driver,mechanic,purchaser,billing'],
                'username' => 'required|string|max:255|unique:users,username',
                'email' => 'required|email|max:255|unique:users,email',
                'first_name' => 'required|string|max:255',
                'middle_name' => 'nullable|string|max:255',
                'last_name' => 'required|string|max:255',
                'phone' => 'required|string|size:11|regex:/^[0-9]{11}$/|unique:users,contact_number',
                'is_active' => 'nullable|boolean',
                // Driver fields
                'license_number' => 'nullable|string|max:255',
                'truck_plate' => 'nullable|string|max:255',
                'truck_vehicle_type' => 'nullable|string|max:255',
                'truck_capacity' => 'nullable|string|max:255',
                'truck_condition' => 'nullable|string|max:255',
            ]);

            $this->validateRoleSpecificFields($data['role'], $request);

            $user = null;
            $plainPassword = Str::random(8);

            DB::transaction(function () use ($request, $data, $plainPassword, &$user) {
                // Create user
                $user = User::create([
                    'username' => $data['username'],
                    'email' => $data['email'],
                    'password' => Hash::make($plainPassword),
                    'role' => $data['role'],
                    'is_active' => $request->boolean('is_active', true),
                    'exchangepassword' => false, // 0 = not exchanged (must change)
                ]);

                // Store role-specific data
                $this->storeRoleSpecificData($user, $data);
            });

            // Register face for mechanics when images are present
            // This MUST be outside the transaction because Python Face API 
            // directly commits to the DB requiring the user_id to exist globally.
            if ($user && $data['role'] === 'mechanic' && $request->hasFile('images')) {
                $faceService = app(\App\Services\FaceRegistrationService::class);
                $images = $request->file('images');
                $success = $faceService->registerFace($user, $images);
                if (! $success) {
                    $user->delete();
                    throw new \Exception('Face API failed to process the images.');
                }
            }
            if ($user && $data['email']) {
                Mail::to($data['email'])->send(new AccountCreatedMail($user, $plainPassword));
            }

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
                'role' => ['required', 'string', 'in:admin,operation_manager,office_staff,driver,mechanic,purchaser,billing'],
                'is_active' => 'nullable|boolean',
                'first_name' => 'required|string|max:255',
                'middle_name' => 'nullable|string|max:255',
                'last_name' => 'required|string|max:255',
                'phone' => 'required|string|size:11|regex:/^[0-9]{11}$/|unique:users,contact_number,' . $user->user_id . ',user_id',
                // Driver fields
                'license_number' => 'nullable|string|max:255',
                'truck_plate' => 'nullable|string|max:255',
                'truck_vehicle_type' => 'nullable|string|max:255',
                'truck_capacity' => 'nullable|string|max:255',
                'truck_condition' => 'nullable|string|max:255',
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
            ]);

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
