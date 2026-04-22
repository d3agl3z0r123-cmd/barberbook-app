<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('barbers', function (Blueprint $table): void {
            if (! Schema::hasColumn('barbers', 'photo_path')) {
                $table->string('photo_path')->nullable()->after('phone');
            }

            if (! Schema::hasColumn('barbers', 'photo_url')) {
                $table->string('photo_url')->nullable()->after('photo_path');
            }
        });
    }

    public function down(): void
    {
        Schema::table('barbers', function (Blueprint $table): void {
            if (Schema::hasColumn('barbers', 'photo_url')) {
                $table->dropColumn('photo_url');
            }

            if (Schema::hasColumn('barbers', 'photo_path')) {
                $table->dropColumn('photo_path');
            }
        });
    }
};
