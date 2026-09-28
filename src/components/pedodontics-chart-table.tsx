import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Smile } from "lucide-react";

import { Button } from "@/components/ui/button";
import { getToothChart } from "@/lib/tooth-chart.functions";

function group(tooth: string) {
  return Number(tooth) >= 51 ? "Primary" : "Permanent";
}

/** Charted pedodontics findings for a patient, shown as a table in the record tabs. */
export function PedodonticsChartTable({ patientId }: { patientId: string }) {
  const load = useServerFn(getToothChart);
  const { data, isPending } = useQuery({
    queryKey: ["tooth-chart", patientId],
    queryFn: () => load({ data: { patientId } }),
  });

  const entries = [...(data?.entries ?? [])].sort((a, b) => a.tooth.localeCompare(b.tooth));

  return (
    <section className="overflow-hidden rounded-xl border border-border bg-card/80 shadow-panel">
      <header className="flex flex-wrap items-center justify-between gap-2 border-b border-border bg-muted/40 px-4 py-3">
        <div className="flex items-center gap-2">
          <Smile className="size-4 text-primary" />
          <h3 className="font-display text-sm font-extrabold text-primary">Pedodontics chart findings</h3>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link to="/clinician/patients/$patientId/pedodontics" params={{ patientId }}>Open full chart</Link>
        </Button>
      </header>

      {isPending ? (
        <p className="flex items-center gap-2 p-4 text-xs text-muted-foreground"><Loader2 className="size-3.5 animate-spin" /> Loading charted findings…</p>
      ) : entries.length === 0 ? (
        <p className="p-4 text-xs text-muted-foreground">No teeth charted yet. Open the full chart to record findings.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-xs">
            <thead className="bg-muted/30 text-[10px] font-bold tracking-wide text-muted-foreground uppercase">
              <tr>
                <th className="px-4 py-2">Tooth (FDI)</th>
                <th className="px-4 py-2">Dentition</th>
                <th className="px-4 py-2">Tooth condition</th>
                <th className="px-4 py-2">Surface findings</th>
                <th className="px-4 py-2">Recorded by</th>
                <th className="px-4 py-2">Updated</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => {
                const surfaces = Object.entries(entry.surfaces);
                return (
                  <tr key={entry.tooth} className="border-t border-border/70">
                    <td className="px-4 py-2 font-display font-extrabold text-primary">{entry.tooth}</td>
                    <td className="px-4 py-2 text-muted-foreground">{group(entry.tooth)}</td>
                    <td className="px-4 py-2 font-semibold">{entry.toothState}</td>
                    <td className="px-4 py-2">
                      {surfaces.length === 0 ? (
                        <span className="text-muted-foreground">—</span>
                      ) : (
                        <span className="flex flex-wrap gap-1">
                          {surfaces.map(([surface, finding]) => (
                            <span key={surface} className="rounded-md border border-border bg-muted/50 px-1.5 py-0.5 text-[10px] font-bold">
                              {surface}: {finding}
                            </span>
                          ))}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-2 text-muted-foreground">{entry.updatedBy || "—"}</td>
                    <td className="px-4 py-2 text-muted-foreground">{entry.updatedAt ? new Date(entry.updatedAt).toLocaleString() : "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
