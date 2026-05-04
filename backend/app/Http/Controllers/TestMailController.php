<?php

namespace App\Http\Controllers;

use App\Mail\AlerteIoTMail;
use App\Mail\SignupVerificationMail;
use App\Services\MailService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TestMailController extends Controller
{
    public function __construct(private MailService $mailer) {}

    /**
     * GET /api/test-email?to=email@example.com&type=verification|alerte
     * Envoie un email de test pour valider l'intégration Brevo API.
     */
    public function send(Request $request): JsonResponse
    {
        $request->validate([
            'to'   => 'required|email',
            'type' => 'sometimes|string|in:verification,alerte',
        ]);

        $to   = $request->query('to');
        $type = $request->query('type', 'verification');

        $mailable = match ($type) {
            'alerte' => new AlerteIoTMail(
                prenom:   'Utilisateur Test',
                grandeur: "Température de l'air",
                valeur:   38.5,
                unite:    '°C',
                seuilMin: 15.0,
                seuilMax: 35.0,
                deviceId: 'esp32_test',
            ),
            default => new SignupVerificationMail(
                prenom: 'Utilisateur Test',
                code:   '123456',
            ),
        };

        $succes = $this->mailer->send($to, $mailable);

        return response()->json([
            'success' => $succes,
            'message' => $succes
                ? "Email de type '{$type}' envoyé à {$to} via Brevo API."
                : "Échec de l'envoi. Consultez storage/logs/laravel.log.",
            'transport' => config('mail.default'),
        ], $succes ? 200 : 500);
    }
}
