# frozen_string_literal: true

require "base64"
require "json"
require "uri"

module Authdog
  class PublicKeyError < ArgumentError; end

  PublicKeyPayload = Struct.new(:environment_id, :identity_host, keyword_init: true)

  module PublicKey
    DEFAULT_SUFFIXES = ["authdog.com", "authdog.xyz"].freeze

    module_function

    def assert_trusted_identity_host(identity_host, extra_hosts = ENV["AUTHDOG_ALLOWED_IDENTITY_HOSTS"])
      uri = URI.parse(identity_host)
      raise PublicKeyError, "Invalid identity host" if uri.scheme.nil? || uri.host.nil?
      raise PublicKeyError, "Identity host must use https" unless uri.scheme.downcase == "https"

      hostname = uri.host.downcase
      raise PublicKeyError, "Untrusted identity host" if private_or_loopback?(hostname)

      allowed = suffixes(extra_hosts).any? { |suffix| hostname == suffix || hostname.end_with?(".#{suffix}") }
      raise PublicKeyError, "Untrusted identity host" unless allowed

      identity_host.sub(%r{/+\z}, "")
    rescue URI::InvalidURIError
      raise PublicKeyError, "Invalid identity host"
    end

    def validate_and_parse(public_key, extra_hosts = ENV["AUTHDOG_ALLOWED_IDENTITY_HOSTS"])
      raise PublicKeyError, "Public key is not defined" if public_key.nil? || public_key.empty?
      raise PublicKeyError, "Invalid public key" unless public_key.start_with?("pk_")

      raw = public_key.delete_prefix("pk_")
      padded = raw + ("=" * ((4 - raw.length % 4) % 4))
      decoded = Base64.decode64(padded)
      payload = JSON.parse(decoded)
      raise PublicKeyError, "Invalid public key payload" unless payload.is_a?(Hash)

      environment_id = payload["environmentId"]
      identity_host = payload["identityHost"]
      raise PublicKeyError, "Invalid public key: missing environmentId" unless environment_id.is_a?(String) && !environment_id.empty?
      raise PublicKeyError, "Invalid public key: missing identityHost" unless identity_host.is_a?(String) && !identity_host.empty?

      PublicKeyPayload.new(
        environment_id: environment_id,
        identity_host: assert_trusted_identity_host(identity_host, extra_hosts)
      )
    rescue JSON::ParserError, ArgumentError => e
      raise e if e.is_a?(PublicKeyError)

      raise PublicKeyError, "Failed to parse public key"
    end

    def suffixes(extra_hosts)
      list = DEFAULT_SUFFIXES.dup
      extra_hosts.to_s.split(",").each do |part|
        trimmed = part.strip.downcase
        list << trimmed unless trimmed.empty?
      end
      list
    end

    def private_or_loopback?(hostname)
      h = hostname.downcase
      h = h[1..-2] if h.start_with?("[") && h.end_with?("]")
      return true if h == "localhost" || h.end_with?(".localhost")
      return true if h.start_with?("127.", "10.", "192.168.", "169.254.")
      return true if h.match?(/\A172\.(1[6-9]|2\d|3[01])\./)
      return true if h == "::1"
      h.start_with?("fc", "fd", "[fc", "[fd")
    end
  end
end
