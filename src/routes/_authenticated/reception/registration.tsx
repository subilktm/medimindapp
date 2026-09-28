import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import {
  UserPlus,
  Users,
  FileUp,
  ShieldCheck,
  Trash2,
  Plus,
  Save,
  ScanLine,
  IdCard,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_authenticated/reception/registration")({
  head: () => ({
    meta: [
      { title: "Patient registration — MediMind front desk" },
      {
        name: "description",
        content: "Enrol new patients and keep their demographic and contact details up to date.",
      },
      { property: "og:title", content: "Patient registration — MediMind front desk" },
      {
        property: "og:description",
        content: "Enrol new patients and keep their details up to date.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PatientRegistrationPage,
});

const EMIRATES = [
  "Abu Dhabi",
  "Dubai",
  "Sharjah",
  "Ajman",
  "Umm Al Quwain",
  "Ras Al Khaimah",
  "Fujairah",
];

const NATIONALITIES = [
  "United Arab Emirates",
  "India",
  "Pakistan",
  "Philippines",
  "Egypt",
  "Jordan",
  "United Kingdom",
  "United States",
  "Other",
];

type KinEntry = { id: number; name: string; relationship: string; phone: string };
type DocEntry = {
  id: number;
  docType: string;
  docName: string;
  uploadedOn: string;
  fileName: string;
};
type CopayEntry = {
  consultation: string;
  pharmacy: string;
  laboratory: string;
  radiology: string;
  procedure: string;
};
type InsuranceEntry = {
  id: number;
  payer: string;
  policyNo: string;
  memberNo: string;
  expiryDate: string;
  coverageTypes: string[];
  annualLimit: string;
  availableBalance: string;
  copay: CopayEntry;
  coinsurance: string;
  deductible: string;
  maxPatientShare: string;
  roomEntitlement: string;
  referralRequired: boolean;
  priorApprovalRequired: boolean;
  waitingPeriodActive: boolean;
  limitations: string;
  exclusions: string;
  fileName: string;
};

const DOC_TYPES = ["Emirates ID", "Passport", "Visa", "Referral letter", "Lab report", "Other"];

const COVERAGE_TYPES = ["Outpatient (OP)", "Inpatient (IP)", "Dental", "Optical", "Maternity"];

let nextId = 1;

function PatientRegistrationPage() {
  const [form, setForm] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    address: "",
    landline: "",
    mobile: "",
    emirate: "",
    nationality: "",
    preferredLanguage: "",
    maritalStatus: "",
    dob: "",
    gender: "",
    identityType: "",
    identityNumber: "",
  });
  const [kin, setKin] = useState<KinEntry[]>([
    { id: nextId++, name: "", relationship: "", phone: "" },
  ]);
  const [docs, setDocs] = useState<DocEntry[]>([]);
  const [insurance, setInsurance] = useState<InsuranceEntry[]>([]);
  const readInput = useRef<HTMLInputElement>(null);
  const scanInput = useRef<HTMLInputElement>(null);
  const [readingId, setReadingId] = useState(false);
  const [readResult, setReadResult] = useState<{ number: string; text: string } | null>(null);

  const set =
    (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));
  const setSelect = (key: keyof typeof form) => (value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  const updateKin = (id: number, key: keyof Omit<KinEntry, "id">, value: string) =>
    setKin((list) => list.map((k) => (k.id === id ? { ...k, [key]: value } : k)));

  const [pendingDoc, setPendingDoc] = useState({ docType: "", docName: "" });

  const addDocument = (files: FileList | null) => {
    if (!files?.length) return;
    const today = new Date().toISOString().slice(0, 10);
    setDocs((list) => [
      ...list,
      ...Array.from(files).map((f) => ({
        id: nextId++,
        docType: pendingDoc.docType || "Other",
        docName: pendingDoc.docName.trim() || f.name,
        uploadedOn: today,
        fileName: f.name,
      })),
    ]);
    setPendingDoc({ docType: "", docName: "" });
  };

  const addInsurance = () =>
    setInsurance((list) => [
      ...list,
      {
        id: nextId++,
        payer: "",
        policyNo: "",
        memberNo: "",
        expiryDate: "",
        coverageTypes: [],
        annualLimit: "",
        availableBalance: "",
        copay: { consultation: "", pharmacy: "", laboratory: "", radiology: "", procedure: "" },
        coinsurance: "",
        deductible: "",
        maxPatientShare: "",
        roomEntitlement: "",
        referralRequired: false,
        priorApprovalRequired: false,
        waitingPeriodActive: false,
        limitations: "",
        exclusions: "",
        fileName: "",
      },
    ]);

  const updateInsurance = (id: number, key: keyof Omit<InsuranceEntry, "id" | "copay">, value: string) =>
    setInsurance((list) => list.map((i) => (i.id === id ? { ...i, [key]: value } : i)));

  const updateInsuranceCopay = (
    id: number,
    key: keyof Omit<InsuranceEntry, "id">["copay"],
    value: string,
  ) =>
    setInsurance((list) =>
      list.map((i) => (i.id === id ? { ...i, copay: { ...i.copay, [key]: value } } : i)),
    );

  const setInsuranceFlag = (id: number, key: "referralRequired" | "priorApprovalRequired" | "waitingPeriodActive", value: boolean) =>
    setInsurance((list) => list.map((i) => (i.id === id ? { ...i, [key]: value } : i)));

  const toggleInsuranceCoverage = (id: number, type: string) =>
    setInsurance((list) =>
      list.map((i) =>
        i.id === id
          ? {
              ...i,
              coverageTypes: i.coverageTypes.includes(type)
                ? i.coverageTypes.filter((t) => t !== type)
                : [...i.coverageTypes, type],
            }
          : i,
      ),
    );

  const readEmiratesId = async (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith("image/") || file.size > 10 * 1024 * 1024) {
      toast.error("Choose an image smaller than 10 MB.");
      return;
    }
    setReadingId(true);
    try {
      const { createWorker } = await import("tesseract.js");
      const worker = await createWorker("eng");
      let text = "";
      try {
        const result = await worker.recognize(file);
        text = result.data.text;
      } finally {
        await worker.terminate();
      }
      const number =
        text
          .match(/784[\s-]*\d{4}[\s-]*\d{7}[\s-]*\d/i)?.[0]
          ?.replace(/\D/g, "")
          .replace(/^(784)(\d{4})(\d{7})(\d)$/, "$1-$2-$3-$4") ?? "";
      setReadResult({ number, text: text.trim().slice(0, 1500) });
      if (!number)
        toast.info(
          "No Emirates ID number was detected. Review the scan and enter it manually if needed.",
        );
    } catch {
      toast.error("Could not read the image. Please enter the ID number manually.");
    } finally {
      setReadingId(false);
    }
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.firstName.trim() || !form.lastName.trim()) {
      toast.error("First name and last name are required.");
      return;
    }
    if (!form.mobile.trim()) {
      toast.error("Mobile number is required.");
      return;
    }
    toast.info("Patient details entered. Saving to patient records is not available yet.");
  };

  return (
    <form onSubmit={submit} className="mx-auto max-w-4xl space-y-6 p-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Registration
          </p>
          <h1 className="text-2xl font-semibold tracking-tight">Patient registration</h1>
          <p className="text-sm text-muted-foreground">
            Enter the patient's identity and contact details.
          </p>
        </div>
      </header>

      <Card>
        <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3 space-y-0">
          <CardTitle className="flex items-center gap-2 text-base">
            <UserPlus className="h-4 w-4 text-primary" /> Patient details
          </CardTitle>
          <Button type="submit" className="gap-2">
            <Save className="h-4 w-4" /> Save Patient
          </Button>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="First name" required>
            <Input value={form.firstName} onChange={set("firstName")} placeholder="Fatima" />
          </Field>
          <Field label="Middle name">
            <Input value={form.middleName} onChange={set("middleName")} placeholder="Ali" />
          </Field>
          <Field label="Last name" required>
            <Input value={form.lastName} onChange={set("lastName")} placeholder="Al Mansoori" />
          </Field>
          <Field label="Date of birth">
            <Input type="date" value={form.dob} onChange={set("dob")} />
          </Field>
          <Field label="Gender">
            <Select value={form.gender} onValueChange={setSelect("gender")}>
              <SelectTrigger>
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="female">Female</SelectItem>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Nationality">
            <Select value={form.nationality} onValueChange={setSelect("nationality")}>
              <SelectTrigger>
                <SelectValue placeholder="Select nationality" />
              </SelectTrigger>
              <SelectContent>
                {NATIONALITIES.map((n) => (
                  <SelectItem key={n} value={n}>
                    {n}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Preferred language">
            <Select value={form.preferredLanguage} onValueChange={setSelect("preferredLanguage")}>
              <SelectTrigger>
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                {["Arabic", "English", "Hindi", "Urdu", "Malayalam", "Tagalog", "Other"].map(
                  (language) => (
                    <SelectItem key={language} value={language}>
                      {language}
                    </SelectItem>
                  ),
                )}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Marital status">
            <Select value={form.maritalStatus} onValueChange={setSelect("maritalStatus")}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {["Single", "Married", "Divorced", "Widowed", "Separated", "Prefer not to say"].map(
                  (status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ),
                )}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Emirate">
            <Select value={form.emirate} onValueChange={setSelect("emirate")}>
              <SelectTrigger>
                <SelectValue placeholder="Select emirate" />
              </SelectTrigger>
              <SelectContent>
                {EMIRATES.map((e) => (
                  <SelectItem key={e} value={e}>
                    {e}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Mobile" required>
            <Input value={form.mobile} onChange={set("mobile")} placeholder="+971 5x xxx xxxx" />
          </Field>
          <Field label="Landline">
            <Input value={form.landline} onChange={set("landline")} placeholder="04 xxx xxxx" />
          </Field>
          <div className="sm:col-span-2 lg:col-span-3">
            <Field label="Address">
              <Textarea
                value={form.address}
                onChange={set("address")}
                placeholder="Building, street, area"
                rows={3}
                maxLength={500}
              />
            </Field>
          </div>
          <Field label="Identity type">
            <Select value={form.identityType} onValueChange={setSelect("identityType")}>
              <SelectTrigger>
                <SelectValue placeholder="Select identity type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="emirates-id">Emirates ID</SelectItem>
                <SelectItem value="passport">Passport</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Identity number">
            <Input
              value={form.identityNumber}
              onChange={set("identityNumber")}
              placeholder={
                form.identityType === "passport" ? "Passport number" : "784-xxxx-xxxxxxx-x"
              }
            />
          </Field>
          <div className="flex flex-wrap items-end gap-2 sm:col-span-2 lg:col-span-3">
            <Button
              type="button"
              variant="outline"
              className="gap-2"
              disabled={readingId}
              onClick={() => readInput.current?.click()}
            >
              <IdCard className="h-4 w-4" /> Read Emirates ID
            </Button>
            <Button
              type="button"
              variant="outline"
              className="gap-2"
              disabled={readingId}
              onClick={() => scanInput.current?.click()}
            >
              <ScanLine className="h-4 w-4" /> Scan Emirates ID
            </Button>
            {readingId && (
              <span role="status" className="text-sm text-muted-foreground">
                Reading ID image…
              </span>
            )}
            <input
              ref={readInput}
              type="file"
              accept="image/*"
              className="hidden"
              aria-label="Choose Emirates ID image"
              onChange={(e) => {
                void readEmiratesId(e.target.files?.[0]);
                e.target.value = "";
              }}
            />
            <input
              ref={scanInput}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              aria-label="Capture Emirates ID image"
              onChange={(e) => {
                void readEmiratesId(e.target.files?.[0]);
                e.target.value = "";
              }}
            />
          </div>
        </CardContent>
      </Card>

      <Dialog
        open={readResult !== null}
        onOpenChange={(open) => {
          if (!open) setReadResult(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Review Emirates ID</DialogTitle>
            <DialogDescription>
              Check the number against the card before adding it to the form. The image is processed
              on this device.
            </DialogDescription>
          </DialogHeader>
          <Field label="Identity number">
            <Input
              value={readResult?.number ?? ""}
              onChange={(e) =>
                setReadResult((current) =>
                  current ? { ...current, number: e.target.value } : null,
                )
              }
              placeholder="784-xxxx-xxxxxxx-x"
              maxLength={30}
            />
          </Field>
          {readResult?.text && (
            <div className="max-h-36 overflow-auto whitespace-pre-wrap rounded-md border border-border bg-muted p-3 text-xs text-muted-foreground">
              {readResult.text}
            </div>
          )}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setReadResult(null)}>
              Cancel
            </Button>
            <Button
              type="button"
              disabled={!readResult?.number.trim()}
              onClick={() => {
                if (!readResult?.number.trim()) return;
                setForm((current) => ({
                  ...current,
                  identityType: "emirates-id",
                  identityNumber: readResult.number.trim(),
                }));
                setReadResult(null);
              }}
            >
              Use ID number
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="flex items-center gap-2 text-base">
            <Users className="h-4 w-4 text-primary" /> Next of kin
          </CardTitle>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-1"
            onClick={() =>
              setKin((list) => [...list, { id: nextId++, name: "", relationship: "", phone: "" }])
            }
          >
            <Plus className="h-3.5 w-3.5" /> Add contact
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {kin.map((k, index) => (
            <div
              key={k.id}
              className="grid gap-4 rounded-lg border border-border/60 bg-muted/30 p-4 sm:grid-cols-3"
            >
              <Field label={`Full name ${index + 1}`}>
                <Input
                  value={k.name}
                  onChange={(e) => updateKin(k.id, "name", e.target.value)}
                  placeholder="Contact name"
                />
              </Field>
              <Field label="Relationship">
                <Input
                  value={k.relationship}
                  onChange={(e) => updateKin(k.id, "relationship", e.target.value)}
                  placeholder="Spouse, parent, sibling…"
                />
              </Field>
              <div className="flex items-end gap-2">
                <Field label="Phone" className="flex-1">
                  <Input
                    value={k.phone}
                    onChange={(e) => updateKin(k.id, "phone", e.target.value)}
                    placeholder="+971 5x xxx xxxx"
                  />
                </Field>
                {kin.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label="Remove contact"
                    onClick={() => setKin((list) => list.filter((x) => x.id !== k.id))}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="flex items-center gap-2 text-base">
            <FileUp className="h-4 w-4 text-primary" /> Documents
          </CardTitle>
          <Button type="button" variant="outline" size="sm" className="gap-1" asChild>
            <label className="cursor-pointer">
              <Plus className="h-3.5 w-3.5" /> Add document
              <input
                type="file"
                multiple
                className="hidden"
                onChange={(e) => {
                  addDocument(e.target.files);
                  e.target.value = "";
                }}
              />
            </label>
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Document type">
              <Select
                value={pendingDoc.docType}
                onValueChange={(v) => setPendingDoc((d) => ({ ...d, docType: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select document type" />
                </SelectTrigger>
                <SelectContent>
                  {DOC_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Document name">
              <Input
                value={pendingDoc.docName}
                onChange={(e) => setPendingDoc((d) => ({ ...d, docName: e.target.value }))}
                placeholder="e.g. Emirates ID front"
              />
            </Field>
          </div>
          {docs.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No documents attached. Add Emirates ID, passport copy, or referral letters.
            </p>
          ) : (
            <ul className="space-y-2">
              {docs.map((d) => (
                <li
                  key={d.id}
                  className="flex items-center justify-between gap-3 rounded-lg border border-border/60 bg-muted/30 px-3 py-2 text-sm"
                >
                  <div className="flex min-w-0 flex-wrap items-center gap-2">
                    <Badge variant="secondary">{d.docType}</Badge>
                    <span className="truncate font-medium">{d.docName}</span>
                    <span className="text-xs text-muted-foreground">Uploaded {d.uploadedOn}</span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label="Remove document"
                    onClick={() => setDocs((list) => list.filter((x) => x.id !== d.id))}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="flex items-center gap-2 text-base">
            <ShieldCheck className="h-4 w-4 text-primary" /> Insurance cards
          </CardTitle>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-1"
            onClick={addInsurance}
          >
            <Plus className="h-3.5 w-3.5" /> Add insurance card
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {insurance.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No insurance on file. Add a payer and card image for billing.
            </p>
          ) : (
            insurance.map((ins, index) => (
              <div
                key={ins.id}
                className="space-y-4 rounded-lg border border-border/60 bg-muted/30 p-4"
              >
                <div className="flex items-center justify-between">
                  <Badge variant="secondary">Card {index + 1}</Badge>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label="Remove insurance card"
                    onClick={() => setInsurance((list) => list.filter((x) => x.id !== ins.id))}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <Field label="Payer / insurer">
                    <Input
                      value={ins.payer}
                      onChange={(e) => updateInsurance(ins.id, "payer", e.target.value)}
                      placeholder="Daman, AXA, MetLife…"
                    />
                  </Field>
                  <Field label="Policy number">
                    <Input
                      value={ins.policyNo}
                      onChange={(e) => updateInsurance(ins.id, "policyNo", e.target.value)}
                    />
                  </Field>
                  <Field label="Member number">
                    <Input
                      value={ins.memberNo}
                      onChange={(e) => updateInsurance(ins.id, "memberNo", e.target.value)}
                    />
                  </Field>
                  <Field label="Expiry date">
                    <Input
                      type="date"
                      value={ins.expiryDate}
                      onChange={(e) => updateInsurance(ins.id, "expiryDate", e.target.value)}
                    />
                  </Field>
                </div>

                <div>
                  <Label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                    Coverage type
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {COVERAGE_TYPES.map((type) => {
                      const active = ins.coverageTypes.includes(type);
                      return (
                        <button
                          key={type}
                          type="button"
                          aria-pressed={active}
                          onClick={() => toggleInsuranceCoverage(ins.id, type)}
                          className={
                            active
                              ? "rounded-full border border-primary bg-primary px-3 py-1 text-xs font-medium text-primary-foreground"
                              : "rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground"
                          }
                        >
                          {type}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <Field label="Annual limit (AED)">
                    <Input
                      value={ins.annualLimit}
                      onChange={(e) => updateInsurance(ins.id, "annualLimit", e.target.value)}
                      inputMode="decimal"
                      placeholder="e.g. 150000"
                    />
                  </Field>
                  <Field label="Available balance (AED)">
                    <Input
                      value={ins.availableBalance}
                      onChange={(e) =>
                        updateInsurance(ins.id, "availableBalance", e.target.value)
                      }
                      inputMode="decimal"
                      placeholder="As supplied by payer"
                    />
                  </Field>
                  <Field label="Room entitlement">
                    <Input
                      value={ins.roomEntitlement}
                      onChange={(e) =>
                        updateInsurance(ins.id, "roomEntitlement", e.target.value)
                      }
                      placeholder="e.g. Private room, semi-private ward"
                    />
                  </Field>
                </div>

                <div className="rounded-lg border border-border/60 bg-card/60 p-3">
                  <Label className="mb-2 block text-xs font-medium text-muted-foreground">
                    Copayments (AED)
                  </Label>
                  <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
                    {(
                      [
                        ["consultation", "Consultation"],
                        ["pharmacy", "Pharmacy"],
                        ["laboratory", "Laboratory"],
                        ["radiology", "Radiology"],
                        ["procedure", "Procedure"],
                      ] as const
                    ).map(([key, label]) => (
                      <Field label={label} key={key}>
                        <Input
                          value={ins.copay[key]}
                          onChange={(e) => updateInsuranceCopay(ins.id, key, e.target.value)}
                          inputMode="decimal"
                          placeholder="0.00"
                        />
                      </Field>
                    ))}
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <Field label="Coinsurance (%)">
                    <Input
                      value={ins.coinsurance}
                      onChange={(e) => updateInsurance(ins.id, "coinsurance", e.target.value)}
                      inputMode="decimal"
                      placeholder="e.g. 20"
                    />
                  </Field>
                  <Field label="Deductible (AED)">
                    <Input
                      value={ins.deductible}
                      onChange={(e) => updateInsurance(ins.id, "deductible", e.target.value)}
                      inputMode="decimal"
                      placeholder="e.g. 500"
                    />
                  </Field>
                  <Field label="Maximum patient share (AED)">
                    <Input
                      value={ins.maxPatientShare}
                      onChange={(e) =>
                        updateInsurance(ins.id, "maxPatientShare", e.target.value)
                      }
                      inputMode="decimal"
                      placeholder="e.g. 1000 per episode"
                    />
                  </Field>
                </div>

                <div className="flex flex-wrap gap-x-8 gap-y-3">
                  {(
                    [
                      ["referralRequired", "Referral required"],
                      ["priorApprovalRequired", "Prior approval required"],
                      ["waitingPeriodActive", "Waiting period applies"],
                    ] as const
                  ).map(([key, label]) => (
                    <label
                      key={key}
                      className="flex items-center gap-2 text-sm font-medium text-foreground"
                    >
                      <Switch
                        checked={ins[key]}
                        onCheckedChange={(checked) => setInsuranceFlag(ins.id, key, checked)}
                      />
                      {label}
                    </label>
                  ))}
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                  <Field label="Coverage limitations">
                    <Textarea
                      value={ins.limitations}
                      onChange={(e) => updateInsurance(ins.id, "limitations", e.target.value)}
                      rows={3}
                      maxLength={500}
                      placeholder="Caps, sub-limits, visit limits…"
                    />
                  </Field>
                  <Field label="Exclusions">
                    <Textarea
                      value={ins.exclusions}
                      onChange={(e) => updateInsurance(ins.id, "exclusions", e.target.value)}
                      rows={3}
                      maxLength={500}
                      placeholder="Services not covered by this card…"
                    />
                  </Field>
                </div>
                <div className="flex items-center gap-3">
                  <Button type="button" variant="outline" size="sm" className="gap-1" asChild>
                    <label className="cursor-pointer">
                      <FileUp className="h-3.5 w-3.5" /> Attach card image
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) updateInsurance(ins.id, "fileName", file.name);
                          e.target.value = "";
                        }}
                      />
                    </label>
                  </Button>
                  {ins.fileName && (
                    <span className="truncate text-sm text-muted-foreground">{ins.fileName}</span>
                  )}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </form>
  );
}

function Field({
  label,
  required,
  className,
  children,
}: {
  label: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <Label className="mb-1.5 block text-xs font-medium text-muted-foreground">
        {label}
        {required && <span className="text-destructive"> *</span>}
      </Label>
      {children}
    </div>
  );
}
