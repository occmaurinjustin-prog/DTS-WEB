<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\MechanicController;

Route::post('/mechanics/login', [MechanicController::class, 'login']);
Route::get('/mechanics/{uniqueId}', [MechanicController::class, 'show']);
