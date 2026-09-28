import { createFileRoute } from "@tanstack/react-router";
import { AdminSection } from "@/components/admin-section";

export const Route = createFileRoute("/_authenticated/admin/tenant")({
  head: () => ({
    meta: [
      { title: "Tenants — MediMind administration" },
      {
        name: "description",
        content: "Register and manage the hospitals and clinics that use MediMind.",
      },
      { property: "og:title", content: "Tenants — MediMind administration" },
      {
        property: "og:description",
        content: "Register and manage the hospitals and clinics that use MediMind.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => (
    <AdminSection
      eyebrow="Tenant"
      title="Organisations on MediMind"
      description="Each hospital or clinic is a tenant with its own staff, patients and settings."
      points={[
        "Create a tenant with its legal name, code and contact details.",
        "Assign an administrator who manages staff for that tenant.",
        "Suspend or reactivate a tenant without losing its records.",
      ]}
    />
  ),
});
