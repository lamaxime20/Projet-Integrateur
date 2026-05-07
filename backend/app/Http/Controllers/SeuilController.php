<?php

namespace App\Http\Controllers;

use App\Models\Grandeur;
use App\Models\Microcontroleur;
use App\Models\Seuil;
use App\Models\Session;
use App\Models\Utilisateur;
use App\Support\ApiTokenManager;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SeuilController extends Controller
{
    public function __construct(private ApiTokenManager $tokenManager) {}

    private const SEUILS_CONFIG = [
        "Température de l'air" => [
            'nom' => 'Température',
            'code' => 'temperature',
            'unite' => '°C',
            'icone' => 'fa-solid fa-temperature-half',
            'valeur_min' => 18.0,
            'valeur_max' => 35.0,
        ],
        'Humidité du sol' => [
            'nom' => 'Humidité du sol',
            'code' => 'humidite_sol',
            'unite' => '%',
            'icone' => 'fa-solid fa-droplet',
            'valeur_min' => 30.0,
            'valeur_max' => 70.0,
        ],
        "Qualité de l'air" => [
            'nom' => 'Qualité de l’air',
            'code' => 'co2',
            'unite' => 'ppm',
            'icone' => 'fa-solid fa-wind',
            'valeur_min' => 20.0,
            'valeur_max' => 70.0,
        ],
        'Luminosité' => [
            'nom' => 'Luminosité',
            'code' => 'luminosite',
            'unite' => 'lux',
            'icone' => 'fa-solid fa-sun',
            'valeur_min' => 20.0,
            'valeur_max' => 80.0,
        ],
    ];

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

    private function seuilsPourMicrocontroleur(Microcontroleur $micro, Utilisateur $user)
    {
        return DB::transaction(function () use ($micro, $user) {
            $seuils = collect();

            foreach (self::SEUILS_CONFIG as $nomGrandeur => $config) {
                $grandeur = Grandeur::where('name', $nomGrandeur)->first();
                if (!$grandeur) continue;

                $seuil = Seuil::firstOrCreate(
                    [
                        'microcontroleur_id' => $micro->id,
                        'type_mesure' => $grandeur->id,
                        'user_id' => $user->id,
                    ],
                    [
                        'valeur_min' => $config['valeur_min'],
                        'valeur_max' => $config['valeur_max'],
                        'updated_at' => Carbon::now(),
                    ]
                );

                $seuils->push($this->formaterSeuil($seuil, $config, $grandeur));
            }

            return $seuils->values();
        });
    }

    private function formaterSeuil(Seuil $seuil, array $config, Grandeur $grandeur): array
    {
        return [
            'id' => $seuil->id,
            'type_mesure' => $grandeur->id,
            'nom' => $config['nom'],
            'code' => $config['code'],
            'unite' => $config['unite'],
            'icone' => $config['icone'],
            'valeur_min' => (float) $seuil->valeur_min,
            'valeur_max' => (float) $seuil->valeur_max,
            'updated_at' => $seuil->updated_at?->toISOString(),
        ];
    }

    private function obtenirSeuil(Microcontroleur $micro, string $nomGrandeur): ?Seuil
    {
        $grandeur = Grandeur::where('name', $nomGrandeur)->first();
        if (!$grandeur) return null;

        return Seuil::where('microcontroleur_id', $micro->id)
            ->where('type_mesure', $grandeur->id)
            ->first();
    }

    public function liste(Request $request)
    {
        $user = $this->resolverUtilisateur($request);
        if (!$user) return response()->json(['message' => 'Non autorisé.'], 401);

        $micro = $this->resolverMicrocontroleur($user, $request);
        if (!$micro) return response()->json(['message' => 'Microcontrôleur introuvable.'], 404);

        return response()->json($this->seuilsPourMicrocontroleur($micro, $user));
    }

    public function enregistrer(Request $request)
    {
        $request->validate([
            'seuil_id' => 'required|uuid|exists:seuils,id',
            'valeur_min' => 'required|numeric',
            'valeur_max' => 'required|numeric|gt:valeur_min',
        ], [
            'valeur_max.gt' => 'La valeur maximale doit être supérieure à la valeur minimale.',
        ]);

        $user = $this->resolverUtilisateur($request);
        if (!$user) return response()->json(['message' => 'Non autorisé.'], 401);

        $seuil = Seuil::with(['microcontroleur', 'typeMesure'])
            ->where('id', $request->input('seuil_id'))
            ->where('user_id', $user->id)
            ->first();

        if (!$seuil || $seuil->microcontroleur?->user_id !== $user->id) {
            return response()->json(['message' => 'Seuil introuvable.'], 404);
        }

        $seuil->update([
            'valeur_min' => (float) $request->input('valeur_min'),
            'valeur_max' => (float) $request->input('valeur_max'),
            'updated_at' => Carbon::now(),
        ]);

        MqttController::publishSeuils($seuil->microcontroleur->nom);

        $config = self::SEUILS_CONFIG[$seuil->typeMesure?->name] ?? [
            'nom' => $seuil->typeMesure?->name ?? 'Seuil',
            'code' => 'seuil',
            'unite' => '',
            'icone' => 'fa-solid fa-sliders',
        ];

        return response()->json([
            'success' => true,
            'message' => 'Seuil mis à jour et synchronisé avec le microcontrôleur.',
            'seuil' => $this->formaterSeuil($seuil->refresh(), $config, $seuil->typeMesure),
        ]);
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
