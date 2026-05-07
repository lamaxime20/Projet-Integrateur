<?php

use App\Models\Microcontroleur;
use App\Models\Session;
use App\Models\Utilisateur;
use App\Support\ApiTokenManager;
use Illuminate\Support\Facades\Broadcast;

/*
|--------------------------------------------------------------------------
| Broadcast Channels
|--------------------------------------------------------------------------
|
| capteurs.{nom}  — canal privé d'un microcontrôleur
| alertes.{userId} — canal privé des alertes d'un utilisateur
|
*/

Broadcast::channel('capteurs.{nom}', function ($user, string $nom) {
    return Microcontroleur::where('user_id', $user->id)
        ->where('nom', $nom)
        ->exists();
});

Broadcast::channel('alertes.{userId}', function ($user, string $userId) {
    return (string) $user->id === $userId;
});
