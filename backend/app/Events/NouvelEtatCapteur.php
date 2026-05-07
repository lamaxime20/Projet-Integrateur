<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class NouvelEtatCapteur implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public readonly string $microcontroleurNom,
        public readonly string $capteur,
        public readonly string $etat,
    ) {}

    public function broadcastOn(): Channel
    {
        return new PrivateChannel('capteurs.' . $this->microcontroleurNom);
    }

    public function broadcastAs(): string
    {
        return 'NouvelEtatCapteur';
    }

    public function broadcastWith(): array
    {
        return [
            'capteur' => $this->capteur,
            'etat'    => $this->etat,
        ];
    }
}
