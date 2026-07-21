import { type ButtonHTMLAttributes, type ReactNode } from "react";
import { useSession, useSignIn, useSignUp } from "./hooks";

export const SignedIn = ({ children }: { children?: ReactNode }) => {
  const { session, isLoading } = useSession();
  return !isLoading && session.isAuthenticated ? children : null;
};

export const SignedOut = ({ children }: { children?: ReactNode }) => {
  const { session, isLoading } = useSession();
  return !isLoading && !session.isAuthenticated ? children : null;
};

export interface AuthButtonProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "onClick"
> {
  children?: ReactNode;
}

export const SignInButton = ({
  children = "Sign in",
  disabled,
  ...props
}: AuthButtonProps) => {
  const { signIn, isLoading } = useSignIn();
  return (
    <button
      type="button"
      {...props}
      disabled={disabled || isLoading}
      onClick={() => void signIn()}
    >
      {children}
    </button>
  );
};

export const SignUpButton = ({
  children = "Sign up",
  disabled,
  ...props
}: AuthButtonProps) => {
  const { signUp, isLoading } = useSignUp();
  return (
    <button
      type="button"
      {...props}
      disabled={disabled || isLoading}
      onClick={() => void signUp()}
    >
      {children}
    </button>
  );
};
