<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MicrocontroleurToken extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'microcontroleur_tokens';
    protected $keyType = 'string';
    public $incrementing = false;
    public $timestamps = false;

    protected $fillable = [
        'token',
        'microcontroleur_id',
        'created_at',
        'expires_at',
        'is_revoked',
    ];

    protected $casts = [
        'is_revoked' => 'boolean',
        'created_at' => 'datetime',
        'expires_at' => 'datetime',
    ];

    public function microcontroleur(): BelongsTo
    {
        return $this->belongsTo(Microcontroleur::class);
    }
}
