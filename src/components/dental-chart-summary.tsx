import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { History, Loader2, Smile, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { SummaryReviewPanel } from "@/components/summary-review";
import { SummaryText } from "@/components/summary-text";
import { type ChartOverview, getChartOverviews, getToothChart } from "@/lib/tooth-chart.functions";

export { SummaryText };

export function useChartOverviews(patientIds: string[]) {
  const load = useServerFn(getChartOverviews);
  return useQuery({
    queryKey: ["chart-overviews", patientIds.join(",")],
    queryFn: () => load({ data: { patientIds } }),
    enabled: patientIds.length > 0,
  });
}

function relative(value: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleString();
}

/** Compact cell for a patient list row: charted findings plus the AI summary in a dialog. */
export function DentalSummaryCell({ overview, patientName }: { overview?: ChartOverview | undefined; patientName: string }) {
  const hasFindings = (overview?.findingCount ?? 0) > 0;

  return (
    <div>
      <p className="text-[10px] font-bold tracking-wide text-muted-foreground uppercase">Dental chart &amp; AI</p>
      {!hasFindings && !overview?.summary ? (
        <p className="mt-1 text-sm text-muted-foreground">No dental findings charted</p>
      ) : (
        <div className="mt-1 flex flex-wrap items-center gap-1.5">
          <span className="inline-flex items-center gap-1 rounded-lg border border-border bg-muted/50 px-2 py-1 text-[10px] font-bold">
            <Smile className="size-3" /> {overview?.findingCount ?? 0} teeth · {overview?.surfaceCount ?? 0} surfaces
          </span>
          {overview?.summary ? (
            <Dialog>
              <DialogTrigger asChild>
                <button
                  type="button"
                  className="inline-flex items-center gap-1 rounded-lg border border-primary/40 bg-primary/10 px-2 py-1 text-[10px] font-bold text-primary transition-colors hover:bg-primary/20"
                >
                  <Sparkles className="size-3" /> AI summary approved
                </button>
              </DialogTrigger>
              <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
                <DialogHeader>
                  <DialogTitle>AI dental treatment summary — {patientName}</DialogTitle>
                  <DialogDescription>
                    {overview.headline || "Charted findings"} · generated {relative(overview.summaryAt)} by{" "}
                    {overview.summaryBy || "clinician"}
                  </DialogDescription>
                </DialogHeader>
                <SummaryText text={overview.summary} />
              </DialogContent>
            </Dialog>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-lg border border-border bg-muted/40 px-2 py-1 text-[10px] font-semibold text-muted-foreground">
              No approved AI summary
            </span>
          )}
          {(overview?.pendingCount ?? 0) > 0 ? (
            <span className="inline-flex items-center gap-1 rounded-lg border border-amber-500/40 bg-amber-500/10 px-2 py-1 text-[10px] font-bold text-amber-700">
              {overview?.pendingCount} awaiting review
            </span>
          ) : null}
        </div>
      )}
    </div>
  );
}

/** Full card for the patient dashboard: odontogram findings, AI summary and recent audit trail. */
export function DentalChartSummaryCard({
  patientId,
  patientName,
  className = "",
}: {
  patientId: string;
  patientName: string;
  className?: string;
}) {
  const overviewQuery = useChartOverviews([patientId]);
  const loadChart = useServerFn(getToothChart);
  const chartQuery = useQuery({
    queryKey: ["tooth-chart", patientId],
    queryFn: () => loadChart({ data: { patientId } }),
  });

  const overview = overviewQuery.data?.overviews[0];
  const audit = (chartQuery.data?.audit ?? []).slice(0, 5);

  return (
    <section className={`rounded-xl border border-border bg-card/70 p-4 shadow-panel ${className}`}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Smile className="size-4" />
          </span>
          <div>
            <h3 className="font-display text-sm font-bold">Pedodontics chart &amp; AI summary</h3>
            <p className="text-xs text-muted-foreground">
              {overview?.headline || "Odontogram findings, AI treatment plan and change history"}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button size="sm" variant={(overview?.pendingCount ?? 0) > 0 ? "default" : "outline"}>
                {(overview?.pendingCount ?? 0) > 0
                  ? `Review ${overview?.pendingCount} AI draft${(overview?.pendingCount ?? 0) > 1 ? "s" : ""}`
                  : "Review history"}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-3xl">
              <DialogHeader>
                <DialogTitle>AI summary review — {patientName}</DialogTitle>
                <DialogDescription>
                  Approve a draft before it appears in the patient record. Every version is kept here.
                </DialogDescription>
              </DialogHeader>
              <SummaryReviewPanel patientId={patientId} patientName={patientName} />
            </DialogContent>
          </Dialog>
          <Button asChild size="sm" variant="outline">
            <Link to="/clinician/patients/$patientId/pedodontics" params={{ patientId }}>
              Open dental chart
            </Link>
          </Button>
        </div>
      </div>

      <div className="mt-3 grid gap-2 sm:grid-cols-3">
        <Stat label="Teeth with findings" value={`${overview?.findingCount ?? 0}`} />
        <Stat label="Surfaces marked" value={`${overview?.surfaceCount ?? 0}`} />
        <Stat label="Active caries" value={`${overview?.cariesCount ?? 0}`} />
      </div>

      <div className="mt-3 grid gap-3 lg:grid-cols-2">
        <div className="rounded-lg border border-border bg-muted/25 p-3">
          <p className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground uppercase">
            <Sparkles className="size-3" /> AI treatment summary
          </p>
          {overviewQuery.isLoading ? (
            <p className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
              <Loader2 className="size-3.5 animate-spin" /> Loading…
            </p>
          ) : overview?.summary ? (
            <>
              <SummaryText text={overview.summary} className="mt-2 max-h-40 overflow-y-auto pr-1" />
              <p className="mt-2 text-[10px] text-muted-foreground">
                Version {overview.version ?? 1} · generated {relative(overview.summaryAt)} by{" "}
                {overview.summaryBy || "clinician"}
                {overview.approvedBy ? ` · approved by ${overview.approvedBy} ${relative(overview.approvedAt)}` : ""}
              </p>
            </>
          ) : (
            <p className="mt-2 text-xs text-muted-foreground">
              No AI summary yet. Open the dental chart for {patientName} and generate one from the charted findings.
            </p>
          )}
        </div>

        <div className="rounded-lg border border-border bg-muted/25 p-3">
          <p className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground uppercase">
            <History className="size-3" /> Recent chart changes
          </p>
          {chartQuery.isLoading ? (
            <p className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
              <Loader2 className="size-3.5 animate-spin" /> Loading…
            </p>
          ) : audit.length === 0 ? (
            <p className="mt-2 text-xs text-muted-foreground">No charted changes recorded yet.</p>
          ) : (
            <ul className="mt-2 space-y-1.5">
              {audit.map((row) => (
                <li key={row.id} className="text-[11px] text-muted-foreground">
                  <span className="font-bold text-primary">
                    Tooth {row.tooth}
                    {row.surface ? ` · ${row.surface}` : ""}
                  </span>{" "}
                  {row.action} — {row.changedBy || "Unknown"} · {relative(row.changedAt)}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-muted/30 px-3 py-2">
      <p className="text-[10px] font-bold text-muted-foreground uppercase">{label}</p>
      <p className="mt-0.5 font-display text-lg font-extrabold text-primary">{value}</p>
    </div>
  );
}
