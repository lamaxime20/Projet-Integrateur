<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;
use PhpMqtt\Client\MqttClient;
use PhpMqtt\Client\ConnectionSettings;

class ListenMQTT extends Command
{
    protected $signature = 'mqtt:listen';
    protected $description = 'Listen to MQTT messages';

    public function handle()
    {
        $server = 'b1d946f5edb84d23ade6058bd316610b.s1.eu.hivemq.cloud';
        $port = 8883;
        $clientId = 'laravel-subscriber';

        $mqtt = new MqttClient($server, $port, $clientId);

        $connectionSettings = (new ConnectionSettings)
            ->setUsername(env('HIVEMQ_USERNAME'))
            ->setPassword(env('HIVEMQ_PASSWORD'))
            ->setUseTls(true)
            ->setTlsSelfSignedAllowed(true);

        $mqtt->connect($connectionSettings, true);

        $this->info("MQTT connecté...");

        $mqtt->subscribe('agriculture/+/data', function ($topic, $message) {
            $line = date('Y-m-d H:i:s') . " | " . $topic . " | " . $message . PHP_EOL;
            Storage::append('messages.txt', $line);
        }, 1);

        $mqtt->loop(true);
    }
}