<?php

declare(strict_types=1);

namespace Authdog;

final class Redirects
{
    public static function sanitize(mixed $target, string $fallback = '/'): string
    {
        if (!is_string($target) || $target === '') {
            return $fallback;
        }
        if (!str_starts_with($target, '/') || str_starts_with($target, '//') || str_starts_with($target, "/\\")) {
            return $fallback;
        }
        if (preg_match('/[\\\\\x00-\x1f\x7f]/', $target) === 1) {
            return $fallback;
        }
        if (preg_match('/^[a-z][a-z0-9+.-]*:/i', $target) === 1) {
            return $fallback;
        }

        return $target;
    }

    public static function expiredSessionCookie(bool $production): string
    {
        $secure = $production ? ' Secure;' : '';

        return Cookies::SESSION_COOKIE_NAME.'=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly;'.$secure.' SameSite=Lax';
    }

    public static function isProduction(): bool
    {
        $node = getenv('NODE_ENV');
        $env = getenv('ENV');

        return ($node !== false && strcasecmp($node, 'production') === 0)
            || ($env !== false && strcasecmp($env, 'production') === 0);
    }
}
