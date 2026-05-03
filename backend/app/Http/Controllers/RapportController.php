<?php

namespace App\Http\Controllers;

use App\Models\Actionneur;
use App\Models\Capteur;
use App\Models\Grandeur;
use App\Models\Microcontroleur;
use App\Models\Session;
use App\Models\Utilisateur;
use App\Support\ApiTokenManager;
use App\Support\SimplePdf;
use Carbon\Carbon;
use Illuminate\Http\Request;

class RapportController extends Controller
{
    private const CAPTEURS = [
        'temperature' => ["Température de l'air", 'temperature', '°C'],
        'humidite-sol' => ['Humidité du sol', 'humidite_sol', '%'],
        'luminosite' => ['Luminosité', 'luminosite', '%'],
        'co2' => ["Qualité de l'air", 'co2', 'ppm'],
        'niveau-eau' => ["Niveau d'eau", 'niveau_eau', 'digital'],
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

        $lignes = [['Date', 'État', 'Début', 'Fin', 'Durée']];
        $periodes = $this->filtrerPeriodes($micro->historiquesEtats()->orderBy('date_debut_etat')->get(), $request);
        foreach ($periodes as $periode) {
            $lignes[] = $this->lignePeriode($periode);
        }

        if ($request->input('format') === 'pdf') {
            return $this->pdfTimeline('Rapport microcontrôleur', 'États du microcontrôleur', $periodes, $lignes, 'rapport_microcontroleur.pdf');
        }

        return $this->csv($lignes, 'rapport_microcontroleur.csv');
    }

    public function capteur(Request $request, string $capteur)
    {
        $modele = $this->resolverCapteur($request, $capteur);
        if (!$modele) return response()->json(['message' => 'Capteur introuvable.'], 404);

        $lignes = [['Date', 'État', 'Début', 'Fin', 'Durée']];
        $periodes = $this->filtrerPeriodes($modele->historiquesEtats()->orderBy('date_debut_etat')->get(), $request);
        foreach ($periodes as $periode) {
            $lignes[] = $this->lignePeriode($periode);
        }

        if ($request->input('format') === 'pdf') {
            return $this->pdfTimeline("Rapport {$capteur}", 'Historique des états du capteur', $periodes, $lignes, "rapport_{$capteur}.pdf");
        }

        return $this->csv($lignes, "rapport_{$capteur}.csv");
    }

    public function mesuresCapteur(Request $request, string $capteur)
    {
        $modele = $this->resolverCapteur($request, $capteur);
        if (!$modele || !isset(self::CAPTEURS[$capteur])) {
            return response()->json(['message' => 'Capteur introuvable.'], 404);
        }

        $points = $this->pointsMesures($modele, $request);
        $unite = self::CAPTEURS[$capteur][2];
        $lignes = [['Date', 'Heure', 'Valeur', 'Unité']];

        foreach ($points as $point) {
            $date = Carbon::parse($point['date_arrivee']);
            $lignes[] = [
                $date->format('Y-m-d'),
                $date->format('H:i:s'),
                $point['valeur'],
                $unite,
            ];
        }

        if ($request->input('format') === 'pdf') {
            return $this->pdfCourbe(
                "Rapport mesures {$capteur}",
                'Valeurs mesurées en fonction du temps',
                $points,
                self::CAPTEURS[$capteur][0],
                $unite === 'digital' ? '' : $unite,
                $lignes,
                "rapport_mesures_{$capteur}.pdf"
            );
        }

        return $this->csv($lignes, "rapport_mesures_{$capteur}.csv");
    }

    public function actionneur(Request $request, string $actionneur)
    {
        $modele = $this->resolverActionneur($request, $actionneur);
        if (!$modele) return response()->json(['message' => 'Actionneur introuvable.'], 404);

        $lignes = [['Date', 'État', 'Début', 'Fin', 'Durée']];
        $periodes = $this->filtrerPeriodes($modele->historiquesEtats()->orderBy('date_debut_etat')->get(), $request);
        foreach ($periodes as $periode) {
            $lignes[] = $this->lignePeriode($periode);
        }

        if ($request->input('format') === 'pdf') {
            return $this->pdfTimeline("Rapport {$actionneur}", "Historique des états de l'actionneur", $periodes, $lignes, "rapport_{$actionneur}.pdf");
        }

        return $this->csv($lignes, "rapport_{$actionneur}.csv");
    }

    public function instructions(Request $request, string $actionneur)
    {
        $modele = $this->resolverActionneur($request, $actionneur);
        if (!$modele) return response()->json(['message' => 'Actionneur introuvable.'], 404);

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

        if ($request->input('format') === 'pdf') {
            return $this->pdfTable("Rapport instructions {$actionneur}", 'Instructions envoyées à l’actionneur', $lignes, "rapport_instructions_{$actionneur}.pdf");
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

        $grandeur = Grandeur::where('name', self::CAPTEURS[$slug][0])->first();
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

    private function pointsMesures(Capteur $capteur, Request $request): array
    {
        $debut = Carbon::parse($request->input('date_debut', now()->subDays(7)->toDateString()))->startOfDay();
        $fin = Carbon::parse($request->input('date_fin', now()->toDateString()))->endOfDay();

        return $capteur->donnees()
            ->whereBetween('date_arrivee', [$debut, $fin])
            ->orderBy('date_arrivee')
            ->get(['valeur', 'date_arrivee'])
            ->map(fn ($donnee) => [
                'valeur' => (float) $donnee->valeur,
                'date_arrivee' => $donnee->date_arrivee?->toIso8601String(),
            ])
            ->all();
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

    private function pdfTimeline(string $titre, string $sousTitre, array $periodes, array $lignes, string $nomFichier)
    {
        $pdf = new SimplePdf($titre, $sousTitre);
        $pdf->drawTimeline($periodes, 'Graphe des états');
        $pdf->table($lignes[0] ?? [], array_slice($lignes, 1), 54, 430);

        return $this->pdfResponse($pdf, $nomFichier);
    }

    private function pdfCourbe(string $titre, string $sousTitre, array $points, string $label, string $unite, array $lignes, string $nomFichier)
    {
        $pdf = new SimplePdf($titre, $sousTitre);
        $pdf->drawLineChart($points, $label, $unite);
        $pdf->table($lignes[0] ?? [], array_slice($lignes, 1), 54, 390);

        return $this->pdfResponse($pdf, $nomFichier);
    }

    private function pdfTable(string $titre, string $sousTitre, array $lignes, string $nomFichier)
    {
        $pdf = new SimplePdf($titre, $sousTitre);
        $pdf->table($lignes[0] ?? [], array_slice($lignes, 1), 54, 650, 36);

        return $this->pdfResponse($pdf, $nomFichier);
    }

    private function pdfResponse(SimplePdf $pdf, string $nomFichier)
    {
        return response($pdf->output(), 200, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => 'attachment; filename="' . $nomFichier . '"',
        ]);
    }
}
