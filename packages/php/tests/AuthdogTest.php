<?php

declare(strict_types=1);

namespace Authdog\Tests;

use Authdog\Authdog;
use Authdog\Cookies;
use Authdog\Http\AttachSession;
use Authdog\Http\LaravelRequireAuth;
use Authdog\Http\RequireAuth;
use Authdog\PublicKey;
use Authdog\PublicKeyException;
use Authdog\Redirects;
use Nyholm\Psr7\Factory\Psr17Factory;
use Nyholm\Psr7\Response;
use Nyholm\Psr7\ServerRequest;
use PHPUnit\Framework\TestCase;

final class AuthdogTest extends TestCase
{
    public function testParsesPublicKeyAndRejectsUntrustedHosts(): void
    {
        $pk = $this->pk('{"environmentId":"env_1","identityHost":"https://id.authdog.com/"}');
        $payload = PublicKey::validateAndParse($pk);
        self::assertSame('env_1', $payload->environmentId);
        self::assertSame('https://id.authdog.com', $payload->identityHost);

        self::expectException(PublicKeyException::class);
        PublicKey::assertTrustedIdentityHost('https://evil.com');
    }

    public function testCookiesAndRedirects(): void
    {
        $cookies = Cookies::parse('authdog-session=ab=cd==; other=1');
        self::assertSame('ab=cd==', $cookies['authdog-session']);
        self::assertSame('a b', Cookies::parse('k=a%20b')['k']);
        self::assertSame('abc.def', Cookies::sessionToken('Bearer abc.def', 'authdog-session=cookie'));
        self::assertSame('/', Redirects::sanitize('//evil.com'));
        self::assertSame('/dashboard', Redirects::sanitize('/dashboard'));
        self::assertStringContainsString('HttpOnly;', Redirects::expiredSessionCookie(false));
        self::assertStringContainsString('SameSite=Lax', Redirects::expiredSessionCookie(false));
    }

    public function testRequireAuthAndLogout(): void
    {
        $authdog = new Authdog($this->trustedPk(), true, static fn (): string => '{"meta":{"code":200},"user":{"id":"u1"}}');
        $gate = $authdog->requireAuth(null, 'authdog-session=aaa.bbb.ccc');
        self::assertTrue($gate->authenticated);
        self::assertSame('u1', $gate->context->user['id']);

        $denied = new Authdog($this->trustedPk(), true, static fn (): string => '{"meta":{"code":401}}');
        $blocked = $denied->requireAuth('Bearer aaa.bbb.ccc', null);
        self::assertFalse($blocked->authenticated);
        self::assertSame(401, $blocked->status);
        self::assertSame('{"error":"Unauthorized"}', $blocked->body);

        $down = new Authdog($this->trustedPk(), true, static function (): string {
            throw new \RuntimeException('down');
        });
        self::assertFalse($down->resolve('Bearer aaa.bbb.ccc', null)->authenticated);

        $logout = $authdog->logout('//evil.com');
        self::assertSame('/', $logout->location);
        self::assertStringStartsWith('authdog-session=;', $logout->setCookie);
    }

    public function testPsr15RequireAuth(): void
    {
        $factory = new Psr17Factory();
        $authdog = new Authdog($this->trustedPk(), true, static fn (): string => '{"meta":{"code":401}}');
        $middleware = new RequireAuth($authdog, $factory, $factory);
        $request = new ServerRequest('GET', '/me', ['Authorization' => 'Bearer aaa.bbb.ccc']);
        $response = $middleware->process($request, new class implements \Psr\Http\Server\RequestHandlerInterface {
            public function handle(\Psr\Http\Message\ServerRequestInterface $request): \Psr\Http\Message\ResponseInterface
            {
                return new Response(200);
            }
        });
        self::assertSame(401, $response->getStatusCode());
        self::assertSame('{"error":"Unauthorized"}', (string) $response->getBody());
    }

    public function testAttachSessionDoesNotBlock(): void
    {
        $authdog = new Authdog($this->trustedPk(), false);
        $middleware = new AttachSession($authdog);
        $request = new ServerRequest('GET', '/');
        $seen = new \stdClass();
        $seen->ok = false;
        $middleware->process($request, new class($seen) implements \Psr\Http\Server\RequestHandlerInterface {
            public function __construct(private \stdClass $seen)
            {
            }

            public function handle(\Psr\Http\Message\ServerRequestInterface $request): \Psr\Http\Message\ResponseInterface
            {
                $this->seen->ok = $request->getAttribute(Authdog::ATTRIBUTE) !== null;

                return new Response(200);
            }
        });
        self::assertTrue($seen->ok);
    }

    public function testLaravelRequireAuthReturnsTheGate(): void
    {
        $authdog = new Authdog($this->trustedPk(), true, static fn (): string => '{"meta":{"code":401}}');
        $request = new class {
            public function header(string $name): ?string
            {
                return $name === 'Authorization' ? 'Bearer aaa.bbb.ccc' : null;
            }
        };
        $result = (new LaravelRequireAuth($authdog))->handle($request, static fn () => 'next');
        self::assertInstanceOf(\Authdog\Gate::class, $result);
        self::assertFalse($result->authenticated);
    }

    private function trustedPk(): string
    {
        return $this->pk('{"environmentId":"env_1","identityHost":"https://id.authdog.com"}');
    }

    private function pk(string $json): string
    {
        return 'pk_'.base64_encode($json);
    }
}
