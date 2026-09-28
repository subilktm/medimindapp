export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      ai_summary: {
        Row: {
          case_count: number
          case_source: string
          created_at: string
          created_by: string | null
          deleted_at: string | null
          finding_count: number
          generated_at: string
          generated_by_staff_id: string | null
          headline: string | null
          id: string
          is_active: boolean
          model: string | null
          patient_id: string
          review_note: string | null
          reviewed_at: string | null
          reviewed_by_staff_id: string | null
          status: string
          summary_text: string
          summary_type: string
          tenant_id: string
          updated_at: string
          updated_by: string | null
          version_no: number
        }
        Insert: {
          case_count?: number
          case_source?: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          finding_count?: number
          generated_at?: string
          generated_by_staff_id?: string | null
          headline?: string | null
          id?: string
          is_active?: boolean
          model?: string | null
          patient_id: string
          review_note?: string | null
          reviewed_at?: string | null
          reviewed_by_staff_id?: string | null
          status?: string
          summary_text: string
          summary_type?: string
          tenant_id: string
          updated_at?: string
          updated_by?: string | null
          version_no?: number
        }
        Update: {
          case_count?: number
          case_source?: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          finding_count?: number
          generated_at?: string
          generated_by_staff_id?: string | null
          headline?: string | null
          id?: string
          is_active?: boolean
          model?: string | null
          patient_id?: string
          review_note?: string | null
          reviewed_at?: string | null
          reviewed_by_staff_id?: string | null
          status?: string
          summary_text?: string
          summary_type?: string
          tenant_id?: string
          updated_at?: string
          updated_by?: string | null
          version_no?: number
        }
        Relationships: [
          {
            foreignKeyName: "fk_ai_summary_created_by"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_account"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_ai_summary_generated_by"
            columns: ["generated_by_staff_id"]
            isOneToOne: false
            referencedRelation: "staff_member"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_ai_summary_patient"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patient"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_ai_summary_reviewed_by"
            columns: ["reviewed_by_staff_id"]
            isOneToOne: false
            referencedRelation: "staff_member"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_ai_summary_tenant"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_ai_summary_updated_by"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "user_account"
            referencedColumns: ["id"]
          },
        ]
      }
      appointment: {
        Row: {
          created_at: string
          created_by: string | null
          deleted_at: string | null
          department_id: string | null
          facility_id: string
          id: string
          is_active: boolean
          patient_id: string
          reason: string | null
          scheduled_end: string
          scheduled_start: string
          staff_member_id: string | null
          status: string
          tenant_id: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          department_id?: string | null
          facility_id: string
          id?: string
          is_active?: boolean
          patient_id: string
          reason?: string | null
          scheduled_end: string
          scheduled_start: string
          staff_member_id?: string | null
          status?: string
          tenant_id: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          department_id?: string | null
          facility_id?: string
          id?: string
          is_active?: boolean
          patient_id?: string
          reason?: string | null
          scheduled_end?: string
          scheduled_start?: string
          staff_member_id?: string | null
          status?: string
          tenant_id?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_appointment_created_by"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_account"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_appointment_department"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "department"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_appointment_facility"
            columns: ["facility_id"]
            isOneToOne: false
            referencedRelation: "facility"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_appointment_patient"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patient"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_appointment_staff_member"
            columns: ["staff_member_id"]
            isOneToOne: false
            referencedRelation: "staff_member"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_appointment_tenant"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_appointment_updated_by"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "user_account"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_log: {
        Row: {
          action_type: string
          changed_at: string
          changed_by: string | null
          created_at: string
          created_by: string | null
          deleted_at: string | null
          entity_id: string
          entity_name: string
          facility_id: string | null
          field_name: string | null
          id: string
          is_active: boolean
          new_value: string | null
          old_value: string | null
          tenant_id: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          action_type: string
          changed_at?: string
          changed_by?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          entity_id: string
          entity_name: string
          facility_id?: string | null
          field_name?: string | null
          id?: string
          is_active?: boolean
          new_value?: string | null
          old_value?: string | null
          tenant_id: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          action_type?: string
          changed_at?: string
          changed_by?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          entity_id?: string
          entity_name?: string
          facility_id?: string | null
          field_name?: string | null
          id?: string
          is_active?: boolean
          new_value?: string | null
          old_value?: string | null
          tenant_id?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_audit_log_changed_by"
            columns: ["changed_by"]
            isOneToOne: false
            referencedRelation: "user_account"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_audit_log_created_by"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_account"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_audit_log_facility"
            columns: ["facility_id"]
            isOneToOne: false
            referencedRelation: "facility"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_audit_log_tenant"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_audit_log_updated_by"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "user_account"
            referencedColumns: ["id"]
          },
        ]
      }
      clinical_note: {
        Row: {
          assessment: string | null
          author_staff_id: string | null
          created_at: string
          created_by: string | null
          deleted_at: string | null
          encounter_id: string
          id: string
          is_active: boolean
          note_type: string
          objective: string | null
          plan_of_care: string | null
          signed_at: string | null
          subjective: string | null
          tenant_id: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          assessment?: string | null
          author_staff_id?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          encounter_id: string
          id?: string
          is_active?: boolean
          note_type?: string
          objective?: string | null
          plan_of_care?: string | null
          signed_at?: string | null
          subjective?: string | null
          tenant_id: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          assessment?: string | null
          author_staff_id?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          encounter_id?: string
          id?: string
          is_active?: boolean
          note_type?: string
          objective?: string | null
          plan_of_care?: string | null
          signed_at?: string | null
          subjective?: string | null
          tenant_id?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_clinical_note_author"
            columns: ["author_staff_id"]
            isOneToOne: false
            referencedRelation: "staff_member"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_clinical_note_created_by"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_account"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_clinical_note_encounter"
            columns: ["encounter_id"]
            isOneToOne: false
            referencedRelation: "encounter"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_clinical_note_tenant"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_clinical_note_updated_by"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "user_account"
            referencedColumns: ["id"]
          },
        ]
      }
      clinical_order: {
        Row: {
          created_at: string
          created_by: string | null
          deleted_at: string | null
          encounter_id: string | null
          facility_id: string
          id: string
          is_active: boolean
          name: string
          order_type: string
          ordered_at: string
          ordered_by_staff_id: string | null
          patient_id: string
          priority: string
          status: string
          tenant_id: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          encounter_id?: string | null
          facility_id: string
          id?: string
          is_active?: boolean
          name: string
          order_type: string
          ordered_at?: string
          ordered_by_staff_id?: string | null
          patient_id: string
          priority?: string
          status?: string
          tenant_id: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          encounter_id?: string | null
          facility_id?: string
          id?: string
          is_active?: boolean
          name?: string
          order_type?: string
          ordered_at?: string
          ordered_by_staff_id?: string | null
          patient_id?: string
          priority?: string
          status?: string
          tenant_id?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_clinical_order_created_by"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_account"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_clinical_order_encounter"
            columns: ["encounter_id"]
            isOneToOne: false
            referencedRelation: "encounter"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_clinical_order_facility"
            columns: ["facility_id"]
            isOneToOne: false
            referencedRelation: "facility"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_clinical_order_ordered_by"
            columns: ["ordered_by_staff_id"]
            isOneToOne: false
            referencedRelation: "staff_member"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_clinical_order_patient"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patient"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_clinical_order_tenant"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_clinical_order_updated_by"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "user_account"
            referencedColumns: ["id"]
          },
        ]
      }
      dental_image: {
        Row: {
          content_type: string | null
          created_at: string
          created_by: string | null
          deleted_at: string | null
          encounter_id: string | null
          file_name: string
          id: string
          image_type: string
          is_active: boolean
          note: string | null
          patient_id: string
          storage_path: string
          tenant_id: string
          tooth_number: string | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          content_type?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          encounter_id?: string | null
          file_name: string
          id?: string
          image_type: string
          is_active?: boolean
          note?: string | null
          patient_id: string
          storage_path: string
          tenant_id: string
          tooth_number?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          content_type?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          encounter_id?: string | null
          file_name?: string
          id?: string
          image_type?: string
          is_active?: boolean
          note?: string | null
          patient_id?: string
          storage_path?: string
          tenant_id?: string
          tooth_number?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_dental_image_created_by"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_account"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_dental_image_encounter"
            columns: ["encounter_id"]
            isOneToOne: false
            referencedRelation: "encounter"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_dental_image_patient"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patient"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_dental_image_tenant"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_dental_image_updated_by"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "user_account"
            referencedColumns: ["id"]
          },
        ]
      }
      dental_images: {
        Row: {
          created_at: string
          file_name: string
          id: string
          image_type: string
          note: string
          patient_id: string
          storage_path: string
          tooth: string
          uploaded_by: string | null
          uploaded_by_name: string
        }
        Insert: {
          created_at?: string
          file_name?: string
          id?: string
          image_type?: string
          note?: string
          patient_id: string
          storage_path: string
          tooth?: string
          uploaded_by?: string | null
          uploaded_by_name?: string
        }
        Update: {
          created_at?: string
          file_name?: string
          id?: string
          image_type?: string
          note?: string
          patient_id?: string
          storage_path?: string
          tooth?: string
          uploaded_by?: string | null
          uploaded_by_name?: string
        }
        Relationships: []
      }
      department: {
        Row: {
          code: string
          created_at: string
          created_by: string | null
          deleted_at: string | null
          facility_id: string
          id: string
          is_active: boolean
          name: string
          specialty: string | null
          tenant_id: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          code: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          facility_id: string
          id?: string
          is_active?: boolean
          name: string
          specialty?: string | null
          tenant_id: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          code?: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          facility_id?: string
          id?: string
          is_active?: boolean
          name?: string
          specialty?: string | null
          tenant_id?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_department_created_by"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_account"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_department_facility"
            columns: ["facility_id"]
            isOneToOne: false
            referencedRelation: "facility"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_department_tenant"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_department_updated_by"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "user_account"
            referencedColumns: ["id"]
          },
        ]
      }
      diagnosis: {
        Row: {
          created_at: string
          created_by: string | null
          deleted_at: string | null
          description: string
          diagnosis_type: string
          encounter_id: string | null
          icd10_code: string
          id: string
          is_active: boolean
          onset_date: string | null
          patient_id: string
          recorded_by_staff_id: string | null
          resolved_date: string | null
          status: string
          tenant_id: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          description: string
          diagnosis_type?: string
          encounter_id?: string | null
          icd10_code: string
          id?: string
          is_active?: boolean
          onset_date?: string | null
          patient_id: string
          recorded_by_staff_id?: string | null
          resolved_date?: string | null
          status?: string
          tenant_id: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          description?: string
          diagnosis_type?: string
          encounter_id?: string | null
          icd10_code?: string
          id?: string
          is_active?: boolean
          onset_date?: string | null
          patient_id?: string
          recorded_by_staff_id?: string | null
          resolved_date?: string | null
          status?: string
          tenant_id?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_diagnosis_created_by"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_account"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_diagnosis_encounter"
            columns: ["encounter_id"]
            isOneToOne: false
            referencedRelation: "encounter"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_diagnosis_patient"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patient"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_diagnosis_recorded_by"
            columns: ["recorded_by_staff_id"]
            isOneToOne: false
            referencedRelation: "staff_member"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_diagnosis_tenant"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_diagnosis_updated_by"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "user_account"
            referencedColumns: ["id"]
          },
        ]
      }
      encounter: {
        Row: {
          admitted_at: string
          appointment_id: string | null
          attending_staff_id: string | null
          chief_complaint: string | null
          created_at: string
          created_by: string | null
          deleted_at: string | null
          department_id: string | null
          discharged_at: string | null
          disposition: string | null
          encounter_no: string
          encounter_type: string
          facility_id: string
          follow_up: string | null
          id: string
          is_active: boolean
          patient_id: string
          room: string | null
          status: string
          summary: string | null
          tenant_id: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          admitted_at: string
          appointment_id?: string | null
          attending_staff_id?: string | null
          chief_complaint?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          department_id?: string | null
          discharged_at?: string | null
          disposition?: string | null
          encounter_no: string
          encounter_type: string
          facility_id: string
          follow_up?: string | null
          id?: string
          is_active?: boolean
          patient_id: string
          room?: string | null
          status?: string
          summary?: string | null
          tenant_id: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          admitted_at?: string
          appointment_id?: string | null
          attending_staff_id?: string | null
          chief_complaint?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          department_id?: string | null
          discharged_at?: string | null
          disposition?: string | null
          encounter_no?: string
          encounter_type?: string
          facility_id?: string
          follow_up?: string | null
          id?: string
          is_active?: boolean
          patient_id?: string
          room?: string | null
          status?: string
          summary?: string | null
          tenant_id?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_encounter_appointment"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointment"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_encounter_attending_staff"
            columns: ["attending_staff_id"]
            isOneToOne: false
            referencedRelation: "staff_member"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_encounter_created_by"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_account"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_encounter_department"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "department"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_encounter_facility"
            columns: ["facility_id"]
            isOneToOne: false
            referencedRelation: "facility"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_encounter_patient"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patient"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_encounter_tenant"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_encounter_updated_by"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "user_account"
            referencedColumns: ["id"]
          },
        ]
      }
      facility: {
        Row: {
          address: string | null
          code: string
          created_at: string
          created_by: string | null
          deleted_at: string | null
          id: string
          is_active: boolean
          license_no: string | null
          name: string
          phone: string | null
          tenant_id: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          address?: string | null
          code: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          id?: string
          is_active?: boolean
          license_no?: string | null
          name: string
          phone?: string | null
          tenant_id: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          address?: string | null
          code?: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          id?: string
          is_active?: boolean
          license_no?: string | null
          name?: string
          phone?: string | null
          tenant_id?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_facility_created_by"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_account"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_facility_tenant"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_facility_updated_by"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "user_account"
            referencedColumns: ["id"]
          },
        ]
      }
      feature: {
        Row: {
          code: string
          created_at: string
          created_by: string | null
          deleted_at: string | null
          description: string | null
          id: string
          is_active: boolean
          name: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          code: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          code?: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_feature_created_by"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_account"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_feature_updated_by"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "user_account"
            referencedColumns: ["id"]
          },
        ]
      }
      invoice: {
        Row: {
          created_at: string
          created_by: string | null
          currency_code: string
          deleted_at: string | null
          encounter_id: string | null
          facility_id: string
          id: string
          invoice_no: string
          is_active: boolean
          issued_at: string | null
          patient_id: string
          patient_share: number
          status: string
          tenant_id: string
          total_amount: number
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          currency_code?: string
          deleted_at?: string | null
          encounter_id?: string | null
          facility_id: string
          id?: string
          invoice_no: string
          is_active?: boolean
          issued_at?: string | null
          patient_id: string
          patient_share?: number
          status?: string
          tenant_id: string
          total_amount?: number
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          currency_code?: string
          deleted_at?: string | null
          encounter_id?: string | null
          facility_id?: string
          id?: string
          invoice_no?: string
          is_active?: boolean
          issued_at?: string | null
          patient_id?: string
          patient_share?: number
          status?: string
          tenant_id?: string
          total_amount?: number
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_invoice_created_by"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_account"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_invoice_encounter"
            columns: ["encounter_id"]
            isOneToOne: false
            referencedRelation: "encounter"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_invoice_facility"
            columns: ["facility_id"]
            isOneToOne: false
            referencedRelation: "facility"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_invoice_patient"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patient"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_invoice_tenant"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_invoice_updated_by"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "user_account"
            referencedColumns: ["id"]
          },
        ]
      }
      invoice_line: {
        Row: {
          created_at: string
          created_by: string | null
          deleted_at: string | null
          id: string
          invoice_id: string
          is_active: boolean
          line_total: number
          quantity: number
          service_item_id: string
          tenant_id: string
          unit_price: number
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          id?: string
          invoice_id: string
          is_active?: boolean
          line_total?: number
          quantity?: number
          service_item_id: string
          tenant_id: string
          unit_price?: number
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          id?: string
          invoice_id?: string
          is_active?: boolean
          line_total?: number
          quantity?: number
          service_item_id?: string
          tenant_id?: string
          unit_price?: number
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_invoice_line_created_by"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_account"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_invoice_line_invoice"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoice"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_invoice_line_service_item"
            columns: ["service_item_id"]
            isOneToOne: false
            referencedRelation: "service_item"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_invoice_line_tenant"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_invoice_line_updated_by"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "user_account"
            referencedColumns: ["id"]
          },
        ]
      }
      medication_administration: {
        Row: {
          administered_at: string
          administered_by_staff_id: string | null
          created_at: string
          created_by: string | null
          deleted_at: string | null
          dose_given: string | null
          id: string
          is_active: boolean
          medication_order_id: string
          note: string | null
          status: string
          tenant_id: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          administered_at: string
          administered_by_staff_id?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          dose_given?: string | null
          id?: string
          is_active?: boolean
          medication_order_id: string
          note?: string | null
          status?: string
          tenant_id: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          administered_at?: string
          administered_by_staff_id?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          dose_given?: string | null
          id?: string
          is_active?: boolean
          medication_order_id?: string
          note?: string | null
          status?: string
          tenant_id?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_medication_administration_created_by"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_account"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_medication_administration_order"
            columns: ["medication_order_id"]
            isOneToOne: false
            referencedRelation: "medication_order"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_medication_administration_staff"
            columns: ["administered_by_staff_id"]
            isOneToOne: false
            referencedRelation: "staff_member"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_medication_administration_tenant"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_medication_administration_updated_by"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "user_account"
            referencedColumns: ["id"]
          },
        ]
      }
      medication_order: {
        Row: {
          created_at: string
          created_by: string | null
          deleted_at: string | null
          dose_form: string | null
          drug_name: string
          encounter_id: string | null
          end_date: string | null
          frequency: string | null
          hold_criteria: string | null
          id: string
          indication: string | null
          is_active: boolean
          monitoring: string | null
          patient_id: string
          prescriber_staff_id: string | null
          route: string | null
          safety_note: string | null
          start_date: string | null
          status: string
          strength: string | null
          tenant_id: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          dose_form?: string | null
          drug_name: string
          encounter_id?: string | null
          end_date?: string | null
          frequency?: string | null
          hold_criteria?: string | null
          id?: string
          indication?: string | null
          is_active?: boolean
          monitoring?: string | null
          patient_id: string
          prescriber_staff_id?: string | null
          route?: string | null
          safety_note?: string | null
          start_date?: string | null
          status?: string
          strength?: string | null
          tenant_id: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          dose_form?: string | null
          drug_name?: string
          encounter_id?: string | null
          end_date?: string | null
          frequency?: string | null
          hold_criteria?: string | null
          id?: string
          indication?: string | null
          is_active?: boolean
          monitoring?: string | null
          patient_id?: string
          prescriber_staff_id?: string | null
          route?: string | null
          safety_note?: string | null
          start_date?: string | null
          status?: string
          strength?: string | null
          tenant_id?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_medication_order_created_by"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_account"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_medication_order_encounter"
            columns: ["encounter_id"]
            isOneToOne: false
            referencedRelation: "encounter"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_medication_order_patient"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patient"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_medication_order_prescriber"
            columns: ["prescriber_staff_id"]
            isOneToOne: false
            referencedRelation: "staff_member"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_medication_order_tenant"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_medication_order_updated_by"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "user_account"
            referencedColumns: ["id"]
          },
        ]
      }
      order_result: {
        Row: {
          abnormal_flag: string | null
          clinical_order_id: string
          created_at: string
          created_by: string | null
          deleted_at: string | null
          id: string
          is_active: boolean
          reference_range: string | null
          result_name: string
          result_value: string | null
          resulted_at: string | null
          tenant_id: string
          unit: string | null
          updated_at: string
          updated_by: string | null
          verified_by_staff_id: string | null
        }
        Insert: {
          abnormal_flag?: string | null
          clinical_order_id: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          id?: string
          is_active?: boolean
          reference_range?: string | null
          result_name: string
          result_value?: string | null
          resulted_at?: string | null
          tenant_id: string
          unit?: string | null
          updated_at?: string
          updated_by?: string | null
          verified_by_staff_id?: string | null
        }
        Update: {
          abnormal_flag?: string | null
          clinical_order_id?: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          id?: string
          is_active?: boolean
          reference_range?: string | null
          result_name?: string
          result_value?: string | null
          resulted_at?: string | null
          tenant_id?: string
          unit?: string | null
          updated_at?: string
          updated_by?: string | null
          verified_by_staff_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_order_result_created_by"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_account"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_order_result_order"
            columns: ["clinical_order_id"]
            isOneToOne: false
            referencedRelation: "clinical_order"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_order_result_tenant"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_order_result_updated_by"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "user_account"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_order_result_verified_by"
            columns: ["verified_by_staff_id"]
            isOneToOne: false
            referencedRelation: "staff_member"
            referencedColumns: ["id"]
          },
        ]
      }
      patient: {
        Row: {
          blood_group: string | null
          created_at: string
          created_by: string | null
          date_of_birth: string
          deleted_at: string | null
          email: string | null
          facility_id: string
          first_name: string
          id: string
          is_active: boolean
          last_name: string
          mobile: string | null
          mrn: string
          national_id: string | null
          sex: string
          tenant_id: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          blood_group?: string | null
          created_at?: string
          created_by?: string | null
          date_of_birth: string
          deleted_at?: string | null
          email?: string | null
          facility_id: string
          first_name: string
          id?: string
          is_active?: boolean
          last_name: string
          mobile?: string | null
          mrn: string
          national_id?: string | null
          sex: string
          tenant_id: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          blood_group?: string | null
          created_at?: string
          created_by?: string | null
          date_of_birth?: string
          deleted_at?: string | null
          email?: string | null
          facility_id?: string
          first_name?: string
          id?: string
          is_active?: boolean
          last_name?: string
          mobile?: string | null
          mrn?: string
          national_id?: string | null
          sex?: string
          tenant_id?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_patient_created_by"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_account"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_patient_facility"
            columns: ["facility_id"]
            isOneToOne: false
            referencedRelation: "facility"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_patient_tenant"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_patient_updated_by"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "user_account"
            referencedColumns: ["id"]
          },
        ]
      }
      patient_allergy: {
        Row: {
          allergen: string
          created_at: string
          created_by: string | null
          deleted_at: string | null
          id: string
          is_active: boolean
          patient_id: string
          reaction: string | null
          recorded_by_staff_id: string | null
          recorded_on: string | null
          severity: string
          tenant_id: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          allergen: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          id?: string
          is_active?: boolean
          patient_id: string
          reaction?: string | null
          recorded_by_staff_id?: string | null
          recorded_on?: string | null
          severity?: string
          tenant_id: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          allergen?: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          id?: string
          is_active?: boolean
          patient_id?: string
          reaction?: string | null
          recorded_by_staff_id?: string | null
          recorded_on?: string | null
          severity?: string
          tenant_id?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_patient_allergy_created_by"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_account"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_patient_allergy_patient"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patient"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_patient_allergy_recorded_by"
            columns: ["recorded_by_staff_id"]
            isOneToOne: false
            referencedRelation: "staff_member"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_patient_allergy_tenant"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_patient_allergy_updated_by"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "user_account"
            referencedColumns: ["id"]
          },
        ]
      }
      patient_contact: {
        Row: {
          contact_type: string
          created_at: string
          created_by: string | null
          deleted_at: string | null
          full_name: string
          id: string
          is_active: boolean
          is_legal_guardian: boolean
          national_id: string | null
          patient_id: string
          phone: string | null
          relationship: string | null
          tenant_id: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          contact_type: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          full_name: string
          id?: string
          is_active?: boolean
          is_legal_guardian?: boolean
          national_id?: string | null
          patient_id: string
          phone?: string | null
          relationship?: string | null
          tenant_id: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          contact_type?: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          full_name?: string
          id?: string
          is_active?: boolean
          is_legal_guardian?: boolean
          national_id?: string | null
          patient_id?: string
          phone?: string | null
          relationship?: string | null
          tenant_id?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_patient_contact_created_by"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_account"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_patient_contact_patient"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patient"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_patient_contact_tenant"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_patient_contact_updated_by"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "user_account"
            referencedColumns: ["id"]
          },
        ]
      }
      patient_history_entry: {
        Row: {
          category: string
          created_at: string
          created_by: string | null
          deleted_at: string | null
          description: string
          facility_name: string | null
          id: string
          is_active: boolean
          is_flagged: boolean
          notes: string | null
          onset_text: string | null
          patient_id: string
          relation: string | null
          status: string | null
          tenant_id: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          category: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          description: string
          facility_name?: string | null
          id?: string
          is_active?: boolean
          is_flagged?: boolean
          notes?: string | null
          onset_text?: string | null
          patient_id: string
          relation?: string | null
          status?: string | null
          tenant_id: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          category?: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          description?: string
          facility_name?: string | null
          id?: string
          is_active?: boolean
          is_flagged?: boolean
          notes?: string | null
          onset_text?: string | null
          patient_id?: string
          relation?: string | null
          status?: string | null
          tenant_id?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_patient_history_entry_created_by"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_account"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_patient_history_entry_patient"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patient"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_patient_history_entry_tenant"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_patient_history_entry_updated_by"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "user_account"
            referencedColumns: ["id"]
          },
        ]
      }
      patient_immunization: {
        Row: {
          administered_on: string | null
          administered_text: string | null
          created_at: string
          created_by: string | null
          deleted_at: string | null
          dose_no: number | null
          id: string
          is_active: boolean
          patient_id: string
          status: string
          tenant_id: string
          updated_at: string
          updated_by: string | null
          vaccine: string
        }
        Insert: {
          administered_on?: string | null
          administered_text?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          dose_no?: number | null
          id?: string
          is_active?: boolean
          patient_id: string
          status?: string
          tenant_id: string
          updated_at?: string
          updated_by?: string | null
          vaccine: string
        }
        Update: {
          administered_on?: string | null
          administered_text?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          dose_no?: number | null
          id?: string
          is_active?: boolean
          patient_id?: string
          status?: string
          tenant_id?: string
          updated_at?: string
          updated_by?: string | null
          vaccine?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_patient_immunization_created_by"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_account"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_patient_immunization_patient"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patient"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_patient_immunization_tenant"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_patient_immunization_updated_by"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "user_account"
            referencedColumns: ["id"]
          },
        ]
      }
      patient_insurance: {
        Row: {
          created_at: string
          created_by: string | null
          deleted_at: string | null
          eligibility_status: string
          id: string
          is_active: boolean
          member_no: string | null
          patient_id: string
          payer_name: string
          policy_no: string
          tenant_id: string
          updated_at: string
          updated_by: string | null
          valid_from: string | null
          valid_to: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          eligibility_status?: string
          id?: string
          is_active?: boolean
          member_no?: string | null
          patient_id: string
          payer_name: string
          policy_no: string
          tenant_id: string
          updated_at?: string
          updated_by?: string | null
          valid_from?: string | null
          valid_to?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          eligibility_status?: string
          id?: string
          is_active?: boolean
          member_no?: string | null
          patient_id?: string
          payer_name?: string
          policy_no?: string
          tenant_id?: string
          updated_at?: string
          updated_by?: string | null
          valid_from?: string | null
          valid_to?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_patient_insurance_created_by"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_account"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_patient_insurance_patient"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patient"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_patient_insurance_tenant"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_patient_insurance_updated_by"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "user_account"
            referencedColumns: ["id"]
          },
        ]
      }
      pedo_case_library: {
        Row: {
          active: boolean
          created_at: string
          created_by: string | null
          created_by_name: string
          evidence: string
          id: string
          management: string
          min_surfaces: number
          presentation: string
          source_name: string
          surface_findings: string[]
          title: string
          tooth_group: string
          tooth_numbers: string[]
          tooth_states: string[]
        }
        Insert: {
          active?: boolean
          created_at?: string
          created_by?: string | null
          created_by_name?: string
          evidence?: string
          id?: string
          management?: string
          min_surfaces?: number
          presentation?: string
          source_name?: string
          surface_findings?: string[]
          title: string
          tooth_group?: string
          tooth_numbers?: string[]
          tooth_states?: string[]
        }
        Update: {
          active?: boolean
          created_at?: string
          created_by?: string | null
          created_by_name?: string
          evidence?: string
          id?: string
          management?: string
          min_surfaces?: number
          presentation?: string
          source_name?: string
          surface_findings?: string[]
          title?: string
          tooth_group?: string
          tooth_numbers?: string[]
          tooth_states?: string[]
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          full_name: string
          id: string
          updated_at: string
          username: string
        }
        Insert: {
          created_at?: string
          full_name?: string
          id: string
          updated_at?: string
          username: string
        }
        Update: {
          created_at?: string
          full_name?: string
          id?: string
          updated_at?: string
          username?: string
        }
        Relationships: []
      }
      reference_case: {
        Row: {
          created_at: string
          created_by: string | null
          deleted_at: string | null
          evidence: string | null
          id: string
          is_active: boolean
          management: string | null
          min_surfaces: number
          presentation: string | null
          source_name: string | null
          tenant_id: string
          title: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          evidence?: string | null
          id?: string
          is_active?: boolean
          management?: string | null
          min_surfaces?: number
          presentation?: string | null
          source_name?: string | null
          tenant_id: string
          title: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          evidence?: string | null
          id?: string
          is_active?: boolean
          management?: string | null
          min_surfaces?: number
          presentation?: string | null
          source_name?: string | null
          tenant_id?: string
          title?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_reference_case_created_by"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_account"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_reference_case_tenant"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_reference_case_updated_by"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "user_account"
            referencedColumns: ["id"]
          },
        ]
      }
      reference_case_criterion: {
        Row: {
          created_at: string
          created_by: string | null
          criterion_type: string
          criterion_value: string
          deleted_at: string | null
          id: string
          is_active: boolean
          reference_case_id: string
          tenant_id: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          criterion_type: string
          criterion_value: string
          deleted_at?: string | null
          id?: string
          is_active?: boolean
          reference_case_id: string
          tenant_id: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          criterion_type?: string
          criterion_value?: string
          deleted_at?: string | null
          id?: string
          is_active?: boolean
          reference_case_id?: string
          tenant_id?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_reference_case_criterion_case"
            columns: ["reference_case_id"]
            isOneToOne: false
            referencedRelation: "reference_case"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_reference_case_criterion_created_by"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_account"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_reference_case_criterion_tenant"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_reference_case_criterion_updated_by"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "user_account"
            referencedColumns: ["id"]
          },
        ]
      }
      role: {
        Row: {
          code: string
          created_at: string
          created_by: string | null
          deleted_at: string | null
          description: string | null
          id: string
          is_active: boolean
          name: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          code: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          code?: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_role_created_by"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_account"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_role_updated_by"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "user_account"
            referencedColumns: ["id"]
          },
        ]
      }
      service_item: {
        Row: {
          category: string | null
          code: string
          created_at: string
          created_by: string | null
          currency_code: string
          deleted_at: string | null
          id: string
          is_active: boolean
          name: string
          tenant_id: string
          unit_price: number
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          category?: string | null
          code: string
          created_at?: string
          created_by?: string | null
          currency_code?: string
          deleted_at?: string | null
          id?: string
          is_active?: boolean
          name: string
          tenant_id: string
          unit_price?: number
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          category?: string | null
          code?: string
          created_at?: string
          created_by?: string | null
          currency_code?: string
          deleted_at?: string | null
          id?: string
          is_active?: boolean
          name?: string
          tenant_id?: string
          unit_price?: number
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_service_item_created_by"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_account"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_service_item_tenant"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_service_item_updated_by"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "user_account"
            referencedColumns: ["id"]
          },
        ]
      }
      staff_member: {
        Row: {
          created_at: string
          created_by: string | null
          deleted_at: string | null
          email: string | null
          facility_id: string | null
          first_name: string
          id: string
          is_active: boolean
          last_name: string
          license_no: string | null
          phone: string | null
          profession: string
          specialty: string | null
          tenant_id: string
          title: string | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          email?: string | null
          facility_id?: string | null
          first_name: string
          id?: string
          is_active?: boolean
          last_name: string
          license_no?: string | null
          phone?: string | null
          profession?: string
          specialty?: string | null
          tenant_id: string
          title?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          email?: string | null
          facility_id?: string | null
          first_name?: string
          id?: string
          is_active?: boolean
          last_name?: string
          license_no?: string | null
          phone?: string | null
          profession?: string
          specialty?: string | null
          tenant_id?: string
          title?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_staff_member_created_by"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_account"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_staff_member_facility"
            columns: ["facility_id"]
            isOneToOne: false
            referencedRelation: "facility"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_staff_member_tenant"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_staff_member_updated_by"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "user_account"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_plan: {
        Row: {
          code: string
          created_at: string
          created_by: string | null
          currency_code: string
          deleted_at: string | null
          id: string
          is_active: boolean
          max_facilities: number
          max_users: number
          monthly_price: number
          name: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          code: string
          created_at?: string
          created_by?: string | null
          currency_code?: string
          deleted_at?: string | null
          id?: string
          is_active?: boolean
          max_facilities?: number
          max_users?: number
          monthly_price?: number
          name: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          code?: string
          created_at?: string
          created_by?: string | null
          currency_code?: string
          deleted_at?: string | null
          id?: string
          is_active?: boolean
          max_facilities?: number
          max_users?: number
          monthly_price?: number
          name?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_subscription_plan_created_by"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_account"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_subscription_plan_updated_by"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "user_account"
            referencedColumns: ["id"]
          },
        ]
      }
      tenant: {
        Row: {
          code: string
          country_code: string
          created_at: string
          created_by: string | null
          deleted_at: string | null
          id: string
          is_active: boolean
          name: string
          time_zone: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          code: string
          country_code?: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          id?: string
          is_active?: boolean
          name: string
          time_zone?: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          code?: string
          country_code?: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          id?: string
          is_active?: boolean
          name?: string
          time_zone?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_tenant_created_by"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_account"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_tenant_updated_by"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "user_account"
            referencedColumns: ["id"]
          },
        ]
      }
      tenant_feature: {
        Row: {
          created_at: string
          created_by: string | null
          deleted_at: string | null
          feature_id: string
          id: string
          is_active: boolean
          is_enabled: boolean
          tenant_id: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          feature_id: string
          id?: string
          is_active?: boolean
          is_enabled?: boolean
          tenant_id: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          feature_id?: string
          id?: string
          is_active?: boolean
          is_enabled?: boolean
          tenant_id?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_tenant_feature_created_by"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_account"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_tenant_feature_feature"
            columns: ["feature_id"]
            isOneToOne: false
            referencedRelation: "feature"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_tenant_feature_tenant"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_tenant_feature_updated_by"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "user_account"
            referencedColumns: ["id"]
          },
        ]
      }
      tenant_subscription: {
        Row: {
          created_at: string
          created_by: string | null
          deleted_at: string | null
          ends_on: string | null
          id: string
          is_active: boolean
          starts_on: string
          status: string
          subscription_plan_id: string
          tenant_id: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          ends_on?: string | null
          id?: string
          is_active?: boolean
          starts_on: string
          status?: string
          subscription_plan_id: string
          tenant_id: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          ends_on?: string | null
          id?: string
          is_active?: boolean
          starts_on?: string
          status?: string
          subscription_plan_id?: string
          tenant_id?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_tenant_subscription_created_by"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_account"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_tenant_subscription_plan"
            columns: ["subscription_plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plan"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_tenant_subscription_tenant"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_tenant_subscription_updated_by"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "user_account"
            referencedColumns: ["id"]
          },
        ]
      }
      tooth_chart_audit: {
        Row: {
          action: string
          changed_at: string
          changed_by: string | null
          changed_by_name: string
          id: string
          new_value: string | null
          patient_id: string
          previous_value: string | null
          surface: string | null
          tooth: string
        }
        Insert: {
          action: string
          changed_at?: string
          changed_by?: string | null
          changed_by_name?: string
          id?: string
          new_value?: string | null
          patient_id: string
          previous_value?: string | null
          surface?: string | null
          tooth: string
        }
        Update: {
          action?: string
          changed_at?: string
          changed_by?: string | null
          changed_by_name?: string
          id?: string
          new_value?: string | null
          patient_id?: string
          previous_value?: string | null
          surface?: string | null
          tooth?: string
        }
        Relationships: []
      }
      tooth_chart_entries: {
        Row: {
          created_at: string
          id: string
          patient_id: string
          surfaces: Json
          tooth: string
          tooth_state: string
          updated_at: string
          updated_by: string | null
          updated_by_name: string
        }
        Insert: {
          created_at?: string
          id?: string
          patient_id: string
          surfaces?: Json
          tooth: string
          tooth_state?: string
          updated_at?: string
          updated_by?: string | null
          updated_by_name?: string
        }
        Update: {
          created_at?: string
          id?: string
          patient_id?: string
          surfaces?: Json
          tooth?: string
          tooth_state?: string
          updated_at?: string
          updated_by?: string | null
          updated_by_name?: string
        }
        Relationships: []
      }
      tooth_chart_summaries: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          approved_by_name: string
          finding_count: number
          generated_at: string
          generated_by: string | null
          generated_by_name: string
          headline: string
          id: string
          model: string
          patient_id: string
          summary: string
          version: number
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          approved_by_name?: string
          finding_count?: number
          generated_at?: string
          generated_by?: string | null
          generated_by_name?: string
          headline?: string
          id?: string
          model?: string
          patient_id: string
          summary: string
          version?: number
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          approved_by_name?: string
          finding_count?: number
          generated_at?: string
          generated_by?: string | null
          generated_by_name?: string
          headline?: string
          id?: string
          model?: string
          patient_id?: string
          summary?: string
          version?: number
        }
        Relationships: []
      }
      tooth_chart_summary_versions: {
        Row: {
          case_count: number
          case_source: string
          finding_count: number
          generated_at: string
          generated_by: string | null
          generated_by_name: string
          headline: string
          id: string
          model: string
          patient_id: string
          review_note: string
          reviewed_at: string | null
          reviewed_by: string | null
          reviewed_by_name: string
          status: string
          summary: string
          version: number
        }
        Insert: {
          case_count?: number
          case_source?: string
          finding_count?: number
          generated_at?: string
          generated_by?: string | null
          generated_by_name?: string
          headline?: string
          id?: string
          model?: string
          patient_id: string
          review_note?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          reviewed_by_name?: string
          status?: string
          summary: string
          version?: number
        }
        Update: {
          case_count?: number
          case_source?: string
          finding_count?: number
          generated_at?: string
          generated_by?: string | null
          generated_by_name?: string
          headline?: string
          id?: string
          model?: string
          patient_id?: string
          review_note?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          reviewed_by_name?: string
          status?: string
          summary?: string
          version?: number
        }
        Relationships: []
      }
      tooth_finding: {
        Row: {
          created_at: string
          created_by: string | null
          deleted_at: string | null
          dentition: string
          encounter_id: string | null
          id: string
          is_active: boolean
          patient_id: string
          recorded_by_staff_id: string | null
          tenant_id: string
          tooth_number: string
          tooth_state: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          dentition: string
          encounter_id?: string | null
          id?: string
          is_active?: boolean
          patient_id: string
          recorded_by_staff_id?: string | null
          tenant_id: string
          tooth_number: string
          tooth_state?: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          dentition?: string
          encounter_id?: string | null
          id?: string
          is_active?: boolean
          patient_id?: string
          recorded_by_staff_id?: string | null
          tenant_id?: string
          tooth_number?: string
          tooth_state?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_tooth_finding_created_by"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_account"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_tooth_finding_encounter"
            columns: ["encounter_id"]
            isOneToOne: false
            referencedRelation: "encounter"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_tooth_finding_patient"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patient"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_tooth_finding_recorded_by"
            columns: ["recorded_by_staff_id"]
            isOneToOne: false
            referencedRelation: "staff_member"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_tooth_finding_tenant"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_tooth_finding_updated_by"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "user_account"
            referencedColumns: ["id"]
          },
        ]
      }
      tooth_surface_finding: {
        Row: {
          created_at: string
          created_by: string | null
          deleted_at: string | null
          finding: string
          id: string
          is_active: boolean
          surface: string
          tenant_id: string
          tooth_finding_id: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          finding: string
          id?: string
          is_active?: boolean
          surface: string
          tenant_id: string
          tooth_finding_id: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          finding?: string
          id?: string
          is_active?: boolean
          surface?: string
          tenant_id?: string
          tooth_finding_id?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_tooth_surface_finding_created_by"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_account"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_tooth_surface_finding_tenant"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_tooth_surface_finding_tooth"
            columns: ["tooth_finding_id"]
            isOneToOne: false
            referencedRelation: "tooth_finding"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_tooth_surface_finding_updated_by"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "user_account"
            referencedColumns: ["id"]
          },
        ]
      }
      user_account: {
        Row: {
          auth_user_id: string
          created_at: string
          created_by: string | null
          deleted_at: string | null
          id: string
          is_active: boolean
          last_login_at: string | null
          staff_member_id: string | null
          tenant_id: string
          updated_at: string
          updated_by: string | null
          username: string
        }
        Insert: {
          auth_user_id: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          id?: string
          is_active?: boolean
          last_login_at?: string | null
          staff_member_id?: string | null
          tenant_id: string
          updated_at?: string
          updated_by?: string | null
          username: string
        }
        Update: {
          auth_user_id?: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          id?: string
          is_active?: boolean
          last_login_at?: string | null
          staff_member_id?: string | null
          tenant_id?: string
          updated_at?: string
          updated_by?: string | null
          username?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_user_account_created_by"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_account"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_user_account_staff_member"
            columns: ["staff_member_id"]
            isOneToOne: false
            referencedRelation: "staff_member"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_user_account_tenant"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_user_account_updated_by"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "user_account"
            referencedColumns: ["id"]
          },
        ]
      }
      user_account_role: {
        Row: {
          created_at: string
          created_by: string | null
          deleted_at: string | null
          facility_id: string | null
          id: string
          is_active: boolean
          role_id: string
          tenant_id: string
          updated_at: string
          updated_by: string | null
          user_account_id: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          facility_id?: string | null
          id?: string
          is_active?: boolean
          role_id: string
          tenant_id: string
          updated_at?: string
          updated_by?: string | null
          user_account_id: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          facility_id?: string | null
          id?: string
          is_active?: boolean
          role_id?: string
          tenant_id?: string
          updated_at?: string
          updated_by?: string | null
          user_account_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_user_account_role_created_by"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_account"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_user_account_role_facility"
            columns: ["facility_id"]
            isOneToOne: false
            referencedRelation: "facility"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_user_account_role_role"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "role"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_user_account_role_tenant"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_user_account_role_updated_by"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "user_account"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_user_account_role_user_account"
            columns: ["user_account_id"]
            isOneToOne: false
            referencedRelation: "user_account"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      vital_sign_set: {
        Row: {
          created_at: string
          created_by: string | null
          deleted_at: string | null
          diastolic_mmhg: number | null
          encounter_id: string | null
          height_cm: number | null
          id: string
          is_active: boolean
          pain_score: number | null
          patient_id: string
          pulse_bpm: number | null
          recorded_at: string
          recorded_by_staff_id: string | null
          respiratory_rate: number | null
          spo2_percent: number | null
          systolic_mmhg: number | null
          temperature_c: number | null
          tenant_id: string
          updated_at: string
          updated_by: string | null
          weight_kg: number | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          diastolic_mmhg?: number | null
          encounter_id?: string | null
          height_cm?: number | null
          id?: string
          is_active?: boolean
          pain_score?: number | null
          patient_id: string
          pulse_bpm?: number | null
          recorded_at: string
          recorded_by_staff_id?: string | null
          respiratory_rate?: number | null
          spo2_percent?: number | null
          systolic_mmhg?: number | null
          temperature_c?: number | null
          tenant_id: string
          updated_at?: string
          updated_by?: string | null
          weight_kg?: number | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          diastolic_mmhg?: number | null
          encounter_id?: string | null
          height_cm?: number | null
          id?: string
          is_active?: boolean
          pain_score?: number | null
          patient_id?: string
          pulse_bpm?: number | null
          recorded_at?: string
          recorded_by_staff_id?: string | null
          respiratory_rate?: number | null
          spo2_percent?: number | null
          systolic_mmhg?: number | null
          temperature_c?: number | null
          tenant_id?: string
          updated_at?: string
          updated_by?: string | null
          weight_kg?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_vital_sign_set_created_by"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_account"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_vital_sign_set_encounter"
            columns: ["encounter_id"]
            isOneToOne: false
            referencedRelation: "encounter"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_vital_sign_set_patient"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patient"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_vital_sign_set_recorded_by"
            columns: ["recorded_by_staff_id"]
            isOneToOne: false
            referencedRelation: "staff_member"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_vital_sign_set_tenant"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_vital_sign_set_updated_by"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "user_account"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      app_can_write_clinical: { Args: { _tenant_id: string }; Returns: boolean }
      app_can_write_front_desk: {
        Args: { _tenant_id: string }
        Returns: boolean
      }
      app_has_tenant_role: {
        Args: { _role_code: string; _tenant_id: string }
        Returns: boolean
      }
      app_is_tenant_admin: { Args: { _tenant_id: string }; Returns: boolean }
      app_is_tenant_member: { Args: { _tenant_id: string }; Returns: boolean }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "doctor" | "nurse" | "admin" | "receptionist" | "clinician"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["doctor", "nurse", "admin", "receptionist", "clinician"],
    },
  },
} as const
