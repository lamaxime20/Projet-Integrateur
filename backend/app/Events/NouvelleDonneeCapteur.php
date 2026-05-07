<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class NouvelleDonneeCapteur implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public readonly string $microcontroleurNom,
        public readonly string $capteur,
        public readonly string $cle,
        public readonly mixed $valeur,
        public readonly string $dateArrivee,
    ) {}

    public function broadcastOn(): Channel
    {
        return new PrivateChannel('capteurs.' . $this->microcontroleurNom);
    }

    public function broadcastAs(): string
    {
        return 'NouvelleDonneeCapteur';
    }

    public function broadcastWith(): array
    {
        return [
            'capteur'      => $this->capteur,
            'cle'          => $this->cle,
            'valeur'       => $this->valeur,
            'date_arrivee' => $this->dateArrivee,
        ];
    }
}
