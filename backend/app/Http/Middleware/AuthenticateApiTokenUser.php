<?php

namespace App\Http\Middleware;

use App\Support\ApiTokenManager;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class AuthenticateApiTokenUser
{
    public function __construct(
        private ApiTokenManager $tokenManager
    ) {
    }

    public function handle(Request $request, Closure $next): Response
    {
        $resolved = $this->tokenManager->resolveFromBearerTokenUser($request->bearerToken(), touch: true);

        if (! $resolved) {
            return response()->json([
                'message' => 'Authentification requise.',
            ], 401);
        }

        $request->attributes->set('accessToken', $resolved['token']);
        $request->setUserResolver(fn () => $resolved['user']);
        Auth::setUser($resolved['user']);

        return $next($request);
    }
}