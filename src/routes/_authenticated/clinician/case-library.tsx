import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { BookOpen, Database, Loader2, Trash2, Upload } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CASE_TEMPLATE_JSON, parseCaseFile, type ImportedCase } from "@/lib/pedo-case-import";
import { PEDO_CASE_LIBRARY } from "@/lib/pedo-case-library";
import { deletePedoCase, listPedoCases, setPedoCaseActive, uploadPedoCases } from "@/lib/pedo-cases.functions";

export const Route = createFileRoute("/_authenticated/clinician/case-library")({
  head: () => ({
    meta: [
      { title: "Pediatric case library — MediMind" },
      {
        name: "description",
        content:
          "Upload your own pediatric dental case records so the AI treatment plan is grounded in this clinic's real cases.",
      },
      { property: "og:title", content: "Pediatric case library — MediMind" },
      {
        property: "og:description",
        content: "Train the pediatric dental AI on your own uploaded case records.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CaseLibraryPage,
});

function CaseLibraryPage() {
  const load = useServerFn(listPedoCases);
  const upload = useServerFn(uploadPedoCases);
  const toggle = useServerFn(setPedoCaseActive);
  const remove = useServerFn(deletePedoCase);
  const queryClient = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);

  const [raw, setRaw] = useState("");
  const [sourceName, setSourceName] = useState("");
  const [preview, setPreview] = useState<ImportedCase[]>([]);
  const [busy, setBusy] = useState(false);

  const query = useQuery({ queryKey: ["pedo-cases"], queryFn: () => load() });
  const cases = query.data?.cases ?? [];
  const activeCount = cases.filter((entry) => entry.active).length;

  function parse(text: string, name: string) {
    try {
      const result = parseCaseFile(text);
      if (result.cases.length === 0) {
        toast.error("No cases found in that file. Each case needs at least a title.");
        return;
      }
      setPreview(result.cases);
      setRaw(text);
      if (name) setSourceName(name);
      toast.success(
        `${result.cases.length} case${result.cases.length > 1 ? "s" : ""} ready to add${
          result.skipped > 0 ? ` · ${result.skipped} row(s) skipped` : ""
        }.`,
      );
    } catch {
      toast.error("That file could not be read. Use the JSON or CSV format shown below.");
    }
  }

  async function onFile(file: File) {
    const text = await file.text();
    parse(text, file.name);
  }

  async function save() {
    if (preview.length === 0) return;
    setBusy(true);
    try {
      const result = await upload({ data: { sourceName: sourceName || "Manual upload", cases: preview } });
      toast.success(`${result.added} case records added to the library.`);
      setPreview([]);
      setRaw("");
      await queryClient.invalidateQueries({ queryKey: ["pedo-cases"] });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Those cases could not be saved.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <header className="rounded-xl border border-border glass-strong p-5 shadow-panel">
        <p className="text-[10px] font-bold tracking-[0.2em] text-muted-foreground uppercase">Clinician</p>
        <h1 className="mt-1 font-display text-2xl font-extrabold tracking-tight text-primary">
          Pediatric case library
        </h1>
        <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
          Upload your own pediatric dental case records. When this library holds active cases, every AI treatment plan
          is matched against your cases instead of the built-in reference set.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Chip icon={Database} label={`${activeCount} of ${cases.length} uploaded cases active`} />
          <Chip
            icon={BookOpen}
            label={
              activeCount > 0
                ? "AI is using your uploaded cases"
                : `AI is using the ${PEDO_CASE_LIBRARY.length} built-in reference cases`
            }
          />
        </div>
      </header>

      <section className="rounded-xl border border-border bg-card/70 p-4 shadow-panel">
        <h2 className="font-display text-sm font-bold">Upload case records</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Accepts a JSON file or a CSV table. Columns recognised: title, presentation, management, evidence,
          toothStates, surfaceFindings, toothGroup (primary / permanent / any), minSurfaces, toothNumbers.
        </p>

        <div className="mt-3 grid gap-3 lg:grid-cols-2">
          <div className="space-y-2">
            <Input
              ref={fileRef}
              type="file"
              accept=".json,.csv,.txt"
              className="text-xs"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) void onFile(file);
              }}
            />
            <Input
              value={sourceName}
              onChange={(event) => setSourceName(event.target.value)}
              placeholder="Source name, e.g. Pedo audit 2025"
              className="text-xs"
            />
            <Textarea
              value={raw}
              onChange={(event) => setRaw(event.target.value)}
              placeholder="…or paste case records here"
              className="min-h-32 font-mono text-[11px]"
            />
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="outline" onClick={() => parse(raw, sourceName)} disabled={!raw.trim()}>
                Check format
              </Button>
              <Button size="sm" onClick={save} disabled={preview.length === 0 || busy}>
                {busy ? <Loader2 className="size-3.5 animate-spin" /> : <Upload className="size-3.5" />}
                Add {preview.length > 0 ? preview.length : ""} case{preview.length === 1 ? "" : "s"}
              </Button>
              <Button size="sm" variant="ghost" onClick={() => parse(CASE_TEMPLATE_JSON, "Example")}>
                Load example
              </Button>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-muted/25 p-3">
            <p className="text-[10px] font-bold text-muted-foreground uppercase">Preview</p>
            {preview.length === 0 ? (
              <pre className="mt-2 max-h-56 overflow-auto rounded-md bg-card p-2 text-[10px] leading-relaxed text-muted-foreground">
                {CASE_TEMPLATE_JSON}
              </pre>
            ) : (
              <ul className="mt-2 max-h-56 space-y-2 overflow-y-auto pr-1">
                {preview.map((entry, index) => (
                  <li key={index} className="rounded-md border border-border bg-card p-2">
                    <p className="text-xs font-bold">{entry.title}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {entry.toothGroup} · states {entry.toothStates.join("/") || "any"} · teeth{" "}
                      {entry.toothNumbers.join(", ") || "any"}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-border bg-card/70 p-4 shadow-panel">
        <h2 className="font-display text-sm font-bold">Uploaded cases</h2>
        {query.isLoading ? (
          <p className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
            <Loader2 className="size-3.5 animate-spin" /> Loading…
          </p>
        ) : cases.length === 0 ? (
          <p className="mt-2 text-xs text-muted-foreground">
            No uploaded cases yet. Until you add some, the AI uses the built-in evidence-based reference set.
          </p>
        ) : (
          <div className="mt-3 space-y-2">
            {cases.map((entry) => (
              <article key={entry.id} className="rounded-lg border border-border bg-muted/25 p-3">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-bold">{entry.title}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {entry.toothGroup} dentition · states {entry.toothStates.join("/") || "any"} · surfaces{" "}
                      {entry.surfaceFindings.join("/") || "any"} · teeth {entry.toothNumbers.join(", ") || "any"} ·{" "}
                      {entry.sourceName || "Manual upload"} · added by {entry.createdBy}
                    </p>
                  </div>
                  <div className="flex gap-1.5">
                    <Button
                      size="sm"
                      variant={entry.active ? "outline" : "default"}
                      onClick={async () => {
                        await toggle({ data: { id: entry.id, active: !entry.active } });
                        await queryClient.invalidateQueries({ queryKey: ["pedo-cases"] });
                      }}
                    >
                      {entry.active ? "Active" : "Inactive"}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={async () => {
                        await remove({ data: { id: entry.id } });
                        toast.success("Case removed");
                        await queryClient.invalidateQueries({ queryKey: ["pedo-cases"] });
                      }}
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </div>
                {entry.presentation ? (
                  <p className="mt-2 text-xs text-muted-foreground">{entry.presentation}</p>
                ) : null}
                {entry.management ? <p className="mt-1 text-xs">{entry.management}</p> : null}
                {entry.evidence ? (
                  <p className="mt-1 text-[10px] text-muted-foreground">Source: {entry.evidence}</p>
                ) : null}
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function Chip({ icon: Icon, label }: { icon: typeof Database; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-muted/40 px-2.5 py-1 text-[11px] font-semibold">
      <Icon className="size-3.5 text-primary" /> {label}
    </span>
  );
}
