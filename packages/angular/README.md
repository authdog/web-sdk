# `@authdog/angular`

**Authdog SDK for Angular** — a root-provided auth service backed by signals, a
functional HTTP interceptor, and a route guard. Integrates natively with
Angular's dependency injection and `HttpClient`.

## Installation

```bash
bun add @authdog/angular
```

```bash
npm install @authdog/angular
```

Your public key (`pk_…`) is available in the [Authdog dashboard](https://authdog.com).
It is safe to expose to the browser.

## Setup

Register the SDK in your standalone application config:

```ts
import { ApplicationConfig } from "@angular/core";
import { provideHttpClient, withInterceptors } from "@angular/common/http";
import { provideAuthdog, authdogInterceptor } from "@authdog/angular";

export const appConfig: ApplicationConfig = {
  providers: [
    provideAuthdog({ publicKey: "pk_xxxxxxxxxxxxxxxx" }),
    // Attaches `Authorization: Bearer <token>` to outgoing requests.
    provideHttpClient(withInterceptors([authdogInterceptor])),
  ],
};
```

## Usage

Inject `AuthdogService` anywhere. Its state is exposed as **signals**, so it
works seamlessly in templates and `computed()`s:

```ts
import { Component, inject } from "@angular/core";
import { AuthdogService } from "@authdog/angular";

@Component({
  selector: "app-profile",
  standalone: true,
  template: `
    @if (auth.isLoading()) {
      <p>Loading…</p>
    } @else if (auth.token()) {
      <p>Signed in</p>
      <button (click)="auth.signOut()">Sign out</button>
    } @else {
      <button (click)="auth.signIn()">Sign in</button>
      <button (click)="auth.signUp()">Sign up</button>
    }
  `,
})
export class ProfileComponent {
  readonly auth = inject(AuthdogService);

  async ngOnInit() {
    await this.auth.fetchUser();
    console.log(this.auth.user());
  }
}
```

### Signals & methods

| Member             | Type                       | Description                                       |
| ------------------ | -------------------------- | ------------------------------------------------- |
| `token`            | `Signal<string \| null>`   | Current bearer token.                             |
| `isLoading`        | `Signal<boolean>`          | True during the initial bootstrap.                |
| `isAuthenticated`  | `Signal<boolean>`          | True when a token **and** a user are present.     |
| `user`             | `Signal<unknown>`          | Last fetched userinfo payload.                    |
| `error`            | `Signal<Error \| null>`    | Last sign-in / fetch error.                       |
| `signIn(pk?, url?)`| `void`                     | Redirect to hosted sign-in.                       |
| `signUp(pk?, url?)`| `void`                     | Redirect to hosted sign-up (`prompt=signup`).     |
| `signOut()`        | `void`                     | Clear the session and redirect to `/logout`.      |
| `fetchUser(pk?)`   | `Promise<unknown>`         | Load the current user from `userinfo`.            |

`publicKey` defaults to the value passed to `provideAuthdog`, so the argument is
optional in most calls.

### Route guard

```ts
import { Routes } from "@angular/router";
import { authdogGuard } from "@authdog/angular";

export const routes: Routes = [
  { path: "dashboard", component: DashboardComponent, canActivate: [authdogGuard] },
];
```

> ⚠️ **`authdogGuard` is presentational / UX only — it is _not_ a security
> boundary.** It runs in the browser and is trivially bypassable. Every
> protected operation must be independently enforced server-side; the API
> behind a guarded route must validate the session on every request.

## How it works

On startup the service reads a `?token=` value from the URL, validates it
against the JWT pattern **before** persisting it to `localStorage`, then strips
it from the address bar via `history.replaceState`. Otherwise it restores any
previously stored token. All `window` / `localStorage` access is guarded so the
service is inert under Angular Universal (SSR). Public keys are decoded through
the hardened `@authdog/node-commons` parser, which enforces a trusted
identity-host allowlist (SSRF / token-exfiltration protection).

## License

MIT
