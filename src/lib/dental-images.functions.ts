import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type DentalImage = {
  id: string;
  patientId: string;
  storagePath: string;
  fileName: string;
  imageType: string;
  tooth: string;
  note: string;
  uploadedBy: string;
  createdAt: string;
  url: string | null;
};

async function staffName(supabase: any, userId: string) {
  const { data } = await supabase.from("profiles").select("full_name, username").eq("id", userId).maybeSingle();
  return (data?.full_name as string | undefined) || (data?.username as string | undefined) || "Unknown clinician";
}

export const listDentalImages = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({ patientId: z.string().min(1) }).parse(data))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { data: rows, error } = await supabase
      .from("dental_images")
      .select("id, patient_id, storage_path, file_name, image_type, tooth, note, uploaded_by_name, created_at")
      .eq("patient_id", data.patientId)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);

    const images: DentalImage[] = [];
    for (const row of rows ?? []) {
      const signed = await supabase.storage.from("dental-images").createSignedUrl(row.storage_path, 3600);
      images.push({
        id: row.id,
        patientId: row.patient_id,
        storagePath: row.storage_path,
        fileName: row.file_name ?? "",
        imageType: row.image_type ?? "Photo",
        tooth: row.tooth ?? "",
        note: row.note ?? "",
        uploadedBy: row.uploaded_by_name ?? "",
        createdAt: row.created_at,
        url: signed.data?.signedUrl ?? null,
      });
    }
    return { images };
  });

export const saveDentalImage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) =>
    z
      .object({
        patientId: z.string().min(1),
        fileName: z.string().min(1),
        contentType: z.string().min(1),
        fileBase64: z.string().min(1),
        imageType: z.string().min(1),
        tooth: z.string(),
        note: z.string(),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    const bytes = Uint8Array.from(atob(data.fileBase64), (char) => char.charCodeAt(0));
    if (bytes.byteLength > 25 * 1024 * 1024) throw new Error("Image is larger than 25 MB.");

    const safeName = data.fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
    const storagePath = `${data.patientId}/${Date.now()}-${safeName}`;

    const upload = await supabase.storage
      .from("dental-images")
      .upload(storagePath, bytes, { contentType: data.contentType, upsert: false });
    if (upload.error) throw new Error(upload.error.message);

    const name = await staffName(supabase, userId);
    const { error } = await supabase.from("dental_images").insert({
      patient_id: data.patientId,
      storage_path: storagePath,
      file_name: data.fileName,
      image_type: data.imageType,
      tooth: data.tooth,
      note: data.note,
      uploaded_by: userId,
      uploaded_by_name: name,
    });
    if (error) throw new Error(error.message);

    return { ok: true, storagePath };
  });

export const deleteDentalImage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({ id: z.string().min(1) }).parse(data))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { data: row, error: readError } = await supabase
      .from("dental_images")
      .select("storage_path")
      .eq("id", data.id)
      .maybeSingle();
    if (readError) throw new Error(readError.message);
    if (row?.storage_path) await supabase.storage.from("dental-images").remove([row.storage_path]);
    const { error } = await supabase.from("dental_images").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
