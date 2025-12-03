"use client";

import type { Meta, StoryObj } from "@storybook/react";

import { LoginForm } from "../../components/flow/login";

const meta = {
  title: "Flows/Login Form",
  component: LoginForm,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof LoginForm>;

export default meta;

type Story = StoryObj<typeof LoginForm>;

export const Default: Story = {};


