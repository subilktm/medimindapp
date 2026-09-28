import { type FormEvent, useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  ClipboardList,
  History,
  HomeIcon,
  Plus,
  Scissors,
  Stethoscope,
  Syringe,
  UsersRound,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { ClinicalHistory, ClinicalPatient } from "@/lib/clinical-patients";

type MedicalEntry = ClinicalHistory["pastMedical"][number];
type TimelineKind = "Condition" | "Procedure" | "Encounter" | "Diagnosis";
type TimelineEvent = { id: string; kind: TimelineKind; date: string; title: string; detail: string; sortKey: number };

const FILTERS: Array<"All" | TimelineKind> = ["All", "Condition", "Diagnosis", "Procedure", "Encounter"];
const FILTER_LABELS: Record<"All" | TimelineKind, string> = { All: "All events", Condition: "Conditions", Diagnosis: "Diagnoses", Procedure: "Procedures", Encounter: "Encounters" };

function toSortKey(value: string) {
  const datePart = value.split(",")[0]?.trim() ?? value;
  const parsed = Date.parse(datePart);
  if (!Number.isNaN(parsed)) return parsed;
  const year = datePart.match(/\d{4}/)?.[0];
  return year ? Date.parse(`01 Jan ${year}`) : 0;
}

function buildTimeline(patient: ClinicalPatient, pastMedical: MedicalEntry[]): TimelineEvent[] {
  const events: TimelineEvent[] = [
    ...pastMedical.map((item, index) => ({ id: `pmh-${index}`, kind: "Condition" as const, date: item.since, title: item.condition, detail: `${item.status} · ${item.notes}`, sortKey: toSortKey(item.since) })),
    ...patient.history.surgical.map((item, index) => ({ id: `sx-${index}`, kind: "Procedure" as const, date: item.date, title: item.procedure, detail: `${item.facility} · ${item.notes}`, sortKey: toSortKey(item.date) })),
    ...patient.encounters.map((item) => ({ id: item.id, kind: "Encounter" as const, date: item.occurredAt, title: `${item.type} · ${item.department}`, detail: `${item.chiefComplaint} — ${item.clinician}`, sortKey: toSortKey(item.occurredAt) })),
    ...patient.diagnoses.map((item, index) => ({ id: `dx-${index}`, kind: "Diagnosis" as const, date: item.onset, title: `${item.condition} (${item.code})`, detail: `${item.status} · recorded by ${item.clinician}`, sortKey: toSortKey(item.onset) })),
  ];
  return events.sort((a, b) => b.sortKey - a.sortKey);
}

export function PatientClinicalHistory({ patient }: { patient: ClinicalPatient }) {
  const { history } = patient;
  const [pastMedical, setPastMedical] = useState<MedicalEntry[]>(history.pastMedical);
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");
  const [open, setOpen] = useState(false);
  const [condition, setCondition] = useState("");
  const [since, setSince] = useState("");
  const [status, setStatus] = useState<MedicalEntry["status"]>("Ongoing");
  const [notes, setNotes] = useState("");

  const timeline = useMemo(() => buildTimeline(patient, pastMedical), [patient, pastMedical]);
  const visibleTimeline = filter === "All" ? timeline : timeline.filter((event) => event.kind === filter);
  const chronicCount = pastMedical.filter((item) => item.status !== "Resolved").length;
  const familyFlags = history.family.filter((item) => item.significant).length;
  const dueVaccines = history.immunizations.filter((item) => item.status === "Due").length;
  const knownAllergies = history.allergyDetails.filter((item) => item.severity !== "None");

  const addEntry = (event: FormEvent) => {
    event.preventDefault();
    if (!condition.trim()) {
      toast.error("Enter the condition name.");
      return;
    }
    const sinceLabel = since
      ? new Date(since).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
      : "Date not recorded";
    setPastMedical((current) => [{ condition: condition.trim(), since: sinceLabel, status, notes: notes.trim() || "No additional notes." }, ...current]);
    setCondition("");
    setSince("");
    setStatus("Ongoing");
    setNotes("");
    setOpen(false);
    toast.success("Added to past medical history.");
  };

  return (
    <section className="space-y-4" aria-label={`${patient.name} clinical history`}>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-extrabold text-primary">Clinical history for {patient.name}</h2>
          <p className="text-xs text-muted-foreground">Past medical, surgical, family and social history with allergies, immunizations and screening.</p>
        </div>
        <Button size="sm" onClick={() => setOpen(true)}><Plus className="size-4" /> Add history entry</Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat icon={ClipboardList} label="Ongoing conditions" value={`${chronicCount} of ${pastMedical.length} recorded`} />
        <Stat icon={Scissors} label="Past procedures" value={`${history.surgical.length} recorded`} />
        <Stat icon={UsersRound} label="Family risk factors" value={`${familyFlags} significant`} alert={familyFlags > 0} />
        <Stat icon={Syringe} label="Immunizations" value={dueVaccines ? `${dueVaccines} due` : "All up to date"} alert={dueVaccines > 0} />
      </div>

      <div className="grid gap-4 xl:grid-cols-12">
        <div className="space-y-4 xl:col-span-8">
          <Panel title="Past medical history" icon={ClipboardList} action="Add condition" onAction={() => setOpen(true)}>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[11px]">
                <thead>
                  <tr className="text-[10px] text-muted-foreground">
                    <th className="pb-2 font-bold">Condition</th>
                    <th className="pb-2 font-bold">Since</th>
                    <th className="pb-2 font-bold">Status</th>
                    <th className="pb-2 font-bold">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {pastMedical.map((item) => (
                    <tr key={`${item.condition}-${item.since}`}>
                      <td className="py-2 pr-3 font-semibold">{item.condition}</td>
                      <td className="py-2 pr-3 whitespace-nowrap text-muted-foreground">{item.since}</td>
                      <td className="py-2 pr-3"><HistoryStatus status={item.status} /></td>
                      <td className="py-2 text-muted-foreground">{item.notes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>

          <Panel title="Surgical & procedural history" icon={Scissors}>
            <div className="grid gap-3 sm:grid-cols-2">
              {history.surgical.map((item) => (
                <article key={`${item.procedure}-${item.date}`} className="rounded-lg border border-border bg-muted/30 p-3">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-xs font-extrabold text-foreground">{item.procedure}</h3>
                    <span className="shrink-0 rounded bg-primary/10 px-2 py-1 text-[9px] font-bold text-primary">{item.date}</span>
                  </div>
                  <p className="mt-1 text-[10px] font-semibold text-muted-foreground">{item.facility}</p>
                  <p className="mt-2 text-[11px] leading-5 text-muted-foreground">{item.notes}</p>
                </article>
              ))}
            </div>
          </Panel>

          <Panel title="Clinical history timeline" icon={History}>
            <div className="mb-3 flex flex-wrap gap-1.5" role="group" aria-label="Filter timeline">
              {FILTERS.map((item) => (
                <Button
                  key={item}
                  type="button"
                  size="sm"
                  variant={filter === item ? "default" : "outline"}
                  className="h-7 px-3 text-[10px]"
                  onClick={() => setFilter(item)}
                >{FILTER_LABELS[item]}</Button>
              ))}
            </div>
            <ol className="relative space-y-3 border-l-2 border-border pl-4">
              {visibleTimeline.map((event) => (
                <li key={event.id} className="relative">
                  <span className={`absolute top-1 -left-[23px] size-3 rounded-full border-2 border-card ${KIND_DOT[event.kind]}`} aria-hidden />
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-[10px] font-bold text-muted-foreground">{event.date}</p>
                    <span className={`rounded px-1.5 py-0.5 text-[9px] font-bold uppercase ${KIND_CHIP[event.kind]}`}>{event.kind}</span>
                  </div>
                  <p className="mt-0.5 text-xs font-extrabold">{event.title}</p>
                  <p className="text-[11px] leading-5 text-muted-foreground">{event.detail}</p>
                </li>
              ))}
              {visibleTimeline.length === 0 && <li className="text-xs text-muted-foreground">No events of this type.</li>}
            </ol>
          </Panel>
        </div>

        <div className="space-y-4 xl:col-span-4">
          <Panel title="Allergies & adverse reactions" icon={AlertTriangle}>
            <div className="space-y-2">
              {history.allergyDetails.map((item) => (
                <div key={item.allergen} className={`rounded-lg border p-3 ${item.severity === "None" ? "border-border bg-muted/30" : "border-destructive/25 bg-destructive/5"}`}>
                  <div className="flex items-start justify-between gap-2">
                    <p className={`text-xs font-extrabold ${item.severity === "None" ? "text-foreground" : "text-destructive"}`}>{item.allergen}</p>
                    {item.severity !== "None" && <span className="rounded bg-destructive/10 px-2 py-0.5 text-[9px] font-bold text-destructive uppercase">{item.severity}</span>}
                  </div>
                  <p className="mt-1 text-[11px] text-muted-foreground">{item.reaction}</p>
                  <p className="mt-1 text-[10px] text-muted-foreground">Recorded {item.recorded}</p>
                </div>
              ))}
              {knownAllergies.length > 0 && <p className="text-[10px] text-muted-foreground">Check every new prescription against these reactions.</p>}
            </div>
          </Panel>

          <Panel title="Family history" icon={UsersRound}>
            {history.family.map((item) => (
              <div key={`${item.relation}-${item.condition}`} className="flex items-center justify-between gap-3 border-b border-border/70 py-2 last:border-0">
                <div>
                  <p className="text-xs font-semibold">{item.condition}</p>
                  <p className="text-[10px] text-muted-foreground">{item.relation} · {item.onset}</p>
                </div>
                {item.significant && <span className="rounded bg-chart-4/10 px-2 py-1 text-[9px] font-bold text-chart-4">Risk factor</span>}
              </div>
            ))}
          </Panel>

          <Panel title="Social history" icon={HomeIcon}>
            {history.social.map((item) => (
              <div key={item.label} className="flex items-start justify-between gap-3 border-b border-border/70 py-2 text-[11px] last:border-0">
                <span className="shrink-0 text-muted-foreground">{item.label}</span>
                <span className={`text-right font-semibold ${item.flag ? "text-chart-4" : ""}`}>{item.value}</span>
              </div>
            ))}
          </Panel>

          <Panel title="Immunizations" icon={Syringe}>
            {history.immunizations.map((item) => (
              <div key={item.vaccine} className="flex items-center justify-between gap-3 border-b border-border/70 py-2 last:border-0">
                <div>
                  <p className="text-xs font-semibold">{item.vaccine}</p>
                  <p className="text-[10px] text-muted-foreground">{item.date}</p>
                </div>
                <span className={`rounded px-2 py-1 text-[9px] font-bold ${item.status === "Due" ? "bg-destructive/10 text-destructive" : "bg-accent/10 text-accent"}`}>{item.status}</span>
              </div>
            ))}
          </Panel>

          <Panel title="Screening & risk scores" icon={Activity}>
            {history.screening.map((item) => (
              <div key={item.name} className="border-b border-border/70 py-2 last:border-0">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs font-semibold">{item.name}</p>
                  <p className="text-[10px] text-muted-foreground">{item.date}</p>
                </div>
                <p className="text-[11px] font-semibold text-primary">{item.result}</p>
              </div>
            ))}
          </Panel>
        </div>
      </div>

      <p className="flex items-center gap-2 text-[10px] text-muted-foreground"><Stethoscope className="size-3.5" /> History reviewed with the patient on admission. Confirm changes with the patient before signing.</p>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <form onSubmit={addEntry} className="space-y-4">
            <DialogHeader>
              <DialogTitle>Add history entry</DialogTitle>
              <DialogDescription>Record a past or ongoing condition for {patient.name}.</DialogDescription>
            </DialogHeader>
            <div className="space-y-2">
              <Label htmlFor="history-condition">Condition</Label>
              <Input id="history-condition" value={condition} onChange={(event) => setCondition(event.target.value)} placeholder="e.g. Hypothyroidism" />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="history-since">Since</Label>
                <Input id="history-since" type="date" value={since} onChange={(event) => setSince(event.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={status} onValueChange={(value) => setStatus(value as MedicalEntry["status"])}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Ongoing">Ongoing</SelectItem>
                    <SelectItem value="Controlled">Controlled</SelectItem>
                    <SelectItem value="Resolved">Resolved</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="history-notes">Notes</Label>
              <Textarea id="history-notes" value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Treatment, control, relevant details" rows={3} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit">Add entry</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </section>
  );
}

const KIND_DOT: Record<TimelineKind, string> = {
  Condition: "bg-primary",
  Diagnosis: "bg-destructive",
  Procedure: "bg-chart-4",
  Encounter: "bg-accent",
};

const KIND_CHIP: Record<TimelineKind, string> = {
  Condition: "bg-primary/10 text-primary",
  Diagnosis: "bg-destructive/10 text-destructive",
  Procedure: "bg-chart-4/10 text-chart-4",
  Encounter: "bg-accent/10 text-accent",
};

function HistoryStatus({ status }: { status: MedicalEntry["status"] }) {
  const tones: Record<MedicalEntry["status"], string> = {
    Ongoing: "bg-chart-4/10 text-chart-4",
    Controlled: "bg-accent/10 text-accent",
    Resolved: "bg-muted text-muted-foreground",
  };
  return <span className={`rounded px-2 py-1 text-[9px] font-bold uppercase ${tones[status]}`}>{status}</span>;
}

function Stat({ icon: Icon, label, value, alert = false }: { icon: typeof Activity; label: string; value: string; alert?: boolean }) {
  return (
    <div className={`flex min-h-16 items-center gap-3 rounded-xl border bg-card/75 p-3 ${alert ? "border-chart-4/30" : "border-border"}`}>
      <Icon className={`size-5 shrink-0 ${alert ? "text-chart-4" : "text-primary"}`} />
      <div>
        <p className="text-[9px] font-bold text-muted-foreground uppercase">{label}</p>
        <p className="mt-0.5 text-xs font-bold">{value}</p>
      </div>
    </div>
  );
}

function Panel({ title, icon: Icon, action, onAction, children }: { title: string; icon: typeof Activity; action?: string; onAction?: () => void; children: React.ReactNode }) {
  return (
    <section className="overflow-hidden rounded-xl border border-border bg-card/75">
      <header className="flex min-h-10 items-center justify-between gap-2 border-b border-border bg-muted/45 px-3">
        <h3 className="flex items-center gap-2 font-display text-sm font-extrabold text-primary"><Icon className="size-4" />{title}</h3>
        {action && <Button variant="ghost" size="sm" className="h-7 px-2 text-[10px] text-primary" onClick={onAction}>{action}</Button>}
      </header>
      <div className="p-3">{children}</div>
    </section>
  );
}
