<?php

namespace App\Services;

use Illuminate\Mail\Mailable;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class MailService
{
    /**
     * Envoie un email immédiatement (bloquant).
     * À utiliser pour les emails critiques : vérification, reset mot de passe.
     */
    public function send(string $to, Mailable $mailable): bool
    {
        try {
            Mail::to($to)->send($mailable);
            Log::info('[Mail] Envoyé', ['to' => $to, 'class' => class_basename($mailable)]);
            return true;
        } catch (\Throwable $e) {
            Log::error('[Mail] Échec envoi', [
                'to'    => $to,
                'class' => class_basename($mailable),
                'error' => $e->getMessage(),
            ]);
            return false;
        }
    }

    /**
     * Place l'email en file d'attente (non bloquant).
     * À utiliser pour les alertes IoT et notifications non critiques.
     * Nécessite un worker actif : php artisan queue:work
     */
    public function queue(string $to, Mailable $mailable): bool
    {
        try {
            Mail::to($to)->queue($mailable);
            Log::info('[Mail] Mis en file', ['to' => $to, 'class' => class_basename($mailable)]);
            return true;
        } catch (\Throwable $e) {
            Log::error('[Mail] Échec mise en file', [
                'to'    => $to,
                'class' => class_basename($mailable),
                'error' => $e->getMessage(),
            ]);
            return false;
        }
    }
}
