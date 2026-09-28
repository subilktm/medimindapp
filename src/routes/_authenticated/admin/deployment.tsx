import { createFileRoute } from "@tanstack/react-router";
import { AdminSection } from "@/components/admin-section";

export const Route = createFileRoute("/_authenticated/admin/deployment")({
  head: () => ({
    meta: [
      { title: "Deployment — MediMind administration" },
      {
        name: "description",
        content: "Environments, versions and rollout status for each MediMind tenant.",
      },
      { property: "og:title", content: "Deployment — MediMind administration" },
      {
        property: "og:description",
        content: "Environments, versions and rollout status for each MediMind tenant.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => (
    <AdminSection
      eyebrow="Deployment"
      title="Environments and releases"
      description="Where each tenant runs and which version they are on."
      points={[
        "Track staging and production environments per tenant.",
        "Record the deployed version, region and health status.",
        "Schedule a release window and note the outcome.",
      ]}
    />
  ),
});
