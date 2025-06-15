import type { Story } from '@ladle/react';
import { UserProfile, UserProfileProps } from '../components/core/user-profile';
import "../global.css";

export const Default: Story = () => (
  <UserProfile
    user={{
      id: "123",
      displayName: "Jaylon Dias",
      emails: [{ value: "example@authdog.xyz" }],
      photos: [{ value: "https://i.pravatar.cc/150?u=a042581f4e29026704d" }],
      provider: "authdog", 
    }}
    loading={false}
    handleAuthenticated={() => {}}
    emails={[{ address: "example@authdog.xyz", isPrimary: true }]}
  />
);
Default.storyName = 'Default User Profile';

export const WithCustomUser: Story = () => (
  <UserProfile 
    user={{
      id: "123",
      displayName: "Jaylon Dias",
      emails: [{ value: "example@authdog.xyz" }],
      photos: [{ value: "https://i.pravatar.cc/150?u=a042581f4e29026704d" }],
      provider: "authdog", 
    }}
    loading={false}
    handleAuthenticated={() => {}}
    emails={[{ address: "example@authdog.xyz", isPrimary: true }]}
  />
);
WithCustomUser.storyName = 'User Profile with Custom User';

export const WithMultipleEmails: Story = () => (
  <UserProfile 
    user={{
      id: "123",
      displayName: "Jaylon Dias",
      emails: [{ value: "example@authdog.xyz" }, { value: "example@gmail.com" }],
      photos: [{ value: "https://i.pravatar.cc/150?u=a042581f4e29026704d" }],
      provider: "authdog", 
    }}
    loading={false}
    handleAuthenticated={() => {}}
    emails={[{ address: "example@authdog.xyz", isPrimary: true }, { address: "example@gmail.com", isPrimary: false }]}
  />
);
WithMultipleEmails.storyName = 'User Profile with Multiple Emails';

export const WithConnectedAccounts: Story = () => (
  <UserProfile 
    user={{
      id: "123",
      displayName: "Alex Johnson",
      emails: [{ value: "alex@example.com" }],
      photos: [{ value: "https://i.pravatar.cc/150?u=a042581f4e29026704d" }],
      provider: "authdog", 
    }}
    loading={false}
    handleAuthenticated={() => {}}
    emails={[{ address: "alex@example.com", isPrimary: true }]}
  />
);
WithConnectedAccounts.storyName = 'User Profile with Connected Accounts'; 