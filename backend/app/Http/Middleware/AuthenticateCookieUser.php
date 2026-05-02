<?php

namespace App\Http\Middleware;

use App\Models\Session;
use App\Models\Utilisateur;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class AuthenticateCookieUser
{
    public function handle(Request $request, Closure $next): Response
    {
        $token = $request->cookie('auth_token');

        if (!$token) {
            return response()->json(['message' => 'Authentification requise.'], 401);
        }

        $session = Session::where('token', $token)
            ->where('is_revoked', false)
            ->first();

        if (!$session) {
            return response()->json(['message' => 'Authentification requise.'], 401);
        }

        if ($session->expires_at && $session->expires_at->isPast()) {
            $session->delete();
            return response()->json(['message' => 'Session expirée.'], 401);
        }

        $user = Utilisateur::find($session->user_id);

        if (!$user) {
            $session->delete();
            return response()->json(['message' => 'Authentification requise.'], 401);
        }

        $session->forceFill([
            'last_used_at' => now(),
            'updated_at'   => now(),
        ])->save();

        $request->setUserResolver(fn () => $user);
        Auth::setUser($user);

        return $next($request);
    }
}
