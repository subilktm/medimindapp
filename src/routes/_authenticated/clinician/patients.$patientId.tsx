import { createFileRoute, Link } from "@tanstack/react-router";
import { DentalChartSummaryCard } from "@/components/dental-chart-summary";
import { PatientAiInsights } from "@/components/patient-ai-insights";
import { PatientClinicalHistory } from "@/components/patient-clinical-history";
import { PatientDocuments } from "@/components/patient-documents";
import { PatientEncounters } from "@/components/patient-encounters";
import { PatientResults } from "@/components/patient-results";
import { PedodonticsChartTable } from "@/components/pedodontics-chart-table";
import { VoiceRecorder } from "@/components/voice-recorder";
import { type FormEvent, useState } from "react";
import {
  Activity,
  AlertTriangle,
  CalendarDays,
  ChevronLeft,
  ClipboardPlus,
  Clock3,
  FileCheck2,
  FileText,
  HeartPulse,
  MessageSquare,
  Pill,
  Plus,
  Printer,
  ShieldCheck,
  Stethoscope,
  TestTube2,
  UserRoundPen,
  UsersRound,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getClinicalPatient, type ClinicalPatient, type PatientDiagnosis, type PatientMedication } from "@/lib/clinical-patients";

export const Route = createFileRoute("/_authenticated/clinician/patients/$patientId")({
  head: ({ params }) => {
    const patient = getClinicalPatient(params.patientId);
    const title = patient ? `${patient.name} — Patient dashboard — MediMind` : "Patient not found — MediMind";
    const description = patient
      ? `Clinical dashboard for ${patient.name}, including encounters, vital signs, medications, orders and care coordination.`
      : "The requested patient record could not be found.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: PatientDashboard,
});

const TABS = ["Overview", "AI Insights", "Pedodontics chart", "Encounters", "Clinical history", "Medications", "Results", "Documents", "Audit trail"];
const ORDERS = [
  ["ECG 12 Lead", "Urgent", "Completed"],
  ["Troponin I", "Urgent", "Pending"],
  ["Chest X-Ray", "Routine", "Completed"],
  ["Lipid profile", "Routine", "Ordered"],
];

function PatientDashboard() {
  const { patientId } = Route.useParams();
  const [activeTab, setActiveTab] = useState("Overview");
  const [focusedEncounterId, setFocusedEncounterId] = useState<string>();
  const patient = getClinicalPatient(patientId);


  if (!patient) {
    return (
      <section className="flex min-h-[55vh] flex-col items-center justify-center text-center">
        <span className="flex size-14 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <UsersRound className="size-6" />
        </span>
        <h1 className="mt-4 font-display text-2xl font-extrabold">Patient not found</h1>
        <p className="mt-2 text-sm text-muted-foreground">This patient is not in your current care list.</p>
        <Button asChild variant="outline" className="mt-5">
          <Link to="/clinician/patients"><ChevronLeft className="size-4" /> Back to patient list</Link>
        </Button>
      </section>
    );
  }

  const notify = (action: string) => toast.info(`${action} is ready for clinical integration.`);
  const openRecordItem = (target: "follow-ups" | "orders") => {
    setActiveTab("Overview");
    window.requestAnimationFrame(() => {
      document.getElementById(target)?.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  };
  const openCurrentEncounter = () => {
    setFocusedEncounterId(patient.encounters[0]?.id);
    setActiveTab("Encounters");
  };


  return (
    <div className="space-y-4 pb-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link to="/clinician/patients" className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline">
            <ChevronLeft className="size-3.5" /> Patient list
          </Link>
          <h1 className="mt-1 font-display text-2xl font-extrabold">Patient dashboard</h1>
          <p className="text-xs text-muted-foreground">Comprehensive clinical overview and care coordination</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => notify("Edit patient")}><UserRoundPen className="size-4" /> Edit patient</Button>
          <VoiceRecorder patientId={patient.id} />
          <Button variant="outline" size="sm" onClick={() => notify("Print summary")}><Printer className="size-4" /> Print summary</Button>
          <Button size="sm" onClick={() => notify("New encounter")}><Plus className="size-4" /> Start encounter</Button>
        </div>
      </div>

      <section className="overflow-hidden rounded-xl border border-border bg-card/80 shadow-panel">
        <div className="flex flex-wrap items-center gap-4 p-4">
          <img
            src={patient.photo}
            alt={`${patient.name} patient profile`}
            width={768}
            height={768}
            className="size-16 shrink-0 rounded-xl border border-border object-cover shadow-sm"
          />
          <div className="min-w-[210px] flex-1">
            <h2 className="font-display text-lg font-extrabold text-primary">{patient.name}</h2>
            <p className="mt-1 text-xs text-muted-foreground">MRN: {patient.mrn} · {patient.age} years · {patient.sex} · DOB: {patient.dob} · Blood group: {patient.bloodGroup}</p>
            <p className="mt-1 text-xs text-muted-foreground">Mobile: {patient.mobile} · Room {patient.room}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {patient.allergies.map((item) => <StatusFlag key={item} icon={AlertTriangle} label={`Allergy: ${item}`} tone="danger" />)}
            {patient.risks.map((item) => <StatusFlag key={item} icon={AlertTriangle} label={item} tone="warning" />)}
            <StatusFlag icon={ShieldCheck} label="Insurance eligible" tone="info" />
            <StatusFlag icon={FileCheck2} label={patient.status} tone="success" />
          </div>
        </div>
        <nav className="flex overflow-x-auto border-t border-border bg-muted/40 px-2" aria-label="Patient record sections">
          {TABS.map((tab) => {
            const isPanelTab = tab === "Overview" || tab === "AI Insights" || tab === "Pedodontics chart" || tab === "Encounters" || tab === "Clinical history" || tab === "Medications" || tab === "Results" || tab === "Documents";
            const isActive = tab === activeTab;
            return (
              <Button
                key={tab}
                type="button"
                variant="ghost"
                onClick={() => (isPanelTab ? setActiveTab(tab) : notify(tab))}
                className={`h-auto shrink-0 rounded-none border-b-2 px-4 py-2.5 text-xs font-semibold ${isActive ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
              >{tab}</Button>
            );
          })}

        </nav>
      </section>

      {activeTab === "Overview" ? (
        <>
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">

        <QuickStat icon={CalendarDays} label="Upcoming appointment" value="25 Sep 2026, 10:00 AM" />
        <QuickStat icon={Stethoscope} label="Active encounter" value={patient.encounter.number} />
        <QuickStat icon={FileText} label="Open orders" value="4" />
        <QuickStat icon={TestTube2} label="Pending results" value="2" />
        <QuickStat icon={ClipboardPlus} label="Outstanding balance" value="AED 118" alert />
      </section>

      <div className="grid gap-4 xl:grid-cols-12">
        <div className="space-y-4 xl:col-span-7">
          <Panel title="Current encounter" icon={Stethoscope} action="Open encounter" onAction={openCurrentEncounter}>
            <div className="grid gap-px overflow-hidden rounded-lg bg-border sm:grid-cols-2 lg:grid-cols-4">
              <DataCell label="Encounter no." value={patient.encounter.number} />
              <DataCell label="Type" value={patient.encounter.type} />
              <DataCell label="Admission" value={patient.encounter.admitted} />
              <DataCell label="Ward / bed" value={`${patient.encounter.ward} · ${patient.room}`} />
              <DataCell label="Consultant" value={patient.encounter.consultant} />
              <DataCell label="Status" value="Active" success />
              <div className="bg-card p-3 sm:col-span-2"><p className="text-[10px] font-bold text-muted-foreground uppercase">Current complaint</p><p className="mt-1 text-xs font-semibold">{patient.encounter.complaint}</p></div>
            </div>
          </Panel>

          <Panel title="Clinical snapshot" icon={Activity} action="View trends" onAction={() => notify("Clinical trends")}>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
              {patient.vitals.map((vital) => (
                <div key={vital.label} className="rounded-lg border border-border bg-muted/35 p-2 text-center">
                  <p className="text-[9px] font-bold text-muted-foreground uppercase">{vital.label}</p>
                  <p className="mt-1 font-display text-base font-extrabold text-primary">{vital.value}</p>
                  <p className="text-[9px] text-muted-foreground">{vital.unit}</p>
                </div>
              ))}
            </div>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg bg-primary/5 p-3"><p className="text-[10px] font-bold text-primary uppercase">Active diagnoses</p><p className="mt-1 text-xs">{patient.diagnoses.filter((item) => item.status === "Active").map((item) => item.condition).join(" · ")}</p></div>
              <div className="rounded-lg bg-destructive/5 p-3"><p className="text-[10px] font-bold text-destructive uppercase">Allergies</p><p className="mt-1 text-xs">{patient.allergies.join(", ")}</p></div>
            </div>
          </Panel>
        </div>

        <div className="space-y-4 xl:col-span-5">
          <div id="follow-ups" className="scroll-mt-28">
            <Panel title="Upcoming appointments" icon={CalendarDays} action="Book appointment" onAction={() => notify("Appointment booking")}>
              <CompactRow primary="25 Sep 2026, 10:00 AM" secondary="Cardiology · Dr. Lena Hart" status="Confirmed" />
              <CompactRow primary="08 Oct 2026, 09:30 AM" secondary="Follow-up clinic" status="Scheduled" />
            </Panel>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Panel title="Care team" icon={UsersRound} action="Message all" onAction={() => notify("Care team messaging")}>
              <CompactRow primary="Dr. Lena Hart" secondary="Consultant Cardiologist" />
              <CompactRow primary="Nurse Maria" secondary="Primary nurse" />
              <CompactRow primary="Dr. Nabil Rahman" secondary="Consulting Nephrologist" />
            </Panel>
            <Panel title="Insurance" icon={ShieldCheck} action="View details" onAction={() => notify("Insurance details")}>
              <DataLine label="Provider" value="MediMind Health" />
              <DataLine label="Policy no." value="DH-2024-77821" />
              <DataLine label="Eligibility" value="Verified" success />
              <DataLine label="Prior authorisation" value="Not required" />
            </Panel>
          </div>
        </div>
      </div>

      <DentalChartSummaryCard patientId={patient.id} patientName={patient.name} />

      <DiagnosisPanel initialDiagnoses={patient.diagnoses} />

      <div className="grid gap-4 xl:grid-cols-12">
        <Panel title="Active medications" icon={Pill} action="View MAR" onAction={() => notify("Medication administration record")} className="xl:col-span-4">
          <ClinicalTable headings={["Medication", "Dose", "Route", "Frequency", "Status"]} rows={patient.medications.map((medication) => [medication.name, medication.strength, medication.route, medication.frequency, medication.status])} />
        </Panel>
        <div id="orders" className="scroll-mt-28 xl:col-span-4">
          <Panel title="Orders & recent results" icon={FileText} action="New order" onAction={() => notify("New order")}>
            <ClinicalTable headings={["Test / procedure", "Priority", "Status"]} rows={ORDERS} />
          </Panel>
        </div>
        <Panel title="Documents & consents" icon={FileCheck2} action="View documents" onAction={() => notify("Documents")} className="xl:col-span-4">
          <DataLine label="Emirates ID" value="Verified" success />
          <DataLine label="Insurance card" value="Verified" success />
          <DataLine label="General consent" value="Signed" success />
          <DataLine label="Privacy consent" value="Signed" success />
          <DataLine label="Advance directive" value="Not available" />
        </Panel>
      </div>

      <Panel title="Recent activity" icon={Clock3}>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          {["Troponin ordered", "Clinical assessment signed", "Nursing assessment completed", "Patient admitted to Cardiology", "Appointment confirmed"].map((event, index) => (
            <div key={event} className="border-l-2 border-primary pl-3"><p className="text-[10px] text-muted-foreground">{index + 9}:20 AM · 21 Sep</p><p className="mt-1 text-xs font-semibold">{event}</p></div>
          ))}
        </div>
      </Panel>
        </>
      ) : activeTab === "AI Insights" ? (
        <PatientAiInsights patient={patient} onOpenRecordItem={openRecordItem} />
      ) : activeTab === "Encounters" ? (
        <PatientEncounters patient={patient} focusEncounterId={focusedEncounterId} />
      ) : activeTab === "Clinical history" ? (
        <PatientClinicalHistory patient={patient} />
      ) : activeTab === "Medications" ? (
        <MedicationDetailsTab patient={patient} />
      ) : activeTab === "Results" ? (
        <PatientResults patient={patient} />
      ) : activeTab === "Documents" ? (
        <PatientDocuments patient={patient} />
      ) : (
        <PedodonticsChartTable patientId={patient.id} />
      )}



      <div className="z-10 flex flex-wrap justify-end gap-2 rounded-xl border border-border bg-card/90 p-3 shadow-panel backdrop-blur-xl md:sticky md:bottom-3">
        <Button variant="outline" size="sm" onClick={() => notify("Clinical note")}><FileText className="size-4" /> Add note</Button>
        <Button variant="outline" size="sm" onClick={() => notify("Vital recording")}><HeartPulse className="size-4" /> Record vitals</Button>
        <Button variant="outline" size="sm" onClick={() => notify("Care team message")}><MessageSquare className="size-4" /> Message team</Button>
        <Button size="sm" onClick={() => notify("Medication prescribing")}><Pill className="size-4" /> Prescribe medication</Button>
      </div>
    </div>
  );
}

function MedicationDetailsTab({ patient }: { patient: ClinicalPatient }) {
  const activeMedicationCount = patient.medications.filter((medication) => medication.status === "Active" || medication.status === "PRN").length;
  const dueMedicationCount = patient.medications.filter((medication) => !medication.nextDue.toLowerCase().includes("available") && !medication.nextDue.toLowerCase().includes("resume only")).length;
  const allergyConflicts = patient.medications.filter((medication) => medication.safetyNote.toLowerCase().includes("allergy") && !medication.safetyNote.toLowerCase().includes("does not conflict") && !medication.safetyNote.toLowerCase().includes("no recorded allergy conflict"));

  return (
    <section className="space-y-4" aria-label={`${patient.name} medication details`}>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <QuickStat icon={Pill} label="Current medications" value={`${activeMedicationCount} active / PRN`} />
        <QuickStat icon={Clock3} label="Next scheduled doses" value={`${dueMedicationCount} due`} />
        <QuickStat icon={AlertTriangle} label="Allergy safeguards" value={patient.allergies.join(", ")} alert={allergyConflicts.length > 0} />
        <QuickStat icon={ShieldCheck} label="Reconciliation" value="Inpatient list reviewed" />
      </div>

      <div className="grid gap-4 xl:grid-cols-12">
        <Panel title="Medication administration record" icon={Pill} action="Add medication" onAction={() => toast.info("Medication prescribing is ready for clinical integration.")} className="xl:col-span-8">
          <div className="space-y-3">
            {patient.medications.map((medication) => <MedicationCard key={medication.id} medication={medication} />)}
          </div>
        </Panel>

        <div className="space-y-4 xl:col-span-4">
          <Panel title="Medication safety" icon={AlertTriangle} action="Run interaction check" onAction={() => toast.success("Medication safety review completed.")}>
            <div className="space-y-3">
              <div className="rounded-lg border border-border bg-muted/35 p-3">
                <p className="text-[10px] font-bold text-muted-foreground uppercase">Recorded allergies</p>
                <p className="mt-1 text-sm font-extrabold text-destructive">{patient.allergies.join(", ")}</p>
              </div>
              {patient.medications.map((medication) => (
                <div key={`${medication.id}-safety`} className="rounded-lg border border-border bg-card p-3">
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-xs font-extrabold text-foreground">{medication.name}</p>
                    <MedicationStatusBadge status={medication.status} />
                  </div>
                  <p className="mt-2 text-[11px] leading-5 text-muted-foreground">{medication.safetyNote}</p>
                </div>
              ))}
            </div>
          </Panel>

          <Panel title="Dose schedule" icon={Clock3} action="View MAR" onAction={() => toast.info("Medication administration record is ready for clinical integration.")}>
            <div className="space-y-2">
              {patient.medications.map((medication) => (
                <div key={`${medication.id}-schedule`} className="border-l-2 border-primary pl-3">
                  <p className="text-xs font-extrabold">{medication.name}</p>
                  <p className="mt-1 text-[10px] text-muted-foreground">Last: {medication.lastAdministered}</p>
                  <p className="text-[10px] font-semibold text-primary">Next: {medication.nextDue}</p>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      </div>

      <Panel title="Monitoring and hold criteria" icon={Activity} action="Document review" onAction={() => toast.success("Medication review note drafted.")}>
        <div className="grid gap-3 lg:grid-cols-3">
          {patient.medications.map((medication) => (
            <div key={`${medication.id}-monitoring`} className="rounded-lg border border-border bg-muted/30 p-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-extrabold text-primary">{medication.name}</p>
                  <p className="text-[10px] text-muted-foreground">{medication.indication}</p>
                </div>
                <span className="rounded bg-primary/10 px-2 py-1 text-[9px] font-bold text-primary">{medication.prescribedBy}</span>
              </div>
              <div className="mt-3 space-y-2 text-[11px] leading-5">
                <p><span className="font-bold text-foreground">Monitor:</span> <span className="text-muted-foreground">{medication.monitoring}</span></p>
                <p><span className="font-bold text-foreground">Hold if:</span> <span className="text-muted-foreground">{medication.holdCriteria}</span></p>
                <p><span className="font-bold text-foreground">Started:</span> <span className="text-muted-foreground">{medication.startedAt}</span></p>
              </div>
            </div>
          ))}
        </div>
      </Panel>
    </section>
  );
}

function MedicationCard({ medication }: { medication: PatientMedication }) {
  return (
    <article className="rounded-lg border border-border bg-card p-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-display text-base font-extrabold text-primary">{medication.name}</h3>
            <MedicationStatusBadge status={medication.status} />
          </div>
          <p className="mt-1 text-xs text-muted-foreground">{medication.strength} · {medication.form} · {medication.route}</p>
        </div>
        <div className="rounded-lg bg-primary/5 px-3 py-2 text-right">
          <p className="text-[9px] font-bold text-muted-foreground uppercase">Frequency</p>
          <p className="text-xs font-extrabold text-primary">{medication.frequency}</p>
        </div>
      </div>
      <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        <MedicationDataPoint label="Indication" value={medication.indication} />
        <MedicationDataPoint label="Prescriber" value={medication.prescribedBy} />
        <MedicationDataPoint label="Last administered" value={medication.lastAdministered} />
        <MedicationDataPoint label="Next due" value={medication.nextDue} accent />
      </div>
    </article>
  );
}

function MedicationDataPoint({ label, value, accent = false }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="rounded-lg border border-border bg-muted/30 p-2">
      <p className="text-[9px] font-bold text-muted-foreground uppercase">{label}</p>
      <p className={`mt-1 text-[11px] font-semibold leading-4 ${accent ? "text-primary" : "text-foreground"}`}>{value}</p>
    </div>
  );
}

function MedicationStatusBadge({ status }: { status: PatientMedication["status"] }) {
  const tones: Record<PatientMedication["status"], string> = {
    Active: "bg-accent/10 text-accent",
    PRN: "bg-primary/10 text-primary",
    Held: "bg-chart-4/10 text-chart-4",
    Completed: "bg-muted text-muted-foreground",
  };

  return <span className={`rounded px-2 py-1 text-[9px] font-bold uppercase ${tones[status]}`}>{status}</span>;
}

function DiagnosisPanel({ initialDiagnoses }: { initialDiagnoses: PatientDiagnosis[] }) {
  const [diagnoses, setDiagnoses] = useState(initialDiagnoses);
  const [open, setOpen] = useState(false);
  const [condition, setCondition] = useState("");
  const [code, setCode] = useState("");
  const [status, setStatus] = useState<PatientDiagnosis["status"]>("Active");
  const [onset, setOnset] = useState("2026-09-21");

  const addDiagnosis = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const cleanCondition = condition.trim();
    if (!cleanCondition) return;
    setDiagnoses((items) => [
      { condition: cleanCondition, code: code.trim() || "Uncoded", status, onset: onset || "21 Sep 2026", clinician: "Dr. Lena Hart" },
      ...items,
    ]);
    setCondition("");
    setCode("");
    setStatus("Active");
    setOnset("2026-09-21");
    setOpen(false);
    toast.success("Diagnosis added to the patient record");
  };

  return (
    <>
      <Panel title="Diagnosis list" icon={ClipboardPlus} action="Add new diagnosis" onAction={() => setOpen(true)}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px] text-left text-xs">
            <thead><tr className="border-b border-border text-[10px] font-bold text-muted-foreground uppercase"><th className="pb-2">Diagnosis</th><th className="pb-2">ICD-10</th><th className="pb-2">Status</th><th className="pb-2">Onset</th><th className="pb-2">Recorded by</th></tr></thead>
            <tbody className="divide-y divide-border/60">
              {diagnoses.map((item) => (
                <tr key={`${item.condition}-${item.onset}`}>
                  <td className="py-3 pr-4 font-semibold">{item.condition}</td>
                  <td className="py-3 pr-4 text-muted-foreground">{item.code}</td>
                  <td className="py-3 pr-4"><span className={`rounded px-2 py-1 text-[10px] font-bold ${item.status === "Active" ? "bg-accent/10 text-accent" : "bg-muted text-muted-foreground"}`}>{item.status}</span></td>
                  <td className="py-3 pr-4 text-muted-foreground">{item.onset}</td>
                  <td className="py-3 text-muted-foreground">{item.clinician}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md border-border bg-card">
          <DialogHeader>
            <DialogTitle className="font-display text-primary">Add new diagnosis</DialogTitle>
            <DialogDescription>Record a diagnosis in this patient’s clinical record.</DialogDescription>
          </DialogHeader>
          <form onSubmit={addDiagnosis} className="space-y-4">
            <div className="space-y-2"><Label htmlFor="diagnosis-condition">Diagnosis</Label><Input id="diagnosis-condition" value={condition} onChange={(event) => setCondition(event.target.value)} placeholder="Enter condition" required autoFocus /></div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2"><Label htmlFor="diagnosis-code">ICD-10 code</Label><Input id="diagnosis-code" value={code} onChange={(event) => setCode(event.target.value)} placeholder="e.g. I10" /></div>
              <div className="space-y-2"><Label htmlFor="diagnosis-onset">Onset date</Label><Input id="diagnosis-onset" type="date" value={onset} onChange={(event) => setOnset(event.target.value)} required /></div>
            </div>
            <div className="space-y-2"><Label>Status</Label><Select value={status} onValueChange={(value: PatientDiagnosis["status"]) => setStatus(value)}><SelectTrigger aria-label="Diagnosis status"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Active">Active</SelectItem><SelectItem value="Resolved">Resolved</SelectItem></SelectContent></Select></div>
            <DialogFooter className="gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit"><Plus className="size-4" /> Add diagnosis</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

function StatusFlag({ icon: Icon, label, tone }: { icon: typeof AlertTriangle; label: string; tone: "danger" | "warning" | "info" | "success" }) {
  const tones = { danger: "border-destructive/25 bg-destructive/5 text-destructive", warning: "border-chart-4/30 bg-chart-4/10 text-chart-4", info: "border-primary/20 bg-primary/5 text-primary", success: "border-accent/25 bg-accent/10 text-accent" };
  return <span className={`inline-flex max-w-40 items-center gap-1.5 rounded-lg border px-2.5 py-2 text-[10px] font-bold ${tones[tone]}`}><Icon className="size-3.5 shrink-0" />{label}</span>;
}

function QuickStat({ icon: Icon, label, value, alert = false }: { icon: typeof CalendarDays; label: string; value: string; alert?: boolean }) {
  return <div className={`flex min-h-16 items-center gap-3 rounded-xl border bg-card/75 p-3 ${alert ? "border-destructive/25" : "border-border"}`}><Icon className={`size-5 shrink-0 ${alert ? "text-destructive" : "text-primary"}`} /><div><p className="text-[9px] font-bold text-muted-foreground uppercase">{label}</p><p className={`mt-0.5 text-xs font-bold ${alert ? "text-destructive" : "text-foreground"}`}>{value}</p></div></div>;
}

function Panel({ title, icon: Icon, action, onAction, className = "", children }: { title: string; icon: typeof Activity; action?: string; onAction?: () => void; className?: string; children: React.ReactNode }) {
  return <section className={`overflow-hidden rounded-xl border border-border bg-card/75 ${className}`}><header className="flex min-h-10 items-center justify-between gap-2 border-b border-border bg-muted/45 px-3"><h2 className="flex items-center gap-2 font-display text-sm font-extrabold text-primary"><Icon className="size-4" />{title}</h2>{action && <Button variant="ghost" size="sm" className="h-7 px-2 text-[10px] text-primary" onClick={onAction}>{action}</Button>}</header><div className="p-3">{children}</div></section>;
}

function DataCell({ label, value, success = false }: { label: string; value: string; success?: boolean }) {
  return <div className="bg-card p-3"><p className="text-[9px] font-bold text-muted-foreground uppercase">{label}</p><p className={`mt-1 text-xs font-semibold ${success ? "text-accent" : ""}`}>{value}</p></div>;
}

function CompactRow({ primary, secondary, status }: { primary: string; secondary: string; status?: string }) {
  return <div className="flex items-center justify-between gap-3 border-b border-border/70 py-2 last:border-0"><div><p className="text-xs font-semibold">{primary}</p><p className="text-[10px] text-muted-foreground">{secondary}</p></div>{status && <span className="rounded bg-accent/10 px-2 py-1 text-[9px] font-bold text-accent">{status}</span>}</div>;
}

function DataLine({ label, value, success = false }: { label: string; value: string; success?: boolean }) {
  return <div className="flex items-center justify-between gap-3 border-b border-border/70 py-2 text-[10px] last:border-0"><span className="text-muted-foreground">{label}</span><span className={`font-semibold ${success ? "text-accent" : ""}`}>{value}</span></div>;
}

function ClinicalTable({ headings, rows }: { headings: string[]; rows: readonly (readonly string[])[] | string[][] }) {
  return <div className="overflow-x-auto"><table className="w-full text-left text-[10px]"><thead><tr className="text-muted-foreground">{headings.map((heading) => <th key={heading} className="pb-2 font-bold">{heading}</th>)}</tr></thead><tbody className="divide-y divide-border/60">{rows.map((row) => <tr key={row[0]}>{row.map((cell, index) => <td key={`${row[0]}-${cell}`} className={`py-2 pr-2 ${index === 0 ? "font-semibold" : "text-muted-foreground"}`}>{cell}</td>)}</tr>)}</tbody></table></div>;
}