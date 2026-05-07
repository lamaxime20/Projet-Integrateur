<?php

namespace App\Http\Controllers;

use App\Models\Actionneur;
use App\Models\Alerte;
use App\Models\Capteur;
use App\Models\Donnee;
use App\Models\Grandeur;
use App\Models\Instruction;
use App\Models\Microcontroleur;
use App\Models\Session;
use App\Models\Utilisateur;
use App\Support\ApiTokenManager;
use Carbon\Carbon;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    private const CAPTEURS = [
        'temperature' => ["Température de l'air", 'Température', '°C', 'device_thermostat'],
        'humidite_sol' => ['Humidité du sol', 'Humidité du sol', '%', 'water_drop'],
        'co2' => ["Qualité de l'air", 'CO2', 'ppm', 'air'],
        'luminosite' => ['Luminosité', 'Luminosité', 'lux', 'light_mode'],
        'niveau_eau' => ["Niveau d'eau", 'Réservoir', '', 'water'],
    ];

    private const ACTIONNEURS = [
        'pompe' => ['pompe', 'Pompe', 'water_pump'],
        'ventilateur' => ['ventilateur', 'Ventilateur', 'mode_fan'],
        'ampoule' => ['ampoule', 'Éclairage', 'lightbulb'],
        'porte' => ['servo', 'Porte', 'door_open'],
    ];

    public function __construct(private ApiTokenManager $tokenManager) {}

    public function index(Request $request)
    {
        $user = $this->resolverUtilisateur($request);
        if (!$user) return response()->json(['message' => 'Non autorisé.'], 401);

        $micro = $this->resolverMicrocontroleur($user, $request);
        if (!$micro) return response()->json(['message' => 'Microcontrôleur introuvable.'], 404);

        return response()->json([
            'microcontroleur' => [
                'nom' => $micro->nom,
                'allume' => (bool) $micro->allume,
                'etat' => $micro->allume ? 'online' : 'offline',
                'last_connexion' => $micro->last_connexion?->toIso8601String(),
            ],
            'capteurs' => $this->capteurs($micro),
            'niveau_eau' => $this->niveauEau($micro),
            'actionneurs' => $this->actionneurs($micro),
            'analyses' => [
                'mesures_24h' => $this->mesures24h($micro, $request),
                'activite_microcontroleur' => $this->activiteMicrocontroleur($micro),
            ],
            'notifications' => $this->notifications($user),
            'journal' => $this->journal($user, $micro),
            'updated_at' => now()->toIso8601String(),
        ]);
    }

    private function resolverUtilisateur(Request $request): ?Utilisateur
    {
        $tokenId = $this->tokenManager->avoirTokenIdPur($request->cookie('auth_token') ?? '');
        return $tokenId ? Utilisateur::find(Session::find($tokenId)?->user_id) : null;
    }

    private function resolverMicrocontroleur(Utilisateur $user, Request $request): ?Microcontroleur
    {
        $query = Microcontroleur::where('user_id', $user->id);

        if ($request->query('microcontroleur')) {
            $query->where('nom', $request->query('microcontroleur'));
        }

        return $query->first();
    }

    private function capteurs(Microcontroleur $micro): array
    {
        return collect(['temperature', 'humidite_sol', 'co2', 'luminosite'])
            ->map(fn (string $code) => $this->formaterCapteur($micro, $code))
            ->values()
            ->all();
    }

    private function niveauEau(Microcontroleur $micro): array
    {
        $capteur = $this->trouverCapteur($micro, 'niveau_eau');
        $dernier = $capteur?->donnees()->orderByDesc('date_arrivee')->first();
        $valeur = (float) ($dernier?->valeur ?? 0);

        return [
            'code' => 'niveau_eau',
            'nom' => 'Réservoir',
            'etat' => $valeur > 0 ? 'OK' : 'Bas',
            'pourcentage' => $valeur > 0 ? 100 : 18,
            'date_arrivee' => $dernier?->date_arrivee?->toIso8601String(),
        ];
    }

    private function formaterCapteur(Microcontroleur $micro, string $code): array
    {
        $config = self::CAPTEURS[$code];
        $capteur = $this->trouverCapteur($micro, $code);
        $dernier = $capteur?->donnees()->orderByDesc('date_arrivee')->first();
        $valeur = $dernier?->valeur !== null ? round((float) $dernier->valeur, 1) : 0;

        return [
            'code' => $code,
            'nom' => $config[1],
            'valeur' => $valeur,
            'unite' => $config[2],
            'icone' => $config[3],
            'etat' => $this->etatFrontend($capteur?->etat),
            'date_arrivee' => $dernier?->date_arrivee?->toIso8601String(),
        ];
    }

    private function actionneurs(Microcontroleur $micro): array
    {
        return collect(self::ACTIONNEURS)
            ->map(function (array $config, string $code) use ($micro) {
                $actionneur = $this->trouverActionneur($micro, $config[0]);

                return [
                    'code' => $code,
                    'nom' => $config[1],
                    'icone' => $config[2],
                    'etat' => $this->etatFrontend($actionneur?->etat),
                    'last_seen' => $actionneur?->last_seen?->toIso8601String(),
                ];
            })
            ->values()
            ->all();
    }

    private function mesures24h(Microcontroleur $micro, Request $request): array
    {
        $debut = now()->subHours(24);
        $page = max(1, (int) $request->query('mesures_page', 1));
        $parPage = min(48, max(6, (int) $request->query('mesures_par_page', 18)));
        $offset = ($page - 1) * $parPage;
        $series = [];
        $totalMax = 0;

        foreach (['temperature', 'humidite_sol', 'co2', 'luminosite'] as $code) {
            $capteur = $this->trouverCapteur($micro, $code);

            if (!$capteur) {
                $series[$code] = [];
                continue;
            }

            $query = $capteur->donnees()->where('date_arrivee', '>=', $debut);
            $total = (clone $query)->count();
            $totalMax = max($totalMax, $total);

            $points = $query
                ->orderByDesc('date_arrivee')
                ->skip($offset)
                ->take($parPage)
                ->get(['valeur', 'date_arrivee'])
                ->reverse()
                ->values()
                ->map(fn (Donnee $donnee) => [
                    'valeur' => round((float) $donnee->valeur, 1),
                    'date_arrivee' => $donnee->date_arrivee?->toIso8601String(),
                ]);

            $series[$code] = $points;
        }

        return [
            'series' => $series,
            'pagination' => [
                'page' => $page,
                'par_page' => $parPage,
                'total' => $totalMax,
                'total_pages' => max(1, (int) ceil($totalMax / $parPage)),
                'has_previous' => $page > 1,
                'has_next' => ($page * $parPage) < $totalMax,
            ],
        ];
    }

    private function activiteMicrocontroleur(Microcontroleur $micro): array
    {
        $debut = now()->subHours(12);
        $lignes = $micro->historiquesEtats()
            ->where('date_debut_etat', '>=', $debut)
            ->orderBy('date_debut_etat')
            ->get();

        if ($lignes->isEmpty()) {
            return [[
                'etat' => $micro->allume ? 'running' : 'stopped',
                'debut' => $debut->toIso8601String(),
                'fin' => now()->toIso8601String(),
            ]];
        }

        $lignes = $lignes->values();

        return $lignes->map(function ($ligne, int $index) use ($lignes) {
            $fin = isset($lignes[$index + 1])
                ? Carbon::parse($lignes[$index + 1]->date_debut_etat)
                : now();

            return [
                'etat' => $this->etatFrontend($ligne->etat),
                'debut' => $ligne->date_debut_etat?->toIso8601String(),
                'fin' => $fin->toIso8601String(),
            ];
        })->all();
    }

    private function notifications(Utilisateur $user): array
    {
        return Alerte::where('user_id', $user->id)
            ->orderBy('vu')
            ->orderByDesc('date_arrivee')
            ->limit(4)
            ->get()
            ->map(fn (Alerte $alerte) => [
                'id' => $alerte->id,
                'type' => $alerte->type,
                'message' => $alerte->message,
                'vu' => (bool) $alerte->vu,
                'date_arrivee' => $alerte->date_arrivee?->toIso8601String(),
            ])
            ->all();
    }

    private function journal(Utilisateur $user, Microcontroleur $micro): array
    {
        $alertes = Alerte::where('user_id', $user->id)
            ->orderByDesc('date_arrivee')
            ->limit(4)
            ->get()
            ->map(fn (Alerte $alerte) => [
                'type' => 'alerte',
                'titre' => $alerte->type,
                'description' => $alerte->message,
                'date' => $alerte->date_arrivee?->toIso8601String(),
            ]);

        $instructions = Instruction::where('user_id', $user->id)
            ->whereHas('actionneur', fn ($query) => $query->where('microcontroleur_id', $micro->id))
            ->orderByDesc('date_arrivee')
            ->limit(4)
            ->get()
            ->map(fn (Instruction $instruction) => [
                'type' => 'instruction',
                'titre' => ucfirst($instruction->action),
                'description' => "Instruction {$instruction->statut}",
                'date' => $instruction->date_arrivee?->toIso8601String(),
            ]);

        return $alertes->merge($instructions)
            ->sortByDesc('date')
            ->take(6)
            ->values()
            ->all();
    }

    private function trouverCapteur(Microcontroleur $micro, string $code): ?Capteur
    {
        $nomGrandeur = self::CAPTEURS[$code][0] ?? null;
        if (!$nomGrandeur) return null;

        $grandeur = Grandeur::where('name', $nomGrandeur)->first();
        if (!$grandeur) return null;

        return $micro->capteurs()->where('type_mesure', $grandeur->id)->first();
    }

    private function trouverActionneur(Microcontroleur $micro, string $fragment): ?Actionneur
    {
        return $micro->actionneurs()
            ->whereRaw('LOWER(modele) LIKE ?', ['%' . strtolower($fragment) . '%'])
            ->first();
    }

    private function etatFrontend(?string $etat): string
    {
        return match ($etat) {
            'actif', 'running' => 'running',
            'defaillant' => 'defaillant',
            default => 'stopped',
        };
    }
}
