<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\Utilisateur;
use App\Models\Seuil;
use App\Models\Actionneur;
use App\Models\Capteur;
use App\Models\MicrocontroleurToken;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Microcontroleur extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'microcontroleurs';
    protected $keyType = 'string';
    public $incrementing = false;
    public $timestamps = false;

    protected $fillable = [
        'nom',
        'mac_address',
        'identifiant_user',
        'reference',
        'allume',
        'last_connexion',
        'date_installation',
        'passkey',
        'user_id',
    ];

    protected $casts = [
        'allume' => 'boolean',
        'last_connexion' => 'datetime',
        'date_installation' => 'datetime',
    ];

    public function utilisateur(): BelongsTo
    {
        return $this->belongsTo(Utilisateur::class, 'user_id');
    }

    public function seuils(): HasMany
    {
        return $this->hasMany(Seuil::class);
    }

    public function actionneurs(): HasMany
    {
        return $this->hasMany(Actionneur::class);
    }

    public function capteurs(): HasMany
    {
        return $this->hasMany(Capteur::class);
    }

    public function tokens(): HasMany
    {
        return $this->hasMany(MicrocontroleurToken::class);
    }
}
