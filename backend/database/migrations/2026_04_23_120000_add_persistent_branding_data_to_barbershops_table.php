<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('barbershops', function (Blueprint $table): void {
            if (! Schema::hasColumn('barbershops', 'background_image_data_url')) {
                $table->longText('background_image_data_url')->nullable()->after('background_image_url');
            }

            if (! Schema::hasColumn('barbershops', 'logo_data_url')) {
                $table->longText('logo_data_url')->nullable()->after('logo_url');
            }
        });
    }

    public function down(): void
    {
        Schema::table('barbershops', function (Blueprint $table): void {
            if (Schema::hasColumn('barbershops', 'background_image_data_url')) {
                $table->dropColumn('background_image_data_url');
            }

            if (Schema::hasColumn('barbershops', 'logo_data_url')) {
                $table->dropColumn('logo_data_url');
            }
        });
    }
};
