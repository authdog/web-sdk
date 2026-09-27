import React from "react";

/**
 * Hosted identity screens (authdog.com "Embedded components" catalog).
 *
 * Most catalog entries — <SignUp />, <MagicLink />, <OrganizationSwitcher />,
 * <AdminPortal />, … — are hosted pages served by the Authdog identity app,
 * not React components exported from this package. Storybook mirrors the
 * website catalog by embedding the same live previews the marketing site uses.
 *
 * Override the origin with VITE_AUTHDOG_IDENTITY_ORIGIN (e.g. a local
 * identity dev server) when running Storybook.
 */
const IDENTITY_BASE = (
  (import.meta as { env?: Record<string, string | undefined> }).env
    ?.VITE_AUTHDOG_IDENTITY_ORIGIN || "https://identity.authdog.com"
).replace(/\/$/, "");

export const hostedPreviewUrl = (route: string, extra = "") =>
  `${IDENTITY_BASE}/${route}?preview=true&embed=true&v=9${extra}`;

/** Same logical mobile viewport as the marketing site's preview cards. */
const VIEWPORT_WIDTH = 390;
const VIEWPORT_HEIGHT = 700;

export function HostedPreview({
  route,
  extra,
  title,
}: {
  route: string;
  extra?: string;
  title: string;
}) {
  return (
    <div
      className="overflow-hidden rounded-xl border border-gray-300 bg-white shadow-[0_20px_60px_rgba(50,40,90,0.22)] dark:border-white/20 dark:bg-[#17192d] dark:shadow-[0_24px_64px_rgba(0,0,0,0.45)]"
      style={{ width: VIEWPORT_WIDTH, height: VIEWPORT_HEIGHT }}
    >
      <iframe
        src={hostedPreviewUrl(route, extra)}
        title={title}
        className="block h-full w-full border-0 bg-[#f7f7f8]"
        sandbox="allow-scripts allow-same-origin"
        loading="lazy"
      />
    </div>
  );
}

export const hostedDocs = (tag: string, route: string) => ({
  description: {
    component: `\`${tag}\` is a hosted identity screen (\`/${route}\`) rendered by the Authdog identity app — embedded here live, exactly like the component catalog on authdog.com. Use the hosted flow (or \`@authdog/react\` redirects) rather than a local React component.`,
  },
});
