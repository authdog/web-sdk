"use client";

import React from "react";
import { TOTPValidator } from "../../components/flow/totp-validator";

export default (
  <TOTPValidator
    onValidate={async (code) => {
      console.log("TOTP submitted", code);
    }}
  />
);
