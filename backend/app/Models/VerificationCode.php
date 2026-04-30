<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class VerificationCode extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'verification_codes';
    protected $keyType = 'string';
    public $incrementing = false;
    public $timestamps = false;

    protected $fillable = [
        'email',
        'code',
        'created_at',
        'expired_at',
        'is_used',
    ];

    protected $casts = [
        'is_used' => 'boolean',
        'created_at' => 'datetime',
        'expired_at' => 'datetime',
    ];
}