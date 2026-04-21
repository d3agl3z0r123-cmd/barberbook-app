<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('barbershops', function (Blueprint $table): void {
            $table->string('background_image_path')->nullable()->after('image_url');
            $table->string('background_image_url')->nullable()->after('background_image_path');
            $table->string('logo_path')->nullable()->after('background_image_url');
            $table->string('logo_url')->nullable()->after('logo_path');
        });

        DB::table('barbershops')
            ->whereNull('background_image_path')
            ->update([
                'background_image_path' => DB::raw('image_path'),
                'background_image_url' => DB::raw('image_url'),
            ]);
    }

    public function down(): void
    {
        Schema::table('barbershops', function (Blueprint $table): void {
            $table->dropColumn([
                'background_image_path',
                'background_image_url',
                'logo_path',
                'logo_url',
            ]);
        });
    }
};
