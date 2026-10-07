<?php

declare(strict_types=1);

namespace Authdog\Http;

use Authdog\Authdog;
use Psr\Http\Message\ResponseFactoryInterface;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Message\StreamFactoryInterface;
use Psr\Http\Server\MiddlewareInterface;
use Psr\Http\Server\RequestHandlerInterface;

/** Returns 401 unless userinfo authenticated the caller. */
final class RequireAuth implements MiddlewareInterface
{
    public function __construct(
        private readonly Authdog $authdog,
        private readonly ResponseFactoryInterface $responses,
        private readonly StreamFactoryInterface $streams,
    ) {
    }

    public function process(ServerRequestInterface $request, RequestHandlerInterface $handler): ResponseInterface
    {
        $gate = $this->authdog->requireAuth(
            $request->getHeaderLine('Authorization') ?: null,
            $request->getHeaderLine('Cookie') ?: null,
        );
        $request = $request->withAttribute(Authdog::ATTRIBUTE, $gate->context);
        if (!$gate->authenticated) {
            return $this->responses
                ->createResponse(401)
                ->withHeader('Content-Type', 'application/json')
                ->withBody($this->streams->createStream('{"error":"Unauthorized"}'));
        }

        return $handler->handle($request);
    }
}
