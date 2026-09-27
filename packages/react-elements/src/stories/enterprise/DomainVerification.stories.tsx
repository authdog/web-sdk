import type { Meta, StoryObj } from "@storybook/react";
import React from "react";

import { HostedPreview, hostedDocs } from "../_hosted";

const meta = {
  title: "Enterprise/DomainVerification",
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: hostedDocs("<DomainVerification />", "domain-verification"),
  },
  render: () => (
    <HostedPreview route="domain-verification" title="<DomainVerification />" />
  ),
} satisfies Meta;

export default meta;

export const Default: StoryObj = {};
