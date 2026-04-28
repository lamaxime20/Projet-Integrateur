<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('logs', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('type');
            $table->string('description');
            $table->timestamp('date');
            $table->string('source_type');
            $table->string('source_id');
            $table->enum('gravite', ['faible', 'moyenne', 'critique']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('logs');
    }
};
