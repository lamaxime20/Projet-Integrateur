<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Unite extends Model
{
    use HasFactory;

    protected $table = 'unites';
    protected $keyType = 'string';
    public $incrementing = false;
    public $timestamps = false;

    protected $fillable = [
        'name',
        'grandeur_physique',
    ];

    public function grandeur(): BelongsTo
    {
        return $this->belongsTo(Grandeur::class, 'grandeur_physique');
    }
}
