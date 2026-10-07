# frozen_string_literal: true

module Authdog
  module Rack
    # Attaches the session on env["authdog.context"]. Never blocks.
    class AttachSession
      def initialize(app, public_key:, client: nil)
        @app = app
        @client = client || Client.new(public_key)
      end

      def call(env)
        env["authdog.context"] = @client.resolve(env["HTTP_AUTHORIZATION"], env["HTTP_COOKIE"])
        @app.call(env)
      end
    end

    # The auth gate. Responds 401 unless the attached (or freshly resolved) session is authenticated.
    class RequireAuth
      def initialize(app, public_key: nil, client: nil)
        @app = app
        @client = client || (public_key && Client.new(public_key))
      end

      def call(env)
        context = env["authdog.context"] || @client&.resolve(env["HTTP_AUTHORIZATION"], env["HTTP_COOKIE"])
        env["authdog.context"] = context
        if context&.authenticated
          @app.call(env)
        else
          [401, { "content-type" => "application/json" }, ['{"error":"Unauthorized"}']]
        end
      end
    end

    # Expires authdog-session and redirects to a sanitized redirect_uri.
    class Logout
      def initialize(app = nil, public_key: nil, client: nil)
        @client = client || Client.new(public_key)
      end

      def call(env)
        params = ::Rack::Utils.parse_query(env["QUERY_STRING"].to_s) if defined?(::Rack::Utils)
        params ||= query(env["QUERY_STRING"].to_s)
        result = @client.logout(params["redirect_uri"])
        [302, { "location" => result.location, "set-cookie" => result.set_cookie }, []]
      end

      private

      def query(qs)
        qs.split("&").each_with_object({}) do |part, acc|
          key, value = part.split("=", 2)
          next if key.nil? || key.empty?

          acc[URI.decode_www_form_component(key)] = URI.decode_www_form_component(value.to_s)
        end
      end
    end
  end
end
