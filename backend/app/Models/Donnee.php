<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Donnee extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'donnees';
    protected $keyType = 'string';
    public $incrementing = false;
    public $timestamps = false;

    protected $fillable = [
        'valeur',
        'date_arrivee',
        'capteur_id',
    ];

    protected $casts = [
        'valeur' => 'float',
        'date_arrivee' => 'datetime',
    ];

    public function capteur(): BelongsTo
    {
        return $this->belongsTo(Capteur::class);
    }
}
