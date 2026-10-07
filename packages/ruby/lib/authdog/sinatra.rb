# frozen_string_literal: true

module Authdog
  # Mix into a Sinatra application after `use Authdog::Rack::AttachSession`.
  module SinatraHelpers
    def authdog_context
      env["authdog.context"]
    end

    def require_auth!
      return if authdog_context&.authenticated

      halt 401, { "content-type" => "application/json" }, '{"error":"Unauthorized"}'
    end

    def authdog_logout(client)
      result = client.logout(params["redirect_uri"])
      response["Set-Cookie"] = result.set_cookie
      redirect result.location
    end
  end
end
