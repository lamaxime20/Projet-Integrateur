<?php

namespace App\Http\Controllers;

use App\Models\Alerte;
use App\Models\Session;
use App\Models\Utilisateur;
use App\Support\ApiTokenManager;
use Illuminate\Http\Request;

class AlerteController extends Controller
{
    public function __construct(private ApiTokenManager $tokenManager) {}

    public function liste(Request $request)
    {
        $user = $this->resolverUtilisateur($request);
        if (!$user) return response()->json(['message' => 'Non autorisé.'], 401);

        $query = Alerte::where('user_id', $user->id)
            ->orderBy('vu')
            ->orderByDesc('date_arrivee');

        if ($request->query('filtre') === 'lues') {
            $query->where('vu', true);
        }

        if ($request->query('filtre') === 'non-lues') {
            $query->where('vu', false);
        }

        return response()->json([
            'notifications' => $query->get()->map(fn (Alerte $alerte) => $this->formatAlerte($alerte)),
            'compteurs' => [
                'toutes' => Alerte::where('user_id', $user->id)->count(),
                'lues' => Alerte::where('user_id', $user->id)->where('vu', true)->count(),
                'non_lues' => Alerte::where('user_id', $user->id)->where('vu', false)->count(),
            ],
        ]);
    }

    public function marquerCommeLue(Request $request, string $id)
    {
        return $this->changerEtatLecture($request, [$id], true);
    }

    public function marquerToutesCommeLues(Request $request)
    {
        $user = $this->resolverUtilisateur($request);
        if (!$user) return response()->json(['message' => 'Non autorisé.'], 401);

        Alerte::where('user_id', $user->id)
            ->where('vu', false)
            ->update([
                'vu' => true,
                'date_lu' => now(),
            ]);

        return response()->json(['success' => true]);
    }

    public function actionGroupee(Request $request)
    {
        $request->validate([
            'ids' => 'required|array|min:1',
            'ids.*' => 'uuid',
            'action' => 'required|string|in:marquer_lues,marquer_non_lues,supprimer',
        ]);

        if ($request->input('action') === 'supprimer') {
            return $this->supprimer($request, $request->input('ids'));
        }

        return $this->changerEtatLecture(
            $request,
            $request->input('ids'),
            $request->input('action') === 'marquer_lues'
        );
    }

    private function changerEtatLecture(Request $request, array $ids, bool $vu)
    {
        $user = $this->resolverUtilisateur($request);
        if (!$user) return response()->json(['message' => 'Non autorisé.'], 401);

        Alerte::where('user_id', $user->id)
            ->whereIn('id', $ids)
            ->update([
                'vu' => $vu,
                'date_lu' => $vu ? now() : null,
            ]);

        return response()->json(['success' => true]);
    }

    private function supprimer(Request $request, array $ids)
    {
        $user = $this->resolverUtilisateur($request);
        if (!$user) return response()->json(['message' => 'Non autorisé.'], 401);

        Alerte::where('user_id', $user->id)
            ->whereIn('id', $ids)
            ->delete();

        return response()->json(['success' => true]);
    }

    private function resolverUtilisateur(Request $request): ?Utilisateur
    {
        $tokenId = $this->tokenManager->avoirTokenIdPur($request->cookie('auth_token') ?? '');
        if (!$tokenId) return null;

        $token = Session::find($tokenId);
        if (!$token) return null;

        return Utilisateur::find($token->user_id);
    }

    private function formatAlerte(Alerte $alerte): array
    {
        return [
            'id' => $alerte->id,
            'type' => $alerte->type,
            'message' => $alerte->message,
            'vu' => $alerte->vu,
            'date_arrivee' => $alerte->date_arrivee?->toIso8601String(),
            'date_lu' => $alerte->date_lu?->toIso8601String(),
            'cible_url' => $this->routeDepuisType($alerte->type, $alerte->message),
        ];
    }

    private function routeDepuisType(string $type, string $message): string
    {
        $texte = strtolower($type . ' ' . $message);

        return match (true) {
            str_contains($texte, 'temperature') || str_contains($texte, 'température') => '/application/rapports/temperature',
            str_contains($texte, 'humidite') || str_contains($texte, 'humidité') => '/application/rapports/humidite-sol',
            str_contains($texte, 'luminosite') || str_contains($texte, 'luminosité') => '/application/rapports/luminosité',
            str_contains($texte, 'co2') || str_contains($texte, 'air') => '/application/rapports/co2',
            str_contains($texte, 'eau') => '/application/rapports/niveau-eau',
            str_contains($texte, 'ventilateur') => '/application/rapports/ventilateur',
            str_contains($texte, 'pompe') => '/application/rapports/pompe',
            str_contains($texte, 'ampoule') || str_contains($texte, 'lumiere') || str_contains($texte, 'lumière') => '/application/rapports/ampoule',
            str_contains($texte, 'servo') || str_contains($texte, 'porte') => '/application/rapports/servo-moteur',
            str_contains($texte, 'seuil') => '/application/seuil',
            default => '/application/statistique',
        };
    }
}
