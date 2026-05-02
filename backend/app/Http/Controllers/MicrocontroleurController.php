<?php

namespace App\Http\Controllers;

use App\Models\Microcontroleur;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class MicrocontroleurController extends Controller
{
    public function enregistrer(Request $request)
    {
        $request->validate([
            'identifiant' => 'required|string',
            'password'    => 'required|string',
        ]);

        $user = Auth::user();

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
        }

        return response()->json([
            'success'         => true,
            'message'         => 'Microcontroleur enregistré avec succès',
            'microcontroleur' => $this->formatMicrocontroleur($microcontroleur),
        ]);
    }

    public function liste(Request $request)
    {
        $user = Auth::user();

        $microcontroleurs = Microcontroleur::where('user_id', $user->id)
            ->get(['nom', 'allume']);

        return response()->json($microcontroleurs);
    }

    public function charger(Request $request, string $nom)
    {
        $user = Auth::user();

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
