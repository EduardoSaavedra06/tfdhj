<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Student extends Model
{
    use HasFactory;

    protected $fillable = [
        'first_name',
        'last_name',
        'email',
        'program',
        'gender',
        'birthday',
        'year_level',
    ];

    protected $casts = [
        'birthday' => 'date',
    ];

    protected $appends = [
        'age',
    ];

    public function getAgeAttribute()
    {
        return $this->birthday
            ? Carbon::parse($this->birthday)->age
            : null;
    }
    //
}
