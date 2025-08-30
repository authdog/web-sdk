"use client"

import { useEffect, useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar"
import { Button } from "../../components/ui/button"
import { Badge } from "../../components/ui/badge"
import { User, Shield, SlidersHorizontal, LucideProps } from "lucide-react"

export interface UserProfileProps {
  loading: boolean;
  user: any;
  emails?: { address: string; isPrimary?: boolean }[];
  handleAuthenticated?: () => void;
  onRequestEmailVerification?: (email: string) => Promise<{ success: boolean; message?: string } | void>;
  onVerifyEmail?: (email: string, code: string) => Promise<{ success: boolean; message?: string } | void>;
}

export const UserProfile = ({
  loading,
  user,
  handleAuthenticated,
  onRequestEmailVerification,
  onVerifyEmail,
}: UserProfileProps) => {
  const [isMounted, setIsMounted] = useState(false)
  const [activeTab, setActiveTab] = useState<"profile" | "security" | "preferences">("profile");
  const [verifyingEmail, setVerifyingEmail] = useState<string | null>(null)
  const [codeByEmail, setCodeByEmail] = useState<Record<string, string>>({})

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
      <div className="h-full border-r border-border p-3 md:p-4 bg-transparent flex flex-col min-w-0">
        <div className="mb-3 md:mb-4">
          <h1 className="text-xl font-bold text-foreground">Account</h1>
          <p className="text-sm text-muted-foreground">Manage your account info.</p>
        </div>

        <nav className="space-y-1 flex-1">
          <button
            onClick={() => setActiveTab("profile")}
            className={`flex items-center w-full px-3 py-2 text-sm rounded-md ${
              activeTab === "profile"
                ? "bg-muted text-foreground"
                : "text-muted-foreground hover:bg-muted/50"
            }`}
          >
            {renderIcon(User)}
            Profile
          </button>
          <button
            onClick={() => setActiveTab("security")}
            className={`flex items-center w-full px-3 py-2 text-sm rounded-md ${
              activeTab === "security"
                ? "bg-muted text-foreground"
                : "text-muted-foreground hover:bg-muted/50"
            }`}
          >
            {renderIcon(Shield)}
            Security
          </button>
          <button
            onClick={() => setActiveTab("preferences")}
            className={`flex items-center w-full px-3 py-2 text-sm rounded-md ${
              activeTab === "preferences"
                ? "bg-muted text-foreground"
                : "text-muted-foreground hover:bg-muted/50"
            }`}
          >
            {renderIcon(SlidersHorizontal)}
            Preferences
          </button>
        </nav>
      </div>

      <div className="h-full p-3 md:p-5 min-w-0 bg-transparent">
        <div className="flex justify-between items-center mb-3 md:mb-4">
          <h2 className="text-xl font-semibold text-foreground">
            {activeTab === "profile"
              ? "Profile details"
              : activeTab === "security"
              ? "Security settings"
              : "Preferences"}
          </h2>
          {/* <button className="text-gray-500 hover:text-gray-700">
            {renderIcon(X)}
          </button> */}
        </div>

        {activeTab === "profile" ? (
          <div className="space-y-5 md:space-y-6">
            {/* Profile Section */}
            <div>
              <h3 className="text-sm font-medium mb-3 text-foreground">Profile</h3>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Avatar className="h-12 w-12 mr-4 border">
                    <AvatarImage src={user.photos?.[0]?.value} alt="Profile picture" />
                    <AvatarFallback>{user.displayName?.split(" ").map((n: string) => n[0]).join("")}</AvatarFallback>
                  </Avatar>
                  <span className="font-medium text-foreground">{user.displayName}</span>
                </div>
                {/* <Button variant="outline" size="sm">
                  Edit profile
                </Button> */}
              </div>
            </div>

            {/* Email Addresses Section */}
            <div>
              <h3 className="text-sm font-medium mb-3 text-foreground">Email addresses</h3>
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

                {user.emails.map((email: any, idx: number) => {
                  const v = (user?.verifications || []).find((ve: any) => ve.email === email.value)
                  const isVerified = v?.verified === true
                  const codeInput = codeByEmail[email.value] || ""
                  return (
                    <div className="flex items-start justify-between gap-2" key={email.value}>
                      <div className="flex flex-col">
                        <span className="text-foreground">{email.value}</span>
                        <div className="mt-1 text-xs text-muted-foreground">
                          {isVerified ? "Verified" : "Not verified"}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {idx === 0 && (
                          <Badge
                            variant="outline"
                            className="text-xs bg-muted text-foreground hover:bg-muted"
                          >
                            Primary
                          </Badge>
                        )}
                        {!isVerified && (
                          <>
                            {verifyingEmail === email.value ? (
                              <div className="flex items-center gap-1">
                                <input
                                  className="h-7 w-24 text-sm rounded-md border border-border bg-background px-2 text-foreground"
                                  placeholder="Code"
                                  value={codeInput}
                                  onChange={(e) => setCodeByEmail((m) => ({ ...m, [email.value]: e.target.value }))}
                                />
                                <button
                                  className="h-7 rounded-md border border-border px-2 text-xs"
                                  onClick={async () => {
                                    if (!onVerifyEmail) return
                                    await onVerifyEmail(email.value, codeInput)
                                  }}
                                >
                                  Verify
                                </button>
                                <button
                                  className="h-7 rounded-md border border-border px-2 text-xs"
                                  onClick={() => setVerifyingEmail(null)}
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <>
                                <button
                                  className="h-7 rounded-md border border-border px-2 text-xs"
                                  onClick={async () => {
                                    if (onRequestEmailVerification) await onRequestEmailVerification(email.value)
                                    setVerifyingEmail(email.value)
                                  }}
                                >
                                  Send code
                                </button>
                              </>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  )
                })}
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
        ) : activeTab === "security" ? (
          <div className="space-y-5 md:space-y-6">
            {/* Password row */}
            <div className="border rounded-md overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3">
                <div className="text-sm text-gray-700 dark:text-gray-300">Password</div>
                <button className="text-sm text-indigo-600 hover:underline">Set password</button>
              </div>
            </div>

            {/* Passkeys row */}
            <div className="border rounded-md overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3">
                <div className="text-sm text-gray-700 dark:text-gray-300">Passkeys</div>
                <button className="text-sm text-indigo-600 hover:underline">+&nbsp;Add a passkey</button>
              </div>
            </div>

            {/* Two-step verification row */}
            <div className="border rounded-md overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3">
                <div className="text-sm text-gray-700 dark:text-gray-300">Two-step verification</div>
                <button className="text-sm text-indigo-600 hover:underline">+&nbsp;Add two-step verification</button>
              </div>
            </div>

            {/* Active devices list (scaffold) */}
            <div className="border rounded-md overflow-hidden">
              <div className="px-4 py-3 border-b text-sm font-medium text-gray-900 dark:text-gray-100">Active devices</div>
              <div className="p-4 space-y-3">
                <div className="text-sm">
                  <div className="flex items-center gap-2">
                    <span className="inline-block h-5 w-5 rounded-sm bg-gray-900 dark:bg-white" />
                    <span className="font-medium">X11</span>
                    <span className="text-xs rounded-md border px-2 py-0.5 text-gray-600 dark:text-gray-300">This device</span>
                  </div>
                  <div className="text-gray-600 dark:text-gray-400 mt-1">Firefox 142.0</div>
                  <div className="text-gray-600 dark:text-gray-400">127.0.0.1 (Local), (Your City)</div>
                  <div className="text-gray-600 dark:text-gray-400">Today at 7:08 PM</div>
                </div>
              </div>
            </div>

            {/* Delete account */}
            <div className="border rounded-md overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3">
                <div className="text-sm text-gray-700 dark:text-gray-300">Delete account</div>
                <button className="text-sm text-red-600 hover:underline">Delete account</button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-5 md:space-y-6">
            {/* Preferences */}
            <div>
              <h3 className="text-sm font-medium mb-3 text-gray-900 dark:text-gray-100">Preferences</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-700 dark:text-gray-300">Locale</span>
                  <span className="text-gray-500 dark:text-gray-400">Auto</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-700 dark:text-gray-300">Theme</span>
                  <span className="text-gray-500 dark:text-gray-400">System</span>
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
