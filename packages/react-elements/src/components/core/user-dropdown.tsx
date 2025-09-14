"use client"

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "../../components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar"
import { cn } from "@authdog/react-elements/lib/utils"
import { LogOut, Settings, ExternalLink } from "lucide-react"

export type UserDropdownLink = {
  label: string
  href?: string
  onClick?: () => void
  icon?: React.ComponentType<any>
}

export interface UserDropdownProps {
  trigger: React.ReactElement
  user: {
    displayName?: string
    name?: string
    email?: string
    emails?: { value: string }[]
    photos?: { value: string }[]
    avatar?: string
  }
  className?: string
  onManageAccount?: () => void
  onSignout?: () => void
  links?: UserDropdownLink[]
  side?: "top" | "right" | "bottom" | "left"
  align?: "start" | "center" | "end"
  sideOffset?: number
}

const getInitials = (name?: string) => {
  if (!name) return "?"
  const parts = String(name).trim().split(/\s+/)
  const initials = parts.slice(0, 2).map((p) => p[0]?.toUpperCase()).join("")
  return initials || "?"
}

export const UserDropdown = ({ trigger, user, className, onManageAccount, onSignout, links = [], side = "bottom", align = "end", sideOffset = 8 }: UserDropdownProps) => {
  const primaryEmail = user?.emails?.[0]?.value || user?.email || ""
  const displayName = user?.displayName || user?.name || ""
  const avatar = user?.photos?.[0]?.value || user?.avatar || ""

  const handleLink = (item: UserDropdownLink) => {
    if (item.onClick) return item.onClick()
    if (item.href) {
      if (item.href.startsWith("http")) {
        window.open(item.href, "_blank")
      } else {
        window.location.assign(item.href)
      }
    }
  }

  const IconExternal = ExternalLink as any

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {trigger}
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align} side={side} sideOffset={sideOffset} className={cn("w-72 p-2 overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md", className)}>
        <div className="flex items-center gap-3 px-4 pt-4 pb-3">
          <Avatar className="h-9 w-9 rounded-full">
            <AvatarImage src={avatar} alt={displayName} />
            <AvatarFallback className="rounded-full">{getInitials(displayName)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <div className="text-sm font-semibold truncate">{displayName}</div>
            <div className="text-xs text-muted-foreground truncate">{primaryEmail}</div>
          </div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="cursor-pointer py-2" onClick={() => onManageAccount?.()}>
          <Settings className="mr-2 h-4 w-4" />
          <span>Manage account</span>
        </DropdownMenuItem>
        {links.map((item, idx) => {
          const Icon = (item.icon ?? IconExternal) as any
          return (
            <DropdownMenuItem key={`${item.label}-${idx}`} className="cursor-pointer py-2" onClick={() => handleLink(item)}>
              <Icon className="mr-2 h-4 w-4" />
              <span>{item.label}</span>
            </DropdownMenuItem>
          )
        })}
        <DropdownMenuSeparator />
        <DropdownMenuItem className="cursor-pointer py-2 rounded-md font-semibold text-red-600 dark:text-red-300 hover:bg-red-50 hover:text-red-700 focus:bg-red-50 focus:text-red-700 dark:hover:bg-red-500/20 dark:focus:bg-red-500/25 dark:hover:text-red-100 dark:focus:text-red-100 border border-transparent dark:border-red-500/30 ring-0 focus-visible:ring-2 focus-visible:ring-red-400/40 dark:focus-visible:ring-red-400/40" onClick={() => onSignout?.()}>
          <LogOut className="mr-2 h-4 w-4 text-red-600 dark:text-red-300" />
          <span>Sign out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}


