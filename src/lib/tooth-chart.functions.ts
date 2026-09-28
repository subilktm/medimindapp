import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type StoredToothEntry = {
  tooth: string;
  toothState: string;
  surfaces: Record<string, string>;
  updatedBy: string;
  updatedAt: string;
};

export type ChartAuditEntry = {
  id: string;
  tooth: string;
  surface: string | null;
  action: string;
  previousValue: string | null;
  newValue: string | null;
  changedBy: string;
  changedAt: string;
};

const MODEL_ID = "openai/gpt-6-astra";

const surfacesSchema = z.record(z.string(), z.string());

const changeSchema = z.object({
  surface: z.string().nullable(),
  action: z.string(),
  previousValue: z.string().nullable(),
  newValue: z.string().nullable(),
});

async function staffName(supabase: any, userId: string) {
  const { data } = await supabase.from("profiles").select("full_name, username").eq("id", userId).maybeSingle();
  return (data?.full_name as string | undefined) || (data?.username as string | undefined) || "Unknown clinician";
}

export const getToothChart = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({ patientId: z.string().min(1) }).parse(data))
  .handler(async ({ data, context }) => {
    const { supabase } = context;

    const [entriesResult, auditResult] = await Promise.all([
      supabase
        .from("tooth_chart_entries")
        .select("tooth, tooth_state, surfaces, updated_by_name, updated_at")
        .eq("patient_id", data.patientId),
      supabase
        .from("tooth_chart_audit")
        .select("id, tooth, surface, action, previous_value, new_value, changed_by_name, changed_at")
        .eq("patient_id", data.patientId)
        .order("changed_at", { ascending: false })
        .limit(60),
    ]);

    if (entriesResult.error) throw new Error(entriesResult.error.message);
    if (auditResult.error) throw new Error(auditResult.error.message);

    const entries: StoredToothEntry[] = (entriesResult.data ?? []).map((row: any) => ({
      tooth: row.tooth,
      toothState: row.tooth_state,
      surfaces: (row.surfaces ?? {}) as Record<string, string>,
      updatedBy: row.updated_by_name ?? "",
      updatedAt: row.updated_at,
    }));

    const audit: ChartAuditEntry[] = (auditResult.data ?? []).map((row: any) => ({
      id: row.id,
      tooth: row.tooth,
      surface: row.surface,
      action: row.action,
      previousValue: row.previous_value,
      newValue: row.new_value,
      changedBy: row.changed_by_name ?? "",
      changedAt: row.changed_at,
    }));

    return { entries, audit };
  });

export const saveToothChange = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) =>
    z
      .object({
        patientId: z.string().min(1),
        tooth: z.string().min(1),
        toothState: z.string().min(1),
        surfaces: surfacesSchema,
        changes: z.array(changeSchema).min(1),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const name = await staffName(supabase, userId);

    const upsert = await supabase
      .from("tooth_chart_entries")
      .upsert(
        {
          patient_id: data.patientId,
          tooth: data.tooth,
          tooth_state: data.toothState,
          surfaces: data.surfaces,
          updated_by: userId,
          updated_by_name: name,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "patient_id,tooth" },
      )
      .select("tooth")
      .maybeSingle();

    if (upsert.error) throw new Error(upsert.error.message);

    const auditRows = data.changes.map((change) => ({
      patient_id: data.patientId,
      tooth: data.tooth,
      surface: change.surface,
      action: change.action,
      previous_value: change.previousValue,
      new_value: change.newValue,
      changed_by: userId,
      changed_by_name: name,
    }));

    const audit = await supabase.from("tooth_chart_audit").insert(auditRows);
    if (audit.error) throw new Error(audit.error.message);

    return { saved: true, by: name };
  });

export const resetToothChart = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({ patientId: z.string().min(1) }).parse(data))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const name = await staffName(supabase, userId);

    const removed = await supabase.from("tooth_chart_entries").delete().eq("patient_id", data.patientId);
    if (removed.error) throw new Error(removed.error.message);

    const audit = await supabase.from("tooth_chart_audit").insert({
      patient_id: data.patientId,
      tooth: "—",
      surface: null,
      action: "Chart reset",
      previous_value: null,
      new_value: null,
      changed_by: userId,
      changed_by_name: name,
    });
    if (audit.error) throw new Error(audit.error.message);

    return { reset: true };
  });

export type SummaryVersion = {
  id: string;
  patientId: string;
  version: number;
  summary: string;
  headline: string;
  findingCount: number;
  model: string;
  caseSource: string;
  caseCount: number;
  status: string;
  reviewNote: string;
  generatedBy: string;
  generatedAt: string;
  reviewedBy: string;
  reviewedAt: string | null;
};

function mapVersion(row: any): SummaryVersion {
  return {
    id: row.id,
    patientId: row.patient_id,
    version: row.version,
    summary: row.summary,
    headline: row.headline ?? "",
    findingCount: row.finding_count ?? 0,
    model: row.model ?? "",
    caseSource: row.case_source ?? "builtin",
    caseCount: row.case_count ?? 0,
    status: row.status ?? "pending",
    reviewNote: row.review_note ?? "",
    generatedBy: row.generated_by_name ?? "",
    generatedAt: row.generated_at,
    reviewedBy: row.reviewed_by_name ?? "",
    reviewedAt: row.reviewed_at ?? null,
  };
}

/**
 * Generates a prioritized pediatric treatment plan from the charted findings and stores it
 * as a PENDING version. It only reaches the patient record once a clinician approves it.
 */
export const summarizeToothFindings = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) =>
    z
      .object({
        patientId: z.string().min(1),
        patientName: z.string().min(1),
        age: z.string(),
        weightKg: z.number(),
        painScore: z.number(),
        cariesRisk: z.string(),
        allergies: z.string(),
        findings: z
          .array(z.object({ tooth: z.string(), toothState: z.string(), surfaces: surfacesSchema }))
          .default([]),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    const findings = data.findings
      .filter((row) => row.toothState !== "Sound" || Object.keys(row.surfaces).length > 0)
      .map((row) => {
        const surfaces = Object.entries(row.surfaces)
          .map(([code, finding]) => `${code}: ${finding}`)
          .join(", ");
        return `Tooth ${row.tooth} (FDI) — whole-tooth finding: ${row.toothState}${surfaces ? `; surfaces — ${surfaces}` : ""}`;
      });

    if (findings.length === 0) {
      return { summary: "", empty: true as const, findingCount: 0, headline: "", version: 0, caseSource: "", caseCount: 0 };
    }

    const key = process.env["LOVABLE_API_KEY"];
    if (!key) throw new Error("AI is not configured for this app yet.");

    const { retrievePedoCases, matchPedoCases, formatPedoCases } = await import("./pedo-case-library");
    const { createOpenAI } = await import("@ai-sdk/openai");
    const { streamText } = await import("ai");
    const { createLovableAiGatewayRunIdFetch } = await import("./ai-gateway.server");

    // Clinician-uploaded cases take priority; the built-in evidence set is the fallback.
    const uploaded = await supabase
      .from("pedo_case_library")
      .select("title, presentation, management, evidence, tooth_states, surface_findings, tooth_group, min_surfaces, tooth_numbers")
      .eq("active", true);
    if (uploaded.error) throw new Error(uploaded.error.message);

    const uploadedCases = (uploaded.data ?? []).map((row: any, index: number) => ({
      id: `uploaded-${index}`,
      title: row.title as string,
      presentation: (row.presentation as string) ?? "",
      management: (row.management as string) ?? "",
      evidence: (row.evidence as string) || "Clinic case library",
      match: {
        states: (row.tooth_states ?? []) as string[],
        surfaces: (row.surface_findings ?? []) as string[],
        group: ((row.tooth_group ?? "any") as "primary" | "permanent" | "any"),
        minSurfacesOnTooth: (row.min_surfaces ?? 0) as number,
        toothPrefixes: ((row.tooth_numbers ?? []) as string[]).length ? (row.tooth_numbers as string[]) : undefined,
      },
    }));

    const useUploaded = uploadedCases.length > 0;
    const cases = useUploaded
      ? matchPedoCases(uploadedCases as any, data.findings, 8)
      : retrievePedoCases(data.findings);
    const caseSource = useUploaded ? "uploaded" : "builtin";
    const caseText =
      cases.length > 0 ? formatPedoCases(cases) : "No matching reference case; apply standard AAPD guidance.";

    const runIdFetch = createLovableAiGatewayRunIdFetch();
    const lovable = createOpenAI({
      baseURL: "https://ai.gateway.lovable.dev/v1",
      apiKey: key,
      headers: { "Lovable-API-Key": key, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
      fetch: runIdFetch.fetch,
    });

    const result = streamText({
      model: lovable.responses(MODEL_ID),
      system:
        "You are a pediatric dentistry clinical decision-support assistant for a hospital EMR. " +
        "You are given (a) the charted odontogram and tooth-surface findings for one child and (b) matched reference pediatric dental cases with their evidence-based management. " +
        "Ground every recommendation in the supplied reference cases and cite the case title or source in brackets after each recommendation. " +
        "Every recommendation must map to a charted tooth: never invent teeth, surfaces or findings that are not listed, and never contradict the charted data. " +
        "Use concise markdown with exactly these sections: Summary, Urgent (same visit), Next visits, Preventive plan, Weight-based medication notes, Parent instructions. " +
        "Order treatment by clinical urgency (pain/pulp involvement first, then multi-surface caries, then single-surface caries, then prevention). " +
        "Reference teeth by FDI number with their affected surfaces (O/M/D/B/L). Calculate weight-based paediatric doses from the given weight and flag allergy conflicts. " +
        "Keep it under 350 words. End with a one-line reminder that a licensed dentist must confirm the plan.",
      prompt: [
        `Patient: ${data.patientName} (MRN ${data.patientId}), age ${data.age}, weight ${data.weightKg} kg.`,
        `Reported pain score: ${data.painScore}/10. Caries risk: ${data.cariesRisk}. Allergies: ${data.allergies}.`,
        "",
        "Charted findings (FDI numbering, surfaces: O occlusal, M mesial, D distal, B buccal, L lingual):",
        ...findings,
        "",
        useUploaded
          ? "Matched cases from this clinic's own uploaded pediatric case records:"
          : "Matched reference pediatric dental cases and their evidence-based management:",
        caseText,
      ].join("\n"),
      providerOptions: {
        openai: {
          forceReasoning: true,
          reasoningEffort: "low",
          reasoningSummary: "auto",
          store: false,
          include: ["reasoning.encrypted_content"],
        },
      },
    });

    const summary = await result.text;

    const caries = data.findings.filter((row) => row.toothState === "Caries").length;
    const pulp = data.findings.filter((row) => row.toothState === "Pulp").length;
    const missing = data.findings.filter((row) => row.toothState === "Missing").length;
    const headline = [
      pulp > 0 ? `${pulp} pulp-involved` : null,
      caries > 0 ? `${caries} active caries` : null,
      missing > 0 ? `${missing} missing` : null,
      `${data.cariesRisk} caries risk`,
    ]
      .filter(Boolean)
      .join(" · ");

    const name = await staffName(supabase, userId);

    const latest = await supabase
      .from("tooth_chart_summary_versions")
      .select("version")
      .eq("patient_id", data.patientId)
      .order("version", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (latest.error) throw new Error(latest.error.message);
    const version = ((latest.data?.version as number | undefined) ?? 0) + 1;

    const saved = await supabase.from("tooth_chart_summary_versions").insert({
      patient_id: data.patientId,
      version,
      summary,
      headline,
      finding_count: findings.length,
      model: MODEL_ID,
      case_source: caseSource,
      case_count: cases.length,
      status: "pending",
      generated_by: userId,
      generated_by_name: name,
    });
    if (saved.error) throw new Error(saved.error.message);

    return {
      summary,
      empty: false as const,
      findingCount: findings.length,
      headline,
      version,
      caseSource,
      caseCount: cases.length,
    };
  });

/** Version history for one or more patients, newest first. */
export const listSummaryVersions = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({ patientIds: z.array(z.string().min(1)).min(1) }).parse(data))
  .handler(async ({ data, context }) => {
    const { data: rows, error } = await context.supabase
      .from("tooth_chart_summary_versions")
      .select("*")
      .in("patient_id", data.patientIds)
      .order("version", { ascending: false });
    if (error) throw new Error(error.message);
    return { versions: (rows ?? []).map(mapVersion) };
  });

/** Clinician review gate: an approved version becomes the summary stored in the patient record. */
export const reviewSummaryVersion = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) =>
    z
      .object({
        id: z.string().min(1),
        decision: z.enum(["approved", "rejected"]),
        note: z.string().default(""),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const name = await staffName(supabase, userId);

    const updated = await supabase
      .from("tooth_chart_summary_versions")
      .update({
        status: data.decision,
        review_note: data.note,
        reviewed_by: userId,
        reviewed_by_name: name,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", data.id)
      .select("*")
      .maybeSingle();
    if (updated.error) throw new Error(updated.error.message);
    const row = updated.data as any;
    if (!row) throw new Error("That summary version could not be found.");

    if (data.decision === "approved") {
      const saved = await supabase.from("tooth_chart_summaries").upsert(
        {
          patient_id: row.patient_id,
          summary: row.summary,
          finding_count: row.finding_count,
          headline: row.headline,
          model: row.model,
          version: row.version,
          generated_by: userId,
          generated_by_name: row.generated_by_name,
          generated_at: row.generated_at,
          approved_by: userId,
          approved_by_name: name,
          approved_at: new Date().toISOString(),
        },
        { onConflict: "patient_id" },
      );
      if (saved.error) throw new Error(saved.error.message);
    }

    return { status: data.decision, reviewedBy: name, version: row.version as number };
  });

export type ChartOverview = {
  patientId: string;
  findingCount: number;
  cariesCount: number;
  surfaceCount: number;
  lastChangeAt: string | null;
  lastChangeBy: string | null;
  summary: string | null;
  headline: string | null;
  summaryAt: string | null;
  summaryBy: string | null;
  approvedBy: string | null;
  approvedAt: string | null;
  version: number | null;
  pendingCount: number;
};

/** Chart + approved AI summary rollup used by dashboards, patient lists and reports. */
export const getChartOverviews = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({ patientIds: z.array(z.string().min(1)).min(1) }).parse(data))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const ids = data.patientIds;

    const [entriesResult, auditResult, summaryResult, pendingResult] = await Promise.all([
      supabase.from("tooth_chart_entries").select("patient_id, tooth_state, surfaces").in("patient_id", ids),
      supabase
        .from("tooth_chart_audit")
        .select("patient_id, changed_at, changed_by_name")
        .in("patient_id", ids)
        .order("changed_at", { ascending: false }),
      supabase
        .from("tooth_chart_summaries")
        .select("patient_id, summary, headline, generated_at, generated_by_name, approved_by_name, approved_at, version")
        .in("patient_id", ids),
      supabase
        .from("tooth_chart_summary_versions")
        .select("patient_id, status")
        .in("patient_id", ids)
        .eq("status", "pending"),
    ]);

    if (entriesResult.error) throw new Error(entriesResult.error.message);
    if (auditResult.error) throw new Error(auditResult.error.message);
    if (summaryResult.error) throw new Error(summaryResult.error.message);

    const overviews: ChartOverview[] = ids.map((patientId) => {
      const entries = (entriesResult.data ?? []).filter((row: any) => row.patient_id === patientId);
      const active = entries.filter(
        (row: any) => row.tooth_state !== "Sound" || Object.keys(row.surfaces ?? {}).length > 0,
      );
      const audit = (auditResult.data ?? []).find((row: any) => row.patient_id === patientId);
      const summary = (summaryResult.data ?? []).find((row: any) => row.patient_id === patientId);

      return {
        patientId,
        findingCount: active.length,
        cariesCount: active.filter((row: any) => row.tooth_state === "Caries").length,
        surfaceCount: active.reduce(
          (total: number, row: any) => total + Object.keys(row.surfaces ?? {}).length,
          0,
        ),
        lastChangeAt: audit?.changed_at ?? null,
        lastChangeBy: audit?.changed_by_name ?? null,
        summary: summary?.summary ?? null,
        headline: summary?.headline ?? null,
        summaryAt: summary?.generated_at ?? null,
        summaryBy: summary?.generated_by_name ?? null,
        approvedBy: summary?.approved_by_name ?? null,
        approvedAt: summary?.approved_at ?? null,
        version: summary?.version ?? null,
        pendingCount: (pendingResult.data ?? []).filter((row: any) => row.patient_id === patientId).length,
      };
    });

    return { overviews };
  });
