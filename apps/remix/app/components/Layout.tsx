import { Navbar } from "@authdog/react-elements";
import { useLoaderData } from "@remix-run/react";
import type { loader } from "~/root";
import { useNavigate } from "@remix-run/react";

export const Layout = ({ children }: { children: React.ReactNode }) => {
  const {
    user,
    isLoading,
    signinUri
  } = useLoaderData<typeof loader>();
  const navigate = useNavigate();

  return <div>
    <Navbar
      key={user?.id}
      logoText={"ACME Corp"}
      items={[]}
      isLoading={isLoading}
      user={user as any}
      onLogout={() => {
        navigate("/logout");
      }}
      onProfileSelected={() => {
        navigate("/profile");
      }}
      onNavigateHome={() => {
        navigate("/");
      }}
      identityHost={new URL(signinUri).origin}
      environmentId={new URL(signinUri).pathname.split("/").pop()}
    />
    {children}
  </div>;
};
