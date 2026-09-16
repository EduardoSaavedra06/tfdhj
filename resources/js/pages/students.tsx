import { Head, router, useForm } from '@inertiajs/react';
import { BookOpen, GraduationCap, Search, Trash2, UserPlus, Users, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import InputError from '@/components/input-error';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

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

const AVATAR_COLORS = [
    'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
    'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300',
    'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
    'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
    'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300',
    'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300',
];

function getInitials(firstName: string, lastName: string): string {
    const f = firstName?.trim().charAt(0) || '';
    const l = lastName?.trim().charAt(0) || '';

    return (f + l).toUpperCase() || 'S';
}

function getAvatarColor(name: string): string {
    let hash = 0;

    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }

    const index = Math.abs(hash) % AVATAR_COLORS.length;

    return AVATAR_COLORS[index];
}

function getProgramBadge(program: string) {
    switch (program) {
        case 'BSIT':
            return (
                <Badge variant="outline" className="border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-300">
                    BSIT
                </Badge>
            );
        case 'BSCS':
            return (
                <Badge variant="outline" className="border-indigo-500/30 bg-indigo-500/10 text-indigo-700 dark:text-indigo-300">
                    BSCS
                </Badge>
            );
        case 'BSIS':
            return (
                <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
                    BSIS
                </Badge>
            );
        default:
            return <Badge variant="secondary">{program}</Badge>;
    }
}

function getYearLevelLabel(year: number): string {
    switch (year) {
        case 1:
            return '1st Year';
        case 2:
            return '2nd Year';
        case 3:
            return '3rd Year';
        case 4:
            return '4th Year';
        default:
            return `Year ${year}`;
    }
}

function formatDate(dateString: string): string {
    if (!dateString) {
        return '—';
    }

    try {
        const date = new Date(dateString);

        if (isNaN(date.getTime())) {
            return dateString;
        }

        return new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        }).format(date);
    } catch {
        return dateString;
    }
}

export default function Students({ students }: { students: Student[] }) {
    const [search, setSearch] = useState('');
    const [selectedProgram, setSelectedProgram] = useState<string | null>(null);
    const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const form = useForm<StudentForm>(emptyForm);

    const filteredStudents = useMemo(() => {
        const query = search.trim().toLowerCase();

        return students.filter((student) => {
            const matchesProgram = !selectedProgram || student.program === selectedProgram;

            if (!matchesProgram) {
                return false;
            }

            if (!query) {
                return true;
            }

            return [student.first_name, student.last_name, student.email, student.program]
                .join(' ')
                .toLowerCase()
                .includes(query);
        });
    }, [search, selectedProgram, students]);

    function submitStudent(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        form.post('/students', {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Student added successfully!');
                form.reset();
            },
            onError: () => {
                toast.error('Failed to add student. Please check the form errors.');
            },
        });
    }

    function confirmDelete() {
        if (!studentToDelete) {
            return;
        }

        setIsDeleting(true);
        router.delete(`/students/${studentToDelete.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success(`Removed ${studentToDelete.first_name} ${studentToDelete.last_name}`);
                setStudentToDelete(null);
            },
            onError: () => {
                toast.error('Failed to delete student. Please try again.');
            },
            onFinish: () => {
                setIsDeleting(false);
            },
        });
    }

    const seniorCount = useMemo(() => {
        return students.filter((student) => student.year_level >= 3).length;
    }, [students]);

    const uniqueProgramsCount = useMemo(() => {
        return new Set(students.map((student) => student.program)).size;
    }, [students]);

    return (
        <>
            <Head title="Students" />
            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                {/* Header section */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                                <GraduationCap className="size-3.5" />
                                Academic Records
                            </span>
                        </div>
                        <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">Students</h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Manage your student directory, academic enrollments, and profiles.
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <Badge variant="outline" className="gap-1.5 px-3 py-1 font-normal text-muted-foreground">
                            <span className="size-2 rounded-full bg-emerald-500" />
                            {students.length} Total {students.length === 1 ? 'Student' : 'Students'}
                        </Badge>
                    </div>
                </div>

                {/* Metrics Cards */}
                <div className="grid gap-4 sm:grid-cols-3">
                    <Card className="gap-0 p-5 shadow-xs transition-shadow hover:shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
                                    Total Students
                                </p>
                                <p className="mt-1 text-2xl font-bold tracking-tight">{students.length}</p>
                            </div>
                            <div className="rounded-xl bg-blue-500/10 p-3 text-blue-600 dark:text-blue-400">
                                <Users className="size-5" />
                            </div>
                        </div>
                        <div className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
                            <span className="size-1.5 rounded-full bg-emerald-500" />
                            <span>Active enrolled records</span>
                        </div>
                    </Card>

                    <Card className="gap-0 p-5 shadow-xs transition-shadow hover:shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
                                    Programs Represented
                                </p>
                                <p className="mt-1 text-2xl font-bold tracking-tight">{uniqueProgramsCount}</p>
                            </div>
                            <div className="rounded-xl bg-emerald-500/10 p-3 text-emerald-600 dark:text-emerald-400">
                                <GraduationCap className="size-5" />
                            </div>
                        </div>
                        <div className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
                            <span>BSIT, BSCS, and BSIS departments</span>
                        </div>
                    </Card>

                    <Card className="gap-0 p-5 shadow-xs transition-shadow hover:shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
                                    Senior Students
                                </p>
                                <p className="mt-1 text-2xl font-bold tracking-tight">{seniorCount}</p>
                            </div>
                            <div className="rounded-xl bg-purple-500/10 p-3 text-purple-600 dark:text-purple-400">
                                <BookOpen className="size-5" />
                            </div>
                        </div>
                        <div className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
                            <span>Years 3 & 4 standing</span>
                        </div>
                    </Card>
                </div>

                {/* Main Directory & Form Layout */}
                <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
                    {/* Directory Table Card */}
                    <Card className="min-w-0 gap-0 overflow-hidden py-0 shadow-xs">
                        <CardHeader className="gap-4 border-b border-border py-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <CardTitle className="text-base sm:text-lg">Student Directory</CardTitle>
                                <CardDescription className="mt-0.5 text-xs">
                                    Showing {filteredStudents.length} of {students.length} students
                                </CardDescription>
                            </div>

                            <div className="flex flex-wrap items-center gap-2">
                                {/* Program filter pills */}
                                <div className="flex items-center gap-1 rounded-lg border bg-muted/40 p-1 text-xs">
                                    {(['ALL', 'BSIT', 'BSCS', 'BSIS'] as const).map((prog) => {
                                        const isSelected = (prog === 'ALL' && !selectedProgram) || selectedProgram === prog;

                                        return (
                                            <button
                                                key={prog}
                                                type="button"
                                                onClick={() => setSelectedProgram(prog === 'ALL' ? null : prog)}
                                                className={cn(
                                                    'rounded-md px-2.5 py-1 text-xs font-medium transition-all',
                                                    isSelected
                                                        ? 'bg-background text-foreground shadow-xs'
                                                        : 'text-muted-foreground hover:text-foreground',
                                                )}
                                            >
                                                {prog}
                                            </button>
                                        );
                                    })}
                                </div>

                                {/* Search Bar */}
                                <div className="relative w-full sm:w-60">
                                    <Search className="absolute top-2.5 left-3 size-4 text-muted-foreground" />
                                    <Input
                                        aria-label="Search students"
                                        className="h-9 pr-8 pl-9 text-xs sm:text-sm"
                                        placeholder="Search students..."
                                        value={search}
                                        onChange={(event) => setSearch(event.target.value)}
                                    />
                                    {search && (
                                        <button
                                            type="button"
                                            onClick={() => setSearch('')}
                                            className="absolute top-2.5 right-2.5 text-muted-foreground hover:text-foreground"
                                            aria-label="Clear search"
                                        >
                                            <X className="size-4" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </CardHeader>

                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[650px] text-left text-sm">
                                    <thead className="border-b border-border bg-muted/40 text-xs font-medium text-muted-foreground">
                                        <tr>
                                            <th className="py-3 pr-4 pl-6 font-medium">Student</th>
                                            <th className="py-3 pr-4 font-medium">Program</th>
                                            <th className="py-3 pr-4 font-medium">Year Level</th>
                                            <th className="py-3 pr-4 font-medium">Age & Birthday</th>
                                            <th className="py-3 pr-4 font-medium">Gender</th>
                                            <th className="py-3 pr-6 text-right font-medium">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {filteredStudents.map((student) => (
                                            <tr key={student.id} className="transition-colors hover:bg-muted/30">
                                                <td className="py-3.5 pr-4 pl-6">
                                                    <div className="flex items-center gap-3">
                                                        <Avatar className="size-9 shrink-0 border border-border/60">
                                                            <AvatarFallback
                                                                className={cn(
                                                                    'text-xs font-bold',
                                                                    getAvatarColor(`${student.first_name} ${student.last_name}`),
                                                                )}
                                                            >
                                                                {getInitials(student.first_name, student.last_name)}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div className="min-w-0">
                                                            <p className="truncate font-medium text-foreground">
                                                                {student.first_name} {student.last_name}
                                                            </p>
                                                            <p className="truncate text-xs text-muted-foreground">
                                                                {student.email}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-3.5 pr-4">
                                                    {getProgramBadge(student.program)}
                                                </td>
                                                <td className="py-3.5 pr-4">
                                                    <span className="inline-flex items-center rounded-md bg-secondary/80 px-2 py-0.5 text-xs font-medium text-secondary-foreground">
                                                        {getYearLevelLabel(student.year_level)}
                                                    </span>
                                                </td>
                                                <td className="py-3.5 pr-4">
                                                    <div className="text-xs">
                                                        <span className="font-semibold text-foreground">
                                                            {student.age !== null ? `${student.age} yrs` : '—'}
                                                        </span>
                                                        <span className="block text-[11px] text-muted-foreground">
                                                            {formatDate(student.birthday)}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="py-3.5 pr-4">
                                                    <span className="inline-flex items-center text-xs capitalize text-muted-foreground">
                                                        {student.gender}
                                                    </span>
                                                </td>
                                                <td className="py-3.5 pr-6 text-right">
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button
                                                                aria-label={`Delete ${student.first_name} ${student.last_name}`}
                                                                size="icon"
                                                                variant="ghost"
                                                                className="size-8 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                                                                onClick={() => setStudentToDelete(student)}
                                                            >
                                                                <Trash2 className="size-4" />
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>Remove student</TooltipContent>
                                                    </Tooltip>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Empty state when query or filter yields no results */}
                            {students.length > 0 && filteredStudents.length === 0 && (
                                <div className="flex flex-col items-center justify-center py-16 text-center">
                                    <div className="mb-3 rounded-full bg-muted p-3 text-muted-foreground">
                                        <Search className="size-6" />
                                    </div>
                                    <h3 className="text-sm font-semibold">No students found</h3>
                                    <p className="mt-1 max-w-xs text-xs text-muted-foreground">
                                        {search ? `No students match "${search}"` : 'No students found in this program'}.
                                    </p>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="mt-4 text-xs"
                                        onClick={() => {
                                            setSearch('');
                                            setSelectedProgram(null);
                                        }}
                                    >
                                        Clear filters
                                    </Button>
                                </div>
                            )}

                            {/* Empty state when no students exist at all */}
                            {students.length === 0 && (
                                <div className="flex flex-col items-center justify-center py-16 text-center">
                                    <div className="mb-3 rounded-full bg-primary/10 p-3 text-primary">
                                        <Users className="size-6" />
                                    </div>
                                    <h3 className="text-sm font-semibold">No students registered yet</h3>
                                    <p className="mt-1 max-w-xs text-xs text-muted-foreground">
                                        Add your first student using the registration form on the right.
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Add Student Card */}
                    <Card className="self-start shadow-xs xl:sticky xl:top-6">
                        <CardHeader className="pb-4">
                            <div className="flex items-center gap-2">
                                <div className="rounded-lg bg-primary/10 p-2 text-primary">
                                    <UserPlus className="size-4" />
                                </div>
                                <div>
                                    <CardTitle className="text-base">Add Student</CardTitle>
                                    <CardDescription className="text-xs">
                                        Fill in details to enroll a new student.
                                    </CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <form className="space-y-4" onSubmit={submitStudent}>
                                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                                    <div className="space-y-1.5">
                                        <Label htmlFor="first_name" className="text-xs font-medium">First name</Label>
                                        <Input
                                            id="first_name"
                                            value={form.data.first_name}
                                            onChange={(event) => form.setData('first_name', event.target.value)}
                                            placeholder="e.g. John"
                                            required
                                        />
                                        <InputError message={form.errors.first_name} />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label htmlFor="last_name" className="text-xs font-medium">Last name</Label>
                                        <Input
                                            id="last_name"
                                            value={form.data.last_name}
                                            onChange={(event) => form.setData('last_name', event.target.value)}
                                            placeholder="e.g. Doe"
                                            required
                                        />
                                        <InputError message={form.errors.last_name} />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="email" className="text-xs font-medium">Email address</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={form.data.email}
                                        onChange={(event) => form.setData('email', event.target.value)}
                                        placeholder="student@example.com"
                                        required
                                    />
                                    <InputError message={form.errors.email} />
                                </div>

                                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                                    <div className="space-y-1.5">
                                        <Label htmlFor="program" className="text-xs font-medium">Program</Label>
                                        <Select
                                            value={form.data.program}
                                            onValueChange={(val) => form.setData('program', val)}
                                        >
                                            <SelectTrigger id="program" className="w-full">
                                                <SelectValue placeholder="Select program" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="BSIT">BSIT</SelectItem>
                                                <SelectItem value="BSCS">BSCS</SelectItem>
                                                <SelectItem value="BSIS">BSIS</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <InputError message={form.errors.program} />
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label htmlFor="year_level" className="text-xs font-medium">Year level</Label>
                                        <Select
                                            value={String(form.data.year_level)}
                                            onValueChange={(val) => form.setData('year_level', Number(val))}
                                        >
                                            <SelectTrigger id="year_level" className="w-full">
                                                <SelectValue placeholder="Select year" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="1">Year 1</SelectItem>
                                                <SelectItem value="2">Year 2</SelectItem>
                                                <SelectItem value="3">Year 3</SelectItem>
                                                <SelectItem value="4">Year 4</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <InputError message={form.errors.year_level} />
                                    </div>
                                </div>

                                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                                    <div className="space-y-1.5">
                                        <Label htmlFor="birthday" className="text-xs font-medium">Birthday</Label>
                                        <Input
                                            id="birthday"
                                            type="date"
                                            value={form.data.birthday}
                                            onChange={(event) => form.setData('birthday', event.target.value)}
                                            required
                                        />
                                        <InputError message={form.errors.birthday} />
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label htmlFor="gender" className="text-xs font-medium">Gender</Label>
                                        <Select
                                            value={form.data.gender}
                                            onValueChange={(val) => form.setData('gender', val)}
                                        >
                                            <SelectTrigger id="gender" className="w-full">
                                                <SelectValue placeholder="Select gender" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="female">Female</SelectItem>
                                                <SelectItem value="male">Male</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <InputError message={form.errors.gender} />
                                    </div>
                                </div>

                                <Button
                                    className="w-full gap-2 transition-all"
                                    disabled={form.processing}
                                    type="submit"
                                >
                                    {form.processing ? (
                                        <>
                                            <Spinner className="size-4" />
                                            <span>Adding student...</span>
                                        </>
                                    ) : (
                                        <>
                                            <UserPlus className="size-4" />
                                            <span>Add student</span>
                                        </>
                                    )}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Confirmation Dialog for Deleting Student */}
            <Dialog open={!!studentToDelete} onOpenChange={(open) => !open && setStudentToDelete(null)}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Delete Student</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to remove{' '}
                            <span className="font-semibold text-foreground">
                                {studentToDelete?.first_name} {studentToDelete?.last_name}
                            </span>{' '}
                            from the student directory? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button
                            variant="outline"
                            type="button"
                            onClick={() => setStudentToDelete(null)}
                            disabled={isDeleting}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            type="button"
                            onClick={confirmDelete}
                            disabled={isDeleting}
                        >
                            {isDeleting ? (
                                <>
                                    <Spinner className="mr-2 size-4" /> Deleting...
                                </>
                            ) : (
                                'Delete'
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
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
