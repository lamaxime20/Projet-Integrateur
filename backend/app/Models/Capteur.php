<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\Grandeur;
use App\Models\Microcontroleur;
use App\Models\Donnee;
use App\Models\EtatCapteur;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Capteur extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'capteurs';
    protected $keyType = 'string';
    public $incrementing = false;
    public $timestamps = false;

    protected $fillable = [
        'type_mesure',
        'etat',
        'last_seen',
        'modele',
        'microcontroleur_id',
    ];

    protected $casts = [
        'last_seen' => 'datetime',
    ];

    public function typeMesure(): BelongsTo
    {
        return $this->belongsTo(Grandeur::class, 'type_mesure');
    }

    public function microcontroleur(): BelongsTo
    {
        return $this->belongsTo(Microcontroleur::class);
    }

    public function donnees(): HasMany
    {
        return $this->hasMany(Donnee::class);
    }

    public function historiquesEtats(): HasMany
    {
        return $this->hasMany(EtatCapteur::class);
    }
}
