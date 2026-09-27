import React from "react";

export const demoUser = {
  id: "user_123",
  displayName: "Alex Rivera",
  provider: "google-oauth20",
  emails: [
    {
      value: "alex.rivera@example.com",
      primary: true,
      verified: true,
    },
    {
      value: "alex@acme.dev",
      verified: true,
    },
  ],
  verifications: [
    { email: "alex.rivera@example.com", verified: true },
    { email: "alex@acme.dev", verified: true },
  ],
  photos: [{ value: "https://i.pravatar.cc/120?u=alex-rivera" }],
};

export const demoSessions = [
  {
    id: "sess_1",
    current: true,
    ipAddress: "82.64.12.10",
    location: "Paris, FR",
    userAgent: "Chrome on macOS",
    createdAt: "2026-07-18T10:00:00Z",
  },
  {
    id: "sess_2",
    ipAddress: "51.15.0.2",
    location: "Zurich, CH",
    userAgent: "Safari on iPhone",
    createdAt: "2026-07-10T08:00:00Z",
  },
];

export const demoGroups = [
  {
    id: "grp_1",
    name: "Engineering",
    description: "Product and platform engineers",
    memberCount: 12,
    joinedAt: "2025-10-12T21:49:03Z",
  },
  {
    id: "grp_2",
    name: "Admins",
    description: "Environment administrators",
    memberCount: 3,
    joinedAt: "2025-08-01T09:00:00Z",
  },
];

export const demoTokens = [
  {
    id: "tok_1",
    name: "CI deploy",
    prefix: "pat_9f2a",
    createdAt: "2026-06-01T12:00:00Z",
    lastUsedAt: "2026-07-19T14:00:00Z",
  },
];

export const demoPasskeys = [
  {
    id: "pk_1",
    name: "MacBook Touch ID",
    createdAt: "2026-05-01T12:00:00Z",
    lastUsedAt: "2026-07-18T10:00:00Z",
  },
];

export const accountLogo = (
  <svg
    viewBox="0 0 24 24"
    className="h-full w-full text-sky-600"
    fill="currentColor"
    aria-hidden
  >
    <path d="M12 2a7 7 0 0 0-6.7 9.1A5.5 5.5 0 0 0 7.5 21h9a5.5 5.5 0 0 0 2.2-10.5A7 7 0 0 0 12 2Zm0 3a4 4 0 0 1 3.9 3.2l.1.6.6.1A2.5 2.5 0 0 1 16.5 14h-9a2.5 2.5 0 0 1-.1-5l.6-.1.1-.6A4 4 0 0 1 12 5Z" />
  </svg>
);
