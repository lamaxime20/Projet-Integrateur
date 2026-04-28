<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reset_password_codes', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('user_id');
            $table->string('code');
            $table->timestamp('created_at');
            $table->timestamp('expires_at');
            $table->boolean('is_used')->default(false);

            $table->foreign('user_id')->references('id')->on('utilisateurs');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reset_password_codes');
    }
};
