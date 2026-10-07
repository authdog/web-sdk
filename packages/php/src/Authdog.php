<?php

declare(strict_types=1);

namespace Authdog;

final class AuthdogContext
{
    public function __construct(
        public readonly ?string $token,
        public readonly mixed $user,
        public readonly bool $authenticated,
        public readonly ?array $userInfo,
    ) {
    }

    public static function anonymous(): self
    {
        return new self(null, null, false, null);
    }
}

final class Gate
{
    public function __construct(
        public readonly bool $authenticated,
        public readonly AuthdogContext $context,
        public readonly int $status,
        public readonly ?string $body,
    ) {
    }
}

final class Logout
{
    public function __construct(
        public readonly string $location,
        public readonly string $setCookie,
    ) {
    }
}

/**
 * Session resolver. resolve() never throws. requireAuth() is the gate.
 *
 * @phpstan-type Fetcher callable(string, string): string
 */
final class Authdog
{
    public const ATTRIBUTE = 'authdog';

    private PublicKeyPayload $payload;

    /** @var callable(string, string): string */
    private $fetcher;

    /**
     * @param callable(string, string): string|null $fetcher
     */
    public function __construct(string $publicKey, private readonly bool $fetchUser = true, ?callable $fetcher = null)
    {
        if ($publicKey === '') {
            throw new PublicKeyException('Public key is not defined');
        }
        $this->payload = PublicKey::validateAndParse($publicKey);
        $this->fetcher = $fetcher ?? static function (string $url, string $token): string {
            $host = parse_url($url, PHP_URL_SCHEME).'://'.parse_url($url, PHP_URL_HOST);
            PublicKey::assertTrustedIdentityHost($host);
            $context = stream_context_create([
                'http' => [
                    'method' => 'GET',
                    'header' => "Authorization: Bearer {$token}\r\n",
                    'timeout' => 10,
                    'ignore_errors' => true,
                ],
            ]);
            $body = @file_get_contents($url, false, $context);
            if ($body === false) {
                throw new \RuntimeException('failed to fetch user info');
            }

            return $body;
        };
    }

    public function payload(): PublicKeyPayload
    {
        return $this->payload;
    }

    public function resolve(?string $authorization, ?string $cookieHeader): AuthdogContext
    {
        $token = Cookies::sessionToken($authorization, $cookieHeader);
        if ($token === null) {
            return AuthdogContext::anonymous();
        }
        if (!$this->fetchUser) {
            return new AuthdogContext($token, null, false, null);
        }
        try {
            $url = $this->payload->identityHost.'/oidc/'.rawurlencode($this->payload->environmentId).'/userinfo';
            PublicKey::assertTrustedIdentityHost($this->payload->identityHost);
            $body = ($this->fetcher)($url, $token);
            $info = json_decode($body, true);
            if (!is_array($info) || !$this->authenticated($info)) {
                return new AuthdogContext($token, null, false, is_array($info) ? $info : null);
            }

            return new AuthdogContext($token, $info['user'], true, $info);
        } catch (\Throwable) {
            return new AuthdogContext($token, null, false, null);
        }
    }

    public function requireAuth(?string $authorization, ?string $cookieHeader): Gate
    {
        $context = $this->resolve($authorization, $cookieHeader);
        if (!$context->authenticated) {
            return new Gate(false, $context, 401, '{"error":"Unauthorized"}');
        }

        return new Gate(true, $context, 200, null);
    }

    public function logout(mixed $redirectUri): Logout
    {
        return new Logout(
            Redirects::sanitize($redirectUri, '/'),
            Redirects::expiredSessionCookie(Redirects::isProduction()),
        );
    }

    /** @param array<string, mixed> $info */
    private function authenticated(array $info): bool
    {
        $meta = $info['meta'] ?? null;
        if (!is_array($meta)) {
            return false;
        }
        $code = $meta['code'] ?? null;

        return $code === 200 && isset($info['user']) && $info['user'] !== null;
    }
}
