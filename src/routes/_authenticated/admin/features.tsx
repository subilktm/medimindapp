import { createFileRoute } from "@tanstack/react-router";
import { AdminSection } from "@/components/admin-section";

export const Route = createFileRoute("/_authenticated/admin/features")({
  head: () => ({
    meta: [
      { title: "Features — MediMind administration" },
      {
        name: "description",
        content: "Switch MediMind modules such as AI summaries, orders and billing on per tenant.",
      },
      { property: "og:title", content: "Features — MediMind administration" },
      {
        property: "og:description",
        content: "Switch MediMind modules on or off per tenant.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => (
    <AdminSection
      eyebrow="Features"
      title="Modules per tenant"
      description="Decide which parts of MediMind a tenant can see and use."
      points={[
        "Toggle modules: records, orders, pharmacy, lab, billing, AI summaries.",
        "Tie availability to the tenant's plan so upgrades unlock modules.",
        "Keep an audit trail of who switched what, and when.",
      ]}
    />
  ),
});
