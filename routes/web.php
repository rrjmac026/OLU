<?php

use App\Http\Controllers\Admin\UserController as AdminUserController;
use App\Http\Controllers\Admin\ContentController as AdminContentController;
use App\Http\Controllers\ContentController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CheckinController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\JournalController;
use App\Http\Controllers\PasswordController;
use App\Http\Controllers\PrivacyController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\SettingsController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ChatController;
use App\Http\Controllers\CalendarController;
use App\Http\Controllers\TimelineController;
use App\Http\Controllers\LetterController;
use App\Http\Controllers\MemoryController;
use App\Http\Controllers\MemoryPhotoController;


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

    Route::get('/comfort', [ContentController::class, 'comfort']);
    Route::get('/content/random/{kind}', [ContentController::class, 'random']);

    Route::middleware('role:admin')->prefix('admin/content')->group(function () {
        Route::get('/', [AdminContentController::class, 'index']);
        Route::post('/', [AdminContentController::class, 'store']);
        Route::patch('/{item}', [AdminContentController::class, 'update']);
        Route::delete('/{item}', [AdminContentController::class, 'destroy']);
    });
        // inside the auth.session group:
    Route::get('/chat', [ChatController::class, 'index']);
    Route::get('/chat/status', [ChatController::class, 'status']);
    Route::get('/chat/messages', [ChatController::class, 'older']);
    Route::post('/chat/messages', [ChatController::class, 'store']);
    Route::post('/chat/read', [ChatController::class, 'read']);
    Route::patch('/chat/messages/{message}', [ChatController::class, 'update']);
    Route::delete('/chat/messages/{message}', [ChatController::class, 'unsend']);
    Route::post('/chat/messages/{message}/remove', [ChatController::class, 'remove']);



    Route::resource('calendar', CalendarController::class)
        ->parameters(['calendar' => 'event'])
        ->except(['show']);

    Route::resource('timeline', TimelineController::class)
        ->parameters(['timeline' => 'moment'])
        ->except(['show']);
    Route::get('/reasons', [ContentController::class, 'reasons']);

    Route::get('/letters', [LetterController::class, 'index']);

    Route::middleware('role:admin')->group(function () {
        Route::get('/letters/create', [LetterController::class, 'create']);
        Route::post('/letters', [LetterController::class, 'store']);
        Route::get('/letters/{letter}/edit', [LetterController::class, 'edit']);
        Route::put('/letters/{letter}', [LetterController::class, 'update']);
        Route::delete('/letters/{letter}', [LetterController::class, 'destroy']);
    });

    Route::get('/letters/{letter}', [LetterController::class, 'show']);
    Route::post('/letters/{letter}/open', [LetterController::class, 'open']);

    

    Route::get('/memories', [MemoryController::class, 'index']);
    Route::get('/memories/create', [MemoryController::class, 'create']);
    Route::post('/memories', [MemoryController::class, 'store']);
    Route::get('/memories/photos/{photo}', [MemoryPhotoController::class, 'show'])->whereNumber('photo');
    Route::get('/memories/{memory}', [MemoryController::class, 'show'])->whereNumber('memory');
    Route::get('/memories/{memory}/edit', [MemoryController::class, 'edit'])->whereNumber('memory');
    Route::put('/memories/{memory}', [MemoryController::class, 'update'])->whereNumber('memory');
    Route::delete('/memories/{memory}', [MemoryController::class, 'destroy'])->whereNumber('memory');
});