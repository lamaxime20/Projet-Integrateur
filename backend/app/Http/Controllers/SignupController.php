<?php

namespace App\Http\Controllers;

use App\Mail\SignupVerificationMail;
use App\Models\Utilisateur;
use App\Models\VerificationCode;
use App\Models\Session;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Carbon\Carbon;

class SignupController extends Controller
{
    public function checkEmail(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'nom' => 'required|string',
            'prenom' => 'required|string',
        ]);

        if (Utilisateur::where('email', $request->email)->exists()) {
            return response()->json(['error' => 'Email already exists'], 400);
        }

        // Invalidate any previous unused codes for this email
        VerificationCode::where('email', $request->email)
            ->where('is_used', false)
            ->update(['expired_at' => Carbon::now()]);

        $code = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);

        VerificationCode::create([
            'email' => $request->email,
            'code' => $code,
            'created_at' => Carbon::now(),
            'expired_at' => Carbon::now()->addMinutes(15),
            'is_used' => false,
        ]);

        Mail::to($request->email)->send(new SignupVerificationMail($request->prenom, $code));

        return response()->json(['message' => 'Code sent to email']);
    }

    public function verifyCode(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'code' => 'required|string',
        ]);

        $verification = VerificationCode::where('email', $request->email)
            ->where('code', $request->code)
            ->where('is_used', false)
            ->where('expired_at', '>', Carbon::now())
            ->first();

        if (!$verification) {
            return response()->json(['error' => 'Invalid or expired code'], 400);
        }

        $verification->update(['is_used' => true]);

        return response()->json(['message' => 'Code verified']);
    }

    public function createAccount(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'nom' => 'required|string',
            'prenom' => 'required|string',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $verification = VerificationCode::where('email', $request->email)
            ->where('is_used', true)
            ->first();

        if (!$verification) {
            return response()->json(['error' => 'Verification required'], 400);
        }

        if (Utilisateur::where('email', $request->email)->exists()) {
            return response()->json(['error' => 'Email already exists'], 400);
        }

        $user = Utilisateur::create([
            'email' => $request->email,
            'nom' => $request->nom,
            'prenom' => $request->prenom,
            'password' => Hash::make($request->password),
            'role' => 'user',
            'status' => 'actif',
            'created_at' => Carbon::now(),
            'updated_at' => Carbon::now(),
        ]);

        $verification->delete();

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
}
