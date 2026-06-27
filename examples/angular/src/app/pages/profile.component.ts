import { Component, computed, inject, type OnInit } from "@angular/core";
import { AuthdogService } from "@authdog/angular";

/** The subset of the userinfo `user` payload this page renders. */
interface ProfileUser {
  id?: string;
  userName?: string;
  displayName?: string;
  provider?: string;
  lastLogin?: string;
  emails?: { value: string; primary?: boolean; type?: string }[];
  photos?: { value: string; type?: string }[];
}

@Component({
  selector: "app-profile",
  standalone: true,
  template: `
    <h1>Your profile</h1>

    @if (auth.error()) {
      <div class="card error">
        <p>Failed to load user: {{ auth.error()?.message }}</p>
        <button class="btn" (click)="reload()">Try again</button>
      </div>
    } @else {
      @if (user(); as u) {
        <div class="card">
          @if (u.photos?.[0]) {
            <img class="avatar" [src]="u.photos![0].value" alt="avatar" />
          }
          <h3>{{ u.displayName || u.userName || "Unknown user" }}</h3>
          <p><strong>Email:</strong> {{ u.emails?.[0]?.value || "N/A" }}</p>
          <p><strong>User ID:</strong> {{ u.id || "N/A" }}</p>
          <p><strong>Provider:</strong> {{ u.provider || "N/A" }}</p>
          <p><strong>Last login:</strong> {{ u.lastLogin || "N/A" }}</p>
        </div>
      } @else {
        <p>Loading user…</p>
      }
    }
  `,
  styles: [
    `
      .card {
        margin-top: 1.5rem;
        padding: 1.5rem;
        border: 1px solid var(--border);
        border-radius: 8px;
        background: var(--surface);
      }
      .card.error {
        background: #fef2f2;
        border-color: #fecaca;
        color: var(--danger);
      }
      .avatar {
        width: 80px;
        height: 80px;
        border-radius: 50%;
        object-fit: cover;
      }
      .btn {
        border: none;
        border-radius: 6px;
        padding: 0.5rem 1rem;
        background: var(--primary);
        color: #fff;
      }
    `,
  ],
})
export class ProfileComponent implements OnInit {
  protected readonly auth = inject(AuthdogService);

  // `AuthdogService.user` is typed as `unknown`; narrow it for the template.
  protected readonly user = computed(
    () => this.auth.user() as ProfileUser | null,
  );

  async ngOnInit(): Promise<void> {
    await this.auth.fetchUser();
  }

  protected reload(): void {
    void this.auth.fetchUser();
  }
}
