import { useQueryClient, useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { CheckCircle2, Clock, Loader2, ShieldCheck, XCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { SummaryText } from "@/components/summary-text";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { listSummaryVersions, reviewSummaryVersion, type SummaryVersion } from "@/lib/tooth-chart.functions";

export function useSummaryVersions(patientIds: string[]) {
  const load = useServerFn(listSummaryVersions);
  return useQuery({
    queryKey: ["summary-versions", patientIds.join(",")],
    queryFn: () => load({ data: { patientIds } }),
    enabled: patientIds.length > 0,
  });
}

export function StatusChip({ status }: { status: string }) {
  const tone =
    status === "approved"
      ? "border-primary/40 bg-primary/10 text-primary"
      : status === "rejected"
        ? "border-destructive/40 bg-destructive/10 text-destructive"
        : "border-amber-500/40 bg-amber-500/10 text-amber-700";
  const Icon = status === "approved" ? CheckCircle2 : status === "rejected" ? XCircle : Clock;
  const label = status === "approved" ? "Approved" : status === "rejected" ? "Rejected" : "Awaiting review";
  return (
    <span className={`inline-flex items-center gap-1 rounded-lg border px-2 py-1 text-[10px] font-bold ${tone}`}>
      <Icon className="size-3" /> {label}
    </span>
  );
}

function when(value: string | null) {
  return value ? new Date(value).toLocaleString() : "—";
}

/**
 * Clinician review gate and version history. A generated summary only reaches the
 * patient record once it is approved here.
 */
export function SummaryReviewPanel({ patientId, patientName }: { patientId: string; patientName: string }) {
  const versionsQuery = useSummaryVersions([patientId]);
  const review = useServerFn(reviewSummaryVersion);
  const queryClient = useQueryClient();
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState<string | null>(null);

  const versions = versionsQuery.data?.versions ?? [];

  async function decide(version: SummaryVersion, decision: "approved" | "rejected") {
    setBusy(version.id);
    try {
      await review({ data: { id: version.id, decision, note } });
      toast.success(
        decision === "approved"
          ? `Version ${version.version} approved and added to ${patientName}'s record.`
          : `Version ${version.version} rejected.`,
      );
      setNote("");
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["summary-versions"] }),
        queryClient.invalidateQueries({ queryKey: ["chart-overviews"] }),
      ]);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not record that review.");
    } finally {
      setBusy(null);
    }
  }

  if (versionsQuery.isLoading) {
    return (
      <p className="flex items-center gap-2 text-xs text-muted-foreground">
        <Loader2 className="size-3.5 animate-spin" /> Loading review history…
      </p>
    );
  }

  if (versions.length === 0) {
    return (
      <p className="text-xs text-muted-foreground">
        No AI summary has been generated for {patientName} yet. Generate one from the charted findings and it will
        appear here for review.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {versions.map((version) => (
        <article key={version.id} className="rounded-lg border border-border bg-muted/25 p-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-lg border border-border bg-card px-2 py-1 text-[10px] font-bold">
                Version {version.version}
              </span>
              <StatusChip status={version.status} />
              <span className="text-[10px] text-muted-foreground">
                {version.findingCount} findings ·{" "}
                {version.caseSource === "uploaded"
                  ? `${version.caseCount} clinic case records`
                  : `${version.caseCount} reference cases`}
              </span>
            </div>
            <p className="text-[10px] text-muted-foreground">
              Generated {when(version.generatedAt)} by {version.generatedBy || "clinician"}
            </p>
          </div>

          <SummaryText text={version.summary} className="mt-2 max-h-56 overflow-y-auto pr-1" />

          {version.status === "pending" ? (
            <div className="mt-3 space-y-2">
              <Textarea
                value={note}
                onChange={(event) => setNote(event.target.value)}
                placeholder="Review note (optional) — e.g. confirmed doses, adjusted visit order"
                className="min-h-16 text-xs"
              />
              <div className="flex flex-wrap gap-2">
                <Button size="sm" disabled={busy === version.id} onClick={() => decide(version, "approved")}>
                  {busy === version.id ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    <ShieldCheck className="size-3.5" />
                  )}
                  Approve for patient record
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={busy === version.id}
                  onClick={() => decide(version, "rejected")}
                >
                  <XCircle className="size-3.5" /> Reject
                </Button>
              </div>
            </div>
          ) : (
            <p className="mt-2 text-[10px] text-muted-foreground">
              {version.status === "approved" ? "Approved" : "Rejected"} {when(version.reviewedAt)} by{" "}
              {version.reviewedBy || "clinician"}
              {version.reviewNote ? ` — “${version.reviewNote}”` : ""}
            </p>
          )}
        </article>
      ))}
    </div>
  );
}
