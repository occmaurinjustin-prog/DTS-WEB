<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

$user = App\Models\User::where('role', 'driver')->first();
if (!$user) {
    echo "No driver user found.\n";
    exit;
}
\Auth::login($user);

$request = Illuminate\Http\Request::create('/api/rescue/driver/history', 'GET');
$controller = new App\Http\Controllers\Api\RescueApiController();

try {
    $response = $controller->driverHistory($request);
    echo "Status: " . $response->getStatusCode() . "\n";
    echo "Content: " . $response->getContent() . "\n";
} catch (\Exception $e) {
    echo "EXCEPTION: " . $e->getMessage() . "\n";
    echo $e->getTraceAsString();
}
