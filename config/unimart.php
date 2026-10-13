<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Allowed University Email Domains
    |--------------------------------------------------------------------------
    | Comma-separated list of allowed email domains (e.g. 'university.edu.ph').
    | If empty, any valid email address is accepted.
    */
    'allowed_email_domains' => array_values(array_filter(array_map(
        fn (string $domain) => strtolower(trim($domain)),
        explode(',', (string) env('UNIMART_ALLOWED_EMAIL_DOMAINS', ''))
    ))),

    /*
    |--------------------------------------------------------------------------
    | Listing Configuration
    |--------------------------------------------------------------------------
    */
    'listing_max_images' => 5,
    'listing_image_max_kb' => 4096,
];
