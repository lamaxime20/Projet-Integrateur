<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('verification_codes', function (Blueprint $table) {
            $table->uuid('id')->primary()->default(DB::raw('uuid_generate_v4()'));
            $table->string('email');
            $table->string('code');
            $table->timestamp('created_at');
            $table->timestamp('expired_at');
            $table->boolean('is_used')->default(false);
        });

        DB::statement("ALTER TABLE verification_codes ADD CONSTRAINT verification_codes_expiration_check CHECK (expired_at <= created_at + INTERVAL '15 minutes')");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('verification_codes');
    }
};
