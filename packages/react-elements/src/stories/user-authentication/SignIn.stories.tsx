import type { Meta, StoryObj } from "@storybook/react";
import React from "react";

import { HostedPreview, hostedDocs } from "../_hosted";

const meta = {
  title: "User Authentication/SignIn",
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: hostedDocs("<SignIn />", "signin"),
  },
  render: () => <HostedPreview route="signin" title="<SignIn />" />,
} satisfies Meta;

export default meta;

export const Default: StoryObj = {};
