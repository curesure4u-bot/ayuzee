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
      abha_health_records: {
        Row: {
          abha_id: string
          consultation_id: string | null
          created_at: string
          doctor_user_id: string
          fhir_payload: Json
          id: string
          patient_name: string | null
          push_response: Json | null
          push_status: string
          pushed_at: string | null
          updated_at: string
        }
        Insert: {
          abha_id: string
          consultation_id?: string | null
          created_at?: string
          doctor_user_id: string
          fhir_payload?: Json
          id?: string
          patient_name?: string | null
          push_response?: Json | null
          push_status?: string
          pushed_at?: string | null
          updated_at?: string
        }
        Update: {
          abha_id?: string
          consultation_id?: string | null
          created_at?: string
          doctor_user_id?: string
          fhir_payload?: Json
          id?: string
          patient_name?: string | null
          push_response?: Json | null
          push_status?: string
          pushed_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "abha_health_records_consultation_id_fkey"
            columns: ["consultation_id"]
            isOneToOne: false
            referencedRelation: "vaidya_consultations"
            referencedColumns: ["id"]
          },
        ]
      }
      appointments: {
        Row: {
          appointment_date: string
          created_at: string
          doctor_id: string
          fee: number
          id: string
          mode: string
          notes: string | null
          payment_status: string
          razorpay_order_id: string | null
          razorpay_payment_id: string | null
          status: string
          time_slot: string
          updated_at: string
          user_id: string
        }
        Insert: {
          appointment_date: string
          created_at?: string
          doctor_id: string
          fee?: number
          id?: string
          mode: string
          notes?: string | null
          payment_status?: string
          razorpay_order_id?: string | null
          razorpay_payment_id?: string | null
          status?: string
          time_slot: string
          updated_at?: string
          user_id: string
        }
        Update: {
          appointment_date?: string
          created_at?: string
          doctor_id?: string
          fee?: number
          id?: string
          mode?: string
          notes?: string | null
          payment_status?: string
          razorpay_order_id?: string | null
          razorpay_payment_id?: string | null
          status?: string
          time_slot?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointments_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
        ]
      }
      atmri_case_updates: {
        Row: {
          case_id: string | null
          created_at: string | null
          id: string
          is_public: boolean | null
          photo_urls: string[] | null
          posted_by: string | null
          update_text: string
          update_type: string | null
        }
        Insert: {
          case_id?: string | null
          created_at?: string | null
          id?: string
          is_public?: boolean | null
          photo_urls?: string[] | null
          posted_by?: string | null
          update_text: string
          update_type?: string | null
        }
        Update: {
          case_id?: string | null
          created_at?: string | null
          id?: string
          is_public?: boolean | null
          photo_urls?: string[] | null
          posted_by?: string | null
          update_text?: string
          update_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "atmri_case_updates_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "atmri_sponsored_cases"
            referencedColumns: ["id"]
          },
        ]
      }
      atmri_doctor_signatures: {
        Row: {
          case_id: string | null
          doctor_id: string | null
          doctor_registration_number: string | null
          doctor_user_id: string | null
          id: string
          legal_declaration: string
          signed_at: string | null
        }
        Insert: {
          case_id?: string | null
          doctor_id?: string | null
          doctor_registration_number?: string | null
          doctor_user_id?: string | null
          id?: string
          legal_declaration: string
          signed_at?: string | null
        }
        Update: {
          case_id?: string | null
          doctor_id?: string | null
          doctor_registration_number?: string | null
          doctor_user_id?: string | null
          id?: string
          legal_declaration?: string
          signed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "atmri_doctor_signatures_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "atmri_sponsored_cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "atmri_doctor_signatures_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
        ]
      }
      atmri_partner_hospitals: {
        Row: {
          address: string
          beds_reserved_for_atmri: number | null
          city: string
          contact_email: string | null
          contact_name: string | null
          contact_phone: string | null
          created_at: string | null
          discount_percent: number | null
          hospital_name: string
          hospital_type: string | null
          id: string
          is_active: boolean | null
          mou_document_url: string | null
          mou_expiry_date: string | null
          mou_signed_date: string | null
          notes: string | null
          state: string
          venue_id: string | null
        }
        Insert: {
          address: string
          beds_reserved_for_atmri?: number | null
          city: string
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string | null
          discount_percent?: number | null
          hospital_name: string
          hospital_type?: string | null
          id?: string
          is_active?: boolean | null
          mou_document_url?: string | null
          mou_expiry_date?: string | null
          mou_signed_date?: string | null
          notes?: string | null
          state: string
          venue_id?: string | null
        }
        Update: {
          address?: string
          beds_reserved_for_atmri?: number | null
          city?: string
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string | null
          discount_percent?: number | null
          hospital_name?: string
          hospital_type?: string | null
          id?: string
          is_active?: boolean | null
          mou_document_url?: string | null
          mou_expiry_date?: string | null
          mou_signed_date?: string | null
          notes?: string | null
          state?: string
          venue_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "atmri_partner_hospitals_venue_id_fkey"
            columns: ["venue_id"]
            isOneToOne: false
            referencedRelation: "therapy_venues"
            referencedColumns: ["id"]
          },
        ]
      }
      atmri_sponsored_cases: {
        Row: {
          approved_at_1: string | null
          approved_at_2: string | null
          approved_by_1: string | null
          approved_by_2: string | null
          assigned_doctor_id: string | null
          assigned_doctor_user_id: string | null
          checkpoint_corpus_allocated: boolean | null
          checkpoint_doctor_signed: boolean | null
          checkpoint_documents_verified: boolean | null
          checkpoint_hospital_confirmed: boolean | null
          checkpoint_video_verified: boolean | null
          completion_notes: string | null
          condition_category: string | null
          condition_name: string
          corpus_amount_allocated: number | null
          corpus_amount_spent: number | null
          created_at: string | null
          doctor_completion_note: string | null
          doctor_countersigned: boolean | null
          doctor_fee_waived: number | null
          doctor_legal_declaration_accepted: boolean | null
          doctor_signed_at: string | null
          estimated_cost: number
          id: string
          is_urgent: boolean | null
          medical_report_urls: string[] | null
          medicine_order_id: string | null
          medicines_cost: number | null
          medicines_dispatched: boolean | null
          medicines_dispatched_at: string | null
          partner_hospital_id: string | null
          partner_venue_id: string | null
          patient_age: number | null
          patient_city: string
          patient_gender: string | null
          patient_name: string
          patient_outcome_photo_url: string | null
          patient_phone: string | null
          patient_photo_url: string | null
          patient_state: string
          patient_story: string
          rejection_reason: string | null
          sessions_completed: number | null
          status: string | null
          submitted_by: string | null
          submitted_by_relation: string | null
          therapy_sessions_cost: number | null
          total_sessions_planned: number | null
          transport_allowance: number | null
          treatment_duration_days: number | null
          treatment_location: string | null
          treatment_plan: string
          updated_at: string | null
          venue_fee_waived: number | null
          video_call_recording_url: string | null
        }
        Insert: {
          approved_at_1?: string | null
          approved_at_2?: string | null
          approved_by_1?: string | null
          approved_by_2?: string | null
          assigned_doctor_id?: string | null
          assigned_doctor_user_id?: string | null
          checkpoint_corpus_allocated?: boolean | null
          checkpoint_doctor_signed?: boolean | null
          checkpoint_documents_verified?: boolean | null
          checkpoint_hospital_confirmed?: boolean | null
          checkpoint_video_verified?: boolean | null
          completion_notes?: string | null
          condition_category?: string | null
          condition_name: string
          corpus_amount_allocated?: number | null
          corpus_amount_spent?: number | null
          created_at?: string | null
          doctor_completion_note?: string | null
          doctor_countersigned?: boolean | null
          doctor_fee_waived?: number | null
          doctor_legal_declaration_accepted?: boolean | null
          doctor_signed_at?: string | null
          estimated_cost: number
          id?: string
          is_urgent?: boolean | null
          medical_report_urls?: string[] | null
          medicine_order_id?: string | null
          medicines_cost?: number | null
          medicines_dispatched?: boolean | null
          medicines_dispatched_at?: string | null
          partner_hospital_id?: string | null
          partner_venue_id?: string | null
          patient_age?: number | null
          patient_city: string
          patient_gender?: string | null
          patient_name: string
          patient_outcome_photo_url?: string | null
          patient_phone?: string | null
          patient_photo_url?: string | null
          patient_state: string
          patient_story: string
          rejection_reason?: string | null
          sessions_completed?: number | null
          status?: string | null
          submitted_by?: string | null
          submitted_by_relation?: string | null
          therapy_sessions_cost?: number | null
          total_sessions_planned?: number | null
          transport_allowance?: number | null
          treatment_duration_days?: number | null
          treatment_location?: string | null
          treatment_plan: string
          updated_at?: string | null
          venue_fee_waived?: number | null
          video_call_recording_url?: string | null
        }
        Update: {
          approved_at_1?: string | null
          approved_at_2?: string | null
          approved_by_1?: string | null
          approved_by_2?: string | null
          assigned_doctor_id?: string | null
          assigned_doctor_user_id?: string | null
          checkpoint_corpus_allocated?: boolean | null
          checkpoint_doctor_signed?: boolean | null
          checkpoint_documents_verified?: boolean | null
          checkpoint_hospital_confirmed?: boolean | null
          checkpoint_video_verified?: boolean | null
          completion_notes?: string | null
          condition_category?: string | null
          condition_name?: string
          corpus_amount_allocated?: number | null
          corpus_amount_spent?: number | null
          created_at?: string | null
          doctor_completion_note?: string | null
          doctor_countersigned?: boolean | null
          doctor_fee_waived?: number | null
          doctor_legal_declaration_accepted?: boolean | null
          doctor_signed_at?: string | null
          estimated_cost?: number
          id?: string
          is_urgent?: boolean | null
          medical_report_urls?: string[] | null
          medicine_order_id?: string | null
          medicines_cost?: number | null
          medicines_dispatched?: boolean | null
          medicines_dispatched_at?: string | null
          partner_hospital_id?: string | null
          partner_venue_id?: string | null
          patient_age?: number | null
          patient_city?: string
          patient_gender?: string | null
          patient_name?: string
          patient_outcome_photo_url?: string | null
          patient_phone?: string | null
          patient_photo_url?: string | null
          patient_state?: string
          patient_story?: string
          rejection_reason?: string | null
          sessions_completed?: number | null
          status?: string | null
          submitted_by?: string | null
          submitted_by_relation?: string | null
          therapy_sessions_cost?: number | null
          total_sessions_planned?: number | null
          transport_allowance?: number | null
          treatment_duration_days?: number | null
          treatment_location?: string | null
          treatment_plan?: string
          updated_at?: string | null
          venue_fee_waived?: number | null
          video_call_recording_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "atmri_sponsored_cases_assigned_doctor_id_fkey"
            columns: ["assigned_doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "atmri_sponsored_cases_medicine_order_id_fkey"
            columns: ["medicine_order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "atmri_sponsored_cases_partner_venue_id_fkey"
            columns: ["partner_venue_id"]
            isOneToOne: false
            referencedRelation: "therapy_venues"
            referencedColumns: ["id"]
          },
        ]
      }
      atmri_trust_corpus: {
        Row: {
          balance: number
          cases_this_month: number | null
          corpus_amount_allocated: number | null
          id: string
          last_updated_at: string | null
          last_updated_by: string | null
          minimum_balance_alert: number | null
          monthly_case_limit: number | null
          notes: string | null
          total_received: number | null
          total_spent: number | null
        }
        Insert: {
          balance?: number
          cases_this_month?: number | null
          corpus_amount_allocated?: number | null
          id?: string
          last_updated_at?: string | null
          last_updated_by?: string | null
          minimum_balance_alert?: number | null
          monthly_case_limit?: number | null
          notes?: string | null
          total_received?: number | null
          total_spent?: number | null
        }
        Update: {
          balance?: number
          cases_this_month?: number | null
          corpus_amount_allocated?: number | null
          id?: string
          last_updated_at?: string | null
          last_updated_by?: string | null
          minimum_balance_alert?: number | null
          monthly_case_limit?: number | null
          notes?: string | null
          total_received?: number | null
          total_spent?: number | null
        }
        Relationships: []
      }
      ayuzee_transactions: {
        Row: {
          amount: number
          created_at: string
          expires_at: string | null
          id: string
          order_id: string | null
          reason: string | null
          type: Database["public"]["Enums"]["ayuzee_txn_type"]
          user_id: string
          wallet_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          expires_at?: string | null
          id?: string
          order_id?: string | null
          reason?: string | null
          type: Database["public"]["Enums"]["ayuzee_txn_type"]
          user_id: string
          wallet_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          expires_at?: string | null
          id?: string
          order_id?: string | null
          reason?: string | null
          type?: Database["public"]["Enums"]["ayuzee_txn_type"]
          user_id?: string
          wallet_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ayuzee_transactions_wallet_id_fkey"
            columns: ["wallet_id"]
            isOneToOne: false
            referencedRelation: "ayuzee_wallets"
            referencedColumns: ["id"]
          },
        ]
      }
      ayuzee_wallets: {
        Row: {
          balance: number
          created_at: string
          id: string
          lifetime_earned: number
          lifetime_spent: number
          updated_at: string
          user_id: string
        }
        Insert: {
          balance?: number
          created_at?: string
          id?: string
          lifetime_earned?: number
          lifetime_spent?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          balance?: number
          created_at?: string
          id?: string
          lifetime_earned?: number
          lifetime_spent?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      case_rubric_selections: {
        Row: {
          case_id: string
          created_at: string
          doctor_grade: number
          doctor_note: string | null
          doctor_user_id: string
          id: string
          intensity: number
          is_keynote: boolean
          is_srp: boolean
          rubric_id: string
        }
        Insert: {
          case_id: string
          created_at?: string
          doctor_grade?: number
          doctor_note?: string | null
          doctor_user_id: string
          id?: string
          intensity?: number
          is_keynote?: boolean
          is_srp?: boolean
          rubric_id: string
        }
        Update: {
          case_id?: string
          created_at?: string
          doctor_grade?: number
          doctor_note?: string | null
          doctor_user_id?: string
          id?: string
          intensity?: number
          is_keynote?: boolean
          is_srp?: boolean
          rubric_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "case_rubric_selections_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "homeopathy_cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "case_rubric_selections_rubric_id_fkey"
            columns: ["rubric_id"]
            isOneToOne: false
            referencedRelation: "homeopathy_rubrics"
            referencedColumns: ["id"]
          },
        ]
      }
      clinic_media: {
        Row: {
          clinic_id: string
          created_at: string
          doctor_user_id: string
          id: string
          media_type: string
          sort_order: number
          url: string
        }
        Insert: {
          clinic_id: string
          created_at?: string
          doctor_user_id: string
          id?: string
          media_type?: string
          sort_order?: number
          url: string
        }
        Update: {
          clinic_id?: string
          created_at?: string
          doctor_user_id?: string
          id?: string
          media_type?: string
          sort_order?: number
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "clinic_media_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "doctor_clinics"
            referencedColumns: ["id"]
          },
        ]
      }
      clinic_services: {
        Row: {
          clinic_id: string
          created_at: string
          doctor_user_id: string
          id: string
          service_name: string
        }
        Insert: {
          clinic_id: string
          created_at?: string
          doctor_user_id: string
          id?: string
          service_name: string
        }
        Update: {
          clinic_id?: string
          created_at?: string
          doctor_user_id?: string
          id?: string
          service_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "clinic_services_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "doctor_clinics"
            referencedColumns: ["id"]
          },
        ]
      }
      company_content: {
        Row: {
          body: string
          created_at: string
          id: string
          slug: string
          title: string
          updated_at: string
        }
        Insert: {
          body?: string
          created_at?: string
          id?: string
          slug: string
          title: string
          updated_at?: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          slug?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      company_info: {
        Row: {
          address: string
          brand_name: string
          email: string
          grievance_email: string
          hours: string
          id: string
          legal_name: string
          phone: string
          support_email: string
          updated_at: string
          website: string
        }
        Insert: {
          address?: string
          brand_name?: string
          email?: string
          grievance_email?: string
          hours?: string
          id?: string
          legal_name?: string
          phone?: string
          support_email?: string
          updated_at?: string
          website?: string
        }
        Update: {
          address?: string
          brand_name?: string
          email?: string
          grievance_email?: string
          hours?: string
          id?: string
          legal_name?: string
          phone?: string
          support_email?: string
          updated_at?: string
          website?: string
        }
        Relationships: []
      }
      condition_leads: {
        Row: {
          condition_id: string | null
          condition_slug: string | null
          created_at: string
          email: string | null
          full_name: string
          id: string
          notes: string | null
          package_label: string | null
          phone: string
          status: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          condition_id?: string | null
          condition_slug?: string | null
          created_at?: string
          email?: string | null
          full_name: string
          id?: string
          notes?: string | null
          package_label?: string | null
          phone: string
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          condition_id?: string | null
          condition_slug?: string | null
          created_at?: string
          email?: string | null
          full_name?: string
          id?: string
          notes?: string | null
          package_label?: string | null
          phone?: string
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "condition_leads_condition_id_fkey"
            columns: ["condition_id"]
            isOneToOne: false
            referencedRelation: "health_conditions"
            referencedColumns: ["id"]
          },
        ]
      }
      developer_api_keys: {
        Row: {
          created_at: string
          doctor_user_id: string
          id: string
          key_hash: string
          key_prefix: string
          label: string
          last_used_at: string | null
          revoked: boolean
          scopes: string[]
        }
        Insert: {
          created_at?: string
          doctor_user_id: string
          id?: string
          key_hash: string
          key_prefix: string
          label: string
          last_used_at?: string | null
          revoked?: boolean
          scopes?: string[]
        }
        Update: {
          created_at?: string
          doctor_user_id?: string
          id?: string
          key_hash?: string
          key_prefix?: string
          label?: string
          last_used_at?: string | null
          revoked?: boolean
          scopes?: string[]
        }
        Relationships: []
      }
      doctor_addresses: {
        Row: {
          address_line1: string
          alternate_phone: string | null
          city: string
          created_at: string
          doctor_user_id: string
          full_name: string
          gstin: string | null
          id: string
          is_default_billing: boolean
          is_default_shipping: boolean
          landmark: string | null
          legal_entity_name: string | null
          phone: string
          pincode: string
          state: string
          trade_name: string | null
          updated_at: string
        }
        Insert: {
          address_line1: string
          alternate_phone?: string | null
          city: string
          created_at?: string
          doctor_user_id: string
          full_name: string
          gstin?: string | null
          id?: string
          is_default_billing?: boolean
          is_default_shipping?: boolean
          landmark?: string | null
          legal_entity_name?: string | null
          phone: string
          pincode: string
          state: string
          trade_name?: string | null
          updated_at?: string
        }
        Update: {
          address_line1?: string
          alternate_phone?: string | null
          city?: string
          created_at?: string
          doctor_user_id?: string
          full_name?: string
          gstin?: string | null
          id?: string
          is_default_billing?: boolean
          is_default_shipping?: boolean
          landmark?: string | null
          legal_entity_name?: string | null
          phone?: string
          pincode?: string
          state?: string
          trade_name?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      doctor_awards: {
        Row: {
          awarded_by: string | null
          created_at: string
          doctor_user_id: string
          id: string
          title: string
          year: number | null
        }
        Insert: {
          awarded_by?: string | null
          created_at?: string
          doctor_user_id: string
          id?: string
          title: string
          year?: number | null
        }
        Update: {
          awarded_by?: string | null
          created_at?: string
          doctor_user_id?: string
          id?: string
          title?: string
          year?: number | null
        }
        Relationships: []
      }
      doctor_bank_details: {
        Row: {
          account_holder_name: string | null
          account_number: string | null
          bank_name: string | null
          created_at: string
          doctor_user_id: string
          id: string
          ifsc_code: string | null
          is_default: boolean
          is_verified: boolean
          type: string
          updated_at: string
          upi_id: string | null
          upi_name: string | null
        }
        Insert: {
          account_holder_name?: string | null
          account_number?: string | null
          bank_name?: string | null
          created_at?: string
          doctor_user_id: string
          id?: string
          ifsc_code?: string | null
          is_default?: boolean
          is_verified?: boolean
          type: string
          updated_at?: string
          upi_id?: string | null
          upi_name?: string | null
        }
        Update: {
          account_holder_name?: string | null
          account_number?: string | null
          bank_name?: string | null
          created_at?: string
          doctor_user_id?: string
          id?: string
          ifsc_code?: string | null
          is_default?: boolean
          is_verified?: boolean
          type?: string
          updated_at?: string
          upi_id?: string | null
          upi_name?: string | null
        }
        Relationships: []
      }
      doctor_categories: {
        Row: {
          created_at: string
          current_tier: string
          diamond_progress: number
          doctor_user_id: string
          id: string
          monthly_spend: number
          platinum_plus_progress: number
          platinum_progress: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          current_tier?: string
          diamond_progress?: number
          doctor_user_id: string
          id?: string
          monthly_spend?: number
          platinum_plus_progress?: number
          platinum_progress?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          current_tier?: string
          diamond_progress?: number
          doctor_user_id?: string
          id?: string
          monthly_spend?: number
          platinum_plus_progress?: number
          platinum_progress?: number
          updated_at?: string
        }
        Relationships: []
      }
      doctor_charity_pledges: {
        Row: {
          created_at: string | null
          doctor_id: string
          doctor_user_id: string | null
          id: string
          is_active: boolean | null
          pledge_motivation: string | null
          pledge_since: string | null
          pledged_consultations_per_month: number | null
          total_consultations_donated: number | null
          total_fee_value_donated: number | null
          updated_at: string | null
          used_this_month: number | null
        }
        Insert: {
          created_at?: string | null
          doctor_id: string
          doctor_user_id?: string | null
          id?: string
          is_active?: boolean | null
          pledge_motivation?: string | null
          pledge_since?: string | null
          pledged_consultations_per_month?: number | null
          total_consultations_donated?: number | null
          total_fee_value_donated?: number | null
          updated_at?: string | null
          used_this_month?: number | null
        }
        Update: {
          created_at?: string | null
          doctor_id?: string
          doctor_user_id?: string | null
          id?: string
          is_active?: boolean | null
          pledge_motivation?: string | null
          pledge_since?: string | null
          pledged_consultations_per_month?: number | null
          total_consultations_donated?: number | null
          total_fee_value_donated?: number | null
          updated_at?: string | null
          used_this_month?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "doctor_charity_pledges_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: true
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
        ]
      }
      doctor_clinics: {
        Row: {
          about: string | null
          address_line1: string
          city: string
          clinic_name: string
          consultation_fee: number
          consultation_settings: Json | null
          country: string | null
          cover_image_url: string | null
          created_at: string
          doctor_user_id: string
          gst_address: string | null
          gst_number: string | null
          id: string
          intro_video_url: string | null
          is_active: boolean
          legal_entity_name: string | null
          locality: string | null
          logo_url: string | null
          phone: string | null
          pincode: string
          services: string[]
          show_legal_entity: boolean
          state: string
          timings: string | null
          updated_at: string
        }
        Insert: {
          about?: string | null
          address_line1: string
          city: string
          clinic_name: string
          consultation_fee?: number
          consultation_settings?: Json | null
          country?: string | null
          cover_image_url?: string | null
          created_at?: string
          doctor_user_id: string
          gst_address?: string | null
          gst_number?: string | null
          id?: string
          intro_video_url?: string | null
          is_active?: boolean
          legal_entity_name?: string | null
          locality?: string | null
          logo_url?: string | null
          phone?: string | null
          pincode: string
          services?: string[]
          show_legal_entity?: boolean
          state: string
          timings?: string | null
          updated_at?: string
        }
        Update: {
          about?: string | null
          address_line1?: string
          city?: string
          clinic_name?: string
          consultation_fee?: number
          consultation_settings?: Json | null
          country?: string | null
          cover_image_url?: string | null
          created_at?: string
          doctor_user_id?: string
          gst_address?: string | null
          gst_number?: string | null
          id?: string
          intro_video_url?: string | null
          is_active?: boolean
          legal_entity_name?: string | null
          locality?: string | null
          logo_url?: string | null
          phone?: string | null
          pincode?: string
          services?: string[]
          show_legal_entity?: boolean
          state?: string
          timings?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      doctor_education: {
        Row: {
          college: string
          created_at: string
          degree: string
          doctor_user_id: string
          id: string
          year_completed: number | null
        }
        Insert: {
          college: string
          created_at?: string
          degree: string
          doctor_user_id: string
          id?: string
          year_completed?: number | null
        }
        Update: {
          college?: string
          created_at?: string
          degree?: string
          doctor_user_id?: string
          id?: string
          year_completed?: number | null
        }
        Relationships: []
      }
      doctor_memberships: {
        Row: {
          created_at: string
          doctor_user_id: string
          id: string
          membership_id: string | null
          organization: string
          year: number | null
        }
        Insert: {
          created_at?: string
          doctor_user_id: string
          id?: string
          membership_id?: string | null
          organization: string
          year?: number | null
        }
        Update: {
          created_at?: string
          doctor_user_id?: string
          id?: string
          membership_id?: string | null
          organization?: string
          year?: number | null
        }
        Relationships: []
      }
      doctor_reward_history: {
        Row: {
          action: string
          amount_value: number | null
          created_at: string
          doctor_user_id: string
          earned_id: string | null
          id: string
          notes: string | null
          reward_name: string
        }
        Insert: {
          action?: string
          amount_value?: number | null
          created_at?: string
          doctor_user_id: string
          earned_id?: string | null
          id?: string
          notes?: string | null
          reward_name: string
        }
        Update: {
          action?: string
          amount_value?: number | null
          created_at?: string
          doctor_user_id?: string
          earned_id?: string | null
          id?: string
          notes?: string | null
          reward_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "doctor_reward_history_earned_id_fkey"
            columns: ["earned_id"]
            isOneToOne: false
            referencedRelation: "doctor_rewards_earned"
            referencedColumns: ["id"]
          },
        ]
      }
      doctor_rewards_earned: {
        Row: {
          doctor_user_id: string
          id: string
          notes: string | null
          reward_image_url: string | null
          reward_name: string
          scheme_id: string | null
          status: string
          unlocked_at: string
        }
        Insert: {
          doctor_user_id: string
          id?: string
          notes?: string | null
          reward_image_url?: string | null
          reward_name: string
          scheme_id?: string | null
          status?: string
          unlocked_at?: string
        }
        Update: {
          doctor_user_id?: string
          id?: string
          notes?: string | null
          reward_image_url?: string | null
          reward_name?: string
          scheme_id?: string | null
          status?: string
          unlocked_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "doctor_rewards_earned_scheme_id_fkey"
            columns: ["scheme_id"]
            isOneToOne: false
            referencedRelation: "reward_schemes"
            referencedColumns: ["id"]
          },
        ]
      }
      doctor_saved_medicines: {
        Row: {
          created_at: string
          id: string
          product_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          product_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          product_id?: string
          user_id?: string
        }
        Relationships: []
      }
      doctor_saved_posts: {
        Row: {
          created_at: string
          excerpt: string | null
          id: string
          post_title: string
          post_url: string | null
          thumbnail_url: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          excerpt?: string | null
          id?: string
          post_title: string
          post_url?: string | null
          thumbnail_url?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          excerpt?: string | null
          id?: string
          post_title?: string
          post_url?: string | null
          thumbnail_url?: string | null
          user_id?: string
        }
        Relationships: []
      }
      doctor_specializations: {
        Row: {
          created_at: string
          doctor_user_id: string
          id: string
          specialization: string
        }
        Insert: {
          created_at?: string
          doctor_user_id: string
          id?: string
          specialization: string
        }
        Update: {
          created_at?: string
          doctor_user_id?: string
          id?: string
          specialization?: string
        }
        Relationships: []
      }
      doctor_work_history: {
        Row: {
          created_at: string
          description: string | null
          doctor_user_id: string
          end_year: number | null
          id: string
          organization: string
          position: string
          start_year: number | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          doctor_user_id: string
          end_year?: number | null
          id?: string
          organization: string
          position: string
          start_year?: number | null
        }
        Update: {
          created_at?: string
          description?: string | null
          doctor_user_id?: string
          end_year?: number | null
          id?: string
          organization?: string
          position?: string
          start_year?: number | null
        }
        Relationships: []
      }
      doctors: {
        Row: {
          alternate_phone: string | null
          avatar_url: string | null
          bio: string | null
          category: string
          city: string
          clinic_name: string | null
          commission_rate: number
          consultation_fee: number
          created_at: string
          date_of_birth: string | null
          email: string | null
          escalation_name: string | null
          escalation_phone: string | null
          experience_years: number
          full_name: string
          gender: string | null
          id: string
          in_clinic_available: boolean
          is_approved: boolean
          is_suspended: boolean
          is_verified: boolean
          languages: string[]
          phone: string | null
          profile_completion: number
          public_profile: boolean
          rating: number
          registration_number: string | null
          rejection_reason: string | null
          specialization: string
          total_reviews: number
          updated_at: string
          user_id: string | null
          verification_status: string
          video_available: boolean
        }
        Insert: {
          alternate_phone?: string | null
          avatar_url?: string | null
          bio?: string | null
          category: string
          city: string
          clinic_name?: string | null
          commission_rate?: number
          consultation_fee?: number
          created_at?: string
          date_of_birth?: string | null
          email?: string | null
          escalation_name?: string | null
          escalation_phone?: string | null
          experience_years?: number
          full_name: string
          gender?: string | null
          id?: string
          in_clinic_available?: boolean
          is_approved?: boolean
          is_suspended?: boolean
          is_verified?: boolean
          languages?: string[]
          phone?: string | null
          profile_completion?: number
          public_profile?: boolean
          rating?: number
          registration_number?: string | null
          rejection_reason?: string | null
          specialization: string
          total_reviews?: number
          updated_at?: string
          user_id?: string | null
          verification_status?: string
          video_available?: boolean
        }
        Update: {
          alternate_phone?: string | null
          avatar_url?: string | null
          bio?: string | null
          category?: string
          city?: string
          clinic_name?: string | null
          commission_rate?: number
          consultation_fee?: number
          created_at?: string
          date_of_birth?: string | null
          email?: string | null
          escalation_name?: string | null
          escalation_phone?: string | null
          experience_years?: number
          full_name?: string
          gender?: string | null
          id?: string
          in_clinic_available?: boolean
          is_approved?: boolean
          is_suspended?: boolean
          is_verified?: boolean
          languages?: string[]
          phone?: string | null
          profile_completion?: number
          public_profile?: boolean
          rating?: number
          registration_number?: string | null
          rejection_reason?: string | null
          specialization?: string
          total_reviews?: number
          updated_at?: string
          user_id?: string | null
          verification_status?: string
          video_available?: boolean
        }
        Relationships: []
      }
      email_send_log: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          message_id: string | null
          metadata: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email?: string
          status?: string
          template_name?: string
        }
        Relationships: []
      }
      email_send_state: {
        Row: {
          auth_email_ttl_minutes: number
          batch_size: number
          id: number
          retry_after_until: string | null
          send_delay_ms: number
          transactional_email_ttl_minutes: number
          updated_at: string
        }
        Insert: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Update: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Relationships: []
      }
      email_unsubscribe_tokens: {
        Row: {
          created_at: string
          email: string
          id: string
          token: string
          used_at: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          token: string
          used_at?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          token?: string
          used_at?: string | null
        }
        Relationships: []
      }
      essential_drugs: {
        Row: {
          category: string
          category_code: string | null
          created_at: string
          description: string | null
          dose: string | null
          id: string
          indications: string[] | null
          mode_of_administration: string | null
          name: string
          pack_size: string | null
          precautions: string | null
          preferred_use: string | null
          reference_text: string | null
          search_text: string | null
          serial_no: number | null
          slug: string
          updated_at: string
        }
        Insert: {
          category: string
          category_code?: string | null
          created_at?: string
          description?: string | null
          dose?: string | null
          id?: string
          indications?: string[] | null
          mode_of_administration?: string | null
          name: string
          pack_size?: string | null
          precautions?: string | null
          preferred_use?: string | null
          reference_text?: string | null
          search_text?: string | null
          serial_no?: number | null
          slug: string
          updated_at?: string
        }
        Update: {
          category?: string
          category_code?: string | null
          created_at?: string
          description?: string | null
          dose?: string | null
          id?: string
          indications?: string[] | null
          mode_of_administration?: string | null
          name?: string
          pack_size?: string | null
          precautions?: string | null
          preferred_use?: string | null
          reference_text?: string | null
          search_text?: string | null
          serial_no?: number | null
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      essential_homeopathy_drugs: {
        Row: {
          available_forms: string[]
          available_potencies: string[]
          common_name: string | null
          created_at: string
          description: string | null
          dose: string | null
          id: string
          indications: string[] | null
          keynotes: string[] | null
          kingdom: string | null
          latin_name: string | null
          mode_of_administration: string | null
          name: string
          precautions: string | null
          reference_text: string | null
          search_text: string | null
          serial_no: number | null
          slug: string
          updated_at: string
        }
        Insert: {
          available_forms?: string[]
          available_potencies?: string[]
          common_name?: string | null
          created_at?: string
          description?: string | null
          dose?: string | null
          id?: string
          indications?: string[] | null
          keynotes?: string[] | null
          kingdom?: string | null
          latin_name?: string | null
          mode_of_administration?: string | null
          name: string
          precautions?: string | null
          reference_text?: string | null
          search_text?: string | null
          serial_no?: number | null
          slug: string
          updated_at?: string
        }
        Update: {
          available_forms?: string[]
          available_potencies?: string[]
          common_name?: string | null
          created_at?: string
          description?: string | null
          dose?: string | null
          id?: string
          indications?: string[] | null
          keynotes?: string[] | null
          kingdom?: string | null
          latin_name?: string | null
          mode_of_administration?: string | null
          name?: string
          precautions?: string | null
          reference_text?: string | null
          search_text?: string | null
          serial_no?: number | null
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      essential_siddha_drugs: {
        Row: {
          category: string
          category_code: string | null
          created_at: string
          description: string | null
          dose: string | null
          id: string
          indications: string[] | null
          mode_of_administration: string | null
          name: string
          pack_size: string | null
          precautions: string | null
          preferred_use: string | null
          reference_text: string | null
          search_text: string | null
          serial_no: number | null
          slug: string
          updated_at: string
        }
        Insert: {
          category: string
          category_code?: string | null
          created_at?: string
          description?: string | null
          dose?: string | null
          id?: string
          indications?: string[] | null
          mode_of_administration?: string | null
          name: string
          pack_size?: string | null
          precautions?: string | null
          preferred_use?: string | null
          reference_text?: string | null
          search_text?: string | null
          serial_no?: number | null
          slug: string
          updated_at?: string
        }
        Update: {
          category?: string
          category_code?: string | null
          created_at?: string
          description?: string | null
          dose?: string | null
          id?: string
          indications?: string[] | null
          mode_of_administration?: string | null
          name?: string
          pack_size?: string | null
          precautions?: string | null
          preferred_use?: string | null
          reference_text?: string | null
          search_text?: string | null
          serial_no?: number | null
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      essential_unani_drugs: {
        Row: {
          category: string
          category_code: string | null
          created_at: string
          description: string | null
          dose: string | null
          id: string
          indications: string[] | null
          mode_of_administration: string | null
          name: string
          pack_size: string | null
          precautions: string | null
          preferred_use: string | null
          reference_text: string | null
          search_text: string | null
          serial_no: number | null
          slug: string
          updated_at: string
        }
        Insert: {
          category: string
          category_code?: string | null
          created_at?: string
          description?: string | null
          dose?: string | null
          id?: string
          indications?: string[] | null
          mode_of_administration?: string | null
          name: string
          pack_size?: string | null
          precautions?: string | null
          preferred_use?: string | null
          reference_text?: string | null
          search_text?: string | null
          serial_no?: number | null
          slug: string
          updated_at?: string
        }
        Update: {
          category?: string
          category_code?: string | null
          created_at?: string
          description?: string | null
          dose?: string | null
          id?: string
          indications?: string[] | null
          mode_of_administration?: string | null
          name?: string
          pack_size?: string | null
          precautions?: string | null
          preferred_use?: string | null
          reference_text?: string | null
          search_text?: string | null
          serial_no?: number | null
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      feature_flags: {
        Row: {
          description: string | null
          enabled: boolean
          key: string
          updated_at: string
        }
        Insert: {
          description?: string | null
          enabled?: boolean
          key: string
          updated_at?: string
        }
        Update: {
          description?: string | null
          enabled?: boolean
          key?: string
          updated_at?: string
        }
        Relationships: []
      }
      feed_comments: {
        Row: {
          author_name: string
          body: string
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          author_name: string
          body: string
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          author_name?: string
          body?: string
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "feed_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "feed_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      feed_likes: {
        Row: {
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "feed_likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "feed_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      feed_posts: {
        Row: {
          author_avatar_url: string | null
          author_name: string
          author_user_id: string
          body: string
          comment_count: number
          created_at: string
          id: string
          image_url: string | null
          is_published: boolean
          like_count: number
          post_type: string
          tags: string[]
          title: string | null
          updated_at: string
          visibility: string
        }
        Insert: {
          author_avatar_url?: string | null
          author_name: string
          author_user_id: string
          body: string
          comment_count?: number
          created_at?: string
          id?: string
          image_url?: string | null
          is_published?: boolean
          like_count?: number
          post_type?: string
          tags?: string[]
          title?: string | null
          updated_at?: string
          visibility?: string
        }
        Update: {
          author_avatar_url?: string | null
          author_name?: string
          author_user_id?: string
          body?: string
          comment_count?: number
          created_at?: string
          id?: string
          image_url?: string | null
          is_published?: boolean
          like_count?: number
          post_type?: string
          tags?: string[]
          title?: string | null
          updated_at?: string
          visibility?: string
        }
        Relationships: []
      }
      food_recipes: {
        Row: {
          category: string
          children_friendly: boolean
          contraindications: string | null
          created_at: string
          description: string | null
          diabetic_friendly: boolean
          display_order: number
          health_benefits: string
          id: string
          image_url: string | null
          indications: string[]
          ingredients: Json
          is_published: boolean
          lactation_friendly: boolean
          method: string
          name: string
          precautions: string | null
          pregnancy_safe: boolean
          servings: string | null
          slug: string
          source: string
          subtitle: string | null
          suitable_doshas: string[]
          system: string
          updated_at: string
        }
        Insert: {
          category?: string
          children_friendly?: boolean
          contraindications?: string | null
          created_at?: string
          description?: string | null
          diabetic_friendly?: boolean
          display_order?: number
          health_benefits: string
          id?: string
          image_url?: string | null
          indications?: string[]
          ingredients?: Json
          is_published?: boolean
          lactation_friendly?: boolean
          method: string
          name: string
          precautions?: string | null
          pregnancy_safe?: boolean
          servings?: string | null
          slug: string
          source?: string
          subtitle?: string | null
          suitable_doshas?: string[]
          system?: string
          updated_at?: string
        }
        Update: {
          category?: string
          children_friendly?: boolean
          contraindications?: string | null
          created_at?: string
          description?: string | null
          diabetic_friendly?: boolean
          display_order?: number
          health_benefits?: string
          id?: string
          image_url?: string | null
          indications?: string[]
          ingredients?: Json
          is_published?: boolean
          lactation_friendly?: boolean
          method?: string
          name?: string
          precautions?: string | null
          pregnancy_safe?: boolean
          servings?: string | null
          slug?: string
          source?: string
          subtitle?: string | null
          suitable_doshas?: string[]
          system?: string
          updated_at?: string
        }
        Relationships: []
      }
      health_blogs: {
        Row: {
          author_avatar_url: string | null
          author_name: string
          author_user_id: string
          body: string
          category: string
          cover_image_url: string | null
          created_at: string
          excerpt: string | null
          id: string
          published_at: string | null
          read_minutes: number
          slug: string
          status: string
          tags: string[]
          title: string
          type: string
          updated_at: string
          view_count: number
        }
        Insert: {
          author_avatar_url?: string | null
          author_name: string
          author_user_id: string
          body: string
          category?: string
          cover_image_url?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          published_at?: string | null
          read_minutes?: number
          slug: string
          status?: string
          tags?: string[]
          title: string
          type?: string
          updated_at?: string
          view_count?: number
        }
        Update: {
          author_avatar_url?: string | null
          author_name?: string
          author_user_id?: string
          body?: string
          category?: string
          cover_image_url?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          published_at?: string | null
          read_minutes?: number
          slug?: string
          status?: string
          tags?: string[]
          title?: string
          type?: string
          updated_at?: string
          view_count?: number
        }
        Relationships: []
      }
      health_conditions: {
        Row: {
          approach_body: string | null
          approach_image_url: string | null
          approach_title: string | null
          ayurveda_qna: Json
          benefits: Json
          consult_banner_text: string | null
          content_sections: Json
          created_at: string
          discount_price: number | null
          doctor_feedback: Json
          estimated_delivery_days: number
          faqs: Json
          gallery_images: Json
          hero_image_url: string | null
          hero_subtitle: string | null
          hero_title: string | null
          highlights: Json
          how_it_works: Json
          how_to_use: Json
          icon: string | null
          id: string
          ingredients: Json
          is_active: boolean | null
          is_published: boolean
          name: string
          packages: Json
          patient_feedback: Json
          plan_steps: Json
          price: number
          product_image_url: string | null
          product_name: string | null
          related_medicines: Json
          slug: string
          sort_order: number
          system_category: string | null
          system_id: string | null
          tagline: string | null
          updated_at: string
          videos: Json
        }
        Insert: {
          approach_body?: string | null
          approach_image_url?: string | null
          approach_title?: string | null
          ayurveda_qna?: Json
          benefits?: Json
          consult_banner_text?: string | null
          content_sections?: Json
          created_at?: string
          discount_price?: number | null
          doctor_feedback?: Json
          estimated_delivery_days?: number
          faqs?: Json
          gallery_images?: Json
          hero_image_url?: string | null
          hero_subtitle?: string | null
          hero_title?: string | null
          highlights?: Json
          how_it_works?: Json
          how_to_use?: Json
          icon?: string | null
          id?: string
          ingredients?: Json
          is_active?: boolean | null
          is_published?: boolean
          name: string
          packages?: Json
          patient_feedback?: Json
          plan_steps?: Json
          price?: number
          product_image_url?: string | null
          product_name?: string | null
          related_medicines?: Json
          slug: string
          sort_order?: number
          system_category?: string | null
          system_id?: string | null
          tagline?: string | null
          updated_at?: string
          videos?: Json
        }
        Update: {
          approach_body?: string | null
          approach_image_url?: string | null
          approach_title?: string | null
          ayurveda_qna?: Json
          benefits?: Json
          consult_banner_text?: string | null
          content_sections?: Json
          created_at?: string
          discount_price?: number | null
          doctor_feedback?: Json
          estimated_delivery_days?: number
          faqs?: Json
          gallery_images?: Json
          hero_image_url?: string | null
          hero_subtitle?: string | null
          hero_title?: string | null
          highlights?: Json
          how_it_works?: Json
          how_to_use?: Json
          icon?: string | null
          id?: string
          ingredients?: Json
          is_active?: boolean | null
          is_published?: boolean
          name?: string
          packages?: Json
          patient_feedback?: Json
          plan_steps?: Json
          price?: number
          product_image_url?: string | null
          product_name?: string | null
          related_medicines?: Json
          slug?: string
          sort_order?: number
          system_category?: string | null
          system_id?: string | null
          tagline?: string | null
          updated_at?: string
          videos?: Json
        }
        Relationships: [
          {
            foreignKeyName: "health_conditions_system_id_fkey"
            columns: ["system_id"]
            isOneToOne: false
            referencedRelation: "treatment_systems"
            referencedColumns: ["id"]
          },
        ]
      }
      homeo_cases: {
        Row: {
          aversions: string | null
          case_date: string
          cravings: string | null
          created_at: string
          doctor_user_id: string
          dreams: string | null
          family_history: string | null
          female_complaints: string | null
          id: string
          mind: string | null
          modalities_better: string | null
          modalities_worse: string | null
          past_history: string | null
          patient_id: string
          perspiration: string | null
          repertory_result: Json | null
          selected_symptom_ids: string[] | null
          sleep: string | null
          status: string
          stool: string | null
          thermal_state: string | null
          thirst: string | null
          updated_at: string
          urine: string | null
        }
        Insert: {
          aversions?: string | null
          case_date?: string
          cravings?: string | null
          created_at?: string
          doctor_user_id: string
          dreams?: string | null
          family_history?: string | null
          female_complaints?: string | null
          id?: string
          mind?: string | null
          modalities_better?: string | null
          modalities_worse?: string | null
          past_history?: string | null
          patient_id: string
          perspiration?: string | null
          repertory_result?: Json | null
          selected_symptom_ids?: string[] | null
          sleep?: string | null
          status?: string
          stool?: string | null
          thermal_state?: string | null
          thirst?: string | null
          updated_at?: string
          urine?: string | null
        }
        Update: {
          aversions?: string | null
          case_date?: string
          cravings?: string | null
          created_at?: string
          doctor_user_id?: string
          dreams?: string | null
          family_history?: string | null
          female_complaints?: string | null
          id?: string
          mind?: string | null
          modalities_better?: string | null
          modalities_worse?: string | null
          past_history?: string | null
          patient_id?: string
          perspiration?: string | null
          repertory_result?: Json | null
          selected_symptom_ids?: string[] | null
          sleep?: string | null
          status?: string
          stool?: string | null
          thermal_state?: string | null
          thirst?: string | null
          updated_at?: string
          urine?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "homeo_cases_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "homeo_patients"
            referencedColumns: ["id"]
          },
        ]
      }
      homeo_doctor_remedy_notes: {
        Row: {
          created_at: string
          doctor_user_id: string
          id: string
          notes: string
          remedy_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          doctor_user_id: string
          id?: string
          notes?: string
          remedy_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          doctor_user_id?: string
          id?: string
          notes?: string
          remedy_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "homeo_doctor_remedy_notes_remedy_id_fkey"
            columns: ["remedy_id"]
            isOneToOne: false
            referencedRelation: "homeo_remedies"
            referencedColumns: ["id"]
          },
        ]
      }
      homeo_emotional_themes: {
        Row: {
          body_correlations: string[]
          caution_notes: string
          created_at: string
          differential_remedies: string[]
          doctor_notes: string
          dominant_reaction: string[]
          emotional_theme: string
          followup_questions: string[]
          id: string
          is_active: boolean
          likely_remedies_ranked: Json
          short_description: string
          slug: string
          sort_order: number
          trigger_patterns: string[]
          updated_at: string
        }
        Insert: {
          body_correlations?: string[]
          caution_notes?: string
          created_at?: string
          differential_remedies?: string[]
          doctor_notes?: string
          dominant_reaction?: string[]
          emotional_theme: string
          followup_questions?: string[]
          id?: string
          is_active?: boolean
          likely_remedies_ranked?: Json
          short_description?: string
          slug: string
          sort_order?: number
          trigger_patterns?: string[]
          updated_at?: string
        }
        Update: {
          body_correlations?: string[]
          caution_notes?: string
          created_at?: string
          differential_remedies?: string[]
          doctor_notes?: string
          dominant_reaction?: string[]
          emotional_theme?: string
          followup_questions?: string[]
          id?: string
          is_active?: boolean
          likely_remedies_ranked?: Json
          short_description?: string
          slug?: string
          sort_order?: number
          trigger_patterns?: string[]
          updated_at?: string
        }
        Relationships: []
      }
      homeo_followups: {
        Row: {
          case_id: string
          created_at: string
          doctor_user_id: string
          followup_date: string
          id: string
          next_action: string | null
          next_followup_date: string | null
          notes: string | null
          outcome: string
          patient_id: string
        }
        Insert: {
          case_id: string
          created_at?: string
          doctor_user_id: string
          followup_date?: string
          id?: string
          next_action?: string | null
          next_followup_date?: string | null
          notes?: string | null
          outcome: string
          patient_id: string
        }
        Update: {
          case_id?: string
          created_at?: string
          doctor_user_id?: string
          followup_date?: string
          id?: string
          next_action?: string | null
          next_followup_date?: string | null
          notes?: string | null
          outcome?: string
          patient_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "homeo_followups_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "homeo_cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "homeo_followups_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "homeo_patients"
            referencedColumns: ["id"]
          },
        ]
      }
      homeo_mind_cases: {
        Row: {
          additional_notes: string | null
          ai_analysis: Json | null
          bothers_most: string | null
          chief_complaint: string | null
          created_at: string
          deepest_fear: string | null
          detected_themes: string[] | null
          differential_remedies: string[] | null
          doctor_decision_notes: string | null
          doctor_final_remedy: string | null
          doctor_user_id: string
          duration: string | null
          id: string
          key_reasons: string | null
          patient_age: number | null
          patient_gender: string | null
          patient_id: string | null
          patient_name: string | null
          potency: string | null
          reaction: string | null
          relationship_pattern: string | null
          remedy_cluster: string[] | null
          repeating_emotion: string | null
          status: string
          suggested_remedy: string | null
          trigger_event: string | null
          updated_at: string
          what_hurts: string | null
          what_suppressed: string | null
          work_pattern: string | null
        }
        Insert: {
          additional_notes?: string | null
          ai_analysis?: Json | null
          bothers_most?: string | null
          chief_complaint?: string | null
          created_at?: string
          deepest_fear?: string | null
          detected_themes?: string[] | null
          differential_remedies?: string[] | null
          doctor_decision_notes?: string | null
          doctor_final_remedy?: string | null
          doctor_user_id: string
          duration?: string | null
          id?: string
          key_reasons?: string | null
          patient_age?: number | null
          patient_gender?: string | null
          patient_id?: string | null
          patient_name?: string | null
          potency?: string | null
          reaction?: string | null
          relationship_pattern?: string | null
          remedy_cluster?: string[] | null
          repeating_emotion?: string | null
          status?: string
          suggested_remedy?: string | null
          trigger_event?: string | null
          updated_at?: string
          what_hurts?: string | null
          what_suppressed?: string | null
          work_pattern?: string | null
        }
        Update: {
          additional_notes?: string | null
          ai_analysis?: Json | null
          bothers_most?: string | null
          chief_complaint?: string | null
          created_at?: string
          deepest_fear?: string | null
          detected_themes?: string[] | null
          differential_remedies?: string[] | null
          doctor_decision_notes?: string | null
          doctor_final_remedy?: string | null
          doctor_user_id?: string
          duration?: string | null
          id?: string
          key_reasons?: string | null
          patient_age?: number | null
          patient_gender?: string | null
          patient_id?: string | null
          patient_name?: string | null
          potency?: string | null
          reaction?: string | null
          relationship_pattern?: string | null
          remedy_cluster?: string[] | null
          repeating_emotion?: string | null
          status?: string
          suggested_remedy?: string | null
          trigger_event?: string | null
          updated_at?: string
          what_hurts?: string | null
          what_suppressed?: string | null
          work_pattern?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "homeo_mind_cases_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "homeo_patients"
            referencedColumns: ["id"]
          },
        ]
      }
      homeo_mind_followups: {
        Row: {
          case_id: string
          created_at: string
          doctor_user_id: string
          emotional_resilience_score: number | null
          energy_score: number | null
          id: string
          next_action: string | null
          observations: string | null
          physical_complaint_score: number | null
          potency: string | null
          remedy_given: string | null
          sleep_score: number | null
          trigger_response_score: number | null
          visit_date: string
        }
        Insert: {
          case_id: string
          created_at?: string
          doctor_user_id: string
          emotional_resilience_score?: number | null
          energy_score?: number | null
          id?: string
          next_action?: string | null
          observations?: string | null
          physical_complaint_score?: number | null
          potency?: string | null
          remedy_given?: string | null
          sleep_score?: number | null
          trigger_response_score?: number | null
          visit_date?: string
        }
        Update: {
          case_id?: string
          created_at?: string
          doctor_user_id?: string
          emotional_resilience_score?: number | null
          energy_score?: number | null
          id?: string
          next_action?: string | null
          observations?: string | null
          physical_complaint_score?: number | null
          potency?: string | null
          remedy_given?: string | null
          sleep_score?: number | null
          trigger_response_score?: number | null
          visit_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "homeo_mind_followups_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "homeo_mind_cases"
            referencedColumns: ["id"]
          },
        ]
      }
      homeo_patients: {
        Row: {
          address: string | null
          age: number | null
          chief_complaint: string | null
          chronicity: string | null
          created_at: string
          doctor_user_id: string
          email: string | null
          full_name: string
          gender: string | null
          id: string
          notes: string | null
          occupation: string | null
          patient_code: string | null
          phone: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          age?: number | null
          chief_complaint?: string | null
          chronicity?: string | null
          created_at?: string
          doctor_user_id: string
          email?: string | null
          full_name: string
          gender?: string | null
          id?: string
          notes?: string | null
          occupation?: string | null
          patient_code?: string | null
          phone?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          age?: number | null
          chief_complaint?: string | null
          chronicity?: string | null
          created_at?: string
          doctor_user_id?: string
          email?: string | null
          full_name?: string
          gender?: string | null
          id?: string
          notes?: string | null
          occupation?: string | null
          patient_code?: string | null
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      homeo_prescriptions: {
        Row: {
          case_id: string
          created_at: string
          doctor_user_id: string
          dosage: string
          duration_days: number | null
          follow_up_date: string | null
          id: string
          instructions: string | null
          patient_id: string
          potency: string
          prescribed_at: string
          remedy_id: string | null
          remedy_name: string
        }
        Insert: {
          case_id: string
          created_at?: string
          doctor_user_id: string
          dosage: string
          duration_days?: number | null
          follow_up_date?: string | null
          id?: string
          instructions?: string | null
          patient_id: string
          potency: string
          prescribed_at?: string
          remedy_id?: string | null
          remedy_name: string
        }
        Update: {
          case_id?: string
          created_at?: string
          doctor_user_id?: string
          dosage?: string
          duration_days?: number | null
          follow_up_date?: string | null
          id?: string
          instructions?: string | null
          patient_id?: string
          potency?: string
          prescribed_at?: string
          remedy_id?: string | null
          remedy_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "homeo_prescriptions_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "homeo_cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "homeo_prescriptions_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "homeo_patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "homeo_prescriptions_remedy_id_fkey"
            columns: ["remedy_id"]
            isOneToOne: false
            referencedRelation: "homeo_remedies"
            referencedColumns: ["id"]
          },
        ]
      }
      homeo_remedies: {
        Row: {
          abbreviation: string
          affinities: string[] | null
          antidotes: string[] | null
          aversions: string[] | null
          children_indications: string | null
          common_clinical_uses: string[] | null
          common_name: string | null
          common_potencies: string[] | null
          compare_with: string[] | null
          complementary_remedies: string[] | null
          cravings: string[] | null
          created_at: string
          detail_level: string
          digestive_symptoms: string | null
          doctor_notes: string | null
          dreams: string | null
          family: string | null
          female_symptoms: string | null
          food_aversions: string[] | null
          food_cravings: string[] | null
          full_text: string | null
          general_symptoms: string | null
          id: string
          key_personality: string | null
          keynote_symptoms: string[] | null
          keynotes: string[] | null
          kingdom: string | null
          latin_name: string | null
          male_symptoms: string | null
          mental_emotional_picture: string | null
          mind_sphere: string | null
          modalities_better: string[] | null
          modalities_worse: string[] | null
          name: string
          respiratory_symptoms: string | null
          safety_notes: string | null
          short_description: string | null
          skin_symptoms: string | null
          sleep_pattern: string | null
          source: string | null
          sweat: string | null
          thermal: string | null
          thirst: string | null
          updated_at: string
          usual_potencies: string[] | null
        }
        Insert: {
          abbreviation: string
          affinities?: string[] | null
          antidotes?: string[] | null
          aversions?: string[] | null
          children_indications?: string | null
          common_clinical_uses?: string[] | null
          common_name?: string | null
          common_potencies?: string[] | null
          compare_with?: string[] | null
          complementary_remedies?: string[] | null
          cravings?: string[] | null
          created_at?: string
          detail_level?: string
          digestive_symptoms?: string | null
          doctor_notes?: string | null
          dreams?: string | null
          family?: string | null
          female_symptoms?: string | null
          food_aversions?: string[] | null
          food_cravings?: string[] | null
          full_text?: string | null
          general_symptoms?: string | null
          id?: string
          key_personality?: string | null
          keynote_symptoms?: string[] | null
          keynotes?: string[] | null
          kingdom?: string | null
          latin_name?: string | null
          male_symptoms?: string | null
          mental_emotional_picture?: string | null
          mind_sphere?: string | null
          modalities_better?: string[] | null
          modalities_worse?: string[] | null
          name: string
          respiratory_symptoms?: string | null
          safety_notes?: string | null
          short_description?: string | null
          skin_symptoms?: string | null
          sleep_pattern?: string | null
          source?: string | null
          sweat?: string | null
          thermal?: string | null
          thirst?: string | null
          updated_at?: string
          usual_potencies?: string[] | null
        }
        Update: {
          abbreviation?: string
          affinities?: string[] | null
          antidotes?: string[] | null
          aversions?: string[] | null
          children_indications?: string | null
          common_clinical_uses?: string[] | null
          common_name?: string | null
          common_potencies?: string[] | null
          compare_with?: string[] | null
          complementary_remedies?: string[] | null
          cravings?: string[] | null
          created_at?: string
          detail_level?: string
          digestive_symptoms?: string | null
          doctor_notes?: string | null
          dreams?: string | null
          family?: string | null
          female_symptoms?: string | null
          food_aversions?: string[] | null
          food_cravings?: string[] | null
          full_text?: string | null
          general_symptoms?: string | null
          id?: string
          key_personality?: string | null
          keynote_symptoms?: string[] | null
          keynotes?: string[] | null
          kingdom?: string | null
          latin_name?: string | null
          male_symptoms?: string | null
          mental_emotional_picture?: string | null
          mind_sphere?: string | null
          modalities_better?: string[] | null
          modalities_worse?: string[] | null
          name?: string
          respiratory_symptoms?: string | null
          safety_notes?: string | null
          short_description?: string | null
          skin_symptoms?: string | null
          sleep_pattern?: string | null
          source?: string | null
          sweat?: string | null
          thermal?: string | null
          thirst?: string | null
          updated_at?: string
          usual_potencies?: string[] | null
        }
        Relationships: []
      }
      homeo_saved_cases: {
        Row: {
          created_at: string
          doctor_user_id: string
          id: string
          notes: string | null
          patient_id: string | null
          ranking_snapshot: Json | null
          selected_rubric_ids: string[]
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          doctor_user_id: string
          id?: string
          notes?: string | null
          patient_id?: string | null
          ranking_snapshot?: Json | null
          selected_rubric_ids?: string[]
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          doctor_user_id?: string
          id?: string
          notes?: string | null
          patient_id?: string | null
          ranking_snapshot?: Json | null
          selected_rubric_ids?: string[]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "homeo_saved_cases_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "homeo_patients"
            referencedColumns: ["id"]
          },
        ]
      }
      homeo_symptom_remedies: {
        Row: {
          grade: number
          id: string
          remedy_id: string
          symptom_id: string
        }
        Insert: {
          grade?: number
          id?: string
          remedy_id: string
          symptom_id: string
        }
        Update: {
          grade?: number
          id?: string
          remedy_id?: string
          symptom_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "homeo_symptom_remedies_remedy_id_fkey"
            columns: ["remedy_id"]
            isOneToOne: false
            referencedRelation: "homeo_remedies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "homeo_symptom_remedies_symptom_id_fkey"
            columns: ["symptom_id"]
            isOneToOne: false
            referencedRelation: "homeo_symptoms"
            referencedColumns: ["id"]
          },
        ]
      }
      homeo_symptoms: {
        Row: {
          body_location: string | null
          chapter: string
          concomitant_symptoms: string[]
          created_at: string
          description: string | null
          id: string
          modalities_better: string[]
          modalities_worse: string[]
          notes: string | null
          rubric: string
          search_text: string | null
          sensation: string | null
          sub_rubric: string | null
          subcategory: string | null
          symptom_keywords: string[]
        }
        Insert: {
          body_location?: string | null
          chapter: string
          concomitant_symptoms?: string[]
          created_at?: string
          description?: string | null
          id?: string
          modalities_better?: string[]
          modalities_worse?: string[]
          notes?: string | null
          rubric: string
          search_text?: string | null
          sensation?: string | null
          sub_rubric?: string | null
          subcategory?: string | null
          symptom_keywords?: string[]
        }
        Update: {
          body_location?: string | null
          chapter?: string
          concomitant_symptoms?: string[]
          created_at?: string
          description?: string | null
          id?: string
          modalities_better?: string[]
          modalities_worse?: string[]
          notes?: string | null
          rubric?: string
          search_text?: string | null
          sensation?: string | null
          sub_rubric?: string | null
          subcategory?: string | null
          symptom_keywords?: string[]
        }
        Relationships: []
      }
      homeo_theme_remedy_map: {
        Row: {
          created_at: string
          id: string
          notes: string | null
          remedy_name: string
          theme: string
          weight: number
        }
        Insert: {
          created_at?: string
          id?: string
          notes?: string | null
          remedy_name: string
          theme: string
          weight?: number
        }
        Update: {
          created_at?: string
          id?: string
          notes?: string | null
          remedy_name?: string
          theme?: string
          weight?: number
        }
        Relationships: []
      }
      homeopathy_cases: {
        Row: {
          appetite: string | null
          aversions_mind: string[]
          case_number: string | null
          chief_complaint: string
          complaint_duration: string | null
          complaint_onset: string | null
          constitutional_summary: string | null
          created_at: string
          desires: string[]
          doctor_notes: string | null
          doctor_user_id: string
          dreams: string | null
          emotional_themes: string[]
          family_history: string | null
          fears: string[]
          food_aversions: string[]
          food_cravings: string[]
          history_present_illness: string | null
          id: string
          intellectual_state: string | null
          life_situation: string | null
          menses: string | null
          mental_state: string | null
          miasm_assessment: string | null
          miasm_evidence: string | null
          modalities_better: string[]
          modalities_worse: string[]
          particulars: Json
          past_medical_history: string | null
          patient_address: string | null
          patient_age: number | null
          patient_gender: string | null
          patient_name: string
          patient_occupation: string | null
          patient_phone: string | null
          perspiration: string | null
          sexual_history: string | null
          significant_events: string | null
          sleep: string | null
          sleep_position: string | null
          status: string
          thermal_state: string | null
          thirst: string | null
          updated_at: string
        }
        Insert: {
          appetite?: string | null
          aversions_mind?: string[]
          case_number?: string | null
          chief_complaint?: string
          complaint_duration?: string | null
          complaint_onset?: string | null
          constitutional_summary?: string | null
          created_at?: string
          desires?: string[]
          doctor_notes?: string | null
          doctor_user_id: string
          dreams?: string | null
          emotional_themes?: string[]
          family_history?: string | null
          fears?: string[]
          food_aversions?: string[]
          food_cravings?: string[]
          history_present_illness?: string | null
          id?: string
          intellectual_state?: string | null
          life_situation?: string | null
          menses?: string | null
          mental_state?: string | null
          miasm_assessment?: string | null
          miasm_evidence?: string | null
          modalities_better?: string[]
          modalities_worse?: string[]
          particulars?: Json
          past_medical_history?: string | null
          patient_address?: string | null
          patient_age?: number | null
          patient_gender?: string | null
          patient_name: string
          patient_occupation?: string | null
          patient_phone?: string | null
          perspiration?: string | null
          sexual_history?: string | null
          significant_events?: string | null
          sleep?: string | null
          sleep_position?: string | null
          status?: string
          thermal_state?: string | null
          thirst?: string | null
          updated_at?: string
        }
        Update: {
          appetite?: string | null
          aversions_mind?: string[]
          case_number?: string | null
          chief_complaint?: string
          complaint_duration?: string | null
          complaint_onset?: string | null
          constitutional_summary?: string | null
          created_at?: string
          desires?: string[]
          doctor_notes?: string | null
          doctor_user_id?: string
          dreams?: string | null
          emotional_themes?: string[]
          family_history?: string | null
          fears?: string[]
          food_aversions?: string[]
          food_cravings?: string[]
          history_present_illness?: string | null
          id?: string
          intellectual_state?: string | null
          life_situation?: string | null
          menses?: string | null
          mental_state?: string | null
          miasm_assessment?: string | null
          miasm_evidence?: string | null
          modalities_better?: string[]
          modalities_worse?: string[]
          particulars?: Json
          past_medical_history?: string | null
          patient_address?: string | null
          patient_age?: number | null
          patient_gender?: string | null
          patient_name?: string
          patient_occupation?: string | null
          patient_phone?: string | null
          perspiration?: string | null
          sexual_history?: string | null
          significant_events?: string | null
          sleep?: string | null
          sleep_position?: string | null
          status?: string
          thermal_state?: string | null
          thirst?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      homeopathy_prescriptions: {
        Row: {
          case_id: string
          created_at: string
          doctor_notes: string | null
          doctor_user_id: string
          dosage: string | null
          duration: string | null
          follow_up_date: string | null
          id: string
          instructions: string | null
          is_active: boolean
          outcome: string | null
          placebo_instructions: string | null
          potency: string
          prescribed_at: string
          remedy_id: string | null
          remedy_name: string
          repetition: string | null
          updated_at: string
        }
        Insert: {
          case_id: string
          created_at?: string
          doctor_notes?: string | null
          doctor_user_id: string
          dosage?: string | null
          duration?: string | null
          follow_up_date?: string | null
          id?: string
          instructions?: string | null
          is_active?: boolean
          outcome?: string | null
          placebo_instructions?: string | null
          potency: string
          prescribed_at?: string
          remedy_id?: string | null
          remedy_name: string
          repetition?: string | null
          updated_at?: string
        }
        Update: {
          case_id?: string
          created_at?: string
          doctor_notes?: string | null
          doctor_user_id?: string
          dosage?: string | null
          duration?: string | null
          follow_up_date?: string | null
          id?: string
          instructions?: string | null
          is_active?: boolean
          outcome?: string | null
          placebo_instructions?: string | null
          potency?: string
          prescribed_at?: string
          remedy_id?: string | null
          remedy_name?: string
          repetition?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "homeopathy_prescriptions_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "homeopathy_cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "homeopathy_prescriptions_remedy_id_fkey"
            columns: ["remedy_id"]
            isOneToOne: false
            referencedRelation: "homeopathy_remedies"
            referencedColumns: ["id"]
          },
        ]
      }
      homeopathy_remedies: {
        Row: {
          abbreviation: string
          clinical_indications: string[]
          common_name: string | null
          created_at: string
          doctor_notes: string | null
          food_aversions: string[]
          food_cravings: string[]
          generals: string
          id: string
          is_active: boolean
          keynotes: string[]
          latin_name: string | null
          miasm: string[]
          mind_summary: string
          modalities_better: string[]
          modalities_worse: string[]
          name: string
          particulars: Json
          potency_range: string | null
          relationships: Json
          source_kingdom: string | null
          source_substance: string | null
          thermal_state: string | null
          updated_at: string
        }
        Insert: {
          abbreviation: string
          clinical_indications?: string[]
          common_name?: string | null
          created_at?: string
          doctor_notes?: string | null
          food_aversions?: string[]
          food_cravings?: string[]
          generals?: string
          id?: string
          is_active?: boolean
          keynotes?: string[]
          latin_name?: string | null
          miasm?: string[]
          mind_summary?: string
          modalities_better?: string[]
          modalities_worse?: string[]
          name: string
          particulars?: Json
          potency_range?: string | null
          relationships?: Json
          source_kingdom?: string | null
          source_substance?: string | null
          thermal_state?: string | null
          updated_at?: string
        }
        Update: {
          abbreviation?: string
          clinical_indications?: string[]
          common_name?: string | null
          created_at?: string
          doctor_notes?: string | null
          food_aversions?: string[]
          food_cravings?: string[]
          generals?: string
          id?: string
          is_active?: boolean
          keynotes?: string[]
          latin_name?: string | null
          miasm?: string[]
          mind_summary?: string
          modalities_better?: string[]
          modalities_worse?: string[]
          name?: string
          particulars?: Json
          potency_range?: string | null
          relationships?: Json
          source_kingdom?: string | null
          source_substance?: string | null
          thermal_state?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      homeopathy_rubrics: {
        Row: {
          chapter: string
          created_at: string
          full_path: string
          id: string
          is_active: boolean
          is_small_rubric: boolean
          remedies: Json
          remedy_count: number
          rubric: string
          search_text: string | null
          section: string | null
          sub_rubric: string | null
          updated_at: string
        }
        Insert: {
          chapter: string
          created_at?: string
          full_path: string
          id?: string
          is_active?: boolean
          is_small_rubric?: boolean
          remedies?: Json
          remedy_count?: number
          rubric: string
          search_text?: string | null
          section?: string | null
          sub_rubric?: string | null
          updated_at?: string
        }
        Update: {
          chapter?: string
          created_at?: string
          full_path?: string
          id?: string
          is_active?: boolean
          is_small_rubric?: boolean
          remedies?: Json
          remedy_count?: number
          rubric?: string
          search_text?: string | null
          section?: string | null
          sub_rubric?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      job_applications: {
        Row: {
          applicant_email: string | null
          applicant_name: string | null
          applicant_phone: string | null
          cover_note: string | null
          created_at: string
          id: string
          job_id: string | null
          job_listing_id: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          applicant_email?: string | null
          applicant_name?: string | null
          applicant_phone?: string | null
          cover_note?: string | null
          created_at?: string
          id?: string
          job_id?: string | null
          job_listing_id: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          applicant_email?: string | null
          applicant_name?: string | null
          applicant_phone?: string | null
          cover_note?: string | null
          created_at?: string
          id?: string
          job_id?: string | null
          job_listing_id?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_applications_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_applications_job_listing_id_fkey"
            columns: ["job_listing_id"]
            isOneToOne: false
            referencedRelation: "job_listings"
            referencedColumns: ["id"]
          },
        ]
      }
      job_listings: {
        Row: {
          apply_email: string | null
          apply_url: string | null
          created_at: string | null
          description: string | null
          experience_years_min: number | null
          expires_at: string | null
          id: string
          is_active: boolean | null
          is_approved: boolean | null
          job_title: string
          job_type: string | null
          location_city: string | null
          location_state: string | null
          organization_name: string
          organization_type: string | null
          posted_by: string | null
          requirements: string | null
          salary_max: number | null
          salary_min: number | null
          specialization: string | null
        }
        Insert: {
          apply_email?: string | null
          apply_url?: string | null
          created_at?: string | null
          description?: string | null
          experience_years_min?: number | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          is_approved?: boolean | null
          job_title: string
          job_type?: string | null
          location_city?: string | null
          location_state?: string | null
          organization_name: string
          organization_type?: string | null
          posted_by?: string | null
          requirements?: string | null
          salary_max?: number | null
          salary_min?: number | null
          specialization?: string | null
        }
        Update: {
          apply_email?: string | null
          apply_url?: string | null
          created_at?: string | null
          description?: string | null
          experience_years_min?: number | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          is_approved?: boolean | null
          job_title?: string
          job_type?: string | null
          location_city?: string | null
          location_state?: string | null
          organization_name?: string
          organization_type?: string | null
          posted_by?: string | null
          requirements?: string | null
          salary_max?: number | null
          salary_min?: number | null
          specialization?: string | null
        }
        Relationships: []
      }
      lms_certificates: {
        Row: {
          certificate_no: string
          course_id: string
          course_title: string
          id: string
          issued_at: string
          recipient_name: string
          user_id: string
        }
        Insert: {
          certificate_no?: string
          course_id: string
          course_title: string
          id?: string
          issued_at?: string
          recipient_name: string
          user_id: string
        }
        Update: {
          certificate_no?: string
          course_id?: string
          course_title?: string
          id?: string
          issued_at?: string
          recipient_name?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lms_certificates_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "lms_courses"
            referencedColumns: ["id"]
          },
        ]
      }
      lms_courses: {
        Row: {
          category: string
          created_at: string
          description: string | null
          duration_minutes: number
          id: string
          instructor_avatar_url: string | null
          instructor_name: string | null
          is_published: boolean
          level: string
          slug: string
          thumbnail_url: string | null
          title: string
          total_lessons: number
          updated_at: string
        }
        Insert: {
          category?: string
          created_at?: string
          description?: string | null
          duration_minutes?: number
          id?: string
          instructor_avatar_url?: string | null
          instructor_name?: string | null
          is_published?: boolean
          level?: string
          slug: string
          thumbnail_url?: string | null
          title: string
          total_lessons?: number
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          duration_minutes?: number
          id?: string
          instructor_avatar_url?: string | null
          instructor_name?: string | null
          is_published?: boolean
          level?: string
          slug?: string
          thumbnail_url?: string | null
          title?: string
          total_lessons?: number
          updated_at?: string
        }
        Relationships: []
      }
      lms_lessons: {
        Row: {
          course_id: string
          created_at: string
          duration_minutes: number
          id: string
          notes: string | null
          sort_order: number
          title: string
          video_url: string | null
        }
        Insert: {
          course_id: string
          created_at?: string
          duration_minutes?: number
          id?: string
          notes?: string | null
          sort_order?: number
          title: string
          video_url?: string | null
        }
        Update: {
          course_id?: string
          created_at?: string
          duration_minutes?: number
          id?: string
          notes?: string | null
          sort_order?: number
          title?: string
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lms_lessons_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "lms_courses"
            referencedColumns: ["id"]
          },
        ]
      }
      lms_progress: {
        Row: {
          completed_at: string
          course_id: string
          id: string
          lesson_id: string
          progress_percent: number
          user_id: string
        }
        Insert: {
          completed_at?: string
          course_id: string
          id?: string
          lesson_id: string
          progress_percent?: number
          user_id: string
        }
        Update: {
          completed_at?: string
          course_id?: string
          id?: string
          lesson_id?: string
          progress_percent?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lms_progress_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "lms_courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lms_progress_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lms_lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      lms_quiz_attempts: {
        Row: {
          answers: Json
          course_id: string
          created_at: string
          id: string
          passed: boolean
          quiz_id: string
          score: number
          total_questions: number
          user_id: string
        }
        Insert: {
          answers?: Json
          course_id: string
          created_at?: string
          id?: string
          passed?: boolean
          quiz_id: string
          score?: number
          total_questions?: number
          user_id: string
        }
        Update: {
          answers?: Json
          course_id?: string
          created_at?: string
          id?: string
          passed?: boolean
          quiz_id?: string
          score?: number
          total_questions?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lms_quiz_attempts_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "lms_courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lms_quiz_attempts_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "lms_quizzes"
            referencedColumns: ["id"]
          },
        ]
      }
      lms_quiz_questions: {
        Row: {
          correct_index: number
          created_at: string
          id: string
          options: Json
          question: string
          quiz_id: string
          sort_order: number
        }
        Insert: {
          correct_index?: number
          created_at?: string
          id?: string
          options?: Json
          question: string
          quiz_id: string
          sort_order?: number
        }
        Update: {
          correct_index?: number
          created_at?: string
          id?: string
          options?: Json
          question?: string
          quiz_id?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "lms_quiz_questions_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "lms_quizzes"
            referencedColumns: ["id"]
          },
        ]
      }
      lms_quizzes: {
        Row: {
          course_id: string
          created_at: string
          description: string | null
          id: string
          is_published: boolean
          passing_score: number
          title: string
        }
        Insert: {
          course_id: string
          created_at?: string
          description?: string | null
          id?: string
          is_published?: boolean
          passing_score?: number
          title: string
        }
        Update: {
          course_id?: string
          created_at?: string
          description?: string | null
          id?: string
          is_published?: boolean
          passing_score?: number
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "lms_quizzes_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "lms_courses"
            referencedColumns: ["id"]
          },
        ]
      }
      network_partners: {
        Row: {
          about: string | null
          address: string | null
          applied_by_user_id: string | null
          city: string
          contact_person: string | null
          created_at: string
          email: string | null
          id: string
          image_url: string | null
          is_approved: boolean
          name: string
          partner_type: string
          phone: string | null
          pincode: string | null
          rating: number
          services: string[] | null
          specialities: string[] | null
          state: string | null
          updated_at: string
        }
        Insert: {
          about?: string | null
          address?: string | null
          applied_by_user_id?: string | null
          city: string
          contact_person?: string | null
          created_at?: string
          email?: string | null
          id?: string
          image_url?: string | null
          is_approved?: boolean
          name: string
          partner_type: string
          phone?: string | null
          pincode?: string | null
          rating?: number
          services?: string[] | null
          specialities?: string[] | null
          state?: string | null
          updated_at?: string
        }
        Update: {
          about?: string | null
          address?: string | null
          applied_by_user_id?: string | null
          city?: string
          contact_person?: string | null
          created_at?: string
          email?: string | null
          id?: string
          image_url?: string | null
          is_approved?: boolean
          name?: string
          partner_type?: string
          phone?: string | null
          pincode?: string | null
          rating?: number
          services?: string[] | null
          specialities?: string[] | null
          state?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      notification_logs: {
        Row: {
          id: string
          message_preview: string | null
          recipient_name: string | null
          recipient_phone: string | null
          sent_at: string
          status: string
          template_name: string | null
        }
        Insert: {
          id?: string
          message_preview?: string | null
          recipient_name?: string | null
          recipient_phone?: string | null
          sent_at?: string
          status?: string
          template_name?: string | null
        }
        Update: {
          id?: string
          message_preview?: string | null
          recipient_name?: string | null
          recipient_phone?: string | null
          sent_at?: string
          status?: string
          template_name?: string | null
        }
        Relationships: []
      }
      order_items: {
        Row: {
          created_at: string
          id: string
          order_id: string
          product_id: string
          product_name: string
          quantity: number
          unit_price: number
        }
        Insert: {
          created_at?: string
          id?: string
          order_id: string
          product_id: string
          product_name: string
          quantity: number
          unit_price: number
        }
        Update: {
          created_at?: string
          id?: string
          order_id?: string
          product_id?: string
          product_name?: string
          quantity?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "panchakarma_medicines"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "surgical_products"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          address_line1: string
          address_line2: string | null
          appointment_id: string | null
          city: string
          created_at: string
          delhivery_waybill: string | null
          full_name: string
          id: string
          order_status: string
          payment_status: string
          phone: string
          pincode: string
          razorpay_order_id: string | null
          razorpay_payment_id: string | null
          shipping: number
          state: string
          subtotal: number
          total: number
          updated_at: string
          user_id: string
        }
        Insert: {
          address_line1: string
          address_line2?: string | null
          appointment_id?: string | null
          city: string
          created_at?: string
          delhivery_waybill?: string | null
          full_name: string
          id?: string
          order_status?: string
          payment_status?: string
          phone: string
          pincode: string
          razorpay_order_id?: string | null
          razorpay_payment_id?: string | null
          shipping?: number
          state: string
          subtotal: number
          total: number
          updated_at?: string
          user_id: string
        }
        Update: {
          address_line1?: string
          address_line2?: string | null
          appointment_id?: string | null
          city?: string
          created_at?: string
          delhivery_waybill?: string | null
          full_name?: string
          id?: string
          order_status?: string
          payment_status?: string
          phone?: string
          pincode?: string
          razorpay_order_id?: string | null
          razorpay_payment_id?: string | null
          shipping?: number
          state?: string
          subtotal?: number
          total?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      patient_associated_members: {
        Row: {
          age: number | null
          created_at: string
          full_name: string
          gender: string | null
          height_cm: number | null
          id: string
          marital_status: string | null
          patient_user_id: string
          relation: string
          updated_at: string
          weight_kg: number | null
        }
        Insert: {
          age?: number | null
          created_at?: string
          full_name: string
          gender?: string | null
          height_cm?: number | null
          id?: string
          marital_status?: string | null
          patient_user_id: string
          relation: string
          updated_at?: string
          weight_kg?: number | null
        }
        Update: {
          age?: number | null
          created_at?: string
          full_name?: string
          gender?: string | null
          height_cm?: number | null
          id?: string
          marital_status?: string | null
          patient_user_id?: string
          relation?: string
          updated_at?: string
          weight_kg?: number | null
        }
        Relationships: []
      }
      patient_feedback: {
        Row: {
          appointment_id: string | null
          comment: string | null
          created_at: string
          doctor_id: string
          id: string
          is_public: boolean
          patient_user_id: string
          rating: number
          updated_at: string
        }
        Insert: {
          appointment_id?: string | null
          comment?: string | null
          created_at?: string
          doctor_id: string
          id?: string
          is_public?: boolean
          patient_user_id: string
          rating: number
          updated_at?: string
        }
        Update: {
          appointment_id?: string | null
          comment?: string | null
          created_at?: string
          doctor_id?: string
          id?: string
          is_public?: boolean
          patient_user_id?: string
          rating?: number
          updated_at?: string
        }
        Relationships: []
      }
      patient_vitals: {
        Row: {
          blood_sugar_fasting: number | null
          bp_diastolic: number | null
          bp_systolic: number | null
          created_at: string
          height_cm: number | null
          id: string
          notes: string | null
          pulse: number | null
          recorded_date: string
          spo2: number | null
          temperature: number | null
          user_id: string
          weight_kg: number | null
        }
        Insert: {
          blood_sugar_fasting?: number | null
          bp_diastolic?: number | null
          bp_systolic?: number | null
          created_at?: string
          height_cm?: number | null
          id?: string
          notes?: string | null
          pulse?: number | null
          recorded_date?: string
          spo2?: number | null
          temperature?: number | null
          user_id: string
          weight_kg?: number | null
        }
        Update: {
          blood_sugar_fasting?: number | null
          bp_diastolic?: number | null
          bp_systolic?: number | null
          created_at?: string
          height_cm?: number | null
          id?: string
          notes?: string | null
          pulse?: number | null
          recorded_date?: string
          spo2?: number | null
          temperature?: number | null
          user_id?: string
          weight_kg?: number | null
        }
        Relationships: []
      }
      payout_requests: {
        Row: {
          admin_note: string | null
          amount: number
          created_at: string
          id: string
          notes: string | null
          processed_at: string | null
          requester_user_id: string
          status: string
          therapist_id: string | null
          type: string
          updated_at: string
          venue_id: string | null
        }
        Insert: {
          admin_note?: string | null
          amount: number
          created_at?: string
          id?: string
          notes?: string | null
          processed_at?: string | null
          requester_user_id: string
          status?: string
          therapist_id?: string | null
          type: string
          updated_at?: string
          venue_id?: string | null
        }
        Update: {
          admin_note?: string | null
          amount?: number
          created_at?: string
          id?: string
          notes?: string | null
          processed_at?: string | null
          requester_user_id?: string
          status?: string
          therapist_id?: string | null
          type?: string
          updated_at?: string
          venue_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payout_requests_therapist_id_fkey"
            columns: ["therapist_id"]
            isOneToOne: false
            referencedRelation: "therapists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payout_requests_venue_id_fkey"
            columns: ["venue_id"]
            isOneToOne: false
            referencedRelation: "therapy_venues"
            referencedColumns: ["id"]
          },
        ]
      }
      prakriti_assessments: {
        Row: {
          assessor_user_id: string | null
          created_at: string
          dominant_dosha: string | null
          id: string
          kapha_score: number
          mode: string
          notes: string | null
          patient_age: number | null
          patient_gender: string | null
          patient_name: string | null
          patient_user_id: string
          pitta_score: number
          responses: Json
          status: string
          total_questions: number
          updated_at: string
          vata_score: number
        }
        Insert: {
          assessor_user_id?: string | null
          created_at?: string
          dominant_dosha?: string | null
          id?: string
          kapha_score?: number
          mode?: string
          notes?: string | null
          patient_age?: number | null
          patient_gender?: string | null
          patient_name?: string | null
          patient_user_id: string
          pitta_score?: number
          responses?: Json
          status?: string
          total_questions?: number
          updated_at?: string
          vata_score?: number
        }
        Update: {
          assessor_user_id?: string | null
          created_at?: string
          dominant_dosha?: string | null
          id?: string
          kapha_score?: number
          mode?: string
          notes?: string | null
          patient_age?: number | null
          patient_gender?: string | null
          patient_name?: string | null
          patient_user_id?: string
          pitta_score?: number
          responses?: Json
          status?: string
          total_questions?: number
          updated_at?: string
          vata_score?: number
        }
        Relationships: []
      }
      prescription_essential_drugs: {
        Row: {
          anupana: string | null
          consultation_id: string
          created_at: string
          dose_override: string | null
          drug_id: string
          duration: string | null
          frequency: string | null
          id: string
          instructions: string | null
          sort_order: number | null
        }
        Insert: {
          anupana?: string | null
          consultation_id: string
          created_at?: string
          dose_override?: string | null
          drug_id: string
          duration?: string | null
          frequency?: string | null
          id?: string
          instructions?: string | null
          sort_order?: number | null
        }
        Update: {
          anupana?: string | null
          consultation_id?: string
          created_at?: string
          dose_override?: string | null
          drug_id?: string
          duration?: string | null
          frequency?: string | null
          id?: string
          instructions?: string | null
          sort_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "prescription_essential_drugs_consultation_id_fkey"
            columns: ["consultation_id"]
            isOneToOne: false
            referencedRelation: "vaidya_consultations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prescription_essential_drugs_drug_id_fkey"
            columns: ["drug_id"]
            isOneToOne: false
            referencedRelation: "essential_drugs"
            referencedColumns: ["id"]
          },
        ]
      }
      prescription_essential_siddha_drugs: {
        Row: {
          anupana: string | null
          consultation_id: string
          created_at: string
          dose_override: string | null
          drug_id: string
          duration: string | null
          frequency: string | null
          id: string
          instructions: string | null
          sort_order: number | null
        }
        Insert: {
          anupana?: string | null
          consultation_id: string
          created_at?: string
          dose_override?: string | null
          drug_id: string
          duration?: string | null
          frequency?: string | null
          id?: string
          instructions?: string | null
          sort_order?: number | null
        }
        Update: {
          anupana?: string | null
          consultation_id?: string
          created_at?: string
          dose_override?: string | null
          drug_id?: string
          duration?: string | null
          frequency?: string | null
          id?: string
          instructions?: string | null
          sort_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "prescription_essential_siddha_drugs_consultation_id_fkey"
            columns: ["consultation_id"]
            isOneToOne: false
            referencedRelation: "vaidya_consultations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prescription_essential_siddha_drugs_drug_id_fkey"
            columns: ["drug_id"]
            isOneToOne: false
            referencedRelation: "essential_siddha_drugs"
            referencedColumns: ["id"]
          },
        ]
      }
      prescription_essential_unani_drugs: {
        Row: {
          anupana: string | null
          consultation_id: string
          created_at: string
          dose_override: string | null
          drug_id: string
          duration: string | null
          frequency: string | null
          id: string
          instructions: string | null
          sort_order: number | null
        }
        Insert: {
          anupana?: string | null
          consultation_id: string
          created_at?: string
          dose_override?: string | null
          drug_id: string
          duration?: string | null
          frequency?: string | null
          id?: string
          instructions?: string | null
          sort_order?: number | null
        }
        Update: {
          anupana?: string | null
          consultation_id?: string
          created_at?: string
          dose_override?: string | null
          drug_id?: string
          duration?: string | null
          frequency?: string | null
          id?: string
          instructions?: string | null
          sort_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "prescription_essential_unani_drugs_consultation_id_fkey"
            columns: ["consultation_id"]
            isOneToOne: false
            referencedRelation: "vaidya_consultations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prescription_essential_unani_drugs_drug_id_fkey"
            columns: ["drug_id"]
            isOneToOne: false
            referencedRelation: "essential_unani_drugs"
            referencedColumns: ["id"]
          },
        ]
      }
      prescription_food_recipes: {
        Row: {
          created_at: string
          doctor_note: string | null
          doctor_user_id: string
          dose: string | null
          duration: string | null
          id: string
          patient_id: string | null
          prescription_id: string
          recipe_id: string
          when_to_take: string | null
        }
        Insert: {
          created_at?: string
          doctor_note?: string | null
          doctor_user_id: string
          dose?: string | null
          duration?: string | null
          id?: string
          patient_id?: string | null
          prescription_id: string
          recipe_id: string
          when_to_take?: string | null
        }
        Update: {
          created_at?: string
          doctor_note?: string | null
          doctor_user_id?: string
          dose?: string | null
          duration?: string | null
          id?: string
          patient_id?: string | null
          prescription_id?: string
          recipe_id?: string
          when_to_take?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "prescription_food_recipes_prescription_id_fkey"
            columns: ["prescription_id"]
            isOneToOne: false
            referencedRelation: "homeo_prescriptions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prescription_food_recipes_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "food_recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      prescription_homeopathy_drugs: {
        Row: {
          consultation_id: string
          created_at: string
          dose: string | null
          drug_id: string
          duration_days: number | null
          form: string | null
          frequency: string | null
          id: string
          instructions: string | null
          potency: string
          repetition: string | null
          sort_order: number
          updated_at: string
        }
        Insert: {
          consultation_id: string
          created_at?: string
          dose?: string | null
          drug_id: string
          duration_days?: number | null
          form?: string | null
          frequency?: string | null
          id?: string
          instructions?: string | null
          potency: string
          repetition?: string | null
          sort_order?: number
          updated_at?: string
        }
        Update: {
          consultation_id?: string
          created_at?: string
          dose?: string | null
          drug_id?: string
          duration_days?: number | null
          form?: string | null
          frequency?: string | null
          id?: string
          instructions?: string | null
          potency?: string
          repetition?: string | null
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "prescription_homeopathy_drugs_consultation_id_fkey"
            columns: ["consultation_id"]
            isOneToOne: false
            referencedRelation: "vaidya_consultations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prescription_homeopathy_drugs_drug_id_fkey"
            columns: ["drug_id"]
            isOneToOne: false
            referencedRelation: "essential_homeopathy_drugs"
            referencedColumns: ["id"]
          },
        ]
      }
      prescription_orders: {
        Row: {
          admin_note: string | null
          created_at: string | null
          delivery_address: Json
          guest_name: string | null
          guest_phone: string | null
          id: string
          notes: string | null
          prescription_urls: string[]
          quoted_amount: number | null
          status: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          admin_note?: string | null
          created_at?: string | null
          delivery_address: Json
          guest_name?: string | null
          guest_phone?: string | null
          id?: string
          notes?: string | null
          prescription_urls: string[]
          quoted_amount?: number | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          admin_note?: string | null
          created_at?: string | null
          delivery_address?: Json
          guest_name?: string | null
          guest_phone?: string | null
          id?: string
          notes?: string | null
          prescription_urls?: string[]
          quoted_amount?: number | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      product_bulk_tiers: {
        Row: {
          created_at: string
          id: string
          min_qty: number
          product_id: string
          unit_price: number
        }
        Insert: {
          created_at?: string
          id?: string
          min_qty: number
          product_id: string
          unit_price: number
        }
        Update: {
          created_at?: string
          id?: string
          min_qty?: number
          product_id?: string
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "product_bulk_tiers_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "panchakarma_medicines"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_bulk_tiers_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_bulk_tiers_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "surgical_products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          ayush_system: string | null
          brand: string
          bulk_brand: string | null
          bulk_classical_type: string | null
          bulk_patented_type: string | null
          category: string
          created_at: string
          description: string | null
          discount_price: number | null
          dosage_form: string | null
          health_conditions: string[] | null
          id: string
          image_url: string | null
          is_bulk: boolean
          is_offers: boolean | null
          is_prescription_required: boolean | null
          is_surgical: boolean | null
          name: string
          offer_label: string | null
          price: number
          product_type: string | null
          rating: number
          stock: number
          surgical_category: string | null
          tags: string[] | null
          total_reviews: number
          treatment_use: string | null
          unit: string | null
        }
        Insert: {
          ayush_system?: string | null
          brand: string
          bulk_brand?: string | null
          bulk_classical_type?: string | null
          bulk_patented_type?: string | null
          category: string
          created_at?: string
          description?: string | null
          discount_price?: number | null
          dosage_form?: string | null
          health_conditions?: string[] | null
          id?: string
          image_url?: string | null
          is_bulk?: boolean
          is_offers?: boolean | null
          is_prescription_required?: boolean | null
          is_surgical?: boolean | null
          name: string
          offer_label?: string | null
          price: number
          product_type?: string | null
          rating?: number
          stock?: number
          surgical_category?: string | null
          tags?: string[] | null
          total_reviews?: number
          treatment_use?: string | null
          unit?: string | null
        }
        Update: {
          ayush_system?: string | null
          brand?: string
          bulk_brand?: string | null
          bulk_classical_type?: string | null
          bulk_patented_type?: string | null
          category?: string
          created_at?: string
          description?: string | null
          discount_price?: number | null
          dosage_form?: string | null
          health_conditions?: string[] | null
          id?: string
          image_url?: string | null
          is_bulk?: boolean
          is_offers?: boolean | null
          is_prescription_required?: boolean | null
          is_surgical?: boolean | null
          name?: string
          offer_label?: string | null
          price?: number
          product_type?: string | null
          rating?: number
          stock?: number
          surgical_category?: string | null
          tags?: string[] | null
          total_reviews?: number
          treatment_use?: string | null
          unit?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          city: string | null
          created_at: string
          date_of_birth: string | null
          email: string | null
          full_name: string | null
          gender: string | null
          id: string
          is_active: boolean
          phone: string | null
          pincode: string | null
          preferred_languages: string[]
          referral_code: string | null
          referred_by: string | null
          state: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          city?: string | null
          created_at?: string
          date_of_birth?: string | null
          email?: string | null
          full_name?: string | null
          gender?: string | null
          id?: string
          is_active?: boolean
          phone?: string | null
          pincode?: string | null
          preferred_languages?: string[]
          referral_code?: string | null
          referred_by?: string | null
          state?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          city?: string | null
          created_at?: string
          date_of_birth?: string | null
          email?: string | null
          full_name?: string | null
          gender?: string | null
          id?: string
          is_active?: boolean
          phone?: string | null
          pincode?: string | null
          preferred_languages?: string[]
          referral_code?: string | null
          referred_by?: string | null
          state?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      refund_requests: {
        Row: {
          admin_note: string | null
          amount: number
          created_at: string
          id: string
          patient_user_id: string | null
          processed_at: string | null
          razorpay_payment_id: string | null
          reason: string | null
          session_id: string | null
          status: string
          updated_at: string
        }
        Insert: {
          admin_note?: string | null
          amount: number
          created_at?: string
          id?: string
          patient_user_id?: string | null
          processed_at?: string | null
          razorpay_payment_id?: string | null
          reason?: string | null
          session_id?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          admin_note?: string | null
          amount?: number
          created_at?: string
          id?: string
          patient_user_id?: string | null
          processed_at?: string | null
          razorpay_payment_id?: string | null
          reason?: string | null
          session_id?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "refund_requests_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "therapy_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      repertorisation_results: {
        Row: {
          case_id: string
          created_at: string
          doctor_notes: string | null
          doctor_user_id: string
          id: string
          results: Json
          rubric_ids: string[]
          top_remedy: string | null
          total_rubrics: number
        }
        Insert: {
          case_id: string
          created_at?: string
          doctor_notes?: string | null
          doctor_user_id: string
          id?: string
          results?: Json
          rubric_ids?: string[]
          top_remedy?: string | null
          total_rubrics?: number
        }
        Update: {
          case_id?: string
          created_at?: string
          doctor_notes?: string | null
          doctor_user_id?: string
          id?: string
          results?: Json
          rubric_ids?: string[]
          top_remedy?: string | null
          total_rubrics?: number
        }
        Relationships: [
          {
            foreignKeyName: "repertorisation_results_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "homeopathy_cases"
            referencedColumns: ["id"]
          },
        ]
      }
      revenue_split_config: {
        Row: {
          description: string | null
          key: string
          updated_at: string
          value: number
        }
        Insert: {
          description?: string | null
          key: string
          updated_at?: string
          value: number
        }
        Update: {
          description?: string | null
          key?: string
          updated_at?: string
          value?: number
        }
        Relationships: []
      }
      reward_scheme_tiers: {
        Row: {
          created_at: string
          id: string
          min_order_value: number
          reward_image_url: string | null
          reward_name: string
          scheme_id: string
          sort_order: number
        }
        Insert: {
          created_at?: string
          id?: string
          min_order_value: number
          reward_image_url?: string | null
          reward_name: string
          scheme_id: string
          sort_order?: number
        }
        Update: {
          created_at?: string
          id?: string
          min_order_value?: number
          reward_image_url?: string | null
          reward_name?: string
          scheme_id?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "reward_scheme_tiers_scheme_id_fkey"
            columns: ["scheme_id"]
            isOneToOne: false
            referencedRelation: "reward_schemes"
            referencedColumns: ["id"]
          },
        ]
      }
      reward_schemes: {
        Row: {
          audience: string
          banner_url: string | null
          created_at: string
          description: string | null
          end_date: string
          id: string
          is_active: boolean
          scheme_type: string
          start_date: string
          terms: string | null
          title: string
          updated_at: string
        }
        Insert: {
          audience?: string
          banner_url?: string | null
          created_at?: string
          description?: string | null
          end_date: string
          id?: string
          is_active?: boolean
          scheme_type?: string
          start_date: string
          terms?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          audience?: string
          banner_url?: string | null
          created_at?: string
          description?: string | null
          end_date?: string
          id?: string
          is_active?: boolean
          scheme_type?: string
          start_date?: string
          terms?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      room_unavailability: {
        Row: {
          created_at: string
          id: string
          reason: string | null
          room_name: string
          unavailable_date: string
          venue_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          reason?: string | null
          room_name: string
          unavailable_date: string
          venue_id: string
        }
        Update: {
          created_at?: string
          id?: string
          reason?: string | null
          room_name?: string
          unavailable_date?: string
          venue_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "room_unavailability_venue_id_fkey"
            columns: ["venue_id"]
            isOneToOne: false
            referencedRelation: "therapy_venues"
            referencedColumns: ["id"]
          },
        ]
      }
      service_providers: {
        Row: {
          about: string | null
          address: string | null
          business_name: string
          city: string
          contact_person: string
          cover_image_url: string | null
          created_at: string
          email: string | null
          id: string
          is_approved: boolean
          is_verified: boolean
          logo_url: string | null
          phone: string | null
          pincode: string | null
          provider_type: string
          rating: number
          rejection_reason: string | null
          state: string | null
          total_reviews: number
          updated_at: string
          user_id: string
          verification_status: string
        }
        Insert: {
          about?: string | null
          address?: string | null
          business_name: string
          city: string
          contact_person: string
          cover_image_url?: string | null
          created_at?: string
          email?: string | null
          id?: string
          is_approved?: boolean
          is_verified?: boolean
          logo_url?: string | null
          phone?: string | null
          pincode?: string | null
          provider_type: string
          rating?: number
          rejection_reason?: string | null
          state?: string | null
          total_reviews?: number
          updated_at?: string
          user_id: string
          verification_status?: string
        }
        Update: {
          about?: string | null
          address?: string | null
          business_name?: string
          city?: string
          contact_person?: string
          cover_image_url?: string | null
          created_at?: string
          email?: string | null
          id?: string
          is_approved?: boolean
          is_verified?: boolean
          logo_url?: string | null
          phone?: string | null
          pincode?: string | null
          provider_type?: string
          rating?: number
          rejection_reason?: string | null
          state?: string | null
          total_reviews?: number
          updated_at?: string
          user_id?: string
          verification_status?: string
        }
        Relationships: []
      }
      student_bookmarks: {
        Row: {
          blog_id: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          blog_id: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          blog_id?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_bookmarks_blog_id_fkey"
            columns: ["blog_id"]
            isOneToOne: false
            referencedRelation: "health_blogs"
            referencedColumns: ["id"]
          },
        ]
      }
      student_profiles: {
        Row: {
          city: string | null
          college_name: string | null
          course: string | null
          created_at: string | null
          full_name: string
          id: string
          interests: string[] | null
          is_verified: boolean | null
          phone: string | null
          profile_photo_url: string | null
          rejection_note: string | null
          state: string | null
          student_id_url: string | null
          updated_at: string | null
          user_id: string
          year_of_study: number | null
        }
        Insert: {
          city?: string | null
          college_name?: string | null
          course?: string | null
          created_at?: string | null
          full_name: string
          id?: string
          interests?: string[] | null
          is_verified?: boolean | null
          phone?: string | null
          profile_photo_url?: string | null
          rejection_note?: string | null
          state?: string | null
          student_id_url?: string | null
          updated_at?: string | null
          user_id: string
          year_of_study?: number | null
        }
        Update: {
          city?: string | null
          college_name?: string | null
          course?: string | null
          created_at?: string | null
          full_name?: string
          id?: string
          interests?: string[] | null
          is_verified?: boolean | null
          phone?: string | null
          profile_photo_url?: string | null
          rejection_note?: string | null
          state?: string | null
          student_id_url?: string | null
          updated_at?: string | null
          user_id?: string
          year_of_study?: number | null
        }
        Relationships: []
      }
      suppressed_emails: {
        Row: {
          created_at: string
          email: string
          id: string
          metadata: Json | null
          reason: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          metadata?: Json | null
          reason: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          metadata?: Json | null
          reason?: string
        }
        Relationships: []
      }
      therapies: {
        Row: {
          benefits: string[]
          category: string
          created_at: string
          description: string | null
          duration_minutes: number
          id: string
          image_url: string | null
          is_active: boolean
          is_published: boolean
          name: string
          price: number
          short_description: string | null
          slug: string
        }
        Insert: {
          benefits?: string[]
          category: string
          created_at?: string
          description?: string | null
          duration_minutes?: number
          id?: string
          image_url?: string | null
          is_active?: boolean
          is_published?: boolean
          name: string
          price?: number
          short_description?: string | null
          slug: string
        }
        Update: {
          benefits?: string[]
          category?: string
          created_at?: string
          description?: string | null
          duration_minutes?: number
          id?: string
          image_url?: string | null
          is_active?: boolean
          is_published?: boolean
          name?: string
          price?: number
          short_description?: string | null
          slug?: string
        }
        Relationships: []
      }
      therapist_availability: {
        Row: {
          created_at: string
          end_time: string
          id: string
          is_active: boolean
          start_time: string
          therapist_id: string
          updated_at: string
          weekday: number
        }
        Insert: {
          created_at?: string
          end_time?: string
          id?: string
          is_active?: boolean
          start_time?: string
          therapist_id: string
          updated_at?: string
          weekday: number
        }
        Update: {
          created_at?: string
          end_time?: string
          id?: string
          is_active?: boolean
          start_time?: string
          therapist_id?: string
          updated_at?: string
          weekday?: number
        }
        Relationships: []
      }
      therapist_location_pings: {
        Row: {
          id: string
          lat: number
          lng: number
          pinged_at: string
          session_id: string | null
          therapist_id: string | null
        }
        Insert: {
          id?: string
          lat: number
          lng: number
          pinged_at?: string
          session_id?: string | null
          therapist_id?: string | null
        }
        Update: {
          id?: string
          lat?: number
          lng?: number
          pinged_at?: string
          session_id?: string | null
          therapist_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "therapist_location_pings_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "therapy_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "therapist_location_pings_therapist_id_fkey"
            columns: ["therapist_id"]
            isOneToOne: false
            referencedRelation: "therapists"
            referencedColumns: ["id"]
          },
        ]
      }
      therapist_safety_flags: {
        Row: {
          admin_note: string | null
          created_at: string
          flagged_by: string | null
          id: string
          reason: string
          resolved: boolean | null
          session_id: string | null
          severity: string | null
          therapist_id: string | null
        }
        Insert: {
          admin_note?: string | null
          created_at?: string
          flagged_by?: string | null
          id?: string
          reason: string
          resolved?: boolean | null
          session_id?: string | null
          severity?: string | null
          therapist_id?: string | null
        }
        Update: {
          admin_note?: string | null
          created_at?: string
          flagged_by?: string | null
          id?: string
          reason?: string
          resolved?: boolean | null
          session_id?: string | null
          severity?: string | null
          therapist_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "therapist_safety_flags_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "therapy_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "therapist_safety_flags_therapist_id_fkey"
            columns: ["therapist_id"]
            isOneToOne: false
            referencedRelation: "therapists"
            referencedColumns: ["id"]
          },
        ]
      }
      therapists: {
        Row: {
          allowed_therapies: string[] | null
          certificate_number: string | null
          certificate_url: string | null
          certifying_body: string | null
          city: string | null
          created_at: string
          current_location_lat: number | null
          current_location_lng: number | null
          full_name: string
          gender: string | null
          id: string
          is_available: boolean | null
          is_banned: boolean
          is_suspended: boolean
          is_verified: boolean | null
          last_location_update: string | null
          phone: string
          photo_url: string | null
          rating: number | null
          rejection_reason: string | null
          state: string | null
          total_sessions: number | null
          updated_at: string
          user_id: string | null
          verification_status: string | null
          years_experience: number | null
        }
        Insert: {
          allowed_therapies?: string[] | null
          certificate_number?: string | null
          certificate_url?: string | null
          certifying_body?: string | null
          city?: string | null
          created_at?: string
          current_location_lat?: number | null
          current_location_lng?: number | null
          full_name: string
          gender?: string | null
          id?: string
          is_available?: boolean | null
          is_banned?: boolean
          is_suspended?: boolean
          is_verified?: boolean | null
          last_location_update?: string | null
          phone: string
          photo_url?: string | null
          rating?: number | null
          rejection_reason?: string | null
          state?: string | null
          total_sessions?: number | null
          updated_at?: string
          user_id?: string | null
          verification_status?: string | null
          years_experience?: number | null
        }
        Update: {
          allowed_therapies?: string[] | null
          certificate_number?: string | null
          certificate_url?: string | null
          certifying_body?: string | null
          city?: string | null
          created_at?: string
          current_location_lat?: number | null
          current_location_lng?: number | null
          full_name?: string
          gender?: string | null
          id?: string
          is_available?: boolean | null
          is_banned?: boolean
          is_suspended?: boolean
          is_verified?: boolean | null
          last_location_update?: string | null
          phone?: string
          photo_url?: string | null
          rating?: number | null
          rejection_reason?: string | null
          state?: string | null
          total_sessions?: number | null
          updated_at?: string
          user_id?: string | null
          verification_status?: string | null
          years_experience?: number | null
        }
        Relationships: []
      }
      therapy_bookings: {
        Row: {
          booking_date: string
          created_at: string
          id: string
          notes: string | null
          payment_status: string
          price: number
          razorpay_order_id: string | null
          razorpay_payment_id: string | null
          status: string
          therapy_id: string
          therapy_name: string
          time_slot: string
          updated_at: string
          user_id: string
        }
        Insert: {
          booking_date: string
          created_at?: string
          id?: string
          notes?: string | null
          payment_status?: string
          price: number
          razorpay_order_id?: string | null
          razorpay_payment_id?: string | null
          status?: string
          therapy_id: string
          therapy_name: string
          time_slot: string
          updated_at?: string
          user_id: string
        }
        Update: {
          booking_date?: string
          created_at?: string
          id?: string
          notes?: string | null
          payment_status?: string
          price?: number
          razorpay_order_id?: string | null
          razorpay_payment_id?: string | null
          status?: string
          therapy_id?: string
          therapy_name?: string
          time_slot?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "therapy_bookings_therapy_id_fkey"
            columns: ["therapy_id"]
            isOneToOne: false
            referencedRelation: "therapies"
            referencedColumns: ["id"]
          },
        ]
      }
      therapy_plans: {
        Row: {
          confirmed_at: string | null
          created_at: string
          doctor_user_id: string
          duration_days: number | null
          estimated_price: number | null
          id: string
          notes: string | null
          partner_id: string | null
          patient_id: string | null
          patient_name: string
          patient_phone: string | null
          patient_user_id: string | null
          payment_status: string
          planned_date: string | null
          status: string
          therapy_code: string | null
          therapy_name: string
          updated_at: string
        }
        Insert: {
          confirmed_at?: string | null
          created_at?: string
          doctor_user_id: string
          duration_days?: number | null
          estimated_price?: number | null
          id?: string
          notes?: string | null
          partner_id?: string | null
          patient_id?: string | null
          patient_name: string
          patient_phone?: string | null
          patient_user_id?: string | null
          payment_status?: string
          planned_date?: string | null
          status?: string
          therapy_code?: string | null
          therapy_name: string
          updated_at?: string
        }
        Update: {
          confirmed_at?: string | null
          created_at?: string
          doctor_user_id?: string
          duration_days?: number | null
          estimated_price?: number | null
          id?: string
          notes?: string | null
          partner_id?: string | null
          patient_id?: string | null
          patient_name?: string
          patient_phone?: string | null
          patient_user_id?: string | null
          payment_status?: string
          planned_date?: string | null
          status?: string
          therapy_code?: string | null
          therapy_name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "therapy_plans_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "network_partners"
            referencedColumns: ["id"]
          },
        ]
      }
      therapy_sessions: {
        Row: {
          actual_duration_minutes: number | null
          actual_end_time: string | null
          actual_start_time: string | null
          complaint_detail: string | null
          complaint_flag: boolean | null
          created_at: string
          doctor_referral_fee: number | null
          doctor_user_id: string | null
          duration_minutes: number
          id: string
          medicines_order_id: string | null
          medicines_prescribed: Json | null
          patient_name: string
          patient_phone: string | null
          patient_rating: number | null
          patient_review: string | null
          patient_user_id: string | null
          payment_status: string | null
          platform_fee: number | null
          prescribed_medicines: Json
          razorpay_order_id: string | null
          razorpay_payment_id: string | null
          scheduled_date: string
          scheduled_duration_minutes: number
          scheduled_end: string | null
          scheduled_start: string
          session_number: number | null
          status: string | null
          therapist_checkin_lat: number | null
          therapist_checkin_lng: number | null
          therapist_checkout_lat: number | null
          therapist_checkout_lng: number | null
          therapist_earnings: number | null
          therapist_id: string | null
          therapist_notes: string | null
          therapy_code: string
          therapy_name: string
          therapy_plan_id: string | null
          total_amount: number
          total_sessions_in_plan: number | null
          updated_at: string
          venue_earnings: number | null
          venue_id: string | null
          venue_room: string | null
        }
        Insert: {
          actual_duration_minutes?: number | null
          actual_end_time?: string | null
          actual_start_time?: string | null
          complaint_detail?: string | null
          complaint_flag?: boolean | null
          created_at?: string
          doctor_referral_fee?: number | null
          doctor_user_id?: string | null
          duration_minutes?: number
          id?: string
          medicines_order_id?: string | null
          medicines_prescribed?: Json | null
          patient_name: string
          patient_phone?: string | null
          patient_rating?: number | null
          patient_review?: string | null
          patient_user_id?: string | null
          payment_status?: string | null
          platform_fee?: number | null
          prescribed_medicines?: Json
          razorpay_order_id?: string | null
          razorpay_payment_id?: string | null
          scheduled_date: string
          scheduled_duration_minutes: number
          scheduled_end?: string | null
          scheduled_start: string
          session_number?: number | null
          status?: string | null
          therapist_checkin_lat?: number | null
          therapist_checkin_lng?: number | null
          therapist_checkout_lat?: number | null
          therapist_checkout_lng?: number | null
          therapist_earnings?: number | null
          therapist_id?: string | null
          therapist_notes?: string | null
          therapy_code: string
          therapy_name: string
          therapy_plan_id?: string | null
          total_amount?: number
          total_sessions_in_plan?: number | null
          updated_at?: string
          venue_earnings?: number | null
          venue_id?: string | null
          venue_room?: string | null
        }
        Update: {
          actual_duration_minutes?: number | null
          actual_end_time?: string | null
          actual_start_time?: string | null
          complaint_detail?: string | null
          complaint_flag?: boolean | null
          created_at?: string
          doctor_referral_fee?: number | null
          doctor_user_id?: string | null
          duration_minutes?: number
          id?: string
          medicines_order_id?: string | null
          medicines_prescribed?: Json | null
          patient_name?: string
          patient_phone?: string | null
          patient_rating?: number | null
          patient_review?: string | null
          patient_user_id?: string | null
          payment_status?: string | null
          platform_fee?: number | null
          prescribed_medicines?: Json
          razorpay_order_id?: string | null
          razorpay_payment_id?: string | null
          scheduled_date?: string
          scheduled_duration_minutes?: number
          scheduled_end?: string | null
          scheduled_start?: string
          session_number?: number | null
          status?: string | null
          therapist_checkin_lat?: number | null
          therapist_checkin_lng?: number | null
          therapist_checkout_lat?: number | null
          therapist_checkout_lng?: number | null
          therapist_earnings?: number | null
          therapist_id?: string | null
          therapist_notes?: string | null
          therapy_code?: string
          therapy_name?: string
          therapy_plan_id?: string | null
          total_amount?: number
          total_sessions_in_plan?: number | null
          updated_at?: string
          venue_earnings?: number | null
          venue_id?: string | null
          venue_room?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "therapy_sessions_medicines_order_id_fkey"
            columns: ["medicines_order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "therapy_sessions_therapist_id_fkey"
            columns: ["therapist_id"]
            isOneToOne: false
            referencedRelation: "therapists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "therapy_sessions_therapy_plan_id_fkey"
            columns: ["therapy_plan_id"]
            isOneToOne: false
            referencedRelation: "therapy_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "therapy_sessions_venue_id_fkey"
            columns: ["venue_id"]
            isOneToOne: false
            referencedRelation: "therapy_venues"
            referencedColumns: ["id"]
          },
        ]
      }
      therapy_venues: {
        Row: {
          address_line1: string
          available_therapies: string[] | null
          city: string
          contact_person: string | null
          created_at: string
          email: string | null
          gstin: string | null
          hourly_rate: number
          id: string
          is_active: boolean | null
          is_suspended: boolean
          is_verified: boolean | null
          lat: number | null
          latitude: number | null
          lng: number | null
          longitude: number | null
          name: string
          owner_user_id: string | null
          phone: string | null
          photo_urls: string[] | null
          photos: Json
          pincode: string
          rating: number | null
          registration_doc_url: string | null
          rooms: Json | null
          state: string
          type: string | null
          updated_at: string
        }
        Insert: {
          address_line1: string
          available_therapies?: string[] | null
          city: string
          contact_person?: string | null
          created_at?: string
          email?: string | null
          gstin?: string | null
          hourly_rate?: number
          id?: string
          is_active?: boolean | null
          is_suspended?: boolean
          is_verified?: boolean | null
          lat?: number | null
          latitude?: number | null
          lng?: number | null
          longitude?: number | null
          name: string
          owner_user_id?: string | null
          phone?: string | null
          photo_urls?: string[] | null
          photos?: Json
          pincode: string
          rating?: number | null
          registration_doc_url?: string | null
          rooms?: Json | null
          state: string
          type?: string | null
          updated_at?: string
        }
        Update: {
          address_line1?: string
          available_therapies?: string[] | null
          city?: string
          contact_person?: string | null
          created_at?: string
          email?: string | null
          gstin?: string | null
          hourly_rate?: number
          id?: string
          is_active?: boolean | null
          is_suspended?: boolean
          is_verified?: boolean | null
          lat?: number | null
          latitude?: number | null
          lng?: number | null
          longitude?: number | null
          name?: string
          owner_user_id?: string | null
          phone?: string | null
          photo_urls?: string[] | null
          photos?: Json
          pincode?: string
          rating?: number | null
          registration_doc_url?: string | null
          rooms?: Json | null
          state?: string
          type?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      treatment_kit_waitlist: {
        Row: {
          created_at: string | null
          email: string
          id: string
          kit_name: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          kit_name: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          kit_name?: string
          user_id?: string | null
        }
        Relationships: []
      }
      treatment_systems: {
        Row: {
          created_at: string
          description: string | null
          icon: string | null
          id: string
          is_published: boolean
          name: string
          slug: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          is_published?: boolean
          name: string
          slug: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          is_published?: boolean
          name?: string
          slug?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
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
      vaidya_bill_items: {
        Row: {
          bill_id: string
          created_at: string
          id: string
          inventory_id: string | null
          line_total: number
          medicine_name: string
          quantity: number
          unit_price: number
        }
        Insert: {
          bill_id: string
          created_at?: string
          id?: string
          inventory_id?: string | null
          line_total: number
          medicine_name: string
          quantity: number
          unit_price: number
        }
        Update: {
          bill_id?: string
          created_at?: string
          id?: string
          inventory_id?: string | null
          line_total?: number
          medicine_name?: string
          quantity?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "vaidya_bill_items_bill_id_fkey"
            columns: ["bill_id"]
            isOneToOne: false
            referencedRelation: "vaidya_bills"
            referencedColumns: ["id"]
          },
        ]
      }
      vaidya_bills: {
        Row: {
          bill_type: string
          created_at: string
          discount: number
          doctor_user_id: string
          id: string
          notes: string | null
          patient_id: string | null
          patient_name: string
          patient_phone: string | null
          payment_mode: string | null
          status: string
          subtotal: number
          total: number
          updated_at: string
        }
        Insert: {
          bill_type?: string
          created_at?: string
          discount?: number
          doctor_user_id: string
          id?: string
          notes?: string | null
          patient_id?: string | null
          patient_name: string
          patient_phone?: string | null
          payment_mode?: string | null
          status?: string
          subtotal?: number
          total?: number
          updated_at?: string
        }
        Update: {
          bill_type?: string
          created_at?: string
          discount?: number
          doctor_user_id?: string
          id?: string
          notes?: string | null
          patient_id?: string | null
          patient_name?: string
          patient_phone?: string | null
          payment_mode?: string | null
          status?: string
          subtotal?: number
          total?: number
          updated_at?: string
        }
        Relationships: []
      }
      vaidya_consultations: {
        Row: {
          abha_id: string | null
          advice: string | null
          ai_generated: boolean
          ai_model: string | null
          appointment_id: string | null
          assessment: string | null
          audio_url: string | null
          cds_suggestions: Json | null
          chief_complaint: string | null
          created_at: string
          diagnosis: string | null
          doctor_user_id: string
          examination: string | null
          fee: number
          follow_up_date: string | null
          history: string | null
          id: string
          notes: string | null
          patient_id: string | null
          plan: string | null
          prescription: string | null
          source_language: string | null
          transcript: string | null
          updated_at: string
          visit_date: string
          vitals: Json | null
        }
        Insert: {
          abha_id?: string | null
          advice?: string | null
          ai_generated?: boolean
          ai_model?: string | null
          appointment_id?: string | null
          assessment?: string | null
          audio_url?: string | null
          cds_suggestions?: Json | null
          chief_complaint?: string | null
          created_at?: string
          diagnosis?: string | null
          doctor_user_id: string
          examination?: string | null
          fee?: number
          follow_up_date?: string | null
          history?: string | null
          id?: string
          notes?: string | null
          patient_id?: string | null
          plan?: string | null
          prescription?: string | null
          source_language?: string | null
          transcript?: string | null
          updated_at?: string
          visit_date?: string
          vitals?: Json | null
        }
        Update: {
          abha_id?: string | null
          advice?: string | null
          ai_generated?: boolean
          ai_model?: string | null
          appointment_id?: string | null
          assessment?: string | null
          audio_url?: string | null
          cds_suggestions?: Json | null
          chief_complaint?: string | null
          created_at?: string
          diagnosis?: string | null
          doctor_user_id?: string
          examination?: string | null
          fee?: number
          follow_up_date?: string | null
          history?: string | null
          id?: string
          notes?: string | null
          patient_id?: string | null
          plan?: string | null
          prescription?: string | null
          source_language?: string | null
          transcript?: string | null
          updated_at?: string
          visit_date?: string
          vitals?: Json | null
        }
        Relationships: []
      }
      vaidya_inventory: {
        Row: {
          batch_no: string | null
          brand: string | null
          created_at: string
          doctor_user_id: string
          expiry_date: string | null
          id: string
          low_stock_threshold: number | null
          medicine_name: string
          mrp: number
          purchase_price: number
          quantity: number
          unit: string | null
          updated_at: string
        }
        Insert: {
          batch_no?: string | null
          brand?: string | null
          created_at?: string
          doctor_user_id: string
          expiry_date?: string | null
          id?: string
          low_stock_threshold?: number | null
          medicine_name: string
          mrp?: number
          purchase_price?: number
          quantity?: number
          unit?: string | null
          updated_at?: string
        }
        Update: {
          batch_no?: string | null
          brand?: string | null
          created_at?: string
          doctor_user_id?: string
          expiry_date?: string | null
          id?: string
          low_stock_threshold?: number | null
          medicine_name?: string
          mrp?: number
          purchase_price?: number
          quantity?: number
          unit?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      vaidya_leads: {
        Row: {
          call_type: string | null
          created_at: string
          doctor_user_id: string
          id: string
          lead_status: string
          name: string
          notes: string | null
          phone: string | null
          source: string | null
          updated_at: string
        }
        Insert: {
          call_type?: string | null
          created_at?: string
          doctor_user_id: string
          id?: string
          lead_status?: string
          name: string
          notes?: string | null
          phone?: string | null
          source?: string | null
          updated_at?: string
        }
        Update: {
          call_type?: string | null
          created_at?: string
          doctor_user_id?: string
          id?: string
          lead_status?: string
          name?: string
          notes?: string | null
          phone?: string | null
          source?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      vaidya_patients: {
        Row: {
          address: string | null
          age: number | null
          created_at: string
          doctor_user_id: string
          full_name: string
          gender: string | null
          id: string
          notes: string | null
          phone: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          age?: number | null
          created_at?: string
          doctor_user_id: string
          full_name: string
          gender?: string | null
          id?: string
          notes?: string | null
          phone?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          age?: number | null
          created_at?: string
          doctor_user_id?: string
          full_name?: string
          gender?: string | null
          id?: string
          notes?: string | null
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      venue_revenue_logs: {
        Row: {
          amount: number
          created_at: string
          id: string
          session_id: string | null
          type: string | null
          venue_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          session_id?: string | null
          type?: string | null
          venue_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          session_id?: string | null
          type?: string | null
          venue_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "venue_revenue_logs_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "therapy_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "venue_revenue_logs_venue_id_fkey"
            columns: ["venue_id"]
            isOneToOne: false
            referencedRelation: "therapy_venues"
            referencedColumns: ["id"]
          },
        ]
      }
      webinar_rsvps: {
        Row: {
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          user_id: string
          webinar_id: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          user_id: string
          webinar_id: string
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          user_id?: string
          webinar_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "webinar_rsvps_webinar_id_fkey"
            columns: ["webinar_id"]
            isOneToOne: false
            referencedRelation: "webinars"
            referencedColumns: ["id"]
          },
        ]
      }
      webinars: {
        Row: {
          category: string
          cover_image_url: string | null
          created_at: string
          description: string | null
          duration_minutes: number
          id: string
          is_published: boolean
          join_url: string
          recording_url: string | null
          rsvp_count: number
          scheduled_at: string
          speaker_avatar_url: string | null
          speaker_bio: string | null
          speaker_name: string
          title: string
          updated_at: string
        }
        Insert: {
          category?: string
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          duration_minutes?: number
          id?: string
          is_published?: boolean
          join_url: string
          recording_url?: string | null
          rsvp_count?: number
          scheduled_at: string
          speaker_avatar_url?: string | null
          speaker_bio?: string | null
          speaker_name: string
          title: string
          updated_at?: string
        }
        Update: {
          category?: string
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          duration_minutes?: number
          id?: string
          is_published?: boolean
          join_url?: string
          recording_url?: string | null
          rsvp_count?: number
          scheduled_at?: string
          speaker_avatar_url?: string | null
          speaker_bio?: string | null
          speaker_name?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      panchakarma_medicines: {
        Row: {
          ayush_system: string | null
          brand: string | null
          bulk_brand: string | null
          bulk_classical_type: string | null
          bulk_patented_type: string | null
          category: string | null
          created_at: string | null
          description: string | null
          discount_price: number | null
          dosage_form: string | null
          health_conditions: string[] | null
          id: string | null
          image_url: string | null
          is_bulk: boolean | null
          is_offers: boolean | null
          is_prescription_required: boolean | null
          is_surgical: boolean | null
          name: string | null
          offer_label: string | null
          price: number | null
          product_type: string | null
          rating: number | null
          stock: number | null
          surgical_category: string | null
          tags: string[] | null
          total_reviews: number | null
          treatment_use: string | null
          unit: string | null
        }
        Insert: {
          ayush_system?: string | null
          brand?: string | null
          bulk_brand?: string | null
          bulk_classical_type?: string | null
          bulk_patented_type?: string | null
          category?: string | null
          created_at?: string | null
          description?: string | null
          discount_price?: number | null
          dosage_form?: string | null
          health_conditions?: string[] | null
          id?: string | null
          image_url?: string | null
          is_bulk?: boolean | null
          is_offers?: boolean | null
          is_prescription_required?: boolean | null
          is_surgical?: boolean | null
          name?: string | null
          offer_label?: string | null
          price?: number | null
          product_type?: string | null
          rating?: number | null
          stock?: number | null
          surgical_category?: string | null
          tags?: string[] | null
          total_reviews?: number | null
          treatment_use?: string | null
          unit?: string | null
        }
        Update: {
          ayush_system?: string | null
          brand?: string | null
          bulk_brand?: string | null
          bulk_classical_type?: string | null
          bulk_patented_type?: string | null
          category?: string | null
          created_at?: string | null
          description?: string | null
          discount_price?: number | null
          dosage_form?: string | null
          health_conditions?: string[] | null
          id?: string | null
          image_url?: string | null
          is_bulk?: boolean | null
          is_offers?: boolean | null
          is_prescription_required?: boolean | null
          is_surgical?: boolean | null
          name?: string | null
          offer_label?: string | null
          price?: number | null
          product_type?: string | null
          rating?: number | null
          stock?: number | null
          surgical_category?: string | null
          tags?: string[] | null
          total_reviews?: number | null
          treatment_use?: string | null
          unit?: string | null
        }
        Relationships: []
      }
      surgical_products: {
        Row: {
          ayush_system: string | null
          brand: string | null
          bulk_brand: string | null
          bulk_classical_type: string | null
          bulk_patented_type: string | null
          category: string | null
          created_at: string | null
          description: string | null
          discount_price: number | null
          dosage_form: string | null
          health_conditions: string[] | null
          id: string | null
          image_url: string | null
          is_bulk: boolean | null
          is_offers: boolean | null
          is_prescription_required: boolean | null
          is_surgical: boolean | null
          name: string | null
          offer_label: string | null
          price: number | null
          product_type: string | null
          rating: number | null
          stock: number | null
          surgical_category: string | null
          tags: string[] | null
          total_reviews: number | null
          treatment_use: string | null
          unit: string | null
        }
        Insert: {
          ayush_system?: string | null
          brand?: string | null
          bulk_brand?: string | null
          bulk_classical_type?: string | null
          bulk_patented_type?: string | null
          category?: string | null
          created_at?: string | null
          description?: string | null
          discount_price?: number | null
          dosage_form?: string | null
          health_conditions?: string[] | null
          id?: string | null
          image_url?: string | null
          is_bulk?: boolean | null
          is_offers?: boolean | null
          is_prescription_required?: boolean | null
          is_surgical?: boolean | null
          name?: string | null
          offer_label?: string | null
          price?: number | null
          product_type?: string | null
          rating?: number | null
          stock?: number | null
          surgical_category?: string | null
          tags?: string[] | null
          total_reviews?: number | null
          treatment_use?: string | null
          unit?: string | null
        }
        Update: {
          ayush_system?: string | null
          brand?: string | null
          bulk_brand?: string | null
          bulk_classical_type?: string | null
          bulk_patented_type?: string | null
          category?: string | null
          created_at?: string | null
          description?: string | null
          discount_price?: number | null
          dosage_form?: string | null
          health_conditions?: string[] | null
          id?: string | null
          image_url?: string | null
          is_bulk?: boolean | null
          is_offers?: boolean | null
          is_prescription_required?: boolean | null
          is_surgical?: boolean | null
          name?: string | null
          offer_label?: string | null
          price?: number | null
          product_type?: string | null
          rating?: number | null
          stock?: number | null
          surgical_category?: string | null
          tags?: string[] | null
          total_reviews?: number | null
          treatment_use?: string | null
          unit?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      delete_email: {
        Args: { message_id: number; queue_name: string }
        Returns: boolean
      }
      enqueue_email: {
        Args: { payload: Json; queue_name: string }
        Returns: number
      }
      generate_referral_code: { Args: never; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      homeo_repertorize: {
        Args: { _symptom_ids: string[] }
        Returns: {
          abbreviation: string
          max_grade: number
          name: string
          remedy_id: string
          rubrics_covered: number
          total_score: number
        }[]
      }
      is_admin_or_super: { Args: { _user_id: string }; Returns: boolean }
      move_to_dlq: {
        Args: {
          dlq_name: string
          message_id: number
          payload: Json
          source_queue: string
        }
        Returns: number
      }
      read_email_batch: {
        Args: { batch_size: number; queue_name: string; vt: number }
        Returns: {
          message: Json
          msg_id: number
          read_ct: number
        }[]
      }
      repertorize_case: {
        Args: { _case_id: string }
        Returns: {
          abbreviation: string
          coverage_pct: number
          max_grade: number
          remedy_name: string
          rubrics_covered: number
          srp_hits: number
          total_rubrics: number
          total_score: number
        }[]
      }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
    }
    Enums: {
      app_role:
        | "admin"
        | "doctor"
        | "patient"
        | "therapist"
        | "provider"
        | "super_admin"
        | "student"
        | "venue_owner"
      ayuzee_txn_type:
        | "credit"
        | "cashback"
        | "redeem"
        | "expiry"
        | "refund_reversal"
        | "adjustment"
        | "referral_credit"
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
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
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
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
      app_role: [
        "admin",
        "doctor",
        "patient",
        "therapist",
        "provider",
        "super_admin",
        "student",
        "venue_owner",
      ],
      ayuzee_txn_type: [
        "credit",
        "cashback",
        "redeem",
        "expiry",
        "refund_reversal",
        "adjustment",
        "referral_credit",
      ],
    },
  },
} as const
