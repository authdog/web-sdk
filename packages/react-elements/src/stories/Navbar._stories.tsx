import type { Story } from "@ladle/react";
import { Navbar } from "../components/core/navbar";
import { Button } from "../components/ui/button";
import "../global.css";

export const Default: Story = () => <Navbar logoText="Authdog" />;
Default.storyName = "Default Navbar";

export const CustomNavigation: Story = () => (
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

CustomNavigation.storyName = "Custom Navigation";

export const CustomUser: Story = () => (
  <Navbar
    logoText="Authdog"
    user={{
      name: "Jane Smith",
      email: "jane@Authdog.com",
      image: "https://github.com/shadcn.png",
    }}
  />
);
CustomUser.storyName = "Custom User";

export const WithChildren: Story = () => (
  <Navbar
    logoText="Authdog"
    children={
      <Button variant="outline" size="sm">
        Get Started
      </Button>
    }
  />
);
WithChildren.storyName = "With Children";

export const CustomStyling: Story = () => (
  <Navbar
    logoText="Authdog"
    className="bg-gradient-to-r from-blue-500 to-purple-500 text-white"
  />
);
CustomStyling.storyName = "Custom Styling";

export const WithDisabledItems: Story = () => (
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
WithDisabledItems.storyName = "With Disabled Items";
