import { Link } from "@tanstack/react-router";
import {
  CircleAlert,
  CircleCheck,
  ClipboardList,
  Copy,
  FileText,
  Info,
  ListChecks,
  Mic,
  Printer,
  ShieldAlert,
  Sparkles,
  Stethoscope,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import type { ClinicalNote, PossibleDiagnosis, StoredSpeechResponse } from "@/lib/medical-speech";

type NoteListKey =
  | "symptoms"
  | "pastMedicalHistory"
  | "pastSurgicalHistory"
  | "medications"
  | "allergies"
  | "familyHistory"
  | "socialHistory"
  | "reviewOfSystems"
  | "physicalExamination"
  | "assessment"
  | "diagnoses"
  | "investigationPlan"
  | "treatmentPlan"
  | "followUpPlan"
  | "patientInstructions"
  | "uncertainInformation";

const NOTE_LIST_SECTIONS: { key: NoteListKey; label: string }[] = [
  { key: "symptoms", label: "Symptoms" },
  { key: "pastMedicalHistory", label: "Past medical history" },
  { key: "pastSurgicalHistory", label: "Past surgical history" },
  { key: "medications", label: "Current medications" },
  { key: "allergies", label: "Allergies" },
  { key: "familyHistory", label: "Family history" },
  { key: "socialHistory", label: "Social history" },
  { key: "reviewOfSystems", label: "Review of systems" },
  { key: "physicalExamination", label: "Physical examination" },
  { key: "assessment", label: "Assessment" },
  { key: "diagnoses", label: "Diagnoses" },
  { key: "investigationPlan", label: "Investigation plan" },
  { key: "treatmentPlan", label: "Treatment plan" },
  { key: "followUpPlan", label: "Follow-up plan" },
  { key: "patientInstructions", label: "Patient instructions" },
  { key: "uncertainInformation", label: "Uncertain information" },
];

export function MedicalSpeechResponseView({ record, backTo }: { record: StoredSpeechResponse; backTo: string }) {
  const response = record.response;
  const transcription = response.transcription;
  const transcriptionOk = transcription?.isSuccess !== false;
  const note = response.clinicalNote ?? {};
  const support = response.decisionSupport ?? {};
  const diagnoses: PossibleDiagnosis[] = support.possibleDiagnoses?.length
    ? support.possibleDiagnoses
    : (support.differentialDiagnoses ?? []).map((diagnosis) => ({ diagnosis }));
  const investigations = (support.suggestedInvestigations ?? []).map((item) =>
    typeof item === "string" ? { investigation: item } : item,
  );
  const alerts = (support.clinicalAlerts ?? []).map((item) =>
    typeof item === "string" ? { alert: item } : item,
  );
  const questions = support.additionalQuestions ?? [];
  const limitations = support.limitations ?? [];
  const medicationNotes = support.medicationConsiderations ?? [];
  const symptoms = note.symptoms ?? [];

  const receivedAt = new Date(record.savedAt);
  const receivedLabel = Number.isNaN(receivedAt.getTime())
    ? record.savedAt
    : receivedAt.toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" });

  const copyResponse = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(response, null, 2));
      toast.success("Response copied to the clipboard.");
    } catch {
      toast.error("Copying the response was blocked by the browser.");
    }
  };

  return (
    <div className="space-y-4 pb-6">
      <section className="overflow-hidden rounded-xl border border-primary/20 bg-card/80 shadow-panel">
        <div className="bg-clinical px-4 py-4 text-primary-foreground sm:px-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-card/15"><Mic className="size-5" /></span>
              <div>
                <p className="text-[10px] font-bold uppercase opacity-80">AI medical speech response</p>
                <h1 className="mt-0.5 font-display text-xl font-extrabold">Transcription, clinical note and decision support</h1>
                <p className="mt-1 text-xs opacity-85">Received {receivedLabel} · Review before adding anything to the record.</p>
              </div>
            </div>
            <span className={`inline-flex items-center gap-1.5 rounded-lg border border-primary-foreground/25 bg-card/90 px-2.5 py-2 text-[10px] font-bold ${transcriptionOk ? "text-accent" : "text-destructive"}`}>
              {transcriptionOk ? <CircleCheck className="size-3.5" /> : <CircleAlert className="size-3.5" />}
              {transcriptionOk ? "Transcription successful" : "Transcription issue"}
            </span>
          </div>
        </div>
        <div className="grid gap-px bg-border sm:grid-cols-2 xl:grid-cols-4">
          <StatBlock label="Symptoms captured" value={`${symptoms.length}`} />
          <StatBlock label="Possible diagnoses" value={`${diagnoses.length}`} />
          <StatBlock label="Suggested investigations" value={`${investigations.length}`} />
          <StatBlock label="Clinical alerts" value={`${alerts.length}`} danger={alerts.length > 0} />
        </div>
      </section>

      <section className="overflow-hidden rounded-xl border border-border bg-card/80 shadow-panel">
        <header className="flex items-center gap-2 border-b border-border bg-muted/45 px-4 py-3">
          <Stethoscope className="size-4 text-primary" />
          <h2 className="font-display text-sm font-extrabold text-primary">Transcription</h2>
        </header>
        <div className="p-4">
          {transcription?.data ? (
            <p className="text-sm leading-6">{transcription.data}</p>
          ) : (
            <p className="text-xs text-muted-foreground">No transcription text was returned by the service.</p>
          )}
          {!transcriptionOk && transcription?.errorMessage ? (
            <p className="mt-3 rounded-lg border border-destructive/25 bg-destructive/5 p-2 text-[11px] font-semibold text-destructive">{transcription.errorMessage}</p>
          ) : null}
        </div>
      </section>

      <section className="overflow-hidden rounded-xl border border-border bg-card/80 shadow-panel">
        <header className="flex items-center gap-2 border-b border-border bg-muted/45 px-4 py-3">
          <FileText className="size-4 text-primary" />
          <h2 className="font-display text-sm font-extrabold text-primary">Structured clinical note</h2>
        </header>
        <div className="p-4">
          <div className="grid gap-3 lg:grid-cols-2">
            <NoteText label="Chief complaint" value={note.chiefComplaint} />
            <NoteText label="History of present illness" value={note.historyOfPresentIllness} />
          </div>
          <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {NOTE_LIST_SECTIONS.map((section) => (
              <NoteList key={section.key} label={section.label} items={note[section.key]} />
            ))}
          </div>
        </div>
      </section>

      {alerts.length > 0 ? (
        <section className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 shadow-panel">
          <h2 className="flex items-center gap-2 font-display text-sm font-extrabold text-destructive"><ShieldAlert className="size-4" /> Clinical alerts</h2>
          <ul className="mt-3 space-y-2">
            {alerts.map((item, index) => (
              <li key={index} className="rounded-lg border border-destructive/20 bg-card p-3">
                <p className="text-xs font-bold text-destructive">{item.alert}</p>
                {item.reason ? <p className="mt-1 text-[11px] text-muted-foreground">{item.reason}</p> : null}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="overflow-hidden rounded-xl border border-border bg-card/80 shadow-panel">
        <header className="flex items-center gap-2 border-b border-border bg-muted/45 px-4 py-3">
          <Sparkles className="size-4 text-primary" />
          <h2 className="font-display text-sm font-extrabold text-primary">Possible diagnoses (differential)</h2>
        </header>
        <div className="p-4">
          {diagnoses.length > 0 ? (
            <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
              {diagnoses.map((item, index) => (
                <DiagnosisCard key={item.diagnosis ?? index} item={item} index={index} />
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">No differential diagnoses were returned.</p>
          )}
        </div>
      </section>

      <div className="grid gap-4 xl:grid-cols-2">
        <section className="overflow-hidden rounded-xl border border-border bg-card/80 shadow-panel">
          <header className="flex items-center gap-2 border-b border-border bg-muted/45 px-4 py-3">
            <ListChecks className="size-4 text-primary" />
            <h2 className="font-display text-sm font-extrabold text-primary">Suggested investigations</h2>
          </header>
          <div className="p-4">
            {investigations.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[420px] text-left text-xs">
                  <thead>
                    <tr className="border-b border-border text-[10px] font-bold text-muted-foreground uppercase">
                      <th className="pb-2 pr-4">Investigation</th>
                      {investigations.some((item) => item.reason) ? <th className="pb-2">Reason</th> : null}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {investigations.map((item, index) => (
                      <tr key={`${item.investigation ?? index}-${index}`}>
                        <td className="py-3 pr-4 font-semibold">{item.investigation}</td>
                        {investigations.some((entry) => entry.reason) ? (
                          <td className="py-3 text-muted-foreground">{item.reason || "—"}</td>
                        ) : null}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">No investigations were suggested.</p>
            )}
            {medicationNotes.length > 0 ? (
              <div className="mt-4 rounded-lg border border-border bg-muted/35 p-3">
                <p className="text-[10px] font-bold text-primary uppercase">Medication considerations</p>
                <ul className="mt-2 space-y-1.5">
                  {medicationNotes.map((item, index) => (
                    <li key={index} className="flex gap-2 text-[11px] leading-5"><span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />{item}</li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        </section>

        <section className="overflow-hidden rounded-xl border border-border bg-card/80 shadow-panel">
          <header className="flex items-center gap-2 border-b border-border bg-muted/45 px-4 py-3">
            <ClipboardList className="size-4 text-primary" />
            <h2 className="font-display text-sm font-extrabold text-primary">Questions to ask next</h2>
          </header>
          <div className="p-4">
            {questions.length > 0 ? (
              <ol className="space-y-2">
                {questions.map((question, index) => (
                  <li key={index} className="flex gap-2.5 text-xs leading-5">
                    <span className="flex size-5 shrink-0 items-center justify-center rounded-full border border-primary/20 bg-primary/5 font-display text-[10px] font-extrabold text-primary">{index + 1}</span>
                    <span>{question}</span>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="text-xs text-muted-foreground">No follow-up questions were suggested.</p>
            )}
          </div>
        </section>
      </div>

      {limitations.length > 0 ? (
        <section className="rounded-xl border border-border bg-muted/40 p-4">
          <h2 className="flex items-center gap-2 font-display text-sm font-extrabold text-muted-foreground"><Info className="size-4" /> Model limitations</h2>
          <ul className="mt-2 space-y-1.5">
            {limitations.map((item, index) => (
              <li key={index} className="flex gap-2 text-[11px] leading-5 text-muted-foreground"><span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-muted-foreground/60" />{item}</li>
            ))}
          </ul>
        </section>
      ) : null}

      <p className="text-center text-[10px] leading-4 text-muted-foreground">
        Decision support is an aid, not a diagnosis. A clinician must review every suggestion before it is acted on.
      </p>

      <div className="z-10 flex flex-wrap justify-end gap-2 rounded-xl border border-border bg-card/90 p-3 shadow-panel backdrop-blur-xl md:sticky md:bottom-3">
        <Button variant="outline" size="sm" onClick={() => window.print()}><Printer className="size-4" /> Print response</Button>
        <Button variant="outline" size="sm" onClick={copyResponse}><Copy className="size-4" /> Copy response</Button>
        <Button asChild size="sm">
          <Link to={backTo}>Back to patient dashboard</Link>
        </Button>
      </div>
    </div>
  );
}

function DiagnosisCard({ item, index }: { item: PossibleDiagnosis; index: number }) {
  const evidence = item.supportingEvidence ?? [];
  const missing = item.missingInformation ?? [];
  return (
    <article className="rounded-lg border border-border bg-card p-3">
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-display text-sm font-extrabold text-primary">{index + 1}. {item.diagnosis || "Unspecified diagnosis"}</h3>
        <span className="rounded bg-primary/5 px-2 py-1 text-[9px] font-bold uppercase text-primary">Differential</span>
      </div>
      {evidence.length > 0 ? (
        <div className="mt-2">
          <p className="text-[9px] font-bold text-muted-foreground uppercase">Supporting evidence</p>
          <ul className="mt-1 space-y-1">
            {evidence.map((line, lineIndex) => (
              <li key={lineIndex} className="flex gap-1.5 text-[11px] leading-5 text-foreground"><span className="text-accent">•</span>{line}</li>
            ))}
          </ul>
        </div>
      ) : null}
      {missing.length > 0 ? (
        <div className="mt-2">
          <p className="text-[9px] font-bold text-muted-foreground uppercase">Missing information</p>
          <ul className="mt-1 space-y-1">
            {missing.map((line, lineIndex) => (
              <li key={lineIndex} className="flex gap-1.5 text-[11px] leading-5 text-muted-foreground"><span className="text-chart-4">•</span>{line}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </article>
  );
}

function StatBlock({ label, value, danger = false }: { label: string; value: string; danger?: boolean }) {
  return (
    <div className="flex min-h-16 items-center gap-3 bg-card/90 px-4 py-3">
      <div>
        <p className="text-[9px] font-bold text-muted-foreground uppercase">{label}</p>
        <p className={`mt-0.5 font-display text-base font-extrabold ${danger ? "text-destructive" : ""}`}>{value}</p>
      </div>
    </div>
  );
}

function NoteText({ label, value }: { label: string; value: string | undefined }) {
  return (
    <div className="rounded-lg border border-border bg-card p-3">
      <p className="text-[9px] font-bold text-muted-foreground uppercase">{label}</p>
      <p className={`mt-1 text-xs leading-5 ${value ? "font-semibold" : "text-muted-foreground"}`}>{value || "Not documented"}</p>
    </div>
  );
}

function NoteList({ label, items }: { label: string; items: string[] | undefined }) {
  return (
    <div className="rounded-lg border border-border bg-card p-3">
      <p className="text-[9px] font-bold text-muted-foreground uppercase">{label}</p>
      {items && items.length > 0 ? (
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {items.map((item, index) => (
            <span key={`${item}-${index}`} className="rounded-md border border-border bg-muted/40 px-2 py-1 text-[10px] font-semibold">{item}</span>
          ))}
        </div>
      ) : (
        <p className="mt-1 text-[11px] text-muted-foreground">Not documented</p>
      )}
    </div>
  );
}
