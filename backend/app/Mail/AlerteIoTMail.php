<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class AlerteIoTMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public readonly string $prenom,
        public readonly string $grandeur,
        public readonly float  $valeur,
        public readonly string $unite,
        public readonly float  $seuilMin,
        public readonly float  $seuilMax,
        public readonly string $deviceId,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "Alerte capteur — {$this->grandeur} | Agrico-Tech",
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.alerte-iot',
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
