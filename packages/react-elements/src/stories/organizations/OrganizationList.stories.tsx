import type { Meta, StoryObj } from "@storybook/react";
import React from "react";

import { HostedPreview, hostedDocs } from "../_hosted";

const meta = {
  title: "Organizations/OrganizationList",
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: hostedDocs("<OrganizationList />", "organization-list"),
  },
  render: () => (
    <HostedPreview route="organization-list" title="<OrganizationList />" />
  ),
} satisfies Meta;

export default meta;

export const Default: StoryObj = {};
