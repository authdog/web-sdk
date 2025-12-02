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

    // Handle paste
    if (e.key === "v" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      navigator.clipboard.readText().then((text) => {
        const digits = text.replace(/\D/g, "").slice(0, 6).split("");
        const newCode = [...code];
        digits.forEach((digit, i) => {
          if (i < 6) newCode[i] = digit;
        });
        setCode(newCode);

        // Focus the next empty input or the last one
        const nextIndex = Math.min(digits.length, 5);
        inputRefs.current[nextIndex]?.focus();
      });
    }
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
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-green-900">
                  Verification Successful!
                </h3>
                <p className="text-sm text-green-700 mt-1">
                  Your TOTP code has been validated.
                </p>
              </div>
              <Button
                onClick={clearCode}
                variant="outline"
                className="bg-white"
              >
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
              <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold">Enter Verification Code</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Enter the 6-digit code from your authenticator app
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex justify-center gap-2">
                {code.map((digit, index) => (
                  <Card
                    key={index}
                    className="w-12 h-14 border-2 focus-within:border-blue-500 transition-colors"
                  >
                    <CardContent className="p-0 h-full flex items-center justify-center">
                      <input
                        ref={(el) => {
                          inputRefs.current[index] = el;
                        }}
                        type="tel"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) =>
                          handleInputChange(index, e.target.value)
                        }
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        className="w-full h-full text-center text-2xl font-bold border-none outline-none bg-transparent"
                        autoComplete="one-time-code"
                        disabled={loading}
                        style={{
                          height: "auto",
                        }}
                      />
                    </CardContent>
                  </Card>
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
                  variant="ghost"
                  size="sm"
                  onClick={clearCode}
                  className="w-full text-xs"
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
