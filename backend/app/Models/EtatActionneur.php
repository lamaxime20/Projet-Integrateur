<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EtatActionneur extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'etats_actionneurs';
    protected $keyType = 'string';
    public $incrementing = false;
    public $timestamps = false;

    protected $fillable = [
        'etat',
        'date_debut_etat',
        'actionneur_id',
    ];

    protected $casts = [
        'date_debut_etat' => 'datetime',
    ];

    public function actionneur(): BelongsTo
    {
        return $this->belongsTo(Actionneur::class);
    }
}
