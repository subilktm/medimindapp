-- =====================================================================
-- MediMind portable EMR schema — Migration 3: orders, medications, dental,
-- AI summaries, reference cases, billing, audit log
-- =====================================================================

-- ---------- clinical_order ----------
CREATE TABLE public.clinical_order (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  facility_id UUID NOT NULL,
  patient_id UUID NOT NULL,
  encounter_id UUID NULL,
  ordered_by_staff_id UUID NULL,
  order_type VARCHAR(20) NOT NULL,
  name VARCHAR(200) NOT NULL,
  priority VARCHAR(20) NOT NULL DEFAULT 'Routine',
  status VARCHAR(20) NOT NULL DEFAULT 'Ordered',
  ordered_at TIMESTAMP(3) NOT NULL DEFAULT (now() AT TIME ZONE 'UTC'),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  deleted_at TIMESTAMP(3) NULL,
  created_by UUID NULL,
  created_at TIMESTAMP(3) NOT NULL DEFAULT (now() AT TIME ZONE 'UTC'),
  updated_by UUID NULL,
  updated_at TIMESTAMP(3) NOT NULL DEFAULT (now() AT TIME ZONE 'UTC'),
  CONSTRAINT pk_clinical_order PRIMARY KEY (id),
  CONSTRAINT ck_clinical_order_type CHECK (order_type IN ('Lab','Imaging','Procedure','Referral')),
  CONSTRAINT ck_clinical_order_priority CHECK (priority IN ('Routine','Urgent','Stat')),
  CONSTRAINT ck_clinical_order_status CHECK (status IN ('Ordered','Pending','Completed','Cancelled')),
  CONSTRAINT fk_clinical_order_tenant FOREIGN KEY (tenant_id) REFERENCES public.tenant(id),
  CONSTRAINT fk_clinical_order_facility FOREIGN KEY (facility_id) REFERENCES public.facility(id),
  CONSTRAINT fk_clinical_order_patient FOREIGN KEY (patient_id) REFERENCES public.patient(id),
  CONSTRAINT fk_clinical_order_encounter FOREIGN KEY (encounter_id) REFERENCES public.encounter(id),
  CONSTRAINT fk_clinical_order_ordered_by FOREIGN KEY (ordered_by_staff_id) REFERENCES public.staff_member(id),
  CONSTRAINT fk_clinical_order_created_by FOREIGN KEY (created_by) REFERENCES public.user_account(id),
  CONSTRAINT fk_clinical_order_updated_by FOREIGN KEY (updated_by) REFERENCES public.user_account(id)
);

-- ---------- order_result ----------
CREATE TABLE public.order_result (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  clinical_order_id UUID NOT NULL,
  result_name VARCHAR(200) NOT NULL,
  result_value VARCHAR(200) NULL,
  unit VARCHAR(40) NULL,
  reference_range VARCHAR(100) NULL,
  abnormal_flag VARCHAR(10) NULL,
  resulted_at TIMESTAMP(3) NULL,
  verified_by_staff_id UUID NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  deleted_at TIMESTAMP(3) NULL,
  created_by UUID NULL,
  created_at TIMESTAMP(3) NOT NULL DEFAULT (now() AT TIME ZONE 'UTC'),
  updated_by UUID NULL,
  updated_at TIMESTAMP(3) NOT NULL DEFAULT (now() AT TIME ZONE 'UTC'),
  CONSTRAINT pk_order_result PRIMARY KEY (id),
  CONSTRAINT ck_order_result_flag CHECK (abnormal_flag IS NULL OR abnormal_flag IN ('Normal','Low','High','Critical')),
  CONSTRAINT fk_order_result_tenant FOREIGN KEY (tenant_id) REFERENCES public.tenant(id),
  CONSTRAINT fk_order_result_order FOREIGN KEY (clinical_order_id) REFERENCES public.clinical_order(id),
  CONSTRAINT fk_order_result_verified_by FOREIGN KEY (verified_by_staff_id) REFERENCES public.staff_member(id),
  CONSTRAINT fk_order_result_created_by FOREIGN KEY (created_by) REFERENCES public.user_account(id),
  CONSTRAINT fk_order_result_updated_by FOREIGN KEY (updated_by) REFERENCES public.user_account(id)
);

-- ---------- medication_order ----------
CREATE TABLE public.medication_order (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  patient_id UUID NOT NULL,
  encounter_id UUID NULL,
  prescriber_staff_id UUID NULL,
  drug_name VARCHAR(200) NOT NULL,
  strength VARCHAR(60) NULL,
  dose_form VARCHAR(60) NULL,
  route VARCHAR(40) NULL,
  frequency VARCHAR(100) NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'Active',
  indication VARCHAR(400) NULL,
  start_date DATE NULL,
  end_date DATE NULL,
  monitoring VARCHAR(1000) NULL,
  hold_criteria VARCHAR(1000) NULL,
  safety_note VARCHAR(1000) NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  deleted_at TIMESTAMP(3) NULL,
  created_by UUID NULL,
  created_at TIMESTAMP(3) NOT NULL DEFAULT (now() AT TIME ZONE 'UTC'),
  updated_by UUID NULL,
  updated_at TIMESTAMP(3) NOT NULL DEFAULT (now() AT TIME ZONE 'UTC'),
  CONSTRAINT pk_medication_order PRIMARY KEY (id),
  CONSTRAINT ck_medication_order_status CHECK (status IN ('Active','PRN','Held','Completed','Cancelled')),
  CONSTRAINT fk_medication_order_tenant FOREIGN KEY (tenant_id) REFERENCES public.tenant(id),
  CONSTRAINT fk_medication_order_patient FOREIGN KEY (patient_id) REFERENCES public.patient(id),
  CONSTRAINT fk_medication_order_encounter FOREIGN KEY (encounter_id) REFERENCES public.encounter(id),
  CONSTRAINT fk_medication_order_prescriber FOREIGN KEY (prescriber_staff_id) REFERENCES public.staff_member(id),
  CONSTRAINT fk_medication_order_created_by FOREIGN KEY (created_by) REFERENCES public.user_account(id),
  CONSTRAINT fk_medication_order_updated_by FOREIGN KEY (updated_by) REFERENCES public.user_account(id)
);

-- ---------- medication_administration ----------
CREATE TABLE public.medication_administration (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  medication_order_id UUID NOT NULL,
  administered_at TIMESTAMP(3) NOT NULL,
  administered_by_staff_id UUID NULL,
  dose_given VARCHAR(60) NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'Given',
  note VARCHAR(1000) NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  deleted_at TIMESTAMP(3) NULL,
  created_by UUID NULL,
  created_at TIMESTAMP(3) NOT NULL DEFAULT (now() AT TIME ZONE 'UTC'),
  updated_by UUID NULL,
  updated_at TIMESTAMP(3) NOT NULL DEFAULT (now() AT TIME ZONE 'UTC'),
  CONSTRAINT pk_medication_administration PRIMARY KEY (id),
  CONSTRAINT ck_medication_administration_status CHECK (status IN ('Given','Held','Refused','Missed')),
  CONSTRAINT fk_medication_administration_tenant FOREIGN KEY (tenant_id) REFERENCES public.tenant(id),
  CONSTRAINT fk_medication_administration_order FOREIGN KEY (medication_order_id) REFERENCES public.medication_order(id),
  CONSTRAINT fk_medication_administration_staff FOREIGN KEY (administered_by_staff_id) REFERENCES public.staff_member(id),
  CONSTRAINT fk_medication_administration_created_by FOREIGN KEY (created_by) REFERENCES public.user_account(id),
  CONSTRAINT fk_medication_administration_updated_by FOREIGN KEY (updated_by) REFERENCES public.user_account(id)
);

-- ---------- tooth_finding ----------
CREATE TABLE public.tooth_finding (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  patient_id UUID NOT NULL,
  encounter_id UUID NULL,
  tooth_number VARCHAR(2) NOT NULL,
  dentition VARCHAR(10) NOT NULL,
  tooth_state VARCHAR(20) NOT NULL DEFAULT 'Sound',
  recorded_by_staff_id UUID NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  deleted_at TIMESTAMP(3) NULL,
  created_by UUID NULL,
  created_at TIMESTAMP(3) NOT NULL DEFAULT (now() AT TIME ZONE 'UTC'),
  updated_by UUID NULL,
  updated_at TIMESTAMP(3) NOT NULL DEFAULT (now() AT TIME ZONE 'UTC'),
  CONSTRAINT pk_tooth_finding PRIMARY KEY (id),
  CONSTRAINT ck_tooth_finding_dentition CHECK (dentition IN ('Primary','Permanent')),
  CONSTRAINT ck_tooth_finding_state CHECK (tooth_state IN ('Sound','Caries','Restored','Sealant','Pulp','Crown','Missing','Erupting','Trauma')),
  CONSTRAINT fk_tooth_finding_tenant FOREIGN KEY (tenant_id) REFERENCES public.tenant(id),
  CONSTRAINT fk_tooth_finding_patient FOREIGN KEY (patient_id) REFERENCES public.patient(id),
  CONSTRAINT fk_tooth_finding_encounter FOREIGN KEY (encounter_id) REFERENCES public.encounter(id),
  CONSTRAINT fk_tooth_finding_recorded_by FOREIGN KEY (recorded_by_staff_id) REFERENCES public.staff_member(id),
  CONSTRAINT fk_tooth_finding_created_by FOREIGN KEY (created_by) REFERENCES public.user_account(id),
  CONSTRAINT fk_tooth_finding_updated_by FOREIGN KEY (updated_by) REFERENCES public.user_account(id)
);

-- ---------- tooth_surface_finding (replaces JSONB surfaces) ----------
CREATE TABLE public.tooth_surface_finding (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  tooth_finding_id UUID NOT NULL,
  surface VARCHAR(1) NOT NULL,
  finding VARCHAR(20) NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  deleted_at TIMESTAMP(3) NULL,
  created_by UUID NULL,
  created_at TIMESTAMP(3) NOT NULL DEFAULT (now() AT TIME ZONE 'UTC'),
  updated_by UUID NULL,
  updated_at TIMESTAMP(3) NOT NULL DEFAULT (now() AT TIME ZONE 'UTC'),
  CONSTRAINT pk_tooth_surface_finding PRIMARY KEY (id),
  CONSTRAINT uq_tooth_surface_finding UNIQUE (tooth_finding_id, surface),
  CONSTRAINT ck_tooth_surface_finding_surface CHECK (surface IN ('O','M','D','B','L')),
  CONSTRAINT ck_tooth_surface_finding_finding CHECK (finding IN ('Caries','Restored','Sealant','Fracture','Missing')),
  CONSTRAINT fk_tooth_surface_finding_tenant FOREIGN KEY (tenant_id) REFERENCES public.tenant(id),
  CONSTRAINT fk_tooth_surface_finding_tooth FOREIGN KEY (tooth_finding_id) REFERENCES public.tooth_finding(id),
  CONSTRAINT fk_tooth_surface_finding_created_by FOREIGN KEY (created_by) REFERENCES public.user_account(id),
  CONSTRAINT fk_tooth_surface_finding_updated_by FOREIGN KEY (updated_by) REFERENCES public.user_account(id)
);

-- ---------- dental_image ----------
CREATE TABLE public.dental_image (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  patient_id UUID NOT NULL,
  encounter_id UUID NULL,
  tooth_number VARCHAR(2) NULL,
  image_type VARCHAR(30) NOT NULL,
  storage_path VARCHAR(500) NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  content_type VARCHAR(100) NULL,
  note VARCHAR(1000) NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  deleted_at TIMESTAMP(3) NULL,
  created_by UUID NULL,
  created_at TIMESTAMP(3) NOT NULL DEFAULT (now() AT TIME ZONE 'UTC'),
  updated_by UUID NULL,
  updated_at TIMESTAMP(3) NOT NULL DEFAULT (now() AT TIME ZONE 'UTC'),
  CONSTRAINT pk_dental_image PRIMARY KEY (id),
  CONSTRAINT ck_dental_image_type CHECK (image_type IN ('PeriapicalXray','BitewingXray','PanoramicXray','IntraoralPhoto','ExtraoralPhoto')),
  CONSTRAINT fk_dental_image_tenant FOREIGN KEY (tenant_id) REFERENCES public.tenant(id),
  CONSTRAINT fk_dental_image_patient FOREIGN KEY (patient_id) REFERENCES public.patient(id),
  CONSTRAINT fk_dental_image_encounter FOREIGN KEY (encounter_id) REFERENCES public.encounter(id),
  CONSTRAINT fk_dental_image_created_by FOREIGN KEY (created_by) REFERENCES public.user_account(id),
  CONSTRAINT fk_dental_image_updated_by FOREIGN KEY (updated_by) REFERENCES public.user_account(id)
);

-- ---------- ai_summary (versioned, clinician-reviewed) ----------
CREATE TABLE public.ai_summary (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  patient_id UUID NOT NULL,
  version_no INTEGER NOT NULL DEFAULT 1,
  summary_type VARCHAR(30) NOT NULL DEFAULT 'PediatricDental',
  headline VARCHAR(400) NULL,
  summary_text VARCHAR(8000) NOT NULL,
  model VARCHAR(100) NULL,
  case_source VARCHAR(20) NOT NULL DEFAULT 'BuiltIn',
  case_count INTEGER NOT NULL DEFAULT 0,
  finding_count INTEGER NOT NULL DEFAULT 0,
  status VARCHAR(20) NOT NULL DEFAULT 'Pending',
  generated_by_staff_id UUID NULL,
  generated_at TIMESTAMP(3) NOT NULL DEFAULT (now() AT TIME ZONE 'UTC'),
  reviewed_by_staff_id UUID NULL,
  reviewed_at TIMESTAMP(3) NULL,
  review_note VARCHAR(1000) NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  deleted_at TIMESTAMP(3) NULL,
  created_by UUID NULL,
  created_at TIMESTAMP(3) NOT NULL DEFAULT (now() AT TIME ZONE 'UTC'),
  updated_by UUID NULL,
  updated_at TIMESTAMP(3) NOT NULL DEFAULT (now() AT TIME ZONE 'UTC'),
  CONSTRAINT pk_ai_summary PRIMARY KEY (id),
  CONSTRAINT uq_ai_summary_patient_version UNIQUE (patient_id, summary_type, version_no),
  CONSTRAINT ck_ai_summary_status CHECK (status IN ('Pending','Approved','Rejected')),
  CONSTRAINT ck_ai_summary_case_source CHECK (case_source IN ('BuiltIn','Clinic')),
  CONSTRAINT fk_ai_summary_tenant FOREIGN KEY (tenant_id) REFERENCES public.tenant(id),
  CONSTRAINT fk_ai_summary_patient FOREIGN KEY (patient_id) REFERENCES public.patient(id),
  CONSTRAINT fk_ai_summary_generated_by FOREIGN KEY (generated_by_staff_id) REFERENCES public.staff_member(id),
  CONSTRAINT fk_ai_summary_reviewed_by FOREIGN KEY (reviewed_by_staff_id) REFERENCES public.staff_member(id),
  CONSTRAINT fk_ai_summary_created_by FOREIGN KEY (created_by) REFERENCES public.user_account(id),
  CONSTRAINT fk_ai_summary_updated_by FOREIGN KEY (updated_by) REFERENCES public.user_account(id)
);

-- ---------- reference_case (replaces array-based case library) ----------
CREATE TABLE public.reference_case (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  title VARCHAR(300) NOT NULL,
  presentation VARCHAR(4000) NULL,
  management VARCHAR(4000) NULL,
  evidence VARCHAR(1000) NULL,
  source_name VARCHAR(200) NULL,
  min_surfaces INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  deleted_at TIMESTAMP(3) NULL,
  created_by UUID NULL,
  created_at TIMESTAMP(3) NOT NULL DEFAULT (now() AT TIME ZONE 'UTC'),
  updated_by UUID NULL,
  updated_at TIMESTAMP(3) NOT NULL DEFAULT (now() AT TIME ZONE 'UTC'),
  CONSTRAINT pk_reference_case PRIMARY KEY (id),
  CONSTRAINT fk_reference_case_tenant FOREIGN KEY (tenant_id) REFERENCES public.tenant(id),
  CONSTRAINT fk_reference_case_created_by FOREIGN KEY (created_by) REFERENCES public.user_account(id),
  CONSTRAINT fk_reference_case_updated_by FOREIGN KEY (updated_by) REFERENCES public.user_account(id)
);

-- ---------- reference_case_criterion (one row per match criterion) ----------
CREATE TABLE public.reference_case_criterion (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  reference_case_id UUID NOT NULL,
  criterion_type VARCHAR(20) NOT NULL,
  criterion_value VARCHAR(40) NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  deleted_at TIMESTAMP(3) NULL,
  created_by UUID NULL,
  created_at TIMESTAMP(3) NOT NULL DEFAULT (now() AT TIME ZONE 'UTC'),
  updated_by UUID NULL,
  updated_at TIMESTAMP(3) NOT NULL DEFAULT (now() AT TIME ZONE 'UTC'),
  CONSTRAINT pk_reference_case_criterion PRIMARY KEY (id),
  CONSTRAINT uq_reference_case_criterion UNIQUE (reference_case_id, criterion_type, criterion_value),
  CONSTRAINT ck_reference_case_criterion_type CHECK (criterion_type IN ('ToothState','Surface','ToothNumber','ToothGroup')),
  CONSTRAINT fk_reference_case_criterion_tenant FOREIGN KEY (tenant_id) REFERENCES public.tenant(id),
  CONSTRAINT fk_reference_case_criterion_case FOREIGN KEY (reference_case_id) REFERENCES public.reference_case(id),
  CONSTRAINT fk_reference_case_criterion_created_by FOREIGN KEY (created_by) REFERENCES public.user_account(id),
  CONSTRAINT fk_reference_case_criterion_updated_by FOREIGN KEY (updated_by) REFERENCES public.user_account(id)
);

-- ---------- service_item ----------
CREATE TABLE public.service_item (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  code VARCHAR(40) NOT NULL,
  name VARCHAR(200) NOT NULL,
  category VARCHAR(60) NULL,
  unit_price NUMERIC(12,2) NOT NULL DEFAULT 0,
  currency_code VARCHAR(3) NOT NULL DEFAULT 'AED',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  deleted_at TIMESTAMP(3) NULL,
  created_by UUID NULL,
  created_at TIMESTAMP(3) NOT NULL DEFAULT (now() AT TIME ZONE 'UTC'),
  updated_by UUID NULL,
  updated_at TIMESTAMP(3) NOT NULL DEFAULT (now() AT TIME ZONE 'UTC'),
  CONSTRAINT pk_service_item PRIMARY KEY (id),
  CONSTRAINT uq_service_item_tenant_code UNIQUE (tenant_id, code),
  CONSTRAINT fk_service_item_tenant FOREIGN KEY (tenant_id) REFERENCES public.tenant(id),
  CONSTRAINT fk_service_item_created_by FOREIGN KEY (created_by) REFERENCES public.user_account(id),
  CONSTRAINT fk_service_item_updated_by FOREIGN KEY (updated_by) REFERENCES public.user_account(id)
);

-- ---------- invoice ----------
CREATE TABLE public.invoice (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  facility_id UUID NOT NULL,
  patient_id UUID NOT NULL,
  encounter_id UUID NULL,
  invoice_no VARCHAR(40) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'Draft',
  issued_at TIMESTAMP(3) NULL,
  total_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  patient_share NUMERIC(12,2) NOT NULL DEFAULT 0,
  currency_code VARCHAR(3) NOT NULL DEFAULT 'AED',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  deleted_at TIMESTAMP(3) NULL,
  created_by UUID NULL,
  created_at TIMESTAMP(3) NOT NULL DEFAULT (now() AT TIME ZONE 'UTC'),
  updated_by UUID NULL,
  updated_at TIMESTAMP(3) NOT NULL DEFAULT (now() AT TIME ZONE 'UTC'),
  CONSTRAINT pk_invoice PRIMARY KEY (id),
  CONSTRAINT uq_invoice_tenant_no UNIQUE (tenant_id, invoice_no),
  CONSTRAINT ck_invoice_status CHECK (status IN ('Draft','Issued','PartiallyPaid','Paid','Cancelled')),
  CONSTRAINT fk_invoice_tenant FOREIGN KEY (tenant_id) REFERENCES public.tenant(id),
  CONSTRAINT fk_invoice_facility FOREIGN KEY (facility_id) REFERENCES public.facility(id),
  CONSTRAINT fk_invoice_patient FOREIGN KEY (patient_id) REFERENCES public.patient(id),
  CONSTRAINT fk_invoice_encounter FOREIGN KEY (encounter_id) REFERENCES public.encounter(id),
  CONSTRAINT fk_invoice_created_by FOREIGN KEY (created_by) REFERENCES public.user_account(id),
  CONSTRAINT fk_invoice_updated_by FOREIGN KEY (updated_by) REFERENCES public.user_account(id)
);

-- ---------- invoice_line ----------
CREATE TABLE public.invoice_line (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  invoice_id UUID NOT NULL,
  service_item_id UUID NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price NUMERIC(12,2) NOT NULL DEFAULT 0,
  line_total NUMERIC(12,2) NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  deleted_at TIMESTAMP(3) NULL,
  created_by UUID NULL,
  created_at TIMESTAMP(3) NOT NULL DEFAULT (now() AT TIME ZONE 'UTC'),
  updated_by UUID NULL,
  updated_at TIMESTAMP(3) NOT NULL DEFAULT (now() AT TIME ZONE 'UTC'),
  CONSTRAINT pk_invoice_line PRIMARY KEY (id),
  CONSTRAINT ck_invoice_line_quantity CHECK (quantity > 0),
  CONSTRAINT fk_invoice_line_tenant FOREIGN KEY (tenant_id) REFERENCES public.tenant(id),
  CONSTRAINT fk_invoice_line_invoice FOREIGN KEY (invoice_id) REFERENCES public.invoice(id),
  CONSTRAINT fk_invoice_line_service_item FOREIGN KEY (service_item_id) REFERENCES public.service_item(id),
  CONSTRAINT fk_invoice_line_created_by FOREIGN KEY (created_by) REFERENCES public.user_account(id),
  CONSTRAINT fk_invoice_line_updated_by FOREIGN KEY (updated_by) REFERENCES public.user_account(id)
);

-- ---------- audit_log (written by the application, never by triggers) ----------
CREATE TABLE public.audit_log (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  facility_id UUID NULL,
  entity_name VARCHAR(100) NOT NULL,
  entity_id UUID NOT NULL,
  action_type VARCHAR(20) NOT NULL,
  field_name VARCHAR(100) NULL,
  old_value VARCHAR(4000) NULL,
  new_value VARCHAR(4000) NULL,
  changed_by UUID NULL,
  changed_at TIMESTAMP(3) NOT NULL DEFAULT (now() AT TIME ZONE 'UTC'),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  deleted_at TIMESTAMP(3) NULL,
  created_by UUID NULL,
  created_at TIMESTAMP(3) NOT NULL DEFAULT (now() AT TIME ZONE 'UTC'),
  updated_by UUID NULL,
  updated_at TIMESTAMP(3) NOT NULL DEFAULT (now() AT TIME ZONE 'UTC'),
  CONSTRAINT pk_audit_log PRIMARY KEY (id),
  CONSTRAINT ck_audit_log_action CHECK (action_type IN ('Create','Update','SoftDelete','Restore','Approve','Reject','View')),
  CONSTRAINT fk_audit_log_tenant FOREIGN KEY (tenant_id) REFERENCES public.tenant(id),
  CONSTRAINT fk_audit_log_facility FOREIGN KEY (facility_id) REFERENCES public.facility(id),
  CONSTRAINT fk_audit_log_changed_by FOREIGN KEY (changed_by) REFERENCES public.user_account(id),
  CONSTRAINT fk_audit_log_created_by FOREIGN KEY (created_by) REFERENCES public.user_account(id),
  CONSTRAINT fk_audit_log_updated_by FOREIGN KEY (updated_by) REFERENCES public.user_account(id)
);

-- ---------- grants (no DELETE: soft delete only; audit_log is append-only) ----------
GRANT SELECT, INSERT, UPDATE ON public.clinical_order, public.order_result, public.medication_order,
  public.medication_administration, public.tooth_finding, public.tooth_surface_finding, public.dental_image,
  public.ai_summary, public.reference_case, public.reference_case_criterion, public.service_item,
  public.invoice, public.invoice_line TO authenticated;
GRANT SELECT, INSERT ON public.audit_log TO authenticated;
GRANT ALL ON public.clinical_order, public.order_result, public.medication_order, public.medication_administration,
  public.tooth_finding, public.tooth_surface_finding, public.dental_image, public.ai_summary, public.reference_case,
  public.reference_case_criterion, public.service_item, public.invoice, public.invoice_line, public.audit_log TO service_role;

-- ---------- row-level security ----------
ALTER TABLE public.clinical_order ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_result ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medication_order ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medication_administration ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tooth_finding ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tooth_surface_finding ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dental_image ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_summary ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reference_case ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reference_case_criterion ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_item ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_line ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- clinical writable
CREATE POLICY clinical_order_select ON public.clinical_order FOR SELECT TO authenticated USING (public.app_is_tenant_member(tenant_id));
CREATE POLICY clinical_order_insert ON public.clinical_order FOR INSERT TO authenticated WITH CHECK (public.app_can_write_clinical(tenant_id));
CREATE POLICY clinical_order_update ON public.clinical_order FOR UPDATE TO authenticated USING (public.app_can_write_clinical(tenant_id)) WITH CHECK (public.app_can_write_clinical(tenant_id));

CREATE POLICY order_result_select ON public.order_result FOR SELECT TO authenticated USING (public.app_is_tenant_member(tenant_id));
CREATE POLICY order_result_insert ON public.order_result FOR INSERT TO authenticated WITH CHECK (public.app_can_write_clinical(tenant_id));
CREATE POLICY order_result_update ON public.order_result FOR UPDATE TO authenticated USING (public.app_can_write_clinical(tenant_id)) WITH CHECK (public.app_can_write_clinical(tenant_id));

CREATE POLICY medication_order_select ON public.medication_order FOR SELECT TO authenticated USING (public.app_is_tenant_member(tenant_id));
CREATE POLICY medication_order_insert ON public.medication_order FOR INSERT TO authenticated WITH CHECK (public.app_can_write_clinical(tenant_id));
CREATE POLICY medication_order_update ON public.medication_order FOR UPDATE TO authenticated USING (public.app_can_write_clinical(tenant_id)) WITH CHECK (public.app_can_write_clinical(tenant_id));

CREATE POLICY medication_administration_select ON public.medication_administration FOR SELECT TO authenticated USING (public.app_is_tenant_member(tenant_id));
CREATE POLICY medication_administration_insert ON public.medication_administration FOR INSERT TO authenticated WITH CHECK (public.app_can_write_clinical(tenant_id));
CREATE POLICY medication_administration_update ON public.medication_administration FOR UPDATE TO authenticated USING (public.app_can_write_clinical(tenant_id)) WITH CHECK (public.app_can_write_clinical(tenant_id));

CREATE POLICY tooth_finding_select ON public.tooth_finding FOR SELECT TO authenticated USING (public.app_is_tenant_member(tenant_id));
CREATE POLICY tooth_finding_insert ON public.tooth_finding FOR INSERT TO authenticated WITH CHECK (public.app_can_write_clinical(tenant_id));
CREATE POLICY tooth_finding_update ON public.tooth_finding FOR UPDATE TO authenticated USING (public.app_can_write_clinical(tenant_id)) WITH CHECK (public.app_can_write_clinical(tenant_id));

CREATE POLICY tooth_surface_finding_select ON public.tooth_surface_finding FOR SELECT TO authenticated USING (public.app_is_tenant_member(tenant_id));
CREATE POLICY tooth_surface_finding_insert ON public.tooth_surface_finding FOR INSERT TO authenticated WITH CHECK (public.app_can_write_clinical(tenant_id));
CREATE POLICY tooth_surface_finding_update ON public.tooth_surface_finding FOR UPDATE TO authenticated USING (public.app_can_write_clinical(tenant_id)) WITH CHECK (public.app_can_write_clinical(tenant_id));

CREATE POLICY dental_image_select ON public.dental_image FOR SELECT TO authenticated USING (public.app_is_tenant_member(tenant_id));
CREATE POLICY dental_image_insert ON public.dental_image FOR INSERT TO authenticated WITH CHECK (public.app_can_write_clinical(tenant_id));
CREATE POLICY dental_image_update ON public.dental_image FOR UPDATE TO authenticated USING (public.app_can_write_clinical(tenant_id)) WITH CHECK (public.app_can_write_clinical(tenant_id));

CREATE POLICY ai_summary_select ON public.ai_summary FOR SELECT TO authenticated USING (public.app_is_tenant_member(tenant_id));
CREATE POLICY ai_summary_insert ON public.ai_summary FOR INSERT TO authenticated WITH CHECK (public.app_can_write_clinical(tenant_id));
CREATE POLICY ai_summary_update ON public.ai_summary FOR UPDATE TO authenticated USING (public.app_can_write_clinical(tenant_id)) WITH CHECK (public.app_can_write_clinical(tenant_id));

CREATE POLICY reference_case_select ON public.reference_case FOR SELECT TO authenticated USING (public.app_is_tenant_member(tenant_id));
CREATE POLICY reference_case_insert ON public.reference_case FOR INSERT TO authenticated WITH CHECK (public.app_can_write_clinical(tenant_id));
CREATE POLICY reference_case_update ON public.reference_case FOR UPDATE TO authenticated USING (public.app_can_write_clinical(tenant_id)) WITH CHECK (public.app_can_write_clinical(tenant_id));

CREATE POLICY reference_case_criterion_select ON public.reference_case_criterion FOR SELECT TO authenticated USING (public.app_is_tenant_member(tenant_id));
CREATE POLICY reference_case_criterion_insert ON public.reference_case_criterion FOR INSERT TO authenticated WITH CHECK (public.app_can_write_clinical(tenant_id));
CREATE POLICY reference_case_criterion_update ON public.reference_case_criterion FOR UPDATE TO authenticated USING (public.app_can_write_clinical(tenant_id)) WITH CHECK (public.app_can_write_clinical(tenant_id));

-- admin-managed price list
CREATE POLICY service_item_select ON public.service_item FOR SELECT TO authenticated USING (public.app_is_tenant_member(tenant_id));
CREATE POLICY service_item_insert ON public.service_item FOR INSERT TO authenticated WITH CHECK (public.app_is_tenant_admin(tenant_id));
CREATE POLICY service_item_update ON public.service_item FOR UPDATE TO authenticated USING (public.app_is_tenant_admin(tenant_id)) WITH CHECK (public.app_is_tenant_admin(tenant_id));

-- front-desk writable billing
CREATE POLICY invoice_select ON public.invoice FOR SELECT TO authenticated USING (public.app_is_tenant_member(tenant_id));
CREATE POLICY invoice_insert ON public.invoice FOR INSERT TO authenticated WITH CHECK (public.app_can_write_front_desk(tenant_id));
CREATE POLICY invoice_update ON public.invoice FOR UPDATE TO authenticated USING (public.app_can_write_front_desk(tenant_id)) WITH CHECK (public.app_can_write_front_desk(tenant_id));

CREATE POLICY invoice_line_select ON public.invoice_line FOR SELECT TO authenticated USING (public.app_is_tenant_member(tenant_id));
CREATE POLICY invoice_line_insert ON public.invoice_line FOR INSERT TO authenticated WITH CHECK (public.app_can_write_front_desk(tenant_id));
CREATE POLICY invoice_line_update ON public.invoice_line FOR UPDATE TO authenticated USING (public.app_can_write_front_desk(tenant_id)) WITH CHECK (public.app_can_write_front_desk(tenant_id));

-- append-only audit
CREATE POLICY audit_log_select ON public.audit_log FOR SELECT TO authenticated USING (public.app_is_tenant_member(tenant_id));
CREATE POLICY audit_log_insert ON public.audit_log FOR INSERT TO authenticated WITH CHECK (public.app_is_tenant_member(tenant_id));
