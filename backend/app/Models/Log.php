<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Log extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'logs';
    protected $keyType = 'string';
    public $incrementing = false;
    public $timestamps = false;

    protected $fillable = [
        'type',
        'description',
        'date',
        'source_type',
        'source_id',
        'gravite',
    ];

    protected $casts = [
        'date' => 'datetime',
    ];

    public function utilisateurs()
    {
        return $this->belongsToMany(Utilisateur::class, 'consultation_logs', 'log_id', 'user_id');
    }
}
