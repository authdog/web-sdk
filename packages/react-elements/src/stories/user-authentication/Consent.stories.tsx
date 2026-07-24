import type { Meta, StoryObj } from "@storybook/react";
import React from "react";

import { HostedPreview, hostedDocs } from "../_hosted";

const DEMO_PARAMS =
  "&demo=true&username=Jane+Smith&email=jane@acme.co&info=Read+your+profile,Access+email,Manage+settings";

const meta = {
  title: "User Authentication/Consent",
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: hostedDocs("<Consent />", "consent"),
  },
  render: () => (
    <HostedPreview route="consent" extra={DEMO_PARAMS} title="<Consent />" />
  ),
} satisfies Meta;

export default meta;

export const Default: StoryObj = {};
