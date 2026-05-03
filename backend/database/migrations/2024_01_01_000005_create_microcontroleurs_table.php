<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('microcontroleurs', function (Blueprint $table) {
            $table->uuid('id')->primary()->default(DB::raw('uuid_generate_v4()'));
            $table->string('nom');
            $table->string('mac_address')->unique();
            $table->string('identifiant_user');
            $table->string('reference');
            $table->boolean('allume');
            $table->timestamp('last_connexion')->nullable();
            $table->timestamp('date_installation');
            $table->string('passkey');
            $table->uuid('user_id')->nullable();

            $table->unique(['nom', 'user_id']);
            $table->unique('passkey');
            $table->unique('identifiant_user');
            $table->foreign('user_id')->references('id')->on('utilisateurs');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('microcontroleurs');
    }
};
