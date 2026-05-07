<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class NouvelEtatMicrocontroleur implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public readonly string $microcontroleurNom,
        public readonly bool $allume,
        public readonly string $etat,
    ) {}

    public function broadcastOn(): Channel
    {
        return new PrivateChannel('capteurs.' . $this->microcontroleurNom);
    }

    public function broadcastAs(): string
    {
        return 'NouvelEtatMicrocontroleur';
    }

    public function broadcastWith(): array
    {
        return [
            'allume' => $this->allume,
            'etat'   => $this->etat,
        ];
    }
}
