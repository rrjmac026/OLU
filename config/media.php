<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Where NEW uploads go
    |--------------------------------------------------------------------------
    | "local" = storage/app/private (development)
    | "drive" = Google Drive (deployment)
    |
    | Old files keep working after you switch: a Drive file is stored as
    | "drive:<id>" in the database, anything else is a local path.
    */
    'driver' => env('MEDIA_DRIVER', 'local'),

    'drive' => [
        'client_id' => env('GOOGLE_DRIVE_CLIENT_ID'),
        'client_secret' => env('GOOGLE_DRIVE_CLIENT_SECRET'),
        'refresh_token' => env('GOOGLE_DRIVE_REFRESH_TOKEN'),
        'folder_id' => env('GOOGLE_DRIVE_FOLDER_ID'),
    ],

];
