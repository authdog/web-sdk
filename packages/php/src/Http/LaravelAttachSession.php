<?php

declare(strict_types=1);

namespace Authdog\Http;

use Authdog\Authdog;
use Closure;

/**
 * Laravel-compatible middleware. `$request->header()` is duck-typed so this
 * class does not depend on illuminate/http.
 */
final class LaravelAttachSession
{
    public function __construct(private readonly Authdog $authdog)
    {
    }

    public function handle(object $request, Closure $next): mixed
    {
        $ctx = $this->authdog->resolve($this->header($request, 'Authorization'), $this->header($request, 'Cookie'));
        if (isset($request->attributes) && is_object($request->attributes) && method_exists($request->attributes, 'set')) {
            $request->attributes->set(Authdog::ATTRIBUTE, $ctx);
        }

        return $next($request);
    }

    private function header(object $request, string $name): ?string
    {
        if (!method_exists($request, 'header')) {
            return null;
        }
        $value = $request->header($name);

        return is_string($value) && $value !== '' ? $value : null;
    }
}
