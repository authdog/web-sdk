import type { Preview } from "@storybook/react";
import React from "react";

import "../src/global.css";
import "./preview.css";

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    layout: "centered",
    options: {
      storySort: {
        order: [
          "Introduction",
          "Showcase",
          "Core",
          ["Account", "User Button", "User Dropdown", "Navbar", "*"],
          "Flows",
          "UI",
          "*",
        ],
      },
    },
    backgrounds: {
      default: "canvas",
      values: [
        { name: "canvas", value: "transparent" },
        { name: "light", value: "#f8fafc" },
        { name: "dark", value: "#09090b" },
      ],
    },
    docs: {
      toc: true,
    },
  },
  globalTypes: {
    theme: {
      description: "Color theme",
      toolbar: {
        title: "Theme",
        icon: "circlehollow",
        items: [
          { value: "light", icon: "sun", title: "Light" },
          { value: "dark", icon: "moon", title: "Dark" },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: {
    theme: "light",
  },
  decorators: [
    (Story, context) => {
      const theme = (context.globals.theme as string) || "light";
      if (typeof document !== "undefined") {
        document.documentElement.classList.toggle("dark", theme === "dark");
      }
      return React.createElement(
        "div",
        {
          className:
            theme === "dark"
              ? "dark min-h-full bg-zinc-950 text-zinc-50"
              : "min-h-full text-foreground",
        },
        React.createElement(Story),
      );
    },
  ],
};

export default preview;
