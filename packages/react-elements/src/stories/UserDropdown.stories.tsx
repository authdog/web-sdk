import React from "react"
import { UserDropdown } from "../components/core/user-dropdown"
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar"

const DemoTrigger = () => (
  <span className="inline-flex items-center justify-center h-10 w-10 rounded-full border bg-white shadow">
    <Avatar className="h-8 w-8 rounded-full">
      <AvatarImage src="https://i.pravatar.cc/100" />
      <AvatarFallback>JD</AvatarFallback>
    </Avatar>
  </span>
)

const demoUser = {
  displayName: "Jane Doe",
  emails: [{ value: "jane.doe@example.com" }],
  photos: [{ value: "https://i.pravatar.cc/100" }],
}

export default { title: "Core/UserDropdown" }

export const Basic = () => (
  <div className="p-10">
    <UserDropdown
      trigger={<DemoTrigger />}
      user={demoUser}
      onManageAccount={() => alert("Manage account")}
      onSignout={() => alert("Sign out")}
      links={[{ label: "My Organizations", href: "/organizations" }]}
      side="bottom"
      align="start"
    />
  </div>
)


