<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use App\Http\Controllers\AdminLoginController;
use App\Http\Controllers\AdminDashboardController;
use App\Http\Controllers\UserManagementController;
use App\Http\Controllers\OfficeStaffLoginController;
use App\Http\Controllers\OfficeStaffDashboardController;
use App\Http\Controllers\OperationalManagerDashboardController;
use App\Http\Controllers\ClientController;
use App\Http\Controllers\TruckController;
use App\Http\Controllers\AttendanceController;
use App\Http\Controllers\MaintenanceController;

Route::get('/', function () {
    if (Auth::check()) {
        $user = Auth::user();
        if ($user->role === 'admin') {
            return redirect()->route('admin.dashboard');
        } elseif ($user->role === 'office_staff') {
            return redirect()->route('office_staff.dashboard');
        } elseif ($user->role === 'operation_manager') {
            return redirect()->route('operational_manager.dashboard');
        }
    }
    return redirect()->route('admin.login');
});

// Admin login routes (no prefix)
Route::get('/login', [AdminLoginController::class, 'showLoginForm'])->name('admin.login');
Route::post('/login', [AdminLoginController::class, 'login']);
Route::post('/logout', [AdminLoginController::class, 'logout'])->name('admin.logout');

// Admin routes
Route::prefix('admin')->name('admin.')->group(function () {
    Route::middleware('admin')->group(function () {
        Route::get('/dashboard', [AdminDashboardController::class, 'index'])->name('dashboard');
        Route::get('/users', [AdminDashboardController::class, 'users'])->name('users');
        Route::get('/attendance', [AdminDashboardController::class, 'attendance'])->name('attendance');
        Route::get('/drivers', [AdminDashboardController::class, 'drivers'])->name('drivers');
        Route::get('/deliveries', [AdminDashboardController::class, 'deliveries'])->name('deliveries');
        Route::patch('/deliveries/{delivery}/approve', [AdminDashboardController::class, 'approveDelivery'])->name('deliveries.approve');
        Route::patch('/deliveries/{delivery}/reject', [AdminDashboardController::class, 'rejectDelivery'])->name('deliveries.reject');
        Route::post('/deliveries/{delivery}/send-to-driver', [AdminDashboardController::class, 'sendToDriver'])->name('deliveries.send-to-driver');
        
        // Routes tracking page
        Route::get('/routes', [AdminDashboardController::class, 'routes'])->name('routes');
        
        // Reports page
        Route::get('/reports', [AdminDashboardController::class, 'reports'])->name('reports');
        
        // User management routes
        Route::post('/users', [UserManagementController::class, 'store'])->name('users.store');
        Route::put('/users/{user}', [UserManagementController::class, 'update'])->name('users.update');
        Route::delete('/users/{user}', [UserManagementController::class, 'destroy'])->name('users.destroy');
        Route::patch('/users/{user}/toggle-status', [UserManagementController::class, 'toggleStatus'])->name('users.toggle-status');
        
        // Truck management routes
        Route::get('/trucks', [TruckController::class, 'index'])->name('trucks');
        Route::post('/trucks', [TruckController::class, 'store'])->name('trucks.store');
        Route::put('/trucks/{truck}', [TruckController::class, 'update'])->name('trucks.update');
        Route::delete('/trucks/{truck}', [TruckController::class, 'destroy'])->name('trucks.destroy');
        Route::patch('/trucks/{truck}/toggle-status', [TruckController::class, 'toggleStatus'])->name('trucks.toggle-status');
        Route::post('/trucks/{truck}/assign-driver', [TruckController::class, 'assignDriver'])->name('trucks.assign-driver');
    });
});


// Office Staff login routes
Route::get('/office-staff/login', [OfficeStaffLoginController::class, 'showLoginForm'])->name('office_staff.login');
Route::post('/office-staff/login', [OfficeStaffLoginController::class, 'login']);
Route::post('/office-staff/logout', [OfficeStaffLoginController::class, 'logout'])->name('office_staff.logout');

// Office Staff routes (no separate login)
Route::prefix('office-staff')->name('office_staff.')->group(function () {
    Route::middleware('office_staff')->group(function () {
        Route::get('/dashboard', [OfficeStaffDashboardController::class, 'index'])->name('dashboard');
        Route::get('/profile', [OfficeStaffDashboardController::class, 'profile'])->name('profile');
        Route::get('/attendance', [AttendanceController::class, 'index'])->name('attendance');
        Route::post('/attendance/time-in', [AttendanceController::class, 'timeIn'])->name('attendance.time-in');
        Route::post('/attendance/time-out', [AttendanceController::class, 'timeOut'])->name('attendance.time-out');
        Route::post('/attendance/add-leave', [AttendanceController::class, 'addLeave'])->name('attendance.add-leave');
        Route::get('/mechanics', [AttendanceController::class, 'mechanics'])->name('mechanics');
        Route::post('/mechanics', [AttendanceController::class, 'storeMechanic'])->name('mechanics.store');
        Route::get('/mechanic-attendance', function () {
            return inertia('OfficeStaff/MechanicAttendance');
        })->name('mechanic-attendance');
        
        Route::get('/inventory', function () {
            return inertia('OfficeStaff/Inventory');
        })->name('inventory');
        
        // Fleet Management
        Route::get('/maintenance', [MaintenanceController::class, 'index'])->name('maintenance');
        Route::get('/maintenance/driver-reports', [MaintenanceController::class, 'getDriverReports'])->name('maintenance.driver-reports');
        Route::patch('/maintenance/driver-reports/{id}/status', [MaintenanceController::class, 'updateDriverReportStatus'])->name('maintenance.driver-reports.status');
        Route::get('/maintenance/inventory', [MaintenanceController::class, 'getInventory'])->name('maintenance.inventory');
        Route::post('/maintenance/process-workflow', [MaintenanceController::class, 'processWorkflow'])->name('maintenance.process-workflow');
        Route::post('/maintenance/parts', [MaintenanceController::class, 'storePart'])->name('maintenance.parts.store');
        Route::put('/maintenance/parts/{id}', [MaintenanceController::class, 'updatePart'])->name('maintenance.parts.update');
        Route::delete('/maintenance/parts/{id}', [MaintenanceController::class, 'deletePart'])->name('maintenance.parts.delete');
    });
});

// Operational Manager routes
Route::prefix('operational-manager')->name('operational_manager.')->group(function () {
    Route::middleware('operational_manager')->group(function () {
        Route::get('/dashboard', [OperationalManagerDashboardController::class, 'index'])->name('dashboard');
        Route::get('/drivers', [OperationalManagerDashboardController::class, 'drivers'])->name('drivers');
        Route::get('/clients', [OperationalManagerDashboardController::class, 'clients'])->name('clients');
        Route::get('/deliveries', [OperationalManagerDashboardController::class, 'deliveries'])->name('deliveries');
        Route::get('/deliveries/create', function () {
            // Get clients for dropdown
            $clients = \App\Models\Client::orderBy('client_name')->get();
            
            // Get available drivers for dropdown (only 'available' status)
            $drivers = \App\Models\Driver::with('user', 'truck')
                ->where('availability_status', 'available')
                ->get();
            
            // Get available trucks for dropdown
            $trucks = \App\Models\Truck::orderBy('plate_number')->get();
            
            return inertia('OperationalManager/CreateDelivery', [
                'clients' => $clients,
                'drivers' => $drivers,
                'trucks' => $trucks,
            ]);
        })->name('deliveries.create');
        Route::post('/deliveries', [OperationalManagerDashboardController::class, 'storeDelivery'])->name('deliveries.store');
        Route::get('/recent-deliveries', [OperationalManagerDashboardController::class, 'recentDeliveries'])->name('recent_deliveries');
        Route::get('/profile', [OperationalManagerDashboardController::class, 'profile'])->name('profile');
        
        // Client management routes
        Route::post('/clients', [ClientController::class, 'store'])->name('clients.store');
        Route::put('/clients/{client}', [ClientController::class, 'update'])->name('clients.update');
        Route::delete('/clients/{client}', [ClientController::class, 'destroy'])->name('clients.destroy');
    });
});
