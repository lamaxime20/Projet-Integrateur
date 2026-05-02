<?php

namespace App\Http\Controllers;

use App\Models\Session;
use App\Models\Utilisateur;
use App\Support\ApiTokenManager;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function __construct(private ApiTokenManager $tokenManager) {}

    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        $user = Utilisateur::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json(['error' => 'Invalid credentials'], 401);
        }

        if ($user->status !== 'actif') {
            return response()->json(['error' => 'Account is not active'], 403);
        }

        $result = $this->tokenManager->issueToken($user, $user->role, Carbon::now()->addDays(7));

        $userData = [
            'id' => $user->id,
            'email' => $user->email,
            'name' => $user->nom . ' ' . $user->prenom,
            'role' => $user->role,
            'jour_expiration' => 7,
        ];

        return response()->json($userData)
            ->withCookie(cookie('auth_token', $result['plain_text_token'], 60 * 24 * 7, '/', null, false, true));
    }

    public function logout(Request $request)
    {
        $cookieToken = $request->cookie('auth_token');

        if ($cookieToken && str_contains($cookieToken, '|')) {
            [$tokenId] = explode('|', $cookieToken, 3);
            if (ctype_digit((string) $tokenId)) {
                Session::find($tokenId)?->delete();
            }
        }

        return response()->json(['message' => 'Logged out'])
            ->withCookie(cookie()->forget('auth_token'));
    }
}
