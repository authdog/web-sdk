"use client"
import { LogOutIcon } from "lucide-react";
import { Button } from "../ui/button";

export const LogoutButton = () => {
    return (
        <Button variant="outline" className="mt-4" onClick={async () => {
            const res = await fetch("/api/auth/logout", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
            });
            if (res.ok) {
              window.location.href = "/";
            }
          }}>
            <LogOutIcon className="mr-2 h-4 w-4" />
            Logout
          </Button>
    )
}