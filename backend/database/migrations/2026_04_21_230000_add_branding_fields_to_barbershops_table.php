<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('barbershops', function (Blueprint $table): void {
            $table->string('image_path')->nullable()->after('description');
            $table->string('image_url')->nullable()->after('image_path');
            $table->string('instagram_url')->nullable()->after('image_url');
            $table->string('facebook_url')->nullable()->after('instagram_url');
        });
    }

    public function down(): void
    {
        Schema::table('barbershops', function (Blueprint $table): void {
            $table->dropColumn([
                'image_path',
                'image_url',
                'instagram_url',
                'facebook_url',
            ]);
        });
    }
};
