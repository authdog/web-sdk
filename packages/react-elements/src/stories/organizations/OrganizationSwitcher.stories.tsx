import type { Meta, StoryObj } from "@storybook/react";
import React from "react";

import { HostedPreview, hostedDocs } from "../_hosted";

const meta = {
  title: "Organizations/OrganizationSwitcher",
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: hostedDocs("<OrganizationSwitcher />", "organization-switcher"),
  },
  render: () => (
    <HostedPreview
      route="organization-switcher"
      title="<OrganizationSwitcher />"
    />
  ),
} satisfies Meta;

export default meta;

export const Default: StoryObj = {};
