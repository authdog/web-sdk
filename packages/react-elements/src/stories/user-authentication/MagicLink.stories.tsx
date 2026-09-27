import type { Meta, StoryObj } from "@storybook/react";
import React from "react";

import { HostedPreview, hostedDocs } from "../_hosted";

const meta = {
  title: "User Authentication/MagicLink",
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: hostedDocs("<MagicLink />", "magic-link"),
  },
  render: () => <HostedPreview route="magic-link" title="<MagicLink />" />,
} satisfies Meta;

export default meta;

export const Default: StoryObj = {};
