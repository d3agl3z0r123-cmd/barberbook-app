<?php

use App\Http\Controllers\Api\Auth\AuthController;
use App\Http\Controllers\Api\Auth\AccountController;
use App\Http\Controllers\Api\Auth\PasswordResetController;
use Illuminate\Support\Facades\Route;

Route::post('/register', [AuthController::class, 'register'])->name('register');
Route::post('/login', [AuthController::class, 'login'])->name('login');
Route::post('/forgot-password', [PasswordResetController::class, 'sendResetLink'])->name('password.email');
Route::post('/reset-password', [PasswordResetController::class, 'reset'])->name('password.update');

Route::middleware(['auth:sanctum', 'active.account'])->group(function (): void {
    Route::post('/logout', [AuthController::class, 'logout'])->name('logout');
    Route::get('/user', [AuthController::class, 'me'])->name('user');
    Route::put('/account/profile', [AccountController::class, 'updateProfile'])->name('account.profile');
    Route::put('/account/password', [AccountController::class, 'updatePassword'])->name('account.password');
});
