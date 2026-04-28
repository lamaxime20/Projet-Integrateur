<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('seuils', function (Blueprint $table) {
            $table->uuid('id')->primary()->default(DB::raw('uuid_generate_v4()'));
            $table->uuid('type_mesure');
            $table->double('valeur_max');
            $table->double('valeur_min');
            $table->timestamp('updated_at');
            $table->uuid('user_id');
            $table->uuid('microcontroleur_id');

            $table->foreign('type_mesure')->references('id')->on('grandeurs');
            $table->foreign('user_id')->references('id')->on('utilisateurs');
            $table->foreign('microcontroleur_id')->references('id')->on('microcontroleurs');
        });

        DB::statement('ALTER TABLE seuils ADD CONSTRAINT seuils_check001 CHECK (valeur_min < valeur_max)');
    }

    public function down(): void
    {
        Schema::dropIfExists('seuils');
    }
};
