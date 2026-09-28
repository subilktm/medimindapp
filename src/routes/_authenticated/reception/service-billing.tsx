import { createFileRoute } from "@tanstack/react-router";
import { AdminSection } from "@/components/admin-section";

export const Route = createFileRoute("/_authenticated/reception/service-billing")({
  head: () => ({
    meta: [
      { title: "Service billing — MediMind front desk" },
      {
        name: "description",
        content: "Raise bills for consultations, procedures and other services at the front desk.",
      },
      { property: "og:title", content: "Service billing — MediMind front desk" },
      {
        property: "og:description",
        content: "Raise and settle bills for consultations and services.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => (
    <AdminSection
      eyebrow="Service Billing"
      title="Charges and payments"
      description="Bill a visit, take payment and hand the patient a clear receipt."
      points={[
        "Add services from a priced catalogue with quantities.",
        "Apply discounts, taxes and insurance coverage.",
        "Record cash or card payment and print the receipt.",
      ]}
    />
  ),
});
