<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table): void {
            if (! Schema::hasColumn('users', 'is_active')) {
                $table->boolean('is_active')->default(true)->after('timezone');
            }

            if (! Schema::hasColumn('users', 'is_super_admin')) {
                $table->boolean('is_super_admin')->default(false)->after('is_active');
            }

            if (! Schema::hasColumn('users', 'disabled_at')) {
                $table->timestamp('disabled_at')->nullable()->after('is_super_admin');
            }
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table): void {
            if (Schema::hasColumn('users', 'disabled_at')) {
                $table->dropColumn('disabled_at');
            }

            if (Schema::hasColumn('users', 'is_super_admin')) {
                $table->dropColumn('is_super_admin');
            }

            if (Schema::hasColumn('users', 'is_active')) {
                $table->dropColumn('is_active');
            }
        });
    }
};
