import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { Activity, FileText, Loader2, Smile, Sparkles } from "lucide-react";
import { useState } from "react";

import { useChartOverviews } from "@/components/dental-chart-summary";
import { StatusChip, useSummaryVersions } from "@/components/summary-review";
import { SummaryText } from "@/components/summary-text";
import { Button } from "@/components/ui/button";
import { CLINICAL_PATIENTS } from "@/lib/clinical-patients";

export const Route = createFileRoute("/_authenticated/clinician/reports")({
  head: () => ({
    meta: [
      { title: "Reports — MediMind" },
      {
        name: "description",
        content:
          "Clinic-wide pediatric dental case review: AI treatment summaries, approval status and charting statistics.",
      },
      { property: "og:title", content: "Reports — MediMind" },
      {
        property: "og:description",
        content: "Pediatric dental case reviews, AI summaries and clinic statistics for clinicians.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ReportsPage,
});

const ids = CLINICAL_PATIENTS.map((patient) => patient.id);

function ReportsPage() {
  const overviewQuery = useChartOverviews(ids);
  const versionQuery = useSummaryVersions(ids);
  const [openPatient, setOpenPatient] = useState<string | null>(null);

  const overviews = overviewQuery.data?.overviews ?? [];
  const versions = versionQuery.data?.versions ?? [];

  const charted = overviews.filter((row) => row.findingCount > 0).length;
  const approved = versions.filter((row) => row.status === "approved").length;
  const pending = versions.filter((row) => row.status === "pending").length;
  const caries = overviews.reduce((total, row) => total + row.cariesCount, 0);
  const surfaces = overviews.reduce((total, row) => total + row.surfaceCount, 0);
  const fromClinicCases = versions.filter((row) => row.caseSource === "uploaded").length;

  return (
    <div className="space-y-4">
      <header className="rounded-xl border border-border glass-strong p-5 shadow-panel">
        <p className="text-[10px] font-bold tracking-[0.2em] text-muted-foreground uppercase">Clinician</p>
        <h1 className="mt-1 font-display text-2xl font-extrabold tracking-tight text-primary">Reports</h1>
        <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
          Pediatric dental case review across the clinic: charted odontogram findings, AI treatment summaries and their
          approval status.
        </p>
      </header>

      <section className="grid gap-2 sm:grid-cols-3 xl:grid-cols-6">
        <Stat label="Children charted" value={`${charted}`} />
        <Stat label="Surfaces marked" value={`${surfaces}`} />
        <Stat label="Active caries teeth" value={`${caries}`} />
        <Stat label="Approved summaries" value={`${approved}`} />
        <Stat label="Awaiting review" value={`${pending}`} />
        <Stat label="From clinic cases" value={`${fromClinicCases}`} />
      </section>

      <section className="rounded-xl border border-border bg-card/70 p-4 shadow-panel">
        <h2 className="flex items-center gap-2 font-display text-sm font-bold">
          <Smile className="size-4 text-primary" /> Pediatric case review
        </h2>
        {overviewQuery.isLoading || versionQuery.isLoading ? (
          <p className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
            <Loader2 className="size-3.5 animate-spin" /> Loading clinic data…
          </p>
        ) : (
          <div className="mt-3 space-y-2">
            {CLINICAL_PATIENTS.map((patient) => {
              const overview = overviews.find((row) => row.patientId === patient.id);
              const patientVersions = versions.filter((row) => row.patientId === patient.id);
              const latest = patientVersions[0];
              const open = openPatient === patient.id;

              return (
                <article key={patient.id} className="rounded-lg border border-border bg-muted/25 p-3">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <img src={patient.photo} alt="" className="size-10 rounded-lg object-cover" />
                      <div>
                        <p className="text-sm font-bold">{patient.name}</p>
                        <p className="text-[10px] text-muted-foreground">
                          MRN {patient.id} · {overview?.findingCount ?? 0} teeth · {overview?.surfaceCount ?? 0} surfaces
                          · {overview?.cariesCount ?? 0} caries
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5">
                      {latest ? <StatusChip status={latest.status} /> : null}
                      {overview?.headline ? (
                        <span className="rounded-lg border border-border bg-card px-2 py-1 text-[10px] font-semibold">
                          {overview.headline}
                        </span>
                      ) : null}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setOpenPatient(open ? null : patient.id)}
                        disabled={!overview?.summary && patientVersions.length === 0}
                      >
                        {open ? "Hide" : "View summary"}
                      </Button>
                      <Button asChild size="sm" variant="ghost">
                        <Link to="/clinician/patients/$patientId/pedodontics" params={{ patientId: patient.id }}>
                          Chart
                        </Link>
                      </Button>
                    </div>
                  </div>

                  {open ? (
                    <div className="mt-3 rounded-lg border border-border bg-card p-3">
                      <p className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground uppercase">
                        <Sparkles className="size-3" /> Approved summary
                      </p>
                      {overview?.summary ? (
                        <>
                          <SummaryText text={overview.summary} className="mt-2" />
                          <p className="mt-2 text-[10px] text-muted-foreground">
                            Version {overview.version ?? 1}
                            {overview.approvedBy ? ` · approved by ${overview.approvedBy}` : ""}
                          </p>
                        </>
                      ) : (
                        <p className="mt-2 text-xs text-muted-foreground">
                          No approved summary yet
                          {latest ? ` — version ${latest.version} is ${latest.status}.` : "."}
                        </p>
                      )}
                      <p className="mt-3 text-[10px] font-bold text-muted-foreground uppercase">Version history</p>
                      <ul className="mt-1 space-y-1">
                        {patientVersions.map((version) => (
                          <li key={version.id} className="text-[11px] text-muted-foreground">
                            <span className="font-bold text-primary">v{version.version}</span> · {version.status} ·{" "}
                            {version.findingCount} findings ·{" "}
                            {version.caseSource === "uploaded" ? "clinic cases" : "reference cases"} ·{" "}
                            {new Date(version.generatedAt).toLocaleString()}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                </article>
              );
            })}
          </div>
        )}
      </section>

      <section className="rounded-xl border border-border bg-card/70 p-4 shadow-panel">
        <h2 className="flex items-center gap-2 font-display text-sm font-bold">
          <FileText className="size-4 text-primary" /> Other documentation
        </h2>
        <ul className="mt-2 space-y-1.5 text-xs text-muted-foreground">
          <li className="flex items-start gap-2">
            <Activity className="mt-0.5 size-3.5 text-primary" /> Laboratory panels with trend view and abnormal
            highlighting
          </li>
          <li className="flex items-start gap-2">
            <Activity className="mt-0.5 size-3.5 text-primary" /> Imaging studies with radiology reports and prior
            comparisons
          </li>
          <li className="flex items-start gap-2">
            <Activity className="mt-0.5 size-3.5 text-primary" /> Discharge summaries and referral letters ready for
            sign-off
          </li>
        </ul>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-card/70 px-3 py-2.5 shadow-panel">
      <p className="text-[10px] font-bold text-muted-foreground uppercase">{label}</p>
      <p className="mt-0.5 font-display text-xl font-extrabold text-primary">{value}</p>
    </div>
  );
}
