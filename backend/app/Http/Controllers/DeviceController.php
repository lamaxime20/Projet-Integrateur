<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use PhpMqtt\Client\MqttClient;
use PhpMqtt\Client\ConnectionSettings;

class DeviceController extends Controller
{
    private $file = 'messages.txt';

    // ===== 1. DONNER TOKEN =====
    public function getToken(Request $request)
    {
        $identifiant = $request->input('identifiant_user');

        if (!$identifiant) {
            return response()->json(['error' => 'identifiant_user requis'], 400);
        }

        // Token simple pour test
        $token = hash('sha256', $identifiant . time());

        return response()->json([
            'token' => $token
        ]);
    }

    // ===== 2. RECEVOIR MQTT ET STOCKER =====
    public function listenMQTT()
    {
        $server = 'b1d946f5edb84d23ade6058bd316610b.s1.eu.hivemq.cloud';
        $port = 8883;
        $clientId = 'laravel-subscriber-' . uniqid();

        // 1. Initialisation du client
        $mqtt = new MqttClient($server, $port, MqttClient::MQTT_3_1_1); // Spécifiez la version si nécessaire

        $connectionSettings = (new ConnectionSettings)
            ->setUsername(env('HIVEMQ_USERNAME'))
            ->setPassword(env('HIVEMQ_PASSWORD'))
            ->setUseTls(true)
            ->setTlsSelfSignedAllowed(false);

        // 2. Connexion (Le deuxième paramètre 'true' active la session propre)
        $mqtt->connect($connectionSettings, true);

        // 3. Souscription
        // Note : On s'assure que le QoS est bien géré
        $mqtt->subscribe('agriculture/+/data', function ($topic, $message) {
            Storage::append('messages.txt', 
                date('Y-m-d H:i:s') . " | $topic | $message"
            );
        }, 1); // QoS 1

        // 4. La Boucle (Crucial)
        // loop(true) permet de rester à l'écoute indéfiniment
        $mqtt->loop(true);
    }

    // ===== 3. RECUPERER LES MESSAGES =====
    public function getMessages()
    {
        if (!Storage::exists($this->file)) {
            return response()->json([]);
        }

        $lines = Storage::get($this->file);
        $messages = explode(PHP_EOL, trim($lines));

        return response()->json($messages);
    }

    // ===== 4. ENVOYER MESSAGE A ESP32 =====
    public function sendMessage(Request $request)
    {
        $message = $request->input('message');
        $device_id = $request->input('device_id');

        if (!$message || !$device_id) {
            return response()->json(['error' => 'message et device_id requis'], 400);
        }

        $server = 'b1d946f5edb84d23ade6058bd316610b.s1.eu.hivemq.cloud';
        $port = 8883;
        $clientId = 'laravel-publisher';

        $mqtt = new MqttClient($server, $port, $clientId);

        $connectionSettings = (new ConnectionSettings)
            ->setUsername(env('HIVEMQ_USERNAME'))
            ->setPassword(env('HIVEMQ_PASSWORD'))
            ->setUseTls(true)
            ->setTlsSelfSignedAllowed(true);

        $mqtt->connect($connectionSettings, true);

        $topic = "agriculture/{$device_id}/instructions";

        $mqtt->publish($topic, $message, 1);

        $mqtt->disconnect();

        return response()->json([
            'status' => 'Message envoyé'
        ]);
    }
}