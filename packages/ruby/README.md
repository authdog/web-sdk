# authdog

Authdog SDK for Ruby. Rack middleware is the shared adapter: mount it from
Rails (`config.middleware.use`) or Sinatra (`use`). The cookie, `userinfo`
flow, and identity-host allowlist match the other Authdog server SDKs.

## Install

```ruby
gem "authdog"
```

## Quick start

```ruby
# config/application.rb (Rails) or config.ru (Sinatra)
use Authdog::Rack::AttachSession, public_key: ENV["PK_AUTHDOG"]
use Authdog::Rack::RequireAuth
# map "/logout" { run Authdog::Rack::Logout.new(public_key: ENV["PK_AUTHDOG"]) }

# Rails controller
include Authdog::RailsController
before_action :require_auth!

# Sinatra
helpers Authdog::SinatraHelpers
get "/me" do
  require_auth!
  authdog_context.user.to_json
end
```

`AttachSession` never blocks. `RequireAuth` returns
`401 {"error":"Unauthorized"}` unless `userinfo` reports success. Logout
sanitizes `redirect_uri` and expires `authdog-session` with `HttpOnly` and
`SameSite=Lax`.

## License

MIT
