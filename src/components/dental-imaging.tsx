import { useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ImagePlus, Loader2, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { deleteDentalImage, listDentalImages, saveDentalImage } from "@/lib/dental-images.functions";

const IMAGE_TYPES = ["Periapical X-ray", "Bitewing X-ray", "Panoramic X-ray", "Intraoral photo", "Extraoral photo"];

function toBase64(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result ?? "");
      resolve(result.slice(result.indexOf(",") + 1));
    };
    reader.onerror = () => reject(new Error("Could not read the selected file."));
    reader.readAsDataURL(file);
  });
}

/** Upload and review X-rays and clinical photos next to the odontogram findings. */
export function DentalImagingPanel({ patientId }: { patientId: string }) {
  const load = useServerFn(listDentalImages);
  const save = useServerFn(saveDentalImage);
  const remove = useServerFn(deleteDentalImage);
  const queryClient = useQueryClient();
  const fileInput = useRef<HTMLInputElement>(null);

  const [imageType, setImageType] = useState(IMAGE_TYPES[0] as string);
  const [tooth, setTooth] = useState("");
  const [note, setNote] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const imagesQuery = useQuery({
    queryKey: ["dental-images", patientId],
    queryFn: () => load({ data: { patientId } }),
  });

  const uploadMutation = useMutation({
    mutationFn: async () => {
      if (!file) throw new Error("Choose an X-ray or photo first.");
      const fileBase64 = await toBase64(file);
      return save({
        data: {
          patientId,
          fileName: file.name,
          contentType: file.type || "image/jpeg",
          fileBase64,
          imageType,
          tooth,
          note,
        },
      });
    },
    onSuccess: () => {
      toast.success("Image attached to the dental chart.");
      setFile(null);
      setTooth("");
      setNote("");
      if (fileInput.current) fileInput.current.value = "";
      void queryClient.invalidateQueries({ queryKey: ["dental-images", patientId] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => remove({ data: { id } }),
    onSuccess: () => {
      toast.success("Image removed.");
      void queryClient.invalidateQueries({ queryKey: ["dental-images", patientId] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const images = imagesQuery.data?.images ?? [];

  return (
    <section id="chart-imaging" className="scroll-mt-24 rounded-xl border border-border bg-card/70 p-4 shadow-panel">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <ImagePlus className="size-4" />
          </span>
          <div>
            <h3 className="font-display text-sm font-bold">Dental imaging</h3>
            <p className="text-xs text-muted-foreground">Attach X-rays and clinical photos alongside the odontogram findings</p>
          </div>
        </div>
        <span className="rounded-lg border border-border bg-muted/50 px-2 py-1 text-[10px] font-bold">{images.length} attached</span>
      </div>

      <div className="mt-3 grid gap-3 rounded-lg border border-border bg-muted/30 p-3 sm:grid-cols-2 xl:grid-cols-5">
        <div className="space-y-1">
          <Label htmlFor="dental-image-file" className="text-[10px] font-bold uppercase">Image file</Label>
          <Input
            id="dental-image-file"
            ref={fileInput}
            type="file"
            accept="image/*"
            onChange={(event) => setFile(event.target.files?.[0] ?? null)}
          />
        </div>
        <div className="space-y-1">
          <Label className="text-[10px] font-bold uppercase">Image type</Label>
          <Select value={imageType} onValueChange={setImageType}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {IMAGE_TYPES.map((type) => <SelectItem key={type} value={type}>{type}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label htmlFor="dental-image-tooth" className="text-[10px] font-bold uppercase">Tooth (FDI)</Label>
          <Input id="dental-image-tooth" value={tooth} onChange={(event) => setTooth(event.target.value)} placeholder="e.g. 54" />
        </div>
        <div className="space-y-1">
          <Label htmlFor="dental-image-note" className="text-[10px] font-bold uppercase">Note</Label>
          <Input id="dental-image-note" value={note} onChange={(event) => setNote(event.target.value)} placeholder="Findings or view" />
        </div>
        <div className="flex items-end">
          <Button
            size="sm"
            className="w-full"
            disabled={!file || uploadMutation.isPending}
            onClick={() => uploadMutation.mutate()}
          >
            {uploadMutation.isPending ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
            Upload image
          </Button>
        </div>
      </div>

      {imagesQuery.isPending ? (
        <p className="mt-3 flex items-center gap-2 text-xs text-muted-foreground"><Loader2 className="size-3.5 animate-spin" /> Loading imaging…</p>
      ) : images.length === 0 ? (
        <p className="mt-3 text-xs text-muted-foreground">No X-rays or photos attached yet.</p>
      ) : (
        <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {images.map((image) => (
            <figure key={image.id} className="overflow-hidden rounded-lg border border-border bg-card">
              {image.url ? (
                <a href={image.url} target="_blank" rel="noreferrer">
                  <img src={image.url} alt={`${image.imageType} ${image.tooth}`} className="h-36 w-full object-cover" />
                </a>
              ) : (
                <div className="flex h-36 items-center justify-center text-xs text-muted-foreground">Preview unavailable</div>
              )}
              <figcaption className="space-y-1 p-2">
                <p className="text-xs font-bold">{image.imageType}{image.tooth ? ` · Tooth ${image.tooth}` : ""}</p>
                {image.note ? <p className="text-[11px] text-muted-foreground">{image.note}</p> : null}
                <p className="text-[10px] text-muted-foreground">{image.uploadedBy} · {new Date(image.createdAt).toLocaleString()}</p>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 px-2 text-[11px] text-destructive"
                  disabled={deleteMutation.isPending}
                  onClick={() => deleteMutation.mutate(image.id)}
                >
                  <Trash2 className="size-3.5" /> Remove
                </Button>
              </figcaption>
            </figure>
          ))}
        </div>
      )}
    </section>
  );
}
