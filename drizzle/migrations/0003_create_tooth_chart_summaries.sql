CREATE TABLE public.tooth_chart_summaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id TEXT NOT NULL UNIQUE,
  summary TEXT NOT NULL,
  finding_count INTEGER NOT NULL DEFAULT 0,
  headline TEXT NOT NULL DEFAULT '',
  model TEXT NOT NULL DEFAULT '',
  generated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  generated_by_name TEXT NOT NULL DEFAULT '',
  generated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.tooth_chart_summaries TO authenticated;
GRANT ALL ON public.tooth_chart_summaries TO service_role;

ALTER TABLE public.tooth_chart_summaries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clinical staff can view dental summaries"
ON public.tooth_chart_summaries FOR SELECT TO authenticated
USING (
  public.has_role(auth.uid(), 'clinician') OR public.has_role(auth.uid(), 'doctor')
  OR public.has_role(auth.uid(), 'nurse') OR public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Clinical staff can create dental summaries"
ON public.tooth_chart_summaries FOR INSERT TO authenticated
WITH CHECK (
  generated_by = auth.uid() AND (
    public.has_role(auth.uid(), 'clinician') OR public.has_role(auth.uid(), 'doctor')
    OR public.has_role(auth.uid(), 'nurse') OR public.has_role(auth.uid(), 'admin')
  )
);

CREATE POLICY "Clinical staff can update dental summaries"
ON public.tooth_chart_summaries FOR UPDATE TO authenticated
USING (
  public.has_role(auth.uid(), 'clinician') OR public.has_role(auth.uid(), 'doctor')
  OR public.has_role(auth.uid(), 'nurse') OR public.has_role(auth.uid(), 'admin')
)
WITH CHECK (generated_by = auth.uid());
