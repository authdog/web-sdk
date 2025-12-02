"use client";

import React from "react";

import { TOTPValidator } from "../../components/flow/totp-validator";

export const DefaultTotpValidator = (
  <TOTPValidator
    onValidate={async (code) => {
      console.log("TOTP submitted", code);
    }}
  />
);

export default DefaultTotpValidator;

