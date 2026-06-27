import { Component, inject } from "@angular/core";
import { RouterLink, RouterOutlet } from "@angular/router";
import { AuthdogService } from "@authdog/angular";

@Component({
  selector: "app-root",
  standalone: true,
  imports: [RouterOutlet, RouterLink],
  template: `
    <nav class="navbar">
      <a routerLink="/" class="brand">ACME Corp</a>

      <div class="links">
        <a routerLink="/">Home</a>
        @if (auth.isAuthenticated()) {
          <a routerLink="/profile">Profile</a>
        }

        @if (auth.isLoading()) {
          <span class="muted">Loading…</span>
        } @else if (auth.token()) {
          <button class="btn danger" (click)="auth.signOut()">Sign out</button>
        } @else {
          <button class="btn" (click)="auth.signIn()">Sign in</button>
        }
      </div>
    </nav>

    <main class="content">
      <router-outlet />
    </main>
  `,
  styles: [
    `
      .navbar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 1rem 2rem;
        border-bottom: 1px solid var(--border);
        background: var(--surface);
      }
      .brand {
        font-weight: 700;
        font-size: 1.1rem;
        color: var(--fg);
      }
      .brand:hover {
        text-decoration: none;
      }
      .links {
        display: flex;
        gap: 1rem;
        align-items: center;
      }
      .muted {
        color: var(--muted);
      }
      .btn {
        border: none;
        border-radius: 6px;
        padding: 0.5rem 1rem;
        background: var(--primary);
        color: #fff;
        font-weight: 500;
      }
      .btn:hover {
        background: var(--primary-hover);
      }
      .btn.danger {
        background: var(--danger);
      }
      .content {
        max-width: 720px;
        margin: 0 auto;
        padding: 2rem;
      }
    `,
  ],
})
export class AppComponent {
  protected readonly auth = inject(AuthdogService);
}
