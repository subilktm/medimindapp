import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronRight, Search, Users } from "lucide-react";
import { Input } from "@/components/ui/input";
import { CLINICAL_PATIENTS } from "@/lib/clinical-patients";
import { DentalSummaryCell, useChartOverviews } from "@/components/dental-chart-summary";

export const Route = createFileRoute("/_authenticated/clinician/patients/")({
  head: () => ({
    meta: [
      { title: "Patient List — MediMind" },
      {
        name: "description",
        content: "Review assigned inpatients and outpatients, their acuity and pending clinical actions.",
      },
      { property: "og:title", content: "Patient List — MediMind" },
      {
        property: "og:description",
        content: "Assigned patients, acuity and pending clinical actions for clinicians.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PatientList,
});

function PatientList() {
  const overviewQuery = useChartOverviews(CLINICAL_PATIENTS.map((patient) => patient.id));
  const overviews = overviewQuery.data?.overviews ?? [];

  return (
    <section className="space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold tracking-widest text-primary uppercase">Clinician</p>
          <h1 className="mt-1 font-display text-2xl font-extrabold">Patient list</h1>
          <p className="mt-1 text-sm text-muted-foreground">Patients currently assigned to your care.</p>
        </div>
        <label className="relative block w-full sm:w-72">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input className="bg-card/70 pl-9" placeholder="Search patients" aria-label="Search patients" />
        </label>
      </header>

      <div className="overflow-hidden rounded-xl border border-border bg-card/70 shadow-panel">
        <div className="flex items-center gap-3 border-b border-border bg-muted/50 px-5 py-4">
          <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Users className="size-4" />
          </span>
          <div>
            <p className="font-display text-sm font-bold">Active care list</p>
            <p className="text-xs text-muted-foreground">{CLINICAL_PATIENTS.length} patients</p>
          </div>
        </div>
        <div className="divide-y divide-border/70">
          {CLINICAL_PATIENTS.map((patient) => (
            <div
              key={patient.id}
              className="group grid gap-4 px-5 py-4 transition-colors hover:bg-muted/50 sm:grid-cols-[minmax(200px,1.3fr)_1fr_1fr_1.1fr_auto] sm:items-center"
            >
              <Link
                to="/clinician/patients/$patientId"
                params={{ patientId: patient.id }}
                className="flex items-center gap-3 focus-visible:outline-none"
              >
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-secondary font-display text-xs font-extrabold text-primary">
                  {patient.initials}
                </span>
                <div>
                  <p className="font-semibold">{patient.name}</p>
                  <p className="text-xs text-muted-foreground">{patient.mrn} · {patient.sex}, {patient.age}</p>
                </div>
              </Link>
              <div>
                <p className="text-[10px] font-bold tracking-wide text-muted-foreground uppercase">Diagnosis</p>
                <p className="mt-1 text-sm">{patient.diagnosis}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold tracking-wide text-muted-foreground uppercase">Next action</p>
                <p className="mt-1 text-sm">{patient.nextAction}</p>
              </div>
              <DentalSummaryCell
                overview={overviews.find((row) => row.patientId === patient.id)}
                patientName={patient.name}
              />
              <Link
                to="/clinician/patients/$patientId"
                params={{ patientId: patient.id }}
                aria-label={`Open ${patient.name}'s patient dashboard`}
              >
                <ChevronRight className="size-5 text-primary transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
