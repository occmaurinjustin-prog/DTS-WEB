<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\MaintenanceReport;
use App\Models\Truck;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class MechanicController extends Controller
{
    /**
     * Login mechanic using user_id only (no password required)
     */
    public function login(Request $request)
    {
        \Log::info('Mechanic login attempt', ['user_id' => $request->input('user_id')]);

        try {
            $data = $request->validate([
                'user_id' => 'required|integer',
            ]);

            \Log::info('Validation passed', ['user_id' => $data['user_id']]);

            $userId = $data['user_id'];

            // Find mechanic by user_id
            $mechanic = User::where('user_id', $userId)
                ->where('role', 'mechanic')
                ->first();

            if (!$mechanic) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid User ID. Please check and try again.'
                ], 404);
            }

            // Check if mechanic is active
            if (!$mechanic->is_active) {
                return response()->json([
                    'success' => false,
                    'message' => 'Your account is inactive. Please contact administrator.'
                ], 403);
            }

            // Generate simple token (in production, use JWT or Sanctum)
            $tokenStr = \Illuminate\Support\Str::random(60);
            $token = base64_encode($mechanic->user_id . ':' . time() . ':' . $tokenStr);
            
            $mechanic->remember_token = hash('sha256', $token);
            $mechanic->save();

            // Return mechanic data
            return response()->json([
                'success' => true,
                'message' => 'Login successful',
                'token' => $token,
                'mechanic' => [
                    'user_id' => $mechanic->user_id,
                    'first_name' => $mechanic->first_name,
                    'last_name' => $mechanic->last_name,
                    'email' => $mechanic->email,
                    'phone' => $mechanic->phone,
                    'role' => $mechanic->role,
                    'must_change_password' => !(bool)$mechanic->exchangepassword,
                ]
            ]);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $e->errors()
            ], 422);

        } catch (\Exception $e) {
            \Log::error('Mechanic login error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'An error occurred during login'
            ], 500);
        }
    }

    /**
     * Get mechanic details by user_id
     */
    public function show($userId)
    {
        try {
            $mechanic = User::where('user_id', $userId)
                ->where('role', 'mechanic')
                ->first();

            if (!$mechanic) {
                return response()->json([
                    'success' => false,
                    'message' => 'Mechanic not found'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'mechanic' => [
                    'user_id' => $mechanic->user_id,
                    'first_name' => $mechanic->first_name,
                    'last_name' => $mechanic->last_name,
                    'email' => $mechanic->email,
                    'phone' => $mechanic->phone,
                    'role' => $mechanic->role,
                    'is_active' => $mechanic->is_active,
                ]
            ]);

        } catch (\Exception $e) {
            \Log::error('Get mechanic error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'An error occurred'
            ], 500);
        }
    }

    /**
     * Get mechanic's assigned maintenance tasks
     */
    public function getAssignments(Request $request)
    {
        try {
            $user = Auth::user();

            if (!$user || $user->role !== 'mechanic') {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized'
                ], 403);
            }

            \Log::info('Fetching assignments for mechanic', ['user_id' => $user->user_id]);

            // Get maintenance records assigned to this mechanic
            $assignments = \App\Models\Maintenance::where('assign_mechanics', $user->user_id)
                ->with(['maintenanceReport.truck', 'maintenanceReport.driver.user'])
                ->orderBy('created_at', 'desc')
                ->get();

            \Log::info('Found assignments', ['count' => $assignments->count()]);

            $formattedAssignments = $assignments->map(function($maintenance) {
                $report = $maintenance->maintenanceReport;
                
                \Log::info('Processing assignment', [
                    'maintenance_id' => $maintenance->maintenance_id,
                    'report_id' => $report?->id,
                    'report_status' => $report?->status,
                ]);

                return [
                    'id' => $maintenance->maintenance_id,
                    'report_id' => $report?->id,
                    'issue_title' => $report?->issue_title,
                    'issue_description' => $report?->issue_description,
                    'priority_level' => $report?->priority_level,
                    'status' => $report?->status,
                    'created_at' => $maintenance->created_at,
                    'repair_date' => $maintenance->repair_date,
                    'repair_time' => $maintenance->repair_time,
                    'repair_location' => $maintenance->repair_location,
                    'truck' => [
                        'plate_number' => $report?->truck?->plate_number,
                        'vehicle_type' => $report?->truck?->vehicle_type,
                        'unique_id' => $report?->truck?->unique_id,
                    ],
                    'driver' => [
                        'user' => [
                            'firstname' => $report?->driver?->user?->firstname,
                            'lastname' => $report?->driver?->user?->lastname,
                        ],
                    ],
                ];
            });

            return response()->json([
                'success' => true,
                'assignments' => $formattedAssignments,
            ]);

        } catch (\Exception $e) {
            \Log::error('Get mechanic assignments error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error fetching assignments'
            ], 500);
        }
    }

    /**
     * Update maintenance status (mechanic only)
     */
    public function updateMaintenanceStatus(Request $request, $maintenanceId)
    {
        try {
            $user = Auth::user();

            if (!$user || $user->role !== 'mechanic') {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized'
                ], 403);
            }

            $validated = $request->validate([
                'status' => 'required|in:in_progress,completed',
                'notes' => 'nullable|string',
            ]);

            $maintenance = \App\Models\Maintenance::where('maintenance_id', $maintenanceId)
                ->where('assign_mechanics', $user->user_id)
                ->first();

            if (!$maintenance) {
                return response()->json([
                    'success' => false,
                    'message' => 'Maintenance not found or not assigned to you'
                ], 404);
            }

            $report = $maintenance->maintenanceReport;
            if (!$report) {
                return response()->json([
                    'success' => false,
                    'message' => 'Maintenance report not found'
                ], 404);
            }

            // Update maintenance report status
            $report->status = $validated['status'];
            if ($validated['status'] === 'in_progress') {
                $report->started_at = now();
            } elseif ($validated['status'] === 'completed') {
                $report->completed_at = now();
            }
            $report->save();

            \Log::info('Maintenance status updated', [
                'maintenance_id' => $maintenanceId,
                'report_id' => $report->id,
                'status' => $validated['status'],
                'mechanic_id' => $user->user_id,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Maintenance status updated successfully',
                'status' => $validated['status'],
            ]);

        } catch (\Exception $e) {
            \Log::error('Update maintenance status error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error updating maintenance status'
            ], 500);
        }
    }

    /**
     * Get mechanic's inspection reports
     */
    public function getInspectionReports(Request $request)
    {
        try {
            $user = Auth::user();

            if (!$user || $user->role !== 'mechanic') {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized'
                ], 403);
            }

            $reports = MaintenanceReport::where('mechanic_id', $user->user_id)
                ->with(['truck'])
                ->orderBy('created_at', 'desc')
                ->get();

            $formattedReports = $reports->map(function($report) {
                return [
                    'id' => $report->id,
                    'inspection_date' => $report->inspection_date,
                    'overall_condition' => $report->overall_condition,
                    'mileage' => $report->mileage,
                    'issue_title' => $report->issue_title,
                    'issue_description' => $report->issue_description,
                    'status' => $report->status,
                    'created_at' => $report->created_at,
                    'truck' => [
                        'truck_id' => $report->truck?->truck_id,
                        'plate_number' => $report->truck?->plate_number,
                        'unique_id' => $report->truck?->unique_id,
                        'vehicle_type' => $report->truck?->vehicle_type,
                    ],
                ];
            });

            return response()->json([
                'success' => true,
                'reports' => $formattedReports,
            ]);

        } catch (\Exception $e) {
            \Log::error('Get inspection reports error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error fetching inspection reports'
            ], 500);
        }
    }

    /**
     * Create new inspection report
     */
    public function createInspectionReport(Request $request)
    {
        try {
            $user = Auth::user();

            if (!$user || $user->role !== 'mechanic') {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized'
                ], 403);
            }

            $validated = $request->validate([
                'truck_id' => 'required|integer|exists:trucks,truck_id',
                'inspection_date' => 'required|date',
                'overall_condition' => 'required|in:good,fair,poor,critical',
                'mileage' => 'nullable|numeric',
                'issue_title' => 'required|string',
                'issue_description' => 'required|string',
            ]);

            // Create a maintenance report entry for the inspection
            $report = MaintenanceReport::create([
                'mechanic_id' => $user->user_id,
                'truck_id' => $validated['truck_id'],
                'inspection_date' => $validated['inspection_date'],
                'overall_condition' => $validated['overall_condition'],
                'mileage' => $validated['mileage'],
                'issue_title' => $validated['issue_title'],
                'issue_description' => $validated['issue_description'],
                'status' => 'pending',
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Inspection report created successfully',
                'report' => $report,
            ], 201);

        } catch (\Exception $e) {
            \Log::error('Create inspection report error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error creating inspection report'
            ], 500);
        }
    }

    /**
     * Get mechanic dashboard stats
     */
    public function getDashboardStats(Request $request)
    {
        try {
            $user = Auth::user();

            if (!$user || $user->role !== 'mechanic') {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized'
                ], 403);
            }

            $totalInspections = MaintenanceReport::where('mechanic_id', $user->user_id)->count();
            $goodCondition = MaintenanceReport::where('mechanic_id', $user->user_id)
                ->where('overall_condition', 'good')->count();
            $poorCondition = MaintenanceReport::where('mechanic_id', $user->user_id)
                ->whereIn('overall_condition', ['poor', 'critical'])->count();
            $criticalCondition = MaintenanceReport::where('mechanic_id', $user->user_id)
                ->where('overall_condition', 'critical')->count();
            $pendingReviews = MaintenanceReport::where('mechanic_id', $user->user_id)
                ->where('status', 'pending')->count();
            $assignedTasks = \App\Models\Maintenance::where('assign_mechanics', $user->user_id)->count();

            return response()->json([
                'success' => true,
                'stats' => [
                    'total_inspections' => $totalInspections,
                    'good_condition' => $goodCondition,
                    'poor_condition' => $poorCondition,
                    'critical_condition' => $criticalCondition,
                    'pending_reviews' => $pendingReviews,
                    'assigned_tasks' => $assignedTasks,
                ],
            ]);

        } catch (\Exception $e) {
            \Log::error('Get dashboard stats error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error fetching dashboard stats'
            ], 500);
        }
    }

    /**
     * Get available trucks for inspection
     */
    public function getAvailableTrucks(Request $request)
    {
        try {
            $trucks = Truck::select('truck_id', 'plate_number', 'unique_id', 'vehicle_type', 'condition')
                ->orderBy('plate_number')
                ->get();

            return response()->json([
                'success' => true,
                'trucks' => $trucks,
            ]);

        } catch (\Exception $e) {
            \Log::error('Get available trucks error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error fetching trucks'
            ], 500);
        }
    }

    /**
     * Get all mechanics for office staff
     */
    public function getMechanics(Request $request)
    {
        try {
            $mechanics = User::where('role', 'mechanic')
                ->where('is_active', true)
                ->select('user_id', 'firstname', 'lastname', 'contact_number')
                ->orderBy('firstname')
                ->get();

            return response()->json([
                'success' => true,
                'mechanics' => $mechanics,
            ]);

        } catch (\Exception $e) {
            \Log::error('Get mechanics error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error fetching mechanics'
            ], 500);
        }
    }

    /**
     * Get all mechanic inspection reports (for office staff)
     */
    public function getAllInspectionReports(Request $request)
    {
        try {
            $reports = MaintenanceReport::whereNotNull('mechanic_id')
                ->with(['mechanic', 'truck'])
                ->orderBy('created_at', 'desc')
                ->get();

            $formattedReports = $reports->map(function($report) {
                return [
                    'id' => $report->id,
                    'inspection_date' => $report->inspection_date,
                    'overall_condition' => $report->overall_condition,
                    'mileage' => $report->mileage,
                    'issue_title' => $report->issue_title,
                    'issue_description' => $report->issue_description,
                    'status' => $report->status,
                    'created_at' => $report->created_at,
                    'mechanic' => [
                        'user_id' => $report->mechanic?->user_id,
                        'name' => $report->mechanic?->name,
                    ],
                    'truck' => [
                        'truck_id' => $report->truck?->truck_id,
                        'plate_number' => $report->truck?->plate_number,
                        'unique_id' => $report->truck?->unique_id,
                        'vehicle_type' => $report->truck?->vehicle_type,
                    ],
                ];
            });

            return response()->json([
                'success' => true,
                'reports' => $formattedReports,
            ]);

        } catch (\Exception $e) {
            \Log::error('Get all inspection reports error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error fetching inspection reports'
            ], 500);
        }
    }

    /**
     * Update inspection report status (for office staff)
     */
    public function updateInspectionReportStatus(Request $request, $id)
    {
        try {
            $validated = $request->validate([
                'status' => 'required|in:pending,reviewed,scheduled,completed',
            ]);

            $report = MaintenanceReport::findOrFail($id);
            $report->update([
                'status' => $validated['status'],
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Inspection report status updated successfully',
                'report' => $report,
            ]);

        } catch (\Exception $e) {
            \Log::error('Update inspection report status error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error updating inspection report status'
            ], 500);
        }
    }

    /**
     * Create maintenance schedule from inspection report (for office staff)
     */
    public function createMaintenanceFromInspection(Request $request, $inspectionId)
    {
        try {
            $inspection = MaintenanceReport::findOrFail($inspectionId);

            $validated = $request->validate([
                'mechanic_id' => 'required|integer|exists:users,user_id',
                'repair_date' => 'required|date',
                'repair_time' => 'required',
                'repair_location' => 'required|string',
                'parts' => 'nullable|array',
            ]);

            // Create maintenance record
            $maintenance = \App\Models\Maintenance::create([
                'maintenance_report_id' => $inspection->id,
                'assign_mechanics' => $validated['mechanic_id'],
                'repair_date' => $validated['repair_date'],
                'repair_time' => $validated['repair_time'],
                'repair_location' => $validated['repair_location'],
            ]);

            // Update inspection report status
            $inspection->update([
                'status' => 'scheduled',
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Maintenance schedule created successfully',
                'maintenance' => $maintenance,
            ]);

        } catch (\Illuminate\Validation\ValidationException $e) {
            throw $e; // Let Laravel handle validation redirects
        } catch (\Exception $e) {
            \Log::error('Create maintenance from inspection error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error creating maintenance schedule: ' . $e->getMessage(),
            ], 500);
        }
    }
}
