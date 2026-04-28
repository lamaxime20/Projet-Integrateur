<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('alertes', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('type');
            $table->string('message');
            $table->boolean('vu');
            $table->timestamp('date_arrivee');
            $table->timestamp('date_lu')->nullable();
            $table->uuid('user_id');

            $table->foreign('user_id')->references('id')->on('utilisateurs');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('alertes');
    }
};
