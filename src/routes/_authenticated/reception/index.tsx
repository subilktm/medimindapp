import { createFileRoute, Link } from "@tanstack/react-router";
import { CalendarCheck, ClipboardPlus, Receipt, UserPlus } from "lucide-react";

export const Route = createFileRoute("/_authenticated/reception/")({
  head: () => ({
    meta: [
      { title: "Front desk overview — MediMind" },
      {
        name: "description",
        content:
          "Reception workspace for MediMind: book appointments, register patients, raise service bills and log walk-in patients.",
      },
      { property: "og:title", content: "Front desk overview — MediMind" },
      {
        property: "og:description",
        content: "Appointments, registration, service billing and walk-in patients in one place.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ReceptionOverview,
});

const CARDS = [
  {
    to: "/reception/appointment",
    label: "Appointment",
    icon: CalendarCheck,
    blurb: "Book, reschedule and confirm visits.",
  },
  {
    to: "/reception/registration",
    label: "Registration",
    icon: UserPlus,
    blurb: "Enrol new patients and update their details.",
  },
  {
    to: "/reception/service-billing",
    label: "Service Billing",
    icon: Receipt,
    blurb: "Raise bills for consultations and services.",
  },
  {
    to: "/reception/walk-in",
    label: "Walk In Patient",
    icon: ClipboardPlus,
    blurb: "Queue patients arriving without an appointment.",
  },
] as const;

function ReceptionOverview() {
  return (
    <>
      <section className="relative overflow-hidden rounded-2xl bg-clinical p-6 text-primary-foreground shadow-panel">
        <div className="relative z-10">
          <span className="rounded bg-primary-foreground/20 px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase">
            Reception
          </span>
          <h1 className="mt-2 font-display text-2xl font-bold tracking-tight">Front desk</h1>
          <p className="mt-2 max-w-xl text-sm text-primary-foreground/80">
            Everything the front desk handles on a busy morning.
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
