"use client"

import { useEffect, useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar"
import { Button } from "../../components/ui/button"
import { Badge } from "../../components/ui/badge"
import { User, LucideProps } from "lucide-react"

export interface UserProfileProps {
  loading: boolean;
  user: any;
  emails?: { address: string; isPrimary?: boolean }[];
  handleAuthenticated?: () => void;
}

export const UserProfile = ({
  loading,
  user,
  handleAuthenticated
}: UserProfileProps) => {
  const [isMounted, setIsMounted] = useState(false)
  const [activeTab, setActiveTab] = useState<"profile" | "security">("profile");

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!loading && handleAuthenticated) {
      handleAuthenticated();
    }
  }, [loading, user, handleAuthenticated]);

  const iconProps: LucideProps = {
    className: "mr-2 h-4 w-4",
    "aria-hidden": "true"
  }

  const renderIcon = (Icon: any) => {
    if (!isMounted) return null
    return <Icon {...iconProps} />
  }

  if (!isMounted || loading) {
    return <div>Loading...</div>
  }

  if (!user) {
    return <div>No user</div>
  }
  
  return (
    <div className="grid grid-cols-[14rem,1fr] w-full bg-transparent">
      <div className="h-full border-r p-3 md:p-4 bg-transparent flex flex-col min-w-0">
        <div className="mb-3 md:mb-4">
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Account</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Manage your account info.</p>
        </div>

        <nav className="space-y-1 flex-1">
          <button
            onClick={() => setActiveTab("profile")}
            className={`flex items-center w-full px-3 py-2 text-sm rounded-md ${
              activeTab === "profile"
                ? "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100"
                : "text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
            }`}
          >
            {renderIcon(User)}
            Profile
          </button>
          {/* <button
            onClick={() => setActiveTab("security")}
            className={`flex items-center w-full px-3 py-2 text-sm rounded-md ${
              activeTab === "security" ? "bg-gray-100 text-gray-900" : "text-gray-700 hover:bg-gray-50"
            }`}
          >
            {renderIcon(Shield)}
            Security
          </button> */}
        </nav>
      </div>

      <div className="h-full p-3 md:p-5 min-w-0 bg-transparent">
        <div className="flex justify-between items-center mb-3 md:mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            {activeTab === "profile" ? "Profile details" : "Security settings"}
          </h2>
          {/* <button className="text-gray-500 hover:text-gray-700">
            {renderIcon(X)}
          </button> */}
        </div>

        {activeTab === "profile" ? (
          <div className="space-y-5 md:space-y-6">
            {/* Profile Section */}
            <div>
              <h3 className="text-sm font-medium mb-3 text-gray-900 dark:text-gray-100">Profile</h3>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Avatar className="h-12 w-12 mr-4 border">
                    <AvatarImage src={user.photos?.[0]?.value} alt="Profile picture" />
                    <AvatarFallback>{user.displayName?.split(" ").map((n: string) => n[0]).join("")}</AvatarFallback>
                  </Avatar>
                  <span className="font-medium text-gray-900 dark:text-gray-100">{user.displayName}</span>
                </div>
                {/* <Button variant="outline" size="sm">
                  Edit profile
                </Button> */}
              </div>
            </div>

            {/* Email Addresses Section */}
            <div>
              <h3 className="text-sm font-medium mb-3 text-gray-900 dark:text-gray-100">Email addresses</h3>
              <div className="space-y-2.5">

                {/* {JSON.stringify(user)} */}

                {/* {(emails.length > 0 ? emails : [{ address: user.email, isPrimary: true }]).map((email, i) => (
                  <div className="flex items-center justify-between" key={email.address}>
                    <span>{email.address}</span>
                    {email.isPrimary && (
                      <Badge variant="outline" className="text-xs bg-gray-100 text-gray-700 hover:bg-gray-100">
                        Primary
                      </Badge>
                    )}
                  </div>
                ))} */}

                {user.emails.map((email: any, idx: number) => (
                  <div className="flex items-center justify-between" key={email.value}>
                    <span className="text-gray-900 dark:text-gray-100">{email.value}</span>
                    {idx === 0 && (
                      <Badge
                        variant="outline"
                        className="text-xs bg-gray-100 text-gray-700 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-800"
                      >
                        Primary
                      </Badge>
                    )}
                  </div>
                ))}
                {/* <Button variant="ghost" size="sm" className="flex items-center text-gray-700">
                  {renderIcon(PlusCircle)}
                  Add email address
                </Button> */}
              </div>
            </div>

            {/* Phone Number Section */}
            {/* <div>
              <h3 className="text-sm font-medium mb-3">Phone number</h3>
              <div className="space-y-2.5">
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
            </div> */}

            {/* Connected Accounts Section */}
            <div>
              <h3 className="text-sm font-medium mb-3 text-gray-900 dark:text-gray-100">Connected accounts</h3>
              <div className="space-y-2.5">
                <div className="flex items-center justify-between" key={user.provider}>
                    <div className="flex items-center">
                      <div className="mr-2">
                        <span className="text-gray-900 dark:text-gray-100">{user.provider}</span>
                      </div>
                    </div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">{user?.emails?.[0]?.value}</span>
                  </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-5 md:space-y-6">
            {/* Security Settings */}
            <div key="two-factor">
              <h3 className="text-sm font-medium mb-3 text-gray-900 dark:text-gray-100">Two-factor authentication</h3>
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">Two-factor authentication</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Add an extra layer of security to your account</p>
                  </div>
                  <Button variant="outline" size="sm">
                    Enable
                  </Button>
                </div>
              </div>
            </div>

            <div key="password">
              <h3 className="text-sm font-medium mb-3 text-gray-900 dark:text-gray-100">Password</h3>
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">Change password</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Last changed 3 months ago</p>
                  </div>
                  <Button variant="outline" size="sm">
                    Change
                  </Button>
                </div>
              </div>
            </div>

            <div key="sessions">
              <h3 className="text-sm font-medium mb-3 text-gray-900 dark:text-gray-100">Active sessions</h3>
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">Current session</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Chrome on Windows • Active now</p>
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

      {/* <div className="absolute bottom-4 text-xs text-gray-500 flex items-center">
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
      </div> */}
    </div>
  )
}
