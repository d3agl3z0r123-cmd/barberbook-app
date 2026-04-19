<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('barbershops', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('owner_id')->constrained('users')->cascadeOnDelete();
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('address')->nullable();
            $table->string('phone', 30)->nullable();
            $table->text('description')->nullable();
            $table->string('timezone')->default('Atlantic/Azores');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('barbershop_user', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('barbershop_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('role', 20);
            $table->timestamps();
            $table->unique(['barbershop_id', 'user_id']);
        });

        Schema::create('operating_hours', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('barbershop_id')->constrained()->cascadeOnDelete();
            $table->unsignedTinyInteger('weekday');
            $table->time('opens_at')->nullable();
            $table->time('closes_at')->nullable();
            $table->boolean('is_closed')->default(false);
            $table->timestamps();
            $table->unique(['barbershop_id', 'weekday']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('operating_hours');
        Schema::dropIfExists('barbershop_user');
        Schema::dropIfExists('barbershops');
    }
};
