<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reset_password_codes', function (Blueprint $table) {
            $table->uuid('id')->primary()->default(DB::raw('uuid_generate_v4()'));
            $table->uuid('user_id');
            $table->string('code');
            $table->timestamp('created_at')->default(DB::raw('CURRENT_TIMESTAMP'));
            $table->timestamp('expires_at');
            $table->boolean('is_used')->default(false);

            $table->foreign('user_id')->references('id')->on('utilisateurs');
        });

        DB::statement("ALTER TABLE reset_password_codes ADD CONSTRAINT reset_password_expiration_check CHECK (expires_at <= created_at + INTERVAL '15 minutes')");
    }

    public function down(): void
    {
        Schema::dropIfExists('reset_password_codes');
    }
};
