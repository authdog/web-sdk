"use client";

import type React from "react";

import { useState, useRef } from "react";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { Alert, AlertDescription } from "../../components/ui/alert";
import { Shield, CheckCircle, AlertCircle } from "lucide-react";

interface TOTPValidatorProps {
  onValidate: (code: string) => Promise<void>;
}

export const TOTPValidator = ({ onValidate }: TOTPValidatorProps) => {
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleInputChange = (index: number, value: string) => {
    // Only allow digits
    if (!/^\d*$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value.slice(-1); // Only take the last character

    setCode(newCode);
    setError("");
    setSuccess(false);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    // Handle backspace
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Native paste handler: reads from the paste event (works in insecure
  // contexts / Firefox, no clipboard permission prompt, no unhandled promise).
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const digits = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6)
      .split("");
    if (digits.length === 0) return;

    const newCode = [...code];
    digits.forEach((digit, i) => {
      if (i < 6) newCode[i] = digit;
    });
    setCode(newCode);
    setError("");
    setSuccess(false);

    // Focus the next empty input or the last one
    const nextIndex = Math.min(digits.length, 5);
    inputRefs.current[nextIndex]?.focus();
  };

  const validateTOTP = async () => {
    const totpCode = code.join("");

    if (totpCode.length !== 6) {
      setError("Please enter all 6 digits");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await onValidate(totpCode);
      setSuccess(true);
    } catch (error) {
      setError("Invalid TOTP code. Please try again.");
    } finally {
      setLoading(false);
    }

    // try {
    // Call your TOTP validation endpoint
    //   const response = await fetch("/api/validate-totp", {
    //     method: "POST",
    //     headers: {
    //       "Content-Type": "application/json",
    //     },
    //     body: JSON.stringify({ code: totpCode }),
    //   })

    //   // Check if response is JSON
    //   const contentType = response.headers.get("content-type")
    //   if (!contentType || !contentType.includes("application/json")) {
    //     throw new Error("Server returned non-JSON response")
    //   }

    //   const result = await response.json()

    //   if (response.ok && result.valid) {
    //     setSuccess(true)
    //     setError("")
    //   } else {
    //     setError(result.message || "Invalid TOTP code. Please try again.")
    //     // Clear the code on error
    //     setCode(["", "", "", "", "", ""])
    //     inputRefs.current[0]?.focus()
    //   }
    // } catch (err) {
    //   console.error("TOTP validation error:", err)
    //   if (err instanceof Error && err.message.includes("non-JSON")) {
    //     setError("Server error. Please try again later.")
    //   } else {
    //     setError("Network error. Please try again.")
    //   }
    //   // Clear the code on error
    //   setCode(["", "", "", "", "", ""])
    //   inputRefs.current[0]?.focus()
    // } finally {
    //   setLoading(false)
    // }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    validateTOTP();
  };

  const clearCode = () => {
    setCode(["", "", "", "", "", ""]);
    setError("");
    setSuccess(false);
    setLoading(false);
    inputRefs.current[0]?.focus();
  };

  if (success) {
    return (
      <div className="max-w-md mx-auto">
        <Card className="border-emerald-200 bg-emerald-50 dark:border-emerald-900/60 dark:bg-emerald-950/20">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-emerald-100 dark:bg-emerald-500/10 rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-emerald-900 dark:text-emerald-200">
                  Verification Successful!
                </h3>
                <p className="text-sm text-emerald-700 dark:text-emerald-300 mt-1">
                  Your TOTP code has been validated.
                </p>
              </div>
              <Button onClick={clearCode} variant="outline">
                Verify Another Code
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto">
      <Card>
        <CardContent className="pt-6">
          <div className="text-center space-y-6">
            <div>
              <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold">Enter Verification Code</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Enter the 6-digit code from your authenticator app
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex justify-center gap-2">
                {code.map((digit, index) => (
                  <div
                    key={index}
                    className={`w-12 h-12 rounded-lg border bg-card flex items-center justify-center transition-colors focus-within:border-primary focus-within:ring-[3px] focus-within:ring-primary/20 ${
                      error
                        ? "border-destructive"
                        : "border-input"
                    }`}
                  >
                    <input
                      ref={(el) => {
                        inputRefs.current[index] = el;
                      }}
                      type="tel"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleInputChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      onPaste={handlePaste}
                      className="w-full h-full text-center text-xl font-semibold tabular-nums border-none outline-none bg-transparent"
                      autoComplete="one-time-code"
                      disabled={loading}
                    />
                  </div>
                ))}
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-3">
                <Button
                  type="submit"
                  className="w-full"
                  disabled={loading || code.some((digit) => digit === "")}
                >
                  {loading ? "Verifying..." : "Verify Code"}
                </Button>

                <Button
                  type="button"
                  variant="link"
                  size="sm"
                  onClick={clearCode}
                  className="w-full"
                >
                  Clear Code
                </Button>
              </div>
            </form>

            <p className="text-xs text-muted-foreground">
              Codes refresh every 30 seconds
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
