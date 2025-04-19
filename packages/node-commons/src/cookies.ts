// Function to parse cookies from request
export const parseCookies = (cookieHeader: string | null) => {
  if (!cookieHeader) {
    return [];
  }

  return cookieHeader.split(";").map((cookie) => {
    const [name, value] = cookie.trim().split("=");
    return { name, value };
  });
};
