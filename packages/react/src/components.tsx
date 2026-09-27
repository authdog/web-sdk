import {
  Account,
  UserButton,
  type UserProfileProps,
} from "@authdog/react-elements";
import {
  useState,
  type ButtonHTMLAttributes,
  type ReactNode,
} from "react";
import { useSession, useSignIn, useSignOut, useSignUp, useUser } from "./hooks";

export const SignedIn = ({ children }: { children?: ReactNode }) => {
  const { session, isLoading } = useSession();
  return !isLoading && session.isAuthenticated ? <>{children}</> : null;
};

export const SignedOut = ({ children }: { children?: ReactNode }) => {
  const { session, isLoading } = useSession();
  return !isLoading && !session.isAuthenticated ? <>{children}</> : null;
};

export interface AuthButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onClick"> {
  children?: ReactNode;
  redirectUrl?: string;
}

export const SignInButton = ({
  children = "Sign in",
  disabled,
  redirectUrl,
  ...props
}: AuthButtonProps) => {
  const { signIn, isLoading } = useSignIn();
  return (
    <button
      type="button"
      {...props}
      disabled={disabled || isLoading}
      onClick={() => void signIn(redirectUrl)}
    >
      {children}
    </button>
  );
};

export const SignUpButton = ({
  children = "Sign up",
  disabled,
  redirectUrl,
  ...props
}: AuthButtonProps) => {
  const { signUp, isLoading } = useSignUp();
  return (
    <button
      type="button"
      {...props}
      disabled={disabled || isLoading}
      onClick={() => void signUp(redirectUrl)}
    >
      {children}
    </button>
  );
};

export interface AccountButtonProps {
  /** Extra props forwarded to the Account panel when open. */
  accountProps?: Omit<UserProfileProps, "loading" | "user">;
  className?: string;
}

/**
 * Drop-in avatar control: UserButton opens the Account shell (Profile / MFA /
 * Sessions / Groups / Tokens).
 */
export const AccountButton = ({
  accountProps,
  className,
}: AccountButtonProps) => {
  const { user, isLoading } = useUser();
  const { signOut } = useSignOut();
  const [open, setOpen] = useState(false);

  if (isLoading) {
    return (
      <div
        className={className}
        style={{
          width: 36,
          height: 36,
          borderRadius: 999,
          background: "rgba(148,163,184,0.25)",
        }}
        aria-hidden
      />
    );
  }

  if (!user) return null;

  return (
    <>
      <UserButton
        user={user}
        onManageAccount={() => setOpen(true)}
        onSignOut={() => void signOut()}
        className={className}
      />
      {open ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Account"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 50,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(0,0,0,0.55)",
            padding: 16,
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
        >
          <div
            style={{
              width: "min(960px, 100%)",
              height: "min(640px, 100%)",
              overflow: "hidden",
              borderRadius: 16,
              background: "var(--background, #09090b)",
              color: "var(--foreground, #fafafa)",
              boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)",
            }}
          >
            <Account
              loading={false}
              user={user}
              onClose={() => setOpen(false)}
              {...accountProps}
            />
          </div>
        </div>
      ) : null}
    </>
  );
};
