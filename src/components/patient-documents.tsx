import {
  Archive,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  Download,
  Eye,
  FileCheck2,
  FileImage,
  FilePlus2,
  FileSignature,
  FileText,
  History,
  Link2,
  MoreVertical,
  PenLine,
  Printer,
  RefreshCw,
  Search,
  Send,
  ShieldCheck,
  Upload,
} from "lucide-react";
import { type ReactNode, useMemo, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import type { ClinicalPatient } from "@/lib/clinical-patients";

type DocumentStatus = "Signed" | "Draft" | "Final" | "Verified" | "Approved" | "Verified Copy";
type DocumentCategory = "Clinical Note" | "Discharge" | "Procedure Report" | "Radiology" | "Laboratory" | "Consent" | "External Record" | "Insurance";

type PatientDocument = {
  id: string;
  title: string;
  category: DocumentCategory;
  encounter: string;
  date: string;
  author: string;
  status: DocumentStatus;
  version: string;
  format: "PDF";
  size: string;
  source: "EMR" | "Patient supplied" | "External clinic" | "Laboratory";
  confidentiality: "Clinical" | "Restricted" | "Administrative";
  pages: number;
  signedAt?: string;
  summary: string;
  sections: Array<{ title: string; lines: string[] }>;
  related: Array<{ title: string; date: string; category: DocumentCategory }>;
  versions: Array<{ version: string; date: string; status: string }>;
};

const DOCUMENT_TABS = ["All Documents", "Clinical Notes", "Laboratory", "Radiology", "Procedures", "Discharge", "Consent", "Insurance", "External Records"];

export function PatientDocuments({ patient }: { patient: ClinicalPatient }) {
  const documents = useMemo(() => getPatientDocuments(patient), [patient]);
  const [selectedTab, setSelectedTab] = useState("All Documents");
  const [selectedId, setSelectedId] = useState(documents[0]?.id ?? "");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Statuses");
  const [encounterFilter, setEncounterFilter] = useState("All Encounters");
  const [signedOnly, setSignedOnly] = useState(false);
  const [viewerOpen, setViewerOpen] = useState(false);

  const openDocument = (id: string) => {
    setSelectedId(id);
    setViewerOpen(true);
  };

  const visibleDocuments = documents.filter((document) => {
    const matchesTab = documentMatchesTab(document, selectedTab);
    const matchesSearch = [document.title, document.category, document.author, document.encounter, document.summary].join(" ").toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "All Statuses" || document.status === statusFilter;
    const matchesEncounter = encounterFilter === "All Encounters" || document.encounter === encounterFilter;
    const matchesSigned = !signedOnly || document.status === "Signed" || document.status === "Final" || document.status === "Verified" || document.status === "Approved" || document.status === "Verified Copy";
    return matchesTab && matchesSearch && matchesStatus && matchesEncounter && matchesSigned;
  });
  const selectedDocument = documents.find((document) => document.id === selectedId) ?? visibleDocuments[0] ?? documents[0];
  const signedCount = documents.filter((document) => document.status === "Signed" || document.status === "Final" || document.status === "Verified" || document.status === "Approved").length;
  const draftCount = documents.filter((document) => document.status === "Draft").length;

  const notify = (message: string) => toast.info(`${message} is ready for document workflow integration.`);

  return (
    <section className="space-y-3" aria-label={`${patient.name} documents`}>
      <header className="overflow-hidden rounded-xl border border-border bg-card/85 shadow-panel">
        <div className="bg-clinical px-4 py-3 text-primary-foreground">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-bold uppercase opacity-85">Patient Chart / Documents</p>
              <h2 className="font-display text-2xl font-extrabold">Documents</h2>
              <p className="text-xs opacity-90">View, upload and manage patient clinical documents.</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button size="sm" variant="secondary" className="bg-card/95 text-primary hover:bg-card" onClick={() => notify("Document scanning")}>
                <FileImage className="size-4" /> Scan Document
              </Button>
              <Button size="sm" variant="secondary" className="bg-card/95 text-primary hover:bg-card" onClick={() => notify("External record import")}>
                <Upload className="size-4" /> Import External Record
              </Button>
              <Button size="sm" variant="secondary" className="bg-card/95 text-primary hover:bg-card" onClick={() => notify("Signature request")}>
                <PenLine className="size-4" /> Request Signature
              </Button>
              <Button size="sm" onClick={() => notify("Document upload")}>
                <Upload className="size-4" /> Upload Document
              </Button>
            </div>
          </div>
        </div>

        <div className="grid gap-px bg-border sm:grid-cols-2 xl:grid-cols-6">
          <DocumentStat icon={FileText} label="All documents" value={`${documents.length}`} detail="Indexed in chart" />
          <DocumentStat icon={ClipboardCheck} label="Clinical notes" value={`${documents.filter((document) => document.category === "Clinical Note").length}`} detail="Progress and consult notes" />
          <DocumentStat icon={FileCheck2} label="Reports" value="7" detail="Lab, imaging and procedure" tone="success" />
          <DocumentStat icon={FileSignature} label="Consent forms" value={`${documents.filter((document) => document.category === "Consent").length}`} detail="Signed or awaiting" tone="warning" />
          <DocumentStat icon={Archive} label="External records" value={`${documents.filter((document) => document.category === "External Record").length}`} detail="Outside facilities" />
          <DocumentStat icon={PenLine} label="Awaiting signature" value={`${draftCount}`} detail="Action required" tone="attention" />
        </div>
      </header>

      <div className="flex overflow-x-auto rounded-xl border border-border bg-muted/35 p-1" aria-label="Document category filters">
        {DOCUMENT_TABS.map((tab) => (
          <Button
            key={tab}
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setSelectedTab(tab)}
            className={`h-8 shrink-0 rounded-lg px-3 text-[10px] font-bold ${selectedTab === tab ? "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground" : "text-primary hover:bg-card"}`}
          >
            {tab}
          </Button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border bg-card/75 p-2">
        <div className="relative min-w-60 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search document title or content…" className="h-9 pl-9 text-xs" />
        </div>
        <Button variant="outline" size="sm" onClick={() => notify("Date range")}> <CalendarDays className="size-4" /> 01 Jun 2026 – 16 Sep 2026</Button>
        <Select value={encounterFilter} onValueChange={setEncounterFilter}>
          <SelectTrigger className="h-9 w-44 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="All Encounters">All Encounters</SelectItem>
            {Array.from(new Set(documents.map((document) => document.encounter))).map((encounter) => <SelectItem key={encounter} value={encounter}>{encounter}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="h-9 w-40 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="All Statuses">All Statuses</SelectItem>
            <SelectItem value="Signed">Signed</SelectItem>
            <SelectItem value="Draft">Draft</SelectItem>
            <SelectItem value="Final">Final</SelectItem>
            <SelectItem value="Verified">Verified</SelectItem>
            <SelectItem value="Approved">Approved</SelectItem>
            <SelectItem value="Verified Copy">Verified Copy</SelectItem>
          </SelectContent>
        </Select>
        <div className="ml-auto flex items-center gap-2 rounded-lg border border-border bg-muted/30 px-3 py-2">
          <Switch id="signed-only" checked={signedOnly} onCheckedChange={setSignedOnly} />
          <Label htmlFor="signed-only" className="text-[10px] font-bold text-muted-foreground">Signed only</Label>
        </div>
      </div>

      <div className="grid gap-4 2xl:grid-cols-[minmax(460px,1.3fr)_minmax(300px,0.7fr)]">
        <DocumentTable documents={visibleDocuments} selectedId={selectedDocument?.id ?? ""} onSelect={openDocument} />
        {selectedDocument ? <DocumentSidePanel document={selectedDocument} signedCount={signedCount} onAction={notify} /> : <EmptyDocumentsPanel />}
      </div>

      <Dialog open={viewerOpen} onOpenChange={setViewerOpen}>
        <DialogContent className="max-h-[92vh] w-[min(96vw,900px)] overflow-y-auto p-0 sm:max-w-none">
          <DialogHeader className="border-b border-border px-4 py-3">
            <DialogTitle className="font-display text-base font-extrabold text-primary">{selectedDocument ? selectedDocument.title : "Document"}</DialogTitle>
            <DialogDescription className="text-[11px]">PDF viewer · {selectedDocument ? `${selectedDocument.format} · ${selectedDocument.size} · ${selectedDocument.pages} pages` : ""}</DialogDescription>
          </DialogHeader>
          {selectedDocument ? <DocumentPreview document={selectedDocument} patient={patient} onAction={notify} /> : null}
        </DialogContent>
      </Dialog>

      <footer className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border bg-card/85 p-3 shadow-panel">
        <Button variant="outline" size="sm" onClick={() => notify("Patient summary")}> <ChevronLeft className="size-4" /> Back to Patient Summary</Button>
        <span className="text-[10px] font-semibold text-muted-foreground">{visibleDocuments.length} documents shown · {selectedDocument ? selectedDocument.title : "No document selected"}</span>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => notify("Document download")}> <Download className="size-4" /> Download</Button>
          <Button variant="outline" size="sm" onClick={() => notify("Document print")}> <Printer className="size-4" /> Print</Button>
          <Button variant="outline" size="sm" onClick={() => notify("Secure sharing")}> <Send className="size-4" /> Share Securely</Button>
          <Button variant="outline" size="sm" onClick={() => notify("Clinical note attachment")}> <FilePlus2 className="size-4" /> Add to Clinical Note</Button>
          <Button size="sm" onClick={() => notify("Document changes")}> <ShieldCheck className="size-4" /> Save Document Changes</Button>
        </div>
      </footer>
    </section>
  );
}

function DocumentTable({ documents, selectedId, onSelect }: { documents: PatientDocument[]; selectedId: string; onSelect: (id: string) => void }) {
  return (
    <section className="overflow-hidden rounded-xl border border-border bg-card/80">
      <header className="flex items-center justify-between border-b border-border bg-muted/45 px-3 py-2">
        <h3 className="font-display text-sm font-extrabold text-primary">Patient Documents</h3>
        <span className="text-[10px] font-semibold text-muted-foreground">{documents.length} records</span>
      </header>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-[10px]">
          <thead className="border-b border-border bg-muted/30 text-muted-foreground">
            <tr>
              <th className="w-8 px-2 py-2"><span className="sr-only">Select</span></th>
              <th className="px-2 py-2 font-bold uppercase">Document</th>
              <th className="px-2 py-2 font-bold uppercase">Category</th>
              <th className="px-2 py-2 font-bold uppercase">Encounter / Date</th>
              <th className="px-2 py-2 font-bold uppercase">Author</th>
              <th className="px-2 py-2 font-bold uppercase">Status</th>
              <th className="px-2 py-2 font-bold uppercase">Version</th>
              <th className="px-2 py-2 text-right font-bold uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {documents.map((document) => {
              const isSelected = document.id === selectedId;
              const Icon = FileText;
              return (
                <tr key={document.id} className={isSelected ? "bg-primary/5" : "hover:bg-muted/25"}>
                  <td className="px-2 py-2"><Checkbox checked={isSelected} onCheckedChange={() => onSelect(document.id)} aria-label={`Select ${document.title}`} /></td>
                  <td className="px-2 py-2">
                    <button type="button" onClick={() => onSelect(document.id)} className="flex items-start gap-2 text-left">
                      <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md bg-destructive/10 text-destructive"><Icon className="size-4" /></span>
                      <span>
                        <span className="block font-bold text-primary">{document.title}</span>
                        <span className="text-muted-foreground">{document.format} · {document.size}</span>
                      </span>
                    </button>
                  </td>
                  <td className="px-2 py-2 text-muted-foreground">{document.category}</td>
                  <td className="px-2 py-2"><span className="font-semibold text-foreground">{document.encounter}</span><span className="block text-muted-foreground">{document.date}</span></td>
                  <td className="px-2 py-2 text-muted-foreground">{document.author}</td>
                  <td className="px-2 py-2"><DocumentStatusBadge status={document.status} /></td>
                  <td className="px-2 py-2 font-semibold text-primary">{document.version}</td>
                  <td className="px-2 py-2">
                    <div className="flex justify-end gap-1">
                      <Button type="button" size="icon" variant="outline" className="size-7" onClick={() => onSelect(document.id)} aria-label={`Preview ${document.title}`}><Eye className="size-3.5" /></Button>
                      <Button type="button" size="icon" variant="outline" className="size-7" aria-label={`Download ${document.title}`}><Download className="size-3.5" /></Button>
                      <Button type="button" size="icon" variant="ghost" className="size-7" aria-label={`More actions for ${document.title}`}><MoreVertical className="size-3.5" /></Button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {documents.length === 0 ? (
              <tr><td colSpan={8} className="px-3 py-8 text-center text-xs text-muted-foreground">No documents match the selected filters.</td></tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function DocumentPreview({ document, patient, onAction }: { document: PatientDocument; patient: ClinicalPatient; onAction: (message: string) => void }) {
  return (
    <section className="overflow-hidden rounded-xl border border-border bg-card/80">
      <header className="flex flex-wrap items-center justify-between gap-2 border-b border-border bg-muted/45 px-3 py-2">
        <h3 className="font-display text-sm font-extrabold text-primary">Document Preview</h3>
        <div className="flex items-center gap-1 text-[10px] text-primary">
          <Button variant="ghost" size="sm" className="h-7 px-2" onClick={() => onAction("Previous page")}><ChevronLeft className="size-3.5" /> Previous</Button>
          <Button variant="ghost" size="sm" className="h-7 px-2" onClick={() => onAction("Next page")}>Next <ChevronRight className="size-3.5" /></Button>
          <span className="rounded border border-border bg-card px-2 py-1 font-bold">1 / {document.pages}</span>
          <Button variant="outline" size="sm" className="h-7 px-2" onClick={() => onAction("Preview download")}><Download className="size-3.5" /> Download</Button>
          <Button variant="outline" size="sm" className="h-7 px-2" onClick={() => onAction("Preview print")}><Printer className="size-3.5" /> Print</Button>
        </div>
      </header>
      <div className="bg-muted/55 p-3">
        <article className="mx-auto min-h-[610px] max-w-xl rounded-sm border border-border bg-card p-6 shadow-panel">
          <div className="border-b border-primary/35 pb-4">
            <p className="text-[10px] font-bold uppercase text-muted-foreground">MediMind Hospital</p>
            <h4 className="mt-2 font-display text-xl font-extrabold text-primary">{document.title}</h4>
            <div className="mt-3 grid gap-1 text-[11px] sm:grid-cols-2">
              <p><span className="font-bold">Date:</span> {document.date}</p>
              <p><span className="font-bold">Author:</span> {document.author}</p>
              <p><span className="font-bold">Patient:</span> {patient.name}</p>
              <p><span className="font-bold">MRN:</span> {patient.mrn}</p>
              <p><span className="font-bold">Encounter:</span> {document.encounter}</p>
              <p><span className="font-bold">Status:</span> {document.status}</p>
            </div>
          </div>
          <div className="mt-5 space-y-4 text-[11px] leading-5">
            <p className="rounded-lg bg-primary/5 p-3 font-semibold text-primary">{document.summary}</p>
            {document.sections.map((section) => (
              <section key={section.title}>
                <h5 className="rounded bg-muted/70 px-2 py-1 text-xs font-extrabold text-primary">{section.title}</h5>
                <ol className="mt-2 list-decimal space-y-1 pl-5 text-muted-foreground">
                  {section.lines.map((line) => <li key={line}>{line}</li>)}
                </ol>
              </section>
            ))}
          </div>
          <div className="mt-8 grid gap-4 border-t border-border pt-4 sm:grid-cols-2">
            <div className="h-14 rounded border-b border-primary/50 px-3 pt-5 font-display text-lg italic text-primary">{document.author.split(" ").slice(-1)[0]}</div>
            <div className="flex items-end justify-end">
              <span className="inline-flex items-center gap-1 rounded-md bg-accent/10 px-2 py-1 text-[10px] font-bold text-accent"><ShieldCheck className="size-3.5" /> Digital Signature Verified</span>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}

function DocumentSidePanel({ document, signedCount, onAction }: { document: PatientDocument; signedCount: number; onAction: (message: string) => void }) {
  return (
    <aside className="space-y-3">
      <PanelShell title="Document Details" icon={FileText}>
        <DetailLine label="Document ID" value={document.id} />
        <DetailLine label="Category" value={document.category} />
        <DetailLine label="Format" value={document.format} />
        <DetailLine label="Size" value={document.size} />
        <DetailLine label="Source" value={document.source} />
        <DetailLine label="Confidentiality" value={document.confidentiality} />
        <DetailLine label="Encounter" value={document.encounter} />
        <DetailLine label="Created" value={document.date} />
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          <Button variant="outline" size="sm" onClick={() => onAction("Metadata edit")}><PenLine className="size-4" /> Edit Metadata</Button>
          <Button variant="outline" size="sm" onClick={() => onAction("Encounter open")}><FileCheck2 className="size-4" /> Open Encounter</Button>
        </div>
      </PanelShell>

      <PanelShell title="Signature & Verification" icon={ShieldCheck}>
        <DetailLine label="Status" value={document.status} success />
        <DetailLine label="Signer" value={document.author} />
        <DetailLine label="Signed date" value={document.signedAt ?? "Awaiting signature"} />
        <div className="mt-3 space-y-2 text-[11px] text-accent">
          <p className="flex items-center gap-2"><CheckCircle2 className="size-4" /> Digital signature verified</p>
          <p className="flex items-center gap-2"><CheckCircle2 className="size-4" /> Document hash verified</p>
        </div>
        <Button className="mt-3 w-full" size="sm" onClick={() => onAction("Signature certificate")}> <ShieldCheck className="size-4" /> View Signature Certificate</Button>
      </PanelShell>

      <PanelShell title="Version History" icon={History}>
        <div className="space-y-2">
          {document.versions.map((version) => (
            <div key={version.version} className="flex items-center justify-between gap-2 rounded-lg border border-border bg-muted/25 p-2 text-[10px]">
              <div><p className="font-extrabold text-primary">{version.version}</p><p className="text-muted-foreground">{version.status}</p></div>
              <span className="text-right font-semibold text-muted-foreground">{version.date}</span>
            </div>
          ))}
        </div>
        <Button variant="outline" size="sm" className="mt-3 w-full" onClick={() => onAction("Version comparison")}>Compare Versions</Button>
      </PanelShell>

      <PanelShell title="Related Documents" icon={Link2}>
        <div className="space-y-2">
          {document.related.map((related) => (
            <div key={`${related.title}-${related.date}`} className="flex items-center justify-between gap-2 text-[10px]">
              <div><p className="font-bold text-primary">{related.title}</p><p className="text-muted-foreground">{related.category}</p></div>
              <span className="text-muted-foreground">{related.date}</span>
            </div>
          ))}
        </div>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          <Button variant="outline" size="sm" onClick={() => onAction("Document link")}>Link Document</Button>
          <Button variant="outline" size="sm" onClick={() => onAction("Related documents")}>View All</Button>
        </div>
      </PanelShell>

      <PanelShell title="Upload New Document" icon={Upload}>
        <div className="rounded-lg border border-dashed border-primary/40 bg-primary/5 p-4 text-center">
          <Upload className="mx-auto size-6 text-primary" />
          <p className="mt-2 text-xs font-bold text-primary">Drag and drop a file here</p>
          <p className="text-[10px] text-muted-foreground">PDF, DOCX, JPG, PNG or DICOM reference</p>
        </div>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          <div className="space-y-1"><Label className="text-[10px]">Document title</Label><Input className="h-8 text-xs" placeholder="Enter document title" /></div>
          <div className="space-y-1"><Label className="text-[10px]">Category</Label><Select defaultValue="Clinical Note"><SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Clinical Note">Clinical Note</SelectItem><SelectItem value="Radiology">Radiology</SelectItem><SelectItem value="Consent">Consent</SelectItem></SelectContent></Select></div>
          <div className="space-y-1"><Label className="text-[10px]">Author / Source</Label><Input className="h-8 text-xs" placeholder="Enter author/source" /></div>
          <div className="space-y-1"><Label className="text-[10px]">Indexed signed docs</Label><Input className="h-8 text-xs" value={`${signedCount}`} readOnly /></div>
        </div>
        <Textarea className="mt-2 min-h-16 text-xs" placeholder="Add notes" />
      </PanelShell>
    </aside>
  );
}

function DocumentStat({ icon: Icon, label, value, detail, tone = "default" }: { icon: typeof FileText; label: string; value: string; detail: string; tone?: "default" | "success" | "warning" | "attention" }) {
  const tones = {
    default: "text-primary bg-primary/5",
    success: "text-accent bg-accent/10",
    warning: "text-chart-4 bg-chart-4/10",
    attention: "text-destructive bg-destructive/10",
  };
  return (
    <div className="flex min-h-20 items-center gap-3 bg-card p-3">
      <span className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${tones[tone]}`}><Icon className="size-5" /></span>
      <div>
        <p className="text-[10px] font-bold text-primary">{label}</p>
        <p className="font-display text-xl font-extrabold text-primary">{value}</p>
        <p className="text-[9px] text-muted-foreground">{detail}</p>
      </div>
    </div>
  );
}

function PanelShell({ title, icon: Icon, children }: { title: string; icon: typeof FileText; children: ReactNode }) {
  return (
    <section className="overflow-hidden rounded-xl border border-border bg-card/80">
      <header className="flex items-center gap-2 border-b border-border bg-muted/45 px-3 py-2 font-display text-sm font-extrabold text-primary"><Icon className="size-4" />{title}</header>
      <div className="p-3">{children}</div>
    </section>
  );
}

function DetailLine({ label, value, success = false }: { label: string; value: string; success?: boolean }) {
  return <div className="flex items-center justify-between gap-3 border-b border-border/70 py-1.5 text-[10px] last:border-0"><span className="text-muted-foreground">{label}</span><span className={`text-right font-semibold ${success ? "text-accent" : "text-foreground"}`}>{value}</span></div>;
}

function DocumentStatusBadge({ status }: { status: DocumentStatus }) {
  const tones: Record<DocumentStatus, string> = {
    Signed: "bg-accent/10 text-accent",
    Draft: "bg-chart-4/10 text-chart-4",
    Final: "bg-primary/10 text-primary",
    Verified: "bg-accent/10 text-accent",
    Approved: "bg-primary/10 text-primary",
    "Verified Copy": "bg-accent/10 text-accent",
  };
  return <span className={`rounded px-2 py-1 text-[9px] font-bold uppercase ${tones[status]}`}>{status}</span>;
}

function EmptyDocumentsPanel() {
  return <section className="rounded-xl border border-border bg-card/80 p-8 text-center text-sm text-muted-foreground">No document is selected.</section>;
}

function documentMatchesTab(document: PatientDocument, tab: string) {
  if (tab === "All Documents") return true;
  if (tab === "Clinical Notes") return document.category === "Clinical Note";
  if (tab === "External Records") return document.category === "External Record";
  if (tab === "Procedures") return document.category === "Procedure Report";
  return document.category === tab;
}

function getPatientDocuments(patient: ClinicalPatient): PatientDocument[] {
  const encounter = patient.encounter.number;
  const consultant = patient.encounter.consultant;
  return [
    {
      id: "DOC-2026-00482",
      title: `${patient.encounter.ward} Progress Note`,
      category: "Clinical Note",
      encounter,
      date: "16 Sep 2026, 09:40 AM",
      author: consultant,
      status: "Signed",
      version: "v2",
      format: "PDF",
      size: "245 KB",
      source: "EMR",
      confidentiality: "Clinical",
      pages: 2,
      signedAt: "16 Sep 2026, 09:45 AM",
      summary: `Follow-up progress note for ${patient.name} documenting current symptoms, observations, active problems and immediate plan.`,
      sections: [
        { title: "Subjective", lines: ["Patient reports improved comfort with no new acute concerns.", "Medication tolerance and nursing observations reviewed."] },
        { title: "Objective", lines: [`Current location: room ${patient.room}.`, `Active concern: ${patient.encounter.complaint}.`, `Key risks: ${patient.risks.join(", ")}.`] },
        { title: "Assessment", lines: patient.diagnoses.slice(0, 3).map((diagnosis) => `${diagnosis.condition} (${diagnosis.code})`) },
        { title: "Plan", lines: [patient.nextAction, "Continue monitoring active orders and update patient record after review."] },
      ],
      related: [
        { title: "Medication Orders", date: "15 Sep 2026", category: "Laboratory" },
        { title: "Clinical Assessment", date: "15 Sep 2026", category: "Clinical Note" },
        { title: "Consent Verification", date: "15 Sep 2026", category: "Consent" },
      ],
      versions: [{ version: "v2", date: "16 Sep 2026, 09:45 AM", status: "Signed" }, { version: "v1", date: "16 Sep 2026, 09:20 AM", status: "Draft" }],
    },
    {
      id: "DOC-2026-00431",
      title: "Discharge Summary Draft",
      category: "Discharge",
      encounter,
      date: "16 Sep 2026",
      author: consultant,
      status: "Draft",
      version: "v1",
      format: "PDF",
      size: "188 KB",
      source: "EMR",
      confidentiality: "Clinical",
      pages: 3,
      summary: "Draft discharge summary capturing diagnosis, medications, pending results and follow-up instructions.",
      sections: [
        { title: "Discharge readiness", lines: ["Pending consultant review and medication reconciliation.", "Follow-up appointment and warning signs to be confirmed."] },
        { title: "Medication plan", lines: patient.medications.slice(0, 3).map((medication) => `${medication.name} ${medication.strength} — ${medication.frequency}`) },
      ],
      related: [{ title: "Progress Note", date: "16 Sep 2026", category: "Clinical Note" }, { title: "Laboratory Results Summary", date: "16 Sep 2026", category: "Laboratory" }],
      versions: [{ version: "v1", date: "16 Sep 2026", status: "Draft" }],
    },
    {
      id: "DOC-2026-00372",
      title: "Procedure Report",
      category: "Procedure Report",
      encounter,
      date: "15 Sep 2026",
      author: "Dr. Omar Hassan",
      status: "Signed",
      version: "v1",
      format: "PDF",
      size: "318 KB",
      source: "EMR",
      confidentiality: "Restricted",
      pages: 4,
      signedAt: "15 Sep 2026, 03:25 PM",
      summary: "Procedure documentation with indication, findings, immediate outcome and post-procedure instructions.",
      sections: [
        { title: "Indication", lines: [patient.encounter.complaint, "Procedure performed after consent and safety checks."] },
        { title: "Outcome", lines: ["Procedure completed without immediate complication.", "Post-procedure monitoring plan documented."] },
      ],
      related: [{ title: "General Consent for Treatment", date: "15 Sep 2026", category: "Consent" }, { title: "Progress Note", date: "16 Sep 2026", category: "Clinical Note" }],
      versions: [{ version: "v1", date: "15 Sep 2026", status: "Signed" }],
    },
    {
      id: "DOC-2026-00344",
      title: "Chest X-ray Report",
      category: "Radiology",
      encounter,
      date: "15 Sep 2026",
      author: "Dr. Neha Menon",
      status: "Final",
      version: "v1",
      format: "PDF",
      size: "1.4 MB",
      source: "EMR",
      confidentiality: "Clinical",
      pages: 1,
      signedAt: "15 Sep 2026, 02:10 PM",
      summary: "Radiology report with final interpretation and comparison to prior imaging where available.",
      sections: [{ title: "Findings", lines: ["No acute cardiopulmonary abnormality reported.", "Images available through diagnostic viewer."] }],
      related: [{ title: "Progress Note", date: "16 Sep 2026", category: "Clinical Note" }],
      versions: [{ version: "v1", date: "15 Sep 2026", status: "Final" }],
    },
    {
      id: "DOC-2026-00312",
      title: "Laboratory Results Summary",
      category: "Laboratory",
      encounter,
      date: "16 Sep 2026",
      author: "Main Laboratory",
      status: "Verified",
      version: "v1",
      format: "PDF",
      size: "96 KB",
      source: "Laboratory",
      confidentiality: "Clinical",
      pages: 2,
      signedAt: "16 Sep 2026, 08:55 AM",
      summary: "Consolidated laboratory report for current encounter with verified result status.",
      sections: [{ title: "Key results", lines: ["Abnormal values highlighted for clinician acknowledgement.", "Trend comparison available from the Results tab."] }],
      related: [{ title: "Progress Note", date: "16 Sep 2026", category: "Clinical Note" }],
      versions: [{ version: "v1", date: "16 Sep 2026", status: "Verified" }],
    },
    {
      id: "DOC-2026-00218",
      title: "General Consent for Treatment",
      category: "Consent",
      encounter,
      date: "15 Sep 2026",
      author: patient.name,
      status: "Signed",
      version: "v1",
      format: "PDF",
      size: "122 KB",
      source: "Patient supplied",
      confidentiality: "Administrative",
      pages: 2,
      signedAt: "15 Sep 2026, 09:18 AM",
      summary: "Signed consent form for treatment, information sharing and routine clinical documentation.",
      sections: [{ title: "Consent scope", lines: ["General treatment consent signed by patient or responsible guardian.", "Identity and witness checks completed."] }],
      related: [{ title: "Procedure Report", date: "15 Sep 2026", category: "Procedure Report" }],
      versions: [{ version: "v1", date: "15 Sep 2026", status: "Signed" }],
    },
    {
      id: "DOC-2026-00176",
      title: "External Specialist Report",
      category: "External Record",
      encounter: patient.encounters[1]?.number ?? encounter,
      date: "10 Aug 2026",
      author: "City Heart Clinic",
      status: "Verified Copy",
      version: "v1",
      format: "PDF",
      size: "288 KB",
      source: "External clinic",
      confidentiality: "Clinical",
      pages: 5,
      signedAt: "10 Aug 2026, 01:30 PM",
      summary: "External clinic report imported into the patient chart and verified as a copy.",
      sections: [{ title: "External summary", lines: ["Specialist assessment imported for continuity of care.", "Clinician review recommended before medication or pathway changes."] }],
      related: [{ title: "Progress Note", date: "16 Sep 2026", category: "Clinical Note" }],
      versions: [{ version: "v1", date: "10 Aug 2026", status: "Verified Copy" }],
    },
    {
      id: "DOC-2026-00121",
      title: "Insurance Approval Letter",
      category: "Insurance",
      encounter,
      date: "14 Sep 2026",
      author: "Daman Health",
      status: "Approved",
      version: "v1",
      format: "PDF",
      size: "164 KB",
      source: "External clinic",
      confidentiality: "Administrative",
      pages: 1,
      signedAt: "14 Sep 2026, 04:20 PM",
      summary: "Payer approval document linked to the current encounter and administrative billing record.",
      sections: [{ title: "Approval details", lines: ["Coverage approval received before encounter processing.", "Administrative copy retained in document index."] }],
      related: [{ title: "General Consent for Treatment", date: "15 Sep 2026", category: "Consent" }],
      versions: [{ version: "v1", date: "14 Sep 2026", status: "Approved" }],
    },
  ];
}