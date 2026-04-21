<?php

use App\Http\Controllers\Api\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Api\Admin\SuperAdminController;
use App\Http\Controllers\Api\Client\AvailabilityController;
use App\Http\Controllers\Api\Client\BookingController;
use App\Http\Controllers\Api\Client\DiscoveryController;
use App\Http\Controllers\Api\Client\PublicAppointmentController;
use App\Http\Controllers\Api\Auth\SocialAuthController;
use App\Http\Controllers\Api\Owner\AppointmentController as OwnerAppointmentController;
use App\Http\Controllers\Api\Owner\BarberController;
use App\Http\Controllers\Api\Owner\BarbershopQrCodeController;
use App\Http\Controllers\Api\Owner\BarbershopController;
use App\Http\Controllers\Api\Owner\DashboardController as OwnerDashboardController;
use App\Http\Controllers\Api\Owner\ManagementAppointmentController;
use App\Http\Controllers\Api\Owner\ManagementBarberController;
use App\Http\Controllers\Api\Owner\ManagementServiceController;
use App\Http\Controllers\Api\Owner\ServiceController;
use App\Http\Controllers\Api\Owner\UserBarbershopController;
use Illuminate\Support\Facades\Route;

require __DIR__.'/auth.php';

Route::get('auth/google/redirect', [SocialAuthController::class, 'redirectToGoogle'])->name('google.redirect');
Route::get('auth/google/callback', [SocialAuthController::class, 'handleGoogleCallback'])->name('google.callback');
Route::get('auth/social/providers', [SocialAuthController::class, 'providers'])->name('social.providers');

Route::prefix('public')->group(function (): void {
    Route::get('barbershops', [DiscoveryController::class, 'index']);
    Route::get('barbershops/{slug}', [DiscoveryController::class, 'show']);
    Route::get('barbershop/{slug}', [DiscoveryController::class, 'show']);
    Route::get('appointments', [PublicAppointmentController::class, 'index']);
    Route::post('appointments', [PublicAppointmentController::class, 'store']);
    Route::get('barbershops/{slug}/availability', AvailabilityController::class);
});

Route::middleware(['auth:sanctum', 'active.account'])->group(function (): void {
    Route::get('barbershop', [UserBarbershopController::class, 'show']);
    Route::post('barbershop', [UserBarbershopController::class, 'store']);
    Route::put('barbershop', [UserBarbershopController::class, 'update']);

    Route::middleware('active.barbershop')->group(function (): void {
        Route::get('barbershop/qr-code', [BarbershopQrCodeController::class, 'show']);
        Route::post('barbershop/qr-code/regenerate', [BarbershopQrCodeController::class, 'regenerate']);
        Route::get('barbershop/qr-code/download', [BarbershopQrCodeController::class, 'download']);
        Route::get('barbershop/qr-code/pdf', [BarbershopQrCodeController::class, 'pdf']);

        Route::get('barbers', [ManagementBarberController::class, 'index']);
        Route::post('barbers', [ManagementBarberController::class, 'store']);
        Route::put('barbers/{id}', [ManagementBarberController::class, 'update']);
        Route::delete('barbers/{id}', [ManagementBarberController::class, 'destroy']);

        Route::get('services', [ManagementServiceController::class, 'index']);
        Route::post('services', [ManagementServiceController::class, 'store']);
        Route::put('services/{id}', [ManagementServiceController::class, 'update']);
        Route::delete('services/{id}', [ManagementServiceController::class, 'destroy']);

        Route::get('appointments', [ManagementAppointmentController::class, 'index']);
        Route::get('appointments/day', [ManagementAppointmentController::class, 'day']);
        Route::post('appointments', [ManagementAppointmentController::class, 'store']);
        Route::put('appointments/{id}', [ManagementAppointmentController::class, 'update']);
        Route::delete('appointments/{id}', [ManagementAppointmentController::class, 'destroy']);
    });

    Route::prefix('admin')->group(function (): void {
        Route::get('dashboard', AdminDashboardController::class);
        Route::get('platform', [SuperAdminController::class, 'index']);
        Route::patch('users/{user}/status', [SuperAdminController::class, 'updateUserStatus']);
        Route::patch('barbershops/{barbershop}/status', [SuperAdminController::class, 'updateBarbershopStatus']);
    });

    Route::prefix('owner/barbershops/{barbershop}')->group(function (): void {
        Route::get('dashboard', OwnerDashboardController::class);
        Route::get('/', [BarbershopController::class, 'show']);
        Route::put('/', [BarbershopController::class, 'update']);

        Route::get('barbers', [BarberController::class, 'index']);
        Route::post('barbers', [BarberController::class, 'store']);
        Route::put('barbers/{barber}', [BarberController::class, 'update']);
        Route::delete('barbers/{barber}', [BarberController::class, 'destroy']);

        Route::get('services', [ServiceController::class, 'index']);
        Route::post('services', [ServiceController::class, 'store']);
        Route::put('services/{service}', [ServiceController::class, 'update']);
        Route::delete('services/{service}', [ServiceController::class, 'destroy']);

        Route::get('appointments', [OwnerAppointmentController::class, 'index']);
        Route::post('appointments', [OwnerAppointmentController::class, 'store']);
        Route::patch('appointments/{appointment}/cancel', [OwnerAppointmentController::class, 'cancel']);
    });

    Route::prefix('client')->group(function (): void {
        Route::get('appointments', [BookingController::class, 'index']);
        Route::post('appointments', [BookingController::class, 'store']);
        Route::patch('appointments/{appointment}/cancel', [BookingController::class, 'cancel']);
    });
});
