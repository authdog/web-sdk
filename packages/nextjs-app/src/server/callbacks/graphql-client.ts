import { getPublicKeyPayload } from "../../commons";

interface RawGraphQLResponse {
  data?: Record<string, unknown>;
  errors?: { message: string }[];
}

const buildGraphQLEndpoint = (publicKey: string) => {
  const { identityHost, environmentId } = getPublicKeyPayload(publicKey);
  const trimmedHost = identityHost.replace(/\/+$/, "");
  return `${trimmedHost}/edge/${environmentId}/graphql`;
};

export const runIdentityGraphQLRequest = async <T>(
  publicKey: string,
  token: string,
  query: string,
  variables: Record<string, unknown>,
): Promise<T> => {
  const response = await fetch(buildGraphQLEndpoint(publicKey), {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ query, variables }),
  });

  const rawBody = await response.text();
  let payload: RawGraphQLResponse;

  try {
    payload = JSON.parse(rawBody);
  } catch (error) {
    throw new Error(`Failed to parse GraphQL response: ${rawBody}`);
  }

  if (!response.ok) {
    const message =
      payload?.errors?.[0]?.message ??
      `GraphQL request failed (${response.status})`;
    throw new Error(message);
  }

  if (payload.errors?.length) {
    throw new Error(payload.errors[0].message);
  }

  if (!payload.data) {
    throw new Error("GraphQL response is missing data");
  }

  return payload.data as T;
};
