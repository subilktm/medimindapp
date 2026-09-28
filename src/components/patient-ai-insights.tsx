import { useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  BrainCircuit,
  CalendarClock,
  Check,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  ClipboardList,
  HeartPulse,
  Info,
  Loader2,
  Pill,
  ShieldAlert,
  Sparkles,
  Stethoscope,
  TrendingUp,
} from "lucide-react";
import { toast } from "sonner";

import { SummaryText, useChartOverviews } from "@/components/dental-chart-summary";
import { Button } from "@/components/ui/button";
import type { ClinicalPatient } from "@/lib/clinical-patients";

type Priority = "High" | "Moderate" | "Routine";

type Insight = {
  title: string;
  detail: string;
  action: string;
  priority: Priority;
  icon: typeof AlertTriangle;
};

type PathwayStatus = "Due now" | "Scheduled" | "Monitoring" | "Approved";

type CarePathway = {
  condition: string;
  code: string;
  nextStep: string;
  followUp: string;
  order: string;
  status: PathwayStatus;
  source: string;
};

const PRIORITY_STYLES: Record<Priority, string> = {
  High: "border-destructive/25 bg-destructive/5 text-destructive",
  Moderate: "border-chart-4/30 bg-chart-4/10 text-chart-4",
  Routine: "border-primary/20 bg-primary/5 text-primary",
};

function numericVital(patient: ClinicalPatient, label: string) {
  const value = patient.vitals.find((item) => item.label === label)?.value;
  if (!value) return null;
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function buildInsights(patient: ClinicalPatient): Insight[] {
  const insights: Insight[] = [];
  const pulse = numericVital(patient, "Pulse");
  const temperature = numericVital(patient, "Temperature");
  const oxygen = numericVital(patient, "SpO₂");
  const systolic = numericVital(patient, "Blood pressure");
  const hasRecordedAllergy = patient.allergies.some((allergy) => !allergy.toLowerCase().includes("no known"));

  if (hasRecordedAllergy) {
    insights.push({
      title: "Medication allergy safeguard",
      detail: `${patient.allergies.join(", ")} is recorded. Cross-check every new prescription and procedure order before signing.`,
      action: "Reconcile allergy status and document the reaction before medication administration.",
      priority: "High",
      icon: ShieldAlert,
    });
  }

  if ((oxygen !== null && oxygen <= 94) || (temperature !== null && temperature >= 38)) {
    insights.push({
      title: "Respiratory and infection surveillance",
      detail: `Latest observations include SpO₂ ${oxygen ?? "—"}% and temperature ${temperature ?? "—"}°C. The current pattern warrants reassessment.`,
      action: "Repeat observations, assess respiratory effort and escalate if the trend deteriorates.",
      priority: "High",
      icon: Activity,
    });
  }

  if ((pulse !== null && pulse >= 100) || (systolic !== null && systolic >= 140)) {
    insights.push({
      title: "Cardiovascular monitoring",
      detail: `Pulse ${pulse ?? "—"} bpm and blood pressure ${patient.vitals.find((item) => item.label === "Blood pressure")?.value ?? "—"} mmHg should be interpreted with the active diagnoses and symptoms.`,
      action: "Review the observation trend, symptoms and pending cardiac investigations before changing treatment.",
      priority: "Moderate",
      icon: HeartPulse,
    });
  }

  if (patient.diagnoses.some((diagnosis) => diagnosis.condition.toLowerCase().includes("pain"))) {
    insights.push({
      title: "Pain response check",
      detail: "Post-treatment pain remains active in the problem list and should be correlated with the latest pain score and functional recovery.",
      action: "Reassess pain after treatment and review analgesic effectiveness and tolerability.",
      priority: "Moderate",
      icon: Pill,
    });
  }

  insights.push({
    title: "Care-plan continuity",
    detail: `${patient.nextAction} is the documented next action for the current ${patient.encounter.type.toLowerCase()} encounter.`,
    action: "Confirm completion, record the outcome and update the care plan for the next handover.",
    priority: "Routine",
    icon: ClipboardCheck,
  });

  return insights.slice(0, 4);
}

function summarySection(summary: string, heading: string) {
  const normalized = summary.replace(/\r/g, "");
  const pattern = new RegExp(`(?:^|\\n)#{0,3}\\s*${heading}\\s*\\n([\\s\\S]*?)(?=\\n#{0,3}\\s*(?:Summary|Urgent \\(same visit\\)|Next visits|Preventive plan|Weight-based medication notes|Parent instructions)\\s*\\n|$)`, "i");
  const match = normalized.match(pattern)?.[1]?.trim();
  return match?.replace(/^[-*]\s*/gm, "").replace(/\n+/g, " · ") ?? "Review the approved plan and confirm the next treatment visit.";
}

function pathwayForCondition(condition: string, code: string, nextAction: string): CarePathway {
  const value = condition.toLowerCase();
  if (value.includes("pain")) {
    return { condition, code, nextStep: "Reassess pain score and response to analgesia.", followUp: "25 Sep 2026, 10:00 AM", order: "Pain score and medication review", status: "Due now", source: "Active diagnosis and current care plan" };
  }
  if (value.includes("hypertension")) {
    return { condition, code, nextStep: "Review serial blood-pressure readings before adjusting therapy.", followUp: "08 Oct 2026, 09:30 AM", order: "Blood pressure trend and renal profile", status: "Monitoring", source: "Active diagnosis and latest observations" };
  }
  if (value.includes("dyslipidemia")) {
    return { condition, code, nextStep: "Review lipid targets, adherence and cardiovascular risk.", followUp: "08 Oct 2026, 09:30 AM", order: "Lipid profile · Ordered", status: "Scheduled", source: "Active diagnosis and open orders" };
  }
  if (value.includes("atrial fibrillation")) {
    return { condition, code, nextStep: "Review rhythm, rate control and anticoagulation assessment.", followUp: "25 Sep 2026, 10:00 AM", order: "ECG 12 Lead · Completed", status: "Due now", source: "Active diagnosis and cardiac orders" };
  }
  if (value.includes("syncope")) {
    return { condition, code, nextStep: "Correlate symptoms with rhythm and orthostatic observations.", followUp: "25 Sep 2026, 10:00 AM", order: "ECG and observation trend", status: "Monitoring", source: "Active diagnosis and encounter" };
  }
  if (value.includes("bronchitis") || value.includes("wheezing")) {
    return { condition, code, nextStep: "Repeat respiratory assessment and confirm improvement in oxygenation.", followUp: "25 Sep 2026, 10:00 AM", order: "Chest X-Ray · Completed; repeat SpO₂", status: "Due now", source: "Active diagnosis and latest observations" };
  }
  return { condition, code, nextStep: nextAction, followUp: "08 Oct 2026, 09:30 AM", order: "Clinical review", status: "Scheduled", source: "Active diagnosis and documented next action" };
}

function buildCarePathways(patient: ClinicalPatient, approvedSummary?: string | null, headline?: string | null): CarePathway[] {
  const pathways = patient.diagnoses
    .filter((diagnosis) => diagnosis.status === "Active")
    .map((diagnosis) => pathwayForCondition(diagnosis.condition, diagnosis.code, patient.nextAction));

  if (approvedSummary) {
    pathways.unshift({
      condition: headline || "Approved pediatric dental plan",
      code: "Dental",
      nextStep: summarySection(approvedSummary, "Next visits"),
      followUp: "Dental follow-up · scheduling required",
      order: "Odontogram and attached imaging review",
      status: "Approved",
      source: "Clinician-approved pediatric AI summary",
    });
  }

  return pathways;
}

export function PatientAiInsights({ patient, onOpenRecordItem }: { patient: ClinicalPatient; onOpenRecordItem?: (target: "follow-ups" | "orders") => void }) {
  const overviewQuery = useChartOverviews([patient.id]);
  const [reviewed, setReviewed] = useState<string[]>([]);
  const insights = useMemo(() => buildInsights(patient), [patient]);
  const overview = overviewQuery.data?.overviews[0];
  const highPriority = insights.filter((item) => item.priority === "High").length;
  const activeDiagnoses = patient.diagnoses.filter((item) => item.status === "Active");
  const pathways = useMemo(
    () => buildCarePathways(patient, overview?.summary, overview?.headline),
    [overview?.headline, overview?.summary, patient],
  );

  const markReviewed = (title: string) => {
    setReviewed((items) => (items.includes(title) ? items : [...items, title]));
    toast.success("Clinical insight marked as reviewed");
  };

  return (
    <section className="space-y-4" aria-labelledby="ai-insights-title">
      <div className="overflow-hidden rounded-xl border border-primary/20 bg-card/80 shadow-panel">
        <div className="bg-clinical px-4 py-4 text-primary-foreground sm:px-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-card/15">
                <BrainCircuit className="size-5" />
              </span>
              <div>
                <p className="text-[10px] font-bold uppercase opacity-80">Clinical decision support</p>
                <h2 id="ai-insights-title" className="mt-0.5 font-display text-xl font-extrabold">AI Insights for {patient.name}</h2>
                <p className="mt-1 max-w-3xl text-xs opacity-85">Prioritized signals from the current record, observations, diagnoses, allergies and approved dental plan.</p>
              </div>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-primary-foreground/25 bg-card/10 px-2.5 py-1.5 text-[10px] font-bold">
              <Sparkles className="size-3.5" /> Record reviewed now
            </span>
          </div>
        </div>

        <div className="grid gap-px bg-border sm:grid-cols-4">
          <InsightStat label="Priority alerts" value={`${highPriority}`} icon={ShieldAlert} alert={highPriority > 0} />
          <InsightStat label="Active diagnoses" value={`${activeDiagnoses.length}`} icon={Stethoscope} />
          <InsightStat label="Dental findings" value={`${overview?.findingCount ?? 0}`} icon={Activity} />
          <InsightStat label="Plan status" value={overview?.summary ? "Approved" : (overview?.pendingCount ?? 0) > 0 ? "Review due" : "Not generated"} icon={CheckCircle2} />
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-12">
        <div className="space-y-3 xl:col-span-8">
          <div className="flex items-end justify-between gap-3">
            <div>
              <h3 className="font-display text-base font-extrabold text-primary">Prioritized clinical insights</h3>
              <p className="text-xs text-muted-foreground">Review high-priority items first and confirm each against the full clinical context.</p>
            </div>
            <span className="text-[10px] font-bold text-muted-foreground">{reviewed.length} of {insights.length} reviewed</span>
          </div>

          {insights.map((insight) => {
            const isReviewed = reviewed.includes(insight.title);
            const Icon = insight.icon;
            return (
              <article key={insight.title} className="rounded-xl border border-border bg-card/75 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
                  <span className={`flex size-9 shrink-0 items-center justify-center rounded-lg border ${PRIORITY_STYLES[insight.priority]}`}>
                    <Icon className="size-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="text-sm font-bold">{insight.title}</h4>
                      <span className={`rounded px-2 py-0.5 text-[9px] font-bold uppercase ${PRIORITY_STYLES[insight.priority]}`}>{insight.priority}</span>
                    </div>
                    <p className="mt-1.5 text-xs leading-5 text-muted-foreground">{insight.detail}</p>
                    <div className="mt-3 flex items-start gap-2 rounded-lg bg-muted/45 p-2.5">
                      <ChevronRight className="mt-0.5 size-3.5 shrink-0 text-primary" />
                      <p className="text-[11px] font-semibold leading-4">Suggested next step: {insight.action}</p>
                    </div>
                  </div>
                  <Button type="button" size="sm" variant={isReviewed ? "secondary" : "outline"} disabled={isReviewed} onClick={() => markReviewed(insight.title)}>
                    <Check className="size-3.5" /> {isReviewed ? "Reviewed" : "Mark reviewed"}
                  </Button>
                </div>
              </article>
            );
          })}
        </div>

        <aside className="space-y-4 xl:col-span-4">
          <section className="overflow-hidden rounded-xl border border-border bg-card/75">
            <header className="flex items-center gap-2 border-b border-border bg-muted/45 px-3 py-2.5">
              <TrendingUp className="size-4 text-primary" />
              <h3 className="font-display text-sm font-extrabold text-primary">Clinical context</h3>
            </header>
            <div className="divide-y divide-border/70 p-3">
              <ContextLine label="Primary concern" value={patient.encounter.complaint} />
              <ContextLine label="Active problems" value={activeDiagnoses.map((item) => item.condition).join(", ")} />
              <ContextLine label="Allergy status" value={patient.allergies.join(", ")} alert />
              <ContextLine label="Current disposition" value={`${patient.status} · ${patient.encounter.ward}`} />
              <ContextLine label="Responsible consultant" value={patient.encounter.consultant} />
            </div>
          </section>

          <section className="overflow-hidden rounded-xl border border-border bg-card/75">
            <header className="flex items-center gap-2 border-b border-border bg-muted/45 px-3 py-2.5">
              <Sparkles className="size-4 text-primary" />
              <h3 className="font-display text-sm font-extrabold text-primary">Approved pediatric AI plan</h3>
            </header>
            <div className="p-3">
              {overviewQuery.isLoading ? (
                <p className="flex items-center gap-2 text-xs text-muted-foreground"><Loader2 className="size-3.5 animate-spin" /> Loading approved plan…</p>
              ) : overview?.summary ? (
                <>
                  <p className="mb-2 text-[10px] font-bold text-primary">{overview.headline || "Approved treatment summary"}</p>
                  <SummaryText text={overview.summary} className="max-h-64 overflow-y-auto pr-1" />
                  <p className="mt-2 border-t border-border pt-2 text-[10px] text-muted-foreground">Version {overview.version ?? 1} · approved by {overview.approvedBy || "clinician"}</p>
                </>
              ) : (
                <div className="text-center">
                  <Info className="mx-auto size-5 text-muted-foreground" />
                  <p className="mt-2 text-xs font-semibold">No approved pediatric summary</p>
                  <p className="mt-1 text-[10px] leading-4 text-muted-foreground">
                    {(overview?.pendingCount ?? 0) > 0 ? `${overview?.pendingCount} draft awaiting clinician review.` : "Generate a summary from the pedodontics chart, then approve it for the patient record."}
                  </p>
                </div>
              )}
            </div>
          </section>
        </aside>
      </div>

      <section className="overflow-hidden rounded-xl border border-border bg-card/75" aria-labelledby="care-pathway-title">
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-muted/45 px-4 py-3">
          <div className="flex items-center gap-2.5">
            <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary"><ClipboardList className="size-4" /></span>
            <div>
              <h3 id="care-pathway-title" className="font-display text-base font-extrabold text-primary">Condition care pathway</h3>
              <p className="text-xs text-muted-foreground">Next steps connected to the patient’s follow-ups and clinical orders.</p>
            </div>
          </div>
          <span className="rounded-lg border border-border bg-card px-2.5 py-1 text-[10px] font-bold text-muted-foreground">{pathways.length} active pathways</span>
        </header>

        <div className="divide-y divide-border/70">
          {pathways.map((pathway, index) => (
            <article key={`${pathway.code}-${pathway.condition}`} className="grid gap-3 p-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1.6fr)_auto] lg:items-center">
              <div className="flex min-w-0 items-start gap-3">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full border border-primary/25 bg-primary/5 font-display text-[10px] font-extrabold text-primary">{index + 1}</span>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="text-sm font-bold">{pathway.condition}</h4>
                    <span className="rounded bg-muted px-1.5 py-0.5 text-[9px] font-bold text-muted-foreground">{pathway.code}</span>
                    <PathwayStatusChip status={pathway.status} />
                  </div>
                  <p className="mt-1 text-[10px] text-muted-foreground">Source: {pathway.source}</p>
                </div>
              </div>

              <div className="min-w-0">
                <p className="text-[9px] font-bold text-muted-foreground uppercase">Next clinical step</p>
                <p className="mt-1 line-clamp-3 text-xs font-semibold leading-5">{pathway.nextStep}</p>
              </div>

              <div className="flex flex-wrap gap-2 lg:w-56 lg:flex-col">
                <Button type="button" size="sm" variant="outline" className="min-w-0 justify-start" onClick={() => onOpenRecordItem?.("follow-ups")}>
                  <CalendarClock className="size-3.5 shrink-0" /><span className="truncate">{pathway.followUp}</span>
                </Button>
                <Button type="button" size="sm" variant="outline" className="min-w-0 justify-start" onClick={() => onOpenRecordItem?.("orders")}>
                  <ClipboardCheck className="size-3.5 shrink-0" /><span className="truncate">{pathway.order}</span>
                </Button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <div className="flex items-start gap-2 rounded-lg border border-border bg-muted/45 px-3 py-2.5 text-[10px] leading-4 text-muted-foreground">
        <Info className="mt-0.5 size-3.5 shrink-0 text-primary" />
        <p>Decision support is based on available chart data and does not replace clinical assessment. Verify recommendations, contraindications, doses and current guidelines before acting.</p>
      </div>
    </section>
  );
}

function PathwayStatusChip({ status }: { status: PathwayStatus }) {
  const style = status === "Due now" ? "border-destructive/25 bg-destructive/5 text-destructive" : status === "Approved" ? "border-accent/25 bg-accent/10 text-accent" : "border-primary/20 bg-primary/5 text-primary";
  return <span className={`rounded border px-1.5 py-0.5 text-[9px] font-bold uppercase ${style}`}>{status}</span>;
}

function InsightStat({ label, value, icon: Icon, alert = false }: { label: string; value: string; icon: typeof Activity; alert?: boolean }) {
  return (
    <div className="flex min-h-20 items-center gap-3 bg-card/90 px-4 py-3">
      <Icon className={`size-5 shrink-0 ${alert ? "text-destructive" : "text-primary"}`} />
      <div><p className="text-[9px] font-bold text-muted-foreground uppercase">{label}</p><p className={`mt-1 font-display text-base font-extrabold ${alert ? "text-destructive" : "text-foreground"}`}>{value}</p></div>
    </div>
  );
}

function ContextLine({ label, value, alert = false }: { label: string; value: string; alert?: boolean }) {
  return (
    <div className="py-2 first:pt-0 last:pb-0">
      <p className="text-[9px] font-bold text-muted-foreground uppercase">{label}</p>
      <p className={`mt-1 text-[11px] font-semibold leading-4 ${alert ? "text-destructive" : "text-foreground"}`}>{value}</p>
    </div>
  );
}