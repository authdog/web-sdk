<?php

declare(strict_types=1);

namespace Authdog;

final class Cookies
{
    public const SESSION_COOKIE_NAME = 'authdog-session';

    /** @return array<string, string> */
    public static function parse(?string $cookieHeader): array
    {
        if ($cookieHeader === null || $cookieHeader === '') {
            return [];
        }
        $cookies = [];
        foreach (explode(';', $cookieHeader) as $part) {
            $trimmed = trim($part);
            $idx = strpos($trimmed, '=');
            if ($idx === false || $idx === 0) {
                continue;
            }
            $name = trim(substr($trimmed, 0, $idx));
            if ($name === '') {
                continue;
            }
            $raw = trim(substr($trimmed, $idx + 1));
            $value = rawurldecode($raw);
            $cookies[$name] = $value;
        }

        return $cookies;
    }

    public static function sessionToken(?string $authorization, ?string $cookieHeader): ?string
    {
        if ($authorization !== null && preg_match('/^Bearer\s+/i', $authorization) === 1) {
            $token = trim((string) preg_replace('/^Bearer\s+/i', '', $authorization));
            if ($token !== '') {
                return $token;
            }
        }
        $cookies = self::parse($cookieHeader);

        return $cookies[self::SESSION_COOKIE_NAME] ?? null;
    }
}
