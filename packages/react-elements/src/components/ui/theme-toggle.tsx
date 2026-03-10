"use client";

import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

import { Button } from "./button";

const STORAGE_KEY = "authdog-theme";

type ThemeMode = "light" | "dark";

const getPreferredTheme = (): ThemeMode => {
  if (typeof window === "undefined") return "light";
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === "light" || stored === "dark") {
    return stored;
  }
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
};

const applyTheme = (mode: ThemeMode) => {
  document.documentElement.classList.toggle("dark", mode === "dark");
};

export const ThemeToggle = () => {
  const [mode, setMode] = useState<ThemeMode>("light");

  useEffect(() => {
    const initial = getPreferredTheme();
    applyTheme(initial);
    setMode(initial);
  }, []);

  const toggle = () => {
    const nextMode: ThemeMode = mode === "dark" ? "light" : "dark";
    applyTheme(nextMode);
    try {
      window.localStorage.setItem(STORAGE_KEY, nextMode);
    } catch {
      // ignore
    }
    setMode(nextMode);
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      className="cursor-pointer"
      aria-label={
        mode === "dark" ? "Switch to light theme" : "Switch to dark theme"
      }
      onClick={toggle}
    >
      {mode === "dark" ? (
        <Sun className="h-4 w-4" />
      ) : (
        <Moon className="h-4 w-4" />
      )}
    </Button>
  );
};
