"use client";

import type React from "react";
import { useState } from "react";
import { User, LogOut, Menu } from "lucide-react";

import { cn } from "../../lib/utils";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../components/ui/avatar";
import { Button } from "../../components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "../../components/ui/sheet";
import { IconWrapper } from "../icons";
import { ThemeToggle } from "../ui/theme-toggle";

interface NavItem {
  title: string;
  href: string;
  disabled?: boolean;
}

interface NavbarProps {
  items?: NavItem[] | undefined;
  children?: React.ReactNode;
  className?: string;
  logoText?: string;
  logoSrc?: string;
  isLoading?: boolean;
  user?: any;
  onNavigateHome?: () => void;
  onNavItemClick?: (href: string) => void;
  onProfileSelected?: () => void;
  onLogout?: () => void;
  // signinUrl?: string;
  identityHost?: string;
  environmentId?: string;
}

export function Navbar({
  items = [
    // { title: "Dashboard", href: "/dashboard" },
  ],
  children,
  className,
  logoText = "ACME Corp",
  logoSrc,
  user = {
    name: "John Doe",
    email: "john@example.com",
    image: "https://i.pravatar.cc/150?u=a042581f4e29026704d",
  },
  onNavigateHome = () => console.log("Navigating to home"),
  onNavItemClick = (href: string) => console.log(`Navigating to ${href}`),
  onProfileSelected,
  onLogout = () => console.log("Logout clicked"),
  isLoading = false,
  identityHost = "https://stg-id.authdog.xyz",
  environmentId = "58be35b0-708f-49f6-84f0-6695d307d997",
}: NavbarProps) {
  const [open, setOpen] = useState(false);
  const [logoFailed, setLogoFailed] = useState(false);
  const isAuthenticated =
    user !== null &&
    user !== undefined &&
    user.id !== null &&
    user.id !== undefined;

  return (
    <header
      className={cn(
        // Keep the navbar simple and predictable so host apps can style around it.
        // We avoid sticky positioning, backdrop filters, and custom width constraints.
        "w-full border-b bg-background",
        className,
      )}
    >
      <div
        className={cn(
          // Basic centered container with horizontal padding.
          "mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 md:px-6",
        )}
      >
        <div className="flex items-center gap-3 md:gap-4">
          <button
            type="button"
            onClick={onNavigateHome}
            className={cn(
              "group inline-flex items-center gap-2 md:gap-3 rounded-md px-1 py-1 text-left",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
            )}
            aria-label="Go to homepage"
          >
            {logoSrc && !logoFailed && (
              <span className="inline-flex h-8 w-8 items-center justify-center overflow-hidden rounded-md bg-muted/80 ring-1 ring-border">
                <img
                  src={logoSrc}
                  alt={logoText}
                  className="h-7 w-7 object-contain"
                  onError={() => setLogoFailed(true)}
                />
              </span>
            )}
            <span className="text-base font-semibold tracking-tight md:text-lg group-hover:text-primary">
              {logoText}
            </span>
          </button>
          {children}
        </div>
        <div className="flex flex-1 items-center justify-end gap-6">
          <nav className="hidden md:flex items-center gap-6">
            {items?.map((item, index) => (
              <span
                key={index}
                onClick={() => {
                  if (!item.disabled) {
                    onNavItemClick(item.href);
                  }
                }}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary cursor-pointer",
                  item.disabled && "cursor-not-allowed opacity-80",
                )}
              >
                {item.title}
              </span>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden"
                  aria-label="Open Menu"
                >
                  <IconWrapper Icon={Menu} />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="pr-0">
                <nav className="grid gap-2 py-6">
                  {items?.map((item, index) => (
                    <a
                      key={index}
                      href={item.href}
                      className={cn(
                        "flex w-full items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent",
                        item.disabled && "cursor-not-allowed opacity-80",
                      )}
                      onClick={() => setOpen(false)}
                    >
                      {item.title}
                    </a>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>
            <ThemeToggle />
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-8 w-8 rounded-full"
                    disabled={isLoading}
                  >
                    <Avatar className="h-8 w-8">
                      {isLoading ? (
                        <div className="h-8 w-8 animate-pulse bg-muted rounded-full" />
                      ) : (
                        <>
                          <AvatarImage
                            src={user.photos?.[0]?.value || "/placeholder.svg"}
                            alt={user.displayName}
                          />
                          <AvatarFallback>
                            {user.displayName?.charAt(0)}
                          </AvatarFallback>
                        </>
                      )}
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  {isLoading ? (
                    <div className="p-4">
                      <div className="h-4 w-3/4 animate-pulse bg-muted rounded mb-2" />
                      <div className="h-3 w-1/2 animate-pulse bg-muted rounded" />
                    </div>
                  ) : (
                    <>
                      <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col space-y-1">
                          <p className="text-sm font-medium leading-none">
                            {user.displayName}
                          </p>
                          <p className="text-xs leading-none text-muted-foreground">
                            {user.emails?.[0]?.value}
                          </p>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuGroup>
                        <DropdownMenuItem onClick={onProfileSelected}>
                          <IconWrapper Icon={User} />
                          <span>Profile</span>
                        </DropdownMenuItem>
                      </DropdownMenuGroup>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={onLogout}>
                        <IconWrapper Icon={LogOut} />
                        <span>Log out</span>
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                variant="default"
                aria-label="Sign in"
                onClick={() => {
                  if (!environmentId) {
                    throw new Error("Environment ID is required");
                  }

                  if (!identityHost) {
                    throw new Error("Identity Host is required");
                  }

                  const signinUrl = `${identityHost}/signin/${environmentId}`;
                  window.open(signinUrl, "_blank");
                }}
              >
                Sign in
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
