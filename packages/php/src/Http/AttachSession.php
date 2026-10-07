<?php

declare(strict_types=1);

namespace Authdog\Http;

use Authdog\Authdog;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Server\MiddlewareInterface;
use Psr\Http\Server\RequestHandlerInterface;

/** Attaches the session. Does not block the request. */
final class AttachSession implements MiddlewareInterface
{
    public function __construct(private readonly Authdog $authdog)
    {
    }

    public function process(ServerRequestInterface $request, RequestHandlerInterface $handler): ResponseInterface
    {
        $ctx = $this->authdog->resolve(
            $request->getHeaderLine('Authorization') ?: null,
            $request->getHeaderLine('Cookie') ?: null,
        );

        return $handler->handle($request->withAttribute(Authdog::ATTRIBUTE, $ctx));
    }
}
