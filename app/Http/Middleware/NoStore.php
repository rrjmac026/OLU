<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class NoStore
{
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        if ($request->header('X-Inertia') || $response->headers->get('Content-Type') === 'text/html; charset=UTF-8') {
            $response->headers->set('Cache-Control', 'no-store, private');
        }

        return $response;
    }
}