import { createFileRoute } from "@tanstack/react-router";
import { AdminSection } from "@/components/admin-section";

export const Route = createFileRoute("/_authenticated/reception/walk-in")({
  head: () => ({
    meta: [
      { title: "Walk in patients — MediMind front desk" },
      {
        name: "description",
        content: "Queue and triage patients who arrive at the clinic without an appointment.",
      },
      { property: "og:title", content: "Walk in patients — MediMind front desk" },
      {
        property: "og:description",
        content: "Queue and triage patients arriving without an appointment.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => (
    <AdminSection
      eyebrow="Walk In Patient"
      title="Unscheduled arrivals"
      description="Get a walk-in patient into the queue quickly, then on to the right clinician."
      points={[
        "Quick register with the minimum details needed to be seen.",
        "Assign to the next free doctor or department queue.",
        "Track waiting time so nobody is forgotten.",
      ]}
    />
  ),
});
