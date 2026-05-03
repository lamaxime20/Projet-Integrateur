<?php

namespace App\Http\Controllers;

use App\Models\Actionneur;
use App\Models\Capteur;
use App\Models\Donnee;
use App\Models\EtatActionneur;
use App\Models\EtatCapteur;
use App\Models\EtatMicrocontroleur;
use App\Models\Grandeur;
use App\Models\Instruction;
use App\Models\Microcontroleur;
use Illuminate\Support\Facades\Log;
use PhpMqtt\Client\ConnectionSettings;
use PhpMqtt\Client\MqttClient;

class MqttController extends Controller
{
    // Clés JSON ESP32 → nom de Grandeur en base
    private const DATA_GRANDEURS = [
        'temperature'   => "Température de l'air",
        'humidite'      => 'Humidité du sol',
        'humidite_sol'  => 'Humidité du sol',
        'co2'           => "Qualité de l'air",
        'luminosite'    => 'Luminosité',
        'niveau_eau'    => "Niveau d'eau",
    ];

    // Nom de Grandeur → clés du JSON seuils attendu par l'ESP32
    private const GRANDEUR_SEUIL_KEYS = [
        'Luminosité'            => ['lum_min',  'lum_max'],
        'Humidité du sol'       => ['hum_min',  'hum_max'],
        "Température de l'air"  => ['temp_min', 'temp_max'],
        "Qualité de l'air"      => ['co2_min',  'co2_max'],
    ];

    // =========================================================
    // ENTRANT — agriculture/+/data
    // {"temperature":28,"humidite":65,"co2":400,"luminosite":300}
    // =========================================================
    public function handleData(string $deviceId, array $data): void
    {
        $micro = $this->trouverMicro($deviceId);
        if (!$micro) return;

        $now = now();

        foreach ($data as $cle => $valeur) {
            $grandeurNom = self::DATA_GRANDEURS[$cle] ?? null;
            if (!$grandeurNom) continue;

            $grandeur = Grandeur::where('name', $grandeurNom)->first();
            if (!$grandeur) continue;

            $capteur = $micro->capteurs()->where('type_mesure', $grandeur->id)->first();
            if (!$capteur) continue;

            Donnee::create([
                'valeur'       => (float) $valeur,
                'date_arrivee' => $now,
                'capteur_id'   => $capteur->id,
            ]);

            $capteur->update(['last_seen' => $now]);
        }
    }

    // =========================================================
    // ENTRANT — agriculture/+/components
    // {"device_id":"esp32_01","nom":"pompe","type":"actionneur","etat":"allume"}
    // =========================================================
    public function handleComponents(string $deviceId, array $data): void
    {
        $micro = $this->trouverMicro($deviceId);
        if (!$micro) return;

        $nom  = $data['nom']  ?? null;
        $type = $data['type'] ?? null;
        $etat = $this->normaliserEtat($data['etat'] ?? '');
        $now  = now();

        if (!$nom || !$type || !$etat) return;

        if ($type === 'actionneur') {
            $actionneur = $micro->actionneurs()
                ->whereRaw('LOWER(modele) LIKE ?', ['%' . strtolower($nom) . '%'])
                ->first();

            if (!$actionneur) return;

            $actionneur->update(['etat' => $etat, 'last_seen' => $now]);

            EtatActionneur::create([
                'etat'            => $etat,
                'date_debut_etat' => $now,
                'actionneur_id'   => $actionneur->id,
            ]);

        } elseif ($type === 'capteur') {
            $grandeurNom = self::DATA_GRANDEURS[$nom] ?? null;
            if (!$grandeurNom) return;

            $grandeur = Grandeur::where('name', $grandeurNom)->first();
            if (!$grandeur) return;

            $capteur = $micro->capteurs()->where('type_mesure', $grandeur->id)->first();
            if (!$capteur) return;

            $capteur->update(['etat' => $etat, 'last_seen' => $now]);

            EtatCapteur::create([
                'etat'            => $etat,
                'date_debut_etat' => $now,
                'capteur_id'      => $capteur->id,
            ]);
        }
    }

    // =========================================================
    // ENTRANT — agriculture/+/status
    // {"device_id":"esp32_01","id_instruction":"uuid","status":"terminee"}
    // =========================================================
    public function handleStatus(string $deviceId, array $data): void
    {
        $id     = $data['id_instruction'] ?? null;
        $status = $data['status']         ?? null;

        if (!$id || !$status) return;

        $instruction = Instruction::find($id);
        if (!$instruction) return;

        $statut = match ($status) {
            'terminee'    => 'executee',
            'interrompue' => 'echouee',
            default       => null,
        };

        if (!$statut) return;

        $instruction->update(['statut' => $statut]);
    }

    // =========================================================
    // ENTRANT — agriculture/+/availability
    // "online" ou "offline"
    // =========================================================
    public function handleAvailability(string $deviceId, string $message): void
    {
        $micro = $this->trouverMicro($deviceId);
        if (!$micro) return;

        $allume = trim($message) === 'online';
        $etat   = $allume ? 'actif' : 'inactif';
        $now    = now();

        $micro->update([
            'allume'         => $allume,
            'last_connexion' => $allume ? $now : $micro->last_connexion,
        ]);

        EtatMicrocontroleur::create([
            'etat'               => $etat,
            'date_debut_etat'    => $now,
            'microcontroleur_id' => $micro->id,
        ]);
    }

    // =========================================================
    // SORTANT — agriculture/{device_id}/seuils (retain = true)
    // Publie le JSON des seuils vers l'ESP32.
    // À appeler depuis SeuilController après chaque mise à jour.
    // =========================================================
    public static function publishSeuils(string $deviceId): void
    {
        $micro = Microcontroleur::where('nom', $deviceId)->first();
        if (!$micro) return;

        $seuils  = $micro->seuils()->with('typeMesure')->get();
        $payload = [];

        foreach ($seuils as $seuil) {
            $nom  = $seuil->typeMesure?->name;
            $keys = self::GRANDEUR_SEUIL_KEYS[$nom] ?? null;
            if (!$keys) continue;

            $payload[$keys[0]] = $seuil->valeur_min;
            $payload[$keys[1]] = $seuil->valeur_max;
        }

        if (empty($payload)) return;

        try {
            $mqtt = self::mqttClient();
            $mqtt->publish(
                "agriculture/{$deviceId}/seuils",
                json_encode($payload),
                1,
                true  // retain — l'ESP32 récupère les seuils même après redémarrage
            );
            $mqtt->disconnect();
        } catch (\Throwable $e) {
            Log::error("MQTT publishSeuils [{$deviceId}] : " . $e->getMessage());
        }
    }

    // =========================================================
    // SORTANT — agriculture/{device_id}/instructions
    // Publie une instruction vers l'ESP32.
    // À appeler depuis RealtimeDataController::creerInstruction.
    // Format attendu par l'ESP32 :
    //   { id_instruction, action, duree (secondes), actionneur }
    // =========================================================
    public static function publishInstruction(Instruction $instruction): void
    {
        $actionneur = $instruction->actionneur;
        if (!$actionneur) return;

        $micro = $actionneur->microcontroleur;
        if (!$micro) return;

        $payload = json_encode([
            'id_instruction' => $instruction->id,
            'action'         => $instruction->action,
            'duree'          => (int) ($instruction->duree ?? 0),
            'actionneur'     => strtolower($actionneur->modele),
        ]);

        try {
            $mqtt = self::mqttClient();
            $mqtt->publish("agriculture/{$micro->nom}/instructions", $payload, 1);
            $mqtt->disconnect();
        } catch (\Throwable $e) {
            Log::error("MQTT publishInstruction [{$instruction->id}] : " . $e->getMessage());
        }
    }

    // =========================================================
    // HELPERS PRIVÉS
    // =========================================================
    private function trouverMicro(string $deviceId): ?Microcontroleur
    {
        return Microcontroleur::where('nom', $deviceId)->first();
    }

    private function normaliserEtat(string $etat): ?string
    {
        return match (strtolower(trim($etat))) {
            'allume', 'actif', 'ouverte', 'ok' => 'actif',
            'eteint', 'fermee', 'bas'           => 'inactif',
            'defaillant'                        => 'defaillant',
            default                             => null,
        };
    }

    private static function mqttClient(): MqttClient
    {
        $mqtt = new MqttClient(
            'b1d946f5edb84d23ade6058bd316610b.s1.eu.hivemq.cloud',
            8883,
            'laravel-publisher-' . uniqid()
        );

        $mqtt->connect(
            (new ConnectionSettings)
                ->setUsername(env('HIVEMQ_USERNAME'))
                ->setPassword(env('HIVEMQ_PASSWORD'))
                ->setUseTls(true)
                ->setTlsSelfSignedAllowed(true),
            true
        );

        return $mqtt;
    }
}
