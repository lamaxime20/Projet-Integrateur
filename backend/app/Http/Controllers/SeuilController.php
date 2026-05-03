<?php

namespace App\Http\Controllers;

use App\Models\Grandeur;
use App\Models\Microcontroleur;
use App\Models\Seuil;
use App\Models\Session;
use App\Models\Utilisateur;
use App\Support\ApiTokenManager;
use Illuminate\Http\Request;

class SeuilController extends Controller
{
    public function __construct(private ApiTokenManager $tokenManager) {}

    private function resolverUtilisateur(Request $request): ?Utilisateur
    {
        $tokenId = $this->tokenManager->avoirTokenIdPur($request->cookie('auth_token') ?? '');
        if (!$tokenId) return null;

        $token = Session::find($tokenId);
        if (!$token) return null;

        return Utilisateur::find($token->user_id);
    }

    private function resolverMicrocontroleur(Utilisateur $user, Request $request): ?Microcontroleur
    {
        $nom = $request->query('microcontroleur');

        $query = Microcontroleur::where('user_id', $user->id);

        if ($nom) {
            $query->where('nom', $nom);
        }

        return $query->first();
    }

    private function obtenirSeuil(Microcontroleur $micro, string $nomGrandeur): ?Seuil
    {
        $grandeur = Grandeur::where('name', $nomGrandeur)->first();
        if (!$grandeur) return null;

        return Seuil::where('microcontroleur_id', $micro->id)
            ->where('type_mesure', $grandeur->id)
            ->first();
    }

    public function temperature(Request $request)
    {
        $user = $this->resolverUtilisateur($request);
        if (!$user) return response()->json(['message' => 'Non autorisé.'], 401);

        $micro = $this->resolverMicrocontroleur($user, $request);
        if (!$micro) return response()->json(['message' => 'Microcontrôleur introuvable.'], 404);

        $seuil = $this->obtenirSeuil($micro, "Température de l'air");

        return response()->json([
            'temperature_min' => $seuil?->valeur_min ?? 18.0,
            'temperature_max' => $seuil?->valeur_max ?? 35.0,
        ]);
    }

    public function pompe(Request $request)
    {
        $user = $this->resolverUtilisateur($request);
        if (!$user) return response()->json(['message' => 'Non autorisé.'], 401);

        $micro = $this->resolverMicrocontroleur($user, $request);
        if (!$micro) return response()->json(['message' => 'Microcontrôleur introuvable.'], 404);

        $seuil = $this->obtenirSeuil($micro, 'Humidité du sol');

        return response()->json([
            'humidite_sol_min' => $seuil?->valeur_min ?? 30.0,
            'humidite_sol_max' => $seuil?->valeur_max ?? 70.0,
        ]);
    }

    public function luminosite(Request $request)
    {
        $user = $this->resolverUtilisateur($request);
        if (!$user) return response()->json(['message' => 'Non autorisé.'], 401);

        $micro = $this->resolverMicrocontroleur($user, $request);
        if (!$micro) return response()->json(['message' => 'Microcontrôleur introuvable.'], 404);

        $seuil = $this->obtenirSeuil($micro, 'Luminosité');

        return response()->json([
            'luminosite_min' => $seuil?->valeur_min ?? 20.0,
            'luminosite_max' => $seuil?->valeur_max ?? 80.0,
        ]);
    }

    public function co2(Request $request)
    {
        $user = $this->resolverUtilisateur($request);
        if (!$user) return response()->json(['message' => 'Non autorisé.'], 401);

        $micro = $this->resolverMicrocontroleur($user, $request);
        if (!$micro) return response()->json(['message' => 'Microcontrôleur introuvable.'], 404);

        $seuil = $this->obtenirSeuil($micro, "Qualité de l'air");

        return response()->json([
            'co2_min' => $seuil?->valeur_min ?? 20.0,
            'co2_max' => $seuil?->valeur_max ?? 70.0,
        ]);
    }
}
