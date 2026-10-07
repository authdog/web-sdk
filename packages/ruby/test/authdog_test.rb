# frozen_string_literal: true

require "base64"
require "json"
require_relative "../lib/authdog"

module AuthdogTest
  module_function

  def assert_equal(expected, actual, message = nil)
    return if expected == actual

    raise "expected #{expected.inspect}, got #{actual.inspect}#{message ? " (#{message})" : ""}"
  end

  def assert_true(value)
    raise "expected truthy, got #{value.inspect}" unless value
  end

  def assert_raises(klass)
    yield
    raise "expected #{klass}"
  rescue klass
    nil
  end

  def pk(json)
    "pk_#{Base64.strict_encode64(json)}"
  end

  def trusted_pk
    pk('{"environmentId":"env_1","identityHost":"https://id.authdog.com"}')
  end
end

include AuthdogTest

payload = Authdog::PublicKey.validate_and_parse(pk('{"environmentId":"env_1","identityHost":"https://id.authdog.com/"}'))
assert_equal "env_1", payload.environment_id
assert_equal "https://id.authdog.com", payload.identity_host
assert_raises(Authdog::PublicKeyError) { Authdog::PublicKey.assert_trusted_identity_host("https://evil.com") }
assert_raises(Authdog::PublicKeyError) { Authdog::PublicKey.assert_trusted_identity_host("https://127.0.0.1") }
assert_equal "https://id.self-hosted.test", Authdog::PublicKey.assert_trusted_identity_host("https://id.self-hosted.test", "id.self-hosted.test")

cookies = Authdog::Cookies.parse("authdog-session=ab=cd==; other=1")
assert_equal "ab=cd==", cookies["authdog-session"]
assert_equal "a b", Authdog::Cookies.parse("k=a%20b")["k"]
assert_equal "abc.def", Authdog::Cookies.session_token("Bearer abc.def", "authdog-session=cookie")
assert_equal "/", Authdog::Redirects.sanitize("//evil.com")
assert_equal "/dashboard", Authdog::Redirects.sanitize("/dashboard")
assert_true Authdog::Redirects.expired_session_cookie(false).include?("HttpOnly;")
assert_true Authdog::Redirects.expired_session_cookie(true).include?("Secure;")

client = Authdog::Client.new(trusted_pk, fetcher: lambda { |url, token|
  raise "bad url #{url}" unless url.start_with?("https://id.authdog.com/oidc/env_1/userinfo")
  raise "bad token" unless token == "aaa.bbb.ccc"

  '{"meta":{"code":200},"user":{"id":"u1"}}'
})
gate = client.require_auth(nil, "authdog-session=aaa.bbb.ccc")
assert_true gate.authenticated
assert_equal "u1", gate.context.user["id"]

denied = Authdog::Client.new(trusted_pk, fetcher: ->(*) { '{"meta":{"code":401}}' })
blocked = denied.require_auth("Bearer aaa.bbb.ccc", nil)
assert_equal false, blocked.authenticated
assert_equal 401, blocked.status
assert_equal '{"error":"Unauthorized"}', blocked.body

down = Authdog::Client.new(trusted_pk, fetcher: ->(*) { raise "down" })
assert_equal false, down.resolve("Bearer aaa.bbb.ccc", nil).authenticated

logout = client.logout("//evil.com")
assert_equal "/", logout.location
assert_true logout.set_cookie.start_with?("authdog-session=;")

app = lambda { |env| [200, {}, [env["authdog.context"].authenticated ? "yes" : "no"]] }
attach = Authdog::Rack::AttachSession.new(app, public_key: trusted_pk, client: denied)
status, = attach.call("HTTP_AUTHORIZATION" => "Bearer aaa.bbb.ccc")
assert_equal 200, status

guard = Authdog::Rack::RequireAuth.new(app, client: denied)
status, headers, body = guard.call("HTTP_AUTHORIZATION" => "Bearer aaa.bbb.ccc")
assert_equal 401, status
assert_equal '{"error":"Unauthorized"}', body.join
assert_equal "application/json", headers["content-type"]

logout_app = Authdog::Rack::Logout.new(client: client)
status, headers, = logout_app.call("QUERY_STRING" => "redirect_uri=https%3A%2F%2Fevil.com")
assert_equal 302, status
assert_equal "/", headers["location"]
assert_true headers["set-cookie"].start_with?("authdog-session=;")

rails = Object.new
def rails.request
  env = { "authdog.context" => Authdog::Context.anonymous }
  Object.new.tap { |req| req.define_singleton_method(:env) { env } }
end
rendered = nil
rails.define_singleton_method(:render) { |json:, status:| rendered = [json, status] }
rails.extend(Authdog::RailsController)
rails.require_auth!
assert_equal [{ error: "Unauthorized" }, :unauthorized], rendered

sinatra = Object.new
sinatra.define_singleton_method(:env) { { "authdog.context" => Authdog::Context.anonymous } }
halted = nil
sinatra.define_singleton_method(:halt) { |code, headers, body| halted = [code, headers, body] }
sinatra.extend(Authdog::SinatraHelpers)
sinatra.require_auth!
assert_equal 401, halted[0]
assert_equal '{"error":"Unauthorized"}', halted[2]

puts "ok"
