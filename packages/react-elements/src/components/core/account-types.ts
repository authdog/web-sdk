export type AccountTabId =
  | "profile"
  | "mfa"
  | "sessions"
  | "groups"
  | "tokens";

export type ActionResult = {
  success: boolean;
  message?: string;
  secret?: string;
  qrCodeDataUrl?: string;
  backupCodes?: string[];
};

export type AccountEmail = {
  value: string;
  primary?: boolean;
  verified?: boolean;
};

export type AccountUser = {
  id?: string;
  displayName?: string;
  userName?: string;
  provider?: string;
  emails?: AccountEmail[];
  photos?: { value?: string }[];
  verifications?: { email?: string; verified?: boolean }[];
  [key: string]: unknown;
};

export type AccountSession = {
  id: string;
  ipAddress?: string | null;
  location?: string | null;
  userAgent?: string | null;
  createdAt?: string | null;
  expiration?: string | null;
  current?: boolean;
};

export type AccountGroup = {
  id: string;
  name: string;
  description?: string | null;
  memberCount?: number;
  joinedAt?: string | null;
};

export type AccountToken = {
  id: string;
  name: string;
  prefix?: string;
  createdAt?: string | null;
  lastUsedAt?: string | null;
  expiresAt?: string | null;
};

export type TotpStatus = {
  enabled: boolean;
  backupCodesRemaining?: number;
};

export type PasskeyCredential = {
  id: string;
  name?: string;
  createdAt?: string | null;
  lastUsedAt?: string | null;
};
