import React from "react";
import { createRoot } from "react-dom/client";
import { RootRenderer } from "react-cosmos-dom";
import "./global.css";

const container = document.querySelector("#cosmos");
if (container) {
  const root = createRoot(container);
  root.render(<RootRenderer />);
}

