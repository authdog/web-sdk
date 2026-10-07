# frozen_string_literal: true

require "json"
require "net/http"
require "uri"

module Authdog
  Context = Struct.new(:token, :user, :authenticated, :user_info, keyword_init: true) do
    def self.anonymous
      new(token: nil, user: nil, authenticated: false, user_info: nil)
    end
  end

  Gate = Struct.new(:authenticated, :context, :status, :body, keyword_init: true)
  Logout = Struct.new(:location, :set_cookie, keyword_init: true)

  # Session resolver shared by the Rack, Rails, and Sinatra adapters.
  class Client
    attr_reader :payload

    def initialize(public_key, fetch_user: true, fetcher: nil)
      raise PublicKeyError, "Public key is not defined" if public_key.nil? || public_key.empty?

      @payload = PublicKey.validate_and_parse(public_key)
      @fetch_user = fetch_user
      @fetcher = fetcher || method(:default_fetch)
    end

    def resolve(authorization, cookie_header)
      token = Cookies.session_token(authorization, cookie_header)
      return Context.anonymous if token.nil?
      return Context.new(token: token, user: nil, authenticated: false, user_info: nil) unless @fetch_user

      url = "#{@payload.identity_host}/oidc/#{uri_escape(@payload.environment_id)}/userinfo"
      PublicKey.assert_trusted_identity_host(@payload.identity_host)
      body = @fetcher.call(url, token)
      info = JSON.parse(body)
      if authenticated_info?(info)
        Context.new(token: token, user: info["user"], authenticated: true, user_info: info)
      else
        Context.new(token: token, user: nil, authenticated: false, user_info: info)
      end
    rescue StandardError
      token = Cookies.session_token(authorization, cookie_header)
      return Context.anonymous if token.nil?

      Context.new(token: token, user: nil, authenticated: false, user_info: nil)
    end

    def require_auth(authorization, cookie_header)
      context = resolve(authorization, cookie_header)
      if context.authenticated
        Gate.new(authenticated: true, context: context, status: 200, body: nil)
      else
        Gate.new(authenticated: false, context: context, status: 401, body: '{"error":"Unauthorized"}')
      end
    end

    def logout(redirect_uri)
      Logout.new(
        location: Redirects.sanitize(redirect_uri, "/"),
        set_cookie: Redirects.expired_session_cookie(Redirects.production?)
      )
    end

    private

    def authenticated_info?(info)
      return false unless info.is_a?(Hash)
      meta = info["meta"]
      return false unless meta.is_a?(Hash)

      meta["code"] == 200 && !info["user"].nil?
    end

    def uri_escape(value)
      URI.encode_www_form_component(value).gsub("+", "%20")
    end

    def default_fetch(url, token)
      uri = URI(url)
      PublicKey.assert_trusted_identity_host("#{uri.scheme}://#{uri.host}")
      response = Net::HTTP.start(uri.host, uri.port, use_ssl: uri.scheme == "https") do |http|
        request = Net::HTTP::Get.new(uri)
        request["Authorization"] = "Bearer #{token}"
        http.request(request)
      end
      raise "failed to fetch user info" unless response.is_a?(Net::HTTPSuccess)

      response.body
    end
  end
end
