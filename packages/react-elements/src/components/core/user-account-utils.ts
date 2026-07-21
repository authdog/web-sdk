export type UserButtonUser = {
  id?: string;
  displayName?: string;
  name?: string;
  email?: string;
  emails?: { value: string }[];
  photos?: { value: string }[];
  avatar?: string;
  avatarUrl?: string;
};

export type UserButtonAccount = UserButtonUser & {
  id: string;
};

export const AUTHDOG_WEBSITE = "https://www.authdog.com";

export const getInitials = (name?: string): string => {
  if (!name) return "?";
  const parts = String(name).trim().split(/\s+/);
  const initials = parts
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
  return initials || "?";
};

export const resolveUserDisplay = (user?: UserButtonUser | null) => {
  const displayName = user?.displayName || user?.name || "";
  const email = user?.emails?.[0]?.value || user?.email || "";
  const avatar =
    user?.avatarUrl || user?.photos?.[0]?.value || user?.avatar || "";
  return { displayName, email, avatar };
};
