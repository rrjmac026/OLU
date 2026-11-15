<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PuzzleResult extends Model
{
    protected $fillable = ['user_id', 'puzzle_id', 'puzzle_date', 'outcome'];
}