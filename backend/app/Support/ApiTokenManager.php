<?php

namespace App\Support;

use App\Models\Session;
use App\Models\Utilisateur;
use Hamcrest\Util;
use Illuminate\Support\Str;

class ApiTokenManager
{
    public function issueToken(Utilisateur $user, string $role = 'user', ?\DateTimeInterface $expiresAt = null): array
    {
        $plainTextToken = Str::random(64);

        $token = Session::create([
            'user_id' => $user->id,
            'role' => $role,
            'token' => hash('sha256', $plainTextToken),
            'create_at' => now(),
            'expires_at' => $expiresAt,
            'updated_at' => now(),
            'last_used_at' => now()
        ]);

        return [
            'model' => $token,
            'plain_text_token' => $token->id.'|'.$plainTextToken.'|'.$role,
        ];
    }

    public function resolveFromBearerTokenAdmin(?string $bearerToken, bool $touch = false): ?array
    {
        if (! $bearerToken || ! str_contains($bearerToken, '|')) {
            return null;
        }

        [$tokenId, $plainTextToken, $role] = explode('|', $bearerToken, 3);

        if (! ctype_digit((string) $tokenId) || $plainTextToken === '') {
            return null;
        }

        $token = Session::find((String) $tokenId);

        if (! $token || ! hash_equals($token->token, hash('sha256', $plainTextToken))) {
            return null;
        }

        if ($token->expires_at && $token->expires_at->isPast()) {
            $token->delete();

            return null;
        }

        $user = Utilisateur::find($token->user_id);

        if (! $user) {
            $token->delete();

            return null;
        }

        if ($role != 'admin') {
            return null;
        }

        if ($touch) {
            $token->forceFill([
                'last_used_at' => now(),
                'updated_at' => now(),
            ])->save();
        }

        return [
            'token' => $token,
            'user' => $user,
        ];
    }

    public function resolveFromBearerTokenUser(?string $bearerToken, bool $touch = false): ?array
    {
        if (! $bearerToken || ! str_contains($bearerToken, '|')) {
            return null;
        }

        [$tokenId, $plainTextToken, $role] = explode('|', $bearerToken, 3);

        if (! ctype_digit((string) $tokenId) || $plainTextToken === '') {
            return null;
        }

        $token = Session::find((String) $tokenId);

        if (! $token || ! hash_equals($token->token, hash('sha256', $plainTextToken))) {
            return null;
        }

        if ($token->expires_at && $token->expires_at->isPast()) {
            $token->delete();

            return null;
        }

        $user = Utilisateur::find($token->user_id);

        if (! $user) {
            $token->delete();

            return null;
        }

        if ($role != 'user') {
            return null;
        }

        if ($touch) {
            $token->forceFill([
                'last_used_at' => now(),
                'updated_at' => now(),
            ])->save();
        }

        return [
            'token' => $token,
            'user' => $user,
        ];
    }
}
