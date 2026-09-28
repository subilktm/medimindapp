import {
  AlertTriangle,
  Bell,
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  Download,
  FileText,
  FlaskConical,
  HeartPulse,
  LineChart,
  PhoneCall,
  Plus,
  RefreshCw,
  Search,
  ShieldAlert,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { ClinicalPatient } from "@/lib/clinical-patients";

type ResultFlag = "Critical" | "High" | "Low" | "Normal" | "Abnormal";
type ResultStatus = "New" | "Reviewed" | "Pending";
type ResultCategory = "Renal Function Panel" | "Electrolytes" | "Full Blood Count" | "Diabetes Profile" | "Lipid Profile" | "Respiratory Panel" | "Cardiac Markers";
type ImagingStatus = "Final" | "Preliminary";

type LabResult = {
  id: string;
  category: ResultCategory;
  collectedAt: string;
  resultedAt: string;
  investigation: string;
  result: string;
  unit: string;
  referenceRange: string;
  flag: ResultFlag;
  trend: "up" | "down" | "flat";
  status: ResultStatus;
  specimen: string;
  lab: string;
  orderedBy: string;
  history: Array<{ date: string; value: number }>;
};

type ImagingResult = {
  id: string;
  date: string;
  investigation: string;
  summary: string;
  status: ImagingStatus;
};

type ResultsDataset = {
  labs: LabResult[];
  imaging: ImagingResult[];
  pending: Array<{ name: string; date: string; status: string }>;
  followUps: Array<{ item: string; due: string; status: "Overdue" | "Due soon" | "Pending" }>;
  clinicalContext: Array<{ label: string; value: string; flag: ResultFlag }>;
  decisionSupport: string[];
};

type WorklistItem = [primary: string, secondary: string, status: string];

const FILTERS = ["All Results", "Laboratory", "Radiology", "Pathology", "Cardiology", "Other Diagnostics"];

export function PatientResults({ patient }: { patient: ClinicalPatient }) {
  const [selectedFilter, setSelectedFilter] = useState("All Results");
  const [statusFilter, setStatusFilter] = useState("All Statuses");
  const [priorityFilter, setPriorityFilter] = useState("All Priorities");
  const [search, setSearch] = useState("");
  const [abnormalOnly, setAbnormalOnly] = useState(false);
  const [acknowledged, setAcknowledged] = useState(false);
  const dataset = useMemo(() => getResultsDataset(patient), [patient]);

  const visibleLabs = dataset.labs.filter((result) => {
    const matchesCategory = selectedFilter === "All Results" || selectedFilter === "Laboratory" || resultMatchesFilter(result, selectedFilter);
    const matchesSearch = [result.investigation, result.category, result.result, result.flag].join(" ").toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "All Statuses" || result.status === statusFilter;
    const matchesPriority = priorityFilter === "All Priorities" || result.flag === priorityFilter;
    const matchesAbnormal = !abnormalOnly || result.flag !== "Normal";
    return matchesCategory && matchesSearch && matchesStatus && matchesPriority && matchesAbnormal;
  });
  const visibleImaging = selectedFilter === "All Results" || selectedFilter === "Radiology" || selectedFilter === "Other Diagnostics" ? dataset.imaging : [];
  const critical = dataset.labs.find((result) => result.flag === "Critical") ?? dataset.labs.find((result) => result.flag !== "Normal") ?? dataset.labs[0];
  const abnormalCount = dataset.labs.filter((result) => result.flag !== "Normal").length;
  const pendingCount = dataset.labs.filter((result) => result.status === "Pending").length + dataset.pending.length;
  const grouped = groupResults(visibleLabs);

  const notify = (message: string) => toast.info(`${message} is ready for clinical integration.`);

  return (
    <section className="space-y-3" aria-label={`${patient.name} investigation results`}>
      <header className="overflow-hidden rounded-xl border border-border bg-card/85 shadow-panel">
        <div className="bg-clinical px-4 py-3 text-primary-foreground">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-bold uppercase opacity-85">Patient Chart / Results</p>
              <h2 className="font-display text-2xl font-extrabold">Results</h2>
              <p className="text-xs opacity-90">Review, trend and acknowledge clinical investigation results.</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-lg border border-primary-foreground/25 bg-card/10 px-3 py-2 text-[10px] font-semibold">
                History reviewed: 16 Sep 2026, 09:40 AM by {patient.encounter.consultant}
              </span>
              <Button size="sm" variant="secondary" className="bg-card/95 text-primary hover:bg-card" onClick={() => notify("Date range")}> 
                <CalendarDays className="size-4" /> 01 Jun 2026 – 16 Sep 2026
              </Button>
              <Button size="sm" variant="secondary" className="bg-card/95 text-primary hover:bg-card" onClick={() => notify("Result refresh")}> 
                <RefreshCw className="size-4" /> Refresh
              </Button>
              <Button size="sm" variant="secondary" className="bg-card/95 text-primary hover:bg-card" onClick={() => notify("Result comparison")}> 
                <LineChart className="size-4" /> Compare
              </Button>
            </div>
          </div>
        </div>

        <div className="grid gap-px bg-border sm:grid-cols-2 xl:grid-cols-6">
          <ResultStat icon={FileText} label="New results" value={`${dataset.labs.filter((result) => result.status === "New").length}`} detail="Since last review" />
          <ResultStat icon={ShieldAlert} label="Critical" value={`${dataset.labs.filter((result) => result.flag === "Critical").length}`} detail="Requires urgent action" tone="critical" />
          <ResultStat icon={AlertTriangle} label="Abnormal" value={`${abnormalCount}`} detail="Outside reference range" tone="warning" />
          <ResultStat icon={FlaskConical} label="Pending" value={`${pendingCount}`} detail="Results awaited" />
          <ResultStat icon={Bell} label="Awaiting acknowledgement" value={acknowledged ? "0" : "4"} detail="Require clinician review" />
          <ResultStat icon={ClipboardCheck} label="Resulted today" value="9" detail="Since 12:00 AM" tone="success" />
        </div>
      </header>

      <div className="flex overflow-x-auto rounded-xl border border-border bg-muted/35 p-1" aria-label="Result category filters">
        {FILTERS.map((filter) => (
          <Button
            key={filter}
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setSelectedFilter(filter)}
            className={`h-8 shrink-0 rounded-lg px-3 text-[10px] font-bold ${selectedFilter === filter ? "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground" : "text-primary hover:bg-card"}`}
          >
            {filter}
          </Button>
        ))}
      </div>

      <div className="grid gap-4 2xl:grid-cols-[minmax(0,1.55fr)_minmax(360px,0.95fr)]">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border bg-card/75 p-2">
            <div className="relative min-w-52 flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search test or result…" className="h-9 pl-9 text-xs" />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-9 w-40 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="All Statuses">All Statuses</SelectItem>
                <SelectItem value="New">New</SelectItem>
                <SelectItem value="Reviewed">Reviewed</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="h-9 w-40 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="All Priorities">All Priorities</SelectItem>
                <SelectItem value="Critical">Critical</SelectItem>
                <SelectItem value="High">High</SelectItem>
                <SelectItem value="Low">Low</SelectItem>
                <SelectItem value="Abnormal">Abnormal</SelectItem>
                <SelectItem value="Normal">Normal</SelectItem>
              </SelectContent>
            </Select>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => setAbnormalOnly((current) => !current)}
              className={abnormalOnly ? "border-destructive/30 bg-destructive/5 text-destructive hover:bg-destructive/10 hover:text-destructive" : ""}
            >
              <AlertTriangle className="size-4" /> Abnormal only
            </Button>
          </div>

          <ResultsTable grouped={grouped} selectedId={critical?.id} />
          <ImagingPanel imaging={visibleImaging} onAction={notify} />
        </div>

        <aside className="space-y-3">
          {critical ? <CriticalResultPanel result={critical} patient={patient} context={dataset.clinicalContext} acknowledged={acknowledged} onAcknowledge={() => setAcknowledged(true)} onAction={notify} /> : null}
          <div className="grid gap-3 lg:grid-cols-2 2xl:grid-cols-1">
            <WorklistPanel title="Pending investigations" icon={Clock3} items={dataset.pending.map((item) => [item.name, item.date, item.status])} actionLabel="View" />
            <WorklistPanel title="Result follow-up" icon={ClipboardCheck} items={dataset.followUps.map((item) => [item.item, item.due, item.status])} actionLabel="Assign" />
          </div>
          <DecisionSupportPanel support={dataset.decisionSupport} onAction={notify} />
        </aside>
      </div>

      <footer className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border bg-card/85 p-3 shadow-panel">
        <Button variant="outline" size="sm" onClick={() => notify("Patient summary")}>Back to Patient Summary</Button>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => notify("Clinical note")}> <FileText className="size-4" /> Add Clinical Note</Button>
          <Button variant="outline" size="sm" onClick={() => notify("Selected result review")}> <CheckCircle2 className="size-4" /> Mark Selected as Reviewed</Button>
          <Button size="sm" onClick={() => setAcknowledged(true)}> <ShieldAlert className="size-4" /> Acknowledge & Save</Button>
        </div>
      </footer>
    </section>
  );
}

function ResultsTable({ grouped, selectedId }: { grouped: Array<[ResultCategory, LabResult[]]>; selectedId: string | undefined }) {
  return (
    <section className="overflow-hidden rounded-xl border border-border bg-card/80">
      <header className="flex items-center justify-between border-b border-border bg-muted/45 px-3 py-2">
        <h3 className="font-display text-sm font-extrabold text-primary">Investigation Results</h3>
        <span className="text-[10px] font-semibold text-muted-foreground">Grouped by panel</span>
      </header>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[860px] text-left text-[10px]">
          <thead className="bg-muted/35 text-muted-foreground">
            <tr>
              <th className="px-3 py-2 font-bold">Date / Time</th>
              <th className="px-3 py-2 font-bold">Investigation</th>
              <th className="px-3 py-2 font-bold">Result</th>
              <th className="px-3 py-2 font-bold">Reference Range</th>
              <th className="px-3 py-2 font-bold">Flag</th>
              <th className="px-3 py-2 font-bold">Trend</th>
              <th className="px-3 py-2 font-bold">Status</th>
              <th className="px-3 py-2 font-bold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {grouped.map(([category, results]) => (
              <ResultsGroup key={category} category={category} results={results} selectedId={selectedId} />
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function ResultsGroup({ category, results, selectedId }: { category: ResultCategory; results: LabResult[]; selectedId: string | undefined }) {
  return (
    <>
      <tr className="border-t border-border bg-primary/5">
        <td colSpan={8} className="px-3 py-2 font-display text-[11px] font-extrabold text-primary">
          <span className="mr-2">⌄</span>{category}
        </td>
      </tr>
      {results.map((result) => (
        <tr key={result.id} className={`border-t border-border/60 ${result.id === selectedId ? "bg-primary/10" : "bg-card"}`}>
          <td className="px-3 py-2 text-muted-foreground">{result.collectedAt}</td>
          <td className="px-3 py-2 font-semibold text-foreground">{result.investigation}</td>
          <td className={`px-3 py-2 font-extrabold ${flagText(result.flag)}`}>{result.result} {result.unit}</td>
          <td className="px-3 py-2 text-muted-foreground">{result.referenceRange}</td>
          <td className="px-3 py-2"><FlagPill flag={result.flag} /></td>
          <td className="px-3 py-2"><MiniTrend trend={result.trend} flag={result.flag} /></td>
          <td className="px-3 py-2"><StatusPill status={result.status} /></td>
          <td className="px-3 py-2">
            <div className="flex items-center gap-1">
              <Button variant="outline" size="sm" className="h-7 px-2 text-[10px]">View</Button>
              <Button variant="ghost" size="icon" className="size-7" aria-label={`More actions for ${result.investigation}`}>⋮</Button>
            </div>
          </td>
        </tr>
      ))}
    </>
  );
}

function CriticalResultPanel({ result, patient, context, acknowledged, onAcknowledge, onAction }: { result: LabResult; patient: ClinicalPatient; context: ResultsDataset["clinicalContext"]; acknowledged: boolean; onAcknowledge: () => void; onAction: (message: string) => void }) {
  const trendStart = result.history[0]?.value ?? 0;
  const trendEnd = result.history[result.history.length - 1]?.value ?? 0;
  const direction = trendEnd >= trendStart ? "rising" : "falling";

  return (
    <section className="overflow-hidden rounded-xl border border-destructive/25 bg-card/85 shadow-panel">
      <header className="border-b border-border bg-destructive/5 px-4 py-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-destructive/10 text-destructive"><AlertTriangle className="size-5" /></span>
            <div>
              <h3 className="font-display text-lg font-extrabold text-primary">{result.investigation} — {result.flag} Result</h3>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <span className="font-display text-3xl font-extrabold text-destructive">{result.result} {result.unit}</span>
                <FlagPill flag={result.flag} />
              </div>
              <p className="mt-1 text-[11px] text-muted-foreground">Reference range: {result.referenceRange}</p>
            </div>
          </div>
          <span className={`rounded-lg px-3 py-1 text-[10px] font-bold ${acknowledged ? "bg-accent/10 text-accent" : "bg-destructive/10 text-destructive"}`}>
            {acknowledged ? "Acknowledged" : "Unacknowledged"}
          </span>
        </div>
        <div className="mt-3 grid gap-2 sm:grid-cols-4">
          <ResultMeta label="Collected" value={result.collectedAt} />
          <ResultMeta label="Resulted" value={result.resultedAt} />
          <ResultMeta label="Specimen" value={result.specimen} />
          <ResultMeta label="Ordered by" value={result.orderedBy} />
        </div>
      </header>

      <div className="space-y-3 p-4">
        <div className="rounded-lg border border-border bg-card p-3">
          <div className="flex items-center justify-between gap-2">
            <p className="font-display text-sm font-extrabold text-primary">Result Trend ({result.investigation})</p>
            <span className="text-[10px] font-semibold text-muted-foreground">Trend is {direction}</span>
          </div>
          <TrendChart history={result.history} unit={result.unit} flag={result.flag} />
        </div>

        <div className="grid gap-3 lg:grid-cols-2">
          <div className="rounded-lg border border-border bg-muted/25 p-3">
            <h4 className="font-display text-sm font-extrabold text-primary">Clinical context</h4>
            <div className="mt-2 space-y-2">
              {context.map((item) => <DataRow key={item.label} label={item.label} value={item.value} flag={item.flag} />)}
            </div>
          </div>
          <div className="rounded-lg border border-border bg-muted/25 p-3">
            <h4 className="font-display text-sm font-extrabold text-primary">Critical result communication</h4>
            <div className="mt-3 flex items-start gap-3">
              <PhoneCall className="mt-0.5 size-5 text-primary" />
              <div>
                <p className="text-xs font-bold">Lab notified {patient.encounter.consultant}</p>
                <p className="text-[10px] text-muted-foreground">at 09:52 AM</p>
                <span className={`mt-2 inline-flex rounded px-2 py-1 text-[10px] font-bold ${acknowledged ? "bg-accent/10 text-accent" : "bg-destructive/10 text-destructive"}`}>{acknowledged ? "Acknowledged" : "Acknowledgement pending"}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button size="sm" onClick={onAcknowledge}><CheckCircle2 className="size-4" /> Acknowledge Result</Button>
          <Button size="sm" variant="outline" onClick={() => onAction("Interpretation note")}> <FileText className="size-4" /> Add Interpretation</Button>
          <Button size="sm" variant="outline" onClick={() => onAction("Repeat test order")}> <RefreshCw className="size-4" /> Repeat Test</Button>
          <Button size="sm" variant="outline" onClick={() => onAction("Clinical task")}> <Plus className="size-4" /> Create Clinical Task</Button>
        </div>
      </div>
    </section>
  );
}

function ImagingPanel({ imaging, onAction }: { imaging: ImagingResult[]; onAction: (message: string) => void }) {
  return (
    <section className="overflow-hidden rounded-xl border border-border bg-card/80">
      <header className="flex items-center justify-between border-b border-border bg-muted/45 px-3 py-2">
        <h3 className="font-display text-sm font-extrabold text-primary">Radiology & Diagnostic Results</h3>
        <Button variant="ghost" size="sm" className="h-7 px-2 text-[10px] text-primary" onClick={() => onAction("Diagnostic export")}><Download className="size-3.5" /> Export</Button>
      </header>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[620px] text-left text-[10px]">
          <thead className="bg-muted/35 text-muted-foreground"><tr><th className="px-3 py-2">Date</th><th className="px-3 py-2">Investigation</th><th className="px-3 py-2">Result Summary</th><th className="px-3 py-2">Status</th><th className="px-3 py-2">Actions</th></tr></thead>
          <tbody className="divide-y divide-border/60">
            {imaging.map((item) => (
              <tr key={item.id}>
                <td className="px-3 py-2 text-muted-foreground">{item.date}</td>
                <td className="px-3 py-2 font-semibold">{item.investigation}</td>
                <td className="px-3 py-2 text-muted-foreground">{item.summary}</td>
                <td className="px-3 py-2"><span className="rounded bg-accent/10 px-2 py-1 text-[9px] font-bold text-accent">{item.status}</span></td>
                <td className="px-3 py-2"><Button variant="outline" size="sm" className="h-7 px-2 text-[10px]" onClick={() => onAction(item.investigation)}>View Report</Button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function WorklistPanel({ title, icon: Icon, items, actionLabel }: { title: string; icon: typeof Clock3; items: WorklistItem[]; actionLabel: string }) {
  return (
    <section className="overflow-hidden rounded-xl border border-border bg-card/80">
      <header className="flex items-center gap-2 border-b border-border bg-muted/45 px-3 py-2 font-display text-sm font-extrabold text-primary"><Icon className="size-4" />{title}</header>
      <div className="divide-y divide-border/60">
        {items.map(([primary, secondary, status]) => (
          <div key={`${primary}-${secondary}`} className="grid grid-cols-[minmax(0,1fr)_auto] gap-2 px-3 py-2 text-[10px]">
            <div className="min-w-0">
              <p className="truncate font-bold">{primary}</p>
              <p className="mt-0.5 text-muted-foreground">{secondary}</p>
            </div>
            <div className="flex items-center gap-2">
              <StatusText status={status} />
              <Button variant="outline" size="sm" className="h-7 px-2 text-[10px]">{actionLabel}</Button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function DecisionSupportPanel({ support, onAction }: { support: string[]; onAction: (message: string) => void }) {
  return (
    <section className="overflow-hidden rounded-xl border border-primary/20 bg-primary/5">
      <header className="flex items-center gap-2 border-b border-primary/15 bg-card/55 px-3 py-2 font-display text-sm font-extrabold text-primary"><HeartPulse className="size-4" />Clinical Decision Support</header>
      <div className="space-y-3 p-3">
        <div>
          <p className="text-xs font-extrabold text-primary">Possible urgent follow-up</p>
          <ul className="mt-2 space-y-1.5">
            {support.map((item) => <li key={item} className="flex gap-2 text-[11px] leading-4 text-muted-foreground"><span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />{item}</li>)}
          </ul>
        </div>
        <div className="rounded-lg border border-chart-4/25 bg-chart-4/10 px-3 py-2 text-[10px] font-semibold text-foreground">Decision support only — clinician review required.</div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => onAction("Recommendation review")}>View Recommendation</Button>
          <Button variant="ghost" size="sm" onClick={() => onAction("Decision support dismissal")}>Dismiss</Button>
        </div>
      </div>
    </section>
  );
}

function ResultStat({ icon: Icon, label, value, detail, tone = "primary" }: { icon: typeof FileText; label: string; value: string; detail: string; tone?: "primary" | "critical" | "warning" | "success" }) {
  const iconTone = tone === "critical" ? "text-destructive bg-destructive/10" : tone === "warning" ? "text-chart-4 bg-chart-4/10" : tone === "success" ? "text-accent bg-accent/10" : "text-primary bg-primary/10";
  const valueTone = tone === "critical" ? "text-destructive" : tone === "warning" ? "text-chart-4" : tone === "success" ? "text-accent" : "text-primary";
  return (
    <div className="flex min-h-20 items-center gap-3 bg-card/90 px-3 py-3">
      <span className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${iconTone}`}><Icon className="size-5" /></span>
      <div>
        <p className="text-[9px] font-bold text-muted-foreground uppercase">{label}</p>
        <p className={`font-display text-xl font-extrabold ${valueTone}`}>{value}</p>
        <p className="text-[9px] text-muted-foreground">{detail}</p>
      </div>
    </div>
  );
}

function ResultMeta({ label, value }: { label: string; value: string }) {
  return <div className="rounded-lg bg-card/80 px-3 py-2"><p className="text-[9px] font-bold text-muted-foreground uppercase">{label}</p><p className="mt-1 text-[10px] font-semibold">{value}</p></div>;
}

function DataRow({ label, value, flag }: { label: string; value: string; flag: ResultFlag }) {
  return <div className="flex items-center justify-between gap-3 text-[11px]"><span className="text-muted-foreground">{label}</span><span className={`font-bold ${flagText(flag)}`}>{value}</span></div>;
}

function FlagPill({ flag }: { flag: ResultFlag }) {
  const tones: Record<ResultFlag, string> = {
    Critical: "border-destructive/30 bg-destructive/10 text-destructive",
    High: "border-destructive/25 bg-destructive/5 text-destructive",
    Low: "border-chart-4/30 bg-chart-4/10 text-chart-4",
    Abnormal: "border-chart-4/30 bg-chart-4/10 text-chart-4",
    Normal: "border-accent/25 bg-accent/10 text-accent",
  };
  return <span className={`inline-flex items-center gap-1 rounded border px-2 py-0.5 text-[9px] font-bold ${tones[flag]}`}><span className="size-1.5 rounded-full bg-current" />{flag}</span>;
}

function StatusPill({ status }: { status: ResultStatus }) {
  const tones: Record<ResultStatus, string> = {
    New: "bg-primary/10 text-primary",
    Reviewed: "bg-accent/10 text-accent",
    Pending: "bg-chart-4/10 text-chart-4",
  };
  return <span className={`rounded px-2 py-1 text-[9px] font-bold ${tones[status]}`}>{status}</span>;
}

function StatusText({ status }: { status: string }) {
  const isUrgent = status === "Overdue" || status === "Specimen required";
  const isSoon = status === "Due soon" || status === "In progress";
  const className = isUrgent ? "text-destructive" : isSoon ? "text-chart-4" : "text-primary";
  return <span className={`whitespace-nowrap text-[9px] font-bold ${className}`}>{status}</span>;
}

function MiniTrend({ trend, flag }: { trend: LabResult["trend"]; flag: ResultFlag }) {
  const points = trend === "up" ? "1,14 14,10 27,7 40,3" : trend === "down" ? "1,5 14,7 27,10 40,13" : "1,8 14,8 27,9 40,8";
  const tone = flag === "Normal" ? "text-primary" : flag === "Critical" || flag === "High" ? "text-destructive" : "text-chart-4";
  return <svg viewBox="0 0 42 16" className={`h-5 w-14 ${tone}`} aria-hidden="true"><polyline points={points} fill="none" stroke="currentColor" strokeWidth="2" /><circle cx="40" cy={trend === "up" ? 3 : trend === "down" ? 13 : 8} r="2" fill="currentColor" /></svg>;
}

function TrendChart({ history, unit, flag }: { history: LabResult["history"]; unit: string; flag: ResultFlag }) {
  const values = history.map((item) => item.value);
  const min = Math.min(...values) - 0.5;
  const max = Math.max(...values) + 0.5;
  const points = history.map((item, index) => {
    const x = 8 + (index * 84) / Math.max(history.length - 1, 1);
    const y = 78 - ((item.value - min) / Math.max(max - min, 1)) * 58;
    return { x, y, item };
  });
  const path = points.map((point) => `${point.x},${point.y}`).join(" ");
  const tone = flag === "Normal" ? "text-primary" : "text-destructive";
  return (
    <div className="mt-2 rounded-lg bg-muted/25 p-2">
      <svg viewBox="0 0 100 88" className={`h-40 w-full ${tone}`} preserveAspectRatio="none" role="img" aria-label={`${history[0]?.value ?? ""} to ${history[history.length - 1]?.value ?? ""} ${unit}`}>
        <line x1="8" y1="78" x2="94" y2="78" className="text-border" stroke="currentColor" strokeWidth="0.5" />
        <line x1="8" y1="20" x2="8" y2="78" className="text-border" stroke="currentColor" strokeWidth="0.5" />
        <polyline points={path} fill="none" stroke="currentColor" strokeWidth="1.8" vectorEffect="non-scaling-stroke" />
        {points.map((point) => <circle key={point.item.date} cx={point.x} cy={point.y} r="1.5" fill="currentColor" />)}
      </svg>
      <div className="grid" style={{ gridTemplateColumns: `repeat(${history.length}, minmax(0, 1fr))` }}>
        {history.map((item) => <div key={item.date} className="text-center text-[9px] text-muted-foreground"><span className="block font-bold text-foreground">{item.value}</span>{item.date}</div>)}
      </div>
    </div>
  );
}

function groupResults(results: LabResult[]) {
  const groups = new Map<ResultCategory, LabResult[]>();
  results.forEach((result) => {
    const existing = groups.get(result.category) ?? [];
    existing.push(result);
    groups.set(result.category, existing);
  });
  return Array.from(groups.entries());
}

function resultMatchesFilter(result: LabResult, filter: string) {
  if (filter === "Pathology") return result.category === "Full Blood Count";
  if (filter === "Cardiology") return result.category === "Cardiac Markers" || result.category === "Lipid Profile";
  if (filter === "Other Diagnostics") return result.category === "Respiratory Panel";
  return true;
}

function flagText(flag: ResultFlag) {
  if (flag === "Critical" || flag === "High") return "text-destructive";
  if (flag === "Low" || flag === "Abnormal") return "text-chart-4";
  return "text-accent";
}

function getResultsDataset(patient: ClinicalPatient): ResultsDataset {
  if (patient.id === "92045") return marcusResults(patient);
  if (patient.id === "92058") return elenaResults(patient);
  return emmaResults(patient);
}

function emmaResults(patient: ClinicalPatient): ResultsDataset {
  return {
    labs: [
      lab("emma-creatinine", "Renal Function Panel", "16 Sep 2026 09:12", "16 Sep 2026 09:48", "Creatinine", "1.7", "mg/dL", "0.6 – 1.3", "High", "up", "New", "Serum", [1.1, 1.2, 1.4, 1.5, 1.7], patient.encounter.consultant),
      lab("emma-egfr", "Renal Function Panel", "16 Sep 2026 09:12", "16 Sep 2026 09:48", "eGFR", "48", "mL/min/1.73m²", "≥ 60", "Low", "down", "New", "Serum", [64, 61, 56, 53, 48], patient.encounter.consultant),
      lab("emma-potassium", "Electrolytes", "16 Sep 2026 09:12", "16 Sep 2026 09:48", "Potassium", "5.6", "mmol/L", "3.5 – 5.1", "Critical", "up", "New", "Serum", [4.3, 4.6, 4.9, 5.2, 5.6], patient.encounter.consultant),
      lab("emma-sodium", "Electrolytes", "16 Sep 2026 09:12", "16 Sep 2026 09:48", "Sodium", "138", "mmol/L", "136 – 145", "Normal", "flat", "Reviewed", "Serum", [137, 138, 139, 138, 138], patient.encounter.consultant),
      lab("emma-hb", "Full Blood Count", "15 Sep 2026 07:45", "15 Sep 2026 08:20", "Hemoglobin", "13.2", "g/dL", "13.5 – 17.5", "Low", "flat", "Reviewed", "Whole blood", [13.5, 13.4, 13.3, 13.2], patient.encounter.consultant),
      lab("emma-hba1c", "Diabetes Profile", "10 Aug 2026 08:20", "10 Aug 2026 10:05", "HbA1c", "6.2", "%", "< 5.7", "High", "up", "Reviewed", "Whole blood", [5.7, 5.9, 6.1, 6.2], "Dr. Nabil Rahman"),
      lab("emma-ldl", "Lipid Profile", "16 Sep 2026 08:10", "16 Sep 2026 09:05", "LDL Cholesterol", "142", "mg/dL", "< 100", "High", "up", "New", "Serum", [118, 126, 136, 142], patient.encounter.consultant),
    ],
    imaging: [
      { id: "emma-xray", date: "15 Sep 2026", investigation: "Chest X-ray", summary: "Mild cardiomegaly; no acute pulmonary process", status: "Final" },
      { id: "emma-echo", date: "12 Aug 2026", investigation: "Echocardiogram", summary: "LVEF 55%; mild LV hypertrophy", status: "Final" },
      { id: "emma-ecg", date: "16 Sep 2026", investigation: "ECG", summary: "Sinus rhythm, rate 86 bpm", status: "Final" },
      { id: "emma-angio", date: "18 Jan 2025", investigation: "Coronary Angiography", summary: "No significant obstruction", status: "Final" },
    ],
    pending: [
      { name: "Repeat renal panel", date: "17 Sep 2026", status: "Scheduled" },
      { name: "Troponin I", date: "16 Sep 2026", status: "In progress" },
      { name: "Urine protein/creatinine ratio", date: "—", status: "Specimen required" },
    ],
    followUps: [
      { item: "Acknowledge critical potassium", due: "16 Sep 2026", status: "Overdue" },
      { item: "Review renal medication dosing", due: "17 Sep 2026", status: "Due soon" },
      { item: "Discuss LDL management", due: "23 Sep 2026", status: "Pending" },
    ],
    clinicalContext: [
      { label: "Creatinine", value: "1.7 mg/dL", flag: "High" },
      { label: "eGFR", value: "48 mL/min/1.73m²", flag: "Low" },
      { label: "Current medicines", value: "Aspirin, amlodipine", flag: "Normal" },
    ],
    decisionSupport: ["Review renal function and potassium-increasing medicines.", "Consider repeat sample to exclude haemolysis.", "Monitor ECG and assess for clinical symptoms."],
  };
}

function marcusResults(patient: ClinicalPatient): ResultsDataset {
  return {
    labs: [
      lab("marcus-potassium", "Electrolytes", "21 Sep 2026 08:12", "21 Sep 2026 08:54", "Potassium", "3.2", "mmol/L", "3.5 – 5.1", "Low", "down", "New", "Serum", [4.1, 3.8, 3.5, 3.2], patient.encounter.consultant),
      lab("marcus-magnesium", "Electrolytes", "21 Sep 2026 08:12", "21 Sep 2026 08:54", "Magnesium", "0.66", "mmol/L", "0.7 – 1.0", "Low", "down", "New", "Serum", [0.82, 0.78, 0.72, 0.66], patient.encounter.consultant),
      lab("marcus-troponin", "Cardiac Markers", "21 Sep 2026 08:20", "21 Sep 2026 09:05", "Troponin I", "0.02", "ng/mL", "< 0.04", "Normal", "flat", "Reviewed", "Serum", [0.01, 0.02, 0.02], patient.encounter.consultant),
      lab("marcus-creatinine", "Renal Function Panel", "21 Sep 2026 08:12", "21 Sep 2026 08:54", "Creatinine", "1.1", "mg/dL", "0.6 – 1.3", "Normal", "flat", "Reviewed", "Serum", [1.0, 1.1, 1.1], patient.encounter.consultant),
      lab("marcus-hb", "Full Blood Count", "21 Sep 2026 08:12", "21 Sep 2026 08:50", "Hemoglobin", "12.8", "g/dL", "13.5 – 17.5", "Low", "flat", "New", "Whole blood", [13.1, 12.9, 12.8], patient.encounter.consultant),
    ],
    imaging: [
      { id: "marcus-ecg", date: "21 Sep 2026", investigation: "ECG", summary: "Atrial fibrillation with ventricular rate 104 bpm", status: "Final" },
      { id: "marcus-echo", date: "21 Sep 2026", investigation: "Echocardiogram", summary: "Pending formal report; bedside views adequate", status: "Preliminary" },
      { id: "marcus-ct", date: "19 Sep 2026", investigation: "CT head", summary: "No acute intracranial haemorrhage", status: "Final" },
    ],
    pending: [
      { name: "Repeat ECG", date: "21 Sep 2026", status: "Scheduled" },
      { name: "Echocardiogram report", date: "21 Sep 2026", status: "In progress" },
      { name: "Orthostatic observations", date: "—", status: "Specimen required" },
    ],
    followUps: [
      { item: "Correct low potassium", due: "21 Sep 2026", status: "Due soon" },
      { item: "Review anticoagulation eligibility", due: "21 Sep 2026", status: "Pending" },
      { item: "Falls-risk reassessment", due: "22 Sep 2026", status: "Pending" },
    ],
    clinicalContext: [
      { label: "Pulse", value: "104 bpm", flag: "High" },
      { label: "Potassium", value: "3.2 mmol/L", flag: "Low" },
      { label: "Current medicines", value: "Bisoprolol, amlodipine", flag: "Normal" },
    ],
    decisionSupport: ["Low potassium can worsen arrhythmia risk.", "Review replacement plan alongside rhythm monitoring.", "Check magnesium before rate-control escalation."],
  };
}

function elenaResults(patient: ClinicalPatient): ResultsDataset {
  return {
    labs: [
      lab("elena-wbc", "Full Blood Count", "21 Sep 2026 07:20", "21 Sep 2026 08:05", "White blood cells", "13.8", "×10⁹/L", "4.0 – 11.0", "High", "up", "New", "Whole blood", [8.4, 10.2, 12.1, 13.8], patient.encounter.consultant),
      lab("elena-crp", "Respiratory Panel", "21 Sep 2026 07:20", "21 Sep 2026 08:10", "CRP", "28", "mg/L", "< 5", "High", "up", "New", "Serum", [4, 12, 21, 28], patient.encounter.consultant),
      lab("elena-spo2", "Respiratory Panel", "21 Sep 2026 08:30", "21 Sep 2026 08:30", "SpO₂", "94", "%", "≥ 95", "Low", "down", "Pending", "Bedside", [98, 97, 95, 94], patient.encounter.consultant),
      lab("elena-sodium", "Electrolytes", "21 Sep 2026 07:20", "21 Sep 2026 08:04", "Sodium", "137", "mmol/L", "136 – 145", "Normal", "flat", "Reviewed", "Serum", [138, 137, 137], patient.encounter.consultant),
      lab("elena-hb", "Full Blood Count", "21 Sep 2026 07:20", "21 Sep 2026 08:05", "Hemoglobin", "12.9", "g/dL", "12.0 – 15.5", "Normal", "flat", "Reviewed", "Whole blood", [12.8, 12.9, 12.9], patient.encounter.consultant),
    ],
    imaging: [
      { id: "elena-cxr", date: "21 Sep 2026", investigation: "Chest X-ray", summary: "No focal consolidation; mild bronchial wall thickening", status: "Final" },
      { id: "elena-peak", date: "21 Sep 2026", investigation: "Peak flow", summary: "Reduced from predicted; improved after bronchodilator", status: "Final" },
    ],
    pending: [
      { name: "Repeat SpO₂", date: "21 Sep 2026", status: "Scheduled" },
      { name: "Viral respiratory swab", date: "21 Sep 2026", status: "In progress" },
      { name: "Temperature reassessment", date: "—", status: "Specimen required" },
    ],
    followUps: [
      { item: "Review oxygen saturation trend", due: "21 Sep 2026", status: "Due soon" },
      { item: "Confirm inhaler response", due: "21 Sep 2026", status: "Pending" },
      { item: "Vaccination counselling", due: "25 Sep 2026", status: "Pending" },
    ],
    clinicalContext: [
      { label: "Temperature", value: "38.1 °C", flag: "High" },
      { label: "SpO₂", value: "94%", flag: "Low" },
      { label: "Current medicines", value: "Salbutamol, paracetamol", flag: "Normal" },
    ],
    decisionSupport: ["Repeat oxygen saturation after bronchodilator.", "Escalate if work of breathing increases or saturation falls.", "Consider vaccination counselling before discharge."],
  };
}

function lab(id: string, category: ResultCategory, collectedAt: string, resultedAt: string, investigation: string, result: string, unit: string, referenceRange: string, flag: ResultFlag, trend: LabResult["trend"], status: ResultStatus, specimen: string, values: number[], orderedBy: string): LabResult {
  const dates = ["18 Jan 2025", "02 May 2026", "10 Aug 2026", "15 Sep 2026", "16 Sep 2026"];
  return {
    id,
    category,
    collectedAt,
    resultedAt,
    investigation,
    result,
    unit,
    referenceRange,
    flag,
    trend,
    status,
    specimen,
    lab: "Main Hospital",
    orderedBy,
    history: values.map((value, index) => ({ date: dates[index + Math.max(dates.length - values.length, 0)] ?? `Result ${index + 1}`, value })),
  };
}
