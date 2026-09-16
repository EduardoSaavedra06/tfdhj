<?php

use App\Models\Student;
use App\Models\User;

test('student endpoints require authentication', function () {
    $response = $this->getJson(route('students.index'));

    $response->assertUnauthorized();
});

test('the student dashboard includes student records', function () {
    $user = User::factory()->create();
    $student = Student::factory()->create();

    $response = $this->actingAs($user)->get(route('students.dashboard'));

    $response->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('students')
            ->has('students', 1)
            ->where('students.0.id', $student->id));
});

test('the add student form redirects back to the students dashboard', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)
        ->withHeaders([
            'X-Inertia' => 'true',
            'X-Requested-With' => 'XMLHttpRequest',
        ])
        ->post(route('students.store'), [
            'first_name' => 'Ada',
            'last_name' => 'Lovelace',
            'birthday' => '1815-12-10',
            'email' => 'ada@example.com',
            'program' => 'BSCS',
            'gender' => 'female',
            'year_level' => 4,
        ]);

    $response->assertRedirect(route('students.dashboard'));
    $this->assertDatabaseHas('students', [
        'first_name' => 'Ada',
        'email' => 'ada@example.com',
    ]);
});

test('an authenticated user can update an existing student', function () {
    $user = User::factory()->create();
    $student = Student::factory()->create();

    $response = $this->actingAs($user)->putJson(route('students.update', $student), [
        'first_name' => 'Updated',
        'last_name' => $student->last_name,
        'birthday' => $student->birthday->format('Y-m-d'),
        'email' => $student->email,
        'program' => $student->program,
        'gender' => $student->gender,
        'year_level' => $student->year_level,
    ]);

    $response->assertOk()
        ->assertJsonPath('first_name', 'Updated');
    expect(Student::count())->toBe(1);
    expect($student->refresh()->first_name)->toBe('Updated');
});

test('an authenticated user can delete a student', function () {
    $user = User::factory()->create();
    $student = Student::factory()->create();

    $response = $this->actingAs($user)->deleteJson(route('students.destroy', $student));

    $response->assertOk()
        ->assertJson(['message' => 'Student deleted successfully']);
    expect(Student::find($student->id))->toBeNull();
});

test('updating a student rejects another students email', function () {
    $user = User::factory()->create();
    $student = Student::factory()->create();
    $otherStudent = Student::factory()->create();

    $response = $this->actingAs($user)->putJson(route('students.update', $student), [
        'first_name' => $student->first_name,
        'last_name' => $student->last_name,
        'birthday' => $student->birthday->format('Y-m-d'),
        'email' => $otherStudent->email,
        'program' => $student->program,
        'gender' => $student->gender,
        'year_level' => $student->year_level,
    ]);

    $response->assertUnprocessable()
        ->assertJsonValidationErrors(['email']);
});
