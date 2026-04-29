<?php 

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\DeviceController;

Route::post('/device/token', [DeviceController::class, 'getToken']);

Route::get('/messages', [DeviceController::class, 'getMessages']);

Route::post('/send-message', [DeviceController::class, 'sendMessage']);