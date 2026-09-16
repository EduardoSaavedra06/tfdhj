<?php

use App\Http\Controllers\StudentController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'auth/login')->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');
    Route::get('students-dashboard', [StudentController::class, 'studentsDashboard'])->name('students.dashboard');
    Route::apiResource('students', StudentController::class);
});

require __DIR__.'/settings.php';
