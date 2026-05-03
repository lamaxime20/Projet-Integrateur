<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EtatMicrocontroleur extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'etats_microcontroleurs';
    protected $keyType = 'string';
    public $incrementing = false;
    public $timestamps = false;

    protected $fillable = [
        'etat',
        'date_debut_etat',
        'microcontroleur_id',
    ];

    protected $casts = [
        'date_debut_etat' => 'datetime',
    ];

    public function microcontroleur(): BelongsTo
    {
        return $this->belongsTo(Microcontroleur::class);
    }
}
