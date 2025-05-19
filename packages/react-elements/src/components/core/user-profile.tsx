"use client"

import { useEffect, useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar"
import { Button } from "../../components/ui/button"
import { Card } from "../../components/ui/card"
import { Badge } from "../../components/ui/badge"
import { PlusCircle, User, Shield, X, LucideProps } from "lucide-react"

export interface UserProfileProps {
  user: {
    name: string;
    email: string;
    image: string;
  };
  emails?: { address: string; isPrimary?: boolean }[];
  connectedAccounts?: { provider: string; email: string }[];
}

export const UserProfile = ({
  user,
  emails = [],
  connectedAccounts = [],
}: UserProfileProps) => {
  const [isMounted, setIsMounted] = useState(false)
  const [activeTab, setActiveTab] = useState<"profile" | "security">("profile");

  useEffect(() => {
    setIsMounted(true)
  }, []);

  const iconProps: LucideProps = {
    className: "mr-2 h-4 w-4",
    "aria-hidden": "true"
  }

  const renderIcon = (Icon: any) => {
    if (!isMounted) return null
    return <Icon {...iconProps} />
  }

  return (
    <div className="grid grid-cols-[16rem,1fr] h-screen bg-gray-100">
      <div className="h-full border-r p-6 bg-white flex flex-col min-w-0">
        <div className="mb-6">
          <h1 className="text-xl font-bold">Account</h1>
          <p className="text-sm text-gray-500">Manage your account info.</p>
        </div>

        <nav className="space-y-1 flex-1">
          <button
            onClick={() => setActiveTab("profile")}
            className={`flex items-center w-full px-3 py-2 text-sm rounded-md ${
              activeTab === "profile" ? "bg-gray-100 text-gray-900" : "text-gray-700 hover:bg-gray-50"
            }`}
          >
            {renderIcon(User)}
            Profile
          </button>
          <button
            onClick={() => setActiveTab("security")}
            className={`flex items-center w-full px-3 py-2 text-sm rounded-md ${
              activeTab === "security" ? "bg-gray-100 text-gray-900" : "text-gray-700 hover:bg-gray-50"
            }`}
          >
            {renderIcon(Shield)}
            Security
          </button>
        </nav>
      </div>

      <div className="h-full p-10 overflow-y-auto min-w-0 bg-white">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">
            {activeTab === "profile" ? "Profile details" : "Security settings"}
          </h2>
          <button className="text-gray-500 hover:text-gray-700">
            {renderIcon(X)}
          </button>
        </div>

        {activeTab === "profile" ? (
          <div className="space-y-8">
            {/* Profile Section */}
            <div>
              <h3 className="text-sm font-medium mb-4">Profile</h3>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Avatar className="h-12 w-12 mr-4 border">
                    <AvatarImage src={user.image} alt="Profile picture" />
                    <AvatarFallback>{user.name.split(" ").map(n => n[0]).join("")}</AvatarFallback>
                  </Avatar>
                  <span className="font-medium">{user.name}</span>
                </div>
                <Button variant="outline" size="sm">
                  Edit profile
                </Button>
              </div>
            </div>

            {/* Email Addresses Section */}
            <div>
              <h3 className="text-sm font-medium mb-4">Email addresses</h3>
              <div className="space-y-3">
                {(emails.length > 0 ? emails : [{ address: user.email, isPrimary: true }]).map((email, i) => (
                  <div className="flex items-center justify-between" key={email.address}>
                    <span>{email.address}</span>
                    {email.isPrimary && (
                      <Badge variant="outline" className="text-xs bg-gray-100 text-gray-700 hover:bg-gray-100">
                        Primary
                      </Badge>
                    )}
                  </div>
                ))}
                <Button variant="ghost" size="sm" className="flex items-center text-gray-700">
                  {renderIcon(PlusCircle)}
                  Add email address
                </Button>
              </div>
            </div>

            {/* Phone Number Section */}
            <div>
              <h3 className="text-sm font-medium mb-4">Phone number</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span>+1 (555) 123-4567</span>
                  <Badge variant="outline" className="text-xs bg-gray-100 text-gray-700 hover:bg-gray-100">
                    Primary
                  </Badge>
                </div>
                <Button variant="ghost" size="sm" className="flex items-center text-gray-700">
                  {renderIcon(PlusCircle)}
                  Add phone number
                </Button>
              </div>
            </div>

            {/* Connected Accounts Section */}
            <div>
              <h3 className="text-sm font-medium mb-4">Connected accounts</h3>
              <div className="space-y-3">
                {connectedAccounts.length > 0 ? connectedAccounts.map((acc, i) => (
                  <div className="flex items-center justify-between" key={acc.provider + acc.email}>
                    <div className="flex items-center">
                      <div className="mr-2">
                        <span>{acc.provider}</span>
                      </div>
                      <span>{acc.provider}</span>
                    </div>
                    <span className="text-sm text-gray-500">{acc.email}</span>
                  </div>
                )) : (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="mr-2">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20">
                          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                      </div>
                      <span>Google</span>
                    </div>
                    <span className="text-sm text-gray-500">{user.email}</span>
                  </div>
                )}
                <Button variant="ghost" size="sm" className="flex items-center text-gray-700">
                  {renderIcon(PlusCircle)}
                  Connect account
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Security Settings */}
            <div>
              <h3 className="text-sm font-medium mb-4">Two-factor authentication</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Two-factor authentication</p>
                    <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
                  </div>
                  <Button variant="outline" size="sm">
                    Enable
                  </Button>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium mb-4">Password</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Change password</p>
                    <p className="text-sm text-gray-500">Last changed 3 months ago</p>
                  </div>
                  <Button variant="outline" size="sm">
                    Change
                  </Button>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium mb-4">Active sessions</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Current session</p>
                    <p className="text-sm text-gray-500">Chrome on Windows • Active now</p>
                  </div>
                  <Button variant="outline" size="sm">
                    Sign out
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="absolute bottom-4 text-xs text-gray-500 flex items-center">
        Secured by
        <span className="ml-1 font-medium flex items-center">
          <svg
            width="14"
            height="14"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="mr-1"
          >
            <path d="M8 0L14.9282 4V12L8 16L1.07179 12V4L8 0Z" fill="#6C47FF" />
          </svg>
          Authdog
        </span>
      </div>
    </div>
  )
}
