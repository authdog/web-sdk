export const logoutHandler = async (
  request: Request,
  secretKey: string,
): Promise<Response> => {
  // Clear the session cookie
  const response = new Response(null, { status: 302 });

  // Set cookie to expire immediately
  response.headers.set(
    "Set-Cookie",
    "authdog-session=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Lax",
  );

  // Redirect to home page or specified redirect URL
  const url = new URL(request.url);
  const redirectUrl = url.searchParams.get("redirect_uri") || "/";

  response.headers.set("Location", redirectUrl);

  return response;
};
