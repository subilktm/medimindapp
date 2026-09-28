import { createFileRoute } from "@tanstack/react-router";
import { AdminSection } from "@/components/admin-section";

export const Route = createFileRoute("/_authenticated/admin/subscription")({
  head: () => ({
    meta: [
      { title: "Subscriptions — MediMind administration" },
      {
        name: "description",
        content: "Plans, seat counts and renewal dates for every MediMind tenant.",
      },
      { property: "og:title", content: "Subscriptions — MediMind administration" },
      {
        property: "og:description",
        content: "Plans, seat counts and renewal dates for every MediMind tenant.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => (
    <AdminSection
      eyebrow="Subscription"
      title="Plans and billing periods"
      description="What each tenant is entitled to, and until when."
      points={[
        "Choose a plan tier and the number of clinician seats.",
        "Track the start date, renewal date and current status.",
        "Upgrade, downgrade or cancel with the change taking effect on renewal.",
      ]}
    />
  ),
});
