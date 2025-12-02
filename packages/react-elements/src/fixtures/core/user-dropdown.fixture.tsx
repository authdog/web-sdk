"use client";

import React from "react";
import { UserDropdown } from "../../components/core/user-dropdown";
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar";

const demoUser = {
  displayName: "Jane Doe",
  emails: [{ value: "jane.doe@example.com" }],
  photos: [{ value: "https://i.pravatar.cc/100" }],
};

const Trigger = () => (
  <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border bg-white shadow">
    <Avatar className="h-8 w-8 rounded-full">
      <AvatarImage src="https://i.pravatar.cc/100" />
      <AvatarFallback>JD</AvatarFallback>
    </Avatar>
  </span>
);

function UserDropdownFixture() {
  return (
    <div className="p-10">
      <UserDropdown
        trigger={<Trigger />}
        user={demoUser}
        onManageAccount={() => alert("Manage account")}
        onSignout={() => alert("Sign out")}
        links={[{ label: "My Organizations", href: "/organizations" }]}
        side="bottom"
        align="start"
      />
    </div>
  );
}

export default UserDropdownFixture;
