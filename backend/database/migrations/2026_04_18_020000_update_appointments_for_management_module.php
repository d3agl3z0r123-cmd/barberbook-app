<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('appointments', function (Blueprint $table): void {
            $table->string('client_name')->nullable()->after('service_id');
            $table->string('client_phone', 30)->nullable()->after('client_name');
            $table->string('client_email')->nullable()->after('client_phone');
        });

        DB::table('appointments')
            ->whereNull('client_name')
            ->update([
                'client_name' => 'Cliente',
                'client_phone' => '',
            ]);

        Schema::table('appointments', function (Blueprint $table): void {
            $table->foreignId('client_id')->nullable()->change();
            $table->string('status', 20)->default('booked')->change();
        });
    }

    public function down(): void
    {
        Schema::table('appointments', function (Blueprint $table): void {
            $table->dropColumn(['client_name', 'client_phone', 'client_email']);
            $table->foreignId('client_id')->nullable(false)->change();
            $table->string('status', 20)->default('confirmed')->change();
        });
    }
};
