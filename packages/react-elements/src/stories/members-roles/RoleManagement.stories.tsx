import type { Meta, StoryObj } from "@storybook/react";
import React from "react";

import { HostedPreview, hostedDocs } from "../_hosted";

const meta = {
  title: "Members & Roles/RoleManagement",
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: hostedDocs("<RoleManagement />", "role-management"),
  },
  render: () => (
    <HostedPreview route="role-management" title="<RoleManagement />" />
  ),
} satisfies Meta;

export default meta;

export const Default: StoryObj = {};
