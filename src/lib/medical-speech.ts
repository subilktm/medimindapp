/** Shared types + helpers for the medical-speech API response (localhost:7232). */

export type MedicalSpeechTranscription = {
  isSuccess?: boolean;
  errorMessage?: string | null;
  data?: string;
};

export type ClinicalNote = {
  chiefComplaint?: string;
  historyOfPresentIllness?: string;
  symptoms?: string[];
  pastMedicalHistory?: string[];
  pastSurgicalHistory?: string[];
  medications?: string[];
  allergies?: string[];
  familyHistory?: string[];
  socialHistory?: string[];
  reviewOfSystems?: string[];
  physicalExamination?: string[];
  assessment?: string[];
  diagnoses?: string[];
  investigationPlan?: string[];
  treatmentPlan?: string[];
  followUpPlan?: string[];
  patientInstructions?: string[];
  uncertainInformation?: string[];
};

export type PossibleDiagnosis = {
  diagnosis?: string;
  supportingEvidence?: string[];
  missingInformation?: string[];
};

export type SuggestedInvestigation = {
  investigation?: string;
  reason?: string;
};

export type ClinicalAlert = {
  alert?: string;
  reason?: string;
};

export type DecisionSupport = {
  possibleDiagnoses?: PossibleDiagnosis[];
  differentialDiagnoses?: string[];
  suggestedInvestigations?: Array<SuggestedInvestigation | string>;
  medicationConsiderations?: string[];
  clinicalAlerts?: Array<ClinicalAlert | string>;
  additionalQuestions?: string[];
  limitations?: string[];
};

export type MedicalSpeechResponse = {
  transcription?: MedicalSpeechTranscription;
  clinicalNote?: ClinicalNote;
  decisionSupport?: DecisionSupport;
};

export type StoredSpeechResponse = {
  response: MedicalSpeechResponse;
  patientId?: string | undefined;
  savedAt: string;
};

const STORAGE_KEY = "medimind.medical-speech-response";

/** Returns the parsed response when the payload matches the documented shape, otherwise null. */
export function parseMedicalSpeechResponse(text: string): MedicalSpeechResponse | null {
  try {
    const parsed: unknown = JSON.parse(text);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return null;
    const record = parsed as Record<string, unknown>;
    if (!("transcription" in record) && !("clinicalNote" in record) && !("decisionSupport" in record)) return null;
    return parsed as MedicalSpeechResponse;
  } catch {
    return null;
  }
}

/** Persists the latest response so the response page can reopen it (browser only). */
export function saveSpeechResponse(record: StoredSpeechResponse): void {
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(record));
  } catch {
    /* storage unavailable — the page will show its empty state */
  }
}

/** Reads the latest response; call from an effect, not during render. */
export function loadSpeechResponse(): StoredSpeechResponse | null {
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredSpeechResponse | null;
    return parsed?.response ? parsed : null;
  } catch {
    return null;
  }
}
