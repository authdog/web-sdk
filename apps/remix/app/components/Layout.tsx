import { Navbar } from "@authdog/react-elements";
import { useLoaderData, useNavigate } from "@remix-run/react";

export const Layout = ({ children }: { children: React.ReactNode }) => {
  const {
    user,
    // isAuthenticated,
    signinUri,
  } = useLoaderData<{
    user: any;
    isAuthenticated: boolean;
    signinUri: string;
  }>();
  const navigate = useNavigate();

  return (
    <div>
      <Navbar
        key={user?.id}
        logoText={"ACME Corp"}
        items={[]}
        isLoading={false}
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
    </div>
  );
};
