import type { Meta, StoryObj } from "@storybook/react";
import React from "react";

import { HostedPreview, hostedDocs } from "../_hosted";

const meta = {
  title: "Enterprise/AdminPortal",
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: hostedDocs("<AdminPortal />", "portal"),
  },
  render: () => (
    <HostedPreview route="portal" extra="&demo=true" title="<AdminPortal />" />
  ),
} satisfies Meta;

export default meta;

export const Default: StoryObj = {};
