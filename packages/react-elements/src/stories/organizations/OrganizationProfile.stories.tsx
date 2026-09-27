import type { Meta, StoryObj } from "@storybook/react";
import React from "react";

import { HostedPreview, hostedDocs } from "../_hosted";

const meta = {
  title: "Organizations/OrganizationProfile",
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: hostedDocs("<OrganizationProfile />", "organization-profile"),
  },
  render: () => (
    <HostedPreview
      route="organization-profile"
      title="<OrganizationProfile />"
    />
  ),
} satisfies Meta;

export default meta;

export const Default: StoryObj = {};
