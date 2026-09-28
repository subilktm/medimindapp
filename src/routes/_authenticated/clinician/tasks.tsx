import { createFileRoute } from "@tanstack/react-router";
import { AdminSection } from "@/components/admin-section";

export const Route = createFileRoute("/_authenticated/clinician/tasks")({
  head: () => ({
    meta: [
      { title: "Tasks & Messages — MediMind" },
      {
        name: "description",
        content: "Outstanding clinical tasks, result acknowledgements and secure messages from the care team.",
      },
      { property: "og:title", content: "Tasks & Messages — MediMind" },
      {
        property: "og:description",
        content: "Clinical tasks, result sign-off and secure care team messaging.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => (
    <AdminSection
      eyebrow="Clinician"
      title="Tasks & Messages"
      description="One queue for what needs your signature, your reply or your review."
      points={[
        "Task inbox for orders to sign, notes to complete and results to acknowledge",
        "Secure threads with nursing, pharmacy and referring clinicians",
        "Priority and due-time sorting with overdue escalation",
        "AI-drafted replies and summaries you review before sending",
      ]}
    />
  ),
});
