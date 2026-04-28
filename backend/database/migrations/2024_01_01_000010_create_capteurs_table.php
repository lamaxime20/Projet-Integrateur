<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('capteurs', function (Blueprint $table) {
            $table->uuid('id')->primary()->default(DB::raw('uuid_generate_v4()'));
            $table->uuid('type_mesure');
            $table->enum('etat', ['actif', 'inactif', 'defaillant']);
            $table->timestamp('last_seen')->nullable();
            $table->string('modele');
            $table->uuid('microcontroleur_id');

            $table->foreign('type_mesure')->references('id')->on('grandeurs');
            $table->foreign('microcontroleur_id')->references('id')->on('microcontroleurs');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('capteurs');
    }
};
