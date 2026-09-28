import { useMemo, useState } from "react";
import {
  Activity,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ClipboardCheck,
  ClipboardList,
  Clock3,
  FileText,
  MapPin,
  Pill,
  Stethoscope,
  UserRound,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import type { ClinicalEncounter, ClinicalPatient } from "@/lib/clinical-patients";

type EncounterFilter = "All" | "Active" | "Completed";

export function PatientEncounters({ patient, focusEncounterId }: { patient: ClinicalPatient; focusEncounterId?: string | undefined }) {
  const initialEncounterId = focusEncounterId ?? patient.encounters[0]?.id ?? "";
  const [selectedId, setSelectedId] = useState(initialEncounterId);
  const [filter, setFilter] = useState<EncounterFilter>("All");
  const visibleEncounters = useMemo(
    () => patient.encounters.filter((encounter) => filter === "All" || (filter === "Active" ? encounter.status === "Active" : encounter.status !== "Active")),
    [filter, patient.encounters],
  );

  const selectEncounter = (encounter: ClinicalEncounter) => {
    setSelectedId((current) => (current === encounter.id ? "" : encounter.id));
  };

  return (
    <section className="space-y-4" aria-labelledby="encounters-title">
      <header className="overflow-hidden rounded-xl border border-primary/20 bg-card/80 shadow-panel">
        <div className="bg-clinical px-4 py-4 text-primary-foreground sm:px-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-card/15"><Stethoscope className="size-5" /></span>
              <div>
                <p className="text-[10px] font-bold uppercase opacity-80">Longitudinal clinical record</p>
                <h2 id="encounters-title" className="mt-0.5 font-display text-xl font-extrabold">Encounters for {patient.name}</h2>
                <p className="mt-1 text-xs opacity-85">Review visit summaries, clinical notes, investigations, treatment and follow-up.</p>
              </div>
            </div>
            <div className="flex gap-2">
              {(["All", "Active", "Completed"] as const).map((item) => (
                <Button
                  key={item}
                  type="button"
                  size="sm"
                  variant={filter === item ? "secondary" : "outline"}
                  className={filter === item ? "border-primary-foreground/20 bg-card/90 text-primary" : "border-primary-foreground/25 bg-card/10 text-primary-foreground hover:bg-card/20 hover:text-primary-foreground"}
                  onClick={() => setFilter(item)}
                >
                  {item}
                </Button>
              ))}
            </div>
          </div>
        </div>
        <div className="grid gap-px bg-border sm:grid-cols-3">
          <EncounterStat icon={ClipboardList} label="Total encounters" value={`${patient.encounters.length}`} />
          <EncounterStat icon={Activity} label="Active now" value={`${patient.encounters.filter((item) => item.status === "Active").length}`} />
          <EncounterStat icon={CheckCircle2} label="Completed" value={`${patient.encounters.filter((item) => item.status !== "Active").length}`} />
        </div>
      </header>

      <div className="space-y-3">
        {visibleEncounters.map((encounter, index) => {
          const isOpen = selectedId === encounter.id;
          return (
            <article key={encounter.id} className={`overflow-hidden rounded-xl border bg-card/80 transition-shadow ${isOpen ? "border-primary/35 shadow-panel" : "border-border"}`}>
              <Button
                type="button"
                variant="ghost"
                onClick={() => selectEncounter(encounter)}
                aria-expanded={isOpen}
                className="h-auto w-full justify-start rounded-none p-0 text-left hover:bg-muted/35"
              >
                <div className="grid w-full gap-3 p-4 md:grid-cols-[auto_minmax(0,1fr)_auto] md:items-center">
                  <div className="flex items-center gap-3">
                    <span className={`flex size-9 shrink-0 items-center justify-center rounded-full border font-display text-xs font-extrabold ${encounter.status === "Active" ? "border-accent/30 bg-accent/10 text-accent" : "border-primary/20 bg-primary/5 text-primary"}`}>
                      {patient.encounters.length - index}
                    </span>
                    <div>
                      <p className="text-[9px] font-bold text-muted-foreground uppercase">{encounter.number}</p>
                      <p className="mt-0.5 text-xs font-bold">{encounter.occurredAt}</p>
                    </div>
                  </div>
                  <div className="min-w-0 md:border-l md:border-border md:pl-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-sm font-bold">{encounter.chiefComplaint}</h3>
                      <EncounterStatus status={encounter.status} />
                    </div>
                    <p className="mt-1 line-clamp-2 text-[11px] font-normal leading-5 text-muted-foreground">{encounter.summary}</p>
                  </div>
                  <div className="flex items-center justify-between gap-3 md:justify-end">
                    <div className="text-right">
                      <p className="text-[10px] font-semibold">{encounter.type}</p>
                      <p className="mt-0.5 text-[9px] font-normal text-muted-foreground">{encounter.department}</p>
                    </div>
                    <ChevronDown className={`size-4 shrink-0 text-primary transition-transform ${isOpen ? "rotate-180" : ""}`} />
                  </div>
                </div>
              </Button>

              {isOpen ? <EncounterDetails encounter={encounter} /> : null}
            </article>
          );
        })}
      </div>
    </section>
  );
}

function EncounterDetails({ encounter }: { encounter: ClinicalEncounter }) {
  return (
    <div className="border-t border-border bg-muted/20 p-4">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <EncounterMeta icon={CalendarDays} label="Date and time" value={encounter.occurredAt} />
        <EncounterMeta icon={MapPin} label="Department" value={encounter.department} />
        <EncounterMeta icon={UserRound} label="Responsible clinician" value={encounter.clinician} />
        <EncounterMeta icon={Clock3} label="Disposition" value={encounter.disposition} />
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-12">
        <section className="rounded-lg border border-border bg-card p-3 xl:col-span-7">
          <h4 className="flex items-center gap-2 font-display text-sm font-extrabold text-primary"><FileText className="size-4" /> Clinical encounter note</h4>
          <div className="mt-3 grid gap-px overflow-hidden rounded-lg bg-border sm:grid-cols-2">
            <NoteBlock label="Subjective" text={encounter.clinicalNote.subjective} />
            <NoteBlock label="Objective" text={encounter.clinicalNote.objective} />
            <NoteBlock label="Assessment" text={encounter.clinicalNote.assessment} />
            <NoteBlock label="Plan" text={encounter.clinicalNote.plan} />
          </div>
        </section>

        <section className="rounded-lg border border-border bg-card p-3 xl:col-span-5">
          <h4 className="flex items-center gap-2 font-display text-sm font-extrabold text-primary"><Activity className="size-4" /> Diagnoses and observations</h4>
          <DetailList label="Diagnoses" items={encounter.diagnoses} />
          <DetailList label="Recorded observations" items={encounter.observations} />
        </section>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <section className="rounded-lg border border-border bg-card p-3">
          <DetailHeading icon={ClipboardCheck} label="Orders and results" />
          <div className="mt-2 divide-y divide-border/60">
            {encounter.orders.map((order) => (
              <div key={order.name} className="flex items-center justify-between gap-2 py-2 text-[11px]">
                <span className="font-semibold">{order.name}</span>
                <span className={`rounded px-1.5 py-0.5 text-[9px] font-bold ${order.status === "Completed" ? "bg-accent/10 text-accent" : "bg-primary/5 text-primary"}`}>{order.status}</span>
              </div>
            ))}
          </div>
        </section>
        <section className="rounded-lg border border-border bg-card p-3">
          <DetailHeading icon={Pill} label="Medication plan" />
          <ul className="mt-2 space-y-2">
            {encounter.medications.map((medication) => <li key={medication} className="flex gap-2 text-[11px] leading-4"><span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />{medication}</li>)}
          </ul>
        </section>
        <section className="rounded-lg border border-border bg-card p-3">
          <DetailHeading icon={CalendarDays} label="Follow-up" />
          <p className="mt-2 text-[11px] font-semibold leading-5">{encounter.followUp}</p>
          <p className="mt-2 text-[10px] leading-4 text-muted-foreground">Disposition: {encounter.disposition}</p>
        </section>
      </div>
    </div>
  );
}

function EncounterStatus({ status }: { status: ClinicalEncounter["status"] }) {
  const style = status === "Active" ? "border-accent/25 bg-accent/10 text-accent" : "border-primary/20 bg-primary/5 text-primary";
  return <span className={`rounded border px-2 py-0.5 text-[9px] font-bold uppercase ${style}`}>{status}</span>;
}

function EncounterStat({ icon: Icon, label, value }: { icon: typeof Activity; label: string; value: string }) {
  return <div className="flex min-h-16 items-center gap-3 bg-card/90 px-4 py-3"><Icon className="size-5 text-primary" /><div><p className="text-[9px] font-bold text-muted-foreground uppercase">{label}</p><p className="mt-0.5 font-display text-base font-extrabold">{value}</p></div></div>;
}

function EncounterMeta({ icon: Icon, label, value }: { icon: typeof CalendarDays; label: string; value: string }) {
  return <div className="flex items-start gap-2.5 rounded-lg border border-border bg-card p-3"><Icon className="mt-0.5 size-4 shrink-0 text-primary" /><div><p className="text-[9px] font-bold text-muted-foreground uppercase">{label}</p><p className="mt-1 text-[11px] font-semibold leading-4">{value}</p></div></div>;
}

function NoteBlock({ label, text }: { label: string; text: string }) {
  return <div className="bg-card p-3"><p className="text-[9px] font-bold text-primary uppercase">{label}</p><p className="mt-1 text-[11px] leading-5 text-muted-foreground">{text}</p></div>;
}

function DetailList({ label, items }: { label: string; items: string[] }) {
  return <div className="mt-3"><p className="text-[9px] font-bold text-muted-foreground uppercase">{label}</p><div className="mt-1.5 flex flex-wrap gap-1.5">{items.map((item) => <span key={item} className="rounded-md border border-border bg-muted/40 px-2 py-1 text-[10px] font-semibold">{item}</span>)}</div></div>;
}

function DetailHeading({ icon: Icon, label }: { icon: typeof CalendarDays; label: string }) {
  return <h4 className="flex items-center gap-2 font-display text-sm font-extrabold text-primary"><Icon className="size-4" /> {label}</h4>;
}