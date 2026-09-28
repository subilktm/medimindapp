import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronLeft, UsersRound } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { MedicalSpeechResponseView } from "@/components/medical-speech-response";
import { getClinicalPatient } from "@/lib/clinical-patients";
import { loadSpeechResponse, type StoredSpeechResponse } from "@/lib/medical-speech";

export const Route = createFileRoute("/_authenticated/clinician/patients/$patientId_/speech-response")({
  head: ({ params }) => {
    const patient = getClinicalPatient(params.patientId);
    const title = patient ? `${patient.name} — Medical speech response — MediMind` : "Medical speech response — MediMind";
    const description = patient
      ? `AI medical speech response for ${patient.name}: transcription, structured clinical note and decision support.`
      : "Transcription, structured clinical note and AI decision support generated from the recorded medical speech.";
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
  component: SpeechResponsePage,
});

function SpeechResponsePage() {
  const { patientId } = Route.useParams();
  const patient = getClinicalPatient(patientId);
  const [record, setRecord] = useState<StoredSpeechResponse | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setRecord(loadSpeechResponse());
    setLoaded(true);
  }, []);

  const backTo = patient ? `/clinician/patients/${patient.id}` : "/clinician/patients";

  return (
    <div className="space-y-4">
      <div>
        <Link to={backTo} className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline">
          <ChevronLeft className="size-3.5" /> {patient ? `Patient dashboard — ${patient.name}` : "Patient list"}
        </Link>
        <p className="mt-1 text-xs text-muted-foreground">Response from the medical speech service</p>
      </div>

      {record ? (
        <MedicalSpeechResponseView record={record} backTo={backTo} />
      ) : loaded ? (
        <section className="flex min-h-[55vh] flex-col items-center justify-center text-center">
          <span className="flex size-14 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <UsersRound className="size-6" />
          </span>
          <h1 className="mt-4 font-display text-2xl font-extrabold">No speech response yet</h1>
          <p className="mt-2 max-w-sm text-sm text-muted-foreground">Record a voice note from the patient dashboard and send it — the response will open here.</p>
          <Button asChild variant="outline" className="mt-5">
            <Link to={backTo}><ChevronLeft className="size-4" /> {patient ? "Back to patient dashboard" : "Back to patient list"}</Link>
          </Button>
        </section>
      ) : null}
    </div>
  );
}
