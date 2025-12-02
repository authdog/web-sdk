"use client";

import React from "react";

import { PlaceholderAlert } from "../../components/core/placeholder-alert";

export const DefaultAlert = <PlaceholderAlert />;

export const CustomContent = (
  <PlaceholderAlert
    title="Custom Alert Title"
    description="This is a custom description for the placeholder alert."
  />
);

export default DefaultAlert;

