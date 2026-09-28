import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type LibraryCase = {
  id: string;
  title: string;
  presentation: string;
  management: string;
  evidence: string;
  toothStates: string[];
  surfaceFindings: string[];
  toothGroup: string;
  minSurfaces: number;
  toothNumbers: string[];
  sourceName: string;
  active: boolean;
  createdBy: string;
  createdAt: string;
};

const caseSchema = z.object({
  title: z.string().min(1),
  presentation: z.string().default(""),
  management: z.string().default(""),
  evidence: z.string().default(""),
  toothStates: z.array(z.string()).default([]),
  surfaceFindings: z.array(z.string()).default([]),
  toothGroup: z.string().default("any"),
  minSurfaces: z.number().default(0),
  toothNumbers: z.array(z.string()).default([]),
});

function mapCase(row: any): LibraryCase {
  return {
    id: row.id,
    title: row.title,
    presentation: row.presentation ?? "",
    management: row.management ?? "",
    evidence: row.evidence ?? "",
    toothStates: row.tooth_states ?? [],
    surfaceFindings: row.surface_findings ?? [],
    toothGroup: row.tooth_group ?? "any",
    minSurfaces: row.min_surfaces ?? 0,
    toothNumbers: row.tooth_numbers ?? [],
    sourceName: row.source_name ?? "",
    active: Boolean(row.active),
    createdBy: row.created_by_name ?? "",
    createdAt: row.created_at,
  };
}

async function staffName(supabase: any, userId: string) {
  const { data } = await supabase.from("profiles").select("full_name, username").eq("id", userId).maybeSingle();
  return (data?.full_name as string | undefined) || (data?.username as string | undefined) || "Unknown clinician";
}

export const listPedoCases = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("pedo_case_library")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return { cases: (data ?? []).map(mapCase) };
  });

export const uploadPedoCases = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) =>
    z.object({ sourceName: z.string().default(""), cases: z.array(caseSchema).min(1) }).parse(data),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const name = await staffName(supabase, userId);

    const rows = data.cases.map((entry) => ({
      title: entry.title,
      presentation: entry.presentation,
      management: entry.management,
      evidence: entry.evidence,
      tooth_states: entry.toothStates,
      surface_findings: entry.surfaceFindings,
      tooth_group: entry.toothGroup,
      min_surfaces: entry.minSurfaces,
      tooth_numbers: entry.toothNumbers,
      source_name: data.sourceName,
      created_by: userId,
      created_by_name: name,
    }));

    const { data: inserted, error } = await supabase.from("pedo_case_library").insert(rows).select("id");
    if (error) throw new Error(error.message);
    return { added: inserted?.length ?? 0 };
  });

export const setPedoCaseActive = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({ id: z.string().min(1), active: z.boolean() }).parse(data))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("pedo_case_library")
      .update({ active: data.active })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deletePedoCase = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({ id: z.string().min(1) }).parse(data))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("pedo_case_library").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
