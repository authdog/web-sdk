import type { Story } from '@ladle/react';
import { UserProfile, UserProfileProps } from '../components/core/user-profile';
import "../global.css";

export const Default: Story = () => (
  <UserProfile
    user={{
      name: "Jaylon Dias",
      email: "example@clerk.dev",
      image: "/placeholder-user.jpg"
    }}
  />
);
Default.storyName = 'Default User Profile';

export const WithCustomUser: Story = () => (
  <UserProfile 
    user={{
      name: "Jane Smith",
      email: "jane@example.com",
      image: "/placeholder-user.jpg"
    }}
  />
);
WithCustomUser.storyName = 'User Profile with Custom User';

export const WithMultipleEmails: Story = () => (
  <UserProfile 
    user={{
      name: "John Doe",
      email: "john@example.com",
      image: "/placeholder-user.jpg"
    }}
    emails={[
      { address: "john@example.com", isPrimary: true },
      { address: "john@personal.com", isPrimary: false },
      { address: "john@work.com", isPrimary: false }
    ]}
  />
);
WithMultipleEmails.storyName = 'User Profile with Multiple Emails';

export const WithConnectedAccounts: Story = () => (
  <UserProfile 
    user={{
      name: "Alex Johnson",
      email: "alex@example.com",
      image: "/placeholder-user.jpg"
    }}
    connectedAccounts={[
      { provider: "Google", email: "alex@gmail.com" },
      { provider: "GitHub", email: "alex@github.com" }
    ]}
  />
);
WithConnectedAccounts.storyName = 'User Profile with Connected Accounts'; 