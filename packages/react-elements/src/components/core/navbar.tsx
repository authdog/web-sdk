"use client"

import type React from "react"

import { useState } from "react"
import * as LucideIcons from "lucide-react"

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
  onLogout?: () => void
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
    image: "/placeholder.svg?height=32&width=32",
  },
  onLogout = () => console.log("Logout clicked"),
}: NavbarProps) {
  const [open, setOpen] = useState(false)
  const UserIcon = LucideIcons.User as any
  const SettingsIcon = LucideIcons.Settings as any
  const LogOutIcon = LucideIcons.LogOut as any
  const MenuIcon = LucideIcons.Menu as any

  return (
    <header className={cn("border-b bg-background", className)}>
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-4">
          {/* <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-bold">{logoText}</span>
          </Link> */}
          <nav className="hidden md:flex gap-6">
            {items?.map((item, index) => (
            //   <Link
            //     key={index}
            //     href={item.href}
            //     className={cn(
            //       "text-sm font-medium transition-colors hover:text-primary",
            //       item.disabled && "cursor-not-allowed opacity-80",
            //     )}
            //   >
            //     {item.title}
            //   </Link>
                <a href={item?.href}>
                    {item.title}
                </a>
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
                <DropdownMenuItem>
                  <UserIcon className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <SettingsIcon className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onLogout}>
                <LogOutIcon className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden" aria-label="Open Menu">
                <MenuIcon className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="pr-0">
              <nav className="grid gap-2 py-6">
                {items?.map((item, index) => (
                //   <Link
                //     key={index}
                //     href={item.href}
                //     className={cn(
                //       "flex w-full items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent",
                //       item.disabled && "cursor-not-allowed opacity-80",
                //     )}
                //     onClick={() => setOpen(false)}
                //   >
                //     {item.title}
                //   </Link>
                <a href="https://www.goo.bar" />
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
