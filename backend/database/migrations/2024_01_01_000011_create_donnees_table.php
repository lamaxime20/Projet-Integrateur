<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('donnees', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->double('valeur');
            $table->timestamp('date_arrivee');
            $table->uuid('capteur_id');

            $table->foreign('capteur_id')->references('id')->on('capteurs');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('donnees');
    }
};
