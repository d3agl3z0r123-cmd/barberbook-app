<?php

return [
    'name' => env('APP_NAME', 'BarberPro'),
    'env' => env('APP_ENV', 'production'),
    'debug' => (bool) env('APP_DEBUG', false),
    'url' => env('APP_URL', 'http://localhost'),
    'frontend_url' => env('FRONTEND_URL', 'http://localhost:3000'),
    'timezone' => env('APP_TIMEZONE', 'Atlantic/Azores'),
    'locale' => 'pt_PT',
    'fallback_locale' => 'en',
    'faker_locale' => 'pt_PT',
    'key' => env('APP_KEY'),
    'cipher' => 'AES-256-CBC',
];
