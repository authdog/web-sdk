import {
  Injectable,
  computed,
  inject,
  signal,
  type Signal,
} from "@angular/core";
import { AUTHDOG_CONFIG } from "./tokens";
import {
  JWT_PATTERN,
  TOKEN_STORAGE_KEY,
  buildAuthorizeUrl,
  fetchUserData,
} from "./session";

const isBrowser = (): boolean => typeof window !== "undefined";

/**
 * Root-provided service that owns the client-side auth state.
 *
 * State is exposed as readonly signals so templates and `computed`s react to
 * changes automatically. The service is browser-first: every `window` /
 * `localStorage` access is guarded so it is inert under Angular Universal
 * (SSR), where it simply reports "not loading, no token".
 */
@Injectable({ providedIn: "root" })
export class AuthdogService {
  private readonly config = inject(AUTHDOG_CONFIG);

  private readonly _token = signal<string | null>(null);
  private readonly _isLoading = signal<boolean>(true);
  private readonly _user = signal<unknown>(null);
  private readonly _error = signal<Error | null>(null);

  /** Current bearer token, or `null` when signed out. */
  readonly token: Signal<string | null> = this._token.asReadonly();
  /** True until the initial token-from-URL / localStorage bootstrap finishes. */
  readonly isLoading: Signal<boolean> = this._isLoading.asReadonly();
  /** The last fetched userinfo `user` payload, or `null`. */
  readonly user: Signal<unknown> = this._user.asReadonly();
  /** The last error raised by a sign-in / fetch operation, or `null`. */
  readonly error: Signal<Error | null> = this._error.asReadonly();

  /** True when a token is present AND a user has been loaded. */
  readonly isAuthenticated: Signal<boolean> = computed(
    () => !!this._token() && !!this._user(),
  );

  constructor() {
    this.bootstrap();
  }

  /**
   * Reads a token from the URL (`?token=`) or localStorage. A URL token is
   * validated against the JWT pattern BEFORE it is persisted, so arbitrary
   * attacker-supplied query data is never written to storage, and is stripped
   * from the address bar via `history.replaceState` regardless of validity.
   */
  private bootstrap(): void {
    if (!isBrowser()) {
      this._isLoading.set(false);
      return;
    }

    const url = new URL(window.location.href);
    const urlToken = url.searchParams.get("token");

    if (urlToken) {
      // Remove the token from the URL without a reload, valid or not.
      url.searchParams.delete("token");
      window.history.replaceState({}, document.title, url.toString());

      // Only persist values that look like a JWT.
      if (JWT_PATTERN.test(urlToken)) {
        localStorage.setItem(TOKEN_STORAGE_KEY, urlToken);
        this._token.set(urlToken);
        this._isLoading.set(false);
        return;
      }
    }

    const existingToken = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (existingToken) {
      this._token.set(existingToken);
    }

    this._isLoading.set(false);
  }

  /** Imperatively set (or clear) the in-memory + persisted token. */
  setToken(token: string | null): void {
    this._token.set(token);
    if (!isBrowser()) return;

    if (token) {
      localStorage.setItem(TOKEN_STORAGE_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
    }
  }

  /** Redirect the browser to the hosted sign-in page. */
  signIn(publicKey: string = this.config.publicKey, redirectUrl?: string): void {
    if (!isBrowser()) return;
    this._error.set(null);
    try {
      window.location.href = buildAuthorizeUrl(
        publicKey,
        redirectUrl || window.location.origin,
      );
    } catch (err) {
      this._error.set(err as Error);
    }
  }

  /** Redirect the browser to the hosted sign-up page (`prompt=signup`). */
  signUp(publicKey: string = this.config.publicKey, redirectUrl?: string): void {
    if (!isBrowser()) return;
    this._error.set(null);
    try {
      window.location.href = buildAuthorizeUrl(
        publicKey,
        redirectUrl || window.location.origin,
        { signup: true },
      );
    } catch (err) {
      this._error.set(err as Error);
    }
  }

  /** Clear the session locally and redirect to the logout endpoint. */
  signOut(): void {
    this.setToken(null);
    this._user.set(null);
    if (isBrowser()) {
      window.location.href = "/logout";
    }
  }

  /**
   * Fetches the current user from the identity host's userinfo endpoint and
   * stores it on the `user` signal. Returns `null` when there is no token.
   */
  async fetchUser(
    publicKey: string = this.config.publicKey,
  ): Promise<unknown> {
    const token = this._token();
    if (!token) {
      return null;
    }

    this._error.set(null);
    try {
      const userData = await fetchUserData(publicKey, token);
      const user = userData?.user ?? null;
      this._user.set(user);
      return user;
    } catch (err) {
      this._error.set(err as Error);
      return null;
    }
  }
}
