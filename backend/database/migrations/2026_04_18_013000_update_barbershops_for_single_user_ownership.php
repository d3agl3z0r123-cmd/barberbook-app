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
            $table->foreignId('user_id')->nullable()->after('id')->constrained('users')->cascadeOnDelete();
            $table->string('email')->nullable()->after('phone');
        });

        DB::table('barbershops')
            ->whereNull('user_id')
            ->update([
                'user_id' => DB::raw('owner_id'),
            ]);

        Schema::table('barbershops', function (Blueprint $table): void {
            $table->unique('user_id');
        });
    }

    public function down(): void
    {
        Schema::table('barbershops', function (Blueprint $table): void {
            $table->dropUnique(['user_id']);
            $table->dropConstrainedForeignId('user_id');
            $table->dropColumn('email');
        });
    }
};
