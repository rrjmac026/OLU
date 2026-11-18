<?php

use App\Http\Middleware\EnsureRole;
use App\Http\Middleware\HandleInertiaRequests;
use App\Http\Middleware\NoStore;
use App\Http\Middleware\RequireLogin;
use App\Http\Middleware\ResolveSessionUser;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        channels: __DIR__.'/../routes/channels.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {

        // Trust Render's reverse proxy to detect HTTPS.
        $middleware->trustProxies(at: '*');

        // Order matters: resolve the user before Inertia shares props.
        $middleware->web(append: [
            ResolveSessionUser::class,
            HandleInertiaRequests::class,
            AddLinkHeadersForPreloadedAssets::class,
            NoStore::class,
        ]);

        $middleware->alias([
            'auth.session' => RequireLogin::class,
            'role' => EnsureRole::class,
        ]);

    })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })->create();
