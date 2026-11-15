<?php

use App\Http\Controllers\Admin\ContentController as AdminContentController;
use App\Http\Controllers\Admin\UserController as AdminUserController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\BackgroundController;
use App\Http\Controllers\BucketController;
use App\Http\Controllers\CalendarController;
use App\Http\Controllers\ChatController;
use App\Http\Controllers\CheckinController;
use App\Http\Controllers\ContentController;
use App\Http\Controllers\JournalController;
use App\Http\Controllers\LetterController;
use App\Http\Controllers\MemoryController;
use App\Http\Controllers\MemoryPhotoController;
use App\Http\Controllers\PasswordController;
use App\Http\Controllers\PrivacyController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\SettingsController;
use App\Http\Controllers\SongController;
use App\Http\Controllers\TimelineController;
use App\Http\Controllers\WelcomeController;
use App\Http\Controllers\QuestionController;
use App\Http\Controllers\QuizController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Public (guests allowed)
|--------------------------------------------------------------------------
| "/" shows the landing page to guests and Home to logged-in users.
| "/backdrop" serves ONLY the active landing background.
*/
Route::get('/', WelcomeController::class)->name('home');
Route::get('backdrop', [BackgroundController::class, 'backdrop']);

Route::get('login', [AuthController::class, 'create'])->name('login');
Route::post('login', [AuthController::class, 'store']);

/*
|--------------------------------------------------------------------------
| Authenticated
|--------------------------------------------------------------------------
*/
Route::middleware('auth.session')->group(function () {

    Route::post('logout', [AuthController::class, 'destroy'])->name('logout');

    // ----- Daily check-in -----
    Route::get('checkins', [CheckinController::class, 'index'])->name('checkins.index');
    Route::post('checkins', [CheckinController::class, 'store'])->name('checkins.store');
    Route::delete('checkins/{checkin}', [CheckinController::class, 'destroy'])->name('checkins.destroy');

    // ----- Journal -----
    Route::resource('journal', JournalController::class)->parameters(['journal' => 'entry']);

    // ----- Chat -----
    Route::prefix('chat')->group(function () {
        Route::get('/', [ChatController::class, 'index']);
        Route::get('status', [ChatController::class, 'status']);
        Route::get('messages', [ChatController::class, 'older']);
        Route::post('messages', [ChatController::class, 'store']);
        Route::post('read', [ChatController::class, 'read']);
        Route::patch('messages/{message}', [ChatController::class, 'update']);
        Route::delete('messages/{message}', [ChatController::class, 'unsend']);
        Route::post('messages/{message}/remove', [ChatController::class, 'remove']);
    });

    // ----- Letters (admin writes; both read) -----
    // Admin-only routes first so "/letters/create" is not captured by "/letters/{letter}".
    Route::middleware('role:admin')->group(function () {
        Route::get('letters/create', [LetterController::class, 'create']);
        Route::post('letters', [LetterController::class, 'store']);
        Route::get('letters/{letter}/edit', [LetterController::class, 'edit']);
        Route::put('letters/{letter}', [LetterController::class, 'update']);
        Route::delete('letters/{letter}', [LetterController::class, 'destroy']);
    });
    Route::get('letters', [LetterController::class, 'index']);
    Route::get('letters/{letter}', [LetterController::class, 'show']);
    Route::post('letters/{letter}/open', [LetterController::class, 'open']);

    // ----- Calendar & timeline -----
    Route::resource('calendar', CalendarController::class)
        ->parameters(['calendar' => 'event'])
        ->except(['show']);

    Route::resource('timeline', TimelineController::class)
        ->parameters(['timeline' => 'moment'])
        ->except(['show']);

    // ----- Memories (photo route before {memory}) -----
    Route::get('memories', [MemoryController::class, 'index']);
    Route::get('memories/create', [MemoryController::class, 'create']);
    Route::post('memories', [MemoryController::class, 'store']);
    Route::get('memories/photos/{photo}', [MemoryPhotoController::class, 'show'])->whereNumber('photo');
    Route::get('memories/{memory}', [MemoryController::class, 'show'])->whereNumber('memory');
    Route::get('memories/{memory}/edit', [MemoryController::class, 'edit'])->whereNumber('memory');
    Route::put('memories/{memory}', [MemoryController::class, 'update'])->whereNumber('memory');
    Route::delete('memories/{memory}', [MemoryController::class, 'destroy'])->whereNumber('memory');

    // ----- Bucket list & music -----
    Route::get('bucket', [BucketController::class, 'index']);
    Route::post('bucket', [BucketController::class, 'store']);
    Route::post('bucket/{item}/toggle', [BucketController::class, 'toggle'])->whereNumber('item');
    Route::delete('bucket/{item}', [BucketController::class, 'destroy'])->whereNumber('item');

    Route::get('music', [SongController::class, 'index']);
    Route::post('music', [SongController::class, 'store']);
    Route::delete('music/{song}', [SongController::class, 'destroy'])->whereNumber('song');

    // ----- Content for her side (comfort, reasons, random picks) -----
    Route::get('comfort', [ContentController::class, 'comfort']);
    Route::get('reasons', [ContentController::class, 'reasons']);
    Route::get('content/random/{kind}', [ContentController::class, 'random']);

    // ----- Landing page backgrounds (either of you can change) -----
    Route::get('backgrounds', [BackgroundController::class, 'index']);
    Route::post('backgrounds', [BackgroundController::class, 'store']);
    Route::post('backgrounds/clear', [BackgroundController::class, 'clear']);
    Route::get('backgrounds/{background}/image', [BackgroundController::class, 'image'])->whereNumber('background');
    Route::post('backgrounds/{background}/activate', [BackgroundController::class, 'activate'])->whereNumber('background');
    Route::delete('backgrounds/{background}', [BackgroundController::class, 'destroy'])->whereNumber('background');

    // ----- Settings -----
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

    // ----- Admin only -----
    Route::prefix('admin')->middleware('role:admin')->group(function () {
        Route::get('users', [AdminUserController::class, 'index'])->name('admin.users.index');
        Route::post('users', [AdminUserController::class, 'store'])->name('admin.users.store');
        Route::patch('users/{user}', [AdminUserController::class, 'update'])->name('admin.users.update');

        Route::prefix('content')->group(function () {
            Route::get('/', [AdminContentController::class, 'index']);
            Route::post('/', [AdminContentController::class, 'store']);
            Route::patch('{item}', [AdminContentController::class, 'update']);
            Route::delete('{item}', [AdminContentController::class, 'destroy']);
        });
    });

    // ----- Shared daily questions -----
    Route::get('questions', [QuestionController::class, 'index']);
    Route::post('questions', [QuestionController::class, 'store']);
    Route::delete('questions/{answer}', [QuestionController::class, 'destroy'])->whereNumber('answer');

    // ----- Playroom: couple quiz -----
    Route::get('quiz', [QuizController::class, 'index']);
    Route::post('quiz/questions', [QuizController::class, 'storeQuestion']);
    Route::delete('quiz/questions/{question}', [QuizController::class, 'destroyQuestion'])->whereNumber('question');
    Route::post('quiz/questions/{question}/guess', [QuizController::class, 'guess'])->whereNumber('question');
    Route::post('quiz/reset', [QuizController::class, 'reset']);
});