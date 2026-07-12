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
use App\Http\Controllers\PurchaserDashboardController;
use App\Http\Controllers\BillingDashboardController;
use App\Http\Controllers\ClientController;
use App\Http\Controllers\TruckController;
use App\Http\Controllers\AttendanceController;
use App\Http\Controllers\FaceRegistrationController;
use App\Http\Controllers\PayrollController;
use App\Http\Controllers\MaintenanceController;
use App\Http\Controllers\MechanicController;
use App\Http\Controllers\PasswordChangeController;
// use App\Http\Controllers\AttendanceDashboardController;

Route::get('/', function () {
    if (Auth::check()) {
        $user = Auth::user();
        if ($user->role === 'admin') {
            return redirect()->route('admin.dashboard');
        } elseif ($user->role === 'office_staff') {
            return redirect()->route('office_staff.dashboard');
        } elseif ($user->role === 'operation_manager') {
            return redirect()->route('operational_manager.dashboard');
        } elseif ($user->role === 'purchaser') {
            return redirect()->route('purchaser.dashboard');
        } elseif ($user->role === 'billing') {
            return redirect()->route('billing.dashboard');
        }
    }

    $stats = [
        'vehicles' => \App\Models\Truck::count(),
        'users' => \App\Models\User::count(),
        'deliveries' => \App\Models\Delivery::where('delivery_status', 'delivered')->count(),
        'experience' => max(10, date('Y') - 2016),
    ];

    return inertia('Landing', [
        'stats' => $stats
    ]);
});

// Public Tracking Route
Route::get('/track', [\App\Http\Controllers\TrackingController::class, 'index'])->name('track.index');
Route::get('/track/{waybill}', [\App\Http\Controllers\TrackingController::class, 'show'])->name('track.show');

// Admin login routes (no prefix)
Route::get('/login', [AdminLoginController::class, 'showLoginForm'])->name('admin.login');
Route::post('/login', [AdminLoginController::class, 'login']);
Route::post('/logout', [AdminLoginController::class, 'logout'])->name('admin.logout');

// Admin API routes (stateful, used by Inertia frontend)
Route::prefix('api/admin')->middleware('admin')->group(function () {
    Route::get('/deliveries', [\App\Http\Controllers\AdminDashboardController::class, 'apiDeliveries']);
    Route::get('/drivers', [\App\Http\Controllers\AdminDashboardController::class, 'apiDrivers']);
    Route::get('/users', [\App\Http\Controllers\AdminDashboardController::class, 'apiUsers']);
    Route::get('/driver-stops', [\App\Http\Controllers\Api\DriverStopController::class, 'index']);
    Route::get('/driver-path/{driverId}', [\App\Http\Controllers\AdminDashboardController::class, 'apiDriverPath']);
});

// Admin routes
Route::prefix('admin')->name('admin.')->group(function () {
    Route::middleware('admin')->group(function () {
        Route::get('/dashboard', [AdminDashboardController::class, 'index'])->name('dashboard');
        Route::get('/users', [AdminDashboardController::class, 'users'])->name('users');
        Route::get('/attendance', [AdminDashboardController::class, 'attendance'])->name('attendance');
        Route::get('/drivers', [AdminDashboardController::class, 'drivers'])->name('drivers');
        Route::get('/driver-stops', [AdminDashboardController::class, 'driverStops'])->name('driverStops');
        Route::get('/deliveries', [AdminDashboardController::class, 'deliveries'])->name('deliveries');
        Route::patch('/deliveries/{delivery}/approve', [AdminDashboardController::class, 'approveDelivery'])->name('deliveries.approve');
        Route::patch('/deliveries/{delivery}/reject', [AdminDashboardController::class, 'rejectDelivery'])->name('deliveries.reject');
        Route::post('/deliveries/{delivery}/send-to-driver', [AdminDashboardController::class, 'sendToDriver'])->name('deliveries.send-to-driver');
        // Routes tracking page
        Route::get('/routes', [AdminDashboardController::class, 'routes'])->name('routes');
        Route::get('/replay-center', [AdminDashboardController::class, 'replayCenter'])->name('replay-center');
        
        // Reports page
        Route::get('/reports', [AdminDashboardController::class, 'reports'])->name('reports');
        
        // User management routes
        Route::post('/users', [UserManagementController::class, 'store'])->name('users.store');
        Route::put('/users/{user}', [UserManagementController::class, 'update'])->name('users.update');
        Route::delete('/users/{user}', [UserManagementController::class, 'destroy'])->name('users.destroy');
        Route::patch('/users/{user}/toggle-status', [UserManagementController::class, 'toggleStatus'])->name('users.toggle-status');
        
        // Face Registration routes
        Route::get('/users/{user}/face', [FaceRegistrationController::class, 'show'])->name('users.face.show');
        Route::delete('/users/{user}/face', [FaceRegistrationController::class, 'destroy'])->name('users.face.destroy');


        // Truck management routes
        Route::get('/trucks', [TruckController::class, 'index'])->name('trucks');
        Route::post('/trucks', [TruckController::class, 'store'])->name('trucks.store');
        Route::put('/trucks/{truck}', [TruckController::class, 'update'])->name('trucks.update');
        Route::delete('/trucks/{truck}', [TruckController::class, 'destroy'])->name('trucks.destroy');
        Route::patch('/trucks/{truck}/toggle-status', [TruckController::class, 'toggleStatus'])->name('trucks.toggle-status');
        Route::post('/trucks/{truck}/assign-driver', [TruckController::class, 'assignDriver'])->name('trucks.assign-driver');
        
        // Delivery statistics API
        Route::get('/delivery-stats', [AdminDashboardController::class, 'getDeliveryStats'])->name('delivery-stats');
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
        // Route::get('/profile', [OfficeStaffDashboardController::class, 'profile'])->name('profile');
        Route::get('/attendance', [AttendanceController::class, 'index'])->name('attendance');
        Route::post('/attendance/time-in', [AttendanceController::class, 'timeIn'])->name('attendance.time-in');
        Route::post('/attendance/time-out', [AttendanceController::class, 'timeOut'])->name('attendance.time-out');
        Route::post('/attendance/add-leave', [AttendanceController::class, 'addLeave'])->name('attendance.add-leave');
        Route::get('/mechanics', [AttendanceController::class, 'mechanics'])->name('mechanics');
        Route::post('/mechanics', [AttendanceController::class, 'storeMechanic'])->name('mechanics.store');
        Route::get('/mechanic-attendance', function () {
            return inertia('OfficeStaff/MechanicAttendance');
        })->name('mechanic-attendance');
        
        // Route::get('/face-attendance', [AttendanceDashboardController::class, 'index'])->name('attendance.dashboard');
        
        Route::get('/inventory', function () {
            return inertia('OfficeStaff/Inventory');
        })->name('inventory');
        
        // Fleet Management
        Route::get('/maintenance', [MaintenanceController::class, 'index'])->name('maintenance');
        Route::get('/maintenance/driver-reports', [MaintenanceController::class, 'getDriverReports'])->name('maintenance.driver-reports');
        Route::patch('/maintenance/driver-reports/{id}/status', [MaintenanceController::class, 'updateDriverReportStatus'])->name('maintenance.driver-reports.status');
        Route::get('/maintenance/inventory', [MaintenanceController::class, 'getInventory'])->name('maintenance.inventory');
        Route::get('/maintenance/inventory/transactions', [MaintenanceController::class, 'getAllTransactions'])->name('maintenance.inventory.transactions.all');
        Route::get('/maintenance/inventory/{id}/transactions', [MaintenanceController::class, 'getTransactions'])->name('maintenance.inventory.transactions');
        Route::post('/maintenance/process-workflow', [MaintenanceController::class, 'processWorkflow'])->name('maintenance.process-workflow');
        Route::post('/maintenance/parts', [MaintenanceController::class, 'storePart'])->name('maintenance.parts.store');
        Route::put('/maintenance/parts/{id}', [MaintenanceController::class, 'updatePart'])->name('maintenance.parts.update');
        Route::delete('/maintenance/parts/{id}', [MaintenanceController::class, 'deletePart'])->name('maintenance.parts.delete');
        
        // Mechanic Inspection Reports
        Route::get('/maintenance/mechanic-inspection-reports', [MechanicController::class, 'getAllInspectionReports'])->name('maintenance.mechanic-inspection-reports');
        Route::put('/maintenance/mechanic-inspection-reports/{id}/status', [MechanicController::class, 'updateInspectionReportStatus'])->name('maintenance.mechanic-inspection-reports.status');
        Route::post('/maintenance/mechanic-inspection-reports/{inspectionId}/schedule-maintenance', [MechanicController::class, 'createMaintenanceFromInspection'])->name('maintenance.mechanic-inspection-reports.schedule-maintenance');
        
        // Payroll Routes
        Route::get('/payroll', [\App\Http\Controllers\PayrollController::class, 'index'])->name('payroll');
        Route::post('/payroll/generate', [\App\Http\Controllers\PayrollController::class, 'generate'])->name('payroll.generate');
        Route::post('/payroll/generate-all', [\App\Http\Controllers\PayrollController::class, 'generateAll'])->name('payroll.generate_all');

        // Rescue Assistance Routes
        Route::get('/rescue-dispatch', [\App\Http\Controllers\RescueDispatchController::class, 'index'])->name('rescue.dispatch');
        Route::get('/rescue-history', [\App\Http\Controllers\RescueDispatchController::class, 'history'])->name('rescue.history');
        Route::post('/rescue-dispatch/{id}/assign', [\App\Http\Controllers\RescueDispatchController::class, 'assign'])->name('rescue.assign');
        Route::post('/rescue-dispatch/{id}/add-parts', [\App\Http\Controllers\RescueDispatchController::class, 'addParts'])->name('rescue.add-parts');

        // Part Requests
        Route::get('/part-requests', [\App\Http\Controllers\PartRequestController::class, 'officeStaffIndex'])->name('part-requests.index');
        Route::put('/part-requests/{id}/status', [\App\Http\Controllers\PartRequestController::class, 'updateOfficeStatus'])->name('part-requests.status');

        // Reports
        Route::get('/reports', [\App\Http\Controllers\OfficeStaffReportsController::class, 'index'])->name('reports');

    });
});

// Operational Manager routes
Route::prefix('operational-manager')->name('operational_manager.')->group(function () {
    Route::middleware('operational_manager')->group(function () {
        Route::get('/dashboard', [OperationalManagerDashboardController::class, 'index'])->name('dashboard');
        Route::get('/drivers', [OperationalManagerDashboardController::class, 'drivers'])->name('drivers');
        Route::get('/clients', [OperationalManagerDashboardController::class, 'clients'])->name('clients');
        Route::get('/deliveries', [OperationalManagerDashboardController::class, 'deliveries'])->name('deliveries');
        Route::get('/api/deliveries', [OperationalManagerDashboardController::class, 'apiDeliveries'])->name('api.deliveries');
        Route::get('/deliveries/create', function () {
            // Get clients for dropdown
            $clients = \App\Models\Client::orderBy('client_name')->get();
            
            // Get all drivers for dropdown so we can show them even if busy
            $drivers = \App\Models\Driver::with('user', 'truck')->get();
            
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
        Route::get('/tracking', [OperationalManagerDashboardController::class, 'tracking'])->name('tracking');
        Route::get('/replay-center', [OperationalManagerDashboardController::class, 'replayCenter'])->name('replay_center');
        Route::get('/api/driver-path/{driverId}', [OperationalManagerDashboardController::class, 'apiDriverPath']);
        // Route::get('/profile', [OperationalManagerDashboardController::class, 'profile'])->name('profile');
        
        // Client management routes
        Route::post('/clients', [ClientController::class, 'store'])->name('clients.store');
        Route::put('/clients/{client}', [ClientController::class, 'update'])->name('clients.update');
        Route::delete('/clients/{client}', [ClientController::class, 'destroy'])->name('clients.destroy');
    });
});

// Purchaser routes
Route::prefix('purchaser')->name('purchaser.')->group(function () {
    Route::middleware('purchaser')->group(function () {
        Route::get('/dashboard', [PurchaserDashboardController::class, 'index'])->name('dashboard');
        Route::get('/orders', [PurchaserDashboardController::class, 'orders'])->name('orders');
        Route::put('/part-requests/{id}/status', [\App\Http\Controllers\PartRequestController::class, 'updatePurchaserStatus'])->name('part-requests.status');
    });
});

// Billing routes
Route::prefix('billing')->name('billing.')->group(function () {
    Route::middleware('billing')->group(function () {
        Route::get('/dashboard', [BillingDashboardController::class, 'index'])->name('dashboard');
        
        // Payroll Routes
        Route::get('/payroll', [\App\Http\Controllers\BillingPayrollController::class, 'index'])->name('payroll');
        Route::patch('/payroll/{id}/pay', [\App\Http\Controllers\BillingPayrollController::class, 'markAsPaid'])->name('payroll.pay');
    });
});

Route::middleware(['auth'])->group(function () {
    Route::get('/force-change-password', [PasswordChangeController::class, 'show'])->name('password.force-change');
    Route::post('/force-change-password', [PasswordChangeController::class, 'update']);
});
// Shared Profile Routes for all web users
Route::middleware(['web'])->group(function () {
    Route::get('/profile', [\App\Http\Controllers\ProfileController::class, 'show'])->name('profile.show');
    Route::post('/profile/information', [\App\Http\Controllers\ProfileController::class, 'updateInformation'])->name('profile.information.update');
    Route::post('/profile/picture', [\App\Http\Controllers\ProfileController::class, 'updatePicture'])->name('profile.picture.update');
    Route::post('/profile/password', [\App\Http\Controllers\ProfileController::class, 'updatePassword'])->name('profile.password.update');
});
