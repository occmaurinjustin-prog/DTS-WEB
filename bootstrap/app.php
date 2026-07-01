<?php

use Illuminate\Foundation\Application;
use App\Http\Middleware\HandleInertiaRequests;
use App\Http\Middleware\AdminMiddleware;
use App\Http\Middleware\OfficeStaff;
use App\Http\Middleware\OperationalManager;
use App\Http\Middleware\Authenticate;
use App\Http\Middleware\RedirectIfAuthenticated;
use App\Http\Middleware\ApiAuth;
use App\Http\Middleware\Cors;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
         $middleware->web(append: [
        HandleInertiaRequests::class,
        \App\Http\Middleware\EnsurePasswordIsChanged::class,
    ]);
    
    $middleware->alias([
        'admin' => AdminMiddleware::class,
        'office_staff' => OfficeStaff::class,
        'operational_manager' => OperationalManager::class,
        'auth' => Authenticate::class,
        'guest' => RedirectIfAuthenticated::class,
        'auth.api' => ApiAuth::class,
        'cors' => Cors::class,
    ]);
    
    // Redirect to admin login for authentication
    $middleware->redirectGuestsTo('/login');
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })->create();
