<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('barbershops', function (Blueprint $table): void {
            $table->unsignedBigInteger('qr_scan_count')->default(0)->after('qr_metadata');
            $table->timestamp('qr_last_scanned_at')->nullable()->after('qr_scan_count');
        });
    }

    public function down(): void
    {
        Schema::table('barbershops', function (Blueprint $table): void {
            $table->dropColumn([
                'qr_scan_count',
                'qr_last_scanned_at',
            ]);
        });
    }
};
