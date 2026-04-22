<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('appointments', function (Blueprint $table): void {
            if (! Schema::hasColumn('appointments', 'owner_notification_sent_at')) {
                $table->timestamp('owner_notification_sent_at')->nullable()->after('confirmation_sent_at');
            }
        });
    }

    public function down(): void
    {
        Schema::table('appointments', function (Blueprint $table): void {
            if (Schema::hasColumn('appointments', 'owner_notification_sent_at')) {
                $table->dropColumn('owner_notification_sent_at');
            }
        });
    }
};
