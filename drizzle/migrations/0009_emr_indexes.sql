-- =====================================================================
-- MediMind portable EMR schema — Migration 4: foreign-key and lookup indexes
-- Plain B-tree indexes only (portable to SQL Server nonclustered indexes).
-- =====================================================================
CREATE INDEX ix_facility_tenant ON public.facility (tenant_id);
CREATE INDEX ix_department_tenant_facility ON public.department (tenant_id, facility_id);
CREATE INDEX ix_staff_member_tenant ON public.staff_member (tenant_id, facility_id);
CREATE INDEX ix_user_account_staff_member ON public.user_account (staff_member_id);
CREATE INDEX ix_user_account_role_user ON public.user_account_role (user_account_id);
CREATE INDEX ix_user_account_role_tenant ON public.user_account_role (tenant_id, role_id);
CREATE INDEX ix_tenant_subscription_tenant ON public.tenant_subscription (tenant_id, status);
CREATE INDEX ix_tenant_feature_feature ON public.tenant_feature (feature_id);

CREATE INDEX ix_patient_tenant_name ON public.patient (tenant_id, last_name, first_name);
CREATE INDEX ix_patient_facility ON public.patient (facility_id);
CREATE INDEX ix_patient_contact_patient ON public.patient_contact (patient_id);
CREATE INDEX ix_patient_allergy_patient ON public.patient_allergy (patient_id);
CREATE INDEX ix_patient_insurance_patient ON public.patient_insurance (patient_id);
CREATE INDEX ix_patient_history_entry_patient ON public.patient_history_entry (patient_id, category);
CREATE INDEX ix_patient_immunization_patient ON public.patient_immunization (patient_id);

CREATE INDEX ix_appointment_facility_start ON public.appointment (facility_id, scheduled_start);
CREATE INDEX ix_appointment_patient ON public.appointment (patient_id);
CREATE INDEX ix_appointment_staff_start ON public.appointment (staff_member_id, scheduled_start);
CREATE INDEX ix_encounter_patient_admitted ON public.encounter (patient_id, admitted_at);
CREATE INDEX ix_encounter_facility_status ON public.encounter (facility_id, status);
CREATE INDEX ix_encounter_attending ON public.encounter (attending_staff_id);
CREATE INDEX ix_clinical_note_encounter ON public.clinical_note (encounter_id);
CREATE INDEX ix_vital_sign_set_patient_time ON public.vital_sign_set (patient_id, recorded_at);
CREATE INDEX ix_vital_sign_set_encounter ON public.vital_sign_set (encounter_id);
CREATE INDEX ix_diagnosis_patient ON public.diagnosis (patient_id, status);
CREATE INDEX ix_diagnosis_encounter ON public.diagnosis (encounter_id);
CREATE INDEX ix_diagnosis_icd10 ON public.diagnosis (tenant_id, icd10_code);

CREATE INDEX ix_clinical_order_patient ON public.clinical_order (patient_id, status);
CREATE INDEX ix_clinical_order_encounter ON public.clinical_order (encounter_id);
CREATE INDEX ix_order_result_order ON public.order_result (clinical_order_id);
CREATE INDEX ix_medication_order_patient ON public.medication_order (patient_id, status);
CREATE INDEX ix_medication_order_encounter ON public.medication_order (encounter_id);
CREATE INDEX ix_medication_administration_order ON public.medication_administration (medication_order_id, administered_at);

CREATE INDEX ix_tooth_finding_patient_tooth ON public.tooth_finding (patient_id, tooth_number);
CREATE INDEX ix_tooth_surface_finding_tooth ON public.tooth_surface_finding (tooth_finding_id);
CREATE INDEX ix_dental_image_patient ON public.dental_image (patient_id);
CREATE INDEX ix_ai_summary_patient_status ON public.ai_summary (patient_id, status);
CREATE INDEX ix_reference_case_tenant ON public.reference_case (tenant_id);
CREATE INDEX ix_reference_case_criterion_case ON public.reference_case_criterion (reference_case_id);
CREATE INDEX ix_reference_case_criterion_lookup ON public.reference_case_criterion (tenant_id, criterion_type, criterion_value);

CREATE INDEX ix_invoice_patient ON public.invoice (patient_id);
CREATE INDEX ix_invoice_facility_status ON public.invoice (facility_id, status);
CREATE INDEX ix_invoice_line_invoice ON public.invoice_line (invoice_id);
CREATE INDEX ix_invoice_line_service_item ON public.invoice_line (service_item_id);

CREATE INDEX ix_audit_log_entity ON public.audit_log (entity_name, entity_id, changed_at);
CREATE INDEX ix_audit_log_tenant_time ON public.audit_log (tenant_id, changed_at);
CREATE INDEX ix_audit_log_changed_by ON public.audit_log (changed_by);
