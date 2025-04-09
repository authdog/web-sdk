"use client"
import { DropdownMenuItem } from "@radix-ui/react-dropdown-menu"
import { LogOut } from "lucide-react";

export const LogoutDropdown = () => {
    const onLogout = async () => {
        const res = await fetch("/api/auth/logout", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (res.ok) {
          window.location.href = "/";
        }
      };

    return (
        <DropdownMenuItem
                onClick={onLogout}
                className="cursor-pointer data-[disabled]:pointer-events-none data-[highlighted]:bg-primary data-[highlighted]:text-primary-foreground flex items-center rounded-md px-2 py-1 text-sm outline-none focus:bg-primary focus:text-primary-foreground disabled:opacity-50"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Logout</span>
        </DropdownMenuItem>
    )
}