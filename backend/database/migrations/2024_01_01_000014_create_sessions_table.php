<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sessions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('token')->unique();
            $table->uuid('user_id');
            $table->enum('role', ['admin', 'user']);
            $table->timestamp('created_at');
            $table->timestamp('expires_at');
            $table->boolean('is_revoked')->default(false);

            $table->foreign('user_id')->references('id')->on('utilisateurs');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sessions');
    }
};
