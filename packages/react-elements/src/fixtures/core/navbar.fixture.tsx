"use client";

import React from "react";
import { Navbar } from "../../components/core/navbar";

export const NavbarFixture = () => {
  return (
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
}

export default () => <>{NavbarFixture()}</>