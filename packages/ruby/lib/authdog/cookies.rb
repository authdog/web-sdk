# frozen_string_literal: true

require "uri"

module Authdog
  module Cookies
    SESSION_COOKIE_NAME = "authdog-session"

    module_function

    def parse(cookie_header)
      return {} if cookie_header.nil? || cookie_header.empty?

      cookie_header.split(";").each_with_object({}) do |part, cookies|
        trimmed = part.strip
        idx = trimmed.index("=")
        next if idx.nil? || idx.zero?

        name = trimmed[0...idx].strip
        next if name.empty?

        raw = trimmed[(idx + 1)..].strip
        cookies[name] = URI.decode_www_form_component(raw)
      end
    end

    def session_token(authorization, cookie_header)
      if authorization&.match?(/\ABearer\s+/i)
        token = authorization.sub(/\ABearer\s+/i, "").strip
        return token unless token.empty?
      end
      parse(cookie_header)[SESSION_COOKIE_NAME]
    end
  end
end
