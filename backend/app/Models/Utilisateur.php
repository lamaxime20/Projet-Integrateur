<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\Alerte;
use App\Models\Instruction;
use App\Models\Log;
use App\Models\Microcontroleur;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class Utilisateur extends Authenticatable
{
    use HasFactory, Notifiable;

    protected $table = 'utilisateurs';
    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'email',
        'nom',
        'prenom',
        'password',
        'role',
        'status',
    ];

    protected $hidden = [
        'password',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function alertes()
    {
        return $this->hasMany(Alerte::class, 'user_id');
    }

    public function microcontroleurs()
    {
        return $this->hasMany(Microcontroleur::class, 'user_id');
    }

    public function seuils()
    {
        return $this->hasMany(Seuil::class, 'user_id');
    }

    public function instructions()
    {
        return $this->hasMany(Instruction::class, 'user_id');
    }

    public function logs()
    {
        return $this->belongsToMany(Log::class, 'consultation_logs', 'user_id', 'log_id');
    }
}
