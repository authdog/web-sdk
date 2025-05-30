"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { User, Settings, LogOut, Menu } from "lucide-react"
import type { LucideProps } from "lucide-react"

import { cn } from "../../lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar"
import { Button } from "../../components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger } from "../../components/ui/sheet"

interface NavItem {
  title: string
  href: string
  disabled?: boolean
}

interface NavbarProps {
  items?: NavItem[]
  children?: React.ReactNode
  className?: string
  logoText?: string
  user?: {
    name?: string
    email?: string
    image?: string
  }
  onNavItemClick?: (href: string) => void;
  onProfileSelected?: () => void;
  onLogout?: () => void;
}

export function Navbar({
  items = [
    { title: "Dashboard", href: "/dashboard" },
    { title: "Projects", href: "/projects" },
    { title: "Team", href: "/team" },
    { title: "Reports", href: "/reports" },
  ],
  children,
  className,
  logoText = "Company",
  user = {
    name: "John Doe",
    email: "john@example.com",
    image: "https://i.pravatar.cc/150?u=a042581f4e29026704d",
  },
  onNavItemClick = (href: string) => console.log(`Navigating to ${href}`),
  onProfileSelected,
  onLogout = () => console.log("Logout clicked"),
}: NavbarProps) {
  const [open, setOpen] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const iconProps: LucideProps = {
    className: "mr-2 h-4 w-4",
    "aria-hidden": "true"
  }

  const renderIcon = (Icon: any) => {
    if (!isMounted) return null
    return <Icon {...iconProps} />
  }

  return (
    <header className={cn("border-b bg-background", className)}>
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-4">
          <span className="text-xl font-bold">{logoText}</span>
          <nav className="hidden md:flex gap-6">
            {items?.map((item, index) => (
              <span
                key={index}
                // href={item.href}
                onClick={() => {
                  if (!item.disabled) {
                    onNavItemClick(item.href)
                  }
                }}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary cursor-pointer",
                  item.disabled && "cursor-not-allowed opacity-80"
                )}
              >
                {item.title}
              </span>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-4">
          {children}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.image || "/placeholder.svg"} alt={user.name} />
                  <AvatarFallback>{user.name?.charAt(0)}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user.name}</p>
                  <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem onClick={onProfileSelected}>
                  {renderIcon(User)}
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  {renderIcon(Settings)}
                  <span>Settings</span>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onLogout}>
                {renderIcon(LogOut)}
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden" aria-label="Open Menu">
                {renderIcon(Menu)}
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
                      item.disabled && "cursor-not-allowed opacity-80"
                    )}
                    onClick={() => setOpen(false)}
                  >
                    {item.title}
                  </a>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
