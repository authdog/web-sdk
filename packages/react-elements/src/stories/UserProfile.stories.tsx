import type { StoryDefault, Story } from "@ladle/react";
import { UserProfile } from "../components/core/user-profile";
import "../global.css";

export default {
  title: "Core/UserProfile",
} satisfies StoryDefault;

const baseUser: any = {
  id: "user_123",
  displayName: "Jane Doe",
  provider: "google-oauth20",
  emails: [{ id: "e1", value: "jane.primary@example.com" }],
  verifications: [],
  photos: [],
};

export const EmailNotVerified: Story = () => {
  return (
    <div className="p-6 bg-background text-foreground">
      <UserProfile loading={false} user={{ ...baseUser }} />
    </div>
  );
};
EmailNotVerified.storyName = "Email not verified";

export const EmailVerified: Story = () => {
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
  return (
    <div className="p-6 bg-background text-foreground">
      <UserProfile loading={false} user={verifiedUser} />
    </div>
  );
};
EmailVerified.storyName = "Email verified";
