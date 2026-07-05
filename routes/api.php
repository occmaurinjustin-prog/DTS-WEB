<?php

use App\Http\Controllers\Api\DriverController;
use App\Http\Controllers\Api\LoginController;
use App\Http\Controllers\Api\DeliveryController;
use App\Http\Controllers\FaceRegistrationController;
use App\Http\Controllers\Api\AttendanceController;
use App\Http\Controllers\MechanicController;
use Illuminate\Support\Facades\Route;

Route::middleware(['cors'])->group(function () {
    Route::post('/login', [LoginController::class, 'login']);
    Route::post('/logout', [LoginController::class, 'logout']);
    Route::get('/me', [LoginController::class, 'me'])->middleware('auth.api');
    Route::post('/force-change-password', [App\Http\Controllers\PasswordChangeController::class, 'update'])->middleware('auth.api');

    // Mechanic login - no password required, only user_id
    Route::post('/mechanics/login', [MechanicController::class, 'login']);
    Route::get('/mechanics/{userId}', [MechanicController::class, 'show']);
    Route::get('/mechanic/assignments', [MechanicController::class, 'getAssignments'])->middleware('auth.api');
    Route::put('/mechanic/assignments/{maintenanceId}/status', [MechanicController::class, 'updateMaintenanceStatus'])->middleware('auth.api');
    
    // Mechanic inspection reports
    Route::get('/mechanic/inspection-reports', [MechanicController::class, 'getInspectionReports'])->middleware('auth.api');
    Route::post('/mechanic/inspection-reports', [MechanicController::class, 'createInspectionReport'])->middleware('auth.api');
    Route::get('/mechanic/dashboard-stats', [MechanicController::class, 'getDashboardStats'])->middleware('auth.api');
    Route::get('/mechanic/trucks', [MechanicController::class, 'getAvailableTrucks'])->middleware('auth.api');
    Route::get('/mechanics', [MechanicController::class, 'getMechanics']);

    // Mechanic attendance
    // Route::post('/mechanics/attendance', [MechanicAttendanceController::class, 'store']);
    // Route::get('/mechanics/{userId}/attendance', [MechanicAttendanceController::class, 'show']);

    // Mechanic Face Registration and Attendance
    // Mechanic Face Registration and Attendance
    Route::post('/mechanic/face/register', [\App\Http\Controllers\Api\RegisterFaceController::class, 'register']);
    
    // New Comprehensive Attendance endpoints
    Route::post('/attendance/scan', [\App\Http\Controllers\Api\AttendanceController::class, 'scan']);
    Route::get('/attendance/today', [\App\Http\Controllers\Api\AttendanceController::class, 'today']);
    Route::get('/attendance/history', [\App\Http\Controllers\Api\AttendanceController::class, 'history']);

    // API routes (require authentication)
    Route::middleware(['auth.api'])->group(function () {
        // User Profile Image
        Route::post('/user/profile-image', [\App\Http\Controllers\Api\UserProfileController::class, 'uploadImage']);
        Route::delete('/user/profile-image', [\App\Http\Controllers\Api\UserProfileController::class, 'deleteImage']);

        // Face Recognition
        Route::post('/face/register', [FaceRegistrationController::class, 'register']);
        Route::post('/face/verify', [AttendanceController::class, 'verify']);
        Route::get('/face/history', [AttendanceController::class, 'history']);

        // Driver profile and status
        Route::get('/driver/profile', [DriverController::class, 'profile']);
        Route::get('/driver/status', [DriverController::class, 'status']);
        Route::put('/driver/status', [DriverController::class, 'updateStatus']);

        // Driver location tracking
        Route::post('/driver/location', [DriverController::class, 'updateLocation']);
        Route::post('/driver/location/batch', [DriverController::class, 'updateLocationBatch']); // Offline queue flush
        Route::get('/drivers/{driverId}/path', [DriverController::class, 'getLocationHistory']); // Historical path for admin map

        // Driver stops tracking
        Route::post('/driver/stops/start', [\App\Http\Controllers\Api\DriverStopController::class, 'start']);
        Route::post('/driver/stops/end', [\App\Http\Controllers\Api\DriverStopController::class, 'end']);

        // Maintenance report submission
        Route::post('/driver/maintenance-report', [DriverController::class, 'submitMaintenanceReport']);
        
        // Driver maintenance reports history
        Route::get('/driver/maintenance-reports', [DriverController::class, 'getMaintenanceReports']);

        // Rescue Operations
        Route::post('/rescue/submit', [\App\Http\Controllers\Api\RescueApiController::class, 'submit']);
        Route::get('/rescue/driver/active', [\App\Http\Controllers\Api\RescueApiController::class, 'driverActiveRescue']);
        Route::get('/rescue/driver/history', [\App\Http\Controllers\Api\RescueApiController::class, 'driverHistory']);
        Route::get('/rescue/mechanic/assignments', [\App\Http\Controllers\Api\RescueApiController::class, 'mechanicAssignments']);
        Route::post('/rescue/{id}/status', [\App\Http\Controllers\Api\RescueApiController::class, 'updateStatus']);
        Route::post('/rescue/{id}/mechanic-location', [\App\Http\Controllers\Api\RescueApiController::class, 'updateMechanicLocation']);
        // All drivers list (admin/operation manager only)
        Route::get('/drivers', [DriverController::class, 'index']);

        // Delivery routes
        Route::get('/deliveries', [DeliveryController::class, 'index']);
        Route::post('/deliveries', [DeliveryController::class, 'store']);
        Route::get('/deliveries/{id}', [DeliveryController::class, 'show']);
        Route::put('/deliveries/{id}/status', [DeliveryController::class, 'updateStatus']);

        // Routes endpoint
        Route::get('/routes', [DeliveryController::class, 'getRoutes']);
    });


});
