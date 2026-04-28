<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('unites', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name');
            $table->uuid('grandeur_physique');

            $table->foreign('grandeur_physique')->references('id')->on('grandeurs');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('unites');
    }
};
