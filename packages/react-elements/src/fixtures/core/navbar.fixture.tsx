"use client";

import React from "react";

import { Navbar } from "../../components/core/navbar";
import { Button } from "../../components/ui/button";

export default () => (
  <Navbar
    logoText="Authdog"
    items={[
      { title: "Home", href: "/" },
      { title: "Features", href: "/features" },
      { title: "Pricing", href: "/pricing" },
      { title: "Contact", href: "/contact" },
    ]}
  />
);
