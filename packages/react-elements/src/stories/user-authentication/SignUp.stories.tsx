import type { Meta, StoryObj } from "@storybook/react";
import React from "react";

import { HostedPreview, hostedDocs } from "../_hosted";

const meta = {
  title: "User Authentication/SignUp",
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: hostedDocs("<SignUp />", "signup"),
  },
  render: () => <HostedPreview route="signup" title="<SignUp />" />,
} satisfies Meta;

export default meta;

export const Default: StoryObj = {};
