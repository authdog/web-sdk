"use client";
import { Navbar, Button, UserProfile} from "@authdog/react-elements"
import "@authdog/react-elements/styles.css";
// import { Suspense } from "react";

export default function Home() {
  return (
       <div className="min-h-screen flex flex-col">
          <Navbar
            logoText="Acme Inc"
            items={[
              { title: "Home", href: "/" },
              // { title: "Features", href: "/features" },
              // { title: "Pricing", href: "/pricing" },
              // { title: "About", href: "/about" },
            ]}
            user={{
              name: "Sarah Johnson",
              email: "sarah@acme.com",
              image: "https://i.pravatar.cc/150?u=a042581f4e29026704d",
            }}
            onLogout={() => console.log("Logging out...")}
          >
            <Button variant="ghost" size="sm">
              Docs
            </Button>
            <Button size="sm">Get Started</Button>
          </Navbar>

        <UserProfile />

      {/* <main className="flex-1 container px-4 py-12 md:px-6 md:py-24">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">Welcome to Acme Inc</h1>
          <p className="mt-4 text-lg text-muted-foreground">A customizable navbar with avatar and dropdown menu</p>
        </div>
      </main> */}
    </div>
  );
}
