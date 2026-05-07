<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class NouvelleAlerte implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public readonly string $userId,
        public readonly array $alerte,
    ) {}

    public function broadcastOn(): Channel
    {
        return new PrivateChannel('alertes.' . $this->userId);
    }

    public function broadcastAs(): string
    {
        return 'NouvelleAlerte';
    }

    public function broadcastWith(): array
    {
        return ['alerte' => $this->alerte];
    }
}
