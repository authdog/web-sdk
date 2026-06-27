import { type Routes } from "@angular/router";
import { authdogGuard } from "@authdog/angular";
import { HomeComponent } from "./pages/home.component";
import { ProfileComponent } from "./pages/profile.component";

export const routes: Routes = [
  { path: "", component: HomeComponent },
  // ⚠️ `authdogGuard` is presentational only (UX) — it keeps unauthenticated
  // users from *navigating* here. The data behind this route must still be
  // enforced server-side on every request.
  { path: "profile", component: ProfileComponent, canActivate: [authdogGuard] },
  { path: "**", redirectTo: "" },
];
