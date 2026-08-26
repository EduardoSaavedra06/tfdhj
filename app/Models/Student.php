<?php

namespace App\Models;


use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

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

   protected $casts =[
    'birthday' => 'date',
   ];

   protected $appends =[
    'age'
   ];
   
   public function getAgeAttribute()
{
    return $this->birthday
        ? \Carbon\Carbon::parse($this->birthday)->age
        : null;
}
//
}
