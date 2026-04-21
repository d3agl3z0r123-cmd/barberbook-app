<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('barbershops', function (Blueprint $table): void {
            $table->string('qr_path')->nullable()->after('timezone');
            $table->string('qr_url')->nullable()->after('qr_path');
            $table->timestamp('qr_generated_at')->nullable()->after('qr_url');
            $table->timestamp('qr_last_regenerated_at')->nullable()->after('qr_generated_at');
            $table->json('qr_metadata')->nullable()->after('qr_last_regenerated_at');
        });

        Schema::create('qr_scan_events', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('barbershop_id')->constrained()->cascadeOnDelete();
            $table->string('qr_url')->nullable();
            $table->timestamp('scanned_at')->nullable();
            $table->string('ip_address')->nullable();
            $table->text('user_agent')->nullable();
            $table->string('referrer')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();

            $table->index(['barbershop_id', 'scanned_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('qr_scan_events');

        Schema::table('barbershops', function (Blueprint $table): void {
            $table->dropColumn([
                'qr_path',
                'qr_url',
                'qr_generated_at',
                'qr_last_regenerated_at',
                'qr_metadata',
            ]);
        });
    }
};
