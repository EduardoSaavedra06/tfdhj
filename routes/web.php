<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\StudentController;

Route::inertia('/', 'auth/login')->name('home');


Route::get('/students', [StudentController::class, 'index'])
    ->name('students.index');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');
});

require __DIR__.'/settings.php';
