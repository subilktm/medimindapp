import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowUp, ChevronRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CLINICAL_PATIENTS } from "@/lib/clinical-patients";

export const Route = createFileRoute("/_authenticated/clinician/")({
  head: () => ({
    meta: [
      { title: "Clinician overview — MediMind" },
      {
        name: "description",
        content:
          "Clinician workspace for MediMind: review your patient list, work through tasks and messages, and open clinical reports.",
      },
      { property: "og:title", content: "Clinician overview — MediMind" },
      {
        property: "og:description",
        content: "Patient list, tasks and messages, and clinical reports in one calm workspace.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ClinicianOverview,
});

const QUEUE = [
  {
    flag: "ASAP",
    accent: "border-l-destructive",
    flagTone: "text-destructive",
    title: "Approve blood O2 script",
    meta: "Liam O'Brien (Room 402)",
    age: "10m ago",
    faded: false,
  },
  {
    flag: "Pending",
    accent: "border-l-accent",
    flagTone: "text-accent",
    title: "Review MRI lumbar spine",
    meta: "Clara Hughes",
    age: "45m ago",
    faded: false,
  },
  {
    flag: "Scheduled",
    accent: "border-l-accent",
    flagTone: "text-accent",
    title: "Medication refill signature",
    meta: "Pharmacy #492",
    age: "2h ago",
    faded: true,
  },
] as const;

const TILES = [
  { label: "Total patients", value: "142", note: "12%", up: true },
  { label: "Avg. visit time", value: "24m", note: "4%", up: false },
  { label: "New consults", value: "18", note: "Normal", up: null },
  { label: "Pending labs", value: "31", note: "3 urgent", up: null },
] as const;

function ClinicianOverview() {
  const navigate = useNavigate({ from: "/clinician/" });

  function openPatient(patientId: string) {
    navigate({ to: "/clinician/patients/$patientId", params: { patientId } });
  }

  return (
    <>
      <section className="relative overflow-hidden rounded-2xl bg-clinical p-6 text-primary-foreground shadow-panel">
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="mb-1 flex items-center gap-2">
              <span className="flex items-center gap-1 rounded bg-primary-foreground/20 px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase">
                <Sparkles className="size-3" />
                AI insight
              </span>
              <h1 className="font-display text-lg font-bold">Clinic status summary</h1>
            </div>
            <p className="max-w-xl text-sm text-primary-foreground/80">
              4 patients are ready for discharge. Laboratory results for Sarah Chen show elevated
              leukocytes.
            </p>
          </div>
          <Button
            variant="outline"
            className="border-primary-foreground/25 bg-primary-foreground/10 font-semibold text-primary-foreground hover:bg-primary-foreground/20"
          >
            View detailed analysis
          </Button>
        </div>
        <span className="pointer-events-none absolute -top-8 -right-8 size-48 rounded-full bg-primary-foreground/10 blur-3xl" />
      </section>

      <div className="grid gap-8 xl:grid-cols-3">
        <section className="space-y-4 xl:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-bold">Current active wards</h2>
            <Link
              to="/clinician/patients"
              className="text-sm font-semibold text-accent hover:text-primary"
            >
              Manage all
            </Link>
          </div>
          <div className="overflow-hidden rounded-2xl border border-border bg-card/60">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-border/60 bg-card/40 text-[11px] font-bold tracking-wider text-muted-foreground uppercase">
                    <th className="px-6 py-3">Patient</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3">Diagnosis</th>
                    <th className="px-6 py-3">Next action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {CLINICAL_PATIENTS.map((patient) => (
                    <tr
                      key={patient.id}
                      role="link"
                      tabIndex={0}
                      aria-label={`Open ${patient.name}'s patient dashboard`}
                      onClick={() => openPatient(patient.id)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") openPatient(patient.id);
                      }}
                      className="group cursor-pointer transition-colors hover:bg-card focus-visible:bg-card focus-visible:outline-none"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <span className="flex size-9 items-center justify-center rounded-full bg-secondary font-display text-xs font-bold text-primary">
                            {patient.initials}
                          </span>
                          <div>
                            <div className="font-semibold">{patient.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {patient.sex[0]}, {patient.age} · ID #{patient.id}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="rounded bg-primary/10 px-2 py-1 text-[10px] font-bold text-primary uppercase">
                          {patient.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">{patient.diagnosis}</td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        <span className="flex items-center justify-between gap-2">
                          {patient.nextAction}
                          <ChevronRight className="size-4 text-primary opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100" />
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="font-display text-lg font-bold">Urgent queue</h2>
          <div className="space-y-3">
            {QUEUE.map((task) => (
              <div
                key={task.title}
                className={`rounded-xl border border-l-4 border-border bg-card/80 p-4 ${task.accent} ${
                  task.faded ? "opacity-60" : ""
                }`}
              >
                <div className="flex items-start justify-between">
                  <p className={`text-xs font-bold uppercase ${task.flagTone}`}>{task.flag}</p>
                  <span className="text-[10px] text-muted-foreground">{task.age}</span>
                </div>
                <p className="mt-1 text-sm font-semibold">{task.title}</p>
                <p className="text-[11px] text-muted-foreground">{task.meta}</p>
              </div>
            ))}
          </div>
          <Link
            to="/clinician/tasks"
            className="inline-block text-sm font-semibold text-accent hover:text-primary"
          >
            Open tasks & messages
          </Link>
        </section>
      </div>

      <section className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {TILES.map((tile) => (
          <div key={tile.label} className="rounded-2xl border border-border bg-card p-5">
            <p className="mb-1 text-xs font-bold tracking-wide text-muted-foreground uppercase">
              {tile.label}
            </p>
            <div className="flex items-end justify-between">
              <span className="font-display text-3xl font-extrabold">{tile.value}</span>
              <span
                className={`flex items-center gap-1 text-xs font-bold ${
                  tile.up === null
                    ? "text-muted-foreground"
                    : tile.up
                      ? "text-accent"
                      : "text-destructive"
                }`}
              >
                {tile.up !== null && (
                  <ArrowUp className={`size-3 ${tile.up ? "" : "rotate-180"}`} />
                )}
                {tile.note}
              </span>
            </div>
          </div>
        ))}
      </section>
    </>
  );
}
