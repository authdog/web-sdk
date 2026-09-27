import type { Meta, StoryObj } from "@storybook/react";
import React from "react";

import { HostedPreview, hostedDocs } from "../_hosted";

const meta = {
  title: "Organizations/CreateOrganization",
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: hostedDocs("<CreateOrganization />", "create-organization"),
  },
  render: () => (
    <HostedPreview route="create-organization" title="<CreateOrganization />" />
  ),
} satisfies Meta;

export default meta;

export const Default: StoryObj = {};
