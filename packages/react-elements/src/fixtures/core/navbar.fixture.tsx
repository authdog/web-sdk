"use client";

import React from "react";

import { Navbar } from "../../components/core/navbar";
import { Button } from "../../components/ui/button";

export const DefaultNavbar = <Navbar logoText="Authdog" />;

export const CustomNavigation = (
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

export const CustomUser = (
  <Navbar
    logoText="Authdog"
    user={{
      name: "Jane Smith",
      email: "jane@authdog.com",
      image: "https://github.com/shadcn.png",
    }}
  />
);

export const WithChildren = (
  <Navbar
    logoText="Authdog"
    className="space-x-4"
    items={[{ title: "Docs", href: "/docs" }]}
  >
    <Button variant="outline" size="sm">
      Get Started
    </Button>
  </Navbar>
);

export const CustomStyling = (
  <Navbar
    logoText="Authdog"
    className="bg-gradient-to-r from-blue-500 to-purple-500 text-white"
  />
);

export const WithDisabledItems = (
  <Navbar
    logoText="Authdog"
    items={[
      { title: "Dashboard", href: "/dashboard" },
      { title: "Projects", href: "/projects" },
      { title: "Team", href: "/team", disabled: true },
      { title: "Reports", href: "/reports", disabled: true },
    ]}
  />
);

export default DefaultNavbar;

