<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\DeviceController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\SignupController;
use App\Http\Controllers\PasswordResetController;

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