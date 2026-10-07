# frozen_string_literal: true

module Authdog
  module Redirects
    module_function

    def sanitize(target, fallback = "/")
      return fallback unless target.is_a?(String) && !target.empty?
      return fallback unless target.start_with?("/")
      return fallback if target.start_with?("//", "/\\")
      return fallback if target.match?(/[\\\x00-\x1f\x7f]/)
      return fallback if target.match?(/\A[a-z][a-z0-9+.-]*:/i)

      target
    end

    def expired_session_cookie(production)
      secure = production ? " Secure;" : ""
      "#{Cookies::SESSION_COOKIE_NAME}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly;#{secure} SameSite=Lax"
    end

    def production?
      %w[NODE_ENV ENV RACK_ENV RAILS_ENV].any? { |key| ENV[key].to_s.casecmp("production").zero? }
    end
  end
end
