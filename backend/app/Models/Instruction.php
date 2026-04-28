<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Instruction extends Model
{
    use HasFactory;

    protected $table = 'instructions';
    protected $keyType = 'string';
    public $incrementing = false;
    public $timestamps = false;

    protected $fillable = [
        'action',
        'duree',
        'statut',
        'date_arrivee',
        'user_id',
        'actionneur_id',
    ];

    protected $casts = [
        'date_arrivee' => 'datetime',
    ];

    public function utilisateur(): BelongsTo
    {
        return $this->belongsTo(Utilisateur::class, 'user_id');
    }

    public function actionneur(): BelongsTo
    {
        return $this->belongsTo(Actionneur::class);
    }
}
