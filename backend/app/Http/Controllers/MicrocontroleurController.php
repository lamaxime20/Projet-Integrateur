<?php

namespace App\Http\Controllers;

use App\Models\Actionneur;
use App\Models\Capteur;
use App\Models\Grandeur;
use App\Models\Microcontroleur;
use App\Models\Session;
use App\Models\Seuil;
use App\Models\Utilisateur;
use App\Support\ApiTokenManager;
use GrahamCampbell\ResultType\Success;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class MicrocontroleurController extends Controller
{
    public function __construct(private ApiTokenManager $tokenManager) {}

    public function enregistrer(Request $request)
    {
        $request->validate([
            'identifiant' => 'required|string',
            'password'    => 'required|string',
        ]);

        $tokenCookies = $request->cookie('auth_token');

        $tokenId = $this->tokenManager->avoirTokenIdPur($tokenCookies);

        $token = Session::where('id', $tokenId)->first();

        $user = Utilisateur::where('id', $token->user_id)->first();

        $microcontroleur = Microcontroleur::where('identifiant_user', $request->identifiant)
            ->where('passkey', $request->password)
            ->first();

        if (!$microcontroleur) {
            return response()->json([
                'success' => false,
                'message' => 'Identifiant ou mot de passe incorrect.',
            ], 404);
        }

        if ($microcontroleur->user_id !== null && $microcontroleur->user_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Ce microcontrôleur est déjà rattaché à un autre compte.',
            ], 409);
        }

        if ($microcontroleur->user_id === null) {
            $microcontroleur->user_id = $user->id;
            $microcontroleur->save();
            $this->creerSeuilsParDefaut($microcontroleur, $user->id);
        }

        return response()->json([
            'success'         => true,
            'message'         => 'Microcontroleur enregistré avec succès',
            'microcontroleur' => $this->formatMicrocontroleur($microcontroleur),
        ]);
    }

    public function liste(Request $request)
    {
        $tokenCookies = $request->cookie('auth_token');

        $tokenId = $this->tokenManager->avoirTokenIdPur($tokenCookies);

        $token = Session::where('id', $tokenId)->first();

        $user = Utilisateur::where('id', $token->user_id)->first();

        $microcontroleurs = Microcontroleur::where('user_id', $user->id)
            ->get(['nom', 'allume']);

        return response()->json($microcontroleurs);
    }

    public function charger(Request $request, string $nom)
    {
        $tokenCookies = $request->cookie('auth_token');

        $tokenId = $this->tokenManager->avoirTokenIdPur($tokenCookies);

        $token = Session::where('id', $tokenId)->first();

        $user = Utilisateur::where('id', $token->user_id)->first();

        $microcontroleur = Microcontroleur::where('user_id', $user->id)
            ->where('nom', $nom)
            ->first();

        if (!$microcontroleur) {
            return response()->json([
                'success' => false,
                'message' => 'Microcontrôleur introuvable.',
            ], 404);
        }

        return response()->json([
            'success'         => true,
            'message'         => 'Microcontroleur chargé avec succès',
            'microcontroleur' => $this->formatMicrocontroleur($microcontroleur),
        ]);
    }

    public function enregistrerNewMicrocontroleurUsine(Request $request) {
        $request->validate([
            'nom' => 'required|string',
            'mac_address' => 'required|string|unique:microcontroleurs,mac_address',
            'identifiant' => 'required|string|unique:microcontroleurs,identifiant_user',
            'reference' => 'required|string',
            'passkey' => 'required|string|unique:microcontroleurs,passkey',
        ]);

        try {
            DB::beginTransaction();

            $microcontroleur = Microcontroleur::create([
                'nom' => $request->nom,
                'mac_address' => $request->mac_address,
                'identifiant_user' => $request->identifiant,
                'reference' => $request->reference,
                'passkey' => $request->passkey,
                'allume' => false,
                'date_installation' => now(),
                'last_connexion' => null,
                'user_id' => null
            ]);

            Actionneur::create([
                'microcontroleur_id' => $microcontroleur->id,
                'modele' => "pompe classique",
                'etat' => 'inactif',
            ]);

            Actionneur::create([
                'microcontroleur_id' => $microcontroleur->id,
                'modele' => "servomoteur classique",
                'etat' => 'inactif',
            ]);

            Actionneur::create([
                'microcontroleur_id' => $microcontroleur->id,
                'modele' => "ampoule classique",
                'etat' => 'inactif',
            ]);
            
            Actionneur::create([
                'microcontroleur_id' => $microcontroleur->id,
                'modele' => "ventilateur classique",
                'etat' => 'inactif',
            ]);

            $temperature = Grandeur::where('name', "Température de l'air")->first();
            $humidite_air = Grandeur::where('name', "Humidité de l'air")->first();
            $humidite_sol = Grandeur::where('name', 'Humidité du sol')->first();
            $co2 = Grandeur::where('name', "Qualité de l'air")->first();
            $luminosite = Grandeur::where('name', "Luminosité")->first();
            $niveau_eau = Grandeur::where('name', "Niveau d'eau")->first();

            if (!$temperature || !$humidite_air || !$humidite_sol || !$co2 || !$luminosite || !$niveau_eau) {
                throw new \Exception("Certaines grandeurs physiques sont manquantes dans la base de données. Veuillez exécuter createBaseofData.sql.");
            }

            Capteur::create([
                'type_mesure' => $humidite_sol->id,
                'microcontroleur_id' => $microcontroleur->id,
                'etat' => 'inactif',
                'modele' => 'YL-06',
            ]);

            Capteur::create([
                'type_mesure' => $temperature->id,
                'microcontroleur_id' => $microcontroleur->id,
                'etat' => 'inactif',
                'modele' => 'DHT11',
            ]);

            Capteur::create([
                'type_mesure' => $humidite_air->id,
                'microcontroleur_id' => $microcontroleur->id,
                'etat' => 'inactif',
                'modele' => 'DHT11',
            ]);

            Capteur::create([
                'type_mesure' => $co2->id,
                'microcontroleur_id' => $microcontroleur->id,
                'etat' => 'inactif',
                'modele' => 'MQ-135',
            ]);

            Capteur::create([
                'type_mesure' => $luminosite->id,
                'microcontroleur_id' => $microcontroleur->id,
                'etat' => 'inactif',
                'modele' => 'LDR',
            ]);

            Capteur::create([
                'type_mesure' => $niveau_eau->id,
                'microcontroleur_id' => $microcontroleur->id,
                'etat' => 'inactif',
                'modele' => 'water sensor'
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Microcontroleur enregistré avec succès',
                'microcontroleur' => $this->formatMicrocontroleur($microcontroleur),
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la création : ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Crée les seuils par défaut pour un microcontrôleur lors de son premier enregistrement.
     * Ces valeurs servent de base pour les automatismes du code Arduino.
     */
    private function creerSeuilsParDefaut(Microcontroleur $micro, string $userId): void
    {
        $defaults = [
            "Température de l'air" => ['min' => 18.0, 'max' => 35.0],
            "Humidité du sol"      => ['min' => 30.0, 'max' => 70.0],
            "Qualité de l'air"     => ['min' => 20.0, 'max' => 70.0],
            "Luminosité"           => ['min' => 20.0, 'max' => 80.0],
        ];

        foreach ($defaults as $grandeurName => $values) {
            $grandeur = Grandeur::where('name', $grandeurName)->first();
            
            if ($grandeur) {
                // Vérifier si un seuil existe déjà pour éviter les doublons
                $exists = Seuil::where('microcontroleur_id', $micro->id)
                    ->where('type_mesure', $grandeur->id)
                    ->where('user_id', $userId)
                    ->exists();

                if (!$exists) {
                    Seuil::create([
                        'type_mesure'        => $grandeur->id,
                        'valeur_min'         => $values['min'],
                        'valeur_max'         => $values['max'],
                        'user_id'            => $userId,
                        'microcontroleur_id' => $micro->id,
                        'updated_at'         => Carbon::now(),
                    ]);
                }
            }
        }
    }

    private function formatMicrocontroleur(Microcontroleur $m): array
    {
        return [
            'nom'               => $m->nom,
            'mac_address'       => $m->mac_address,
            'identifiant'       => $m->identifiant_user,
            'reference'         => $m->reference,
            'allume'            => $m->allume,
            'last_connexion'    => $m->last_connexion?->format('d-m-Y'),
            'date_installation' => $m->date_installation?->format('d-m-Y'),
            'passkey'           => $m->passkey,
        ];
    }
}
