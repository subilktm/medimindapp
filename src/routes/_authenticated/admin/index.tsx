import { createFileRoute, Link } from "@tanstack/react-router";
import { Boxes, Building2, CreditCard, Database, Rocket } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/")({
  head: () => ({
    meta: [
      { title: "Administration overview — MediMind" },
      {
        name: "description",
        content:
          "Manage MediMind tenants, subscriptions, feature toggles, deployments and database mappings from one administration console.",
      },
      { property: "og:title", content: "Administration overview — MediMind" },
      {
        property: "og:description",
        content: "Manage tenants, subscriptions, features, deployments and database mappings.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AdminOverview,
});

const CARDS = [
  { to: "/admin/tenant", label: "Tenant", icon: Building2, blurb: "Hospitals and clinics using MediMind." },
  { to: "/admin/subscription", label: "Subscription", icon: CreditCard, blurb: "Plans, seats and renewal dates." },
  { to: "/admin/features", label: "Features", icon: Boxes, blurb: "Turn modules on per tenant." },
  { to: "/admin/deployment", label: "Deployment", icon: Rocket, blurb: "Environments and release status." },
  { to: "/admin/db-mapping", label: "DB mapping", icon: Database, blurb: "Data sources mapped to each tenant." },
] as const;

function AdminOverview() {
  return (
    <>
      <section className="relative overflow-hidden rounded-2xl bg-clinical p-6 text-primary-foreground shadow-panel">
        <div className="relative z-10">
          <span className="rounded bg-primary-foreground/20 px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase">
            Administration
          </span>
          <h1 className="mt-2 font-display text-2xl font-bold tracking-tight">Control centre</h1>
          <p className="mt-2 max-w-xl text-sm text-primary-foreground/80">
            Everything that shapes how MediMind runs for each organisation.
          </p>
        </div>
        <span className="pointer-events-none absolute -top-8 -right-8 size-48 rounded-full bg-primary-foreground/10 blur-3xl" />
      </section>

      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {CARDS.map(({ to, label, icon: Icon, blurb }) => (
          <Link
            key={to}
            to={to}
            className="rounded-2xl border border-border bg-card/70 p-5 transition-all hover:border-accent hover:bg-card"
          >
            <span className="flex size-9 items-center justify-center rounded-xl bg-secondary text-primary">
              <Icon className="size-4" />
            </span>
            <p className="mt-4 font-display text-lg font-bold tracking-tight">{label}</p>
            <p className="mt-1 text-sm text-muted-foreground">{blurb}</p>
          </Link>
        ))}
      </div>
    </>
  );
}
