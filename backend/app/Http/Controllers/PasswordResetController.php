<?php

namespace App\Http\Controllers;

use App\Models\Utilisateur;
use App\Models\ResetPasswordCode;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;
use Illuminate\Support\Str;

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

        // Generate code
        $code = strtoupper(Str::random(6));

        ResetPasswordCode::create([
            'user_id' => $user->id,
            'code' => $code,
            'created_at' => Carbon::now(),
            'expires_at' => Carbon::now()->addMinutes(15),
            'is_used' => false,
        ]);

        // TODO: Send email with code

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

        // Mark as used
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

        // Check if code was verified
        $resetCode = ResetPasswordCode::where('user_id', $user->id)
            ->where('is_used', true)
            ->where('expires_at', '>', Carbon::now()->subMinutes(15))
            ->first();

        if (!$resetCode) {
            return response()->json(['error' => 'Verification required'], 400);
        }

        // Update password
        $user->update([
            'password' => Hash::make($request->password),
            'updated_at' => Carbon::now(),
        ]);

        // Delete reset code
        $resetCode->delete();

        return response()->json(['message' => 'Password changed successfully']);
    }
}
