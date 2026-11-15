<?php

use App\Http\Controllers\Admin\UserController as AdminUserController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CheckinController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\JournalController;
use App\Http\Controllers\PasswordController;
use App\Http\Controllers\PrivacyController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\SettingsController;
use Illuminate\Support\Facades\Route;

Route::get('login', [AuthController::class, 'create'])->name('login');
Route::post('login', [AuthController::class, 'store']);

Route::middleware('auth.session')->group(function () {
    Route::get('/', HomeController::class)->name('home');
    Route::post('logout', [AuthController::class, 'destroy'])->name('logout');

    Route::get('checkins', [CheckinController::class, 'index'])->name('checkins.index');
    Route::post('checkins', [CheckinController::class, 'store'])->name('checkins.store');
    Route::delete('checkins/{checkin}', [CheckinController::class, 'destroy'])->name('checkins.destroy');

    Route::resource('journal', JournalController::class)->parameters(['journal' => 'entry']);

    Route::prefix('settings')->group(function () {
        Route::get('profile', [ProfileController::class, 'edit'])->name('profile.edit');
        Route::patch('profile', [ProfileController::class, 'update'])->name('profile.update');

        Route::get('preferences', [SettingsController::class, 'edit'])->name('preferences.edit');
        Route::patch('preferences', [SettingsController::class, 'update'])->name('preferences.update');

        Route::get('privacy', [PrivacyController::class, 'edit'])->name('privacy.edit');
        Route::patch('privacy', [PrivacyController::class, 'update'])->name('privacy.update');

        Route::get('password', [PasswordController::class, 'edit'])->name('password.edit');
        Route::put('password', [PasswordController::class, 'update'])->name('password.update');
    });

    Route::prefix('admin')->middleware('role:admin')->group(function () {
        Route::get('users', [AdminUserController::class, 'index'])->name('admin.users.index');
        Route::post('users', [AdminUserController::class, 'store'])->name('admin.users.store');
        Route::patch('users/{user}', [AdminUserController::class, 'update'])->name('admin.users.update');
    });
});