import { Head, router, useForm } from '@inertiajs/react';
import { Search, Trash2, UserPlus, Users } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type Student = {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    program: string;
    gender: string;
    birthday: string;
    year_level: number;
    age: number | null;
};

type StudentForm = {
    first_name: string;
    last_name: string;
    email: string;
    program: string;
    gender: string;
    birthday: string;
    year_level: number;
};

const emptyForm: StudentForm = {
    first_name: '',
    last_name: '',
    email: '',
    program: 'BSIT',
    gender: 'female',
    birthday: '',
    year_level: 1,
};

export default function Students({ students }: { students: Student[] }) {
    const [search, setSearch] = useState('');
    const form = useForm<StudentForm>(emptyForm);

    const filteredStudents = useMemo(() => {
        const query = search.trim().toLowerCase();

        if (!query) {
            return students;
        }

        return students.filter((student) =>
            [student.first_name, student.last_name, student.email, student.program]
                .join(' ')
                .toLowerCase()
                .includes(query),
        );
    }, [search, students]);

    function submitStudent(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        form.post('/students', {
            preserveScroll: true,
            onSuccess: () => form.reset(),
        });
    }

    function removeStudent(student: Student) {
        if (!window.confirm(`Remove ${student.first_name} ${student.last_name}?`)) {
            return;
        }

        router.delete(`/students/${student.id}`, {
            preserveScroll: true,
        });
    }

    return (
        <>
            <Head title="Students" />
            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <div>
                    <p className="text-sm font-medium text-muted-foreground">Academic records</p>
                    <h1 className="mt-1 text-2xl font-semibold tracking-tight">Students</h1>
                    <p className="mt-1 text-sm text-muted-foreground">Manage your student directory in one place.</p>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                    <Card>
                        <CardContent className="flex items-center gap-4 pt-6">
                            <div className="rounded-lg bg-primary/10 p-3 text-primary"><Users className="size-5" /></div>
                            <div><p className="text-sm text-muted-foreground">Total students</p><p className="text-2xl font-semibold">{students.length}</p></div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6"><p className="text-sm text-muted-foreground">Programs represented</p><p className="text-2xl font-semibold">{new Set(students.map((student) => student.program)).size}</p></CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6"><p className="text-sm text-muted-foreground">Senior students</p><p className="text-2xl font-semibold">{students.filter((student) => student.year_level >= 3).length}</p></CardContent>
                    </Card>
                </div>

                <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
                    <Card className="min-w-0">
                        <CardHeader className="gap-4 border-b sm:flex-row sm:items-center sm:justify-between">
                            <CardTitle>Student directory</CardTitle>
                            <div className="relative w-full sm:w-64"><Search className="absolute top-2.5 left-3 size-4 text-muted-foreground" /><Input aria-label="Search students" className="pl-9" placeholder="Search students..." value={search} onChange={(event) => setSearch(event.target.value)} /></div>
                        </CardHeader>
                        <CardContent className="overflow-x-auto pt-0">
                            <table className="w-full min-w-[650px] text-left text-sm">
                                <thead className="border-b text-xs text-muted-foreground"><tr><th className="py-3 pr-4 font-medium">Student</th><th className="py-3 pr-4 font-medium">Program</th><th className="py-3 pr-4 font-medium">Year</th><th className="py-3 pr-4 font-medium">Age</th><th className="py-3 text-right font-medium">Action</th></tr></thead>
                                <tbody className="divide-y">
                                    {filteredStudents.map((student) => <tr key={student.id} className="group"><td className="py-4 pr-4"><p className="font-medium">{student.first_name} {student.last_name}</p><p className="text-xs text-muted-foreground">{student.email}</p></td><td className="py-4 pr-4">{student.program}</td><td className="py-4 pr-4">Year {student.year_level}</td><td className="py-4 pr-4">{student.age ?? '—'}</td><td className="py-4 text-right"><Button aria-label={`Delete ${student.first_name} ${student.last_name}`} size="icon" variant="ghost" onClick={() => removeStudent(student)}><Trash2 className="size-4 text-destructive" /></Button></td></tr>)}
                                </tbody>
                            </table>
                            {filteredStudents.length === 0 && <p className="py-10 text-center text-sm text-muted-foreground">No students match your search.</p>}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader><CardTitle className="flex items-center gap-2"><UserPlus className="size-4" /> Add student</CardTitle></CardHeader>
                        <CardContent>
                            <form className="space-y-4" onSubmit={submitStudent}>
                                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1"><div className="space-y-2"><Label htmlFor="first_name">First name</Label><Input id="first_name" value={form.data.first_name} onChange={(event) => form.setData('first_name', event.target.value)} required />{form.errors.first_name && <p className="text-xs text-destructive">{form.errors.first_name}</p>}</div><div className="space-y-2"><Label htmlFor="last_name">Last name</Label><Input id="last_name" value={form.data.last_name} onChange={(event) => form.setData('last_name', event.target.value)} required />{form.errors.last_name && <p className="text-xs text-destructive">{form.errors.last_name}</p>}</div></div>
                                <div className="space-y-2"><Label htmlFor="email">Email</Label><Input id="email" type="email" value={form.data.email} onChange={(event) => form.setData('email', event.target.value)} required />{form.errors.email && <p className="text-xs text-destructive">{form.errors.email}</p>}</div>
                                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1"><div className="space-y-2"><Label htmlFor="program">Program</Label><select id="program" className="border-input bg-background flex h-9 w-full rounded-md border px-3 text-sm" value={form.data.program} onChange={(event) => form.setData('program', event.target.value)}><option>BSIT</option><option>BSCS</option><option>BSIS</option></select></div><div className="space-y-2"><Label htmlFor="year_level">Year level</Label><select id="year_level" className="border-input bg-background flex h-9 w-full rounded-md border px-3 text-sm" value={form.data.year_level} onChange={(event) => form.setData('year_level', Number(event.target.value))}><option value="1">Year 1</option><option value="2">Year 2</option><option value="3">Year 3</option><option value="4">Year 4</option></select></div></div>
                                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1"><div className="space-y-2"><Label htmlFor="birthday">Birthday</Label><Input id="birthday" type="date" value={form.data.birthday} onChange={(event) => form.setData('birthday', event.target.value)} required /></div><div className="space-y-2"><Label htmlFor="gender">Gender</Label><select id="gender" className="border-input bg-background flex h-9 w-full rounded-md border px-3 text-sm" value={form.data.gender} onChange={(event) => form.setData('gender', event.target.value)}><option>female</option><option>male</option></select></div></div>
                                <Button className="w-full" disabled={form.processing} type="submit">{form.processing ? 'Adding...' : 'Add student'}</Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}

Students.layout = {
    breadcrumbs: [
        {
            title: 'Students',
            href: '/students-dashboard',
        },
    ],
};
