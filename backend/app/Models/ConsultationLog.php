<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ConsultationLog extends Model
{
    protected $table = 'consultation_logs';
    public $timestamps = false;

    protected $fillable = [
        'user_id',
        'log_id',
    ];

    public function utilisateur(): BelongsTo
    {
        return $this->belongsTo(Utilisateur::class, 'user_id');
    }

    public function log(): BelongsTo
    {
        return $this->belongsTo(Log::class, 'log_id');
    }
}
