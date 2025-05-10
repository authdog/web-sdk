"use server";
import Link from "next/link";
import { Settings, User } from "lucide-react";
import {
  getSessionCookie,
  getServerSidePayloadPublicKey,
} from "@authdog/nextjs-app/server";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogoutDropdown } from "@/components/auth/logout-dropdown";
import { LogoutButton } from "@/components/auth/logout-btn";

export default async function Dashboard() {
  const publicKey = process.env.PK_AUTHDOG as string;
  const sessionCookie = await getSessionCookie(publicKey);
  const publicKeyPayload = getServerSidePayloadPublicKey(publicKey);

  const user = sessionCookie?.value ? JSON.parse(sessionCookie?.value) : null;

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background px-4 md:px-6">
        <div className="flex items-center gap-4">
          <Link href="#" className="flex items-center gap-2 font-semibold">
            NextJS app-router demo
          </Link>
          <nav className="hidden md:flex md:gap-4"></nav>
        </div>
        <div className="flex items-center gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage
                    src={user?.photos?.[0]?.value}
                    alt="User Avatar"
                  />
                  <AvatarFallback>
                    {user?.displayName?.charAt(0) || "?"}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem disabled>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem disabled>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
              </DropdownMenuGroup>

              {user && (
                <>
                  <DropdownMenuSeparator />
                  <LogoutDropdown />
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
      <main className="flex-1 p-4 md:p-6">
        <div className="mx-auto max-w-7xl">
          <div className="flex h-full items-center justify-center align-middle text-center">
            <h1 className="text-6xl font-bold text-center">
              Hello {user?.displayName ?? "World"}
            </h1>
          </div>

          <div className="h-full items-center justify-center align-middle text-center">
            {user ? (
              <LogoutButton />
            ) : (
              <>
                <p className="mt-4 text-lg">
                  You are not logged in. Please login to see your profile.
                </p>
                <Link
                  href={`${publicKeyPayload?.identityHost}/signin/${publicKeyPayload?.environmentId}`}
                  className="mt-4 inline-block rounded-md bg-blue-500 px-4 py-2 text-white"
                >
                  Login
                </Link>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
