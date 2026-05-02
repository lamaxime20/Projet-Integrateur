<?php

namespace App\Http\Controllers;

use App\Mail\PasswordResetMail;
use App\Models\Utilisateur;
use App\Models\ResetPasswordCode;
use App\Models\Session;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Carbon\Carbon;

class PasswordResetController extends Controller
{
    public function checkEmail(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
        ]);

        $user = Utilisateur::where('email', $request->email)->first();

        if (!$user) {
            return response()->json(['error' => 'Email not found'], 404);
        }

        // Invalidate any previous unused codes for this user
        ResetPasswordCode::where('user_id', $user->id)
            ->where('is_used', false)
            ->update(['expires_at' => Carbon::now()]);

        $code = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);

        ResetPasswordCode::create([
            'user_id' => $user->id,
            'code' => $code,
            'created_at' => Carbon::now(),
            'expires_at' => Carbon::now()->addMinutes(15),
            'is_used' => false,
        ]);

        Mail::to($user->email)->send(new PasswordResetMail($user->prenom, $code));

        return response()->json(['message' => 'Code sent to email']);
    }

    public function verifyCode(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'code' => 'required|string',
        ]);

        $user = Utilisateur::where('email', $request->email)->first();

        if (!$user) {
            return response()->json(['error' => 'Email not found'], 404);
        }

        $resetCode = ResetPasswordCode::where('user_id', $user->id)
            ->where('code', $request->code)
            ->where('is_used', false)
            ->where('expires_at', '>', Carbon::now())
            ->first();

        if (!$resetCode) {
            return response()->json(['error' => 'Invalid or expired code'], 400);
        }

        $resetCode->update(['is_used' => true]);

        return response()->json(['message' => 'Code verified']);
    }

    public function changePassword(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $user = Utilisateur::where('email', $request->email)->first();

        if (!$user) {
            return response()->json(['error' => 'Email not found'], 404);
        }

        $resetCode = ResetPasswordCode::where('user_id', $user->id)
            ->where('is_used', true)
            ->first();

        if (!$resetCode) {
            return response()->json(['error' => 'Verification required'], 400);
        }

        $user->update([
            'password' => Hash::make($request->password),
            'updated_at' => Carbon::now(),
        ]);

        $resetCode->delete();

        // Revoke all active sessions so compromised sessions are invalidated
        Session::where('user_id', $user->id)
            ->where('is_revoked', false)
            ->update(['is_revoked' => true]);

        return response()->json(['message' => 'Password changed successfully']);
    }
}
