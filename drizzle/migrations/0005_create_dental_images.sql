CREATE TABLE public.dental_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  file_name TEXT NOT NULL DEFAULT '',
  image_type TEXT NOT NULL DEFAULT 'Photo',
  tooth TEXT NOT NULL DEFAULT '',
  note TEXT NOT NULL DEFAULT '',
  uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  uploaded_by_name TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.dental_images TO authenticated;
GRANT ALL ON public.dental_images TO service_role;

ALTER TABLE public.dental_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clinical staff can view dental images" ON public.dental_images
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'clinician') OR public.has_role(auth.uid(), 'doctor') OR public.has_role(auth.uid(), 'nurse') OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Front desk can view dental images" ON public.dental_images
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'receptionist'));

CREATE POLICY "Clinical staff can add dental images" ON public.dental_images
  FOR INSERT TO authenticated
  WITH CHECK (uploaded_by = auth.uid() AND (public.has_role(auth.uid(), 'clinician') OR public.has_role(auth.uid(), 'doctor') OR public.has_role(auth.uid(), 'nurse') OR public.has_role(auth.uid(), 'admin')));

CREATE POLICY "Clinical staff can delete dental images" ON public.dental_images
  FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'clinician') OR public.has_role(auth.uid(), 'doctor') OR public.has_role(auth.uid(), 'nurse') OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Clinical staff can read dental image files" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'dental-images' AND (public.has_role(auth.uid(), 'clinician') OR public.has_role(auth.uid(), 'doctor') OR public.has_role(auth.uid(), 'nurse') OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'receptionist')));

CREATE POLICY "Clinical staff can upload dental image files" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'dental-images' AND (public.has_role(auth.uid(), 'clinician') OR public.has_role(auth.uid(), 'doctor') OR public.has_role(auth.uid(), 'nurse') OR public.has_role(auth.uid(), 'admin')));

CREATE POLICY "Clinical staff can delete dental image files" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'dental-images' AND (public.has_role(auth.uid(), 'clinician') OR public.has_role(auth.uid(), 'doctor') OR public.has_role(auth.uid(), 'nurse') OR public.has_role(auth.uid(), 'admin')));
