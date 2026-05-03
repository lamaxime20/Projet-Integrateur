<?php

namespace App\Http\Controllers;

use App\Models\Actionneur;
use App\Models\Capteur;
use App\Models\Donnee;
use App\Models\Grandeur;
use App\Models\Instruction;
use App\Models\Microcontroleur;
use App\Models\Session;
use App\Models\Utilisateur;
use App\Support\ApiTokenManager;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class RealtimeDataController extends Controller
{
    private const CAPTEURS = [
        'temperature' => ["Température de l'air", 'temperature', '°C'],
        'humidite-sol' => ['Humidité du sol', 'humidite_sol', '%'],
        'luminosite' => ['Luminosité', 'luminosite', '%'],
        'co2' => ["Qualité de l'air", 'co2', 'ppm'],
        'niveau-eau' => ["Niveau d'eau", 'niveau_eau', 'digital'],
    ];

    private const ACTIONNEURS = [
        'ventilateur' => ['ventilateur', 'ventilateur'],
        'pompe' => ['pompe', 'pompe'],
        'ampoule' => ['ampoule', 'ampoule'],
        'servo-moteur' => ['servo', 'servoMoteur'],
        'porte' => ['servo', 'servoMoteur'],
    ];

    public function __construct(private ApiTokenManager $tokenManager) {}

    public function microcontroleurEtat(Request $request)
    {
        $micro = $this->resolverMicrocontroleurAutorise($request);
        if (!$micro) return $this->introuvable();

        return response()->json([
            'etat' => $micro->allume ? 'running' : 'stopped',
            'allume' => $micro->allume,
            'last_connexion' => $micro->last_connexion?->toIso8601String(),
        ]);
    }

    public function microcontroleurHistorique(Request $request)
    {
        $micro = $this->resolverMicrocontroleurAutorise($request);
        if (!$micro) return $this->introuvable();

        return response()->json($this->historiqueDepuisDebuts(
            $micro->historiquesEtats()->orderBy('date_debut_etat')->get(),
            $this->debutFenetre($request),
            fn () => $micro->allume ? 'actif' : 'inactif'
        ));
    }

    public function actionneurEtat(Request $request, string $actionneur)
    {
        $modele = $this->resolverActionneur($request, $actionneur);
        if (!$modele) return response()->json(['message' => 'Actionneur introuvable.'], 404);

        return response()->json([
            'etat' => $this->etatFrontend($modele->etat),
            'last_seen' => $modele->last_seen?->toIso8601String(),
        ]);
    }

    public function actionneurHistorique(Request $request, string $actionneur)
    {
        $modele = $this->resolverActionneur($request, $actionneur);
        if (!$modele) return response()->json(['message' => 'Actionneur introuvable.'], 404);

        return response()->json($this->historiqueDepuisDebuts(
            $modele->historiquesEtats()->orderBy('date_debut_etat')->get(),
            $this->debutFenetre($request),
            fn () => $modele->etat
        ));
    }

    public function actionneursTempsActivation(Request $request)
    {
        $micro = $this->resolverMicrocontroleurAutorise($request);
        if (!$micro) return $this->introuvable();

        $debut = $this->debutPeriode($request, 7);
        $resultat = [
            'ventilateur' => 0,
            'pompe' => 0,
            'ampoule' => 0,
            'servoMoteur' => 0,
        ];

        foreach (self::ACTIONNEURS as $slug => [$fragment, $cle]) {
            if ($slug === 'porte') continue;
            $actionneur = $this->trouverActionneur($micro, $fragment);
            if (!$actionneur) continue;

            $minutes = collect($this->historiqueDepuisDebuts(
                $actionneur->historiquesEtats()->orderBy('date_debut_etat')->get(),
                $debut,
                fn () => $actionneur->etat
            ))->where('etat', 'running')->sum(function ($periode) {
                return Carbon::parse($periode['debut'])->diffInMinutes(Carbon::parse($periode['fin']));
            });

            $resultat[$cle] = (int) $minutes;
        }

        return response()->json($resultat);
    }

    public function actionneurInstructions(Request $request, string $actionneur)
    {
        $modele = $this->resolverActionneur($request, $actionneur);
        if (!$modele) return response()->json(['message' => 'Actionneur introuvable.'], 404);

        return response()->json($modele->instructions()
            ->orderByDesc('date_arrivee')
            ->get(['id', 'action', 'duree', 'statut', 'date_arrivee'])
            ->map(fn ($instruction) => [
                'id' => $instruction->id,
                'action' => $instruction->action,
                'duree' => $instruction->duree !== null ? (int) round($instruction->duree / 60) : null,
                'statut' => $this->statutFrontend($instruction->statut),
                'date_arrivee' => $instruction->date_arrivee?->toIso8601String(),
                'actionneur' => $actionneur,
            ]));
    }

    public function actionneurGrandeurs(Request $request, string $actionneur)
    {
        $micro = $this->resolverMicrocontroleurAutorise($request);
        if (!$micro) return $this->introuvable();

        $grandeurs = match ($actionneur) {
            'ventilateur' => ['temperature', 'humidite-air'],
            'pompe' => ['humidite-sol', 'niveau-eau'],
            'ampoule' => ['luminosite'],
            'servo-moteur', 'porte' => ['co2'],
            default => [],
        };

        $data = [];
        foreach ($grandeurs as $capteur) {
            $capteurModele = $this->trouverCapteur($micro, $capteur);
            if (!$capteurModele) continue;
            $dernier = $capteurModele->donnees()->orderByDesc('date_arrivee')->first();
            $cle = $capteur === 'humidite-air' ? 'humidite_air' : (self::CAPTEURS[$capteur][1] ?? $capteur);
            $data[$cle] = $this->valeurCapteur($capteur, $dernier?->valeur);
        }

        return response()->json($data);
    }

    public function creerInstruction(Request $request)
    {
        $request->validate([
            'actionneur' => 'nullable|string',
            'actionneur_id' => 'nullable|uuid',
            'action' => 'required|string',
            'duree_minutes' => 'nullable|integer|min:1',
        ]);

        $user = $this->resolverUtilisateur($request);
        if (!$user) return response()->json(['message' => 'Non autorisé.'], 401);

        $actionneur = $request->input('actionneur_id')
            ? Actionneur::find($request->input('actionneur_id'))
            : $this->resolverActionneur($request, $request->input('actionneur', ''));

        if (!$actionneur) return response()->json(['message' => 'Actionneur introuvable.'], 404);
        if ($actionneur->microcontroleur?->user_id !== $user->id) {
            return response()->json(['message' => 'Actionneur introuvable.'], 404);
        }

        $instruction = Instruction::create([
            'action' => $request->input('action'),
            'duree' => ((int) $request->input('duree_minutes', 0)) * 60,
            'statut' => 'en_attente',
            'date_arrivee' => now(),
            'user_id' => $user->id,
            'actionneur_id' => $actionneur->id,
        ]);

        return response()->json([
            'id' => $instruction->id,
            'action' => $instruction->action,
            'duree' => $instruction->duree,
            'statut' => $instruction->statut,
            'date_arrivee' => $instruction->date_arrivee?->toIso8601String(),
            'actionneur_id' => $instruction->actionneur_id,
        ], 201);
    }

    public function capteurEtat(Request $request, string $capteur)
    {
        $modele = $this->resolverCapteur($request, $capteur);
        if (!$modele) return response()->json(['message' => 'Capteur introuvable.'], 404);

        return response()->json([
            'etat' => $this->etatFrontend($modele->etat),
            'last_seen' => $modele->last_seen?->toIso8601String(),
        ]);
    }

    public function capteurValeurActuelle(Request $request, string $capteur)
    {
        $modele = $this->resolverCapteur($request, $capteur);
        if (!$modele || !isset(self::CAPTEURS[$capteur])) {
            return response()->json(['message' => 'Capteur introuvable.'], 404);
        }

        $dernier = $modele->donnees()->orderByDesc('date_arrivee')->first();
        $cle = self::CAPTEURS[$capteur][1];

        return response()->json([
            $cle => $this->valeurCapteur($capteur, $dernier?->valeur),
            'date_arrivee' => $dernier?->date_arrivee?->toIso8601String(),
        ]);
    }

    public function capteurHistorique(Request $request, string $capteur)
    {
        $modele = $this->resolverCapteur($request, $capteur);
        if (!$modele) return response()->json(['message' => 'Capteur introuvable.'], 404);

        return response()->json($this->historiqueDepuisDebuts(
            $modele->historiquesEtats()->orderBy('date_debut_etat')->get(),
            $this->debutFenetre($request),
            fn () => $modele->etat
        ));
    }

    public function capteurStats(Request $request, string $capteur)
    {
        $modele = $this->resolverCapteur($request, $capteur);
        if (!$modele || !isset(self::CAPTEURS[$capteur])) {
            return response()->json(['message' => 'Capteur introuvable.'], 404);
        }

        $debut = $this->debutPeriode($request, 7);
        $stats = $modele->donnees()
            ->where('date_arrivee', '>=', $debut)
            ->selectRaw('MAX(valeur) as max, MIN(valeur) as min, AVG(valeur) as moy')
            ->first();

        return response()->json([
            'max' => $stats?->max !== null ? (float) $stats->max : null,
            'min' => $stats?->min !== null ? (float) $stats->min : null,
            'moy' => $stats?->moy !== null ? round((float) $stats->moy, 1) : null,
            'unite' => self::CAPTEURS[$capteur][2],
        ]);
    }

    public function capteursMoyennes(Request $request)
    {
        $micro = $this->resolverMicrocontroleurAutorise($request);
        if (!$micro) return $this->introuvable();

        $debut = $this->debutPeriode($request, 7);
        $resultat = [
            'temperature' => ['valeur' => 0, 'unite' => '°C'],
            'humiditeSol' => ['valeur' => 0, 'unite' => '%'],
            'luminosite' => ['valeur' => 0, 'unite' => '%'],
            'co2' => ['valeur' => 0, 'unite' => 'ppm'],
        ];

        foreach (['temperature', 'humidite-sol', 'luminosite', 'co2'] as $slug) {
            $capteur = $this->trouverCapteur($micro, $slug);
            if (!$capteur) continue;
            $moyenne = $capteur->donnees()->where('date_arrivee', '>=', $debut)->avg('valeur');
            $cle = $slug === 'humidite-sol' ? 'humiditeSol' : $slug;
            $resultat[$cle]['valeur'] = $moyenne !== null ? round((float) $moyenne, 1) : 0;
        }

        return response()->json($resultat);
    }

    private function resolverUtilisateur(Request $request): ?Utilisateur
    {
        $tokenId = $this->tokenManager->avoirTokenIdPur($request->cookie('auth_token') ?? '');
        return $tokenId ? Utilisateur::find(Session::find($tokenId)?->user_id) : null;
    }

    private function resolverMicrocontroleurAutorise(Request $request): ?Microcontroleur
    {
        $user = $this->resolverUtilisateur($request);
        if (!$user) return null;

        $query = Microcontroleur::where('user_id', $user->id);
        if ($request->query('microcontroleur')) {
            $query->where('nom', $request->query('microcontroleur'));
        }

        return $query->first();
    }

    private function resolverActionneur(Request $request, string $slug): ?Actionneur
    {
        $micro = $this->resolverMicrocontroleurAutorise($request);
        if (!$micro || !isset(self::ACTIONNEURS[$slug])) return null;

        return $this->trouverActionneur($micro, self::ACTIONNEURS[$slug][0]);
    }

    private function resolverCapteur(Request $request, string $slug): ?Capteur
    {
        $micro = $this->resolverMicrocontroleurAutorise($request);
        return $micro ? $this->trouverCapteur($micro, $slug) : null;
    }

    private function trouverActionneur(Microcontroleur $micro, string $fragment): ?Actionneur
    {
        return $micro->actionneurs()
            ->whereRaw('LOWER(modele) LIKE ?', ['%' . strtolower($fragment) . '%'])
            ->first();
    }

    private function trouverCapteur(Microcontroleur $micro, string $slug): ?Capteur
    {
        $nom = $slug === 'humidite-air'
            ? "Humidité de l'air"
            : (self::CAPTEURS[$slug][0] ?? null);

        if (!$nom) return null;

        $grandeur = Grandeur::where('name', $nom)->first();
        if (!$grandeur) return null;

        return $micro->capteurs()->where('type_mesure', $grandeur->id)->first();
    }

    private function historiqueDepuisDebuts(Collection $lignes, Carbon $debutFenetre, callable $etatCourant): array
    {
        if ($lignes->isEmpty()) {
            return [[
                'etat' => $this->etatFrontend($etatCourant()),
                'debut' => $debutFenetre->toIso8601String(),
                'fin' => now()->toIso8601String(),
            ]];
        }

        $periodes = [];
        $lignes = $lignes->values();

        foreach ($lignes as $index => $ligne) {
            $debut = Carbon::parse($ligne->date_debut_etat);
            $fin = isset($lignes[$index + 1])
                ? Carbon::parse($lignes[$index + 1]->date_debut_etat)
                : now();

            if ($fin->lessThanOrEqualTo($debutFenetre)) continue;

            $periodes[] = [
                'etat' => $this->etatFrontend($ligne->etat),
                'debut' => $debut->greaterThan($debutFenetre) ? $debut->toIso8601String() : $debutFenetre->toIso8601String(),
                'fin' => $fin->toIso8601String(),
            ];
        }

        return $periodes;
    }

    private function etatFrontend(?string $etat): string
    {
        return match ($etat) {
            'actif', 'running' => 'running',
            'defaillant' => 'defaillant',
            default => 'stopped',
        };
    }

    private function statutFrontend(?string $statut): string
    {
        return match ($statut) {
            'executee' => 'termine',
            'echouee' => 'annule',
            default => $statut ?? 'en_attente',
        };
    }

    private function valeurCapteur(string $capteur, mixed $valeur): mixed
    {
        if ($capteur === 'niveau-eau') {
            return ((float) ($valeur ?? 0)) > 0 ? 'OK' : 'Bas';
        }

        return $valeur !== null ? (float) $valeur : 0;
    }

    private function debutFenetre(Request $request): Carbon
    {
        return now()->subHours((int) str_replace('h', '', $request->query('fenetre', '12h')));
    }

    private function debutPeriode(Request $request, int $joursParDefaut): Carbon
    {
        return now()->subDays((int) str_replace('j', '', $request->query('periode', "{$joursParDefaut}j")));
    }

    private function introuvable()
    {
        return response()->json(['message' => 'Microcontrôleur introuvable.'], 404);
    }
}
