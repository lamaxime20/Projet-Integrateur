<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\Microcontroleur;
use App\Models\Instruction;
use App\Models\EtatActionneur;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Actionneur extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'actionneurs';
    // Optionnel si le nom est 'id', mais recommandé pour la clarté avec UUID
    protected $primaryKey = 'id';
    protected $keyType = 'string';
    public $incrementing = false;
    public $timestamps = false;

    protected $fillable = [
        'etat',
        'last_seen',
        'modele',
        'microcontroleur_id',
    ];

    protected $casts = [
        'last_seen' => 'datetime',
    ];

    public function microcontroleur(): BelongsTo
    {
        return $this->belongsTo(Microcontroleur::class);
    }

    public function instructions(): HasMany
    {
        return $this->hasMany(Instruction::class);
    }

    public function historiquesEtats(): HasMany
    {
        return $this->hasMany(EtatActionneur::class);
    }
}
