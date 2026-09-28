-- Clinician-uploaded pediatric dental case library used to ground the AI treatment plan
CREATE TABLE public.pedo_case_library (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  presentation TEXT NOT NULL DEFAULT '',
  management TEXT NOT NULL DEFAULT '',
  evidence TEXT NOT NULL DEFAULT '',
  tooth_states TEXT[] NOT NULL DEFAULT '{}',
  surface_findings TEXT[] NOT NULL DEFAULT '{}',
  tooth_group TEXT NOT NULL DEFAULT 'any',
  min_surfaces INTEGER NOT NULL DEFAULT 0,
  tooth_numbers TEXT[] NOT NULL DEFAULT '{}',
  source_name TEXT NOT NULL DEFAULT '',
  active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_by_name TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX pedo_case_library_active_idx ON public.pedo_case_library (active, created_at DESC);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.pedo_case_library TO authenticated;
GRANT ALL ON public.pedo_case_library TO service_role;

ALTER TABLE public.pedo_case_library ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clinical staff can view case library"
ON public.pedo_case_library FOR SELECT TO authenticated
USING (
  public.has_role(auth.uid(), 'clinician') OR public.has_role(auth.uid(), 'doctor')
  OR public.has_role(auth.uid(), 'nurse') OR public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Clinical staff can add cases"
ON public.pedo_case_library FOR INSERT TO authenticated
WITH CHECK (
  created_by = auth.uid() AND (
    public.has_role(auth.uid(), 'clinician') OR public.has_role(auth.uid(), 'doctor')
    OR public.has_role(auth.uid(), 'nurse') OR public.has_role(auth.uid(), 'admin')
  )
);

CREATE POLICY "Clinical staff can update cases"
ON public.pedo_case_library FOR UPDATE TO authenticated
USING (
  public.has_role(auth.uid(), 'clinician') OR public.has_role(auth.uid(), 'doctor')
  OR public.has_role(auth.uid(), 'nurse') OR public.has_role(auth.uid(), 'admin')
)
WITH CHECK (
  public.has_role(auth.uid(), 'clinician') OR public.has_role(auth.uid(), 'doctor')
  OR public.has_role(auth.uid(), 'nurse') OR public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Clinical staff can delete cases"
ON public.pedo_case_library FOR DELETE TO authenticated
USING (
  public.has_role(auth.uid(), 'clinician') OR public.has_role(auth.uid(), 'doctor')
  OR public.has_role(auth.uid(), 'nurse') OR public.has_role(auth.uid(), 'admin')
);

-- Version history of AI generated pediatric summaries with a clinician review gate
CREATE TABLE public.tooth_chart_summary_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id TEXT NOT NULL,
  version INTEGER NOT NULL DEFAULT 1,
  summary TEXT NOT NULL,
  headline TEXT NOT NULL DEFAULT '',
  finding_count INTEGER NOT NULL DEFAULT 0,
  model TEXT NOT NULL DEFAULT '',
  case_source TEXT NOT NULL DEFAULT 'builtin',
  case_count INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending',
  review_note TEXT NOT NULL DEFAULT '',
  generated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  generated_by_name TEXT NOT NULL DEFAULT '',
  generated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_by_name TEXT NOT NULL DEFAULT '',
  reviewed_at TIMESTAMPTZ,
  UNIQUE (patient_id, version)
);

CREATE INDEX tooth_chart_summary_versions_patient_idx
ON public.tooth_chart_summary_versions (patient_id, version DESC);

GRANT SELECT, INSERT, UPDATE ON public.tooth_chart_summary_versions TO authenticated;
GRANT ALL ON public.tooth_chart_summary_versions TO service_role;

ALTER TABLE public.tooth_chart_summary_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clinical staff can view summary versions"
ON public.tooth_chart_summary_versions FOR SELECT TO authenticated
USING (
  public.has_role(auth.uid(), 'clinician') OR public.has_role(auth.uid(), 'doctor')
  OR public.has_role(auth.uid(), 'nurse') OR public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Clinical staff can create summary versions"
ON public.tooth_chart_summary_versions FOR INSERT TO authenticated
WITH CHECK (
  generated_by = auth.uid() AND (
    public.has_role(auth.uid(), 'clinician') OR public.has_role(auth.uid(), 'doctor')
    OR public.has_role(auth.uid(), 'nurse') OR public.has_role(auth.uid(), 'admin')
  )
);

CREATE POLICY "Clinical staff can review summary versions"
ON public.tooth_chart_summary_versions FOR UPDATE TO authenticated
USING (
  public.has_role(auth.uid(), 'clinician') OR public.has_role(auth.uid(), 'doctor')
  OR public.has_role(auth.uid(), 'nurse') OR public.has_role(auth.uid(), 'admin')
)
WITH CHECK (
  public.has_role(auth.uid(), 'clinician') OR public.has_role(auth.uid(), 'doctor')
  OR public.has_role(auth.uid(), 'nurse') OR public.has_role(auth.uid(), 'admin')
);

-- Approved-summary bookkeeping on the patient-record row
ALTER TABLE public.tooth_chart_summaries ADD COLUMN IF NOT EXISTS version INTEGER NOT NULL DEFAULT 1;
ALTER TABLE public.tooth_chart_summaries ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE public.tooth_chart_summaries ADD COLUMN IF NOT EXISTS approved_by_name TEXT NOT NULL DEFAULT '';
ALTER TABLE public.tooth_chart_summaries ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ;

-- Front desk read-only visibility of pediatric dental care
CREATE POLICY "Front desk can view tooth chart entries"
ON public.tooth_chart_entries FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'receptionist'));

CREATE POLICY "Front desk can view chart audit"
ON public.tooth_chart_audit FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'receptionist'));

CREATE POLICY "Front desk can view approved dental summaries"
ON public.tooth_chart_summaries FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'receptionist'));