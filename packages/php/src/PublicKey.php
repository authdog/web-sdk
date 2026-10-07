<?php

declare(strict_types=1);

namespace Authdog;

final class PublicKeyException extends \InvalidArgumentException
{
}

final class PublicKeyPayload
{
    public function __construct(
        public readonly string $environmentId,
        public readonly string $identityHost,
    ) {
    }
}

final class PublicKey
{
    /** @var list<string> */
    private const DEFAULT_SUFFIXES = ['authdog.com', 'authdog.xyz'];

    public static function assertTrustedIdentityHost(string $identityHost, ?string $extraHosts = null): string
    {
        $parts = parse_url($identityHost);
        if (!is_array($parts) || !isset($parts['scheme'], $parts['host'])) {
            throw new PublicKeyException('Invalid identity host');
        }
        if (strtolower((string) $parts['scheme']) !== 'https') {
            throw new PublicKeyException('Identity host must use https');
        }

        $hostname = strtolower((string) $parts['host']);
        if (self::isPrivateOrLoopback($hostname)) {
            throw new PublicKeyException('Untrusted identity host');
        }

        $allowed = false;
        foreach (self::suffixes($extraHosts) as $suffix) {
            if ($hostname === $suffix || str_ends_with($hostname, '.'.$suffix)) {
                $allowed = true;
                break;
            }
        }
        if (!$allowed) {
            throw new PublicKeyException('Untrusted identity host');
        }

        return rtrim($identityHost, '/');
    }

    public static function validateAndParse(string $publicKey, ?string $extraHosts = null): PublicKeyPayload
    {
        if ($publicKey === '') {
            throw new PublicKeyException('Public key is not defined');
        }
        if (!str_starts_with($publicKey, 'pk_')) {
            throw new PublicKeyException('Invalid public key');
        }

        $raw = substr($publicKey, 3);
        $padded = $raw.str_repeat('=', (4 - strlen($raw) % 4) % 4);
        $decoded = base64_decode($padded, true);
        if ($decoded === false) {
            throw new PublicKeyException('Failed to parse public key');
        }

        try {
            $payload = json_decode($decoded, true, 512, JSON_THROW_ON_ERROR);
        } catch (\JsonException) {
            throw new PublicKeyException('Failed to parse public key');
        }
        if (!is_array($payload)) {
            throw new PublicKeyException('Invalid public key payload');
        }

        $environmentId = $payload['environmentId'] ?? '';
        $identityHost = $payload['identityHost'] ?? '';
        if (!is_string($environmentId) || $environmentId === '') {
            throw new PublicKeyException('Invalid public key: missing environmentId');
        }
        if (!is_string($identityHost) || $identityHost === '') {
            throw new PublicKeyException('Invalid public key: missing identityHost');
        }

        $extra = $extraHosts ?? (getenv('AUTHDOG_ALLOWED_IDENTITY_HOSTS') ?: null);

        return new PublicKeyPayload($environmentId, self::assertTrustedIdentityHost($identityHost, $extra));
    }

    /** @return list<string> */
    private static function suffixes(?string $extraHosts): array
    {
        $suffixes = self::DEFAULT_SUFFIXES;
        if ($extraHosts === null || $extraHosts === '') {
            return $suffixes;
        }
        foreach (explode(',', $extraHosts) as $part) {
            $trimmed = strtolower(trim($part));
            if ($trimmed !== '') {
                $suffixes[] = $trimmed;
            }
        }

        return $suffixes;
    }

    private static function isPrivateOrLoopback(string $hostname): bool
    {
        $h = strtolower($hostname);
        if (str_starts_with($h, '[') && str_ends_with($h, ']')) {
            $h = substr($h, 1, -1);
        }
        if ($h === 'localhost' || str_ends_with($h, '.localhost')) {
            return true;
        }
        if (str_starts_with($h, '127.') || str_starts_with($h, '10.') || str_starts_with($h, '192.168.') || str_starts_with($h, '169.254.')) {
            return true;
        }
        if (preg_match('/^172\.(1[6-9]|2\d|3[01])\./', $h) === 1) {
            return true;
        }
        if ($h === '::1' || $h === '[::1]') {
            return true;
        }

        return str_starts_with($h, 'fc') || str_starts_with($h, 'fd') || str_starts_with($h, '[fc') || str_starts_with($h, '[fd');
    }
}
