<?php

declare(strict_types=1);

namespace Authdog\Http;

use Authdog\Authdog;
use Closure;

final class LaravelRequireAuth
{
    public function __construct(private readonly Authdog $authdog)
    {
    }

    public function handle(object $request, Closure $next): mixed
    {
        $authorization = method_exists($request, 'header') ? $request->header('Authorization') : null;
        $cookie = method_exists($request, 'header') ? $request->header('Cookie') : null;
        $gate = $this->authdog->requireAuth(
            is_string($authorization) ? $authorization : null,
            is_string($cookie) ? $cookie : null,
        );
        if (!$gate->authenticated) {
            return $gate;
        }

        return $next($request);
    }
}
