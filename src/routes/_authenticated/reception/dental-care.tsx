import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { History, Loader2, Smile, Sparkles } from "lucide-react";
import { useState } from "react";

import { useChartOverviews } from "@/components/dental-chart-summary";
import { SummaryText } from "@/components/summary-text";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CLINICAL_PATIENTS } from "@/lib/clinical-patients";
import { getToothChart } from "@/lib/tooth-chart.functions";

export const Route = createFileRoute("/_authenticated/reception/dental-care")({
  head: () => ({
    meta: [
      { title: "Pediatric dental care — MediMind front desk" },
      {
        name: "description",
        content:
          "Front desk view of children's dental charts, approved AI treatment summaries and recent charting activity.",
      },
      { property: "og:title", content: "Pediatric dental care — MediMind front desk" },
      {
        property: "og:description",
        content: "Track pediatric dental charts and approved AI summaries from the front desk.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: FrontDeskDentalPage,
});

const ids = CLINICAL_PATIENTS.map((patient) => patient.id);

function FrontDeskDentalPage() {
  const overviewQuery = useChartOverviews(ids);
  const overviews = overviewQuery.data?.overviews ?? [];
  const [activity, setActivity] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      <header className="rounded-xl border border-border glass-strong p-5 shadow-panel">
        <p className="text-[10px] font-bold tracking-[0.2em] text-muted-foreground uppercase">Front desk</p>
        <h1 className="mt-1 font-display text-2xl font-extrabold tracking-tight text-primary">
          Pediatric dental care
        </h1>
        <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
          Read-only view of each child's dental chart and the treatment summary a dentist has approved, so follow-ups
          can be booked without opening the clinical workspace.
        </p>
      </header>

      <section className="rounded-xl border border-border bg-card/70 p-4 shadow-panel">
        <h2 className="flex items-center gap-2 font-display text-sm font-bold">
          <Smile className="size-4 text-primary" /> Children with dental charts
        </h2>
        {overviewQuery.isLoading ? (
          <p className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
            <Loader2 className="size-3.5 animate-spin" /> Loading…
          </p>
        ) : (
          <div className="mt-3 space-y-2">
            {CLINICAL_PATIENTS.map((patient) => {
              const overview = overviews.find((row) => row.patientId === patient.id);
              return (
                <article key={patient.id} className="rounded-lg border border-border bg-muted/25 p-3">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <img src={patient.photo} alt="" className="size-10 rounded-lg object-cover" />
                      <div>
                        <p className="text-sm font-bold">{patient.name}</p>
                        <p className="text-[10px] text-muted-foreground">
                          MRN {patient.id} · {overview?.findingCount ?? 0} teeth charted ·{" "}
                          {overview?.surfaceCount ?? 0} surfaces · {overview?.cariesCount ?? 0} active caries
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5">
                      {overview?.headline ? (
                        <span className="rounded-lg border border-border bg-card px-2 py-1 text-[10px] font-semibold">
                          {overview.headline}
                        </span>
                      ) : null}
                      {overview?.summary ? (
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button size="sm" variant="outline">
                              <Sparkles className="size-3.5" /> Approved plan
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Approved dental plan — {patient.name}</DialogTitle>
                              <DialogDescription>
                                Approved by {overview.approvedBy || overview.summaryBy || "the dentist"}
                                {overview.approvedAt ? ` · ${new Date(overview.approvedAt).toLocaleString()}` : ""}
                              </DialogDescription>
                            </DialogHeader>
                            <SummaryText text={overview.summary} />
                          </DialogContent>
                        </Dialog>
                      ) : (
                        <span className="rounded-lg border border-border bg-muted/40 px-2 py-1 text-[10px] font-semibold text-muted-foreground">
                          {(overview?.pendingCount ?? 0) > 0 ? "Plan awaiting dentist approval" : "No approved plan yet"}
                        </span>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setActivity(activity === patient.id ? null : patient.id)}
                      >
                        <History className="size-3.5" /> Chart activity
                      </Button>
                    </div>
                  </div>
                  {activity === patient.id ? <ChartActivity patientId={patient.id} /> : null}
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

function ChartActivity({ patientId }: { patientId: string }) {
  const load = useServerFn(getToothChart);
  const query = useQuery({
    queryKey: ["tooth-chart", patientId],
    queryFn: () => load({ data: { patientId } }),
  });
  const audit = (query.data?.audit ?? []).slice(0, 8);

  if (query.isLoading) {
    return (
      <p className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
        <Loader2 className="size-3.5 animate-spin" /> Loading activity…
      </p>
    );
  }

  if (audit.length === 0) {
    return <p className="mt-2 text-xs text-muted-foreground">No charting activity recorded yet.</p>;
  }

  return (
    <ul className="mt-2 space-y-1 rounded-lg border border-border bg-card p-3">
      {audit.map((row) => (
        <li key={row.id} className="text-[11px] text-muted-foreground">
          <span className="font-bold text-primary">
            Tooth {row.tooth}
            {row.surface ? ` · ${row.surface}` : ""}
          </span>{" "}
          {row.action} — {row.changedBy || "Unknown"} · {new Date(row.changedAt).toLocaleString()}
        </li>
      ))}
    </ul>
  );
}
