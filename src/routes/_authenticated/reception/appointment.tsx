import { createFileRoute } from "@tanstack/react-router";
import { AdminSection } from "@/components/admin-section";

export const Route = createFileRoute("/_authenticated/reception/appointment")({
  head: () => ({
    meta: [
      { title: "Appointments — MediMind front desk" },
      {
        name: "description",
        content: "Book, reschedule and confirm patient appointments from the MediMind front desk.",
      },
      { property: "og:title", content: "Appointments — MediMind front desk" },
      {
        property: "og:description",
        content: "Book, reschedule and confirm patient appointments.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => (
    <AdminSection
      eyebrow="Appointment"
      title="Today's schedule"
      description="Book visits against a doctor's clinic hours and keep patients informed."
      points={[
        "Search a patient and book against an available slot.",
        "Reschedule or cancel with a reason recorded.",
        "See arrivals, waiting and completed visits at a glance.",
      ]}
    />
  ),
});
