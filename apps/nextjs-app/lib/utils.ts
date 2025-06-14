import { getPublicKeyPayload } from "@authdog/nextjs-app/client";
import { clsx, type ClassValue } from "clsx"
import { useEffect, useState } from "react";
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


// {"user":{"id":"452dca5b-e9ed-48ac-8e42-6d5819e25fd5","environmentId":"25f7afbd-9cfe-4142-b59f-8e26b67b3e62","externalId":"google-oauth20:105993726010800286195","userName":"105993726010800286195","displayName":"David B.","nickName":"","profileUrl":"","title":"","userType":"","preferredLanguage":null,"locale":null,"timezone":null,"active":true,"provider":"google-oauth20","lastLogin":"2025-06-13T01:28:24.415Z","createdAt":"2025-01-12T19:03:22.723Z","updatedAt":"2025-01-12T19:03:22.723Z","names":{"id":"f8496ade-bf81-44d1-925c-2bbd511d5308","userId":"452dca5b-e9ed-48ac-8e42-6d5819e25fd5","formatted":null,"familyName":"B.","givenName":"David","middleName":null,"honorificPrefix":null,"honorificSuffix":null,"createdAt":"2025-06-13T01:28:24.431Z","updatedAt":"2025-06-13T01:28:24.431Z"},"addresses":[],"emails":[{"id":"d9761343-68cc-4741-8733-becaa4c75ca4","userId":"452dca5b-e9ed-48ac-8e42-6d5819e25fd5","value":"david.barrat.1@gmail.com","type":null,"primary":true,"createdAt":"2025-06-13T01:28:24.431Z","updatedAt":"2025-06-13T01:28:24.431Z"}],"phoneNumbers":[],"ims":[],"photos":[{"id":"982bcbda-577b-4b11-a4cc-c9c25709c5c4","userId":"452dca5b-e9ed-48ac-8e42-6d5819e25fd5","value":"https://lh3.googleusercontent.com/a/ACg8ocL5t9krM2I6-01rI61abyUu1d9F6NWY-s_PsyqoFBTVnHx5JrbK=s96-c","type":"photo","createdAt":"2025-01-12T19:03:22.728Z","updatedAt":"2025-01-12T19:03:22.728Z"}]},"meta":{"code":200,"message":"Success"}}
// scim user
export interface User {
  id: string;
  environmentId: string;
  externalId: string;
  userName: string;
  displayName: string;
  nickName: string;
  profileUrl: string;
  title: string;
  userType: string;
  preferredLanguage: string;
  locale: string;
  timezone: string;
  active: boolean;
  provider: string;
  lastLogin: string;
  createdAt: string;
  updatedAt: string;
  names: {
    id: string;
    userId: string;
    formatted: string;
    familyName: string;
    givenName: string;
    middleName: string;
    honorificPrefix: string;
    honorificSuffix: string;
    createdAt: string;
    updatedAt: string;
  };
  addresses: [];
  emails: {
    id: string;
    userId: string;
    value: string;
    type: string;
    primary: boolean;
    createdAt: string;
    updatedAt: string;
  }[];
  phoneNumbers: [];
  ims: [];
  photos: {
    id: string;
    userId: string;
    value: string;
    type: string;
    createdAt: string;
    updatedAt: string;
  }[];
}

export const useUser = (): { user: User | null, isLoading: boolean } => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const publicKey = process.env.NEXT_PUBLIC_PK_AUTHDOG as string;

  useEffect(() => {

    const token = localStorage.getItem("token");

    if (!token) {
      console.log("No token found", token);
      setIsLoading(false);
      return;
    }

    if (!publicKey) {
      throw new Error("Public key is not set");
    }

    const payload = getPublicKeyPayload(publicKey);
    console.log("Payload", payload);

    // /oidc/:environmentId/userinfo
    const identityHost = payload.identityHost;
    const environmentId = payload.environmentId;
    const userinfoUrl = `${identityHost}/oidc/${environmentId}/userinfo`;

    const fetchUser = async () => {

      const response = await fetch(userinfoUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return await response.json();
    };
    Promise.resolve(fetchUser()).then(({ user, meta }) => {
      setUser(user);
      setIsLoading(false);
    }).catch((error) => {
      console.error('Error fetching user:', error);
      setIsLoading(false);
    });
  }, [publicKey]);

  return { user, isLoading };
};
