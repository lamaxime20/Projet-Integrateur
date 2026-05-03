<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\DeviceController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\SignupController;
use App\Http\Controllers\PasswordResetController;
use App\Http\Controllers\MicrocontroleurController;
use App\Http\Controllers\SeuilController;

Route::post('/device/token', [DeviceController::class, 'getToken']);

Route::get('/messages', [DeviceController::class, 'getMessages']);

Route::post('/send-message', [DeviceController::class, 'sendMessage']);

// Auth routes
Route::post('/login', [AuthController::class, 'login']);
Route::post('/logout', [AuthController::class, 'logout']);

// Signup routes
Route::post('/signup/check-email', [SignupController::class, 'checkEmail']);
Route::post('/signup/verify-code', [SignupController::class, 'verifyCode']);
Route::post('/signup/create', [SignupController::class, 'createAccount']);

// Password reset routes
Route::post('/password-reset/check-email', [PasswordResetController::class, 'checkEmail']);
Route::post('/password-reset/verify-code', [PasswordResetController::class, 'verifyCode']);
Route::post('/password-reset/change', [PasswordResetController::class, 'changePassword']);

Route::post('/microcontroleurs/create', [MicrocontroleurController::class, 'enregistrerNewMicrocontroleurUsine']);

// Microcontroleur routes (cookie auth required)
Route::middleware('user.token')->group(function () {
    Route::post('/microcontroleurs', [MicrocontroleurController::class, 'enregistrer']);
    Route::get('/microcontroleurs', [MicrocontroleurController::class, 'liste']);
    Route::get('/microcontroleurs/{nom}', [MicrocontroleurController::class, 'charger']);

    // Seuils routes
    Route::get('/seuils/temperature', [SeuilController::class, 'temperature']);
    Route::get('/seuils/pompe', [SeuilController::class, 'pompe']);
    Route::get('/seuils/luminosite', [SeuilController::class, 'luminosite']);
    Route::get('/seuils/co2', [SeuilController::class, 'co2']);
});