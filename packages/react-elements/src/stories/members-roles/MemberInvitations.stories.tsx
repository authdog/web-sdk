import type { Meta, StoryObj } from "@storybook/react";
import React from "react";

import { HostedPreview, hostedDocs } from "../_hosted";

const meta = {
  title: "Members & Roles/MemberInvitations",
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: hostedDocs("<MemberInvitations />", "member-invitations"),
  },
  render: () => (
    <HostedPreview route="member-invitations" title="<MemberInvitations />" />
  ),
} satisfies Meta;

export default meta;

export const Default: StoryObj = {};
