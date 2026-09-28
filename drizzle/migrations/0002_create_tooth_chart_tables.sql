-- Persisted odontogram state, one row per patient + tooth
CREATE TABLE public.tooth_chart_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id TEXT NOT NULL,
  tooth TEXT NOT NULL,
  tooth_state TEXT NOT NULL DEFAULT 'Sound',
  surfaces JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by_name TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (patient_id, tooth)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.tooth_chart_entries TO authenticated;
GRANT ALL ON public.tooth_chart_entries TO service_role;

ALTER TABLE public.tooth_chart_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clinical staff can view tooth chart entries"
ON public.tooth_chart_entries FOR SELECT TO authenticated
USING (
  public.has_role(auth.uid(), 'clinician') OR public.has_role(auth.uid(), 'doctor')
  OR public.has_role(auth.uid(), 'nurse') OR public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Clinical staff can add tooth chart entries"
ON public.tooth_chart_entries FOR INSERT TO authenticated
WITH CHECK (
  auth.uid() = updated_by AND (
    public.has_role(auth.uid(), 'clinician') OR public.has_role(auth.uid(), 'doctor')
    OR public.has_role(auth.uid(), 'nurse') OR public.has_role(auth.uid(), 'admin')
  )
);

CREATE POLICY "Clinical staff can update tooth chart entries"
ON public.tooth_chart_entries FOR UPDATE TO authenticated
USING (
  public.has_role(auth.uid(), 'clinician') OR public.has_role(auth.uid(), 'doctor')
  OR public.has_role(auth.uid(), 'nurse') OR public.has_role(auth.uid(), 'admin')
)
WITH CHECK (auth.uid() = updated_by);

-- Immutable audit trail of every surface / tooth change
CREATE TABLE public.tooth_chart_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id TEXT NOT NULL,
  tooth TEXT NOT NULL,
  surface TEXT,
  action TEXT NOT NULL,
  previous_value TEXT,
  new_value TEXT,
  changed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  changed_by_name TEXT NOT NULL DEFAULT '',
  changed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX tooth_chart_audit_patient_idx ON public.tooth_chart_audit (patient_id, changed_at DESC);

GRANT SELECT, INSERT ON public.tooth_chart_audit TO authenticated;
GRANT ALL ON public.tooth_chart_audit TO service_role;

ALTER TABLE public.tooth_chart_audit ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clinical staff can view chart audit"
ON public.tooth_chart_audit FOR SELECT TO authenticated
USING (
  public.has_role(auth.uid(), 'clinician') OR public.has_role(auth.uid(), 'doctor')
  OR public.has_role(auth.uid(), 'nurse') OR public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Clinical staff can write chart audit"
ON public.tooth_chart_audit FOR INSERT TO authenticated
WITH CHECK (
  auth.uid() = changed_by AND (
    public.has_role(auth.uid(), 'clinician') OR public.has_role(auth.uid(), 'doctor')
    OR public.has_role(auth.uid(), 'nurse') OR public.has_role(auth.uid(), 'admin')
  )
);
