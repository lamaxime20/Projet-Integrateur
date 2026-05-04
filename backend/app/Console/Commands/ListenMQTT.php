<?php

namespace App\Console\Commands;

use App\Http\Controllers\MqttController;
use Illuminate\Console\Command;
use PhpMqtt\Client\ConnectionSettings;
use PhpMqtt\Client\MqttClient;

class ListenMQTT extends Command
{
    protected $signature   = 'mqtt:listen';
    protected $description = 'Abonnement MQTT — réception et persistance des données ESP32';

    public function handle(): void
    {
        $server   = 'b1d946f5edb84d23ade6058bd316610b.s1.eu.hivemq.cloud';
        $port     = 8883;

        $ctrl = new MqttController();

        // Reconnexion automatique en cas de perte du broker
        while (true) {
            try {
                $mqtt = new MqttClient($server, $port, 'laravel-subscriber-' . uniqid());

                $mqtt->connect(
                    (new ConnectionSettings)
                        ->setUsername(env('HIVEMQ_USERNAME'))
                        ->setPassword(env('HIVEMQ_PASSWORD'))
                        ->setUseTls(true)
                        ->setTlsSelfSignedAllowed(true),
                    true
                );

                $this->info('[MQTT] Connecté — en attente de messages...');

                // ——— Données capteurs ———
                // agriculture/{device_id}/data
                // {"temperature":28,"humidite":65,"co2":400,"luminosite":300}
                $mqtt->subscribe('agriculture/+/data', function (string $topic, string $message) use ($ctrl) {
                    $deviceId = explode('/', $topic)[1];
                    $data = json_decode($message, true);
                    if (is_array($data)) {
                        $this->info(json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES));
                        $ctrl->handleData($deviceId, $data);
                    }
                }, 1);

                // ——— État capteurs / actionneurs ———
                // agriculture/{device_id}/components
                // {"device_id":"esp32_01","nom":"pompe","type":"actionneur","etat":"allume"}
                $mqtt->subscribe('agriculture/+/components', function (string $topic, string $message) use ($ctrl) {
                    $deviceId = explode('/', $topic)[1];
                    $data = json_decode($message, true);
                    if (is_array($data)) {
                        $this->info("essaie component");
                        $this->info($deviceId);
                        $this->info("Les informations sont");
                        $this->info(json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES));
                        $ctrl->handleComponents($deviceId, $data);
                    }
                }, 1);

                // ——— Statut d'exécution des instructions ———
                // agriculture/{device_id}/status
                // {"device_id":"esp32_01","id_instruction":"uuid","status":"terminee"}
                $mqtt->subscribe('agriculture/+/status', function (string $topic, string $message) use ($ctrl) {
                    $deviceId = explode('/', $topic)[1];
                    $data = json_decode($message, true);
                    if (is_array($data)) {
                        $this->info(json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES));
                        $ctrl->handleStatus($deviceId, $data);
                    }
                }, 1);

                // ——— Disponibilité du microcontrôleur (LWT + online) ———
                // agriculture/{device_id}/availability
                // "online" ou "offline"
                $mqtt->subscribe('agriculture/+/availability', function (string $topic, string $message) use ($ctrl) {
                    $deviceId = explode('/', $topic)[1];
                    $this->info($message);
                    $this->info($topic);
                    $this->info($deviceId);
                    $ctrl->handleAvailability($deviceId, $message);
                }, 1);

                $mqtt->loop(true);

            } catch (\Throwable $e) {
                $this->error('[MQTT] Erreur : ' . $e->getMessage() . ' — reconnexion dans 10 s...');
                sleep(10);
            }
        }
    }
}
