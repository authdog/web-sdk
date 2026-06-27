import { Component, inject } from "@angular/core";
import { RouterLink } from "@angular/router";
import { AuthdogService } from "@authdog/angular";

@Component({
  selector: "app-home",
  standalone: true,
  imports: [RouterLink],
  template: `
    <h1>Welcome to the Authdog × Angular demo</h1>
    <p class="muted">
      This app shows how to wire <code>&#64;authdog/angular</code> into a
      standalone Angular application: <code>provideAuthdog</code> for config,
      the functional <code>authdogInterceptor</code> to attach the bearer token
      to HTTP calls, the <code>AuthdogService</code> signals for client state,
      and <code>authdogGuard</code> to gate navigation.
    </p>

    @if (auth.isLoading()) {
      <p>Loading session…</p>
    } @else if (auth.isAuthenticated() || auth.token()) {
      <div class="card success">
        <h3>You are signed in</h3>
        <p>Head over to your <a routerLink="/profile">profile</a>.</p>
      </div>
    } @else {
      <div class="card">
        <h3>You are signed out</h3>
        <p>Use the “Sign in” button in the navbar to start the hosted flow.</p>
      </div>
    }
  `,
  styles: [
    `
      h1 {
        margin-top: 0;
      }
      .muted {
        color: var(--muted);
      }
      .card {
        margin-top: 1.5rem;
        padding: 1.5rem;
        border: 1px solid var(--border);
        border-radius: 8px;
        background: var(--surface);
      }
      .card.success {
        background: #ecfdf5;
        border-color: #a7f3d0;
      }
      code {
        background: #f3f4f6;
        padding: 0.1rem 0.3rem;
        border-radius: 4px;
      }
    `,
  ],
})
export class HomeComponent {
  protected readonly auth = inject(AuthdogService);
}
