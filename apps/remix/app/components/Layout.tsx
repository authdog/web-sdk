import React from "react";
import { useNavigate } from "@remix-run/react";
// § styles from "@authdog/react-elements/styles.css?url";

// Create a client-only component for the Navbar
const ClientNavbar = React.lazy(() => 
  import("@authdog/react-elements").then(mod => ({ 
    default: mod.Navbar 
  }))
);

// Create a client-only wrapper component
function ClientOnly({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return <>{children}</>;
}

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen">
      <ClientOnly>
        <React.Suspense fallback={<div>Loading...</div>}>
          <ClientNavbar
            logoText="Acme Inc"
            items={[
              // { title: "Home", href: "/" },
              // { title: "Features", href: "/features" },
              // { title: "Pricing", href: "/pricing" },
              // { title: "About", href: "/about" },
            ]}
            user={{
              name: "Sarah Johnson",
              email: "sarah@acme.com",
              image: "https://i.pravatar.cc/150?u=a042581f4e29026704d",
            }}
            onNavigateHome={() => navigate("/")}
            onNavItemClick={(href) => navigate(href)}
            onProfileSelected={() => navigate("/profile")}
            onLogout={() => console.log("Logging out...")}
          />
        </React.Suspense>
      </ClientOnly>
      <main className="">
        {children}
      </main>
    </div>
  );
} 