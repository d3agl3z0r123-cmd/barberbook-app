<?php

return [
    'default_timezone' => env('APP_TIMEZONE', 'Atlantic/Azores'),
    'storage_timezone' => 'UTC',
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
