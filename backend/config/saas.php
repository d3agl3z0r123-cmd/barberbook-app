<?php

return [
    'default_timezone' => env('APP_TIMEZONE', 'Atlantic/Azores'),
    'storage_timezone' => 'UTC',
    'super_admin_email' => env('SUPER_ADMIN_EMAIL', env('ADMIN_EMAIL', 'd3agl3z0r123@gmail.com')),
    'booking' => [
        'slot_step_in_minutes' => 15,
        'min_notice_in_minutes' => 30,
        'max_days_in_advance' => 60,
    ],
    'subscriptions' => [
        'provider' => 'stripe',
        'trial_days' => 14,
    ],
];
