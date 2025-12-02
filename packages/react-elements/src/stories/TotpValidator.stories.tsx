import type { Story } from "@ladle/react";
import { TOTPValidator } from "../components/flow/totp-validator";
import "../global.css";

export const Default: Story = () => (
  <TOTPValidator
    onValidate={async (code) => {
      console.log(code);
    }}
  />
);
Default.storyName = "Default TOTP Validator";

// export const defaultTOTPValidator: Story = () => (
//   <TOTPValidator />
// );
