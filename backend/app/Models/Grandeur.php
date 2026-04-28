<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\Unite;
use App\Models\Seuil;
use App\Models\Capteur;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Grandeur extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'grandeurs';
    protected $keyType = 'string';
    public $incrementing = false;
    public $timestamps = false;

    protected $fillable = [
        'name',
    ];

    public function unites(): HasMany
    {
        return $this->hasMany(Unite::class, 'grandeur_physique');
    }

    public function seuils(): HasMany
    {
        return $this->hasMany(Seuil::class, 'type_mesure');
    }

    public function capteurs(): HasMany
    {
        return $this->hasMany(Capteur::class, 'type_mesure');
    }
}
