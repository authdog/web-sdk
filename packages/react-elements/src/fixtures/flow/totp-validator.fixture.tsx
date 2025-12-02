"use client";

import React from "react";
import { TOTPValidator } from "../../components/flow/totp-validator";

function TotpValidatorFixture() {
  return (
    <TOTPValidator
      onValidate={async (code) => {
        console.log("TOTP submitted", code);
      }}
    />
  );
}

export default TotpValidatorFixture;
