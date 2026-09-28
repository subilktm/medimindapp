import { useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Loader2, Mic, Send, Square, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { parseMedicalSpeechResponse, saveSpeechResponse } from "@/lib/medical-speech";

const SPEECH_API_URL = "https://localhost:7232/ai/medical-speech";

export function VoiceRecorder({ patientId }: { patientId?: string }) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [blob, setBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [language, setLanguage] = useState("en");
  const [prompt, setPrompt] = useState("");
  const [medPrompt, setMedPrompt] = useState("");
  const [response, setResponse] = useState<string | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);

  useEffect(() => () => {
    if (timerRef.current) window.clearInterval(timerRef.current);
    recorderRef.current?.stream.getTracks().forEach((t) => t.stop());
  }, []);

  useEffect(() => () => { if (audioUrl) URL.revokeObjectURL(audioUrl); }, [audioUrl]);

  const start = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      recorder.onstop = () => {
        const recorded = new Blob(chunksRef.current, { type: recorder.mimeType || "audio/webm" });
        setBlob(recorded);
        setAudioUrl(URL.createObjectURL(recorded));
        stream.getTracks().forEach((t) => t.stop());
      };
      recorderRef.current = recorder;
      recorder.start();
      setBlob(null);
      setAudioUrl(null);
      setResponse(null);
      setSeconds(0);
      setRecording(true);
      timerRef.current = window.setInterval(() => setSeconds((s) => s + 1), 1000);
    } catch {
      toast.error("Microphone access was denied or is unavailable.");
    }
  };

  const stop = () => {
    recorderRef.current?.stop();
    setRecording(false);
    if (timerRef.current) window.clearInterval(timerRef.current);
  };

  const discard = () => { setBlob(null); setAudioUrl(null); setResponse(null); setSeconds(0); };

  const send = async () => {
    if (!blob) return;
    setSending(true);
    setResponse(null);
    try {
      const ext = blob.type.includes("ogg") ? "ogg" : blob.type.includes("mp4") ? "m4a" : "webm";
      const form = new FormData();
      form.append("AudioFile", blob, `recording-${Date.now()}.${ext}`);
      if (language.trim()) form.append("Language", language.trim());
      if (prompt.trim()) form.append("Prompt", prompt.trim());
      if (medPrompt.trim()) form.append("MedGemmaPrompt", medPrompt.trim());
      const res = await fetch(SPEECH_API_URL, { method: "POST", body: form });
      const text = await res.text();
      if (!res.ok) throw new Error(`Server responded ${res.status}${text ? `: ${text.slice(0, 200)}` : ""}`);
      toast.success("Recording sent to the medical speech service.");
      const parsed = parseMedicalSpeechResponse(text);
      if (parsed) {
        saveSpeechResponse({ response: parsed, patientId, savedAt: new Date().toISOString() });
        setSending(false);
        setOpen(false);
        if (patientId) {
          navigate({ to: "/clinician/patients/$patientId/speech-response", params: { patientId } });
        } else {
          setResponse(text || "Sent successfully.");
        }
        return;
      }
      setResponse(text || "Sent successfully.");
    } catch (err) {
      toast.error(err instanceof Error && err.message.startsWith("Server") ? err.message : "Could not reach the medical speech service at localhost:7232. Make sure it is running and allows this site.");
    } finally {
      setSending(false);
    }
  };

  const mm = `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}><Mic className="size-4" /> Voice note</Button>
      <Dialog open={open} onOpenChange={(v) => { if (!v && recording) stop(); setOpen(v); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Record voice note</DialogTitle>
            <DialogDescription>Record dictation and send it to the medical speech service.</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center gap-3 py-4">
            <button
              type="button"
              onClick={recording ? stop : start}
              aria-label={recording ? "Stop recording" : "Start recording"}
              className={`flex size-20 items-center justify-center rounded-full border-2 transition ${recording ? "animate-pulse border-destructive bg-destructive/10 text-destructive" : "border-primary bg-primary/10 text-primary hover:bg-primary/20"}`}
            >
              {recording ? <Square className="size-8" /> : <Mic className="size-8" />}
            </button>
            <p className="font-display text-lg font-bold tabular-nums">{mm}</p>
            <p className="text-xs text-muted-foreground">{recording ? "Recording… tap to stop" : blob ? "Recording ready" : "Tap to start recording"}</p>
            {audioUrl && <audio controls src={audioUrl} className="w-full" />}
            <div className="grid w-full gap-2">
              <Label className="text-[11px]">Language<Input value={language} onChange={(e) => setLanguage(e.target.value)} placeholder="e.g. en" className="mt-1" /></Label>
              <Label className="text-[11px]">Prompt<Textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="Optional transcription prompt" className="mt-1 min-h-14" /></Label>
              <Label className="text-[11px]">MedGemma prompt<Textarea value={medPrompt} onChange={(e) => setMedPrompt(e.target.value)} placeholder="Optional clinical analysis prompt" className="mt-1 min-h-14" /></Label>
            </div>
            {response && <pre className="max-h-40 w-full overflow-auto whitespace-pre-wrap rounded-lg border border-border bg-muted/40 p-2 text-[11px]">{response}</pre>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={discard} disabled={!blob || sending}><Trash2 className="size-4" /> Discard</Button>
            <Button onClick={send} disabled={!blob || sending || recording}>
              {sending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />} Send recording
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
