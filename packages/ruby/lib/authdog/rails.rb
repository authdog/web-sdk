# frozen_string_literal: true

module Authdog
  # Mix into a Rails controller. Mount Rack::AttachSession (and optionally
  # Rack::RequireAuth) in the middleware stack first.
  module RailsController
    def authdog_context
      request.env["authdog.context"]
    end

    def require_auth!
      return if authdog_context&.authenticated

      render json: { error: "Unauthorized" }, status: :unauthorized
    end
  end
end
