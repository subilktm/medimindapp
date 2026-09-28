import { createFileRoute } from "@tanstack/react-router";
import { AdminSection } from "@/components/admin-section";

export const Route = createFileRoute("/_authenticated/admin/db-mapping")({
  head: () => ({
    meta: [
      { title: "DB mapping — MediMind administration" },
      {
        name: "description",
        content: "Map each MediMind tenant to its data source and keep field mappings aligned.",
      },
      { property: "og:title", content: "DB mapping — MediMind administration" },
      {
        property: "og:description",
        content: "Map each MediMind tenant to its data source and field mappings.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => (
    <AdminSection
      eyebrow="DB mapping"
      title="Data sources and field mapping"
      description="How a tenant's records connect to the data store behind MediMind."
      points={[
        "Point a tenant at a shared or dedicated data store.",
        "Map incoming fields from existing hospital systems to MediMind fields.",
        "Validate a mapping before it goes live, then version it.",
      ]}
    />
  ),
});
