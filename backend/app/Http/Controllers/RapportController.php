<?php

namespace App\Http\Controllers;

use App\Models\Actionneur;
use App\Models\Capteur;
use App\Models\Grandeur;
use App\Models\Microcontroleur;
use App\Models\Session;
use App\Models\Utilisateur;
use App\Support\ApiTokenManager;
use Carbon\Carbon;
use Illuminate\Http\Request;

class RapportController extends Controller
{
    private const CAPTEURS = [
        'temperature' => "Température de l'air",
        'humidite-sol' => 'Humidité du sol',
        'luminosite' => 'Luminosité',
        'co2' => "Qualité de l'air",
        'niveau-eau' => "Niveau d'eau",
    ];

    private const ACTIONNEURS = [
        'ventilateur' => 'ventilateur',
        'pompe' => 'pompe',
        'ampoule' => 'ampoule',
        'servo-moteur' => 'servo',
        'porte' => 'servo',
    ];

    public function __construct(private ApiTokenManager $tokenManager) {}

    public function microcontroleur(Request $request)
    {
        $micro = $this->resolverMicrocontroleurAutorise($request);
        if (!$micro) return response()->json(['message' => 'Microcontrôleur introuvable.'], 404);
        if ($request->input('format') === 'pdf') return $this->pdfNonDisponible();

        $lignes = [['Date', 'État', 'Début', 'Fin', 'Durée']];
        foreach ($this->filtrerPeriodes($micro->historiquesEtats()->orderBy('date_debut_etat')->get(), $request) as $periode) {
            $lignes[] = $this->lignePeriode($periode);
        }

        return $this->csv($lignes, 'rapport_microcontroleur.csv');
    }

    public function capteur(Request $request, string $capteur)
    {
        $modele = $this->resolverCapteur($request, $capteur);
        if (!$modele) return response()->json(['message' => 'Capteur introuvable.'], 404);
        if ($request->input('format') === 'pdf') return $this->pdfNonDisponible();

        $lignes = [['Date', 'État', 'Début', 'Fin', 'Durée']];
        foreach ($this->filtrerPeriodes($modele->historiquesEtats()->orderBy('date_debut_etat')->get(), $request) as $periode) {
            $lignes[] = $this->lignePeriode($periode);
        }

        return $this->csv($lignes, "rapport_{$capteur}.csv");
    }

    public function actionneur(Request $request, string $actionneur)
    {
        $modele = $this->resolverActionneur($request, $actionneur);
        if (!$modele) return response()->json(['message' => 'Actionneur introuvable.'], 404);
        if ($request->input('format') === 'pdf') return $this->pdfNonDisponible();

        $lignes = [['Date', 'État', 'Début', 'Fin', 'Durée']];
        foreach ($this->filtrerPeriodes($modele->historiquesEtats()->orderBy('date_debut_etat')->get(), $request) as $periode) {
            $lignes[] = $this->lignePeriode($periode);
        }

        return $this->csv($lignes, "rapport_{$actionneur}.csv");
    }

    public function instructions(Request $request, string $actionneur)
    {
        $modele = $this->resolverActionneur($request, $actionneur);
        if (!$modele) return response()->json(['message' => 'Actionneur introuvable.'], 404);
        if ($request->input('format') === 'pdf') return $this->pdfNonDisponible();

        $debut = Carbon::parse($request->input('date_debut', now()->subDays(7)->toDateString()))->startOfDay();
        $fin = Carbon::parse($request->input('date_fin', now()->toDateString()))->endOfDay();

        $lignes = [['ID', 'Date de la demande', 'Action', 'Durée', 'Statut']];
        foreach ($modele->instructions()->whereBetween('date_arrivee', [$debut, $fin])->orderBy('date_arrivee')->get() as $instruction) {
            $lignes[] = [
                $instruction->id,
                $instruction->date_arrivee?->format('Y-m-d H:i'),
                $instruction->action,
                $instruction->duree !== null ? round($instruction->duree / 60) . 'min' : '',
                $instruction->statut,
            ];
        }

        return $this->csv($lignes, "rapport_instructions_{$actionneur}.csv");
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

        return $micro->actionneurs()
            ->whereRaw('LOWER(modele) LIKE ?', ['%' . self::ACTIONNEURS[$slug] . '%'])
            ->first();
    }

    private function resolverCapteur(Request $request, string $slug): ?Capteur
    {
        $micro = $this->resolverMicrocontroleurAutorise($request);
        if (!$micro || !isset(self::CAPTEURS[$slug])) return null;

        $grandeur = Grandeur::where('name', self::CAPTEURS[$slug])->first();
        if (!$grandeur) return null;

        return $micro->capteurs()->where('type_mesure', $grandeur->id)->first();
    }

    private function filtrerPeriodes($lignes, Request $request): array
    {
        $debutFiltre = Carbon::parse($request->input('date_debut', now()->subDays(7)->toDateString()))->startOfDay();
        $finFiltre = Carbon::parse($request->input('date_fin', now()->toDateString()))->endOfDay();
        $etats = $request->input('etats', []);
        $periodes = [];
        $lignes = $lignes->values();

        foreach ($lignes as $index => $ligne) {
            $debut = Carbon::parse($ligne->date_debut_etat);
            $fin = isset($lignes[$index + 1]) ? Carbon::parse($lignes[$index + 1]->date_debut_etat) : now();
            $etat = $this->etatFrontend($ligne->etat);

            if ($etats && !in_array($etat, $etats, true)) continue;
            if ($fin->lt($debutFiltre) || $debut->gt($finFiltre)) continue;

            $periodes[] = [
                'etat' => $etat,
                'debut' => $debut->greaterThan($debutFiltre) ? $debut : $debutFiltre,
                'fin' => $fin->lessThan($finFiltre) ? $fin : $finFiltre,
            ];
        }

        return $periodes;
    }

    private function lignePeriode(array $periode): array
    {
        return [
            $periode['debut']->format('Y-m-d'),
            $periode['etat'],
            $periode['debut']->format('H:i'),
            $periode['fin']->format('H:i'),
            $periode['debut']->diffInMinutes($periode['fin']) . 'min',
        ];
    }

    private function etatFrontend(?string $etat): string
    {
        return match ($etat) {
            'actif', 'running' => 'running',
            'defaillant' => 'defaillant',
            default => 'stopped',
        };
    }

    private function csv(array $lignes, string $nomFichier)
    {
        $contenu = "\xEF\xBB\xBF" . collect($lignes)
            ->map(fn ($ligne) => collect($ligne)->map(fn ($cellule) => '"' . str_replace('"', '""', (string) $cellule) . '"')->implode(';'))
            ->implode("\n");

        return response($contenu, 200, [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => 'attachment; filename="' . $nomFichier . '"',
        ]);
    }

    private function pdfNonDisponible()
    {
        return response()->json(['message' => 'La génération PDF n’est pas encore disponible côté backend.'], 501);
    }
}
