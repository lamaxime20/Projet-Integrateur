<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('etats_capteurs', function (Blueprint $table) {
            $table->uuid('id')->primary()->default(DB::raw('uuid_generate_v4()'));
            $table->enum('etat', ['actif', 'inactif', 'defaillant']);
            $table->timestamp('date_debut_etat');
            $table->uuid('capteur_id');

            $table->foreign('capteur_id')->references('id')->on('capteurs');
            $table->index(['capteur_id', 'date_debut_etat']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('etats_capteurs');
    }
};
