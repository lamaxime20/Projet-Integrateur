<?php

namespace App\Http\Controllers;

use App\Models\Utilisateur;
use App\Models\Session;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Cookie;
use Illuminate\Support\Str;
use Carbon\Carbon;

class AuthController extends Controller
{
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

        $token = Str::uuid();
        $expiresAt = Carbon::now()->addDays(7);

        Session::create([
            'token' => $token,
            'user_id' => $user->id,
            'role' => $user->role,
            'created_at' => Carbon::now(),
            'expires_at' => $expiresAt,
            'last_used_at' => Carbon::now(),
            'updated_at' => Carbon::now(),
            'is_revoked' => false,
        ]);

        $userData = [
            'id' => $user->id,
            'email' => $user->email,
            'name' => $user->nom . ' ' . $user->prenom,
            'role' => $user->role,
            'jour_expiration' => 7,
        ];

        return response()->json($userData)
            ->withCookie(cookie('auth_token', $token, 60 * 24 * 7, '/', null, false, true));
    }

    public function logout(Request $request)
    {
        $token = $request->cookie('auth_token');

        if ($token) {
            Session::where('token', $token)->update(['is_revoked' => true]);
        }

        return response()->json(['message' => 'Logged out'])
            ->withCookie(cookie()->forget('auth_token'));
    }
}
