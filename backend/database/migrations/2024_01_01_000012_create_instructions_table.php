<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('instructions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('action');
            $table->integer('duree')->nullable();
            $table->enum('statut', ['en_attente', 'executee', 'echouee']);
            $table->timestamp('date_arrivee');
            $table->uuid('user_id');
            $table->uuid('actionneur_id');

            $table->foreign('user_id')->references('id')->on('utilisateurs');
            $table->foreign('actionneur_id')->references('id')->on('actionneurs');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('instructions');
    }
};
