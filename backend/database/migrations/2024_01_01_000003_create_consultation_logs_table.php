<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('consultation_logs', function (Blueprint $table) {
            $table->uuid('user_id');
            $table->uuid('log_id');

            $table->primary(['user_id', 'log_id']);

            $table->foreign('user_id')->references('id')->on('utilisateurs');
            $table->foreign('log_id')->references('id')->on('logs');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('consultation_logs');
    }
};
