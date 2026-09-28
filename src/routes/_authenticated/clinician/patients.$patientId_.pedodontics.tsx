import { createFileRoute, Link } from "@tanstack/react-router";
import { SummaryText } from "@/components/summary-text";
import { DentalImagingPanel } from "@/components/dental-imaging";
import { SummaryReviewPanel } from "@/components/summary-review";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { type FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Activity,
  AlertTriangle,
  Baby,
  CalendarClock,
  CheckCircle2,
  ChevronLeft,
  ClipboardList,
  FileSignature,
  HeartPulse,
  History,
  Images,
  Loader2,
  Pill,
  Plus,
  Printer,
  ShieldCheck,
  Smile,
  Sparkles,
  Stethoscope,
  UsersRound,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getClinicalPatient } from "@/lib/clinical-patients";
import {
  getToothChart,
  resetToothChart,
  saveToothChange,
  summarizeToothFindings,
} from "@/lib/tooth-chart.functions";

type ChartFinding = { tooth: string; toothState: string; surfaces: Record<string, string> };

export const Route = createFileRoute("/_authenticated/clinician/patients/$patientId_/pedodontics")({
  head: ({ params }) => {
    const patient = getClinicalPatient(params.patientId);
    const title = patient
      ? `${patient.name} — Pedodontics chart — MediMind`
      : "Pedodontics chart — MediMind";
    const description = patient
      ? `Pediatric dental chart for ${patient.name}: graphical mixed-dentition odontogram, caries risk, eruption tracking, preventive plan and weight-based medication safety.`
      : "Pediatric dental charting with a graphical mixed-dentition odontogram, caries-risk assessment and preventive care planning.";
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
  component: PedodonticsChart,
});

type ToothState = "Sound" | "Caries" | "Restored" | "Sealant" | "Pulp" | "Crown" | "Missing" | "Erupting" | "Trauma";

const TOOTH_CYCLE: ToothState[] = [
  "Sound",
  "Caries",
  "Restored",
  "Sealant",
  "Pulp",
  "Crown",
  "Erupting",
  "Trauma",
  "Missing",
];

type ToothStyle = { fill: string; stroke: string; chip: string; short: string };

const TOOTH_STYLE: Record<ToothState, ToothStyle> = {
  Sound: { fill: "var(--card)", stroke: "var(--border)", chip: "bg-card text-foreground border-border", short: "" },
  Caries: {
    fill: "color-mix(in oklab, var(--destructive) 22%, var(--card))",
    stroke: "var(--destructive)",
    chip: "bg-destructive/10 text-destructive border-destructive/40",
    short: "C",
  },
  Restored: {
    fill: "color-mix(in oklab, var(--primary) 22%, var(--card))",
    stroke: "var(--primary)",
    chip: "bg-primary/10 text-primary border-primary/40",
    short: "F",
  },
  Sealant: {
    fill: "color-mix(in oklab, var(--accent) 20%, var(--card))",
    stroke: "var(--accent)",
    chip: "bg-accent/10 text-accent border-accent/40",
    short: "S",
  },
  Pulp: {
    fill: "color-mix(in oklab, var(--chart-5) 22%, var(--card))",
    stroke: "var(--chart-5)",
    chip: "bg-chart-5/10 text-chart-5 border-chart-5/40",
    short: "P",
  },
  Crown: {
    fill: "color-mix(in oklab, var(--chart-4) 24%, var(--card))",
    stroke: "var(--chart-4)",
    chip: "bg-chart-4/10 text-chart-4 border-chart-4/40",
    short: "SSC",
  },
  Missing: {
    fill: "var(--muted)",
    stroke: "var(--muted-foreground)",
    chip: "bg-muted text-muted-foreground border-border",
    short: "X",
  },
  Erupting: {
    fill: "color-mix(in oklab, var(--chart-2) 20%, var(--card))",
    stroke: "var(--chart-2)",
    chip: "bg-chart-2/10 text-chart-2 border-chart-2/40",
    short: "E",
  },
  Trauma: {
    fill: "color-mix(in oklab, var(--chart-4) 34%, var(--card))",
    stroke: "var(--destructive)",
    chip: "bg-chart-4/20 text-destructive border-destructive/30",
    short: "T",
  },
};

type MarkMode = "Surface" | "Whole tooth";

type SurfaceCode = "O" | "M" | "D" | "B" | "L";

const SURFACES: Array<{ code: SurfaceCode; label: string }> = [
  { code: "O", label: "Occlusal / incisal" },
  { code: "M", label: "Mesial" },
  { code: "D", label: "Distal" },
  { code: "B", label: "Buccal / labial" },
  { code: "L", label: "Lingual / palatal" },
];

type SurfaceFinding = "Caries" | "Restoration" | "Sealant" | "Fracture" | "Missing";

const SURFACE_FINDINGS: SurfaceFinding[] = ["Caries", "Restoration", "Sealant", "Fracture", "Missing"];

const SURFACE_STYLE: Record<SurfaceFinding, { fill: string; solid: string; chip: string }> = {
  Caries: {
    fill: "color-mix(in oklab, var(--destructive) 26%, var(--card))",
    solid: "var(--destructive)",
    chip: "bg-destructive/10 text-destructive border-destructive/40",
  },
  Restoration: {
    fill: "color-mix(in oklab, var(--primary) 26%, var(--card))",
    solid: "var(--primary)",
    chip: "bg-primary/10 text-primary border-primary/40",
  },
  Sealant: {
    fill: "color-mix(in oklab, var(--accent) 26%, var(--card))",
    solid: "var(--accent)",
    chip: "bg-accent/10 text-accent border-accent/40",
  },
  Fracture: {
    fill: "color-mix(in oklab, var(--chart-4) 30%, var(--card))",
    solid: "var(--chart-4)",
    chip: "bg-chart-4/15 text-chart-4 border-chart-4/40",
  },
  Missing: {
    fill: "var(--muted)",
    solid: "var(--muted-foreground)",
    chip: "bg-muted text-muted-foreground border-border",
  },
};

type SurfaceMap = Partial<Record<SurfaceCode, SurfaceFinding>>;

const INITIAL_SURFACES: Record<string, SurfaceMap> = {
  "54": { O: "Caries", M: "Caries" },
  "64": { O: "Restoration" },
  "75": { O: "Caries", D: "Caries" },
  "84": { O: "Sealant" },
  "16": { O: "Sealant" },
  "26": { O: "Sealant" },
  "11": { B: "Fracture" },
};

const PERMANENT_UPPER_RIGHT = ["18", "17", "16", "15", "14", "13", "12", "11"];
const PERMANENT_UPPER_LEFT = ["21", "22", "23", "24", "25", "26", "27", "28"];
const PERMANENT_LOWER_RIGHT = ["48", "47", "46", "45", "44", "43", "42", "41"];
const PERMANENT_LOWER_LEFT = ["31", "32", "33", "34", "35", "36", "37", "38"];
const PRIMARY_UPPER_RIGHT = ["55", "54", "53", "52", "51"];
const PRIMARY_UPPER_LEFT = ["61", "62", "63", "64", "65"];
const PRIMARY_LOWER_RIGHT = ["85", "84", "83", "82", "81"];
const PRIMARY_LOWER_LEFT = ["71", "72", "73", "74", "75"];

const INITIAL_STATES: Record<string, ToothState> = {
  "54": "Caries",
  "64": "Restored",
  "75": "Caries",
  "84": "Sealant",
  "16": "Sealant",
  "26": "Sealant",
  "36": "Erupting",
  "46": "Erupting",
  "11": "Erupting",
  "61": "Missing",
  "74": "Pulp",
};

const CHART_TABS = [
  { id: "chart-history", label: "Assessment" },
  { id: "chart-odontogram", label: "Dental chart" },
  { id: "chart-imaging", label: "Imaging" },
  { id: "chart-ai", label: "AI summary & audit" },
  { id: "chart-eruption", label: "Eruption chart" },
  { id: "chart-risk", label: "Caries risk" },
  { id: "chart-prevention", label: "Prevention" },
  { id: "chart-plan", label: "Treatment plan" },
  { id: "chart-medication", label: "Medication" },
];

const FRANKL_SCALE = [
  { value: 1, label: "Definitely negative", mood: -2 },
  { value: 2, label: "Negative", mood: -1 },
  { value: 3, label: "Positive", mood: 1 },
  { value: 4, label: "Definitely positive", mood: 2 },
];

const ERUPTION_ROWS = [
  ["Upper central incisors (11 / 21)", "6 – 7 yrs", "Erupting", "On track"],
  ["Lower central incisors (31 / 41)", "6 – 7 yrs", "Erupted", "Complete"],
  ["First permanent molars (16 / 26 / 36 / 46)", "6 – 7 yrs", "Erupting", "On track"],
  ["Primary second molars (55 / 65 / 75 / 85)", "Exfoliation 10 – 12 yrs", "Present", "Monitor"],
  ["Canines (13 / 23 / 33 / 43)", "9 – 12 yrs", "Unerupted", "Expected"],
];

const ERUPTION_TIMELINE = [
  { label: "Incisors", progress: 92 },
  { label: "First molars", progress: 68 },
  { label: "Canines", progress: 24 },
  { label: "Premolars", progress: 10 },
  { label: "Second molars", progress: 4 },
];

const CARIES_FACTORS = [
  { id: "caries-history", label: "Caries in the last 12 months", weight: 3 },
  { id: "visible-plaque", label: "Visible plaque on anterior teeth", weight: 2 },
  { id: "night-bottle", label: "Night-time bottle or sweetened drinks", weight: 3 },
  { id: "snacking", label: "More than 3 sugary snacks daily", weight: 2 },
  { id: "no-fluoride", label: "No fluoride toothpaste / water", weight: 2 },
  { id: "special-needs", label: "Special healthcare needs or reduced dexterity", weight: 1 },
  { id: "family-caries", label: "Parent or sibling with active caries", weight: 1 },
];

const PREVENTIVE_TASKS = [
  { id: "fluoride", label: "Fluoride varnish 5% — every 6 months", done: true },
  { id: "sealant", label: "Fissure sealants on 16, 26, 36, 46", done: false },
  { id: "brushing", label: "Supervised brushing coaching with guardian", done: true },
  { id: "diet", label: "Diet counselling — reduce sugar frequency", done: false },
  { id: "recall", label: "3-month recall for high caries risk", done: false },
  { id: "xray", label: "Bitewing radiographs (if cooperation allows)", done: false },
];

const TREATMENT_PLAN = [
  ["54", "Composite restoration (occlusal)", "Local anaesthesia", "Visit 1", "Planned"],
  ["75", "Stainless steel crown after pulpotomy", "Local anaesthesia", "Visit 2", "Planned"],
  ["16 / 26", "Fissure sealant", "No anaesthesia", "Visit 1", "Planned"],
  ["Full mouth", "Fluoride varnish application", "No anaesthesia", "Visit 1", "Completed"],
];

const PARENT_INSTRUCTIONS = [
  "Brush twice daily with a smear of 1000 ppm fluoride toothpaste; parent finishes the brushing.",
  "No milk, juice or sweetened drinks in a bottle after brushing at night.",
  "Keep sugary snacks to mealtimes only; water between meals.",
  "Soft diet and no chewing on the treated side for 2 hours after restoration.",
  "Call the clinic if there is swelling, fever, or pain that does not settle with paracetamol.",
];

function PedodonticsChart() {
  const { patientId } = Route.useParams();
  const patient = getClinicalPatient(patientId);

  const [activeTab, setActiveTab] = useState(CHART_TABS[1]?.id ?? "chart-odontogram");
  const [painScore, setPainScore] = useState(5);
  const [frankl, setFrankl] = useState(2);
  const [weight, setWeight] = useState(22);
  const [verified, setVerified] = useState(false);
  const [cariesScore, setCariesScore] = useState(8);
  const [markedTeeth, setMarkedTeeth] = useState(Object.keys(INITIAL_STATES).length);
  const [findings, setFindings] = useState<ChartFinding[]>([]);
  const handleFindings = useCallback((next: ChartFinding[]) => setFindings(next), []);

  if (!patient) {
    return (
      <section className="flex min-h-[55vh] flex-col items-center justify-center text-center">
        <span className="flex size-14 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <Smile className="size-6" />
        </span>
        <h1 className="mt-4 font-display text-2xl font-extrabold">Patient not found</h1>
        <p className="mt-2 text-sm text-muted-foreground">This patient is not in your current care list.</p>
        <Button asChild variant="outline" className="mt-5">
          <Link to="/clinician/patients">
            <ChevronLeft className="size-4" /> Back to patient list
          </Link>
        </Button>
      </section>
    );
  }

  const notify = (action: string) => toast.info(`${action} is ready for clinical integration.`);

  const completion = Math.min(
    100,
    40 +
      (painScore > 0 ? 10 : 0) +
      (frankl > 0 ? 10 : 0) +
      (weight > 0 ? 10 : 0) +
      (verified ? 15 : 0) +
      (cariesScore > 0 ? 5 : 0) +
      Math.min(10, markedTeeth),
  );

  const goToSection = (id: string) => {
    setActiveTab(id);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="space-y-4 pb-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link
            to="/clinician/patients/$patientId"
            params={{ patientId }}
            className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
          >
            <ChevronLeft className="size-3.5" /> Patient dashboard
          </Link>
          <h1 className="mt-1 font-display text-2xl font-extrabold">Pedodontics chart</h1>
          <p className="text-xs text-muted-foreground">
            Document primary and mixed dentition, oral health risk and pediatric dental care
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-lg border border-chart-4/40 bg-chart-4/10 px-2.5 py-2 text-[10px] font-bold text-chart-4">
            <Activity className="size-3.5" /> In progress
          </span>
          <Button variant="outline" size="sm" onClick={() => notify("Previous dental visits")}>
            <ClipboardList className="size-4" /> Previous visits
          </Button>
          <Button variant="outline" size="sm" onClick={() => notify("Print pedodontics chart")}>
            <Printer className="size-4" /> Print chart
          </Button>
          <Button size="sm" onClick={() => toast.success("Pedodontics chart signed and saved to the patient record")}>
            <CheckCircle2 className="size-4" /> Sign &amp; complete
          </Button>
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
            <p className="mt-1 text-xs text-muted-foreground">
              MRN: {patient.mrn} · {patient.age} years · {patient.sex} · DOB: {patient.dob} · Blood group: {patient.bloodGroup}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">Guardian contact: {patient.mobile} · Room {patient.room}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {patient.allergies.map((item) => (
              <Flag key={item} icon={AlertTriangle} label={`Allergy: ${item}`} tone="danger" />
            ))}
            <Flag icon={Baby} label="Mixed dentition stage" tone="info" />
            <Flag icon={ShieldCheck} label={verified ? "Guardian verified" : "Guardian consent on file"} tone="success" />
          </div>
        </div>

        <nav className="flex gap-1 overflow-x-auto border-t border-border bg-muted/40 px-2">
          {CHART_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => goToSection(tab.id)}
              className={`shrink-0 border-b-2 px-3 py-2.5 text-xs font-semibold transition-colors ${
                activeTab === tab.id
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-primary"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </section>

      <div id="chart-history" className="grid scroll-mt-24 gap-4 xl:grid-cols-12">
        <DentalHistoryPanel
          className="xl:col-span-5"
          painScore={painScore}
          onPainScore={setPainScore}
          frankl={frankl}
          onFrankl={setFrankl}
        />
        <GuardianConsentPanel className="xl:col-span-4" verified={verified} onVerify={() => setVerified(true)} />
        <VitalsPanel className="xl:col-span-3" weight={weight} onWeight={setWeight} />
      </div>

      <div id="chart-odontogram" className="scroll-mt-24">
        <Odontogram patientId={patientId} onMarkedCount={setMarkedTeeth} onFindings={handleFindings} />
      </div>

      <DentalImagingPanel patientId={patientId} />



      <div id="chart-ai" className="grid scroll-mt-24 gap-4 xl:grid-cols-12">
        <AiTreatmentSummaryPanel
          className="xl:col-span-7"
          patientId={patientId}
          patientName={patient.name}
          age={`${patient.age}`}
          weight={weight}
          painScore={painScore}
          cariesRisk={cariesScore >= 7 ? "High" : cariesScore >= 4 ? "Moderate" : "Low"}
          allergies={patient.allergies.join(", ") || "None recorded"}
          findings={findings}
        />
        <AuditHistoryPanel className="xl:col-span-5" patientId={patientId} />
      </div>

      <div className="grid gap-4 xl:grid-cols-12">
        <Panel
          id="chart-eruption"
          title="Tooth eruption & development tracking"
          icon={Activity}
          className="scroll-mt-24 xl:col-span-7"
        >
          <ChartTable headings={["Tooth group", "Expected", "Current", "Assessment"]} rows={ERUPTION_ROWS} />
          <div className="mt-3 space-y-2 rounded-lg border border-border bg-muted/30 p-3">
            <p className="text-[10px] font-bold text-muted-foreground uppercase">Eruption timeline</p>
            {ERUPTION_TIMELINE.map((row) => (
              <div key={row.label} className="flex items-center gap-2">
                <span className="w-28 shrink-0 text-[10px] font-semibold">{row.label}</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-secondary/60">
                  <div className="h-full rounded-full bg-clinical" style={{ width: `${row.progress}%` }} />
                </div>
                <span className="w-9 shrink-0 text-right text-[10px] text-muted-foreground">{row.progress}%</span>
              </div>
            ))}
          </div>
          <div className="mt-3 grid gap-2 sm:grid-cols-3">
            <MiniStat label="Dental age" value="7 yrs 2 mo" />
            <MiniStat label="Chronological age" value={`${patient.age} yrs`} />
            <MiniStat label="Dentition stage" value="Early mixed" />
          </div>
        </Panel>
        <CariesRiskPanel className="scroll-mt-24 xl:col-span-5" onScore={setCariesScore} />
      </div>

      <div className="grid gap-4 xl:grid-cols-12">
        <PreventivePlanPanel className="scroll-mt-24 xl:col-span-5" />
        <DiagnosisPlanPanel className="scroll-mt-24 xl:col-span-7" />
      </div>

      <div className="grid gap-4 xl:grid-cols-12">
        <MedicationSafetyPanel className="scroll-mt-24 xl:col-span-7" weight={weight} onWeight={setWeight} />
        <FollowUpPanel className="xl:col-span-5" />
      </div>

      <section className="rounded-xl border border-border p-3 glass-strong md:sticky md:bottom-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="min-w-[220px] flex-1">
            <div className="flex items-center justify-between text-[10px] font-bold text-muted-foreground uppercase">
              <span>Chart completeness</span>
              <span className="text-primary">{completion}%</span>
            </div>
            <div className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-secondary/60">
              <div className="h-full rounded-full bg-clinical transition-all" style={{ width: `${completion}%` }} />
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="outline" onClick={() => toast.success("Draft chart saved")}>
              Save draft
            </Button>
            <Button size="sm" variant="outline" onClick={() => notify("Dental note editor")}>
              Add dental note
            </Button>
            <Button size="sm" variant="outline" onClick={() => notify("Pedodontics summary preview")}>
              Preview summary
            </Button>
            <Button size="sm" onClick={() => toast.success("Pedodontics chart signed and completed")}>
              <CheckCircle2 className="size-4" /> Sign &amp; complete chart
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

function DentalHistoryPanel({
  className = "",
  painScore,
  onPainScore,
  frankl,
  onFrankl,
}: {
  className?: string;
  painScore: number;
  onPainScore: (value: number) => void;
  frankl: number;
  onFrankl: (value: number) => void;
}) {
  const [notes, setNotes] = useState(
    "First dental visit at 4 years. Cooperative with tell-show-do. Thumb sucking stopped at 5 years. Occasional night-time bottle reported by mother.",
  );

  return (
    <Panel title="Chief complaint & pediatric history" icon={ClipboardList} className={className}>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Chief complaint" defaultValue="Pain in lower left back tooth while eating" />
        <Field label="Duration" defaultValue="2 days" />
        <Field label="Trigger" defaultValue="Sweet foods" />
        <Field label="Previous dental visit" defaultValue="1 year ago" />
        <Field label="Brushing" defaultValue="Once daily, unsupervised" />
        <Field label="Feeding habit" defaultValue="No bottle at night" />
      </div>

      <div className="mt-3 rounded-lg border border-border bg-muted/30 p-3">
        <p className="text-[10px] font-bold text-muted-foreground uppercase">Pain score (0 – 10)</p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {Array.from({ length: 11 }, (_, index) => index).map((value) => {
            const active = painScore === value;
            const tone = value >= 7 ? "destructive" : value >= 4 ? "chart-4" : "accent";
            return (
              <button
                key={value}
                type="button"
                aria-label={`Pain score ${value}`}
                aria-pressed={active}
                onClick={() => onPainScore(value)}
                className={`size-7 rounded-full border text-[10px] font-bold transition-all ${
                  active
                    ? tone === "destructive"
                      ? "border-destructive bg-destructive text-destructive-foreground scale-110"
                      : tone === "chart-4"
                        ? "border-chart-4 bg-chart-4 text-primary-foreground scale-110"
                        : "border-accent bg-accent text-accent-foreground scale-110"
                    : "border-border bg-card text-muted-foreground hover:border-primary/50 hover:text-primary"
                }`}
              >
                {value}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-3 rounded-lg border border-border bg-muted/30 p-3">
        <p className="text-[10px] font-bold text-muted-foreground uppercase">Frankl behaviour scale</p>
        <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {FRANKL_SCALE.map((item) => {
            const active = frankl === item.value;
            const negative = item.mood < 0;
            return (
              <button
                key={item.value}
                type="button"
                aria-pressed={active}
                onClick={() => onFrankl(item.value)}
                className={`flex flex-col items-center gap-1 rounded-lg border px-2 py-2.5 text-center transition-all ${
                  active
                    ? negative
                      ? "border-destructive bg-destructive/10 text-destructive shadow-panel"
                      : "border-accent bg-accent/10 text-accent shadow-panel"
                    : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-primary"
                }`}
              >
                <MoodFace mood={item.mood} />
                <span className="text-[11px] font-extrabold">{item.value}</span>
                <span className="text-[9px] leading-tight font-semibold">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-3 space-y-1.5">
        <Label htmlFor="pedo-history-notes" className="text-[10px] font-bold text-muted-foreground uppercase">
          Behavioural & social notes
        </Label>
        <Textarea
          id="pedo-history-notes"
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          rows={3}
          className="text-xs"
        />
      </div>
    </Panel>
  );
}

function MoodFace({ mood }: { mood: number }) {
  const mouth =
    mood === -2
      ? "M8 17c1.2-2.4 6.8-2.4 8 0"
      : mood === -1
        ? "M8 16.5c1.2-1.4 6.8-1.4 8 0"
        : mood === 1
          ? "M8 14.5c1.2 1.4 6.8 1.4 8 0"
          : "M7.5 14c1.4 2.6 7.6 2.6 9 0";
  return (
    <svg viewBox="0 0 24 24" className="size-7" aria-hidden="true" fill="none">
      <circle cx="12" cy="12" r="9.2" stroke="currentColor" strokeWidth="1.3" />
      <circle cx="9" cy="10" r="1.05" fill="currentColor" />
      <circle cx="15" cy="10" r="1.05" fill="currentColor" />
      <path d={mouth} stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function VitalsPanel({
  className = "",
  weight,
  onWeight,
}: {
  className?: string;
  weight: number;
  onWeight: (value: number) => void;
}) {
  const [height, setHeight] = useState(121);
  const bmi = height > 0 ? (weight / (height / 100) ** 2).toFixed(1) : "—";

  return (
    <Panel title="Growth, vitals & alerts" icon={HeartPulse} className={className}>
      <div className="grid gap-2 sm:grid-cols-3">
        <NumberField id="pedo-weight-top" label="Weight" unit="kg" value={weight} onChange={onWeight} />
        <NumberField id="pedo-height" label="Height" unit="cm" value={height} onChange={setHeight} />
        <MiniStat label="BMI" value={bmi} />
        <MiniStat label="Temperature" value="36.7 °C" />
        <MiniStat label="Pulse" value="92 bpm" />
        <MiniStat label="SpO₂" value="99 %" />
      </div>

      <div className="mt-3 space-y-2">
        <StatusLine label="Asthma status" value="Controlled" tone="success" />
        <StatusLine label="Inhaler available" value="Yes" tone="success" />
        <StatusLine label="Latest bitewing x-ray" value="Available" tone="info" />
      </div>

      <Button
        size="sm"
        variant="outline"
        className="mt-3 w-full"
        onClick={() => toast.info("Imaging request is ready for clinical integration.")}
      >
        <Images className="size-4" /> Request imaging
      </Button>
    </Panel>
  );
}

function StatusLine({ label, value, tone }: { label: string; value: string; tone: "success" | "info" }) {
  return (
    <div className="flex items-center justify-between gap-2 rounded-lg border border-border bg-muted/30 px-2.5 py-2">
      <span className="text-[10px] font-bold text-muted-foreground uppercase">{label}</span>
      <span className={`inline-flex items-center gap-1 text-[11px] font-bold ${tone === "success" ? "text-accent" : "text-primary"}`}>
        <CheckCircle2 className="size-3.5" /> {value}
      </span>
    </div>
  );
}

function GuardianConsentPanel({
  className = "",
  verified,
  onVerify,
}: {
  className?: string;
  verified: boolean;
  onVerify: () => void;
}) {
  const [consents, setConsents] = useState<Record<string, boolean>>({
    examination: true,
    restorative: false,
    sedation: false,
    photos: false,
  });

  const toggle = (key: string) => setConsents((current) => ({ ...current, [key]: !current[key] }));

  return (
    <Panel title="Guardian verification & consent" icon={FileSignature} className={className}>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Guardian name" defaultValue="Sara Thompson" />
        <Field label="Relationship" defaultValue="Mother" />
        <Field label="ID / Emirates ID" defaultValue="784-1988-2213045-7" />
        <Field label="Contact number" defaultValue="+971 50 234 8102" />
      </div>

      <div className="mt-3 space-y-2 rounded-lg border border-border bg-muted/40 p-3">
        <ConsentRow label="Examination & radiographs" checked={consents["examination"] ?? false} onChange={() => toggle("examination")} />
        <ConsentRow label="Restorative treatment & local anaesthesia" checked={consents["restorative"] ?? false} onChange={() => toggle("restorative")} />
        <ConsentRow label="Nitrous oxide / sedation" checked={consents["sedation"] ?? false} onChange={() => toggle("sedation")} />
        <ConsentRow label="Clinical photographs for records" checked={consents["photos"] ?? false} onChange={() => toggle("photos")} />
      </div>

      <div className="mt-3 flex items-center justify-between gap-3 rounded-lg border border-border p-3">
        <div>
          <p className="text-xs font-semibold">Identity verification</p>
          <p className="text-[10px] text-muted-foreground">
            {verified ? "Guardian identity verified at reception" : "Awaiting guardian ID verification"}
          </p>
        </div>
        <Button
          size="sm"
          variant={verified ? "outline" : "default"}
          onClick={() => {
            onVerify();
            toast.success("Guardian identity verified");
          }}
        >
          <ShieldCheck className="size-4" /> {verified ? "Verified" : "Verify guardian"}
        </Button>
      </div>
    </Panel>
  );
}

type DentitionView = "Primary" | "Mixed" | "Permanent";

function Odontogram({
  patientId,
  onMarkedCount,
  onFindings,
}: {
  patientId: string;
  onMarkedCount: (count: number) => void;
  onFindings: (findings: ChartFinding[]) => void;
}) {
  const queryClient = useQueryClient();
  const loadChart = useServerFn(getToothChart);
  const persistChange = useServerFn(saveToothChange);
  const clearChart = useServerFn(resetToothChart);

  const [states, setStates] = useState<Record<string, ToothState>>(INITIAL_STATES);
  const [surfaces, setSurfaces] = useState<Record<string, SurfaceMap>>(INITIAL_SURFACES);
  const [selected, setSelected] = useState<ToothState>("Caries");
  const [mode, setMode] = useState<MarkMode>("Surface");
  const [surfaceFinding, setSurfaceFinding] = useState<SurfaceFinding>("Caries");
  const [activeTooth, setActiveTooth] = useState<string | null>("54");
  const [view, setView] = useState<DentitionView>("Mixed");
  const [hovered, setHovered] = useState<string | null>(null);
  const hydrated = useRef(false);

  const chartQuery = useQuery({
    queryKey: ["tooth-chart", patientId],
    queryFn: () => loadChart({ data: { patientId } }),
  });

  useEffect(() => {
    if (hydrated.current || !chartQuery.data) return;
    hydrated.current = true;
    const entries = chartQuery.data.entries;
    if (entries.length === 0) return;
    const nextStates: Record<string, ToothState> = {};
    const nextSurfaces: Record<string, SurfaceMap> = {};
    for (const entry of entries) {
      nextStates[entry.tooth] = entry.toothState as ToothState;
      if (Object.keys(entry.surfaces).length > 0) {
        nextSurfaces[entry.tooth] = entry.surfaces as SurfaceMap;
      }
    }
    setStates(nextStates);
    setSurfaces(nextSurfaces);
  }, [chartQuery.data]);

  const saveMutation = useMutation({
    mutationFn: persistChange,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["tooth-chart", patientId] });
    },
    onError: (error: Error) => toast.error(error.message || "Could not save this change"),
  });

  const stateOf = (tooth: string) => states[tooth] ?? "Sound";
  const surfacesOf = (tooth: string): SurfaceMap => surfaces[tooth] ?? {};

  const persist = (
    tooth: string,
    toothState: ToothState,
    toothSurfaces: SurfaceMap,
    changes: Array<{ surface: string | null; action: string; previousValue: string | null; newValue: string | null }>,
  ) => {
    saveMutation.mutate({
      data: {
        patientId,
        tooth,
        toothState,
        surfaces: toothSurfaces as Record<string, string>,
        changes,
      },
    });
  };

  const setTooth = (tooth: string, next: ToothState, options?: { persist?: boolean }) => {
    const previous = stateOf(tooth);
    const updated = { ...states, [tooth]: next };
    setStates(updated);
    onMarkedCount(Object.values(updated).filter((value) => value !== "Sound").length);
    if (options?.persist !== false) {
      persist(tooth, next, surfacesOf(tooth), [
        { surface: null, action: "Tooth condition updated", previousValue: previous, newValue: next },
      ]);
    }
  };

  const handleToothClick = (tooth: string) => {
    setActiveTooth(tooth);
    if (mode === "Whole tooth") setTooth(tooth, selected);
  };

  const toggleSurface = (code: SurfaceCode) => {
    if (!activeTooth) return;
    const current = surfacesOf(activeTooth);
    const previous = current[code] ?? null;
    const next: SurfaceMap = { ...current };
    let action = "Surface finding recorded";
    if (next[code] === surfaceFinding) {
      delete next[code];
      action = "Surface finding cleared";
      toast.info(`Cleared ${code} surface on tooth ${activeTooth}`);
    } else {
      next[code] = surfaceFinding;
      toast.success(`${surfaceFinding} recorded on tooth ${activeTooth} (${code})`);
    }
    setSurfaces({ ...surfaces, [activeTooth]: next });

    let nextState = stateOf(activeTooth);
    if (Object.keys(next).length > 0 && nextState === "Sound") {
      nextState =
        surfaceFinding === "Restoration"
          ? "Restored"
          : surfaceFinding === "Sealant"
            ? "Sealant"
            : surfaceFinding === "Missing"
              ? "Missing"
              : surfaceFinding === "Fracture"
                ? "Trauma"
                : "Caries";
      setTooth(activeTooth, nextState, { persist: false });
    }
    persist(activeTooth, nextState, next, [
      { surface: code, action, previousValue: previous, newValue: next[code] ?? null },
    ]);
  };

  const clearTooth = () => {
    if (!activeTooth) return;
    const next = { ...surfaces };
    delete next[activeTooth];
    setSurfaces(next);
    setTooth(activeTooth, "Sound", { persist: false });
    persist(activeTooth, "Sound", {}, [
      { surface: null, action: "Tooth cleared", previousValue: stateOf(activeTooth), newValue: "Sound" },
    ]);
    toast.info(`Tooth ${activeTooth} cleared`);
  };

  const findings = useMemo<ChartFinding[]>(() => {
    const teeth = new Set([...Object.keys(states), ...Object.keys(surfaces)]);
    return [...teeth]
      .map((tooth) => ({
        tooth,
        toothState: states[tooth] ?? "Sound",
        surfaces: (surfaces[tooth] ?? {}) as Record<string, string>,
      }))
      .filter((row) => row.toothState !== "Sound" || Object.keys(row.surfaces).length > 0)
      .sort((a, b) => Number(a.tooth) - Number(b.tooth));
  }, [states, surfaces]);

  useEffect(() => {
    onFindings(findings);
  }, [findings, onFindings]);

  const cycleState = (tooth: string) => {
    const index = TOOTH_CYCLE.indexOf(stateOf(tooth));
    setTooth(tooth, TOOTH_CYCLE[(index + 1) % TOOTH_CYCLE.length] ?? "Sound");
  };

  const counts = useMemo(() => {
    const values = Object.entries(states);
    const primary = values.filter(([tooth]) => Number(tooth) >= 51);
    const permanent = values.filter(([tooth]) => Number(tooth) < 51);
    const score = (rows: Array<[string, ToothState]>) =>
      rows.filter(([, state]) => state === "Caries" || state === "Restored" || state === "Crown" || state === "Missing").length;
    return {
      decayed: values.filter(([, state]) => state === "Caries").length,
      filled: values.filter(([, state]) => state === "Restored" || state === "Crown").length,
      missing: values.filter(([, state]) => state === "Missing").length,
      dmft: score(primary),
      DMFT: score(permanent),
      surfaces: Object.values(surfaces).reduce((total, map) => total + Object.keys(map).length, 0),
    };
  }, [states, surfaces]);

  const showPrimary = view !== "Permanent";
  const showPermanent = view !== "Primary";

  return (
    <Panel
      title="Mixed-dentition odontogram — FDI numbering"
      icon={Smile}
      action="Reset chart"
      onAction={() => {
        setStates(INITIAL_STATES);
        setSurfaces(INITIAL_SURFACES);
        onMarkedCount(Object.keys(INITIAL_STATES).length);
        clearChart({ data: { patientId } })
          .then(() => {
            void queryClient.invalidateQueries({ queryKey: ["tooth-chart", patientId] });
            toast.info("Odontogram reset to the baseline chart");
          })
          .catch((error: Error) => toast.error(error.message || "Could not reset the chart"));
      }}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex rounded-lg border border-border bg-muted/40 p-1">
          {(["Primary", "Mixed", "Permanent"] as DentitionView[]).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setView(option)}
              className={`rounded-md px-3 py-1.5 text-[11px] font-bold transition-all ${
                view === option ? "bg-primary text-primary-foreground shadow-panel" : "text-muted-foreground hover:text-primary"
              }`}
            >
              {option} dentition
            </button>
          ))}
        </div>
        <div className="inline-flex rounded-lg border border-border bg-muted/40 p-1">
          {(["Surface", "Whole tooth"] as MarkMode[]).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setMode(option)}
              className={`rounded-md px-3 py-1.5 text-[11px] font-bold transition-all ${
                mode === option ? "bg-primary text-primary-foreground shadow-panel" : "text-muted-foreground hover:text-primary"
              }`}
            >
              {option} mode
            </button>
          ))}
        </div>
        <div className={`flex flex-wrap items-center gap-1.5 ${mode === "Surface" ? "opacity-50" : ""}`}>
          <span className="text-[10px] font-bold text-muted-foreground uppercase">Mark condition</span>
          {TOOTH_CYCLE.filter((state) => state !== "Sound").map((state) => (
            <button
              key={state}
              type="button"
              onClick={() => setSelected(state)}
              className={`inline-flex items-center gap-1.5 rounded-lg border px-2 py-1.5 text-[10px] font-bold transition-all ${
                TOOTH_STYLE[state].chip
              } ${selected === state ? "ring-2 ring-ring ring-offset-1 ring-offset-background" : ""}`}
            >
              <ToothGlyph state={state} className="size-3.5" />
              {state}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-12">
        <div className="space-y-4 overflow-x-auto xl:col-span-9">
          {showPermanent && (
            <ToothArchRow
              label="Maxillary (upper) — permanent"
              groups={[PERMANENT_UPPER_RIGHT, PERMANENT_UPPER_LEFT]}
              numbersOnTop
              stateOf={stateOf}
              surfacesOf={surfacesOf}
              activeTooth={activeTooth}
              hovered={hovered}
              onHover={setHovered}
              onClick={handleToothClick}
              onDouble={cycleState}
            />
          )}
          {showPrimary && (
            <ToothArchRow
              label="Maxillary (upper) — primary"
              groups={[PRIMARY_UPPER_RIGHT, PRIMARY_UPPER_LEFT]}
              numbersOnTop
              small
              stateOf={stateOf}
              surfacesOf={surfacesOf}
              activeTooth={activeTooth}
              hovered={hovered}
              onHover={setHovered}
              onClick={handleToothClick}
              onDouble={cycleState}
            />
          )}
          <div className="flex items-center gap-2 py-1">
            <span className="h-px flex-1 bg-border" />
            <span className="text-[9px] font-bold tracking-widest text-muted-foreground uppercase">occlusal plane</span>
            <span className="h-px flex-1 bg-border" />
          </div>
          {showPrimary && (
            <ToothArchRow
              label="Mandibular (lower) — primary"
              groups={[PRIMARY_LOWER_RIGHT, PRIMARY_LOWER_LEFT]}
              small
              stateOf={stateOf}
              surfacesOf={surfacesOf}
              activeTooth={activeTooth}
              hovered={hovered}
              onHover={setHovered}
              onClick={handleToothClick}
              onDouble={cycleState}
            />
          )}
          {showPermanent && (
            <ToothArchRow
              label="Mandibular (lower) — permanent"
              groups={[PERMANENT_LOWER_RIGHT, PERMANENT_LOWER_LEFT]}
              stateOf={stateOf}
              surfacesOf={surfacesOf}
              activeTooth={activeTooth}
              hovered={hovered}
              onHover={setHovered}
              onClick={handleToothClick}
              onDouble={cycleState}
            />
          )}
        </div>

        <aside className="rounded-lg border border-border bg-muted/30 p-3 xl:col-span-3">
          <p className="text-[10px] font-bold text-muted-foreground uppercase">Legend</p>
          <ul className="mt-2 space-y-1.5">
            {TOOTH_CYCLE.map((state) => (
              <li key={state} className="flex items-center gap-2 text-[11px] font-semibold">
                <ToothGlyph state={state} className="size-4" />
                {state === "Sound" ? "Sound / erupted" : state === "Pulp" ? "Pulp therapy" : state === "Crown" ? "Stainless steel crown" : state}
              </li>
            ))}
          </ul>
          <div className="mt-3 rounded-lg border border-border bg-card/70 p-2.5">
            <p className="text-[9px] font-bold text-muted-foreground uppercase">Selected tool</p>
            <p className="mt-0.5 flex items-center gap-1.5 text-xs font-bold text-primary">
              {mode === "Surface" ? `${surfaceFinding} · surface` : <><ToothGlyph state={selected} className="size-4" /> {selected}</>}
            </p>
            {hovered && <p className="mt-1 text-[10px] text-muted-foreground">Tooth {hovered} · {stateOf(hovered)}</p>}
          </div>
          <div className="mt-3">
            <SurfaceEditor
              tooth={activeTooth}
              state={activeTooth ? stateOf(activeTooth) : "Sound"}
              surfaces={activeTooth ? surfacesOf(activeTooth) : {}}
              finding={surfaceFinding}
              onFindingChange={setSurfaceFinding}
              onSurfaceClick={toggleSurface}
              onClear={clearTooth}
            />
          </div>
        </aside>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-6">
        <MiniStat label="Surfaces marked" value={`${counts.surfaces}`} />
        <MiniStat label="Decayed" value={`${counts.decayed}`} />
        <MiniStat label="Filled / crowned" value={`${counts.filled}`} />
        <MiniStat label="Missing" value={`${counts.missing}`} />
        <MiniStat label="dmft (primary)" value={`${counts.dmft}`} />
        <MiniStat label="DMFT (permanent)" value={`${counts.DMFT}`} />
      </div>
      <p className="mt-2 text-[10px] text-muted-foreground">
        Surface mode: click a tooth, then mark caries, restorations, sealants, fractures or missing surfaces on the surface map.
        Whole-tooth mode: click a tooth to apply the selected condition; double-click cycles through all findings.
      </p>
    </Panel>
  );
}

function ToothArchRow({
  label,
  groups,
  stateOf,
  surfacesOf,
  activeTooth,
  hovered,
  onHover,
  onClick,
  onDouble,
  small = false,
  numbersOnTop = false,
}: {
  label: string;
  groups: string[][];
  stateOf: (tooth: string) => ToothState;
  surfacesOf: (tooth: string) => SurfaceMap;
  activeTooth: string | null;
  hovered: string | null;
  onHover: (tooth: string | null) => void;
  onClick: (tooth: string) => void;
  onDouble: (tooth: string) => void;
  small?: boolean;
  numbersOnTop?: boolean;
}) {
  return (
    <div>
      <p className="mb-1.5 text-[10px] font-bold text-muted-foreground uppercase">{label}</p>
      <div className="flex min-w-max items-end gap-4">
        {groups.map((group, groupIndex) => (
          <div key={`${label}-${groupIndex}`} className="flex items-end gap-0.5">
            {groupIndex === 1 && <span className="mx-1 h-12 w-px self-center bg-border" />}
            {group.map((tooth) => {
              const state = stateOf(tooth);
              const surfaces = surfacesOf(tooth);
              const surfaceCount = Object.keys(surfaces).length;
              return (
                <button
                  key={tooth}
                  type="button"
                  aria-label={`Tooth ${tooth} — ${state}${surfaceCount ? `, ${surfaceCount} surfaces marked` : ""}`}
                  onClick={() => onClick(tooth)}
                  onDoubleClick={() => onDouble(tooth)}
                  onMouseEnter={() => onHover(tooth)}
                  onMouseLeave={() => onHover(null)}
                  className={`flex flex-col items-center gap-0.5 rounded-lg px-1 py-1 transition-all ${
                    numbersOnTop ? "flex-col-reverse" : ""
                  } ${
                    activeTooth === tooth
                      ? "bg-primary/10 ring-2 ring-primary"
                      : hovered === tooth
                        ? "bg-secondary/60 ring-2 ring-ring"
                        : "hover:bg-secondary/40"
                  }`}
                >
                  <ToothGlyph state={state} surfaces={surfaces} className={small ? "size-6" : "size-7"} />
                  <span
                    className={`text-[10px] font-bold ${
                      state === "Caries" ? "text-destructive" : state === "Sound" ? "text-muted-foreground" : "text-primary"
                    }`}
                  >
                    {tooth}
                  </span>
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

const SURFACE_DOT: Record<SurfaceCode, { x: number; y: number }> = {
  B: { x: 12, y: 7.5 },
  M: { x: 6.5, y: 14 },
  O: { x: 12, y: 14 },
  D: { x: 17.5, y: 14 },
  L: { x: 12, y: 21 },
};

function ToothGlyph({
  state,
  className = "size-8",
  surfaces,
}: {
  state: ToothState;
  className?: string;
  surfaces?: SurfaceMap;
}) {
  const style = TOOTH_STYLE[state];
  const marks = surfaces ? (Object.entries(surfaces) as Array<[SurfaceCode, SurfaceFinding]>) : [];
  return (
    <svg viewBox="0 0 24 28" className={className} aria-hidden="true">
      <path
        d="M12 2.2C8.1 2.2 4.2 4.2 4.2 9c0 3 .9 5 1.5 8 .5 2.6.6 8.4 2.5 8.4 1.6 0 1.5-5.2 3.8-5.2s2.2 5.2 3.8 5.2c1.9 0 2-5.8 2.5-8.4.6-3 1.5-5 1.5-8 0-4.8-3.9-6.8-7.8-6.8Z"
        fill={style.fill}
        stroke={style.stroke}
        strokeWidth="1.4"
        strokeLinejoin="round"
        strokeDasharray={state === "Erupting" ? "3 2" : undefined}
      />
      {marks.length === 0 && state !== "Sound" && state !== "Erupting" && (
        <text
          x="12"
          y="15.5"
          textAnchor="middle"
          fontSize={style.short.length > 1 ? "6" : "8"}
          fontWeight="700"
          fill={style.stroke}
        >
          {style.short}
        </text>
      )}
      {marks.map(([code, finding]) => (
        <circle
          key={code}
          cx={SURFACE_DOT[code].x}
          cy={SURFACE_DOT[code].y}
          r={2.3}
          fill={SURFACE_STYLE[finding].solid}
          stroke="var(--card)"
          strokeWidth="0.7"
        />
      ))}
    </svg>
  );
}

function SurfaceEditor({
  tooth,
  state,
  surfaces,
  finding,
  onFindingChange,
  onSurfaceClick,
  onClear,
}: {
  tooth: string | null;
  state: ToothState;
  surfaces: SurfaceMap;
  finding: SurfaceFinding;
  onFindingChange: (finding: SurfaceFinding) => void;
  onSurfaceClick: (code: SurfaceCode) => void;
  onClear: () => void;
}) {
  const shapes: Record<SurfaceCode, string> = {
    B: "0,0 120,0 90,30 30,30",
    L: "0,120 120,120 90,90 30,90",
    M: "0,0 30,30 30,90 0,120",
    D: "120,0 90,30 90,90 120,120",
    O: "30,30 90,30 90,90 30,90",
  };
  return (
    <div className="rounded-lg border border-border bg-card/70 p-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[10px] font-bold text-muted-foreground uppercase">Tooth surfaces</p>
        {tooth && (
          <button type="button" onClick={onClear} className="text-[10px] font-bold text-primary hover:underline">
            Clear tooth
          </button>
        )}
      </div>
      <p className="mt-0.5 text-xs font-bold text-primary">
        {tooth ? `Tooth ${tooth} · ${state}` : "Select a tooth in surface mode"}
      </p>

      <div className="mt-2 flex flex-wrap gap-1.5">
        {SURFACE_FINDINGS.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => onFindingChange(option)}
            className={`rounded-lg border px-2 py-1 text-[10px] font-bold transition-all ${SURFACE_STYLE[option].chip} ${
              finding === option ? "ring-2 ring-ring ring-offset-1 ring-offset-background" : ""
            }`}
          >
            {option}
          </button>
        ))}
      </div>

      <svg viewBox="-2 -2 124 124" className="mx-auto mt-3 w-40" role="group" aria-label={`Surface map for tooth ${tooth ?? "none"}`}>
        {SURFACES.map(({ code, label }) => {
          const mark = surfaces[code];
          return (
            <g key={code}>
              <polygon
                points={shapes[code]}
                fill={mark ? SURFACE_STYLE[mark].fill : "var(--card)"}
                stroke={mark ? SURFACE_STYLE[mark].solid : "var(--border)"}
                strokeWidth="1.6"
                className={tooth ? "cursor-pointer" : "opacity-60"}
                onClick={() => tooth && onSurfaceClick(code)}
                aria-label={`${label} surface${mark ? ` — ${mark}` : ""}`}
              />
            </g>
          );
        })}
        <text x="60" y="18" textAnchor="middle" fontSize="9" fontWeight="700" fill="var(--muted-foreground)" pointerEvents="none">B</text>
        <text x="60" y="110" textAnchor="middle" fontSize="9" fontWeight="700" fill="var(--muted-foreground)" pointerEvents="none">L</text>
        <text x="12" y="63" textAnchor="middle" fontSize="9" fontWeight="700" fill="var(--muted-foreground)" pointerEvents="none">M</text>
        <text x="108" y="63" textAnchor="middle" fontSize="9" fontWeight="700" fill="var(--muted-foreground)" pointerEvents="none">D</text>
        <text x="60" y="64" textAnchor="middle" fontSize="10" fontWeight="700" fill="var(--muted-foreground)" pointerEvents="none">O</text>
      </svg>

      <ul className="mt-2 space-y-1">
        {SURFACES.map(({ code, label }) => (
          <li key={code} className="flex items-center justify-between text-[10px] font-semibold">
            <span className="text-muted-foreground">{label}</span>
            <span className={surfaces[code] ? "text-primary" : "text-muted-foreground/70"}>{surfaces[code] ?? "—"}</span>
          </li>
        ))}
      </ul>
      <p className="mt-2 text-[10px] text-muted-foreground">
        Click a surface to mark it with the selected finding; click it again to clear that surface.
      </p>
    </div>
  );
}

function CariesRiskPanel({ className = "", onScore }: { className?: string; onScore: (score: number) => void }) {
  const [checked, setChecked] = useState<Record<string, boolean>>({
    "caries-history": true,
    "night-bottle": true,
    "visible-plaque": true,
  });

  const score = CARIES_FACTORS.reduce((total, factor) => (checked[factor.id] ? total + factor.weight : total), 0);
  const level = score >= 7 ? "High" : score >= 4 ? "Moderate" : "Low";
  const tone = level === "High" ? "text-destructive" : level === "Moderate" ? "text-chart-4" : "text-accent";
  const barTone = level === "High" ? "bg-destructive" : level === "Moderate" ? "bg-chart-4" : "bg-accent";

  const toggle = (id: string) => {
    const updated = { ...checked, [id]: !checked[id] };
    setChecked(updated);
    onScore(CARIES_FACTORS.reduce((total, factor) => (updated[factor.id] ? total + factor.weight : total), 0));
  };

  return (
    <Panel id="chart-risk" title="Caries-risk & protective factors" icon={AlertTriangle} className={className}>
      <div className="space-y-2">
        {CARIES_FACTORS.map((factor) => (
          <div key={factor.id} className="flex items-center justify-between gap-2">
            <ConsentRow label={factor.label} checked={checked[factor.id] ?? false} onChange={() => toggle(factor.id)} />
            <span className="shrink-0 rounded-full border border-border bg-muted/50 px-1.5 text-[9px] font-bold text-muted-foreground">
              +{factor.weight}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-3 rounded-lg border border-border bg-muted/40 p-3">
        <div className="flex items-center justify-between">
          <p className="text-[9px] font-bold text-muted-foreground uppercase">Overall caries risk</p>
          <span className={`font-display text-lg font-extrabold ${tone}`}>{level} risk</span>
        </div>
        <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-secondary/60">
          <div className={`h-full rounded-full transition-all ${barTone}`} style={{ width: `${(score / 14) * 100}%` }} />
        </div>
        <div className="mt-1 flex justify-between text-[9px] font-semibold text-muted-foreground">
          <span>Low</span>
          <span>Moderate</span>
          <span>High</span>
        </div>
        <p className="mt-1.5 text-[10px] text-muted-foreground">{score} of 14 risk points recorded</p>
      </div>
      <p className="mt-2 text-[10px] text-muted-foreground">
        High risk triggers a 3-month recall, fluoride varnish every 3 months and sealant placement.
      </p>
    </Panel>
  );
}

function PreventivePlanPanel({ className = "" }: { className?: string }) {
  const [tasks, setTasks] = useState(PREVENTIVE_TASKS);
  const done = tasks.filter((task) => task.done).length;

  return (
    <Panel id="chart-prevention" title="Preventive dental-care plan" icon={Sparkles} className={className}>
      <div className="space-y-2">
        {tasks.map((task) => (
          <ConsentRow
            key={task.id}
            label={task.label}
            checked={task.done}
            onChange={() =>
              setTasks((current) => current.map((item) => (item.id === task.id ? { ...item, done: !item.done } : item)))
            }
          />
        ))}
      </div>
      <div className="mt-3 rounded-lg border border-border bg-muted/40 p-3">
        <div className="flex items-center justify-between text-[10px] font-bold text-muted-foreground uppercase">
          <span>Prevention progress</span>
          <span className="text-primary">
            {done} / {tasks.length}
          </span>
        </div>
        <div className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-secondary/60">
          <div className="h-full rounded-full bg-clinical transition-all" style={{ width: `${(done / tasks.length) * 100}%` }} />
        </div>
      </div>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <MiniStat label="Next recall" value="3 months" />
        <MiniStat label="Fluoride varnish" value="Applied today" />
      </div>
      <Button size="sm" className="mt-3 w-full" onClick={() => toast.success("Preventive care recorded")}>
        <ShieldCheck className="size-4" /> Record prevention
      </Button>
    </Panel>
  );
}

function DiagnosisPlanPanel({ className = "" }: { className?: string }) {
  const [rows, setRows] = useState(TREATMENT_PLAN.map((row) => [...row]));
  const [tooth, setTooth] = useState("");
  const [procedure, setProcedure] = useState("");
  const [anaesthesia, setAnaesthesia] = useState("Local anaesthesia");
  const [visit, setVisit] = useState("Visit 1");

  const addRow = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const cleanTooth = tooth.trim();
    const cleanProcedure = procedure.trim();
    if (!cleanTooth || !cleanProcedure) return;
    setRows((current) => [[cleanTooth, cleanProcedure, anaesthesia, visit, "Planned"], ...current]);
    setTooth("");
    setProcedure("");
    toast.success("Treatment step added to the pediatric plan");
  };

  return (
    <Panel id="chart-plan" title="Pediatric diagnosis & treatment plan" icon={Stethoscope} className={className}>
      <div className="grid gap-2 sm:grid-cols-2">
        <MiniStat label="Primary diagnosis" value="Early childhood caries (K02.51)" />
        <MiniStat label="Secondary" value="Pulpitis 75 (K04.0), plaque-induced gingivitis (K05.00)" />
      </div>

      <div className="mt-3">
        <ChartTable headings={["Tooth", "Procedure", "Anaesthesia", "Sequence", "Status"]} rows={rows} />
      </div>

      <form onSubmit={addRow} className="mt-3 grid gap-2 sm:grid-cols-5">
        <Input
          aria-label="Tooth"
          placeholder="Tooth (FDI)"
          value={tooth}
          onChange={(event) => setTooth(event.target.value)}
          className="h-9 text-xs"
        />
        <Input
          aria-label="Procedure"
          placeholder="Procedure"
          value={procedure}
          onChange={(event) => setProcedure(event.target.value)}
          className="h-9 text-xs sm:col-span-2"
        />
        <Select value={anaesthesia} onValueChange={setAnaesthesia}>
          <SelectTrigger aria-label="Anaesthesia" className="h-9 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="No anaesthesia">No anaesthesia</SelectItem>
            <SelectItem value="Topical only">Topical only</SelectItem>
            <SelectItem value="Local anaesthesia">Local anaesthesia</SelectItem>
            <SelectItem value="Nitrous oxide">Nitrous oxide</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex gap-2">
          <Select value={visit} onValueChange={setVisit}>
            <SelectTrigger aria-label="Visit sequence" className="h-9 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Visit 1">Visit 1</SelectItem>
              <SelectItem value="Visit 2">Visit 2</SelectItem>
              <SelectItem value="Visit 3">Visit 3</SelectItem>
            </SelectContent>
          </Select>
          <Button type="submit" size="sm" className="h-9 shrink-0">
            <Plus className="size-4" />
          </Button>
        </div>
      </form>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-muted/40 p-3">
        <MiniStat label="Estimated patient share" value="AED 250" />
        <MiniStat label="Approval" value="Not required" />
        <Button size="sm" variant="outline" onClick={() => toast.info("Estimate generation is ready for clinical integration.")}>
          Generate estimate
        </Button>
      </div>
    </Panel>
  );
}

function MedicationSafetyPanel({
  className = "",
  weight,
  onWeight,
}: {
  className?: string;
  weight: number;
  onWeight: (value: number) => void;
}) {
  const doses = [
    { drug: "Paracetamol", perKg: 15, max: 1000, unit: "mg", frequency: "every 6 h", note: "Max 4 doses in 24 h" },
    { drug: "Ibuprofen", perKg: 10, max: 400, unit: "mg", frequency: "every 8 h", note: "With food, avoid if dehydrated" },
    { drug: "Amoxicillin", perKg: 25, max: 500, unit: "mg", frequency: "every 8 h", note: "Check penicillin allergy first" },
    { drug: "Lidocaine 2%", perKg: 4.4, max: 300, unit: "mg", frequency: "per appointment", note: "Maximum safe anaesthetic dose" },
  ];

  return (
    <Panel id="chart-medication" title="Weight-based medication safety" icon={Pill} className={className}>
      <div className="grid gap-3 sm:grid-cols-3">
        <NumberField id="pedo-weight" label="Body weight" unit="kg" value={weight} onChange={onWeight} />
        <MiniStat label="Allergy alert" value="Verify before prescribing" />
        <MiniStat label="Antibiotic policy" value="No routine prophylaxis" />
      </div>

      <div className="mt-3 space-y-2">
        {doses.map((dose) => {
          const raw = dose.perKg * weight;
          const capped = raw > dose.max;
          const value = Math.min(Math.round(raw), dose.max);
          return (
            <div key={dose.drug} className="rounded-lg border border-border bg-card/70 p-2.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs font-bold">{dose.drug}</p>
                <p className="text-xs font-bold text-primary">
                  {value} {dose.unit}
                  <span className="ml-1 text-[10px] font-semibold text-muted-foreground">{dose.frequency}</span>
                  {capped && (
                    <span className="ml-1.5 rounded-full bg-chart-4/15 px-1.5 text-[9px] font-bold text-chart-4">capped</span>
                  )}
                </p>
              </div>
              <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-secondary/60">
                <div
                  className={`h-full rounded-full transition-all ${capped ? "bg-destructive" : "bg-clinical"}`}
                  style={{ width: `${Math.min(100, (raw / dose.max) * 100)}%` }}
                />
              </div>
              <p className="mt-1 text-[10px] text-muted-foreground">
                {dose.perKg} {dose.unit}/kg · max {dose.max} {dose.unit} · {dose.note}
              </p>
            </div>
          );
        })}
      </div>
      <p className="mt-2 text-[10px] text-muted-foreground">
        Doses are calculated from the recorded weight and capped at the pediatric maximum. Confirm allergies and renal history
        before prescribing.
      </p>
    </Panel>
  );
}

function FollowUpPanel({ className = "" }: { className?: string }) {
  const [date, setDate] = useState("2026-12-21");
  const [reason, setReason] = useState("Fluoride varnish & sealant review");

  return (
    <Panel title="Parent instructions & follow-up" icon={CalendarClock} className={className}>
      <ul className="space-y-2">
        {PARENT_INSTRUCTIONS.map((instruction) => (
          <li key={instruction} className="flex gap-2 text-[11px] text-muted-foreground">
            <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-accent" />
            <span>{instruction}</span>
          </li>
        ))}
      </ul>

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="pedo-followup-date" className="text-[10px] font-bold text-muted-foreground uppercase">
            Follow-up date
          </Label>
          <Input
            id="pedo-followup-date"
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
            className="h-9 text-xs"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="pedo-followup-reason" className="text-[10px] font-bold text-muted-foreground uppercase">
            Reason
          </Label>
          <Input
            id="pedo-followup-reason"
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            className="h-9 text-xs"
          />
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <Button size="sm" onClick={() => toast.success(`Follow-up scheduled for ${date}`)}>
          <CalendarClock className="size-4" /> Schedule follow-up
        </Button>
        <Button size="sm" variant="outline" onClick={() => toast.info("Parent instruction sheet is ready for printing.")}>
          <Printer className="size-4" /> Print instructions
        </Button>
        <Button size="sm" variant="outline" onClick={() => toast.info("Care team notification is ready for integration.")}>
          <UsersRound className="size-4" /> Notify care team
        </Button>
      </div>
    </Panel>
  );
}

function Panel({
  id,
  title,
  icon: Icon,
  action,
  onAction,
  className = "",
  children,
}: {
  id?: string;
  title: string;
  icon: typeof Activity;
  action?: string;
  onAction?: () => void;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      {...(id ? { id } : {})}
      className={`overflow-hidden rounded-xl border border-border bg-card/75 ${className}`}
    >
      <header className="flex min-h-10 items-center justify-between gap-2 border-b border-border bg-muted/45 px-3">
        <h2 className="flex items-center gap-2 font-display text-sm font-extrabold text-primary">
          <Icon className="size-4" />
          {title}
        </h2>
        {action && (
          <Button variant="ghost" size="sm" className="h-7 px-2 text-[10px] text-primary" onClick={onAction}>
            {action}
          </Button>
        )}
      </header>
      <div className="p-3">{children}</div>
    </section>
  );
}

function Field({ label, defaultValue }: { label: string; defaultValue: string }) {
  const id = `pedo-${label.toLowerCase().replace(/[^a-z]+/g, "-")}`;
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-[10px] font-bold text-muted-foreground uppercase">
        {label}
      </Label>
      <Input id={id} defaultValue={defaultValue} className="h-9 text-xs" />
    </div>
  );
}

function NumberField({
  id,
  label,
  unit,
  value,
  onChange,
}: {
  id: string;
  label: string;
  unit: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-[10px] font-bold text-muted-foreground uppercase">
        {label} ({unit})
      </Label>
      <Input
        id={id}
        type="number"
        min={1}
        value={value}
        onChange={(event) => onChange(Number(event.target.value) || 0)}
        className="h-9 text-xs"
      />
    </div>
  );
}

function ConsentRow({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) {
  const id = `pedo-check-${label.toLowerCase().replace(/[^a-z]+/g, "-")}`;
  return (
    <div className="flex items-start gap-2.5">
      <Checkbox id={id} checked={checked} onCheckedChange={onChange} className="mt-0.5" />
      <Label htmlFor={id} className="text-[11px] leading-snug font-medium">
        {label}
      </Label>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-card/70 p-2.5">
      <p className="text-[9px] font-bold text-muted-foreground uppercase">{label}</p>
      <p className="mt-0.5 text-xs font-semibold">{value}</p>
    </div>
  );
}

function Flag({ icon: Icon, label, tone }: { icon: typeof AlertTriangle; label: string; tone: "danger" | "warning" | "info" | "success" }) {
  const tones = {
    danger: "border-destructive/25 bg-destructive/5 text-destructive",
    warning: "border-chart-4/30 bg-chart-4/10 text-chart-4",
    info: "border-primary/20 bg-primary/5 text-primary",
    success: "border-accent/25 bg-accent/10 text-accent",
  };
  return (
    <span className={`inline-flex max-w-44 items-center gap-1.5 rounded-lg border px-2.5 py-2 text-[10px] font-bold ${tones[tone]}`}>
      <Icon className="size-3.5 shrink-0" />
      {label}
    </span>
  );
}

function ChartTable({ headings, rows }: { headings: string[]; rows: string[][] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[520px] text-left text-[10px]">
        <thead>
          <tr className="border-b border-border text-muted-foreground">
            {headings.map((heading) => (
              <th key={heading} className="pb-2 font-bold">
                {heading}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border/60">
          {rows.map((row, rowIndex) => (
            <tr key={`${row[0]}-${rowIndex}`}>
              {row.map((cell, index) => (
                <td key={`${rowIndex}-${index}`} className={`py-2 pr-2 ${index === 0 ? "font-semibold" : "text-muted-foreground"}`}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function AiTreatmentSummaryPanel({
  className = "",
  patientId,
  patientName,
  age,
  weight,
  painScore,
  cariesRisk,
  allergies,
  findings,
}: {
  className?: string;
  patientId: string;
  patientName: string;
  age: string;
  weight: number;
  painScore: number;
  cariesRisk: string;
  allergies: string;
  findings: ChartFinding[];
}) {
  const summarize = useServerFn(summarizeToothFindings);
  const [summary, setSummary] = useState("");
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: summarize,
    onSuccess: (result) => {
      if (result.empty) {
        setSummary("");
        toast.info("Mark at least one tooth or surface finding before generating a summary.");
        return;
      }
      setSummary(result.summary);
      toast.success(
        `Draft version ${result.version} ready for review (${
          result.caseSource === "uploaded" ? "clinic case records" : "reference cases"
        }).`,
      );
      void queryClient.invalidateQueries({ queryKey: ["summary-versions"] });
      void queryClient.invalidateQueries({ queryKey: ["chart-overviews"] });
    },
    onError: (error: Error) => toast.error(error.message || "The AI summary could not be generated"),
  });

  return (
    <Panel
      className={className}
      title="AI prioritised treatment summary"
      icon={Sparkles}
      action={mutation.isPending ? "Generating…" : "Generate summary"}
      onAction={() =>
        mutation.mutate({
          data: { patientId, patientName, age, weightKg: weight, painScore, cariesRisk, allergies, findings },
        })
      }
    >
      <p className="text-xs text-muted-foreground">
        Uses the charted tooth-surface findings, pain score, caries risk, weight and allergies to draft a prioritised
        pediatric dental plan. A licensed dentist must confirm every recommendation.
      </p>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {findings.length === 0 ? (
          <span className="text-[11px] text-muted-foreground">No findings charted yet.</span>
        ) : (
          findings.slice(0, 12).map((row) => (
            <span
              key={row.tooth}
              className="rounded-lg border border-border bg-muted/40 px-2 py-1 text-[10px] font-semibold"
            >
              {row.tooth}: {row.toothState}
              {Object.keys(row.surfaces).length > 0 ? ` · ${Object.keys(row.surfaces).join("/")}` : ""}
            </span>
          ))
        )}
      </div>
      <div className="mt-3 min-h-[120px] rounded-lg border border-border bg-muted/25 p-3">
        {mutation.isPending ? (
          <p className="flex items-center gap-2 text-xs text-muted-foreground">
            <Loader2 className="size-3.5 animate-spin" /> Reviewing {findings.length} charted findings…
          </p>
        ) : summary ? (
          <SummaryText text={summary} />
        ) : (
          <p className="text-xs text-muted-foreground">
            Chart your findings, then generate the summary to see urgent care, next visits, prevention and weight-based
            medication notes.
          </p>
        )}
      </div>

      <div className="mt-4 border-t border-border pt-3">
        <p className="text-[10px] font-bold tracking-wide text-muted-foreground uppercase">
          Review &amp; version history
        </p>
        <p className="mt-1 mb-2 text-xs text-muted-foreground">
          A draft only appears in the patient record once a clinician approves it.
        </p>
        <SummaryReviewPanel patientId={patientId} patientName={patientName} />
      </div>
    </Panel>
  );
}

function AuditHistoryPanel({ className = "", patientId }: { className?: string; patientId: string }) {
  const loadChart = useServerFn(getToothChart);
  const query = useQuery({
    queryKey: ["tooth-chart", patientId],
    queryFn: () => loadChart({ data: { patientId } }),
  });

  const audit = query.data?.audit ?? [];

  return (
    <Panel className={className} title="Tooth surface audit history" icon={History}>
      <p className="text-xs text-muted-foreground">Every charted change with the clinician who made it.</p>
      <div className="mt-3 max-h-[320px] space-y-2 overflow-y-auto pr-1">
        {query.isLoading ? (
          <p className="flex items-center gap-2 text-xs text-muted-foreground">
            <Loader2 className="size-3.5 animate-spin" /> Loading history…
          </p>
        ) : audit.length === 0 ? (
          <p className="text-xs text-muted-foreground">No changes recorded for this chart yet.</p>
        ) : (
          audit.map((row) => (
            <div key={row.id} className="rounded-lg border border-border bg-muted/25 p-2.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-bold text-primary">
                  Tooth {row.tooth}
                  {row.surface ? ` · surface ${row.surface}` : ""}
                </span>
                <span className="text-[10px] text-muted-foreground">
                  {new Date(row.changedAt).toLocaleString()}
                </span>
              </div>
              <p className="mt-1 text-[11px] text-muted-foreground">
                {row.action}
                {row.previousValue || row.newValue
                  ? ` — ${row.previousValue ?? "none"} → ${row.newValue ?? "none"}`
                  : ""}
              </p>
              <p className="mt-0.5 text-[10px] font-semibold text-foreground">By {row.changedBy || "Unknown"}</p>
            </div>
          ))
        )}
      </div>
    </Panel>
  );
}
