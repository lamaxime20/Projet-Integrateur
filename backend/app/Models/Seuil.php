<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Seuil extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'seuils';
    protected $keyType = 'string';
    public $incrementing = false;
    public $timestamps = false;

    protected $fillable = [
        'type_mesure',
        'valeur_max',
        'valeur_min',
        'updated_at',
        'user_id',
        'microcontroleur_id',
    ];

    protected $casts = [
        'valeur_max' => 'float',
        'valeur_min' => 'float',
        'updated_at' => 'datetime',
    ];

    public function typeMesure(): BelongsTo
    {
        return $this->belongsTo(Grandeur::class, 'type_mesure');
    }

    public function utilisateur(): BelongsTo
    {
        return $this->belongsTo(Utilisateur::class, 'user_id');
    }

    public function microcontroleur(): BelongsTo
    {
        return $this->belongsTo(Microcontroleur::class);
    }
}
