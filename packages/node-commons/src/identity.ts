export const fetchUserData = async (
  identityHost: string,
  environmentId: string,
  token: string,
) => {
  const userData = await fetch(
    `${identityHost}/oidc/${environmentId}/userinfo`,
    {
      headers: {
        authorization: `Bearer ${token}`,
      },
    },
  );

  if (!userData.ok) {
    throw new Error("Failed to fetch user info");
  }

  return userData.json();
};
