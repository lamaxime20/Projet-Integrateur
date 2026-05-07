<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class NouvelEtatActionneur implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public readonly string $microcontroleurNom,
        public readonly string $actionneur,
        public readonly string $etat,
    ) {}

    public function broadcastOn(): Channel
    {
        return new PrivateChannel('capteurs.' . $this->microcontroleurNom);
    }

    public function broadcastAs(): string
    {
        return 'NouvelEtatActionneur';
    }

    public function broadcastWith(): array
    {
        return [
            'actionneur' => $this->actionneur,
            'etat'       => $this->etat,
        ];
    }
}
