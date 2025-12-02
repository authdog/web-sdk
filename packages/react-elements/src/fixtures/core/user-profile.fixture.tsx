"use client";

import React from "react";

import { UserProfile } from "../../components/core/user-profile";

const baseUser: any = {
  id: "user_123",
  displayName: "Jane Doe",
  provider: "google-oauth20",
  emails: [{ id: "e1", value: "jane.primary@example.com" }],
  verifications: [],
  photos: [],
};

const verifiedUser = {
  ...baseUser,
  verifications: [
    {
      id: "v1",
      email: "jane.primary@example.com",
      verified: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],
};

export const EmailNotVerified = (
  <div className="bg-background p-6 text-foreground">
    <UserProfile loading={false} user={{ ...baseUser }} />
  </div>
);

export const EmailVerified = (
  <div className="bg-background p-6 text-foreground">
    <UserProfile loading={false} user={verifiedUser} />
  </div>
);

export default EmailNotVerified;

