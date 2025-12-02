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

export default (
  <div className="bg-background p-6 text-foreground">
    <UserProfile loading={false} user={{ ...baseUser }} />
  </div>
);
