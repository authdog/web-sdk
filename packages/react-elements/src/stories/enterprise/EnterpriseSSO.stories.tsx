import type { Meta, StoryObj } from "@storybook/react";
import React from "react";

import { HostedPreview, hostedDocs } from "../_hosted";

const meta = {
  title: "Enterprise/EnterpriseSSO",
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: hostedDocs("<EnterpriseSSO />", "enterprise-sso"),
  },
  render: () => (
    <HostedPreview route="enterprise-sso" title="<EnterpriseSSO />" />
  ),
} satisfies Meta;

export default meta;

export const Default: StoryObj = {};
