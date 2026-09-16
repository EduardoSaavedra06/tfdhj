<?php

namespace App\Http\Controllers;

use App\Models\Student;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class StudentController extends Controller
{
    public function studentsDashboard(): Response
    {
        return Inertia::render('students', [
            'students' => Student::query()->latest()->get(),
        ]);
    }

    /**
     * Display a listing of the resource.
     */
    public function index(): JsonResponse
    {
        return response()->json(Student::all());
    }

    public function create()
    {
        //
    }

    public function store(Request $request): JsonResponse|RedirectResponse
    {
        $validated = $request->validate($this->studentRules());
        $student = Student::create($validated);

        if ($request->header('X-Inertia')) {
            return to_route('students.dashboard');
        }

        return response()->json($student, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Student $student): JsonResponse
    {
        return response()->json($student);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Student $student)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Student $student): JsonResponse
    {
        $validated = $request->validate($this->studentRules($student));
        $student->update($validated);

        return response()->json($student->fresh());
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, Student $student): JsonResponse|RedirectResponse
    {
        $student->delete();

        if ($request->header('X-Inertia')) {
            return to_route('students.dashboard');
        }

        return response()->json([
            'message' => 'Student deleted successfully',
        ]);
    }

    /**
     * @return array<string, string|Rule>
     */
    private function studentRules(?Student $student = null): array
    {
        return [
            'first_name' => 'required|string|max:100',
            'last_name' => 'required|string|max:100',
            'birthday' => 'required|date|before:today',
            'email' => [
                'required',
                'email',
                Rule::unique('students', 'email')->ignore($student),
            ],
            'program' => 'required|string|max:60',
            'gender' => 'required|string|max:60',
            'year_level' => 'required|integer|min:1|max:4',
        ];
    }
}
