"use client";

import type { Meta, StoryObj } from "@storybook/react";
import { Layers, Lock, Rocket, Shield, Sparkles, Users } from "lucide-react";
import React from "react";

import { UserDropdown } from "../../components/core/user-dropdown";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../components/ui/avatar";
import { Button } from "../../components/ui/button";

const highlights = [
  {
    title: "Secure foundations",
    description:
      "Every component is wired for Authdog policies, session handling, and multi-factor protections out of the box.",
    Icon: Shield,
  },
  {
    title: "Composable flows",
    description:
      "Drop in opinionated login, signup, and TOTP experiences or compose your own with the same primitives.",
    Icon: Layers,
  },
  {
    title: "Design-system ready",
    description:
      "Built on top of Tailwind and Radix, so tokens, colors, and interactions match the rest of your product.",
    Icon: Sparkles,
  },
  {
    title: "Enterprise friendly",
    description:
      "Handle complex org hierarchies, SSO policies, and delegated admin journeys without reinventing UI.",
    Icon: Users,
  },
];

const buildSteps = [
  {
    title: "Install & theme",
    description:
      "Install the React Elements package, extend your Tailwind config, and drop Storybook around your component stories.",
    meta: "pnpm add @authdog/react-elements",
  },
  {
    title: "Connect to Authdog",
    description:
      "Pass your environment ID & identity host into flows and hooks to unlock real tenant-aware data.",
    meta: '<Login environmentId="env_xxx" identityHost="https://id.auth.dog" />',
  },
  {
    title: "Ship polished surfaces",
    description:
      "Combine core UI, flows, and utilities to cover onboarding, profile management, and secure recovery.",
    meta: "<UserDropdown user={currentUser} />",
  },
];

function LoginJourneysSlice() {
  return (
    <div className="text-left">
      <div className="space-y-3">
        <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
          <p className="text-xs uppercase tracking-wide text-white/60">
            Email address
          </p>
          <p className="text-white">designer@studio.com</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
          <p className="text-xs uppercase tracking-wide text-white/60">
            Magic link sent
          </p>
          <p className="text-white">Check your inbox to continue</p>
        </div>
        <Button className="w-full bg-white text-slate-900 hover:bg-white/90">
          Continue
        </Button>
      </div>
    </div>
  );
}

function SecurityMomentsSlice() {
  return (
    <div className="space-y-3 text-left">
      <div className="rounded-2xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-3 text-emerald-100">
        <p className="text-xs uppercase tracking-wide text-emerald-200">
          One-time passcode
        </p>
        <p className="text-3xl font-mono tracking-widest">482 913</p>
      </div>
      <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white/80">
        Trusted device: MacBook Pro · Paris, FR
      </div>
      <Button
        variant="secondary"
        className="w-full bg-emerald-500/20 text-white hover:bg-emerald-500/30"
      >
        Approve & continue
      </Button>
    </div>
  );
}

function UserContextSlice() {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-left text-white/80">
      <div className="flex items-center gap-3">
        <Avatar className="h-12 w-12">
          <AvatarImage src="https://i.pravatar.cc/140?img=24" alt="Harper" />
          <AvatarFallback>H</AvatarFallback>
        </Avatar>
        <div>
          <p className="text-lg font-semibold text-white">Harper Reed</p>
          <p className="text-sm text-white/70">Product Operations</p>
        </div>
      </div>
      <dl className="mt-4 space-y-2 text-sm">
        <div className="flex items-center justify-between">
          <dt>Workspace</dt>
          <dd className="text-white">Orion Health</dd>
        </div>
        <div className="flex items-center justify-between">
          <dt>Role</dt>
          <dd className="text-white">Global Admin</dd>
        </div>
        <div className="flex items-center justify-between">
          <dt>Last active</dt>
          <dd className="text-white">2 minutes ago</dd>
        </div>
      </dl>
    </div>
  );
}

const componentSlices = [
  {
    title: "Login journeys",
    description:
      "Stateful, validated forms with branded headers, inline errors, and social providers baked in.",
    Component: LoginJourneysSlice,
  },
  {
    title: "Security moments",
    description:
      "Ready-made MFA, device approvals, and risk prompts keep your team secure without extra design cycles.",
    Component: SecurityMomentsSlice,
  },
  {
    title: "User context",
    description:
      "Profile, session, and organization widgets keep people oriented while you surface critical actions.",
    Component: UserContextSlice,
  },
];

const stats = [
  { label: "Components & flows", value: "25+" },
  { label: "SDK downloads", value: "12k+" },
  { label: "Avg. setup time", value: "<10 min" },
];

const showcaseUser = {
  displayName: "Avery Stone",
  emails: [{ value: "avery.stone@northwind.dev" }],
  photos: [{ value: "https://i.pravatar.cc/120?img=12" }],
};

const Trigger = () => (
  <div className="flex items-center gap-3 rounded-full border border-white/20 bg-white/10 px-3 py-2 text-left text-white shadow-2xl backdrop-blur">
    <Avatar className="h-10 w-10">
      <AvatarImage src={showcaseUser.photos?.[0]?.value} alt="Avery Stone" />
      <AvatarFallback>AS</AvatarFallback>
    </Avatar>
    <div>
      <p className="text-sm font-semibold leading-tight">Avery Stone</p>
      <p className="text-xs text-white/70">Product Lead · Northwind</p>
    </div>
  </div>
);

const meta = {
  title: "Showcase/Landing",
  component: LandingShowcase,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof LandingShowcase>;

export default meta;

type Story = StoryObj<typeof LandingShowcase>;

export const FullPage: Story = {
  render: () => <LandingShowcase />,
};

function LandingShowcase() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-16 px-6 py-16">
        <section className="grid items-center gap-12 lg:grid-cols-[1.2fr_minmax(0,1fr)]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-300">
              Authdog React Elements
            </p>
            <h1 className="mt-4 text-4xl font-semibold leading-tight text-white sm:text-5xl">
              Design-led authentication surfaces built for product teams.
            </h1>
            <p className="mt-4 text-lg text-white/70">
              Ship login, profile, and security experiences that feel native to
              your product. React Elements bundles Radix-powered primitives,
              Authdog flows, and thoughtful defaults so teams can focus on their
              roadmap—not boilerplate UI.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Button size="lg" className="bg-white text-slate-900 hover:bg-white/90">
                Explore components
              </Button>
              <Button size="lg" variant="secondary" asChild>
                <a
                  href="https://docs.authdog.com"
                  target="_blank"
                  rel="noreferrer"
                  className="text-white"
                >
                  Read the docs
                </a>
              </Button>
              <Button size="lg" variant="ghost" asChild>
                <a
                  href="https://github.com/authdog-labs/web-sdk"
                  target="_blank"
                  rel="noreferrer"
                  className="text-white/80"
                >
                  View on GitHub
                </a>
              </Button>
            </div>
            <dl className="mt-10 grid gap-8 sm:grid-cols-3">
              {stats.map((stat) => (
                <div key={stat.label}>
                  <dt className="text-xs uppercase tracking-wide text-white/60">
                    {stat.label}
                  </dt>
                  <dd className="mt-2 text-3xl font-semibold">{stat.value}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="rounded-[32px] border border-white/10 bg-white/5 p-6 shadow-[0_40px_120px_rgba(15,23,42,0.35)] backdrop-blur">
            <div className="flex items-center gap-3 text-white/70">
              <Lock className="h-5 w-5 text-white" />
              <span className="text-sm font-medium">Live component preview</span>
            </div>
            <p className="mt-2 text-sm text-white/60">
              The same dropdown powering production consoles.
            </p>
            <div className="mt-6">
              <UserDropdown
                trigger={<Trigger />}
                triggerWrapperClassName="w-full justify-start"
                user={showcaseUser}
                onManageAccount={() => undefined}
                onSignout={() => undefined}
                links={[
                  { label: "Open Admin", href: "https://app.authdog.com" },
                  { label: "Switch workspace", href: "#" },
                ]}
                side="bottom"
                align="start"
              />
            </div>
          </div>
        </section>

        <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {highlights.map(({ title, description, Icon }) => (
            <div
              key={title}
              className="rounded-3xl border border-white/10 bg-white/5 p-6 text-white/80 shadow-inner"
            >
              <div className="flex items together gap-3 text-white">
                <div className="rounded-2xl border border-white/20 bg-white/10 p-3">
                  <Icon className="h-6 w-6" />
                </div>
                <p className="text-lg font-semibold text-white">{title}</p>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-white/70">
                {description}
              </p>
            </div>
          ))}
        </section>

        <section className="rounded-[32px] border border-white/10 bg-gradient-to-br from-slate-900/60 to-slate-900/20 p-8 text-white shadow-[0_20px_80px_rgba(15,23,42,0.4)]">
          <div className="flex flex-col gap-2 text-left">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-white/60">
              Build faster
            </p>
            <div className="flex items-center gap-3">
              <Rocket className="h-6 w-6 text-white" />
              <h2 className="text-2xl font-semibold">
                Three steps from idea to production-ready auth
              </h2>
            </div>
            <p className="text-white/70">
              No scaffolding, no copy/pasting from old projects—just focused,
              secure UI primitives that mirror the best of the Authdog console.
            </p>
          </div>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {buildSteps.map((step) => (
              <div
                key={step.title}
                className="rounded-2xl border border-white/15 bg-white/5 p-5 text-white/80"
              >
                <p className="text-xs uppercase tracking-wide text-white/60">
                  {step.title}
                </p>
                <p className="mt-2 text-sm leading-relaxed">{step.description}</p>
                <code className="mt-4 inline-block rounded-xl border border-white/20 bg-slate-900/70 px-3 py-2 font-mono text-xs text-emerald-200">
                  {step.meta}
                </code>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-8">
          <div className="max-w-3xl text-left">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-white/60">
              What you'll find inside
            </p>
            <h2 className="mt-3 text-3xl font-semibold text-white">
              Opinionated building blocks for every identity moment.
            </h2>
            <p className="mt-3 text-white/70">
              Each component ships with motion, accessibility, and sensible data
              wiring so you can focus on tailoring the story to your customers.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {componentSlices.map(({ title, description, Component }) => (
              <div
                key={title}
                className="flex flex-col gap-4 rounded-[28px] border border-white/10 bg-white/5 p-6 text-white/80"
              >
                <div>
                  <p className="text-lg font-semibold text-white">{title}</p>
                  <p className="text-sm text-white/70">{description}</p>
                </div>
                <div className="flex-1">
                  <Component />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}


