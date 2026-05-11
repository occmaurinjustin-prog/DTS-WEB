<?php

use App\Http\Controllers\Api\DriverController;
use App\Http\Controllers\Api\LoginController;
use App\Http\Controllers\Api\DeliveryController;
use App\Http\Controllers\MechanicController;
use App\Http\Controllers\MechanicAttendanceController;
use App\Http\Controllers\FaceVerificationController;
use Illuminate\Support\Facades\Route;

Route::middleware(['cors'])->group(function () {
    Route::post('/login', [LoginController::class, 'login']);
    Route::post('/logout', [LoginController::class, 'logout']);
    Route::get('/me', [LoginController::class, 'me'])->middleware('auth.api');

    // Mechanic login - no password required, only unique_id
    Route::post('/mechanics/login', [MechanicController::class, 'login']);
    Route::get('/mechanics/{uniqueId}', [MechanicController::class, 'show']);

    // Mechanic attendance (face verification)
    Route::post('/mechanics/attendance', [MechanicAttendanceController::class, 'store']);
    Route::get('/mechanics/{uniqueId}/attendance', [MechanicAttendanceController::class, 'show']);

    // STRICT Face Verification (1:1 matching)
    Route::post('/mechanics/verify-face', [FaceVerificationController::class, 'verifyFace']);
    Route::get('/mechanics/{uniqueId}/face-stats', [FaceVerificationController::class, 'getVerificationStats']);

    // Driver API routes (require authentication)
    Route::middleware(['auth.api'])->group(function () {
        // Driver profile and status
        Route::get('/driver/profile', [DriverController::class, 'profile']);
        Route::get('/driver/status', [DriverController::class, 'status']);
        Route::put('/driver/status', [DriverController::class, 'updateStatus']);

        // Driver location tracking
        Route::post('/driver/location', [DriverController::class, 'updateLocation']);

        // Maintenance report submission
        Route::post('/driver/maintenance-report', [DriverController::class, 'submitMaintenanceReport']);
        
        // Driver maintenance reports history
        Route::get('/driver/maintenance-reports', [DriverController::class, 'getMaintenanceReports']);

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
