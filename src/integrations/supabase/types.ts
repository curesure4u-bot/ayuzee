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
      account_onboarding: {
        Row: {
          completed_at: string
          requested_role: string
          user_id: string
        }
        Insert: {
          completed_at?: string
          requested_role: string
          user_id: string
        }
        Update: {
          completed_at?: string
          requested_role?: string
          user_id?: string
        }
        Relationships: []
      }
      ai_feedback: {
        Row: {
          context: Json | null
          correction: string | null
          created_at: string | null
          feature: string
          id: string
          rating: number
          user_id: string | null
        }
        Insert: {
          context?: Json | null
          correction?: string | null
          created_at?: string | null
          feature: string
          id?: string
          rating: number
          user_id?: string | null
        }
        Update: {
          context?: Json | null
          correction?: string | null
          created_at?: string | null
          feature?: string
          id?: string
          rating?: number
          user_id?: string | null
        }
        Relationships: []
      }
      ai_usage_logs: {
        Row: {
          created_at: string | null
          feature_name: string
          id: string
          input_tokens: number | null
          model: string | null
          output_tokens: number | null
          tokens_used: number | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          feature_name: string
          id?: string
          input_tokens?: number | null
          model?: string | null
          output_tokens?: number | null
          tokens_used?: number | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          feature_name?: string
          id?: string
          input_tokens?: number | null
          model?: string | null
          output_tokens?: number | null
          tokens_used?: number | null
          user_id?: string | null
        }
        Relationships: []
      }
      appointments: {
        Row: {
          appointment_date: string
          created_at: string
          doctor_id: string | null
          fee: number
          id: string
          mode: string
          notes: string | null
          patient_name: string | null
          patient_phone: string | null
          status: string
          time_slot: string
          updated_at: string
          user_id: string
        }
        Insert: {
          appointment_date: string
          created_at?: string
          doctor_id?: string | null
          fee?: number
          id?: string
          mode?: string
          notes?: string | null
          patient_name?: string | null
          patient_phone?: string | null
          status?: string
          time_slot: string
          updated_at?: string
          user_id: string
        }
        Update: {
          appointment_date?: string
          created_at?: string
          doctor_id?: string | null
          fee?: number
          id?: string
          mode?: string
          notes?: string | null
          patient_name?: string | null
          patient_phone?: string | null
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
      article_comments: {
        Row: {
          article_id: string
          content: string
          created_at: string | null
          id: string
          like_count: number | null
          parent_id: string | null
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          article_id: string
          content: string
          created_at?: string | null
          id?: string
          like_count?: number | null
          parent_id?: string | null
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          article_id?: string
          content?: string
          created_at?: string | null
          id?: string
          like_count?: number | null
          parent_id?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "article_comments_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "doctor_articles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "article_comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "article_comments"
            referencedColumns: ["id"]
          },
        ]
      }
      article_interactions: {
        Row: {
          article_id: string
          created_at: string | null
          id: string
          interaction_type: string
          user_id: string
        }
        Insert: {
          article_id: string
          created_at?: string | null
          id?: string
          interaction_type: string
          user_id: string
        }
        Update: {
          article_id?: string
          created_at?: string | null
          id?: string
          interaction_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "article_interactions_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "doctor_articles"
            referencedColumns: ["id"]
          },
        ]
      }
      ayush_departments: {
        Row: {
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          sort_order: number | null
          system: string
        }
        Insert: {
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          sort_order?: number | null
          system: string
        }
        Update: {
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          sort_order?: number | null
          system?: string
        }
        Relationships: []
      }
      ayush_drug_interactions: {
        Row: {
          ayurvedic_reasoning: string | null
          created_at: string | null
          description: string
          drug_a: string
          drug_b: string
          id: string
          interaction_type: string
          is_verified: boolean | null
          recommendation: string | null
          severity: string | null
          source: string | null
        }
        Insert: {
          ayurvedic_reasoning?: string | null
          created_at?: string | null
          description: string
          drug_a: string
          drug_b: string
          id?: string
          interaction_type: string
          is_verified?: boolean | null
          recommendation?: string | null
          severity?: string | null
          source?: string | null
        }
        Update: {
          ayurvedic_reasoning?: string | null
          created_at?: string | null
          description?: string
          drug_a?: string
          drug_b?: string
          id?: string
          interaction_type?: string
          is_verified?: boolean | null
          recommendation?: string | null
          severity?: string | null
          source?: string | null
        }
        Relationships: []
      }
      ayuzee_hms_bridge: {
        Row: {
          ayuzee_id: string
          bridge_type: string
          created_at: string | null
          error_message: string | null
          hms_entity_type: string | null
          hms_id: string | null
          id: string
          last_synced_at: string | null
          metadata: Json | null
          sync_direction: string | null
          sync_status: string
          updated_at: string | null
        }
        Insert: {
          ayuzee_id: string
          bridge_type: string
          created_at?: string | null
          error_message?: string | null
          hms_entity_type?: string | null
          hms_id?: string | null
          id?: string
          last_synced_at?: string | null
          metadata?: Json | null
          sync_direction?: string | null
          sync_status?: string
          updated_at?: string | null
        }
        Update: {
          ayuzee_id?: string
          bridge_type?: string
          created_at?: string | null
          error_message?: string | null
          hms_entity_type?: string | null
          hms_id?: string | null
          id?: string
          last_synced_at?: string | null
          metadata?: Json | null
          sync_direction?: string | null
          sync_status?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      ayuzee_hms_bridge_config: {
        Row: {
          auto_push_prescription_to_shop: boolean | null
          auto_queue_online_bookings: boolean | null
          auto_trigger_review_after_visit: boolean | null
          clinic_id: string | null
          clinic_name: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          owner_id: string
          stock_visibility_public: boolean | null
          sync_appointments: boolean | null
          sync_lab_reports: boolean | null
          sync_patient_profiles: boolean | null
          sync_prescriptions: boolean | null
          sync_reviews: boolean | null
          sync_stock: boolean | null
          sync_treatment_outcomes: boolean | null
          updated_at: string | null
        }
        Insert: {
          auto_push_prescription_to_shop?: boolean | null
          auto_queue_online_bookings?: boolean | null
          auto_trigger_review_after_visit?: boolean | null
          clinic_id?: string | null
          clinic_name?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          owner_id: string
          stock_visibility_public?: boolean | null
          sync_appointments?: boolean | null
          sync_lab_reports?: boolean | null
          sync_patient_profiles?: boolean | null
          sync_prescriptions?: boolean | null
          sync_reviews?: boolean | null
          sync_stock?: boolean | null
          sync_treatment_outcomes?: boolean | null
          updated_at?: string | null
        }
        Update: {
          auto_push_prescription_to_shop?: boolean | null
          auto_queue_online_bookings?: boolean | null
          auto_trigger_review_after_visit?: boolean | null
          clinic_id?: string | null
          clinic_name?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          owner_id?: string
          stock_visibility_public?: boolean | null
          sync_appointments?: boolean | null
          sync_lab_reports?: boolean | null
          sync_patient_profiles?: boolean | null
          sync_prescriptions?: boolean | null
          sync_reviews?: boolean | null
          sync_stock?: boolean | null
          sync_treatment_outcomes?: boolean | null
          updated_at?: string | null
        }
        Relationships: []
      }
      ayuzee_hms_sync_log: {
        Row: {
          bridge_id: string | null
          created_at: string | null
          entity_id: string | null
          entity_type: string
          error_message: string | null
          id: string
          operation: string
          payload: Json | null
          performed_by: string | null
          source_system: string
          status: string
          target_system: string
        }
        Insert: {
          bridge_id?: string | null
          created_at?: string | null
          entity_id?: string | null
          entity_type: string
          error_message?: string | null
          id?: string
          operation: string
          payload?: Json | null
          performed_by?: string | null
          source_system: string
          status?: string
          target_system: string
        }
        Update: {
          bridge_id?: string | null
          created_at?: string | null
          entity_id?: string | null
          entity_type?: string
          error_message?: string | null
          id?: string
          operation?: string
          payload?: Json | null
          performed_by?: string | null
          source_system?: string
          status?: string
          target_system?: string
        }
        Relationships: [
          {
            foreignKeyName: "ayuzee_hms_sync_log_bridge_id_fkey"
            columns: ["bridge_id"]
            isOneToOne: false
            referencedRelation: "ayuzee_hms_bridge"
            referencedColumns: ["id"]
          },
        ]
      }
      beyond_academy_certificates: {
        Row: {
          certificate_number: string
          course_id: string
          course_title: string
          grade: string | null
          holder_name: string
          id: string
          instructor_name: string
          issued_at: string | null
          user_id: string
        }
        Insert: {
          certificate_number: string
          course_id: string
          course_title: string
          grade?: string | null
          holder_name: string
          id?: string
          instructor_name: string
          issued_at?: string | null
          user_id: string
        }
        Update: {
          certificate_number?: string
          course_id?: string
          course_title?: string
          grade?: string | null
          holder_name?: string
          id?: string
          instructor_name?: string
          issued_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "beyond_academy_certificates_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "beyond_academy_courses"
            referencedColumns: ["id"]
          },
        ]
      }
      beyond_academy_courses: {
        Row: {
          badge_on_complete: string | null
          category: string
          coin_reward: number | null
          created_at: string | null
          description: string
          difficulty: string
          drip_enabled: boolean | null
          drip_interval_days: number | null
          estimated_hours: number | null
          id: string
          instructor_avatar: string | null
          instructor_name: string
          is_free: boolean | null
          is_published: boolean | null
          price_inr: number | null
          subtitle: string | null
          tags: string[] | null
          thumbnail_url: string | null
          title: string
          total_lessons: number | null
          total_quizzes: number | null
          updated_at: string | null
          xp_reward: number | null
        }
        Insert: {
          badge_on_complete?: string | null
          category?: string
          coin_reward?: number | null
          created_at?: string | null
          description: string
          difficulty?: string
          drip_enabled?: boolean | null
          drip_interval_days?: number | null
          estimated_hours?: number | null
          id?: string
          instructor_avatar?: string | null
          instructor_name?: string
          is_free?: boolean | null
          is_published?: boolean | null
          price_inr?: number | null
          subtitle?: string | null
          tags?: string[] | null
          thumbnail_url?: string | null
          title: string
          total_lessons?: number | null
          total_quizzes?: number | null
          updated_at?: string | null
          xp_reward?: number | null
        }
        Update: {
          badge_on_complete?: string | null
          category?: string
          coin_reward?: number | null
          created_at?: string | null
          description?: string
          difficulty?: string
          drip_enabled?: boolean | null
          drip_interval_days?: number | null
          estimated_hours?: number | null
          id?: string
          instructor_avatar?: string | null
          instructor_name?: string
          is_free?: boolean | null
          is_published?: boolean | null
          price_inr?: number | null
          subtitle?: string | null
          tags?: string[] | null
          thumbnail_url?: string | null
          title?: string
          total_lessons?: number | null
          total_quizzes?: number | null
          updated_at?: string | null
          xp_reward?: number | null
        }
        Relationships: []
      }
      beyond_academy_enrollments: {
        Row: {
          completed_at: string | null
          course_id: string
          enrolled_at: string | null
          id: string
          last_accessed_at: string | null
          lessons_completed: number | null
          progress_pct: number | null
          quizzes_passed: number | null
          status: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          course_id: string
          enrolled_at?: string | null
          id?: string
          last_accessed_at?: string | null
          lessons_completed?: number | null
          progress_pct?: number | null
          quizzes_passed?: number | null
          status?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          course_id?: string
          enrolled_at?: string | null
          id?: string
          last_accessed_at?: string | null
          lessons_completed?: number | null
          progress_pct?: number | null
          quizzes_passed?: number | null
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "beyond_academy_enrollments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "beyond_academy_courses"
            referencedColumns: ["id"]
          },
        ]
      }
      beyond_academy_lesson_progress: {
        Row: {
          completed_at: string | null
          course_id: string
          created_at: string | null
          id: string
          lesson_id: string
          notes: string | null
          status: string
          user_id: string
          watch_time_seconds: number | null
        }
        Insert: {
          completed_at?: string | null
          course_id: string
          created_at?: string | null
          id?: string
          lesson_id: string
          notes?: string | null
          status?: string
          user_id: string
          watch_time_seconds?: number | null
        }
        Update: {
          completed_at?: string | null
          course_id?: string
          created_at?: string | null
          id?: string
          lesson_id?: string
          notes?: string | null
          status?: string
          user_id?: string
          watch_time_seconds?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "beyond_academy_lesson_progress_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "beyond_academy_courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "beyond_academy_lesson_progress_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "beyond_academy_lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      beyond_academy_lessons: {
        Row: {
          assignment_text: string | null
          audio_url: string | null
          content_html: string | null
          course_id: string
          created_at: string | null
          description: string | null
          drip_day: number | null
          duration_minutes: number | null
          id: string
          is_free_preview: boolean | null
          lesson_type: string
          pdf_url: string | null
          sort_order: number
          title: string
          updated_at: string | null
          video_url: string | null
          xp_reward: number | null
        }
        Insert: {
          assignment_text?: string | null
          audio_url?: string | null
          content_html?: string | null
          course_id: string
          created_at?: string | null
          description?: string | null
          drip_day?: number | null
          duration_minutes?: number | null
          id?: string
          is_free_preview?: boolean | null
          lesson_type?: string
          pdf_url?: string | null
          sort_order?: number
          title: string
          updated_at?: string | null
          video_url?: string | null
          xp_reward?: number | null
        }
        Update: {
          assignment_text?: string | null
          audio_url?: string | null
          content_html?: string | null
          course_id?: string
          created_at?: string | null
          description?: string | null
          drip_day?: number | null
          duration_minutes?: number | null
          id?: string
          is_free_preview?: boolean | null
          lesson_type?: string
          pdf_url?: string | null
          sort_order?: number
          title?: string
          updated_at?: string | null
          video_url?: string | null
          xp_reward?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "beyond_academy_lessons_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "beyond_academy_courses"
            referencedColumns: ["id"]
          },
        ]
      }
      beyond_academy_quiz_attempts: {
        Row: {
          answers: Json | null
          attempted_at: string | null
          id: string
          passed: boolean | null
          percentage: number
          quiz_id: string
          score: number
          time_taken_seconds: number | null
          total_points: number
          user_id: string
        }
        Insert: {
          answers?: Json | null
          attempted_at?: string | null
          id?: string
          passed?: boolean | null
          percentage?: number
          quiz_id: string
          score?: number
          time_taken_seconds?: number | null
          total_points?: number
          user_id: string
        }
        Update: {
          answers?: Json | null
          attempted_at?: string | null
          id?: string
          passed?: boolean | null
          percentage?: number
          quiz_id?: string
          score?: number
          time_taken_seconds?: number | null
          total_points?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "beyond_academy_quiz_attempts_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "beyond_academy_quizzes"
            referencedColumns: ["id"]
          },
        ]
      }
      beyond_academy_quiz_questions: {
        Row: {
          correct_answer: string
          created_at: string | null
          explanation: string | null
          id: string
          options: Json | null
          points: number | null
          question_text: string
          question_type: string
          quiz_id: string
          sort_order: number | null
        }
        Insert: {
          correct_answer: string
          created_at?: string | null
          explanation?: string | null
          id?: string
          options?: Json | null
          points?: number | null
          question_text: string
          question_type?: string
          quiz_id: string
          sort_order?: number | null
        }
        Update: {
          correct_answer?: string
          created_at?: string | null
          explanation?: string | null
          id?: string
          options?: Json | null
          points?: number | null
          question_text?: string
          question_type?: string
          quiz_id?: string
          sort_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "beyond_academy_quiz_questions_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "beyond_academy_quizzes"
            referencedColumns: ["id"]
          },
        ]
      }
      beyond_academy_quizzes: {
        Row: {
          course_id: string
          created_at: string | null
          description: string | null
          id: string
          lesson_id: string | null
          max_attempts: number | null
          passing_score: number
          sort_order: number | null
          time_limit_minutes: number | null
          title: string
          xp_reward: number | null
        }
        Insert: {
          course_id: string
          created_at?: string | null
          description?: string | null
          id?: string
          lesson_id?: string | null
          max_attempts?: number | null
          passing_score?: number
          sort_order?: number | null
          time_limit_minutes?: number | null
          title: string
          xp_reward?: number | null
        }
        Update: {
          course_id?: string
          created_at?: string | null
          description?: string | null
          id?: string
          lesson_id?: string | null
          max_attempts?: number | null
          passing_score?: number
          sort_order?: number | null
          time_limit_minutes?: number | null
          title?: string
          xp_reward?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "beyond_academy_quizzes_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "beyond_academy_courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "beyond_academy_quizzes_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "beyond_academy_lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      beyond_badges_catalog: {
        Row: {
          category: string
          coin_reward: number
          created_at: string | null
          criteria: Json
          description: string
          icon_name: string
          id: string
          name: string
          rarity: string
          xp_reward: number
        }
        Insert: {
          category: string
          coin_reward?: number
          created_at?: string | null
          criteria?: Json
          description: string
          icon_name?: string
          id?: string
          name: string
          rarity?: string
          xp_reward?: number
        }
        Update: {
          category?: string
          coin_reward?: number
          created_at?: string | null
          criteria?: Json
          description?: string
          icon_name?: string
          id?: string
          name?: string
          rarity?: string
          xp_reward?: number
        }
        Relationships: []
      }
      beyond_books: {
        Row: {
          applicable_spokes: string[] | null
          apply_it_challenge: string | null
          author: string
          buy_link: string | null
          career_stages: string[] | null
          category: string
          cover_url: string | null
          created_at: string | null
          id: string
          is_published: boolean | null
          key_takeaways: string[] | null
          rating: number | null
          review_count: number | null
          summary_full: string | null
          summary_short: string
          title: string
        }
        Insert: {
          applicable_spokes?: string[] | null
          apply_it_challenge?: string | null
          author: string
          buy_link?: string | null
          career_stages?: string[] | null
          category: string
          cover_url?: string | null
          created_at?: string | null
          id?: string
          is_published?: boolean | null
          key_takeaways?: string[] | null
          rating?: number | null
          review_count?: number | null
          summary_full?: string | null
          summary_short: string
          title: string
        }
        Update: {
          applicable_spokes?: string[] | null
          apply_it_challenge?: string | null
          author?: string
          buy_link?: string | null
          career_stages?: string[] | null
          category?: string
          cover_url?: string | null
          created_at?: string | null
          id?: string
          is_published?: boolean | null
          key_takeaways?: string[] | null
          rating?: number | null
          review_count?: number | null
          summary_full?: string | null
          summary_short?: string
          title?: string
        }
        Relationships: []
      }
      beyond_breathing_sessions: {
        Row: {
          completed: boolean | null
          created_at: string | null
          date: string
          duration_seconds: number
          id: string
          type: string
          user_id: string
        }
        Insert: {
          completed?: boolean | null
          created_at?: string | null
          date?: string
          duration_seconds: number
          id?: string
          type: string
          user_id: string
        }
        Update: {
          completed?: boolean | null
          created_at?: string | null
          date?: string
          duration_seconds?: number
          id?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      beyond_bucket_list_items: {
        Row: {
          category: string
          celebration_note: string | null
          completed_at: string | null
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          is_completed: boolean
          item_number: number
          sag_claimed: boolean
          sag_claimed_at: string | null
          sag_planned: string | null
          target_date: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: string
          celebration_note?: string | null
          completed_at?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_completed?: boolean
          item_number: number
          sag_claimed?: boolean
          sag_claimed_at?: string | null
          sag_planned?: string | null
          target_date?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string
          celebration_note?: string | null
          completed_at?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_completed?: boolean
          item_number?: number
          sag_claimed?: boolean
          sag_claimed_at?: string | null
          sag_planned?: string | null
          target_date?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      beyond_burnout_assessments: {
        Row: {
          assessed_at: string | null
          cynicism_score: number
          exhaustion_score: number
          id: string
          inefficacy_score: number
          notes: string | null
          risk_level: string | null
          total_score: number | null
          user_id: string
        }
        Insert: {
          assessed_at?: string | null
          cynicism_score: number
          exhaustion_score: number
          id?: string
          inefficacy_score: number
          notes?: string | null
          risk_level?: string | null
          total_score?: number | null
          user_id: string
        }
        Update: {
          assessed_at?: string | null
          cynicism_score?: number
          exhaustion_score?: number
          id?: string
          inefficacy_score?: number
          notes?: string | null
          risk_level?: string | null
          total_score?: number | null
          user_id?: string
        }
        Relationships: []
      }
      beyond_celebration_log: {
        Row: {
          celebrated_at: string
          celebration_note: string | null
          id: string
          sag_description: string | null
          source_id: string
          source_type: string
          title: string
          user_id: string
          xp_earned: number
        }
        Insert: {
          celebrated_at?: string
          celebration_note?: string | null
          id?: string
          sag_description?: string | null
          source_id: string
          source_type: string
          title: string
          user_id: string
          xp_earned?: number
        }
        Update: {
          celebrated_at?: string
          celebration_note?: string | null
          id?: string
          sag_description?: string | null
          source_id?: string
          source_type?: string
          title?: string
          user_id?: string
          xp_earned?: number
        }
        Relationships: []
      }
      beyond_challenges: {
        Row: {
          badge_reward_id: string | null
          category: string
          coin_reward: number
          created_at: string | null
          criteria: Json
          description: string
          ends_at: string | null
          id: string
          is_active: boolean | null
          starts_at: string | null
          title: string
          type: string
          xp_reward: number
        }
        Insert: {
          badge_reward_id?: string | null
          category?: string
          coin_reward?: number
          created_at?: string | null
          criteria?: Json
          description: string
          ends_at?: string | null
          id?: string
          is_active?: boolean | null
          starts_at?: string | null
          title: string
          type: string
          xp_reward?: number
        }
        Update: {
          badge_reward_id?: string | null
          category?: string
          coin_reward?: number
          created_at?: string | null
          criteria?: Json
          description?: string
          ends_at?: string | null
          id?: string
          is_active?: boolean | null
          starts_at?: string | null
          title?: string
          type?: string
          xp_reward?: number
        }
        Relationships: [
          {
            foreignKeyName: "beyond_challenges_badge_reward_id_fkey"
            columns: ["badge_reward_id"]
            isOneToOne: false
            referencedRelation: "beyond_badges_catalog"
            referencedColumns: ["id"]
          },
        ]
      }
      beyond_coaching_attendance: {
        Row: {
          attended: boolean | null
          id: string
          marked_at: string | null
          session_id: string
          user_id: string
        }
        Insert: {
          attended?: boolean | null
          id?: string
          marked_at?: string | null
          session_id: string
          user_id: string
        }
        Update: {
          attended?: boolean | null
          id?: string
          marked_at?: string | null
          session_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "beyond_coaching_attendance_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "beyond_coaching_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      beyond_coaching_cohorts: {
        Row: {
          badge_on_complete: string | null
          coach_avatar: string | null
          coach_name: string
          created_at: string | null
          current_members: number | null
          description: string
          duration_weeks: number
          ends_at: string | null
          id: string
          is_published: boolean | null
          max_members: number | null
          meeting_link: string | null
          schedule_summary: string | null
          session_day: string | null
          session_time: string | null
          starts_at: string
          status: string
          tier: string
          title: string
          updated_at: string | null
          what_you_get: string[] | null
          xp_reward: number | null
        }
        Insert: {
          badge_on_complete?: string | null
          coach_avatar?: string | null
          coach_name?: string
          created_at?: string | null
          current_members?: number | null
          description: string
          duration_weeks?: number
          ends_at?: string | null
          id?: string
          is_published?: boolean | null
          max_members?: number | null
          meeting_link?: string | null
          schedule_summary?: string | null
          session_day?: string | null
          session_time?: string | null
          starts_at: string
          status?: string
          tier?: string
          title: string
          updated_at?: string | null
          what_you_get?: string[] | null
          xp_reward?: number | null
        }
        Update: {
          badge_on_complete?: string | null
          coach_avatar?: string | null
          coach_name?: string
          created_at?: string | null
          current_members?: number | null
          description?: string
          duration_weeks?: number
          ends_at?: string | null
          id?: string
          is_published?: boolean | null
          max_members?: number | null
          meeting_link?: string | null
          schedule_summary?: string | null
          session_day?: string | null
          session_time?: string | null
          starts_at?: string
          status?: string
          tier?: string
          title?: string
          updated_at?: string | null
          what_you_get?: string[] | null
          xp_reward?: number | null
        }
        Relationships: []
      }
      beyond_coaching_homework: {
        Row: {
          cohort_id: string
          created_at: string | null
          description: string
          due_date: string | null
          id: string
          session_id: string | null
          sort_order: number | null
          title: string
          week_number: number | null
          xp_reward: number | null
        }
        Insert: {
          cohort_id: string
          created_at?: string | null
          description: string
          due_date?: string | null
          id?: string
          session_id?: string | null
          sort_order?: number | null
          title: string
          week_number?: number | null
          xp_reward?: number | null
        }
        Update: {
          cohort_id?: string
          created_at?: string | null
          description?: string
          due_date?: string | null
          id?: string
          session_id?: string | null
          sort_order?: number | null
          title?: string
          week_number?: number | null
          xp_reward?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "beyond_coaching_homework_cohort_id_fkey"
            columns: ["cohort_id"]
            isOneToOne: false
            referencedRelation: "beyond_coaching_cohorts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "beyond_coaching_homework_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "beyond_coaching_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      beyond_coaching_members: {
        Row: {
          accountability_score: number | null
          cohort_id: string
          completed_at: string | null
          homework_completed: number | null
          id: string
          joined_at: string | null
          notes: string | null
          sessions_attended: number | null
          status: string
          user_id: string
        }
        Insert: {
          accountability_score?: number | null
          cohort_id: string
          completed_at?: string | null
          homework_completed?: number | null
          id?: string
          joined_at?: string | null
          notes?: string | null
          sessions_attended?: number | null
          status?: string
          user_id: string
        }
        Update: {
          accountability_score?: number | null
          cohort_id?: string
          completed_at?: string | null
          homework_completed?: number | null
          id?: string
          joined_at?: string | null
          notes?: string | null
          sessions_attended?: number | null
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "beyond_coaching_members_cohort_id_fkey"
            columns: ["cohort_id"]
            isOneToOne: false
            referencedRelation: "beyond_coaching_cohorts"
            referencedColumns: ["id"]
          },
        ]
      }
      beyond_coaching_sessions: {
        Row: {
          cohort_id: string
          created_at: string | null
          description: string | null
          duration_minutes: number | null
          id: string
          meeting_link: string | null
          notes: string | null
          recording_url: string | null
          scheduled_at: string
          session_number: number
          status: string
          title: string
        }
        Insert: {
          cohort_id: string
          created_at?: string | null
          description?: string | null
          duration_minutes?: number | null
          id?: string
          meeting_link?: string | null
          notes?: string | null
          recording_url?: string | null
          scheduled_at: string
          session_number: number
          status?: string
          title: string
        }
        Update: {
          cohort_id?: string
          created_at?: string | null
          description?: string | null
          duration_minutes?: number | null
          id?: string
          meeting_link?: string | null
          notes?: string | null
          recording_url?: string | null
          scheduled_at?: string
          session_number?: number
          status?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "beyond_coaching_sessions_cohort_id_fkey"
            columns: ["cohort_id"]
            isOneToOne: false
            referencedRelation: "beyond_coaching_cohorts"
            referencedColumns: ["id"]
          },
        ]
      }
      beyond_coaching_submissions: {
        Row: {
          coach_feedback: string | null
          file_url: string | null
          homework_id: string
          id: string
          reviewed_at: string | null
          status: string
          submission_text: string | null
          submitted_at: string | null
          user_id: string
        }
        Insert: {
          coach_feedback?: string | null
          file_url?: string | null
          homework_id: string
          id?: string
          reviewed_at?: string | null
          status?: string
          submission_text?: string | null
          submitted_at?: string | null
          user_id: string
        }
        Update: {
          coach_feedback?: string | null
          file_url?: string | null
          homework_id?: string
          id?: string
          reviewed_at?: string | null
          status?: string
          submission_text?: string | null
          submitted_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "beyond_coaching_submissions_homework_id_fkey"
            columns: ["homework_id"]
            isOneToOne: false
            referencedRelation: "beyond_coaching_homework"
            referencedColumns: ["id"]
          },
        ]
      }
      beyond_coin_balance: {
        Row: {
          balance: number
          id: string
          lifetime_earned: number
          lifetime_spent: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          balance?: number
          id?: string
          lifetime_earned?: number
          lifetime_spent?: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          balance?: number
          id?: string
          lifetime_earned?: number
          lifetime_spent?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      beyond_coin_transactions: {
        Row: {
          amount: number
          created_at: string | null
          description: string | null
          id: string
          source: string
          type: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          description?: string | null
          id?: string
          source: string
          type: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          description?: string | null
          id?: string
          source?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      beyond_community_posts: {
        Row: {
          author_name: string
          content: string
          created_at: string | null
          id: string
          is_pinned: boolean | null
          reply_count: number
          tags: string[] | null
          title: string
          type: string
          upvotes: number
          user_id: string
        }
        Insert: {
          author_name?: string
          content: string
          created_at?: string | null
          id?: string
          is_pinned?: boolean | null
          reply_count?: number
          tags?: string[] | null
          title: string
          type?: string
          upvotes?: number
          user_id: string
        }
        Update: {
          author_name?: string
          content?: string
          created_at?: string | null
          id?: string
          is_pinned?: boolean | null
          reply_count?: number
          tags?: string[] | null
          title?: string
          type?: string
          upvotes?: number
          user_id?: string
        }
        Relationships: []
      }
      beyond_community_replies: {
        Row: {
          author_name: string
          content: string
          created_at: string | null
          id: string
          post_id: string
          upvotes: number
          user_id: string
        }
        Insert: {
          author_name?: string
          content: string
          created_at?: string | null
          id?: string
          post_id: string
          upvotes?: number
          user_id: string
        }
        Update: {
          author_name?: string
          content?: string
          created_at?: string | null
          id?: string
          post_id?: string
          upvotes?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "beyond_community_replies_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "beyond_community_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      beyond_digital_products: {
        Row: {
          author_name: string
          category: string
          created_at: string | null
          description: string
          download_count: number | null
          file_size_kb: number | null
          file_url: string
          id: string
          is_featured: boolean | null
          is_free: boolean | null
          is_published: boolean | null
          preview_url: string | null
          price_coins: number | null
          product_type: string
          rating_avg: number | null
          rating_count: number | null
          subtitle: string | null
          tags: string[] | null
          thumbnail_url: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          author_name?: string
          category?: string
          created_at?: string | null
          description: string
          download_count?: number | null
          file_size_kb?: number | null
          file_url: string
          id?: string
          is_featured?: boolean | null
          is_free?: boolean | null
          is_published?: boolean | null
          preview_url?: string | null
          price_coins?: number | null
          product_type?: string
          rating_avg?: number | null
          rating_count?: number | null
          subtitle?: string | null
          tags?: string[] | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          author_name?: string
          category?: string
          created_at?: string | null
          description?: string
          download_count?: number | null
          file_size_kb?: number | null
          file_url?: string
          id?: string
          is_featured?: boolean | null
          is_free?: boolean | null
          is_published?: boolean | null
          preview_url?: string | null
          price_coins?: number | null
          product_type?: string
          rating_avg?: number | null
          rating_count?: number | null
          subtitle?: string | null
          tags?: string[] | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      beyond_digital_purchases: {
        Row: {
          coins_spent: number | null
          download_count: number | null
          id: string
          last_downloaded_at: string | null
          product_id: string
          purchased_at: string | null
          user_id: string
        }
        Insert: {
          coins_spent?: number | null
          download_count?: number | null
          id?: string
          last_downloaded_at?: string | null
          product_id: string
          purchased_at?: string | null
          user_id: string
        }
        Update: {
          coins_spent?: number | null
          download_count?: number | null
          id?: string
          last_downloaded_at?: string | null
          product_id?: string
          purchased_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "beyond_digital_purchases_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "beyond_digital_products"
            referencedColumns: ["id"]
          },
        ]
      }
      beyond_digital_reviews: {
        Row: {
          created_at: string | null
          id: string
          product_id: string
          rating: number
          review_text: string | null
          reviewer_name: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          product_id: string
          rating: number
          review_text?: string | null
          reviewer_name?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          product_id?: string
          rating?: number
          review_text?: string | null
          reviewer_name?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "beyond_digital_reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "beyond_digital_products"
            referencedColumns: ["id"]
          },
        ]
      }
      beyond_energy_logs: {
        Row: {
          activity_at_time: string | null
          created_at: string | null
          date: string
          energy_level: number
          hour_of_day: number
          id: string
          user_id: string
        }
        Insert: {
          activity_at_time?: string | null
          created_at?: string | null
          date?: string
          energy_level: number
          hour_of_day: number
          id?: string
          user_id: string
        }
        Update: {
          activity_at_time?: string | null
          created_at?: string | null
          date?: string
          energy_level?: number
          hour_of_day?: number
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      beyond_event_qa: {
        Row: {
          answer: string | null
          answered_at: string | null
          answered_by: string | null
          asked_at: string | null
          event_id: string
          id: string
          is_pinned: boolean | null
          question: string
          upvotes: number | null
          user_id: string
        }
        Insert: {
          answer?: string | null
          answered_at?: string | null
          answered_by?: string | null
          asked_at?: string | null
          event_id: string
          id?: string
          is_pinned?: boolean | null
          question: string
          upvotes?: number | null
          user_id: string
        }
        Update: {
          answer?: string | null
          answered_at?: string | null
          answered_by?: string | null
          asked_at?: string | null
          event_id?: string
          id?: string
          is_pinned?: boolean | null
          question?: string
          upvotes?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "beyond_event_qa_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "beyond_events"
            referencedColumns: ["id"]
          },
        ]
      }
      beyond_event_registrations: {
        Row: {
          attended_at: string | null
          event_id: string
          feedback_rating: number | null
          feedback_text: string | null
          id: string
          registered_at: string | null
          status: string
          user_id: string
          watch_duration_minutes: number | null
        }
        Insert: {
          attended_at?: string | null
          event_id: string
          feedback_rating?: number | null
          feedback_text?: string | null
          id?: string
          registered_at?: string | null
          status?: string
          user_id: string
          watch_duration_minutes?: number | null
        }
        Update: {
          attended_at?: string | null
          event_id?: string
          feedback_rating?: number | null
          feedback_text?: string | null
          id?: string
          registered_at?: string | null
          status?: string
          user_id?: string
          watch_duration_minutes?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "beyond_event_registrations_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "beyond_events"
            referencedColumns: ["id"]
          },
        ]
      }
      beyond_event_resources: {
        Row: {
          created_at: string | null
          description: string | null
          event_id: string
          external_url: string | null
          file_url: string | null
          id: string
          resource_type: string
          sort_order: number | null
          title: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          event_id: string
          external_url?: string | null
          file_url?: string | null
          id?: string
          resource_type?: string
          sort_order?: number | null
          title: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          event_id?: string
          external_url?: string | null
          file_url?: string | null
          id?: string
          resource_type?: string
          sort_order?: number | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "beyond_event_resources_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "beyond_events"
            referencedColumns: ["id"]
          },
        ]
      }
      beyond_events: {
        Row: {
          category: string
          created_at: string | null
          cta_button_text: string | null
          cta_description: string | null
          cta_enabled: boolean | null
          cta_link: string | null
          cta_title: string | null
          description: string
          duration_minutes: number | null
          ends_at: string | null
          event_type: string
          guest_speakers: string[] | null
          host_avatar: string | null
          host_name: string
          id: string
          is_free: boolean | null
          is_published: boolean | null
          live_url: string | null
          max_attendees: number | null
          meeting_id: string | null
          meeting_password: string | null
          price_inr: number | null
          registration_count: number | null
          replay_available: boolean | null
          replay_expires_at: string | null
          replay_url: string | null
          starts_at: string
          status: string
          subtitle: string | null
          tags: string[] | null
          thumbnail_url: string | null
          timezone: string | null
          title: string
          updated_at: string | null
          xp_reward: number | null
        }
        Insert: {
          category?: string
          created_at?: string | null
          cta_button_text?: string | null
          cta_description?: string | null
          cta_enabled?: boolean | null
          cta_link?: string | null
          cta_title?: string | null
          description: string
          duration_minutes?: number | null
          ends_at?: string | null
          event_type?: string
          guest_speakers?: string[] | null
          host_avatar?: string | null
          host_name?: string
          id?: string
          is_free?: boolean | null
          is_published?: boolean | null
          live_url?: string | null
          max_attendees?: number | null
          meeting_id?: string | null
          meeting_password?: string | null
          price_inr?: number | null
          registration_count?: number | null
          replay_available?: boolean | null
          replay_expires_at?: string | null
          replay_url?: string | null
          starts_at: string
          status?: string
          subtitle?: string | null
          tags?: string[] | null
          thumbnail_url?: string | null
          timezone?: string | null
          title: string
          updated_at?: string | null
          xp_reward?: number | null
        }
        Update: {
          category?: string
          created_at?: string | null
          cta_button_text?: string | null
          cta_description?: string | null
          cta_enabled?: boolean | null
          cta_link?: string | null
          cta_title?: string | null
          description?: string
          duration_minutes?: number | null
          ends_at?: string | null
          event_type?: string
          guest_speakers?: string[] | null
          host_avatar?: string | null
          host_name?: string
          id?: string
          is_free?: boolean | null
          is_published?: boolean | null
          live_url?: string | null
          max_attendees?: number | null
          meeting_id?: string | null
          meeting_password?: string | null
          price_inr?: number | null
          registration_count?: number | null
          replay_available?: boolean | null
          replay_expires_at?: string | null
          replay_url?: string | null
          starts_at?: string
          status?: string
          subtitle?: string | null
          tags?: string[] | null
          thumbnail_url?: string | null
          timezone?: string | null
          title?: string
          updated_at?: string | null
          xp_reward?: number | null
        }
        Relationships: []
      }
      beyond_finance_entries: {
        Row: {
          amount: number
          category: string
          created_at: string | null
          date: string
          description: string | null
          id: string
          is_recurring: boolean | null
          type: string
          user_id: string
        }
        Insert: {
          amount: number
          category: string
          created_at?: string | null
          date?: string
          description?: string | null
          id?: string
          is_recurring?: boolean | null
          type: string
          user_id: string
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string | null
          date?: string
          description?: string | null
          id?: string
          is_recurring?: boolean | null
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      beyond_finance_goals: {
        Row: {
          created_at: string | null
          current_amount: number
          deadline: string | null
          goal_type: string
          id: string
          status: string
          target_amount: number
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          current_amount?: number
          deadline?: string | null
          goal_type: string
          id?: string
          status?: string
          target_amount: number
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          current_amount?: number
          deadline?: string | null
          goal_type?: string
          id?: string
          status?: string
          target_amount?: number
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      beyond_gratitude_entries: {
        Row: {
          created_at: string | null
          date: string
          entry_1: string
          entry_2: string | null
          entry_3: string | null
          id: string
          patient_win: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          date?: string
          entry_1: string
          entry_2?: string | null
          entry_3?: string | null
          id?: string
          patient_win?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          date?: string
          entry_1?: string
          entry_2?: string | null
          entry_3?: string | null
          id?: string
          patient_win?: string | null
          user_id?: string
        }
        Relationships: []
      }
      beyond_habit_logs: {
        Row: {
          completed: boolean
          created_at: string | null
          date: string
          habit_id: string
          id: string
          user_id: string
        }
        Insert: {
          completed?: boolean
          created_at?: string | null
          date?: string
          habit_id: string
          id?: string
          user_id: string
        }
        Update: {
          completed?: boolean
          created_at?: string | null
          date?: string
          habit_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "beyond_habit_logs_habit_id_fkey"
            columns: ["habit_id"]
            isOneToOne: false
            referencedRelation: "beyond_habits"
            referencedColumns: ["id"]
          },
        ]
      }
      beyond_habits: {
        Row: {
          category: string
          created_at: string | null
          current_streak: number
          frequency: string
          id: string
          is_active: boolean | null
          longest_streak: number
          name: string
          reminder_time: string | null
          user_id: string
        }
        Insert: {
          category?: string
          created_at?: string | null
          current_streak?: number
          frequency?: string
          id?: string
          is_active?: boolean | null
          longest_streak?: number
          name: string
          reminder_time?: string | null
          user_id: string
        }
        Update: {
          category?: string
          created_at?: string | null
          current_streak?: number
          frequency?: string
          id?: string
          is_active?: boolean | null
          longest_streak?: number
          name?: string
          reminder_time?: string | null
          user_id?: string
        }
        Relationships: []
      }
      beyond_journal_entries: {
        Row: {
          content: string
          created_at: string | null
          date: string
          id: string
          mood_score: number | null
          prompt: string | null
          related_module: string | null
          tags: string[] | null
          type: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          date?: string
          id?: string
          mood_score?: number | null
          prompt?: string | null
          related_module?: string | null
          tags?: string[] | null
          type?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          date?: string
          id?: string
          mood_score?: number | null
          prompt?: string | null
          related_module?: string | null
          tags?: string[] | null
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      beyond_leaderboard_weekly: {
        Row: {
          id: string
          institution: string | null
          rank: number | null
          specialty: string | null
          updated_at: string | null
          user_id: string
          week_start: string
          xp_this_week: number
        }
        Insert: {
          id?: string
          institution?: string | null
          rank?: number | null
          specialty?: string | null
          updated_at?: string | null
          user_id: string
          week_start?: string
          xp_this_week?: number
        }
        Update: {
          id?: string
          institution?: string | null
          rank?: number | null
          specialty?: string | null
          updated_at?: string | null
          user_id?: string
          week_start?: string
          xp_this_week?: number
        }
        Relationships: []
      }
      beyond_leadership_assessments: {
        Row: {
          assessed_at: string | null
          growth_areas: string[] | null
          id: string
          level: number
          primary_style: string
          scenarios_completed: number | null
          secondary_style: string | null
          strengths: string[] | null
          total_score: number | null
          user_id: string
        }
        Insert: {
          assessed_at?: string | null
          growth_areas?: string[] | null
          id?: string
          level?: number
          primary_style: string
          scenarios_completed?: number | null
          secondary_style?: string | null
          strengths?: string[] | null
          total_score?: number | null
          user_id: string
        }
        Update: {
          assessed_at?: string | null
          growth_areas?: string[] | null
          id?: string
          level?: number
          primary_style?: string
          scenarios_completed?: number | null
          secondary_style?: string | null
          strengths?: string[] | null
          total_score?: number | null
          user_id?: string
        }
        Relationships: []
      }
      beyond_leadership_progress: {
        Row: {
          chosen_option_id: string
          completed_at: string | null
          feedback: string | null
          id: string
          scenario_id: string
          score: number
          user_id: string
        }
        Insert: {
          chosen_option_id: string
          completed_at?: string | null
          feedback?: string | null
          id?: string
          scenario_id: string
          score: number
          user_id: string
        }
        Update: {
          chosen_option_id?: string
          completed_at?: string | null
          feedback?: string | null
          id?: string
          scenario_id?: string
          score?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "beyond_leadership_progress_scenario_id_fkey"
            columns: ["scenario_id"]
            isOneToOne: false
            referencedRelation: "beyond_leadership_scenarios"
            referencedColumns: ["id"]
          },
        ]
      }
      beyond_leadership_scenarios: {
        Row: {
          best_option_id: string | null
          category: string
          context: string
          created_at: string | null
          description: string
          id: string
          is_published: boolean | null
          learning_point: string
          level: number
          options: Json
          title: string
        }
        Insert: {
          best_option_id?: string | null
          category: string
          context: string
          created_at?: string | null
          description: string
          id?: string
          is_published?: boolean | null
          learning_point: string
          level?: number
          options?: Json
          title: string
        }
        Update: {
          best_option_id?: string | null
          category?: string
          context?: string
          created_at?: string | null
          description?: string
          id?: string
          is_published?: boolean | null
          learning_point?: string
          level?: number
          options?: Json
          title?: string
        }
        Relationships: []
      }
      beyond_lesson_completions: {
        Row: {
          action_done: boolean | null
          completed_at: string | null
          id: string
          lesson_id: string
          reflection_text: string | null
          user_id: string
        }
        Insert: {
          action_done?: boolean | null
          completed_at?: string | null
          id?: string
          lesson_id: string
          reflection_text?: string | null
          user_id: string
        }
        Update: {
          action_done?: boolean | null
          completed_at?: string | null
          id?: string
          lesson_id?: string
          reflection_text?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "beyond_lesson_completions_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "beyond_pathway_lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      beyond_membership_features: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          feature_key: string
          feature_name: string
          id: string
          min_tier_level: number
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          feature_key: string
          feature_name: string
          id?: string
          min_tier_level?: number
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          feature_key?: string
          feature_name?: string
          id?: string
          min_tier_level?: number
        }
        Relationships: []
      }
      beyond_membership_plans: {
        Row: {
          badge_color: string | null
          created_at: string | null
          description: string
          features: Json
          highlighted_feature: string | null
          id: string
          is_active: boolean | null
          is_free: boolean | null
          is_popular: boolean | null
          name: string
          price_monthly_inr: number | null
          price_yearly_inr: number | null
          slug: string
          sort_order: number | null
          tier_level: number
        }
        Insert: {
          badge_color?: string | null
          created_at?: string | null
          description: string
          features?: Json
          highlighted_feature?: string | null
          id?: string
          is_active?: boolean | null
          is_free?: boolean | null
          is_popular?: boolean | null
          name: string
          price_monthly_inr?: number | null
          price_yearly_inr?: number | null
          slug: string
          sort_order?: number | null
          tier_level?: number
        }
        Update: {
          badge_color?: string | null
          created_at?: string | null
          description?: string
          features?: Json
          highlighted_feature?: string | null
          id?: string
          is_active?: boolean | null
          is_free?: boolean | null
          is_popular?: boolean | null
          name?: string
          price_monthly_inr?: number | null
          price_yearly_inr?: number | null
          slug?: string
          sort_order?: number | null
          tier_level?: number
        }
        Relationships: []
      }
      beyond_membership_subscriptions: {
        Row: {
          billing_cycle: string | null
          cancelled_at: string | null
          expires_at: string | null
          id: string
          last_payment_at: string | null
          next_payment_at: string | null
          payment_method: string | null
          plan_id: string
          plan_slug: string
          started_at: string | null
          status: string
          user_id: string
        }
        Insert: {
          billing_cycle?: string | null
          cancelled_at?: string | null
          expires_at?: string | null
          id?: string
          last_payment_at?: string | null
          next_payment_at?: string | null
          payment_method?: string | null
          plan_id: string
          plan_slug: string
          started_at?: string | null
          status?: string
          user_id: string
        }
        Update: {
          billing_cycle?: string | null
          cancelled_at?: string | null
          expires_at?: string | null
          id?: string
          last_payment_at?: string | null
          next_payment_at?: string | null
          payment_method?: string | null
          plan_id?: string
          plan_slug?: string
          started_at?: string | null
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "beyond_membership_subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "beyond_membership_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      beyond_mood_logs: {
        Row: {
          date: string
          energy: number | null
          id: string
          logged_at: string | null
          mood: number
          note: string | null
          stress: number | null
          tags: string[] | null
          user_id: string
        }
        Insert: {
          date?: string
          energy?: number | null
          id?: string
          logged_at?: string | null
          mood: number
          note?: string | null
          stress?: number | null
          tags?: string[] | null
          user_id: string
        }
        Update: {
          date?: string
          energy?: number | null
          id?: string
          logged_at?: string | null
          mood?: number
          note?: string | null
          stress?: number | null
          tags?: string[] | null
          user_id?: string
        }
        Relationships: []
      }
      beyond_net_worth_snapshots: {
        Row: {
          assets: Json
          created_at: string | null
          id: string
          liabilities: Json
          month: string
          net_worth: number | null
          total_assets: number
          total_liabilities: number
          user_id: string
        }
        Insert: {
          assets?: Json
          created_at?: string | null
          id?: string
          liabilities?: Json
          month: string
          net_worth?: number | null
          total_assets?: number
          total_liabilities?: number
          user_id: string
        }
        Update: {
          assets?: Json
          created_at?: string | null
          id?: string
          liabilities?: Json
          month?: string
          net_worth?: number | null
          total_assets?: number
          total_liabilities?: number
          user_id?: string
        }
        Relationships: []
      }
      beyond_notifications: {
        Row: {
          action_url: string | null
          created_at: string | null
          id: string
          is_read: boolean | null
          message: string
          title: string
          type: string
          user_id: string
        }
        Insert: {
          action_url?: string | null
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          title: string
          type: string
          user_id: string
        }
        Update: {
          action_url?: string | null
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      beyond_pathway_enrollments: {
        Row: {
          completed_at: string | null
          id: string
          pathway_id: string
          progress_pct: number
          started_at: string | null
          status: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          id?: string
          pathway_id: string
          progress_pct?: number
          started_at?: string | null
          status?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          id?: string
          pathway_id?: string
          progress_pct?: number
          started_at?: string | null
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "beyond_pathway_enrollments_pathway_id_fkey"
            columns: ["pathway_id"]
            isOneToOne: false
            referencedRelation: "beyond_pathways"
            referencedColumns: ["id"]
          },
        ]
      }
      beyond_pathway_lessons: {
        Row: {
          action_item: string
          book_recommendation: string | null
          content: string
          created_at: string | null
          day_number: number
          duration_minutes: number
          id: string
          pathway_id: string
          reflection_question: string | null
          sort_order: number
          title: string
          week_number: number
        }
        Insert: {
          action_item: string
          book_recommendation?: string | null
          content: string
          created_at?: string | null
          day_number: number
          duration_minutes?: number
          id?: string
          pathway_id: string
          reflection_question?: string | null
          sort_order?: number
          title: string
          week_number: number
        }
        Update: {
          action_item?: string
          book_recommendation?: string | null
          content?: string
          created_at?: string | null
          day_number?: number
          duration_minutes?: number
          id?: string
          pathway_id?: string
          reflection_question?: string | null
          sort_order?: number
          title?: string
          week_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "beyond_pathway_lessons_pathway_id_fkey"
            columns: ["pathway_id"]
            isOneToOne: false
            referencedRelation: "beyond_pathways"
            referencedColumns: ["id"]
          },
        ]
      }
      beyond_pathways: {
        Row: {
          category: string
          created_at: string | null
          description: string
          difficulty: string
          duration_weeks: number
          icon_name: string
          id: string
          is_published: boolean | null
          title: string
          total_lessons: number
          xp_reward: number
        }
        Insert: {
          category: string
          created_at?: string | null
          description: string
          difficulty?: string
          duration_weeks: number
          icon_name?: string
          id?: string
          is_published?: boolean | null
          title: string
          total_lessons?: number
          xp_reward?: number
        }
        Update: {
          category?: string
          created_at?: string | null
          description?: string
          difficulty?: string
          duration_weeks?: number
          icon_name?: string
          id?: string
          is_published?: boolean | null
          title?: string
          total_lessons?: number
          xp_reward?: number
        }
        Relationships: []
      }
      beyond_pomodoro_sessions: {
        Row: {
          category: string
          completed: boolean | null
          completed_at: string | null
          date: string
          duration_minutes: number
          id: string
          interrupted: boolean | null
          started_at: string | null
          task_name: string
          user_id: string
        }
        Insert: {
          category?: string
          completed?: boolean | null
          completed_at?: string | null
          date?: string
          duration_minutes?: number
          id?: string
          interrupted?: boolean | null
          started_at?: string | null
          task_name: string
          user_id: string
        }
        Update: {
          category?: string
          completed?: boolean | null
          completed_at?: string | null
          date?: string
          duration_minutes?: number
          id?: string
          interrupted?: boolean | null
          started_at?: string | null
          task_name?: string
          user_id?: string
        }
        Relationships: []
      }
      beyond_profiles: {
        Row: {
          avatar_url: string | null
          career_stage: string
          city: string | null
          created_at: string | null
          full_name: string
          goals: string[] | null
          id: string
          institution: string | null
          interests: string[] | null
          onboarding_completed: boolean | null
          specialty: string | null
          updated_at: string | null
          user_id: string
          years_experience: number | null
        }
        Insert: {
          avatar_url?: string | null
          career_stage?: string
          city?: string | null
          created_at?: string | null
          full_name: string
          goals?: string[] | null
          id?: string
          institution?: string | null
          interests?: string[] | null
          onboarding_completed?: boolean | null
          specialty?: string | null
          updated_at?: string | null
          user_id: string
          years_experience?: number | null
        }
        Update: {
          avatar_url?: string | null
          career_stage?: string
          city?: string | null
          created_at?: string | null
          full_name?: string
          goals?: string[] | null
          id?: string
          institution?: string | null
          interests?: string[] | null
          onboarding_completed?: boolean | null
          specialty?: string | null
          updated_at?: string | null
          user_id?: string
          years_experience?: number | null
        }
        Relationships: []
      }
      beyond_reading_logs: {
        Row: {
          apply_it_done: boolean | null
          apply_it_reflection: string | null
          book_id: string
          created_at: string | null
          finished_at: string | null
          id: string
          key_takeaway: string | null
          rating: number | null
          review: string | null
          started_at: string | null
          status: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          apply_it_done?: boolean | null
          apply_it_reflection?: string | null
          book_id: string
          created_at?: string | null
          finished_at?: string | null
          id?: string
          key_takeaway?: string | null
          rating?: number | null
          review?: string | null
          started_at?: string | null
          status?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          apply_it_done?: boolean | null
          apply_it_reflection?: string | null
          book_id?: string
          created_at?: string | null
          finished_at?: string | null
          id?: string
          key_takeaway?: string | null
          rating?: number | null
          review?: string | null
          started_at?: string | null
          status?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "beyond_reading_logs_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "beyond_books"
            referencedColumns: ["id"]
          },
        ]
      }
      beyond_sleep_logs: {
        Row: {
          bed_time: string
          created_at: string | null
          date: string
          hours: number | null
          id: string
          notes: string | null
          quality: number
          user_id: string
          wake_time: string
        }
        Insert: {
          bed_time: string
          created_at?: string | null
          date?: string
          hours?: number | null
          id?: string
          notes?: string | null
          quality: number
          user_id: string
          wake_time: string
        }
        Update: {
          bed_time?: string
          created_at?: string | null
          date?: string
          hours?: number | null
          id?: string
          notes?: string | null
          quality?: number
          user_id?: string
          wake_time?: string
        }
        Relationships: []
      }
      beyond_streaks: {
        Row: {
          current_count: number
          freeze_tokens_remaining: number
          id: string
          last_activity_at: string | null
          longest_count: number
          started_at: string | null
          streak_type: string
          user_id: string
        }
        Insert: {
          current_count?: number
          freeze_tokens_remaining?: number
          id?: string
          last_activity_at?: string | null
          longest_count?: number
          started_at?: string | null
          streak_type: string
          user_id: string
        }
        Update: {
          current_count?: number
          freeze_tokens_remaining?: number
          id?: string
          last_activity_at?: string | null
          longest_count?: number
          started_at?: string | null
          streak_type?: string
          user_id?: string
        }
        Relationships: []
      }
      beyond_time_logs: {
        Row: {
          activity: string
          category: string
          created_at: string | null
          date: string
          duration_minutes: number
          energy_level: number | null
          id: string
          notes: string | null
          user_id: string
        }
        Insert: {
          activity: string
          category: string
          created_at?: string | null
          date?: string
          duration_minutes: number
          energy_level?: number | null
          id?: string
          notes?: string | null
          user_id: string
        }
        Update: {
          activity?: string
          category?: string
          created_at?: string | null
          date?: string
          duration_minutes?: number
          energy_level?: number | null
          id?: string
          notes?: string | null
          user_id?: string
        }
        Relationships: []
      }
      beyond_time_templates: {
        Row: {
          blocks: Json
          career_stage: string
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          is_default: boolean | null
          name: string
          usage_count: number | null
        }
        Insert: {
          blocks?: Json
          career_stage?: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_default?: boolean | null
          name: string
          usage_count?: number | null
        }
        Update: {
          blocks?: Json
          career_stage?: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_default?: boolean | null
          name?: string
          usage_count?: number | null
        }
        Relationships: []
      }
      beyond_time_weekly_plans: {
        Row: {
          adherence_score: number | null
          created_at: string | null
          id: string
          plan_data: Json
          reflection_notes: string | null
          updated_at: string | null
          user_id: string
          week_start: string
        }
        Insert: {
          adherence_score?: number | null
          created_at?: string | null
          id?: string
          plan_data?: Json
          reflection_notes?: string | null
          updated_at?: string | null
          user_id: string
          week_start: string
        }
        Update: {
          adherence_score?: number | null
          created_at?: string | null
          id?: string
          plan_data?: Json
          reflection_notes?: string | null
          updated_at?: string | null
          user_id?: string
          week_start?: string
        }
        Relationships: []
      }
      beyond_user_badges: {
        Row: {
          badge_id: string
          earned_at: string | null
          id: string
          is_displayed: boolean | null
          user_id: string
        }
        Insert: {
          badge_id: string
          earned_at?: string | null
          id?: string
          is_displayed?: boolean | null
          user_id: string
        }
        Update: {
          badge_id?: string
          earned_at?: string | null
          id?: string
          is_displayed?: boolean | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "beyond_user_badges_badge_id_fkey"
            columns: ["badge_id"]
            isOneToOne: false
            referencedRelation: "beyond_badges_catalog"
            referencedColumns: ["id"]
          },
        ]
      }
      beyond_user_challenges: {
        Row: {
          challenge_id: string
          completed_at: string | null
          id: string
          progress_pct: number
          started_at: string | null
          status: string
          user_id: string
        }
        Insert: {
          challenge_id: string
          completed_at?: string | null
          id?: string
          progress_pct?: number
          started_at?: string | null
          status?: string
          user_id: string
        }
        Update: {
          challenge_id?: string
          completed_at?: string | null
          id?: string
          progress_pct?: number
          started_at?: string | null
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "beyond_user_challenges_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "beyond_challenges"
            referencedColumns: ["id"]
          },
        ]
      }
      beyond_user_xp: {
        Row: {
          current_level: number
          id: string
          level_title: string
          total_xp: number
          updated_at: string | null
          user_id: string
          xp_to_next_level: number
        }
        Insert: {
          current_level?: number
          id?: string
          level_title?: string
          total_xp?: number
          updated_at?: string | null
          user_id: string
          xp_to_next_level?: number
        }
        Update: {
          current_level?: number
          id?: string
          level_title?: string
          total_xp?: number
          updated_at?: string | null
          user_id?: string
          xp_to_next_level?: number
        }
        Relationships: []
      }
      beyond_vision_board_items: {
        Row: {
          accountability_partner: string | null
          category: string
          celebration_note: string | null
          color: string | null
          completed_at: string | null
          created_at: string
          description: string | null
          display_order: number
          id: string
          image_url: string | null
          is_completed: boolean
          milestones: Json | null
          sag_claimed: boolean
          sag_claimed_at: string | null
          sag_planned: string | null
          target_date: string | null
          title: string
          updated_at: string
          user_id: string
          vision_type: string
        }
        Insert: {
          accountability_partner?: string | null
          category?: string
          celebration_note?: string | null
          color?: string | null
          completed_at?: string | null
          created_at?: string
          description?: string | null
          display_order?: number
          id?: string
          image_url?: string | null
          is_completed?: boolean
          milestones?: Json | null
          sag_claimed?: boolean
          sag_claimed_at?: string | null
          sag_planned?: string | null
          target_date?: string | null
          title: string
          updated_at?: string
          user_id: string
          vision_type: string
        }
        Update: {
          accountability_partner?: string | null
          category?: string
          celebration_note?: string | null
          color?: string | null
          completed_at?: string | null
          created_at?: string
          description?: string | null
          display_order?: number
          id?: string
          image_url?: string | null
          is_completed?: boolean
          milestones?: Json | null
          sag_claimed?: boolean
          sag_claimed_at?: string | null
          sag_planned?: string | null
          target_date?: string | null
          title?: string
          updated_at?: string
          user_id?: string
          vision_type?: string
        }
        Relationships: []
      }
      beyond_wheel_assessments: {
        Row: {
          assessed_at: string | null
          clinical_score: number
          created_at: string | null
          family_score: number
          finance_score: number
          id: string
          joy_score: number
          leadership_score: number
          notes: string | null
          relationships_score: number
          time_score: number
          total_score: number | null
          user_id: string
          wellness_score: number
        }
        Insert: {
          assessed_at?: string | null
          clinical_score: number
          created_at?: string | null
          family_score: number
          finance_score: number
          id?: string
          joy_score: number
          leadership_score: number
          notes?: string | null
          relationships_score: number
          time_score: number
          total_score?: number | null
          user_id: string
          wellness_score: number
        }
        Update: {
          assessed_at?: string | null
          clinical_score?: number
          created_at?: string | null
          family_score?: number
          finance_score?: number
          id?: string
          joy_score?: number
          leadership_score?: number
          notes?: string | null
          relationships_score?: number
          time_score?: number
          total_score?: number | null
          user_id?: string
          wellness_score?: number
        }
        Relationships: []
      }
      beyond_wheel_goals: {
        Row: {
          created_at: string | null
          current_score: number | null
          deadline: string | null
          goal_text: string
          id: string
          spoke: string
          status: string
          target_score: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          current_score?: number | null
          deadline?: string | null
          goal_text: string
          id?: string
          spoke: string
          status?: string
          target_score: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          current_score?: number | null
          deadline?: string | null
          goal_text?: string
          id?: string
          spoke?: string
          status?: string
          target_score?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      beyond_xp_transactions: {
        Row: {
          amount: number
          description: string | null
          earned_at: string | null
          id: string
          source: string
          source_id: string | null
          user_id: string
        }
        Insert: {
          amount: number
          description?: string | null
          earned_at?: string | null
          id?: string
          source: string
          source_id?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          description?: string | null
          earned_at?: string | null
          id?: string
          source?: string
          source_id?: string | null
          user_id?: string
        }
        Relationships: []
      }
      bridge_insurance_preauth: {
        Row: {
          appointment_id: string | null
          approval_reference: string | null
          approved_amount: number | null
          ayuzee_booking_id: string | null
          clinic_id: string | null
          clinic_name: string | null
          created_at: string | null
          diagnosis_codes: string[] | null
          documents_submitted: Json | null
          estimated_amount: number | null
          id: string
          insurance_provider: string
          member_id: string | null
          patient_id: string
          policy_number: string
          procedures_planned: string[] | null
          rejection_reason: string | null
          status: string | null
          tpa_name: string | null
          triggered_from_ayuzee: boolean | null
          updated_at: string | null
          valid_from: string | null
          valid_until: string | null
        }
        Insert: {
          appointment_id?: string | null
          approval_reference?: string | null
          approved_amount?: number | null
          ayuzee_booking_id?: string | null
          clinic_id?: string | null
          clinic_name?: string | null
          created_at?: string | null
          diagnosis_codes?: string[] | null
          documents_submitted?: Json | null
          estimated_amount?: number | null
          id?: string
          insurance_provider: string
          member_id?: string | null
          patient_id: string
          policy_number: string
          procedures_planned?: string[] | null
          rejection_reason?: string | null
          status?: string | null
          tpa_name?: string | null
          triggered_from_ayuzee?: boolean | null
          updated_at?: string | null
          valid_from?: string | null
          valid_until?: string | null
        }
        Update: {
          appointment_id?: string | null
          approval_reference?: string | null
          approved_amount?: number | null
          ayuzee_booking_id?: string | null
          clinic_id?: string | null
          clinic_name?: string | null
          created_at?: string | null
          diagnosis_codes?: string[] | null
          documents_submitted?: Json | null
          estimated_amount?: number | null
          id?: string
          insurance_provider?: string
          member_id?: string | null
          patient_id?: string
          policy_number?: string
          procedures_planned?: string[] | null
          rejection_reason?: string | null
          status?: string | null
          tpa_name?: string | null
          triggered_from_ayuzee?: boolean | null
          updated_at?: string | null
          valid_from?: string | null
          valid_until?: string | null
        }
        Relationships: []
      }
      bridge_lab_report_push: {
        Row: {
          clinic_id: string | null
          clinic_name: string | null
          created_at: string | null
          doctor_notes: string | null
          hms_lab_order_id: string | null
          id: string
          notification_sent: boolean | null
          patient_id: string
          push_status: string | null
          pushed_at: string | null
          report_data: Json | null
          report_file_url: string | null
          report_title: string
          viewed_at: string | null
        }
        Insert: {
          clinic_id?: string | null
          clinic_name?: string | null
          created_at?: string | null
          doctor_notes?: string | null
          hms_lab_order_id?: string | null
          id?: string
          notification_sent?: boolean | null
          patient_id: string
          push_status?: string | null
          pushed_at?: string | null
          report_data?: Json | null
          report_file_url?: string | null
          report_title: string
          viewed_at?: string | null
        }
        Update: {
          clinic_id?: string | null
          clinic_name?: string | null
          created_at?: string | null
          doctor_notes?: string | null
          hms_lab_order_id?: string | null
          id?: string
          notification_sent?: boolean | null
          patient_id?: string
          push_status?: string | null
          pushed_at?: string | null
          report_data?: Json | null
          report_file_url?: string | null
          report_title?: string
          viewed_at?: string | null
        }
        Relationships: []
      }
      bridge_pharmacy_fulfillment: {
        Row: {
          ayuzee_cart_created: boolean | null
          ayuzee_order_id: string | null
          clinic_id: string | null
          clinic_name: string | null
          created_at: string | null
          delivery_address: Json | null
          doctor_id: string | null
          estimated_delivery: string | null
          fulfillment_mode: string
          id: string
          medicines: Json
          patient_id: string
          pharmacy_bill_id: string | null
          pharmacy_collected_at: string | null
          pharmacy_ready_at: string | null
          prescription_id: string | null
          status: string | null
          unavailable_medicines: Json | null
          updated_at: string | null
        }
        Insert: {
          ayuzee_cart_created?: boolean | null
          ayuzee_order_id?: string | null
          clinic_id?: string | null
          clinic_name?: string | null
          created_at?: string | null
          delivery_address?: Json | null
          doctor_id?: string | null
          estimated_delivery?: string | null
          fulfillment_mode: string
          id?: string
          medicines?: Json
          patient_id: string
          pharmacy_bill_id?: string | null
          pharmacy_collected_at?: string | null
          pharmacy_ready_at?: string | null
          prescription_id?: string | null
          status?: string | null
          unavailable_medicines?: Json | null
          updated_at?: string | null
        }
        Update: {
          ayuzee_cart_created?: boolean | null
          ayuzee_order_id?: string | null
          clinic_id?: string | null
          clinic_name?: string | null
          created_at?: string | null
          delivery_address?: Json | null
          doctor_id?: string | null
          estimated_delivery?: string | null
          fulfillment_mode?: string
          id?: string
          medicines?: Json
          patient_id?: string
          pharmacy_bill_id?: string | null
          pharmacy_collected_at?: string | null
          pharmacy_ready_at?: string | null
          prescription_id?: string | null
          status?: string | null
          unavailable_medicines?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
      bridge_referral_network: {
        Row: {
          auto_book_appointment: boolean | null
          ayuzee_referral_visible: boolean | null
          booked_appointment_id: string | null
          case_notes_shared: boolean | null
          clinical_summary: string | null
          created_at: string | null
          id: string
          outcome_summary: string | null
          patient_id: string
          preferred_date: string | null
          referral_reason: string
          referred_doctor_notes: string | null
          referred_to_clinic_id: string | null
          referred_to_clinic_name: string | null
          referred_to_doctor_id: string | null
          referred_to_specialty: string | null
          referring_clinic_id: string | null
          referring_clinic_name: string | null
          referring_doctor_id: string
          shared_documents: string[] | null
          status: string | null
          updated_at: string | null
          urgency: string | null
        }
        Insert: {
          auto_book_appointment?: boolean | null
          ayuzee_referral_visible?: boolean | null
          booked_appointment_id?: string | null
          case_notes_shared?: boolean | null
          clinical_summary?: string | null
          created_at?: string | null
          id?: string
          outcome_summary?: string | null
          patient_id: string
          preferred_date?: string | null
          referral_reason: string
          referred_doctor_notes?: string | null
          referred_to_clinic_id?: string | null
          referred_to_clinic_name?: string | null
          referred_to_doctor_id?: string | null
          referred_to_specialty?: string | null
          referring_clinic_id?: string | null
          referring_clinic_name?: string | null
          referring_doctor_id: string
          shared_documents?: string[] | null
          status?: string | null
          updated_at?: string | null
          urgency?: string | null
        }
        Update: {
          auto_book_appointment?: boolean | null
          ayuzee_referral_visible?: boolean | null
          booked_appointment_id?: string | null
          case_notes_shared?: boolean | null
          clinical_summary?: string | null
          created_at?: string | null
          id?: string
          outcome_summary?: string | null
          patient_id?: string
          preferred_date?: string | null
          referral_reason?: string
          referred_doctor_notes?: string | null
          referred_to_clinic_id?: string | null
          referred_to_clinic_name?: string | null
          referred_to_doctor_id?: string | null
          referred_to_specialty?: string | null
          referring_clinic_id?: string | null
          referring_clinic_name?: string | null
          referring_doctor_id?: string
          shared_documents?: string[] | null
          status?: string | null
          updated_at?: string | null
          urgency?: string | null
        }
        Relationships: []
      }
      bridge_teleconsult_conversion: {
        Row: {
          attachments: Json | null
          clinic_id: string | null
          clinic_name: string | null
          created_at: string | null
          doctor_id: string
          follow_up_appointment_id: string | null
          follow_up_date: string | null
          follow_up_time_slot: string | null
          id: string
          patient_accepted_at: string | null
          patient_id: string
          prescription_attached: boolean | null
          recommendation_notes: string | null
          recommended_action: string
          status: string | null
          teleconsult_appointment_id: string
          teleconsult_notes: string | null
          visit_completed_at: string | null
        }
        Insert: {
          attachments?: Json | null
          clinic_id?: string | null
          clinic_name?: string | null
          created_at?: string | null
          doctor_id: string
          follow_up_appointment_id?: string | null
          follow_up_date?: string | null
          follow_up_time_slot?: string | null
          id?: string
          patient_accepted_at?: string | null
          patient_id: string
          prescription_attached?: boolean | null
          recommendation_notes?: string | null
          recommended_action: string
          status?: string | null
          teleconsult_appointment_id: string
          teleconsult_notes?: string | null
          visit_completed_at?: string | null
        }
        Update: {
          attachments?: Json | null
          clinic_id?: string | null
          clinic_name?: string | null
          created_at?: string | null
          doctor_id?: string
          follow_up_appointment_id?: string | null
          follow_up_date?: string | null
          follow_up_time_slot?: string | null
          id?: string
          patient_accepted_at?: string | null
          patient_id?: string
          prescription_attached?: boolean | null
          recommendation_notes?: string | null
          recommended_action?: string
          status?: string | null
          teleconsult_appointment_id?: string
          teleconsult_notes?: string | null
          visit_completed_at?: string | null
        }
        Relationships: []
      }
      business_register: {
        Row: {
          category: string
          created_at: string
          description: string | null
          expiry_date: string | null
          file_url: string | null
          google_sheet_url: string | null
          id: string
          is_critical: boolean
          issue_date: string | null
          issuing_authority: string | null
          notes: string | null
          reference_number: string | null
          reminder_days_before: number | null
          renewal_date: string | null
          status: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: string
          created_at?: string
          description?: string | null
          expiry_date?: string | null
          file_url?: string | null
          google_sheet_url?: string | null
          id?: string
          is_critical?: boolean
          issue_date?: string | null
          issuing_authority?: string | null
          notes?: string | null
          reference_number?: string | null
          reminder_days_before?: number | null
          renewal_date?: string | null
          status?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          expiry_date?: string | null
          file_url?: string | null
          google_sheet_url?: string | null
          id?: string
          is_critical?: boolean
          issue_date?: string | null
          issuing_authority?: string | null
          notes?: string | null
          reference_number?: string | null
          reminder_days_before?: number | null
          renewal_date?: string | null
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      case_referrals: {
        Row: {
          attachments: Json | null
          clinical_notes: string | null
          completed_at: string | null
          condition: string
          created_at: string | null
          current_treatment: string | null
          diagnosis: string | null
          id: string
          is_private: boolean | null
          outcome_notes: string | null
          patient_age: number | null
          patient_gender: string | null
          patient_id: string | null
          patient_name: string | null
          reason_for_referral: string
          referral_type: string
          referred_to_doctor_id: string
          referring_doctor_id: string
          responded_at: string | null
          response_notes: string | null
          status: string
          updated_at: string | null
          urgency: string | null
        }
        Insert: {
          attachments?: Json | null
          clinical_notes?: string | null
          completed_at?: string | null
          condition: string
          created_at?: string | null
          current_treatment?: string | null
          diagnosis?: string | null
          id?: string
          is_private?: boolean | null
          outcome_notes?: string | null
          patient_age?: number | null
          patient_gender?: string | null
          patient_id?: string | null
          patient_name?: string | null
          reason_for_referral: string
          referral_type?: string
          referred_to_doctor_id: string
          referring_doctor_id: string
          responded_at?: string | null
          response_notes?: string | null
          status?: string
          updated_at?: string | null
          urgency?: string | null
        }
        Update: {
          attachments?: Json | null
          clinical_notes?: string | null
          completed_at?: string | null
          condition?: string
          created_at?: string | null
          current_treatment?: string | null
          diagnosis?: string | null
          id?: string
          is_private?: boolean | null
          outcome_notes?: string | null
          patient_age?: number | null
          patient_gender?: string | null
          patient_id?: string | null
          patient_name?: string | null
          reason_for_referral?: string
          referral_type?: string
          referred_to_doctor_id?: string
          referring_doctor_id?: string
          responded_at?: string | null
          response_notes?: string | null
          status?: string
          updated_at?: string | null
          urgency?: string | null
        }
        Relationships: []
      }
      case_studies: {
        Row: {
          author_college: string | null
          author_name: string | null
          bookmark_count: number | null
          created_at: string | null
          created_by: string | null
          diagnosis: string
          difficulty: string
          discussion: string | null
          examination: string
          id: string
          is_published: boolean | null
          outcome: string
          patient_history: string
          references: string | null
          subject: string
          summary: string
          system: string
          tags: string[] | null
          title: string
          treatment: string
          updated_at: string | null
          view_count: number | null
        }
        Insert: {
          author_college?: string | null
          author_name?: string | null
          bookmark_count?: number | null
          created_at?: string | null
          created_by?: string | null
          diagnosis: string
          difficulty?: string
          discussion?: string | null
          examination: string
          id?: string
          is_published?: boolean | null
          outcome: string
          patient_history: string
          references?: string | null
          subject?: string
          summary: string
          system?: string
          tags?: string[] | null
          title: string
          treatment: string
          updated_at?: string | null
          view_count?: number | null
        }
        Update: {
          author_college?: string | null
          author_name?: string | null
          bookmark_count?: number | null
          created_at?: string | null
          created_by?: string | null
          diagnosis?: string
          difficulty?: string
          discussion?: string | null
          examination?: string
          id?: string
          is_published?: boolean | null
          outcome?: string
          patient_history?: string
          references?: string | null
          subject?: string
          summary?: string
          system?: string
          tags?: string[] | null
          title?: string
          treatment?: string
          updated_at?: string | null
          view_count?: number | null
        }
        Relationships: []
      }
      case_study_bookmarks: {
        Row: {
          case_study_id: string
          created_at: string | null
          id: string
          user_id: string
        }
        Insert: {
          case_study_id: string
          created_at?: string | null
          id?: string
          user_id: string
        }
        Update: {
          case_study_id?: string
          created_at?: string | null
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "case_study_bookmarks_case_study_id_fkey"
            columns: ["case_study_id"]
            isOneToOne: false
            referencedRelation: "case_studies"
            referencedColumns: ["id"]
          },
        ]
      }
      cdss_alert_log: {
        Row: {
          action: string
          consultation_id: string | null
          context: Json | null
          created_at: string | null
          doctor_id: string
          id: string
          override_reason: string | null
          patient_id: string | null
          rule_id: string | null
        }
        Insert: {
          action?: string
          consultation_id?: string | null
          context?: Json | null
          created_at?: string | null
          doctor_id: string
          id?: string
          override_reason?: string | null
          patient_id?: string | null
          rule_id?: string | null
        }
        Update: {
          action?: string
          consultation_id?: string | null
          context?: Json | null
          created_at?: string | null
          doctor_id?: string
          id?: string
          override_reason?: string | null
          patient_id?: string | null
          rule_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cdss_alert_log_rule_id_fkey"
            columns: ["rule_id"]
            isOneToOne: false
            referencedRelation: "cdss_alert_rules"
            referencedColumns: ["id"]
          },
        ]
      }
      cdss_alert_rules: {
        Row: {
          category: string
          created_at: string | null
          created_by: string | null
          description: string
          evidence_level: string | null
          id: string
          interacting_with: string | null
          is_active: boolean | null
          recommendation: string
          reference_source: string | null
          severity: string
          title: string
          trigger_condition: string | null
          trigger_drug: string | null
          updated_at: string | null
        }
        Insert: {
          category: string
          created_at?: string | null
          created_by?: string | null
          description: string
          evidence_level?: string | null
          id?: string
          interacting_with?: string | null
          is_active?: boolean | null
          recommendation: string
          reference_source?: string | null
          severity?: string
          title: string
          trigger_condition?: string | null
          trigger_drug?: string | null
          updated_at?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          created_by?: string | null
          description?: string
          evidence_level?: string | null
          id?: string
          interacting_with?: string | null
          is_active?: boolean | null
          recommendation?: string
          reference_source?: string | null
          severity?: string
          title?: string
          trigger_condition?: string | null
          trigger_drug?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      chapter_members: {
        Row: {
          chapter_id: string
          id: string
          joined_at: string | null
          user_id: string
        }
        Insert: {
          chapter_id: string
          id?: string
          joined_at?: string | null
          user_id: string
        }
        Update: {
          chapter_id?: string
          id?: string
          joined_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chapter_members_chapter_id_fkey"
            columns: ["chapter_id"]
            isOneToOne: false
            referencedRelation: "college_chapters"
            referencedColumns: ["id"]
          },
        ]
      }
      chapter_posts: {
        Row: {
          chapter_id: string
          content: string
          created_at: string | null
          id: string
          reply_count: number
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          chapter_id: string
          content: string
          created_at?: string | null
          id?: string
          reply_count?: number
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          chapter_id?: string
          content?: string
          created_at?: string | null
          id?: string
          reply_count?: number
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chapter_posts_chapter_id_fkey"
            columns: ["chapter_id"]
            isOneToOne: false
            referencedRelation: "college_chapters"
            referencedColumns: ["id"]
          },
        ]
      }
      chapter_replies: {
        Row: {
          content: string
          created_at: string | null
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chapter_replies_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "chapter_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      classical_reference_searches: {
        Row: {
          created_at: string | null
          filters: Json | null
          id: string
          query: string
          results_count: number | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          filters?: Json | null
          id?: string
          query: string
          results_count?: number | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          filters?: Json | null
          id?: string
          query?: string
          results_count?: number | null
          user_id?: string | null
        }
        Relationships: []
      }
      classical_references: {
        Row: {
          chapter_name: string
          chapter_name_sanskrit: string | null
          chapter_number: number
          clinical_tags: string[]
          clinical_topic: string
          commentary: string | null
          created_at: string | null
          diseases_mentioned: string[] | null
          english_translation: string
          formulations_mentioned: string[] | null
          herbs_mentioned: string[] | null
          hindi_translation: string | null
          id: string
          is_verified: boolean | null
          principles: string[] | null
          relevance_score: number | null
          sanskrit_text: string | null
          sthana: string
          text_id: string
          transliteration: string | null
          verse_end: number | null
          verse_start: number | null
        }
        Insert: {
          chapter_name: string
          chapter_name_sanskrit?: string | null
          chapter_number: number
          clinical_tags?: string[]
          clinical_topic: string
          commentary?: string | null
          created_at?: string | null
          diseases_mentioned?: string[] | null
          english_translation: string
          formulations_mentioned?: string[] | null
          herbs_mentioned?: string[] | null
          hindi_translation?: string | null
          id?: string
          is_verified?: boolean | null
          principles?: string[] | null
          relevance_score?: number | null
          sanskrit_text?: string | null
          sthana: string
          text_id: string
          transliteration?: string | null
          verse_end?: number | null
          verse_start?: number | null
        }
        Update: {
          chapter_name?: string
          chapter_name_sanskrit?: string | null
          chapter_number?: number
          clinical_tags?: string[]
          clinical_topic?: string
          commentary?: string | null
          created_at?: string | null
          diseases_mentioned?: string[] | null
          english_translation?: string
          formulations_mentioned?: string[] | null
          herbs_mentioned?: string[] | null
          hindi_translation?: string | null
          id?: string
          is_verified?: boolean | null
          principles?: string[] | null
          relevance_score?: number | null
          sanskrit_text?: string | null
          sthana?: string
          text_id?: string
          transliteration?: string | null
          verse_end?: number | null
          verse_start?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "classical_references_text_id_fkey"
            columns: ["text_id"]
            isOneToOne: false
            referencedRelation: "classical_texts"
            referencedColumns: ["id"]
          },
        ]
      }
      classical_texts: {
        Row: {
          author: string | null
          created_at: string | null
          description: string | null
          era: string | null
          id: string
          name: string
          name_sanskrit: string | null
          system: string
          total_chapters: number | null
        }
        Insert: {
          author?: string | null
          created_at?: string | null
          description?: string | null
          era?: string | null
          id?: string
          name: string
          name_sanskrit?: string | null
          system: string
          total_chapters?: number | null
        }
        Update: {
          author?: string | null
          created_at?: string | null
          description?: string | null
          era?: string | null
          id?: string
          name?: string
          name_sanskrit?: string | null
          system?: string
          total_chapters?: number | null
        }
        Relationships: []
      }
      clinic_certifications: {
        Row: {
          address: string
          applied_at: string | null
          audit_history: Json | null
          certificate_expiry: string | null
          certification_status: string
          certified_at: string | null
          city: string
          clinic_id: string | null
          clinic_name: string
          compliance_checklist: Json | null
          created_at: string | null
          doctor_count: number | null
          documents: Json | null
          email: string | null
          has_lab: boolean | null
          has_panchakarma: boolean | null
          has_pharmacy: boolean | null
          id: string
          infrastructure_details: Json | null
          inspection_date: string | null
          inspection_notes: string | null
          inspection_score: number | null
          inspector_id: string | null
          last_audit_date: string | null
          next_audit_date: string | null
          owner_id: string
          phone: string | null
          photos: Json | null
          pincode: string | null
          registration_authority: string | null
          registration_number: string | null
          rejection_reason: string | null
          renewal_reminder_sent: boolean | null
          staff_count: number | null
          state: string
          systems_practiced: string[] | null
          tier: string | null
          updated_at: string | null
        }
        Insert: {
          address: string
          applied_at?: string | null
          audit_history?: Json | null
          certificate_expiry?: string | null
          certification_status?: string
          certified_at?: string | null
          city: string
          clinic_id?: string | null
          clinic_name: string
          compliance_checklist?: Json | null
          created_at?: string | null
          doctor_count?: number | null
          documents?: Json | null
          email?: string | null
          has_lab?: boolean | null
          has_panchakarma?: boolean | null
          has_pharmacy?: boolean | null
          id?: string
          infrastructure_details?: Json | null
          inspection_date?: string | null
          inspection_notes?: string | null
          inspection_score?: number | null
          inspector_id?: string | null
          last_audit_date?: string | null
          next_audit_date?: string | null
          owner_id: string
          phone?: string | null
          photos?: Json | null
          pincode?: string | null
          registration_authority?: string | null
          registration_number?: string | null
          rejection_reason?: string | null
          renewal_reminder_sent?: boolean | null
          staff_count?: number | null
          state: string
          systems_practiced?: string[] | null
          tier?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string
          applied_at?: string | null
          audit_history?: Json | null
          certificate_expiry?: string | null
          certification_status?: string
          certified_at?: string | null
          city?: string
          clinic_id?: string | null
          clinic_name?: string
          compliance_checklist?: Json | null
          created_at?: string | null
          doctor_count?: number | null
          documents?: Json | null
          email?: string | null
          has_lab?: boolean | null
          has_panchakarma?: boolean | null
          has_pharmacy?: boolean | null
          id?: string
          infrastructure_details?: Json | null
          inspection_date?: string | null
          inspection_notes?: string | null
          inspection_score?: number | null
          inspector_id?: string | null
          last_audit_date?: string | null
          next_audit_date?: string | null
          owner_id?: string
          phone?: string | null
          photos?: Json | null
          pincode?: string | null
          registration_authority?: string | null
          registration_number?: string | null
          rejection_reason?: string | null
          renewal_reminder_sent?: boolean | null
          staff_count?: number | null
          state?: string
          systems_practiced?: string[] | null
          tier?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      cme_credits: {
        Row: {
          activity_id: string | null
          activity_title: string
          activity_type: string
          certificate_number: string | null
          certificate_url: string | null
          created_at: string | null
          credit_category: string | null
          credits_earned: number
          date_completed: string
          description: string | null
          doctor_id: string
          id: string
          provider: string | null
          status: string | null
          updated_at: string | null
          valid_from: string | null
          valid_until: string | null
          verified: boolean | null
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          activity_id?: string | null
          activity_title: string
          activity_type: string
          certificate_number?: string | null
          certificate_url?: string | null
          created_at?: string | null
          credit_category?: string | null
          credits_earned?: number
          date_completed: string
          description?: string | null
          doctor_id: string
          id?: string
          provider?: string | null
          status?: string | null
          updated_at?: string | null
          valid_from?: string | null
          valid_until?: string | null
          verified?: boolean | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          activity_id?: string | null
          activity_title?: string
          activity_type?: string
          certificate_number?: string | null
          certificate_url?: string | null
          created_at?: string | null
          credit_category?: string | null
          credits_earned?: number
          date_completed?: string
          description?: string | null
          doctor_id?: string
          id?: string
          provider?: string | null
          status?: string | null
          updated_at?: string | null
          valid_from?: string | null
          valid_until?: string | null
          verified?: boolean | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: []
      }
      cme_requirements: {
        Row: {
          category_1_minimum: number | null
          category_2_minimum: number | null
          council_name: string
          created_at: string | null
          credits_required_per_year: number
          description: string | null
          id: string
          is_active: boolean | null
          renewal_cycle_years: number | null
          state: string | null
          system_of_medicine: string
          updated_at: string | null
        }
        Insert: {
          category_1_minimum?: number | null
          category_2_minimum?: number | null
          council_name: string
          created_at?: string | null
          credits_required_per_year?: number
          description?: string | null
          id?: string
          is_active?: boolean | null
          renewal_cycle_years?: number | null
          state?: string | null
          system_of_medicine?: string
          updated_at?: string | null
        }
        Update: {
          category_1_minimum?: number | null
          category_2_minimum?: number | null
          council_name?: string
          created_at?: string | null
          credits_required_per_year?: number
          description?: string | null
          id?: string
          is_active?: boolean | null
          renewal_cycle_years?: number | null
          state?: string | null
          system_of_medicine?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      coin_redemptions: {
        Row: {
          coins_spent: number
          id: string
          item_id: string
          item_title: string
          redeemed_at: string | null
          status: string
          user_id: string
        }
        Insert: {
          coins_spent: number
          id?: string
          item_id: string
          item_title: string
          redeemed_at?: string | null
          status?: string
          user_id: string
        }
        Update: {
          coins_spent?: number
          id?: string
          item_id?: string
          item_title?: string
          redeemed_at?: string | null
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "coin_redemptions_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "coin_store_items"
            referencedColumns: ["id"]
          },
        ]
      }
      coin_store_items: {
        Row: {
          category: string
          coin_price: number
          created_at: string | null
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          redemption_count: number | null
          stock: number | null
          title: string
          updated_at: string | null
        }
        Insert: {
          category?: string
          coin_price: number
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          redemption_count?: number | null
          stock?: number | null
          title: string
          updated_at?: string | null
        }
        Update: {
          category?: string
          coin_price?: number
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          redemption_count?: number | null
          stock?: number | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      coin_transactions: {
        Row: {
          action: string
          badge_id: string | null
          balance_after: number
          coins: number
          created_at: string
          emoji: string | null
          id: string
          metadata: Json | null
          points: number
          role: string
          user_id: string
        }
        Insert: {
          action: string
          badge_id?: string | null
          balance_after?: number
          coins: number
          created_at?: string
          emoji?: string | null
          id?: string
          metadata?: Json | null
          points?: number
          role: string
          user_id: string
        }
        Update: {
          action?: string
          badge_id?: string | null
          balance_after?: number
          coins?: number
          created_at?: string
          emoji?: string | null
          id?: string
          metadata?: Json | null
          points?: number
          role?: string
          user_id?: string
        }
        Relationships: []
      }
      college_chapters: {
        Row: {
          college_name: string
          course: string | null
          created_at: string | null
          created_by: string
          description: string | null
          id: string
          member_count: number
          state: string | null
          updated_at: string | null
        }
        Insert: {
          college_name: string
          course?: string | null
          created_at?: string | null
          created_by: string
          description?: string | null
          id?: string
          member_count?: number
          state?: string | null
          updated_at?: string | null
        }
        Update: {
          college_name?: string
          course?: string | null
          created_at?: string | null
          created_by?: string
          description?: string | null
          id?: string
          member_count?: number
          state?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      competition_participants: {
        Row: {
          college_name: string | null
          competition_id: string
          id: string
          joined_at: string | null
          user_id: string
        }
        Insert: {
          college_name?: string | null
          competition_id: string
          id?: string
          joined_at?: string | null
          user_id: string
        }
        Update: {
          college_name?: string | null
          competition_id?: string
          id?: string
          joined_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "competition_participants_competition_id_fkey"
            columns: ["competition_id"]
            isOneToOne: false
            referencedRelation: "quiz_competitions"
            referencedColumns: ["id"]
          },
        ]
      }
      competition_scores: {
        Row: {
          college_name: string | null
          competition_id: string
          correct_answers: number
          id: string
          score: number
          submitted_at: string | null
          time_taken_seconds: number
          total_questions: number
          user_id: string
        }
        Insert: {
          college_name?: string | null
          competition_id: string
          correct_answers?: number
          id?: string
          score?: number
          submitted_at?: string | null
          time_taken_seconds?: number
          total_questions?: number
          user_id: string
        }
        Update: {
          college_name?: string | null
          competition_id?: string
          correct_answers?: number
          id?: string
          score?: number
          submitted_at?: string | null
          time_taken_seconds?: number
          total_questions?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "competition_scores_competition_id_fkey"
            columns: ["competition_id"]
            isOneToOne: false
            referencedRelation: "quiz_competitions"
            referencedColumns: ["id"]
          },
        ]
      }
      consultation_templates: {
        Row: {
          chief_complaints: string | null
          condition: string
          created_at: string | null
          diet: string | null
          doctor_id: string
          examination: string | null
          follow_up_days: number | null
          id: string
          is_active: boolean | null
          is_shared: boolean | null
          lifestyle: string | null
          name: string
          prescription: string | null
          system_of_medicine: string | null
          tags: string[] | null
          updated_at: string | null
          usage_count: number | null
          yoga: string | null
        }
        Insert: {
          chief_complaints?: string | null
          condition: string
          created_at?: string | null
          diet?: string | null
          doctor_id: string
          examination?: string | null
          follow_up_days?: number | null
          id?: string
          is_active?: boolean | null
          is_shared?: boolean | null
          lifestyle?: string | null
          name: string
          prescription?: string | null
          system_of_medicine?: string | null
          tags?: string[] | null
          updated_at?: string | null
          usage_count?: number | null
          yoga?: string | null
        }
        Update: {
          chief_complaints?: string | null
          condition?: string
          created_at?: string | null
          diet?: string | null
          doctor_id?: string
          examination?: string | null
          follow_up_days?: number | null
          id?: string
          is_active?: boolean | null
          is_shared?: boolean | null
          lifestyle?: string | null
          name?: string
          prescription?: string | null
          system_of_medicine?: string | null
          tags?: string[] | null
          updated_at?: string | null
          usage_count?: number | null
          yoga?: string | null
        }
        Relationships: []
      }
      content_submissions: {
        Row: {
          content_json: Json
          content_type: string
          created_at: string | null
          id: string
          review_note: string | null
          reviewed_by: string | null
          status: string
          submitted_by: string
          title: string
          updated_at: string | null
        }
        Insert: {
          content_json?: Json
          content_type: string
          created_at?: string | null
          id?: string
          review_note?: string | null
          reviewed_by?: string | null
          status?: string
          submitted_by: string
          title: string
          updated_at?: string | null
        }
        Update: {
          content_json?: Json
          content_type?: string
          created_at?: string | null
          id?: string
          review_note?: string | null
          reviewed_by?: string | null
          status?: string
          submitted_by?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      developer_api_keys: {
        Row: {
          allowed_endpoints: string[] | null
          api_key: string
          api_secret_hash: string
          app_description: string | null
          app_name: string | null
          app_url: string | null
          created_at: string | null
          expires_at: string | null
          id: string
          ip_whitelist: string[] | null
          key_name: string
          key_prefix: string
          last_used_at: string | null
          monthly_quota: number | null
          owner_id: string
          plan: string | null
          rate_limit_per_day: number | null
          rate_limit_per_minute: number | null
          redirect_uri: string | null
          requests_this_month: number | null
          scopes: string[] | null
          status: string | null
          total_requests: number | null
          updated_at: string | null
          webhook_url: string | null
        }
        Insert: {
          allowed_endpoints?: string[] | null
          api_key: string
          api_secret_hash: string
          app_description?: string | null
          app_name?: string | null
          app_url?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          ip_whitelist?: string[] | null
          key_name: string
          key_prefix: string
          last_used_at?: string | null
          monthly_quota?: number | null
          owner_id: string
          plan?: string | null
          rate_limit_per_day?: number | null
          rate_limit_per_minute?: number | null
          redirect_uri?: string | null
          requests_this_month?: number | null
          scopes?: string[] | null
          status?: string | null
          total_requests?: number | null
          updated_at?: string | null
          webhook_url?: string | null
        }
        Update: {
          allowed_endpoints?: string[] | null
          api_key?: string
          api_secret_hash?: string
          app_description?: string | null
          app_name?: string | null
          app_url?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          ip_whitelist?: string[] | null
          key_name?: string
          key_prefix?: string
          last_used_at?: string | null
          monthly_quota?: number | null
          owner_id?: string
          plan?: string | null
          rate_limit_per_day?: number | null
          rate_limit_per_minute?: number | null
          redirect_uri?: string | null
          requests_this_month?: number | null
          scopes?: string[] | null
          status?: string | null
          total_requests?: number | null
          updated_at?: string | null
          webhook_url?: string | null
        }
        Relationships: []
      }
      developer_api_usage: {
        Row: {
          api_key_id: string
          created_at: string | null
          endpoint: string
          error_code: string | null
          error_message: string | null
          id: string
          ip_address: string | null
          method: string
          request_body_size: number | null
          response_body_size: number | null
          response_time_ms: number | null
          status_code: number | null
          user_agent: string | null
        }
        Insert: {
          api_key_id: string
          created_at?: string | null
          endpoint: string
          error_code?: string | null
          error_message?: string | null
          id?: string
          ip_address?: string | null
          method: string
          request_body_size?: number | null
          response_body_size?: number | null
          response_time_ms?: number | null
          status_code?: number | null
          user_agent?: string | null
        }
        Update: {
          api_key_id?: string
          created_at?: string | null
          endpoint?: string
          error_code?: string | null
          error_message?: string | null
          id?: string
          ip_address?: string | null
          method?: string
          request_body_size?: number | null
          response_body_size?: number | null
          response_time_ms?: number | null
          status_code?: number | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "developer_api_usage_api_key_id_fkey"
            columns: ["api_key_id"]
            isOneToOne: false
            referencedRelation: "developer_api_keys"
            referencedColumns: ["id"]
          },
        ]
      }
      developer_webhooks: {
        Row: {
          api_key_id: string
          created_at: string | null
          events: string[]
          failure_count: number | null
          id: string
          is_active: boolean | null
          last_triggered_at: string | null
          secret: string
          url: string
        }
        Insert: {
          api_key_id: string
          created_at?: string | null
          events?: string[]
          failure_count?: number | null
          id?: string
          is_active?: boolean | null
          last_triggered_at?: string | null
          secret: string
          url: string
        }
        Update: {
          api_key_id?: string
          created_at?: string | null
          events?: string[]
          failure_count?: number | null
          id?: string
          is_active?: boolean | null
          last_triggered_at?: string | null
          secret?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "developer_webhooks_api_key_id_fkey"
            columns: ["api_key_id"]
            isOneToOne: false
            referencedRelation: "developer_api_keys"
            referencedColumns: ["id"]
          },
        ]
      }
      dispenza_emotion_journal: {
        Row: {
          biggest_insight: string | null
          body_area_focused: string | null
          created_at: string | null
          entry_date: string
          future_self_description: string | null
          future_self_feeling: string | null
          gratitude_items: string[] | null
          healing_intention: string | null
          id: string
          joy_items: string[] | null
          love_items: string[] | null
          mobility_feeling: string | null
          overall_mood: string | null
          session_id: string | null
          spine_pain_level: number | null
          synchronicities: string | null
          user_id: string
        }
        Insert: {
          biggest_insight?: string | null
          body_area_focused?: string | null
          created_at?: string | null
          entry_date?: string
          future_self_description?: string | null
          future_self_feeling?: string | null
          gratitude_items?: string[] | null
          healing_intention?: string | null
          id?: string
          joy_items?: string[] | null
          love_items?: string[] | null
          mobility_feeling?: string | null
          overall_mood?: string | null
          session_id?: string | null
          spine_pain_level?: number | null
          synchronicities?: string | null
          user_id: string
        }
        Update: {
          biggest_insight?: string | null
          body_area_focused?: string | null
          created_at?: string | null
          entry_date?: string
          future_self_description?: string | null
          future_self_feeling?: string | null
          gratitude_items?: string[] | null
          healing_intention?: string | null
          id?: string
          joy_items?: string[] | null
          love_items?: string[] | null
          mobility_feeling?: string | null
          overall_mood?: string | null
          session_id?: string | null
          spine_pain_level?: number | null
          synchronicities?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "dispenza_emotion_journal_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "dispenza_meditation_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      dispenza_group_coherence: {
        Row: {
          attended_count: number | null
          created_at: string | null
          description: string | null
          duration_minutes: number | null
          event_date: string
          facilitator_id: string | null
          group_coherence_score: number | null
          healing_intention: string | null
          id: string
          location_name: string | null
          max_participants: number | null
          meeting_link: string | null
          mode: string | null
          registered_count: number | null
          start_time: string
          status: string | null
          target_condition: string | null
          testimonials: Json | null
          title: string
          tool_id: string | null
          updated_at: string | null
        }
        Insert: {
          attended_count?: number | null
          created_at?: string | null
          description?: string | null
          duration_minutes?: number | null
          event_date: string
          facilitator_id?: string | null
          group_coherence_score?: number | null
          healing_intention?: string | null
          id?: string
          location_name?: string | null
          max_participants?: number | null
          meeting_link?: string | null
          mode?: string | null
          registered_count?: number | null
          start_time: string
          status?: string | null
          target_condition?: string | null
          testimonials?: Json | null
          title: string
          tool_id?: string | null
          updated_at?: string | null
        }
        Update: {
          attended_count?: number | null
          created_at?: string | null
          description?: string | null
          duration_minutes?: number | null
          event_date?: string
          facilitator_id?: string | null
          group_coherence_score?: number | null
          healing_intention?: string | null
          id?: string
          location_name?: string | null
          max_participants?: number | null
          meeting_link?: string | null
          mode?: string | null
          registered_count?: number | null
          start_time?: string
          status?: string | null
          target_condition?: string | null
          testimonials?: Json | null
          title?: string
          tool_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "dispenza_group_coherence_tool_id_fkey"
            columns: ["tool_id"]
            isOneToOne: false
            referencedRelation: "dispenza_meditation_tools"
            referencedColumns: ["id"]
          },
        ]
      }
      dispenza_meditation_prescriptions: {
        Row: {
          compliance_pct: number | null
          created_at: string | null
          diagnosis: string | null
          doctor_id: string
          doctor_notes: string | null
          duration_weeks: number | null
          end_date: string | null
          frequency: string | null
          id: string
          min_minutes_per_session: number | null
          paired_exercise_rx_id: string | null
          paired_therapy: string | null
          patient_id: string
          patient_instructions: string | null
          precautions: string | null
          preferred_time: string | null
          review_date: string | null
          sequence_instruction: string | null
          spinal_condition: string | null
          start_date: string | null
          status: string | null
          tool_ids: string[]
          updated_at: string | null
        }
        Insert: {
          compliance_pct?: number | null
          created_at?: string | null
          diagnosis?: string | null
          doctor_id: string
          doctor_notes?: string | null
          duration_weeks?: number | null
          end_date?: string | null
          frequency?: string | null
          id?: string
          min_minutes_per_session?: number | null
          paired_exercise_rx_id?: string | null
          paired_therapy?: string | null
          patient_id: string
          patient_instructions?: string | null
          precautions?: string | null
          preferred_time?: string | null
          review_date?: string | null
          sequence_instruction?: string | null
          spinal_condition?: string | null
          start_date?: string | null
          status?: string | null
          tool_ids?: string[]
          updated_at?: string | null
        }
        Update: {
          compliance_pct?: number | null
          created_at?: string | null
          diagnosis?: string | null
          doctor_id?: string
          doctor_notes?: string | null
          duration_weeks?: number | null
          end_date?: string | null
          frequency?: string | null
          id?: string
          min_minutes_per_session?: number | null
          paired_exercise_rx_id?: string | null
          paired_therapy?: string | null
          patient_id?: string
          patient_instructions?: string | null
          precautions?: string | null
          preferred_time?: string | null
          review_date?: string | null
          sequence_instruction?: string | null
          spinal_condition?: string | null
          start_date?: string | null
          status?: string | null
          tool_ids?: string[]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "dispenza_meditation_prescriptions_paired_exercise_rx_id_fkey"
            columns: ["paired_exercise_rx_id"]
            isOneToOne: false
            referencedRelation: "spine_ayush_exercise_prescriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      dispenza_meditation_progress: {
        Row: {
          avg_depth_rating: number | null
          avg_energy_gain: number | null
          avg_pain_reduction: number | null
          badges: string[] | null
          coherence_score: number | null
          coherence_trend: string | null
          coins_earned: number | null
          created_at: string | null
          current_streak_days: number | null
          id: string
          last_session_date: string | null
          longest_streak_days: number | null
          meditation_level: number | null
          most_used_tool_id: string | null
          preferred_time: string | null
          spine_recovery_correlation: number | null
          total_days_practiced: number | null
          total_minutes: number | null
          total_sessions: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          avg_depth_rating?: number | null
          avg_energy_gain?: number | null
          avg_pain_reduction?: number | null
          badges?: string[] | null
          coherence_score?: number | null
          coherence_trend?: string | null
          coins_earned?: number | null
          created_at?: string | null
          current_streak_days?: number | null
          id?: string
          last_session_date?: string | null
          longest_streak_days?: number | null
          meditation_level?: number | null
          most_used_tool_id?: string | null
          preferred_time?: string | null
          spine_recovery_correlation?: number | null
          total_days_practiced?: number | null
          total_minutes?: number | null
          total_sessions?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          avg_depth_rating?: number | null
          avg_energy_gain?: number | null
          avg_pain_reduction?: number | null
          badges?: string[] | null
          coherence_score?: number | null
          coherence_trend?: string | null
          coins_earned?: number | null
          created_at?: string | null
          current_streak_days?: number | null
          id?: string
          last_session_date?: string | null
          longest_streak_days?: number | null
          meditation_level?: number | null
          most_used_tool_id?: string | null
          preferred_time?: string | null
          spine_recovery_correlation?: number | null
          total_days_practiced?: number | null
          total_minutes?: number | null
          total_sessions?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "dispenza_meditation_progress_most_used_tool_id_fkey"
            columns: ["most_used_tool_id"]
            isOneToOne: false
            referencedRelation: "dispenza_meditation_tools"
            referencedColumns: ["id"]
          },
        ]
      }
      dispenza_meditation_schedule: {
        Row: {
          created_at: string | null
          day_of_week: number | null
          duration_minutes: number | null
          id: string
          is_active: boolean | null
          reminder_enabled: boolean | null
          reminder_minutes_before: number | null
          scheduled_time: string | null
          time_slot: string
          tool_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          day_of_week?: number | null
          duration_minutes?: number | null
          id?: string
          is_active?: boolean | null
          reminder_enabled?: boolean | null
          reminder_minutes_before?: number | null
          scheduled_time?: string | null
          time_slot: string
          tool_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          day_of_week?: number | null
          duration_minutes?: number | null
          id?: string
          is_active?: boolean | null
          reminder_enabled?: boolean | null
          reminder_minutes_before?: number | null
          scheduled_time?: string | null
          time_slot?: string
          tool_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "dispenza_meditation_schedule_tool_id_fkey"
            columns: ["tool_id"]
            isOneToOne: false
            referencedRelation: "dispenza_meditation_tools"
            referencedColumns: ["id"]
          },
        ]
      }
      dispenza_meditation_sessions: {
        Row: {
          body_sensations: string | null
          challenges: string | null
          completed: boolean | null
          created_at: string | null
          depth_rating: number | null
          duration_minutes: number
          elevated_emotions: string[] | null
          emotion_after: string | null
          emotion_before: string | null
          end_time: string | null
          energy_after: number | null
          energy_before: number | null
          environment: string | null
          guided_audio_used: boolean | null
          id: string
          insights: string | null
          pain_after: number | null
          pain_before: number | null
          session_date: string
          spine_awareness_notes: string | null
          start_time: string | null
          time_of_day: string | null
          tool_id: string
          user_id: string
        }
        Insert: {
          body_sensations?: string | null
          challenges?: string | null
          completed?: boolean | null
          created_at?: string | null
          depth_rating?: number | null
          duration_minutes?: number
          elevated_emotions?: string[] | null
          emotion_after?: string | null
          emotion_before?: string | null
          end_time?: string | null
          energy_after?: number | null
          energy_before?: number | null
          environment?: string | null
          guided_audio_used?: boolean | null
          id?: string
          insights?: string | null
          pain_after?: number | null
          pain_before?: number | null
          session_date?: string
          spine_awareness_notes?: string | null
          start_time?: string | null
          time_of_day?: string | null
          tool_id: string
          user_id: string
        }
        Update: {
          body_sensations?: string | null
          challenges?: string | null
          completed?: boolean | null
          created_at?: string | null
          depth_rating?: number | null
          duration_minutes?: number
          elevated_emotions?: string[] | null
          emotion_after?: string | null
          emotion_before?: string | null
          end_time?: string | null
          energy_after?: number | null
          energy_before?: number | null
          environment?: string | null
          guided_audio_used?: boolean | null
          id?: string
          insights?: string | null
          pain_after?: number | null
          pain_before?: number | null
          session_date?: string
          spine_awareness_notes?: string | null
          start_time?: string | null
          time_of_day?: string | null
          tool_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "dispenza_meditation_sessions_tool_id_fkey"
            columns: ["tool_id"]
            isOneToOne: false
            referencedRelation: "dispenza_meditation_tools"
            referencedColumns: ["id"]
          },
        ]
      }
      dispenza_meditation_tools: {
        Row: {
          audio_url: string | null
          best_time_of_day: string | null
          category: string
          color_class: string | null
          contraindications: string[] | null
          cover_image_url: string | null
          created_at: string | null
          description: string
          difficulty_level: string | null
          dosha_affinity: string | null
          duration_minutes: number
          for_role: string[] | null
          icon_name: string | null
          id: string
          is_active: boolean | null
          is_premium: boolean | null
          main_steps: Json | null
          pairs_with_modules: number[] | null
          post_meditation_steps: Json | null
          preparation_steps: Json | null
          sort_order: number | null
          spine_relevance: string | null
          subtitle: string | null
          tags: string[] | null
          target_spinal_regions: string[] | null
          title: string
          tool_number: number
          updated_at: string | null
          video_url: string | null
        }
        Insert: {
          audio_url?: string | null
          best_time_of_day?: string | null
          category: string
          color_class?: string | null
          contraindications?: string[] | null
          cover_image_url?: string | null
          created_at?: string | null
          description: string
          difficulty_level?: string | null
          dosha_affinity?: string | null
          duration_minutes?: number
          for_role?: string[] | null
          icon_name?: string | null
          id?: string
          is_active?: boolean | null
          is_premium?: boolean | null
          main_steps?: Json | null
          pairs_with_modules?: number[] | null
          post_meditation_steps?: Json | null
          preparation_steps?: Json | null
          sort_order?: number | null
          spine_relevance?: string | null
          subtitle?: string | null
          tags?: string[] | null
          target_spinal_regions?: string[] | null
          title: string
          tool_number: number
          updated_at?: string | null
          video_url?: string | null
        }
        Update: {
          audio_url?: string | null
          best_time_of_day?: string | null
          category?: string
          color_class?: string | null
          contraindications?: string[] | null
          cover_image_url?: string | null
          created_at?: string | null
          description?: string
          difficulty_level?: string | null
          dosha_affinity?: string | null
          duration_minutes?: number
          for_role?: string[] | null
          icon_name?: string | null
          id?: string
          is_active?: boolean | null
          is_premium?: boolean | null
          main_steps?: Json | null
          pairs_with_modules?: number[] | null
          post_meditation_steps?: Json | null
          preparation_steps?: Json | null
          sort_order?: number | null
          spine_relevance?: string | null
          subtitle?: string | null
          tags?: string[] | null
          target_spinal_regions?: string[] | null
          title?: string
          tool_number?: number
          updated_at?: string | null
          video_url?: string | null
        }
        Relationships: []
      }
      dispenza_premium_access: {
        Row: {
          access_type: string
          created_at: string | null
          email: string
          expires_at: string | null
          granted_by: string
          id: string
          is_active: boolean | null
          notes: string | null
          patient_name: string | null
          phone: string | null
          updated_at: string | null
        }
        Insert: {
          access_type?: string
          created_at?: string | null
          email: string
          expires_at?: string | null
          granted_by?: string
          id?: string
          is_active?: boolean | null
          notes?: string | null
          patient_name?: string | null
          phone?: string | null
          updated_at?: string | null
        }
        Update: {
          access_type?: string
          created_at?: string | null
          email?: string
          expires_at?: string | null
          granted_by?: string
          id?: string
          is_active?: boolean | null
          notes?: string | null
          patient_name?: string | null
          phone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      doctor_articles: {
        Row: {
          author_id: string
          bookmark_count: number | null
          category: string
          comment_count: number | null
          content: string
          cover_image_url: string | null
          created_at: string | null
          id: string
          is_featured: boolean | null
          language: string | null
          like_count: number | null
          peer_review_required: boolean | null
          published_at: string | null
          reading_time_minutes: number | null
          references_list: Json | null
          review_comments: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          seo_description: string | null
          seo_title: string | null
          share_count: number | null
          slug: string | null
          status: string
          summary: string | null
          system_of_medicine: string | null
          tags: string[] | null
          title: string
          updated_at: string | null
          view_count: number | null
        }
        Insert: {
          author_id: string
          bookmark_count?: number | null
          category?: string
          comment_count?: number | null
          content: string
          cover_image_url?: string | null
          created_at?: string | null
          id?: string
          is_featured?: boolean | null
          language?: string | null
          like_count?: number | null
          peer_review_required?: boolean | null
          published_at?: string | null
          reading_time_minutes?: number | null
          references_list?: Json | null
          review_comments?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          seo_description?: string | null
          seo_title?: string | null
          share_count?: number | null
          slug?: string | null
          status?: string
          summary?: string | null
          system_of_medicine?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
          view_count?: number | null
        }
        Update: {
          author_id?: string
          bookmark_count?: number | null
          category?: string
          comment_count?: number | null
          content?: string
          cover_image_url?: string | null
          created_at?: string | null
          id?: string
          is_featured?: boolean | null
          language?: string | null
          like_count?: number | null
          peer_review_required?: boolean | null
          published_at?: string | null
          reading_time_minutes?: number | null
          references_list?: Json | null
          review_comments?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          seo_description?: string | null
          seo_title?: string | null
          share_count?: number | null
          slug?: string | null
          status?: string
          summary?: string | null
          system_of_medicine?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
          view_count?: number | null
        }
        Relationships: []
      }
      doctor_follows: {
        Row: {
          created_at: string | null
          follower_id: string
          following_id: string
          id: string
        }
        Insert: {
          created_at?: string | null
          follower_id: string
          following_id: string
          id?: string
        }
        Update: {
          created_at?: string | null
          follower_id?: string
          following_id?: string
          id?: string
        }
        Relationships: []
      }
      doctor_online_status: {
        Row: {
          accepting_consultations: boolean | null
          accepting_referrals: boolean | null
          created_at: string | null
          doctor_id: string
          is_online: boolean | null
          last_active_at: string | null
          status_text: string | null
          updated_at: string | null
        }
        Insert: {
          accepting_consultations?: boolean | null
          accepting_referrals?: boolean | null
          created_at?: string | null
          doctor_id: string
          is_online?: boolean | null
          last_active_at?: string | null
          status_text?: string | null
          updated_at?: string | null
        }
        Update: {
          accepting_consultations?: boolean | null
          accepting_referrals?: boolean | null
          created_at?: string | null
          doctor_id?: string
          is_online?: boolean | null
          last_active_at?: string | null
          status_text?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      doctor_payouts: {
        Row: {
          amount: number
          breakdown: Json | null
          created_at: string | null
          doctor_id: string
          id: string
          method: string | null
          notes: string | null
          payout_date: string
          period_from: string
          period_to: string
          reference_number: string | null
          status: string | null
        }
        Insert: {
          amount: number
          breakdown?: Json | null
          created_at?: string | null
          doctor_id: string
          id?: string
          method?: string | null
          notes?: string | null
          payout_date: string
          period_from: string
          period_to: string
          reference_number?: string | null
          status?: string | null
        }
        Update: {
          amount?: number
          breakdown?: Json | null
          created_at?: string | null
          doctor_id?: string
          id?: string
          method?: string | null
          notes?: string | null
          payout_date?: string
          period_from?: string
          period_to?: string
          reference_number?: string | null
          status?: string | null
        }
        Relationships: []
      }
      doctor_revenue_entries: {
        Row: {
          amount: number
          appointment_id: string | null
          category: string
          created_at: string | null
          description: string | null
          doctor_id: string
          entry_date: string
          id: string
          patient_id: string | null
          payment_status: string | null
        }
        Insert: {
          amount?: number
          appointment_id?: string | null
          category: string
          created_at?: string | null
          description?: string | null
          doctor_id: string
          entry_date: string
          id?: string
          patient_id?: string | null
          payment_status?: string | null
        }
        Update: {
          amount?: number
          appointment_id?: string | null
          category?: string
          created_at?: string | null
          description?: string | null
          doctor_id?: string
          entry_date?: string
          id?: string
          patient_id?: string | null
          payment_status?: string | null
        }
        Relationships: []
      }
      doctor_verifications: {
        Row: {
          additional_qualifications: Json | null
          badge_level: string | null
          certificate_url: string | null
          council_state: string | null
          created_at: string | null
          degree: string
          doctor_id: string
          expiry_date: string | null
          full_name: string
          id: string
          id_proof_url: string | null
          registration_certificate_url: string | null
          registration_council: string
          registration_number: string
          rejection_reason: string | null
          status: string
          system_of_medicine: string
          university: string | null
          updated_at: string | null
          verification_notes: string | null
          verified_at: string | null
          verified_by: string | null
          year_of_passing: number | null
        }
        Insert: {
          additional_qualifications?: Json | null
          badge_level?: string | null
          certificate_url?: string | null
          council_state?: string | null
          created_at?: string | null
          degree: string
          doctor_id: string
          expiry_date?: string | null
          full_name: string
          id?: string
          id_proof_url?: string | null
          registration_certificate_url?: string | null
          registration_council: string
          registration_number: string
          rejection_reason?: string | null
          status?: string
          system_of_medicine?: string
          university?: string | null
          updated_at?: string | null
          verification_notes?: string | null
          verified_at?: string | null
          verified_by?: string | null
          year_of_passing?: number | null
        }
        Update: {
          additional_qualifications?: Json | null
          badge_level?: string | null
          certificate_url?: string | null
          council_state?: string | null
          created_at?: string | null
          degree?: string
          doctor_id?: string
          expiry_date?: string | null
          full_name?: string
          id?: string
          id_proof_url?: string | null
          registration_certificate_url?: string | null
          registration_council?: string
          registration_number?: string
          rejection_reason?: string | null
          status?: string
          system_of_medicine?: string
          university?: string | null
          updated_at?: string | null
          verification_notes?: string | null
          verified_at?: string | null
          verified_by?: string | null
          year_of_passing?: number | null
        }
        Relationships: []
      }
      doctors: {
        Row: {
          avatar_url: string | null
          bio: string | null
          category: string
          city: string
          clinic_name: string | null
          consultation_fee: number
          created_at: string
          experience_years: number
          full_name: string
          hms_access: boolean
          hms_access_expiry: string | null
          hms_access_granted_at: string | null
          hms_access_granted_by: string | null
          hms_branch: string | null
          hms_branches: string[] | null
          hms_center_type: string | null
          hms_modules: string[] | null
          hms_role: string | null
          id: string
          in_clinic_available: boolean
          is_approved: boolean
          is_suspended: boolean | null
          is_verified: boolean
          languages: string[]
          phone: string | null
          rating: number
          rejection_reason: string | null
          specialization: string
          suspended_at: string | null
          suspended_reason: string | null
          total_reviews: number
          user_id: string | null
          vaidya_access: boolean | null
          verification_status: string | null
          video_available: boolean
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          category?: string
          city?: string
          clinic_name?: string | null
          consultation_fee?: number
          created_at?: string
          experience_years?: number
          full_name: string
          hms_access?: boolean
          hms_access_expiry?: string | null
          hms_access_granted_at?: string | null
          hms_access_granted_by?: string | null
          hms_branch?: string | null
          hms_branches?: string[] | null
          hms_center_type?: string | null
          hms_modules?: string[] | null
          hms_role?: string | null
          id?: string
          in_clinic_available?: boolean
          is_approved?: boolean
          is_suspended?: boolean | null
          is_verified?: boolean
          languages?: string[]
          phone?: string | null
          rating?: number
          rejection_reason?: string | null
          specialization?: string
          suspended_at?: string | null
          suspended_reason?: string | null
          total_reviews?: number
          user_id?: string | null
          vaidya_access?: boolean | null
          verification_status?: string | null
          video_available?: boolean
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          category?: string
          city?: string
          clinic_name?: string | null
          consultation_fee?: number
          created_at?: string
          experience_years?: number
          full_name?: string
          hms_access?: boolean
          hms_access_expiry?: string | null
          hms_access_granted_at?: string | null
          hms_access_granted_by?: string | null
          hms_branch?: string | null
          hms_branches?: string[] | null
          hms_center_type?: string | null
          hms_modules?: string[] | null
          hms_role?: string | null
          id?: string
          in_clinic_available?: boolean
          is_approved?: boolean
          is_suspended?: boolean | null
          is_verified?: boolean
          languages?: string[]
          phone?: string | null
          rating?: number
          rejection_reason?: string | null
          specialization?: string
          suspended_at?: string | null
          suspended_reason?: string | null
          total_reviews?: number
          user_id?: string | null
          vaidya_access?: boolean | null
          verification_status?: string | null
          video_available?: boolean
        }
        Relationships: []
      }
      document_parsing_queue: {
        Row: {
          attempts: number | null
          created_at: string | null
          document_id: string
          error_log: Json | null
          id: string
          last_attempt_at: string | null
          max_attempts: number | null
          next_retry_at: string | null
          patient_id: string
          priority: number | null
          status: string | null
          worker_id: string | null
        }
        Insert: {
          attempts?: number | null
          created_at?: string | null
          document_id: string
          error_log?: Json | null
          id?: string
          last_attempt_at?: string | null
          max_attempts?: number | null
          next_retry_at?: string | null
          patient_id: string
          priority?: number | null
          status?: string | null
          worker_id?: string | null
        }
        Update: {
          attempts?: number | null
          created_at?: string | null
          document_id?: string
          error_log?: Json | null
          id?: string
          last_attempt_at?: string | null
          max_attempts?: number | null
          next_retry_at?: string | null
          patient_id?: string
          priority?: number | null
          status?: string | null
          worker_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "document_parsing_queue_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "parsed_medical_documents"
            referencedColumns: ["id"]
          },
        ]
      }
      drug_herb_interactions: {
        Row: {
          affected_population: string | null
          classical_reference: string | null
          clinical_effect: string
          created_at: string | null
          evidence_level: string | null
          id: string
          interaction_type: string
          is_verified: boolean | null
          mechanism: string
          modern_reference: string | null
          onset_timing: string | null
          recommendation: string
          severity: string
          substance_1_id: string
          substance_2_id: string
          updated_at: string | null
          verified_by: string | null
        }
        Insert: {
          affected_population?: string | null
          classical_reference?: string | null
          clinical_effect: string
          created_at?: string | null
          evidence_level?: string | null
          id?: string
          interaction_type: string
          is_verified?: boolean | null
          mechanism: string
          modern_reference?: string | null
          onset_timing?: string | null
          recommendation: string
          severity: string
          substance_1_id: string
          substance_2_id: string
          updated_at?: string | null
          verified_by?: string | null
        }
        Update: {
          affected_population?: string | null
          classical_reference?: string | null
          clinical_effect?: string
          created_at?: string | null
          evidence_level?: string | null
          id?: string
          interaction_type?: string
          is_verified?: boolean | null
          mechanism?: string
          modern_reference?: string | null
          onset_timing?: string | null
          recommendation?: string
          severity?: string
          substance_1_id?: string
          substance_2_id?: string
          updated_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "drug_herb_interactions_substance_1_id_fkey"
            columns: ["substance_1_id"]
            isOneToOne: false
            referencedRelation: "interaction_substances"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "drug_herb_interactions_substance_2_id_fkey"
            columns: ["substance_2_id"]
            isOneToOne: false
            referencedRelation: "interaction_substances"
            referencedColumns: ["id"]
          },
        ]
      }
      employer_verifications: {
        Row: {
          additional_document_url: string | null
          contact_email: string | null
          contact_person: string | null
          contact_phone: string | null
          created_at: string
          id: string
          organization_name: string
          organization_type: string
          registration_authority: string | null
          registration_certificate_url: string | null
          registration_number: string | null
          rejection_reason: string | null
          trade_license_url: string | null
          updated_at: string
          user_id: string
          verification_level: number | null
          verification_status: string
          verified_at: string | null
          verified_by: string | null
          website_url: string | null
        }
        Insert: {
          additional_document_url?: string | null
          contact_email?: string | null
          contact_person?: string | null
          contact_phone?: string | null
          created_at?: string
          id?: string
          organization_name: string
          organization_type: string
          registration_authority?: string | null
          registration_certificate_url?: string | null
          registration_number?: string | null
          rejection_reason?: string | null
          trade_license_url?: string | null
          updated_at?: string
          user_id: string
          verification_level?: number | null
          verification_status?: string
          verified_at?: string | null
          verified_by?: string | null
          website_url?: string | null
        }
        Update: {
          additional_document_url?: string | null
          contact_email?: string | null
          contact_person?: string | null
          contact_phone?: string | null
          created_at?: string
          id?: string
          organization_name?: string
          organization_type?: string
          registration_authority?: string | null
          registration_certificate_url?: string | null
          registration_number?: string | null
          rejection_reason?: string | null
          trade_license_url?: string | null
          updated_at?: string
          user_id?: string
          verification_level?: number | null
          verification_status?: string
          verified_at?: string | null
          verified_by?: string | null
          website_url?: string | null
        }
        Relationships: []
      }
      feed_comments: {
        Row: {
          author_name: string
          body: string
          created_at: string | null
          id: string
          like_count: number | null
          post_id: string
          user_id: string
        }
        Insert: {
          author_name?: string
          body: string
          created_at?: string | null
          id?: string
          like_count?: number | null
          post_id: string
          user_id: string
        }
        Update: {
          author_name?: string
          body?: string
          created_at?: string | null
          id?: string
          like_count?: number | null
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
          created_at: string | null
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
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
      feed_mentions: {
        Row: {
          created_at: string | null
          id: string
          is_read: boolean | null
          mentioned_by: string
          mentioned_user_id: string
          post_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          mentioned_by: string
          mentioned_user_id: string
          post_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          mentioned_by?: string
          mentioned_user_id?: string
          post_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "feed_mentions_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "feed_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      feed_poll_votes: {
        Row: {
          created_at: string | null
          id: string
          option_index: number
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          option_index: number
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          option_index?: number
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "feed_poll_votes_post_id_fkey"
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
          author_specialization: string | null
          author_user_id: string
          body: string
          comment_count: number | null
          created_at: string | null
          id: string
          image_url: string | null
          is_published: boolean | null
          language: string | null
          like_count: number | null
          mentions: string[] | null
          poll_expires_at: string | null
          poll_options: Json | null
          post_type: string
          tags: string[] | null
          title: string | null
          updated_at: string | null
          visibility: string
        }
        Insert: {
          author_avatar_url?: string | null
          author_name?: string
          author_specialization?: string | null
          author_user_id: string
          body?: string
          comment_count?: number | null
          created_at?: string | null
          id?: string
          image_url?: string | null
          is_published?: boolean | null
          language?: string | null
          like_count?: number | null
          mentions?: string[] | null
          poll_expires_at?: string | null
          poll_options?: Json | null
          post_type?: string
          tags?: string[] | null
          title?: string | null
          updated_at?: string | null
          visibility?: string
        }
        Update: {
          author_avatar_url?: string | null
          author_name?: string
          author_specialization?: string | null
          author_user_id?: string
          body?: string
          comment_count?: number | null
          created_at?: string | null
          id?: string
          image_url?: string | null
          is_published?: boolean | null
          language?: string | null
          like_count?: number | null
          mentions?: string[] | null
          poll_expires_at?: string | null
          poll_options?: Json | null
          post_type?: string
          tags?: string[] | null
          title?: string | null
          updated_at?: string | null
          visibility?: string
        }
        Relationships: []
      }
      follow_up_reminders: {
        Row: {
          acknowledged_at: string | null
          appointment_id: string | null
          created_at: string | null
          doctor_id: string
          id: string
          notification_channel: string | null
          patient_id: string
          reason: string | null
          reminder_date: string
          reminder_days: number
          sent_at: string | null
          status: string
        }
        Insert: {
          acknowledged_at?: string | null
          appointment_id?: string | null
          created_at?: string | null
          doctor_id: string
          id?: string
          notification_channel?: string | null
          patient_id: string
          reason?: string | null
          reminder_date: string
          reminder_days?: number
          sent_at?: string | null
          status?: string
        }
        Update: {
          acknowledged_at?: string | null
          appointment_id?: string | null
          created_at?: string | null
          doctor_id?: string
          id?: string
          notification_channel?: string | null
          patient_id?: string
          reason?: string | null
          reminder_date?: string
          reminder_days?: number
          sent_at?: string | null
          status?: string
        }
        Relationships: []
      }
      freelance_gig_applications: {
        Row: {
          applied_at: string | null
          gig_id: string
          id: string
          pitch: string
          portfolio_url: string | null
          status: string
          user_id: string
        }
        Insert: {
          applied_at?: string | null
          gig_id: string
          id?: string
          pitch: string
          portfolio_url?: string | null
          status?: string
          user_id: string
        }
        Update: {
          applied_at?: string | null
          gig_id?: string
          id?: string
          pitch?: string
          portfolio_url?: string | null
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "freelance_gig_applications_gig_id_fkey"
            columns: ["gig_id"]
            isOneToOne: false
            referencedRelation: "freelance_gigs"
            referencedColumns: ["id"]
          },
        ]
      }
      freelance_gigs: {
        Row: {
          application_count: number | null
          budget: string | null
          category: string
          created_at: string | null
          description: string
          duration: string | null
          id: string
          is_active: boolean | null
          is_remote: boolean | null
          location: string | null
          posted_by: string | null
          poster_name: string | null
          skills_required: string[] | null
          title: string
        }
        Insert: {
          application_count?: number | null
          budget?: string | null
          category?: string
          created_at?: string | null
          description: string
          duration?: string | null
          id?: string
          is_active?: boolean | null
          is_remote?: boolean | null
          location?: string | null
          posted_by?: string | null
          poster_name?: string | null
          skills_required?: string[] | null
          title: string
        }
        Update: {
          application_count?: number | null
          budget?: string | null
          category?: string
          created_at?: string | null
          description?: string
          duration?: string | null
          id?: string
          is_active?: boolean | null
          is_remote?: boolean | null
          location?: string | null
          posted_by?: string | null
          poster_name?: string | null
          skills_required?: string[] | null
          title?: string
        }
        Relationships: []
      }
      hms_abdm_exchange_log: {
        Row: {
          abha_record_id: string | null
          branch: string | null
          completed_at: string | null
          direction: string
          error_message: string | null
          fhir_bundle_id: string | null
          id: string
          initiated_at: string | null
          initiated_by: string | null
          patient_id: string | null
          record_type: string
          status: string | null
        }
        Insert: {
          abha_record_id?: string | null
          branch?: string | null
          completed_at?: string | null
          direction: string
          error_message?: string | null
          fhir_bundle_id?: string | null
          id?: string
          initiated_at?: string | null
          initiated_by?: string | null
          patient_id?: string | null
          record_type: string
          status?: string | null
        }
        Update: {
          abha_record_id?: string | null
          branch?: string | null
          completed_at?: string | null
          direction?: string
          error_message?: string | null
          fhir_bundle_id?: string | null
          id?: string
          initiated_at?: string | null
          initiated_by?: string | null
          patient_id?: string | null
          record_type?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hms_abdm_exchange_log_abha_record_id_fkey"
            columns: ["abha_record_id"]
            isOneToOne: false
            referencedRelation: "hms_abha_records"
            referencedColumns: ["id"]
          },
        ]
      }
      hms_abha_records: {
        Row: {
          abdm_address: string | null
          abdm_dob: string | null
          abdm_gender: string | null
          abdm_name: string | null
          abdm_phone: string | null
          abdm_photo_url: string | null
          abha_address: string | null
          abha_number: string | null
          branch: string | null
          consent_expiry: string | null
          consent_granted: boolean | null
          consent_purpose: string | null
          created_at: string | null
          health_id: string | null
          id: string
          last_sync_at: string | null
          patient_display_id: string | null
          patient_id: string | null
          records_pulled: number | null
          records_pushed: number | null
          status: string | null
          updated_at: string | null
          verification_method: string | null
          verified: boolean | null
          verified_at: string | null
        }
        Insert: {
          abdm_address?: string | null
          abdm_dob?: string | null
          abdm_gender?: string | null
          abdm_name?: string | null
          abdm_phone?: string | null
          abdm_photo_url?: string | null
          abha_address?: string | null
          abha_number?: string | null
          branch?: string | null
          consent_expiry?: string | null
          consent_granted?: boolean | null
          consent_purpose?: string | null
          created_at?: string | null
          health_id?: string | null
          id?: string
          last_sync_at?: string | null
          patient_display_id?: string | null
          patient_id?: string | null
          records_pulled?: number | null
          records_pushed?: number | null
          status?: string | null
          updated_at?: string | null
          verification_method?: string | null
          verified?: boolean | null
          verified_at?: string | null
        }
        Update: {
          abdm_address?: string | null
          abdm_dob?: string | null
          abdm_gender?: string | null
          abdm_name?: string | null
          abdm_phone?: string | null
          abdm_photo_url?: string | null
          abha_address?: string | null
          abha_number?: string | null
          branch?: string | null
          consent_expiry?: string | null
          consent_granted?: boolean | null
          consent_purpose?: string | null
          created_at?: string | null
          health_id?: string | null
          id?: string
          last_sync_at?: string | null
          patient_display_id?: string | null
          patient_id?: string | null
          records_pulled?: number | null
          records_pushed?: number | null
          status?: string | null
          updated_at?: string | null
          verification_method?: string | null
          verified?: boolean | null
          verified_at?: string | null
        }
        Relationships: []
      }
      hms_access_requests: {
        Row: {
          approved_at: string | null
          approved_branch: string | null
          approved_by: string | null
          approved_modules: string[] | null
          approved_role: string | null
          center_name: string | null
          center_type: string | null
          created_at: string | null
          daily_patients: number | null
          doctor_user_id: string | null
          email: string
          experience_years: number | null
          full_name: string | null
          id: string
          message: string | null
          phone: string | null
          qualification: string | null
          reason: string | null
          rejection_reason: string | null
          requested_branch: string | null
          requested_role: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          role: string | null
          specialization: string | null
          status: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          approved_at?: string | null
          approved_branch?: string | null
          approved_by?: string | null
          approved_modules?: string[] | null
          approved_role?: string | null
          center_name?: string | null
          center_type?: string | null
          created_at?: string | null
          daily_patients?: number | null
          doctor_user_id?: string | null
          email: string
          experience_years?: number | null
          full_name?: string | null
          id?: string
          message?: string | null
          phone?: string | null
          qualification?: string | null
          reason?: string | null
          rejection_reason?: string | null
          requested_branch?: string | null
          requested_role?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          role?: string | null
          specialization?: string | null
          status?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          approved_at?: string | null
          approved_branch?: string | null
          approved_by?: string | null
          approved_modules?: string[] | null
          approved_role?: string | null
          center_name?: string | null
          center_type?: string | null
          created_at?: string | null
          daily_patients?: number | null
          doctor_user_id?: string | null
          email?: string
          experience_years?: number | null
          full_name?: string | null
          id?: string
          message?: string | null
          phone?: string | null
          qualification?: string | null
          reason?: string | null
          rejection_reason?: string | null
          requested_branch?: string | null
          requested_role?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          role?: string | null
          specialization?: string | null
          status?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      hms_access_roles: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_system: boolean | null
          location: string | null
          permissions: Json | null
          role_name: string
          users_count: number | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_system?: boolean | null
          location?: string | null
          permissions?: Json | null
          role_name: string
          users_count?: number | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_system?: boolean | null
          location?: string | null
          permissions?: Json | null
          role_name?: string
          users_count?: number | null
        }
        Relationships: []
      }
      hms_advance_utilization_log: {
        Row: {
          advance_id: string
          amount_deducted: number
          bill_id: string | null
          created_at: string | null
          deducted_by: string | null
          deducted_for: string
          id: string
        }
        Insert: {
          advance_id: string
          amount_deducted: number
          bill_id?: string | null
          created_at?: string | null
          deducted_by?: string | null
          deducted_for: string
          id?: string
        }
        Update: {
          advance_id?: string
          amount_deducted?: number
          bill_id?: string | null
          created_at?: string | null
          deducted_by?: string | null
          deducted_for?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "hms_advance_utilization_log_advance_id_fkey"
            columns: ["advance_id"]
            isOneToOne: false
            referencedRelation: "hms_patient_advances"
            referencedColumns: ["id"]
          },
        ]
      }
      hms_ai_scribe_sessions: {
        Row: {
          audio_url: string | null
          branch: string | null
          confidence_score: number | null
          created_at: string | null
          doctor_accepted: boolean | null
          doctor_edited: boolean | null
          doctor_user_id: string | null
          duration_seconds: number | null
          final_note_id: string | null
          generated_assessment: string | null
          generated_objective: string | null
          generated_plan: string | null
          generated_prescription: Json | null
          generated_subjective: string | null
          id: string
          language: string | null
          patient_id: string | null
          session_end: string | null
          session_start: string | null
          status: string | null
          transcript: string | null
          visit_id: string | null
        }
        Insert: {
          audio_url?: string | null
          branch?: string | null
          confidence_score?: number | null
          created_at?: string | null
          doctor_accepted?: boolean | null
          doctor_edited?: boolean | null
          doctor_user_id?: string | null
          duration_seconds?: number | null
          final_note_id?: string | null
          generated_assessment?: string | null
          generated_objective?: string | null
          generated_plan?: string | null
          generated_prescription?: Json | null
          generated_subjective?: string | null
          id?: string
          language?: string | null
          patient_id?: string | null
          session_end?: string | null
          session_start?: string | null
          status?: string | null
          transcript?: string | null
          visit_id?: string | null
        }
        Update: {
          audio_url?: string | null
          branch?: string | null
          confidence_score?: number | null
          created_at?: string | null
          doctor_accepted?: boolean | null
          doctor_edited?: boolean | null
          doctor_user_id?: string | null
          duration_seconds?: number | null
          final_note_id?: string | null
          generated_assessment?: string | null
          generated_objective?: string | null
          generated_plan?: string | null
          generated_prescription?: Json | null
          generated_subjective?: string | null
          id?: string
          language?: string | null
          patient_id?: string | null
          session_end?: string | null
          session_start?: string | null
          status?: string | null
          transcript?: string | null
          visit_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hms_ai_scribe_sessions_final_note_id_fkey"
            columns: ["final_note_id"]
            isOneToOne: false
            referencedRelation: "hms_clinical_notes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hms_ai_scribe_sessions_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "hms_op_patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hms_ai_scribe_sessions_visit_id_fkey"
            columns: ["visit_id"]
            isOneToOne: false
            referencedRelation: "hms_op_visits"
            referencedColumns: ["id"]
          },
        ]
      }
      hms_ambulance_trips: {
        Row: {
          arrival_time: string | null
          completed_at: string | null
          created_at: string | null
          destination: string | null
          dispatch_time: string | null
          driver_name: string | null
          id: string
          km_reading: number | null
          location: string | null
          notes: string | null
          patient_name: string | null
          pickup_location: string
          status: string | null
          urgency: string | null
          vehicle_number: string
        }
        Insert: {
          arrival_time?: string | null
          completed_at?: string | null
          created_at?: string | null
          destination?: string | null
          dispatch_time?: string | null
          driver_name?: string | null
          id?: string
          km_reading?: number | null
          location?: string | null
          notes?: string | null
          patient_name?: string | null
          pickup_location: string
          status?: string | null
          urgency?: string | null
          vehicle_number: string
        }
        Update: {
          arrival_time?: string | null
          completed_at?: string | null
          created_at?: string | null
          destination?: string | null
          dispatch_time?: string | null
          driver_name?: string | null
          id?: string
          km_reading?: number | null
          location?: string | null
          notes?: string | null
          patient_name?: string | null
          pickup_location?: string
          status?: string | null
          urgency?: string | null
          vehicle_number?: string
        }
        Relationships: []
      }
      hms_ambulance_vehicles: {
        Row: {
          created_at: string | null
          current_location: string | null
          driver_name: string | null
          driver_phone: string | null
          id: string
          is_active: boolean | null
          location: string | null
          status: string | null
          vehicle_number: string
          vehicle_type: string | null
        }
        Insert: {
          created_at?: string | null
          current_location?: string | null
          driver_name?: string | null
          driver_phone?: string | null
          id?: string
          is_active?: boolean | null
          location?: string | null
          status?: string | null
          vehicle_number: string
          vehicle_type?: string | null
        }
        Update: {
          created_at?: string | null
          current_location?: string | null
          driver_name?: string | null
          driver_phone?: string | null
          id?: string
          is_active?: boolean | null
          location?: string | null
          status?: string | null
          vehicle_number?: string
          vehicle_type?: string | null
        }
        Relationships: []
      }
      hms_appointment_bookings: {
        Row: {
          appointment_date: string
          booked_by: string | null
          booked_via: string | null
          branch: string | null
          cancel_reason: string | null
          chief_complaint: string | null
          consultation_fee: number | null
          consultation_type: string | null
          created_at: string | null
          doctor_id: string | null
          doctor_name: string
          doctor_user_id: string | null
          end_time: string | null
          id: string
          notes: string | null
          patient_display_id: string | null
          patient_id: string | null
          patient_name: string
          patient_phone: string | null
          payment_mode: string | null
          payment_status: string | null
          purpose: string | null
          reminder_sent: boolean | null
          slot_number: number | null
          start_time: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          appointment_date: string
          booked_by?: string | null
          booked_via?: string | null
          branch?: string | null
          cancel_reason?: string | null
          chief_complaint?: string | null
          consultation_fee?: number | null
          consultation_type?: string | null
          created_at?: string | null
          doctor_id?: string | null
          doctor_name: string
          doctor_user_id?: string | null
          end_time?: string | null
          id?: string
          notes?: string | null
          patient_display_id?: string | null
          patient_id?: string | null
          patient_name: string
          patient_phone?: string | null
          payment_mode?: string | null
          payment_status?: string | null
          purpose?: string | null
          reminder_sent?: boolean | null
          slot_number?: number | null
          start_time: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          appointment_date?: string
          booked_by?: string | null
          booked_via?: string | null
          branch?: string | null
          cancel_reason?: string | null
          chief_complaint?: string | null
          consultation_fee?: number | null
          consultation_type?: string | null
          created_at?: string | null
          doctor_id?: string | null
          doctor_name?: string
          doctor_user_id?: string | null
          end_time?: string | null
          id?: string
          notes?: string | null
          patient_display_id?: string | null
          patient_id?: string | null
          patient_name?: string
          patient_phone?: string | null
          payment_mode?: string | null
          payment_status?: string | null
          purpose?: string | null
          reminder_sent?: boolean | null
          slot_number?: number | null
          start_time?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hms_appointment_bookings_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hms_appointment_bookings_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "hms_op_patients"
            referencedColumns: ["id"]
          },
        ]
      }
      hms_appointments: {
        Row: {
          booked_by: string | null
          created_at: string | null
          date: string
          department: string | null
          doctor_name: string | null
          id: string
          location: string | null
          notes: string | null
          patient_id: string | null
          patient_name: string
          purpose: string | null
          status: string | null
          time_slot: string
          updated_at: string | null
        }
        Insert: {
          booked_by?: string | null
          created_at?: string | null
          date: string
          department?: string | null
          doctor_name?: string | null
          id?: string
          location?: string | null
          notes?: string | null
          patient_id?: string | null
          patient_name: string
          purpose?: string | null
          status?: string | null
          time_slot: string
          updated_at?: string | null
        }
        Update: {
          booked_by?: string | null
          created_at?: string | null
          date?: string
          department?: string | null
          doctor_name?: string | null
          id?: string
          location?: string | null
          notes?: string | null
          patient_id?: string | null
          patient_name?: string
          purpose?: string | null
          status?: string | null
          time_slot?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      hms_attendance: {
        Row: {
          attendance_date: string
          branch: string | null
          check_in: string | null
          check_out: string | null
          created_at: string | null
          employee_id: string | null
          employee_name: string
          id: string
          late_by_min: number | null
          leave_type: string | null
          marked_by: string | null
          notes: string | null
          overtime_min: number | null
          staff_id: string
          status: string | null
          total_hours: number | null
        }
        Insert: {
          attendance_date?: string
          branch?: string | null
          check_in?: string | null
          check_out?: string | null
          created_at?: string | null
          employee_id?: string | null
          employee_name?: string
          id?: string
          late_by_min?: number | null
          leave_type?: string | null
          marked_by?: string | null
          notes?: string | null
          overtime_min?: number | null
          staff_id: string
          status?: string | null
          total_hours?: number | null
        }
        Update: {
          attendance_date?: string
          branch?: string | null
          check_in?: string | null
          check_out?: string | null
          created_at?: string | null
          employee_id?: string | null
          employee_name?: string
          id?: string
          late_by_min?: number | null
          leave_type?: string | null
          marked_by?: string | null
          notes?: string | null
          overtime_min?: number | null
          staff_id?: string
          status?: string | null
          total_hours?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "hms_attendance_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "hms_staff"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hms_attendance_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "hrms_v_doctor_activity"
            referencedColumns: ["employee_id"]
          },
          {
            foreignKeyName: "hms_attendance_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "hrms_v_probation_ending"
            referencedColumns: ["employee_id"]
          },
          {
            foreignKeyName: "hms_attendance_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "hrms_v_therapist_activity"
            referencedColumns: ["employee_id"]
          },
        ]
      }
      hms_audit_trail: {
        Row: {
          action: string
          branch: string | null
          details: Json | null
          entity_display: string | null
          entity_id: string | null
          entity_table: string
          id: string
          ip_address: string | null
          performed_at: string | null
          user_email: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          branch?: string | null
          details?: Json | null
          entity_display?: string | null
          entity_id?: string | null
          entity_table: string
          id?: string
          ip_address?: string | null
          performed_at?: string | null
          user_email?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          branch?: string | null
          details?: Json | null
          entity_display?: string | null
          entity_id?: string | null
          entity_table?: string
          id?: string
          ip_address?: string | null
          performed_at?: string | null
          user_email?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      hms_beds: {
        Row: {
          amenities: string[] | null
          bed_number: string
          created_at: string | null
          current_admission_id: string | null
          current_patient_id: string | null
          id: string
          status: string | null
          ward_id: string
        }
        Insert: {
          amenities?: string[] | null
          bed_number: string
          created_at?: string | null
          current_admission_id?: string | null
          current_patient_id?: string | null
          id?: string
          status?: string | null
          ward_id: string
        }
        Update: {
          amenities?: string[] | null
          bed_number?: string
          created_at?: string | null
          current_admission_id?: string | null
          current_patient_id?: string | null
          id?: string
          status?: string | null
          ward_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "hms_beds_current_patient_id_fkey"
            columns: ["current_patient_id"]
            isOneToOne: false
            referencedRelation: "hms_op_patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hms_beds_ward_id_fkey"
            columns: ["ward_id"]
            isOneToOne: false
            referencedRelation: "hms_wards"
            referencedColumns: ["id"]
          },
        ]
      }
      hms_bill_items: {
        Row: {
          bill_id: string
          created_at: string | null
          discount_pct: number | null
          hsn_code: string | null
          id: string
          item_name: string
          item_type: string | null
          notes: string | null
          quantity: number | null
          tax_pct: number | null
          total: number
          unit_price: number
        }
        Insert: {
          bill_id: string
          created_at?: string | null
          discount_pct?: number | null
          hsn_code?: string | null
          id?: string
          item_name: string
          item_type?: string | null
          notes?: string | null
          quantity?: number | null
          tax_pct?: number | null
          total: number
          unit_price: number
        }
        Update: {
          bill_id?: string
          created_at?: string | null
          discount_pct?: number | null
          hsn_code?: string | null
          id?: string
          item_name?: string
          item_type?: string | null
          notes?: string | null
          quantity?: number | null
          tax_pct?: number | null
          total?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "hms_bill_items_bill_id_fkey"
            columns: ["bill_id"]
            isOneToOne: false
            referencedRelation: "hms_bills"
            referencedColumns: ["id"]
          },
        ]
      }
      hms_bills: {
        Row: {
          balance_amount: number | null
          bill_date: string
          bill_number: string
          bill_type: string | null
          branch: string | null
          cancel_reason: string | null
          cancelled_at: string | null
          created_at: string | null
          created_by: string | null
          department: string | null
          discount_amount: number | null
          discount_reason: string | null
          doctor_name: string | null
          id: string
          is_cancelled: boolean | null
          paid_amount: number | null
          patient_display_id: string | null
          patient_id: string
          patient_name: string
          payment_mode: string | null
          payment_reference: string | null
          payment_status: string | null
          rate_plan: string | null
          subtotal: number
          tax_amount: number | null
          total_amount: number
          updated_at: string | null
          visit_id: string | null
        }
        Insert: {
          balance_amount?: number | null
          bill_date?: string
          bill_number: string
          bill_type?: string | null
          branch?: string | null
          cancel_reason?: string | null
          cancelled_at?: string | null
          created_at?: string | null
          created_by?: string | null
          department?: string | null
          discount_amount?: number | null
          discount_reason?: string | null
          doctor_name?: string | null
          id?: string
          is_cancelled?: boolean | null
          paid_amount?: number | null
          patient_display_id?: string | null
          patient_id: string
          patient_name: string
          payment_mode?: string | null
          payment_reference?: string | null
          payment_status?: string | null
          rate_plan?: string | null
          subtotal?: number
          tax_amount?: number | null
          total_amount?: number
          updated_at?: string | null
          visit_id?: string | null
        }
        Update: {
          balance_amount?: number | null
          bill_date?: string
          bill_number?: string
          bill_type?: string | null
          branch?: string | null
          cancel_reason?: string | null
          cancelled_at?: string | null
          created_at?: string | null
          created_by?: string | null
          department?: string | null
          discount_amount?: number | null
          discount_reason?: string | null
          doctor_name?: string | null
          id?: string
          is_cancelled?: boolean | null
          paid_amount?: number | null
          patient_display_id?: string | null
          patient_id?: string
          patient_name?: string
          payment_mode?: string | null
          payment_reference?: string | null
          payment_status?: string | null
          rate_plan?: string | null
          subtotal?: number
          tax_amount?: number | null
          total_amount?: number
          updated_at?: string | null
          visit_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hms_bills_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "hms_op_patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hms_bills_visit_id_fkey"
            columns: ["visit_id"]
            isOneToOne: false
            referencedRelation: "hms_op_visits"
            referencedColumns: ["id"]
          },
        ]
      }
      hms_blood_requests: {
        Row: {
          blood_group: string
          component: string | null
          created_at: string | null
          cross_match_result: string | null
          date: string | null
          id: string
          issued_at: string | null
          location: string | null
          notes: string | null
          patient_id: string | null
          patient_name: string
          requested_by: string | null
          status: string | null
          units: number | null
          urgency: string | null
        }
        Insert: {
          blood_group: string
          component?: string | null
          created_at?: string | null
          cross_match_result?: string | null
          date?: string | null
          id?: string
          issued_at?: string | null
          location?: string | null
          notes?: string | null
          patient_id?: string | null
          patient_name: string
          requested_by?: string | null
          status?: string | null
          units?: number | null
          urgency?: string | null
        }
        Update: {
          blood_group?: string
          component?: string | null
          created_at?: string | null
          cross_match_result?: string | null
          date?: string | null
          id?: string
          issued_at?: string | null
          location?: string | null
          notes?: string | null
          patient_id?: string | null
          patient_name?: string
          requested_by?: string | null
          status?: string | null
          units?: number | null
          urgency?: string | null
        }
        Relationships: []
      }
      hms_blood_stock: {
        Row: {
          bag_number: string | null
          blood_group: string
          collected_date: string | null
          component: string | null
          created_at: string | null
          donor_id: string | null
          expiry_date: string | null
          id: string
          location: string | null
          units: number | null
        }
        Insert: {
          bag_number?: string | null
          blood_group: string
          collected_date?: string | null
          component?: string | null
          created_at?: string | null
          donor_id?: string | null
          expiry_date?: string | null
          id?: string
          location?: string | null
          units?: number | null
        }
        Update: {
          bag_number?: string | null
          blood_group?: string
          collected_date?: string | null
          component?: string | null
          created_at?: string | null
          donor_id?: string | null
          expiry_date?: string | null
          id?: string
          location?: string | null
          units?: number | null
        }
        Relationships: []
      }
      hms_branches: {
        Row: {
          address: string | null
          ayush_license_no: string | null
          bed_count: number | null
          branch_code: string
          branch_name: string
          branch_type: string | null
          city: string | null
          created_at: string
          daily_op_capacity: number | null
          email: string | null
          franchise_agreement_end: string | null
          franchise_agreement_start: string | null
          franchise_owner_email: string | null
          franchise_owner_name: string | null
          franchise_owner_phone: string | null
          franchise_payment_type: string | null
          franchise_plan: string | null
          franchise_revenue_share_pct: number | null
          google_maps_url: string | null
          gstin: string | null
          has_ipd: boolean | null
          has_lab: boolean | null
          has_pharmacy: boolean | null
          id: string
          is_active: boolean | null
          latitude: number | null
          longitude: number | null
          manager_name: string | null
          notes: string | null
          op_prefix: string | null
          opened_on: string | null
          opening_hours: string | null
          organisation_id: string | null
          panchakarma_rooms: number | null
          phone: string | null
          pincode: string | null
          specialties: string[] | null
          state: string | null
          whatsapp_no: string | null
        }
        Insert: {
          address?: string | null
          ayush_license_no?: string | null
          bed_count?: number | null
          branch_code: string
          branch_name: string
          branch_type?: string | null
          city?: string | null
          created_at?: string
          daily_op_capacity?: number | null
          email?: string | null
          franchise_agreement_end?: string | null
          franchise_agreement_start?: string | null
          franchise_owner_email?: string | null
          franchise_owner_name?: string | null
          franchise_owner_phone?: string | null
          franchise_payment_type?: string | null
          franchise_plan?: string | null
          franchise_revenue_share_pct?: number | null
          google_maps_url?: string | null
          gstin?: string | null
          has_ipd?: boolean | null
          has_lab?: boolean | null
          has_pharmacy?: boolean | null
          id?: string
          is_active?: boolean | null
          latitude?: number | null
          longitude?: number | null
          manager_name?: string | null
          notes?: string | null
          op_prefix?: string | null
          opened_on?: string | null
          opening_hours?: string | null
          organisation_id?: string | null
          panchakarma_rooms?: number | null
          phone?: string | null
          pincode?: string | null
          specialties?: string[] | null
          state?: string | null
          whatsapp_no?: string | null
        }
        Update: {
          address?: string | null
          ayush_license_no?: string | null
          bed_count?: number | null
          branch_code?: string
          branch_name?: string
          branch_type?: string | null
          city?: string | null
          created_at?: string
          daily_op_capacity?: number | null
          email?: string | null
          franchise_agreement_end?: string | null
          franchise_agreement_start?: string | null
          franchise_owner_email?: string | null
          franchise_owner_name?: string | null
          franchise_owner_phone?: string | null
          franchise_payment_type?: string | null
          franchise_plan?: string | null
          franchise_revenue_share_pct?: number | null
          google_maps_url?: string | null
          gstin?: string | null
          has_ipd?: boolean | null
          has_lab?: boolean | null
          has_pharmacy?: boolean | null
          id?: string
          is_active?: boolean | null
          latitude?: number | null
          longitude?: number | null
          manager_name?: string | null
          notes?: string | null
          op_prefix?: string | null
          opened_on?: string | null
          opening_hours?: string | null
          organisation_id?: string | null
          panchakarma_rooms?: number | null
          phone?: string | null
          pincode?: string | null
          specialties?: string[] | null
          state?: string | null
          whatsapp_no?: string | null
        }
        Relationships: []
      }
      hms_call_log: {
        Row: {
          agent_id: string | null
          agent_name: string | null
          appointment_id: string | null
          branch: string | null
          call_time: string | null
          callback_scheduled_at: string | null
          caller_name: string | null
          caller_phone: string
          created_at: string | null
          direction: string | null
          disposition: string | null
          duration_seconds: number | null
          id: string
          notes: string | null
          outcome: string | null
          patient_id: string | null
          purpose: string | null
        }
        Insert: {
          agent_id?: string | null
          agent_name?: string | null
          appointment_id?: string | null
          branch?: string | null
          call_time?: string | null
          callback_scheduled_at?: string | null
          caller_name?: string | null
          caller_phone: string
          created_at?: string | null
          direction?: string | null
          disposition?: string | null
          duration_seconds?: number | null
          id?: string
          notes?: string | null
          outcome?: string | null
          patient_id?: string | null
          purpose?: string | null
        }
        Update: {
          agent_id?: string | null
          agent_name?: string | null
          appointment_id?: string | null
          branch?: string | null
          call_time?: string | null
          callback_scheduled_at?: string | null
          caller_name?: string | null
          caller_phone?: string
          created_at?: string | null
          direction?: string | null
          disposition?: string | null
          duration_seconds?: number | null
          id?: string
          notes?: string | null
          outcome?: string | null
          patient_id?: string | null
          purpose?: string | null
        }
        Relationships: []
      }
      hms_cash_positions: {
        Row: {
          account_name: string
          account_number: string | null
          account_type: string
          balance: number
          bank_name: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          last_updated_at: string | null
          location: string | null
        }
        Insert: {
          account_name: string
          account_number?: string | null
          account_type: string
          balance?: number
          bank_name?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          last_updated_at?: string | null
          location?: string | null
        }
        Update: {
          account_name?: string
          account_number?: string | null
          account_type?: string
          balance?: number
          bank_name?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          last_updated_at?: string | null
          location?: string | null
        }
        Relationships: []
      }
      hms_clinical_notes: {
        Row: {
          agni_status: string | null
          ama_status: string | null
          assessment: string | null
          branch: string | null
          created_at: string | null
          doctor_id: string | null
          doctor_user_id: string | null
          dosha_assessment: string | null
          id: string
          is_signed: boolean | null
          note_type: string | null
          objective: string | null
          patient_id: string
          plan: string | null
          prakriti_notes: string | null
          signed_at: string | null
          subjective: string | null
          updated_at: string | null
          visit_id: string | null
        }
        Insert: {
          agni_status?: string | null
          ama_status?: string | null
          assessment?: string | null
          branch?: string | null
          created_at?: string | null
          doctor_id?: string | null
          doctor_user_id?: string | null
          dosha_assessment?: string | null
          id?: string
          is_signed?: boolean | null
          note_type?: string | null
          objective?: string | null
          patient_id: string
          plan?: string | null
          prakriti_notes?: string | null
          signed_at?: string | null
          subjective?: string | null
          updated_at?: string | null
          visit_id?: string | null
        }
        Update: {
          agni_status?: string | null
          ama_status?: string | null
          assessment?: string | null
          branch?: string | null
          created_at?: string | null
          doctor_id?: string | null
          doctor_user_id?: string | null
          dosha_assessment?: string | null
          id?: string
          is_signed?: boolean | null
          note_type?: string | null
          objective?: string | null
          patient_id?: string
          plan?: string | null
          prakriti_notes?: string | null
          signed_at?: string | null
          subjective?: string | null
          updated_at?: string | null
          visit_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hms_clinical_notes_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hms_clinical_notes_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "hms_op_patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hms_clinical_notes_visit_id_fkey"
            columns: ["visit_id"]
            isOneToOne: false
            referencedRelation: "hms_op_visits"
            referencedColumns: ["id"]
          },
        ]
      }
      hms_copay_calculations: {
        Row: {
          appointment_id: string | null
          bill_id: string | null
          calculated_by: string | null
          copay_amount: number
          copay_percent: number | null
          coverage_type: string | null
          covered_amount: number
          created_at: string | null
          discount_amount: number | null
          id: string
          insurance_provider: string
          line_items: Json | null
          non_covered_amount: number | null
          patient_id: string
          patient_responsibility: number
          pharmacy_copay_percent: number | null
          plan_name: string | null
          policy_number: string
          room_excess: number | null
          status: string | null
          total_bill_amount: number
        }
        Insert: {
          appointment_id?: string | null
          bill_id?: string | null
          calculated_by?: string | null
          copay_amount: number
          copay_percent?: number | null
          coverage_type?: string | null
          covered_amount: number
          created_at?: string | null
          discount_amount?: number | null
          id?: string
          insurance_provider: string
          line_items?: Json | null
          non_covered_amount?: number | null
          patient_id: string
          patient_responsibility: number
          pharmacy_copay_percent?: number | null
          plan_name?: string | null
          policy_number: string
          room_excess?: number | null
          status?: string | null
          total_bill_amount: number
        }
        Update: {
          appointment_id?: string | null
          bill_id?: string | null
          calculated_by?: string | null
          copay_amount?: number
          copay_percent?: number | null
          coverage_type?: string | null
          covered_amount?: number
          created_at?: string | null
          discount_amount?: number | null
          id?: string
          insurance_provider?: string
          line_items?: Json | null
          non_covered_amount?: number | null
          patient_id?: string
          patient_responsibility?: number
          pharmacy_copay_percent?: number | null
          plan_name?: string | null
          policy_number?: string
          room_excess?: number | null
          status?: string | null
          total_bill_amount?: number
        }
        Relationships: []
      }
      hms_crm_tasks: {
        Row: {
          assigned_to: string | null
          assigned_to_id: string | null
          branch: string | null
          completed_at: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          due_date: string
          due_time: string | null
          id: string
          patient_id: string | null
          patient_name: string | null
          patient_phone: string | null
          priority: string | null
          reference_id: string | null
          reference_type: string | null
          result: string | null
          status: string | null
          task_type: string | null
        }
        Insert: {
          assigned_to?: string | null
          assigned_to_id?: string | null
          branch?: string | null
          completed_at?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          due_date: string
          due_time?: string | null
          id?: string
          patient_id?: string | null
          patient_name?: string | null
          patient_phone?: string | null
          priority?: string | null
          reference_id?: string | null
          reference_type?: string | null
          result?: string | null
          status?: string | null
          task_type?: string | null
        }
        Update: {
          assigned_to?: string | null
          assigned_to_id?: string | null
          branch?: string | null
          completed_at?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          due_date?: string
          due_time?: string | null
          id?: string
          patient_id?: string | null
          patient_name?: string | null
          patient_phone?: string | null
          priority?: string | null
          reference_id?: string | null
          reference_type?: string | null
          result?: string | null
          status?: string | null
          task_type?: string | null
        }
        Relationships: []
      }
      hms_diet_orders: {
        Row: {
          bed: string | null
          created_at: string | null
          delivered_at: string | null
          diet_type: string
          id: string
          location: string | null
          meal: string
          meal_time: string | null
          order_date: string | null
          patient_id: string | null
          patient_name: string
          special_instructions: string | null
          status: string | null
          ward: string | null
        }
        Insert: {
          bed?: string | null
          created_at?: string | null
          delivered_at?: string | null
          diet_type: string
          id?: string
          location?: string | null
          meal: string
          meal_time?: string | null
          order_date?: string | null
          patient_id?: string | null
          patient_name: string
          special_instructions?: string | null
          status?: string | null
          ward?: string | null
        }
        Update: {
          bed?: string | null
          created_at?: string | null
          delivered_at?: string | null
          diet_type?: string
          id?: string
          location?: string | null
          meal?: string
          meal_time?: string | null
          order_date?: string | null
          patient_id?: string | null
          patient_name?: string
          special_instructions?: string | null
          status?: string | null
          ward?: string | null
        }
        Relationships: []
      }
      hms_doctor_slots: {
        Row: {
          branch: string | null
          consultation_type: string | null
          created_at: string | null
          day_of_week: number
          doctor_id: string | null
          doctor_name: string
          doctor_user_id: string | null
          end_time: string
          id: string
          is_active: boolean | null
          max_patients: number | null
          slot_duration_min: number | null
          start_time: string
        }
        Insert: {
          branch?: string | null
          consultation_type?: string | null
          created_at?: string | null
          day_of_week: number
          doctor_id?: string | null
          doctor_name: string
          doctor_user_id?: string | null
          end_time: string
          id?: string
          is_active?: boolean | null
          max_patients?: number | null
          slot_duration_min?: number | null
          start_time: string
        }
        Update: {
          branch?: string | null
          consultation_type?: string | null
          created_at?: string | null
          day_of_week?: number
          doctor_id?: string | null
          doctor_name?: string
          doctor_user_id?: string | null
          end_time?: string
          id?: string
          is_active?: boolean | null
          max_patients?: number | null
          slot_duration_min?: number | null
          start_time?: string
        }
        Relationships: [
          {
            foreignKeyName: "hms_doctor_slots_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
        ]
      }
      hms_eod_report_history: {
        Row: {
          ayuzee_bookings: number | null
          clinic_id: string | null
          created_at: string | null
          delivered_at: string | null
          delivered_via: string | null
          delivery_status: string | null
          error_message: string | null
          id: string
          new_patients: number | null
          no_shows: number | null
          pending_bills: number | null
          report_data: Json
          report_date: string
          schedule_id: string | null
          stock_alerts: number | null
          template_id: string | null
          total_patients: number | null
          total_revenue: number | null
        }
        Insert: {
          ayuzee_bookings?: number | null
          clinic_id?: string | null
          created_at?: string | null
          delivered_at?: string | null
          delivered_via?: string | null
          delivery_status?: string | null
          error_message?: string | null
          id?: string
          new_patients?: number | null
          no_shows?: number | null
          pending_bills?: number | null
          report_data?: Json
          report_date?: string
          schedule_id?: string | null
          stock_alerts?: number | null
          template_id?: string | null
          total_patients?: number | null
          total_revenue?: number | null
        }
        Update: {
          ayuzee_bookings?: number | null
          clinic_id?: string | null
          created_at?: string | null
          delivered_at?: string | null
          delivered_via?: string | null
          delivery_status?: string | null
          error_message?: string | null
          id?: string
          new_patients?: number | null
          no_shows?: number | null
          pending_bills?: number | null
          report_data?: Json
          report_date?: string
          schedule_id?: string | null
          stock_alerts?: number | null
          template_id?: string | null
          total_patients?: number | null
          total_revenue?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "hms_eod_report_history_schedule_id_fkey"
            columns: ["schedule_id"]
            isOneToOne: false
            referencedRelation: "hms_eod_report_schedules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hms_eod_report_history_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "hms_eod_report_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      hms_eod_report_schedules: {
        Row: {
          clinic_id: string | null
          created_at: string | null
          delivery_channel: string
          delivery_email: string | null
          delivery_phone: string | null
          id: string
          include_ayuzee_stats: boolean | null
          is_active: boolean | null
          last_sent_at: string | null
          recipient_id: string
          recipient_name: string | null
          schedule_days: string[] | null
          schedule_time: string | null
          template_id: string
          timezone: string | null
        }
        Insert: {
          clinic_id?: string | null
          created_at?: string | null
          delivery_channel: string
          delivery_email?: string | null
          delivery_phone?: string | null
          id?: string
          include_ayuzee_stats?: boolean | null
          is_active?: boolean | null
          last_sent_at?: string | null
          recipient_id: string
          recipient_name?: string | null
          schedule_days?: string[] | null
          schedule_time?: string | null
          template_id: string
          timezone?: string | null
        }
        Update: {
          clinic_id?: string | null
          created_at?: string | null
          delivery_channel?: string
          delivery_email?: string | null
          delivery_phone?: string | null
          id?: string
          include_ayuzee_stats?: boolean | null
          is_active?: boolean | null
          last_sent_at?: string | null
          recipient_id?: string
          recipient_name?: string | null
          schedule_days?: string[] | null
          schedule_time?: string | null
          template_id?: string
          timezone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hms_eod_report_schedules_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "hms_eod_report_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      hms_eod_report_templates: {
        Row: {
          clinic_id: string | null
          created_at: string | null
          created_by: string | null
          custom_query: string | null
          id: string
          include_sections: string[] | null
          is_active: boolean | null
          metrics: Json | null
          name: string
          report_type: string
        }
        Insert: {
          clinic_id?: string | null
          created_at?: string | null
          created_by?: string | null
          custom_query?: string | null
          id?: string
          include_sections?: string[] | null
          is_active?: boolean | null
          metrics?: Json | null
          name: string
          report_type: string
        }
        Update: {
          clinic_id?: string | null
          created_at?: string | null
          created_by?: string | null
          custom_query?: string | null
          id?: string
          include_sections?: string[] | null
          is_active?: boolean | null
          metrics?: Json | null
          name?: string
          report_type?: string
        }
        Relationships: []
      }
      hms_expense_entries: {
        Row: {
          amount: number
          approved_by: string | null
          approved_by_name: string | null
          category: string
          created_at: string | null
          created_by: string | null
          description: string
          expense_date: string
          id: string
          location: string | null
          paid_to: string
          payment_mode: string
          receipt_url: string | null
          reference: string | null
          status: string
          sub_category: string | null
          updated_at: string | null
          voucher_no: string | null
        }
        Insert: {
          amount: number
          approved_by?: string | null
          approved_by_name?: string | null
          category: string
          created_at?: string | null
          created_by?: string | null
          description: string
          expense_date?: string
          id?: string
          location?: string | null
          paid_to: string
          payment_mode?: string
          receipt_url?: string | null
          reference?: string | null
          status?: string
          sub_category?: string | null
          updated_at?: string | null
          voucher_no?: string | null
        }
        Update: {
          amount?: number
          approved_by?: string | null
          approved_by_name?: string | null
          category?: string
          created_at?: string | null
          created_by?: string | null
          description?: string
          expense_date?: string
          id?: string
          location?: string | null
          paid_to?: string
          payment_mode?: string
          receipt_url?: string | null
          reference?: string | null
          status?: string
          sub_category?: string | null
          updated_at?: string | null
          voucher_no?: string | null
        }
        Relationships: []
      }
      hms_geo_seo_pages: {
        Row: {
          ai_generated: boolean | null
          avg_position: number | null
          body_content: string | null
          city: string
          clicks_30d: number | null
          clinic_id: string | null
          clinic_name: string
          country: string | null
          created_at: string | null
          generated_by: string | null
          google_indexed: boolean | null
          google_maps_embed: string | null
          h1_heading: string | null
          id: string
          impressions_30d: number | null
          include_booking_cta: boolean | null
          include_doctor_profiles: boolean | null
          include_services: boolean | null
          include_testimonials: boolean | null
          keywords: string[] | null
          last_updated_at: string | null
          latitude: number | null
          longitude: number | null
          meta_description: string | null
          page_title: string
          published_at: string | null
          schema_json: Json | null
          schema_markup_enabled: boolean | null
          slug: string
          state: string | null
          status: string | null
        }
        Insert: {
          ai_generated?: boolean | null
          avg_position?: number | null
          body_content?: string | null
          city: string
          clicks_30d?: number | null
          clinic_id?: string | null
          clinic_name: string
          country?: string | null
          created_at?: string | null
          generated_by?: string | null
          google_indexed?: boolean | null
          google_maps_embed?: string | null
          h1_heading?: string | null
          id?: string
          impressions_30d?: number | null
          include_booking_cta?: boolean | null
          include_doctor_profiles?: boolean | null
          include_services?: boolean | null
          include_testimonials?: boolean | null
          keywords?: string[] | null
          last_updated_at?: string | null
          latitude?: number | null
          longitude?: number | null
          meta_description?: string | null
          page_title: string
          published_at?: string | null
          schema_json?: Json | null
          schema_markup_enabled?: boolean | null
          slug: string
          state?: string | null
          status?: string | null
        }
        Update: {
          ai_generated?: boolean | null
          avg_position?: number | null
          body_content?: string | null
          city?: string
          clicks_30d?: number | null
          clinic_id?: string | null
          clinic_name?: string
          country?: string | null
          created_at?: string | null
          generated_by?: string | null
          google_indexed?: boolean | null
          google_maps_embed?: string | null
          h1_heading?: string | null
          id?: string
          impressions_30d?: number | null
          include_booking_cta?: boolean | null
          include_doctor_profiles?: boolean | null
          include_services?: boolean | null
          include_testimonials?: boolean | null
          keywords?: string[] | null
          last_updated_at?: string | null
          latitude?: number | null
          longitude?: number | null
          meta_description?: string | null
          page_title?: string
          published_at?: string | null
          schema_json?: Json | null
          schema_markup_enabled?: boolean | null
          slug?: string
          state?: string | null
          status?: string | null
        }
        Relationships: []
      }
      hms_geofence_config: {
        Row: {
          center_lat: number
          center_lng: number
          clinic_id: string | null
          clinic_name: string
          created_at: string | null
          id: string
          is_active: boolean | null
          late_threshold_minutes: number | null
          radius_meters: number | null
          shift_start_time: string | null
        }
        Insert: {
          center_lat: number
          center_lng: number
          clinic_id?: string | null
          clinic_name: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          late_threshold_minutes?: number | null
          radius_meters?: number | null
          shift_start_time?: string | null
        }
        Update: {
          center_lat?: number
          center_lng?: number
          clinic_id?: string | null
          clinic_name?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          late_threshold_minutes?: number | null
          radius_meters?: number | null
          shift_start_time?: string | null
        }
        Relationships: []
      }
      hms_grn: {
        Row: {
          branch: string | null
          created_at: string | null
          grn_date: string | null
          grn_number: string
          id: string
          notes: string | null
          po_id: string | null
          received_by: string | null
          status: string | null
          supplier_invoice_date: string | null
          supplier_invoice_no: string | null
          supplier_name: string
          total_amount: number | null
        }
        Insert: {
          branch?: string | null
          created_at?: string | null
          grn_date?: string | null
          grn_number: string
          id?: string
          notes?: string | null
          po_id?: string | null
          received_by?: string | null
          status?: string | null
          supplier_invoice_date?: string | null
          supplier_invoice_no?: string | null
          supplier_name: string
          total_amount?: number | null
        }
        Update: {
          branch?: string | null
          created_at?: string | null
          grn_date?: string | null
          grn_number?: string
          id?: string
          notes?: string | null
          po_id?: string | null
          received_by?: string | null
          status?: string | null
          supplier_invoice_date?: string | null
          supplier_invoice_no?: string | null
          supplier_name?: string
          total_amount?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "hms_grn_po_id_fkey"
            columns: ["po_id"]
            isOneToOne: false
            referencedRelation: "hms_purchase_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      hms_grn_items: {
        Row: {
          batch_number: string
          created_at: string | null
          expiry_date: string
          free_qty: number | null
          grn_id: string
          gst_pct: number | null
          id: string
          mrp: number | null
          notes: string | null
          ordered_qty: number | null
          product_id: string | null
          product_name: string
          purchase_rate: number
          received_qty: number
          total: number
        }
        Insert: {
          batch_number: string
          created_at?: string | null
          expiry_date: string
          free_qty?: number | null
          grn_id: string
          gst_pct?: number | null
          id?: string
          mrp?: number | null
          notes?: string | null
          ordered_qty?: number | null
          product_id?: string | null
          product_name: string
          purchase_rate: number
          received_qty: number
          total: number
        }
        Update: {
          batch_number?: string
          created_at?: string | null
          expiry_date?: string
          free_qty?: number | null
          grn_id?: string
          gst_pct?: number | null
          id?: string
          mrp?: number | null
          notes?: string | null
          ordered_qty?: number | null
          product_id?: string | null
          product_name?: string
          purchase_rate?: number
          received_qty?: number
          total?: number
        }
        Relationships: [
          {
            foreignKeyName: "hms_grn_items_grn_id_fkey"
            columns: ["grn_id"]
            isOneToOne: false
            referencedRelation: "hms_grn"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hms_grn_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "hms_stock_products"
            referencedColumns: ["id"]
          },
        ]
      }
      hms_indents: {
        Row: {
          approved_by: string | null
          created_at: string | null
          date: string | null
          department: string
          fulfilled_at: string | null
          id: string
          indent_no: string | null
          items_count: number | null
          location: string | null
          notes: string | null
          raised_by: string | null
          status: string | null
          urgency: string | null
        }
        Insert: {
          approved_by?: string | null
          created_at?: string | null
          date?: string | null
          department: string
          fulfilled_at?: string | null
          id?: string
          indent_no?: string | null
          items_count?: number | null
          location?: string | null
          notes?: string | null
          raised_by?: string | null
          status?: string | null
          urgency?: string | null
        }
        Update: {
          approved_by?: string | null
          created_at?: string | null
          date?: string | null
          department?: string
          fulfilled_at?: string | null
          id?: string
          indent_no?: string | null
          items_count?: number | null
          location?: string | null
          notes?: string | null
          raised_by?: string | null
          status?: string | null
          urgency?: string | null
        }
        Relationships: []
      }
      hms_insurance_claims: {
        Row: {
          admission_date: string | null
          admission_id: string | null
          approved_amount: number | null
          approved_at: string | null
          approved_date: string | null
          branch: string | null
          claim_amount: number
          claim_number: string | null
          claim_type: string | null
          company_name: string | null
          created_at: string | null
          created_by: string | null
          deduction_amount: number | null
          deduction_reason: string | null
          discharge_date: string | null
          documents: Json | null
          icd_code: string | null
          id: string
          insurance_id: string | null
          insurer: string
          location: string | null
          notes: string | null
          patient_copay: number | null
          patient_id: string | null
          patient_name: string
          policy_no: string
          policy_number: string | null
          preauth_amount: number | null
          preauth_date: string | null
          preauth_number: string | null
          preauth_status: string | null
          primary_diagnosis: string | null
          query_response: string | null
          query_text: string | null
          rejection_reason: string | null
          settled_amount: number | null
          settled_at: string | null
          settled_date: string | null
          status: string | null
          submitted_at: string | null
          submitted_date: string | null
          treatment_summary: string | null
          updated_at: string | null
          visit_id: string | null
        }
        Insert: {
          admission_date?: string | null
          admission_id?: string | null
          approved_amount?: number | null
          approved_at?: string | null
          approved_date?: string | null
          branch?: string | null
          claim_amount: number
          claim_number?: string | null
          claim_type?: string | null
          company_name?: string | null
          created_at?: string | null
          created_by?: string | null
          deduction_amount?: number | null
          deduction_reason?: string | null
          discharge_date?: string | null
          documents?: Json | null
          icd_code?: string | null
          id?: string
          insurance_id?: string | null
          insurer: string
          location?: string | null
          notes?: string | null
          patient_copay?: number | null
          patient_id?: string | null
          patient_name: string
          policy_no: string
          policy_number?: string | null
          preauth_amount?: number | null
          preauth_date?: string | null
          preauth_number?: string | null
          preauth_status?: string | null
          primary_diagnosis?: string | null
          query_response?: string | null
          query_text?: string | null
          rejection_reason?: string | null
          settled_amount?: number | null
          settled_at?: string | null
          settled_date?: string | null
          status?: string | null
          submitted_at?: string | null
          submitted_date?: string | null
          treatment_summary?: string | null
          updated_at?: string | null
          visit_id?: string | null
        }
        Update: {
          admission_date?: string | null
          admission_id?: string | null
          approved_amount?: number | null
          approved_at?: string | null
          approved_date?: string | null
          branch?: string | null
          claim_amount?: number
          claim_number?: string | null
          claim_type?: string | null
          company_name?: string | null
          created_at?: string | null
          created_by?: string | null
          deduction_amount?: number | null
          deduction_reason?: string | null
          discharge_date?: string | null
          documents?: Json | null
          icd_code?: string | null
          id?: string
          insurance_id?: string | null
          insurer?: string
          location?: string | null
          notes?: string | null
          patient_copay?: number | null
          patient_id?: string | null
          patient_name?: string
          policy_no?: string
          policy_number?: string | null
          preauth_amount?: number | null
          preauth_date?: string | null
          preauth_number?: string | null
          preauth_status?: string | null
          primary_diagnosis?: string | null
          query_response?: string | null
          query_text?: string | null
          rejection_reason?: string | null
          settled_amount?: number | null
          settled_at?: string | null
          settled_date?: string | null
          status?: string | null
          submitted_at?: string | null
          submitted_date?: string | null
          treatment_summary?: string | null
          updated_at?: string | null
          visit_id?: string | null
        }
        Relationships: []
      }
      hms_insurance_companies: {
        Row: {
          address: string | null
          branch: string | null
          company_name: string
          contact_email: string | null
          contact_phone: string | null
          created_at: string | null
          empanelment_number: string | null
          id: string
          is_active: boolean | null
          short_name: string | null
          tpa_name: string | null
        }
        Insert: {
          address?: string | null
          branch?: string | null
          company_name: string
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string | null
          empanelment_number?: string | null
          id?: string
          is_active?: boolean | null
          short_name?: string | null
          tpa_name?: string | null
        }
        Update: {
          address?: string | null
          branch?: string | null
          company_name?: string
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string | null
          empanelment_number?: string | null
          id?: string
          is_active?: boolean | null
          short_name?: string | null
          tpa_name?: string | null
        }
        Relationships: []
      }
      hms_ip_admissions: {
        Row: {
          actual_discharge_date: string | null
          admission_date: string
          admission_time: string | null
          admission_type: string | null
          amount_paid: number | null
          bed_number: string | null
          created_at: string | null
          created_by: string | null
          diagnosis: string | null
          doctor_id: string | null
          doctor_name: string | null
          expected_discharge: string | null
          id: string
          insurance_id: string | null
          location: string | null
          notes: string | null
          patient_id: string | null
          patient_name: string
          status: string | null
          total_charges: number | null
          updated_at: string | null
          ward_id: string | null
          ward_name: string | null
        }
        Insert: {
          actual_discharge_date?: string | null
          admission_date?: string
          admission_time?: string | null
          admission_type?: string | null
          amount_paid?: number | null
          bed_number?: string | null
          created_at?: string | null
          created_by?: string | null
          diagnosis?: string | null
          doctor_id?: string | null
          doctor_name?: string | null
          expected_discharge?: string | null
          id?: string
          insurance_id?: string | null
          location?: string | null
          notes?: string | null
          patient_id?: string | null
          patient_name: string
          status?: string | null
          total_charges?: number | null
          updated_at?: string | null
          ward_id?: string | null
          ward_name?: string | null
        }
        Update: {
          actual_discharge_date?: string | null
          admission_date?: string
          admission_time?: string | null
          admission_type?: string | null
          amount_paid?: number | null
          bed_number?: string | null
          created_at?: string | null
          created_by?: string | null
          diagnosis?: string | null
          doctor_id?: string | null
          doctor_name?: string | null
          expected_discharge?: string | null
          id?: string
          insurance_id?: string | null
          location?: string | null
          notes?: string | null
          patient_id?: string | null
          patient_name?: string
          status?: string | null
          total_charges?: number | null
          updated_at?: string | null
          ward_id?: string | null
          ward_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hms_ip_admissions_ward_id_fkey"
            columns: ["ward_id"]
            isOneToOne: false
            referencedRelation: "hms_wards"
            referencedColumns: ["id"]
          },
        ]
      }
      hms_lab_critical_alerts: {
        Row: {
          acknowledged_at: string | null
          acknowledged_by: string | null
          action_notes: string | null
          bed_number: string | null
          clinic_id: string | null
          created_at: string | null
          critical_high: number | null
          critical_low: number | null
          deviation_percent: number | null
          doctor_id: string | null
          doctor_notified_at: string | null
          id: string
          lab_order_id: string | null
          normal_max: number | null
          normal_min: number | null
          notification_channel: string | null
          parameter_name: string
          patient_id: string | null
          patient_name: string | null
          resolved_at: string | null
          severity: string
          status: string | null
          test_name: string
          unit: string | null
          value: number
          ward: string | null
        }
        Insert: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          action_notes?: string | null
          bed_number?: string | null
          clinic_id?: string | null
          created_at?: string | null
          critical_high?: number | null
          critical_low?: number | null
          deviation_percent?: number | null
          doctor_id?: string | null
          doctor_notified_at?: string | null
          id?: string
          lab_order_id?: string | null
          normal_max?: number | null
          normal_min?: number | null
          notification_channel?: string | null
          parameter_name: string
          patient_id?: string | null
          patient_name?: string | null
          resolved_at?: string | null
          severity: string
          status?: string | null
          test_name: string
          unit?: string | null
          value: number
          ward?: string | null
        }
        Update: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          action_notes?: string | null
          bed_number?: string | null
          clinic_id?: string | null
          created_at?: string | null
          critical_high?: number | null
          critical_low?: number | null
          deviation_percent?: number | null
          doctor_id?: string | null
          doctor_notified_at?: string | null
          id?: string
          lab_order_id?: string | null
          normal_max?: number | null
          normal_min?: number | null
          notification_channel?: string | null
          parameter_name?: string
          patient_id?: string | null
          patient_name?: string | null
          resolved_at?: string | null
          severity?: string
          status?: string | null
          test_name?: string
          unit?: string | null
          value?: number
          ward?: string | null
        }
        Relationships: []
      }
      hms_lab_order_items: {
        Row: {
          created_at: string | null
          id: string
          is_abnormal: boolean | null
          is_critical: boolean | null
          normal_range: string | null
          notes: string | null
          order_id: string
          result_numeric: number | null
          result_value: string | null
          resulted_at: string | null
          sample_type: string | null
          status: string | null
          test_code: string | null
          test_id: string | null
          test_name: string
          unit: string | null
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_abnormal?: boolean | null
          is_critical?: boolean | null
          normal_range?: string | null
          notes?: string | null
          order_id: string
          result_numeric?: number | null
          result_value?: string | null
          resulted_at?: string | null
          sample_type?: string | null
          status?: string | null
          test_code?: string | null
          test_id?: string | null
          test_name: string
          unit?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_abnormal?: boolean | null
          is_critical?: boolean | null
          normal_range?: string | null
          notes?: string | null
          order_id?: string
          result_numeric?: number | null
          result_value?: string | null
          resulted_at?: string | null
          sample_type?: string | null
          status?: string | null
          test_code?: string | null
          test_id?: string | null
          test_name?: string
          unit?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hms_lab_order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "hms_lab_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hms_lab_order_items_test_id_fkey"
            columns: ["test_id"]
            isOneToOne: false
            referencedRelation: "hms_lab_tests"
            referencedColumns: ["id"]
          },
        ]
      }
      hms_lab_order_tests: {
        Row: {
          barcode_no: string | null
          completed_at: string | null
          created_at: string | null
          department: string | null
          id: string
          is_outsourced: boolean | null
          order_id: string
          outsource_lab_name: string | null
          price: number | null
          sample_type: string | null
          status: string | null
          tat_target_minutes: number | null
          test_code: string | null
          test_name: string
          test_type: string | null
          validated_by: string | null
        }
        Insert: {
          barcode_no?: string | null
          completed_at?: string | null
          created_at?: string | null
          department?: string | null
          id?: string
          is_outsourced?: boolean | null
          order_id: string
          outsource_lab_name?: string | null
          price?: number | null
          sample_type?: string | null
          status?: string | null
          tat_target_minutes?: number | null
          test_code?: string | null
          test_name: string
          test_type?: string | null
          validated_by?: string | null
        }
        Update: {
          barcode_no?: string | null
          completed_at?: string | null
          created_at?: string | null
          department?: string | null
          id?: string
          is_outsourced?: boolean | null
          order_id?: string
          outsource_lab_name?: string | null
          price?: number | null
          sample_type?: string | null
          status?: string | null
          tat_target_minutes?: number | null
          test_code?: string | null
          test_name?: string
          test_type?: string | null
          validated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hms_lab_order_tests_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "hms_lab_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      hms_lab_orders: {
        Row: {
          clinical_notes: string | null
          completed_at: string | null
          created_at: string | null
          created_by: string | null
          department: string | null
          discount_amount: number | null
          dispatched_at: string | null
          id: string
          location: string | null
          net_amount: number | null
          order_date: string
          order_no: string | null
          order_time: string | null
          order_type: string | null
          paid_amount: number | null
          patient_age: number | null
          patient_gender: string | null
          patient_id: string | null
          patient_name: string
          payment_mode: string | null
          payment_status: string | null
          priority: string | null
          referred_by_id: string | null
          referred_by_name: string | null
          sample_collected_at: string | null
          special_instructions: string | null
          status: string | null
          total_amount: number | null
          updated_at: string | null
          validated_at: string | null
          validated_by: string | null
        }
        Insert: {
          clinical_notes?: string | null
          completed_at?: string | null
          created_at?: string | null
          created_by?: string | null
          department?: string | null
          discount_amount?: number | null
          dispatched_at?: string | null
          id?: string
          location?: string | null
          net_amount?: number | null
          order_date?: string
          order_no?: string | null
          order_time?: string | null
          order_type?: string | null
          paid_amount?: number | null
          patient_age?: number | null
          patient_gender?: string | null
          patient_id?: string | null
          patient_name: string
          payment_mode?: string | null
          payment_status?: string | null
          priority?: string | null
          referred_by_id?: string | null
          referred_by_name?: string | null
          sample_collected_at?: string | null
          special_instructions?: string | null
          status?: string | null
          total_amount?: number | null
          updated_at?: string | null
          validated_at?: string | null
          validated_by?: string | null
        }
        Update: {
          clinical_notes?: string | null
          completed_at?: string | null
          created_at?: string | null
          created_by?: string | null
          department?: string | null
          discount_amount?: number | null
          dispatched_at?: string | null
          id?: string
          location?: string | null
          net_amount?: number | null
          order_date?: string
          order_no?: string | null
          order_time?: string | null
          order_type?: string | null
          paid_amount?: number | null
          patient_age?: number | null
          patient_gender?: string | null
          patient_id?: string | null
          patient_name?: string
          payment_mode?: string | null
          payment_status?: string | null
          priority?: string | null
          referred_by_id?: string | null
          referred_by_name?: string | null
          sample_collected_at?: string | null
          special_instructions?: string | null
          status?: string | null
          total_amount?: number | null
          updated_at?: string | null
          validated_at?: string | null
          validated_by?: string | null
        }
        Relationships: []
      }
      hms_lab_results: {
        Row: {
          comment: string | null
          entered_at: string | null
          entered_by: string | null
          flag: string | null
          id: string
          is_abnormal: boolean | null
          is_critical: boolean | null
          method: string | null
          normal_high: number | null
          normal_low: number | null
          normal_text: string | null
          order_id: string | null
          order_test_id: string
          parameter_name: string
          previous_date: string | null
          previous_value: string | null
          unit: string | null
          validated: boolean | null
          validated_at: string | null
          validated_by: string | null
          value: string | null
        }
        Insert: {
          comment?: string | null
          entered_at?: string | null
          entered_by?: string | null
          flag?: string | null
          id?: string
          is_abnormal?: boolean | null
          is_critical?: boolean | null
          method?: string | null
          normal_high?: number | null
          normal_low?: number | null
          normal_text?: string | null
          order_id?: string | null
          order_test_id: string
          parameter_name: string
          previous_date?: string | null
          previous_value?: string | null
          unit?: string | null
          validated?: boolean | null
          validated_at?: string | null
          validated_by?: string | null
          value?: string | null
        }
        Update: {
          comment?: string | null
          entered_at?: string | null
          entered_by?: string | null
          flag?: string | null
          id?: string
          is_abnormal?: boolean | null
          is_critical?: boolean | null
          method?: string | null
          normal_high?: number | null
          normal_low?: number | null
          normal_text?: string | null
          order_id?: string | null
          order_test_id?: string
          parameter_name?: string
          previous_date?: string | null
          previous_value?: string | null
          unit?: string | null
          validated?: boolean | null
          validated_at?: string | null
          validated_by?: string | null
          value?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hms_lab_results_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "hms_lab_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hms_lab_results_order_test_id_fkey"
            columns: ["order_test_id"]
            isOneToOne: false
            referencedRelation: "hms_lab_order_tests"
            referencedColumns: ["id"]
          },
        ]
      }
      hms_lab_tests: {
        Row: {
          branch: string | null
          container_type: string | null
          created_at: string | null
          department: string | null
          id: string
          is_active: boolean | null
          is_outsourced: boolean | null
          normal_max: number | null
          normal_min: number | null
          normal_range_text: string | null
          price: number | null
          sample_type: string | null
          tat_hours: number | null
          test_code: string
          test_name: string
          unit: string | null
        }
        Insert: {
          branch?: string | null
          container_type?: string | null
          created_at?: string | null
          department?: string | null
          id?: string
          is_active?: boolean | null
          is_outsourced?: boolean | null
          normal_max?: number | null
          normal_min?: number | null
          normal_range_text?: string | null
          price?: number | null
          sample_type?: string | null
          tat_hours?: number | null
          test_code: string
          test_name: string
          unit?: string | null
        }
        Update: {
          branch?: string | null
          container_type?: string | null
          created_at?: string | null
          department?: string | null
          id?: string
          is_active?: boolean | null
          is_outsourced?: boolean | null
          normal_max?: number | null
          normal_min?: number | null
          normal_range_text?: string | null
          price?: number | null
          sample_type?: string | null
          tat_hours?: number | null
          test_code?: string
          test_name?: string
          unit?: string | null
        }
        Relationships: []
      }
      hms_login_attempts: {
        Row: {
          clinic_id: string | null
          created_at: string | null
          email: string | null
          failure_reason: string | null
          id: string
          ip_address: string | null
          success: boolean | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          clinic_id?: string | null
          created_at?: string | null
          email?: string | null
          failure_reason?: string | null
          id?: string
          ip_address?: string | null
          success?: boolean | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          clinic_id?: string | null
          created_at?: string | null
          email?: string | null
          failure_reason?: string | null
          id?: string
          ip_address?: string | null
          success?: boolean | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      hms_loyalty_members: {
        Row: {
          created_at: string | null
          id: string
          join_date: string | null
          location: string | null
          next_reward: string | null
          patient_id: string | null
          patient_name: string
          points: number | null
          tier: string | null
          total_spent: number | null
          updated_at: string | null
          visits: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          join_date?: string | null
          location?: string | null
          next_reward?: string | null
          patient_id?: string | null
          patient_name: string
          points?: number | null
          tier?: string | null
          total_spent?: number | null
          updated_at?: string | null
          visits?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          join_date?: string | null
          location?: string | null
          next_reward?: string | null
          patient_id?: string | null
          patient_name?: string
          points?: number | null
          tier?: string | null
          total_spent?: number | null
          updated_at?: string | null
          visits?: number | null
        }
        Relationships: []
      }
      hms_maintenance_jobs: {
        Row: {
          assigned_to: string | null
          completed_at: string | null
          cost: number | null
          created_at: string | null
          department: string | null
          due_date: string | null
          id: string
          job_no: string | null
          job_type: string | null
          location: string | null
          location_detail: string | null
          notes: string | null
          priority: string | null
          reported_by: string | null
          reported_date: string | null
          status: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          assigned_to?: string | null
          completed_at?: string | null
          cost?: number | null
          created_at?: string | null
          department?: string | null
          due_date?: string | null
          id?: string
          job_no?: string | null
          job_type?: string | null
          location?: string | null
          location_detail?: string | null
          notes?: string | null
          priority?: string | null
          reported_by?: string | null
          reported_date?: string | null
          status?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          assigned_to?: string | null
          completed_at?: string | null
          cost?: number | null
          created_at?: string | null
          department?: string | null
          due_date?: string | null
          id?: string
          job_no?: string | null
          job_type?: string | null
          location?: string | null
          location_detail?: string | null
          notes?: string | null
          priority?: string | null
          reported_by?: string | null
          reported_date?: string | null
          status?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      hms_marketing_campaigns: {
        Row: {
          audience: string | null
          budget: number | null
          channel: string | null
          conversion_rate: number | null
          created_at: string | null
          end_date: string | null
          id: string
          location: string | null
          name: string
          notes: string | null
          open_rate: number | null
          revenue: number | null
          sent_count: number | null
          start_date: string | null
          status: string | null
        }
        Insert: {
          audience?: string | null
          budget?: number | null
          channel?: string | null
          conversion_rate?: number | null
          created_at?: string | null
          end_date?: string | null
          id?: string
          location?: string | null
          name: string
          notes?: string | null
          open_rate?: number | null
          revenue?: number | null
          sent_count?: number | null
          start_date?: string | null
          status?: string | null
        }
        Update: {
          audience?: string | null
          budget?: number | null
          channel?: string | null
          conversion_rate?: number | null
          created_at?: string | null
          end_date?: string | null
          id?: string
          location?: string | null
          name?: string
          notes?: string | null
          open_rate?: number | null
          revenue?: number | null
          sent_count?: number | null
          start_date?: string | null
          status?: string | null
        }
        Relationships: []
      }
      hms_marketing_followups: {
        Row: {
          completed_at: string | null
          contact: string | null
          created_at: string | null
          followup_type: string | null
          id: string
          lead_id: string | null
          lead_name: string
          notes: string | null
          scheduled_date: string
          status: string | null
        }
        Insert: {
          completed_at?: string | null
          contact?: string | null
          created_at?: string | null
          followup_type?: string | null
          id?: string
          lead_id?: string | null
          lead_name: string
          notes?: string | null
          scheduled_date: string
          status?: string | null
        }
        Update: {
          completed_at?: string | null
          contact?: string | null
          created_at?: string | null
          followup_type?: string | null
          id?: string
          lead_id?: string | null
          lead_name?: string
          notes?: string | null
          scheduled_date?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hms_marketing_followups_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "hms_marketing_leads"
            referencedColumns: ["id"]
          },
        ]
      }
      hms_marketing_leads: {
        Row: {
          assigned_to: string | null
          category: string | null
          contact: string
          created_at: string | null
          created_by: string | null
          due_date: string | null
          id: string
          location: string | null
          name: string
          notes: string | null
          purpose: string | null
          source: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          assigned_to?: string | null
          category?: string | null
          contact: string
          created_at?: string | null
          created_by?: string | null
          due_date?: string | null
          id?: string
          location?: string | null
          name: string
          notes?: string | null
          purpose?: string | null
          source?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          assigned_to?: string | null
          category?: string | null
          contact?: string
          created_at?: string | null
          created_by?: string | null
          due_date?: string | null
          id?: string
          location?: string | null
          name?: string
          notes?: string | null
          purpose?: string | null
          source?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      hms_noshow_records: {
        Row: {
          appointment_id: string
          auto_marked: boolean | null
          created_at: string | null
          doctor_id: string
          id: string
          marked_at: string | null
          marked_by: string | null
          notification_channel: string | null
          notification_sent: boolean | null
          notification_sent_at: string | null
          original_date: string
          original_time_slot: string | null
          patient_id: string
          reliability_impact: number | null
          rescheduled_appointment_id: string | null
          rescheduled_to_date: string | null
          resolution: string | null
          resolution_notes: string | null
          resolved_at: string | null
          resolved_by: string | null
        }
        Insert: {
          appointment_id: string
          auto_marked?: boolean | null
          created_at?: string | null
          doctor_id: string
          id?: string
          marked_at?: string | null
          marked_by?: string | null
          notification_channel?: string | null
          notification_sent?: boolean | null
          notification_sent_at?: string | null
          original_date: string
          original_time_slot?: string | null
          patient_id: string
          reliability_impact?: number | null
          rescheduled_appointment_id?: string | null
          rescheduled_to_date?: string | null
          resolution?: string | null
          resolution_notes?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
        }
        Update: {
          appointment_id?: string
          auto_marked?: boolean | null
          created_at?: string | null
          doctor_id?: string
          id?: string
          marked_at?: string | null
          marked_by?: string | null
          notification_channel?: string | null
          notification_sent?: boolean | null
          notification_sent_at?: string | null
          original_date?: string
          original_time_slot?: string | null
          patient_id?: string
          reliability_impact?: number | null
          rescheduled_appointment_id?: string | null
          rescheduled_to_date?: string | null
          resolution?: string | null
          resolution_notes?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
        }
        Relationships: []
      }
      hms_notification_log: {
        Row: {
          body: string | null
          branch: string | null
          channel: string
          clinic_id: string | null
          content: string | null
          cost: number | null
          created_at: string | null
          created_by: string | null
          delivered_at: string | null
          error_message: string | null
          external_message_id: string | null
          failed_reason: string | null
          id: string
          message_type: string | null
          metadata: Json | null
          notification_type: string
          patient_id: string | null
          patient_name: string | null
          patient_phone: string | null
          read_at: string | null
          recipient_name: string | null
          recipient_phone: string | null
          reference_id: string | null
          reference_type: string | null
          sent_at: string | null
          status: string
          subject: string | null
          template_id: string | null
          template_name: string | null
          trigger_event: string | null
          triggered_by: string | null
          triggered_by_user_id: string | null
          wa_message_id: string | null
        }
        Insert: {
          body?: string | null
          branch?: string | null
          channel: string
          clinic_id?: string | null
          content?: string | null
          cost?: number | null
          created_at?: string | null
          created_by?: string | null
          delivered_at?: string | null
          error_message?: string | null
          external_message_id?: string | null
          failed_reason?: string | null
          id?: string
          message_type?: string | null
          metadata?: Json | null
          notification_type: string
          patient_id?: string | null
          patient_name?: string | null
          patient_phone?: string | null
          read_at?: string | null
          recipient_name?: string | null
          recipient_phone?: string | null
          reference_id?: string | null
          reference_type?: string | null
          sent_at?: string | null
          status?: string
          subject?: string | null
          template_id?: string | null
          template_name?: string | null
          trigger_event?: string | null
          triggered_by?: string | null
          triggered_by_user_id?: string | null
          wa_message_id?: string | null
        }
        Update: {
          body?: string | null
          branch?: string | null
          channel?: string
          clinic_id?: string | null
          content?: string | null
          cost?: number | null
          created_at?: string | null
          created_by?: string | null
          delivered_at?: string | null
          error_message?: string | null
          external_message_id?: string | null
          failed_reason?: string | null
          id?: string
          message_type?: string | null
          metadata?: Json | null
          notification_type?: string
          patient_id?: string | null
          patient_name?: string | null
          patient_phone?: string | null
          read_at?: string | null
          recipient_name?: string | null
          recipient_phone?: string | null
          reference_id?: string | null
          reference_type?: string | null
          sent_at?: string | null
          status?: string
          subject?: string | null
          template_id?: string | null
          template_name?: string | null
          trigger_event?: string | null
          triggered_by?: string | null
          triggered_by_user_id?: string | null
          wa_message_id?: string | null
        }
        Relationships: []
      }
      hms_nursing_tasks: {
        Row: {
          admission_id: string | null
          assigned_nurse: string | null
          bed: string | null
          completed_time: string | null
          created_at: string | null
          description: string
          id: string
          notes: string | null
          nurse_id: string | null
          patient_name: string
          scheduled_time: string | null
          status: string | null
          task_type: string
          vital_bp: string | null
          vital_pulse: string | null
          vital_rr: string | null
          vital_spo2: string | null
          vital_temp: string | null
          ward: string | null
        }
        Insert: {
          admission_id?: string | null
          assigned_nurse?: string | null
          bed?: string | null
          completed_time?: string | null
          created_at?: string | null
          description: string
          id?: string
          notes?: string | null
          nurse_id?: string | null
          patient_name: string
          scheduled_time?: string | null
          status?: string | null
          task_type: string
          vital_bp?: string | null
          vital_pulse?: string | null
          vital_rr?: string | null
          vital_spo2?: string | null
          vital_temp?: string | null
          ward?: string | null
        }
        Update: {
          admission_id?: string | null
          assigned_nurse?: string | null
          bed?: string | null
          completed_time?: string | null
          created_at?: string | null
          description?: string
          id?: string
          notes?: string | null
          nurse_id?: string | null
          patient_name?: string
          scheduled_time?: string | null
          status?: string | null
          task_type?: string
          vital_bp?: string | null
          vital_pulse?: string | null
          vital_rr?: string | null
          vital_spo2?: string | null
          vital_temp?: string | null
          ward?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hms_nursing_tasks_admission_id_fkey"
            columns: ["admission_id"]
            isOneToOne: false
            referencedRelation: "hms_ip_admissions"
            referencedColumns: ["id"]
          },
        ]
      }
      hms_online_bookings: {
        Row: {
          booking_type: string | null
          created_at: string | null
          date: string
          department: string | null
          doctor_name: string | null
          id: string
          location: string | null
          notes: string | null
          patient_name: string
          payment_amount: number | null
          payment_method: string | null
          payment_status: string | null
          phone: string | null
          source: string | null
          status: string | null
          time_slot: string
          updated_at: string | null
        }
        Insert: {
          booking_type?: string | null
          created_at?: string | null
          date: string
          department?: string | null
          doctor_name?: string | null
          id?: string
          location?: string | null
          notes?: string | null
          patient_name: string
          payment_amount?: number | null
          payment_method?: string | null
          payment_status?: string | null
          phone?: string | null
          source?: string | null
          status?: string | null
          time_slot: string
          updated_at?: string | null
        }
        Update: {
          booking_type?: string | null
          created_at?: string | null
          date?: string
          department?: string | null
          doctor_name?: string | null
          id?: string
          location?: string | null
          notes?: string | null
          patient_name?: string
          payment_amount?: number | null
          payment_method?: string | null
          payment_status?: string | null
          phone?: string | null
          source?: string | null
          status?: string | null
          time_slot?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      hms_op_patients: {
        Row: {
          address: string | null
          age_months: number | null
          age_years: number | null
          allergies: string[] | null
          auth_user_id: string | null
          blood_group: string | null
          branch: string | null
          chronic_conditions: string[] | null
          city: string | null
          country: string | null
          created_at: string | null
          current_medications: string[] | null
          date_of_birth: string | null
          email: string | null
          first_name: string
          gender: string | null
          id: string
          is_active: boolean | null
          last_name: string | null
          last_visit_date: string | null
          mobile: string
          mobile_verified: boolean | null
          patient_id: string
          pincode: string | null
          prakriti: string | null
          primary_doctor_id: string | null
          referral_code: string | null
          registered_by: string | null
          source: string | null
          state: string | null
          title: string | null
          total_visits: number | null
          uhid: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          age_months?: number | null
          age_years?: number | null
          allergies?: string[] | null
          auth_user_id?: string | null
          blood_group?: string | null
          branch?: string | null
          chronic_conditions?: string[] | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          current_medications?: string[] | null
          date_of_birth?: string | null
          email?: string | null
          first_name: string
          gender?: string | null
          id?: string
          is_active?: boolean | null
          last_name?: string | null
          last_visit_date?: string | null
          mobile: string
          mobile_verified?: boolean | null
          patient_id: string
          pincode?: string | null
          prakriti?: string | null
          primary_doctor_id?: string | null
          referral_code?: string | null
          registered_by?: string | null
          source?: string | null
          state?: string | null
          title?: string | null
          total_visits?: number | null
          uhid?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          age_months?: number | null
          age_years?: number | null
          allergies?: string[] | null
          auth_user_id?: string | null
          blood_group?: string | null
          branch?: string | null
          chronic_conditions?: string[] | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          current_medications?: string[] | null
          date_of_birth?: string | null
          email?: string | null
          first_name?: string
          gender?: string | null
          id?: string
          is_active?: boolean | null
          last_name?: string | null
          last_visit_date?: string | null
          mobile?: string
          mobile_verified?: boolean | null
          patient_id?: string
          pincode?: string | null
          prakriti?: string | null
          primary_doctor_id?: string | null
          referral_code?: string | null
          registered_by?: string | null
          source?: string | null
          state?: string | null
          title?: string | null
          total_visits?: number | null
          uhid?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hms_op_patients_primary_doctor_id_fkey"
            columns: ["primary_doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
        ]
      }
      hms_op_visits: {
        Row: {
          assigned_by: string | null
          bill_amount: number | null
          bill_status: string | null
          branch: string | null
          check_in_time: string | null
          check_out_time: string | null
          chief_complaint: string | null
          consultation_fee: number | null
          created_at: string | null
          doctor_id: string | null
          doctor_name: string | null
          id: string
          mode_visit: string | null
          notes: string | null
          op_number: number
          patient_display_id: string
          patient_id: string
          payment_mode: string | null
          prescription_given: boolean | null
          purpose: string | null
          queue_position: number | null
          referred_by: string | null
          session_token: number | null
          status: string | null
          updated_at: string | null
          visit_date: string
          vitals_captured: boolean | null
        }
        Insert: {
          assigned_by?: string | null
          bill_amount?: number | null
          bill_status?: string | null
          branch?: string | null
          check_in_time?: string | null
          check_out_time?: string | null
          chief_complaint?: string | null
          consultation_fee?: number | null
          created_at?: string | null
          doctor_id?: string | null
          doctor_name?: string | null
          id?: string
          mode_visit?: string | null
          notes?: string | null
          op_number?: number
          patient_display_id: string
          patient_id: string
          payment_mode?: string | null
          prescription_given?: boolean | null
          purpose?: string | null
          queue_position?: number | null
          referred_by?: string | null
          session_token?: number | null
          status?: string | null
          updated_at?: string | null
          visit_date?: string
          vitals_captured?: boolean | null
        }
        Update: {
          assigned_by?: string | null
          bill_amount?: number | null
          bill_status?: string | null
          branch?: string | null
          check_in_time?: string | null
          check_out_time?: string | null
          chief_complaint?: string | null
          consultation_fee?: number | null
          created_at?: string | null
          doctor_id?: string | null
          doctor_name?: string | null
          id?: string
          mode_visit?: string | null
          notes?: string | null
          op_number?: number
          patient_display_id?: string
          patient_id?: string
          payment_mode?: string | null
          prescription_given?: boolean | null
          purpose?: string | null
          queue_position?: number | null
          referred_by?: string | null
          session_token?: number | null
          status?: string | null
          updated_at?: string | null
          visit_date?: string
          vitals_captured?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "hms_op_visits_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hms_op_visits_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "hms_op_patients"
            referencedColumns: ["id"]
          },
        ]
      }
      hms_ot_rooms: {
        Row: {
          created_at: string | null
          current_case: string | null
          id: string
          is_active: boolean | null
          location: string | null
          name: string
          room_type: string | null
          status: string | null
          utilization_today: number | null
        }
        Insert: {
          created_at?: string | null
          current_case?: string | null
          id?: string
          is_active?: boolean | null
          location?: string | null
          name: string
          room_type?: string | null
          status?: string | null
          utilization_today?: number | null
        }
        Update: {
          created_at?: string | null
          current_case?: string | null
          id?: string
          is_active?: boolean | null
          location?: string | null
          name?: string
          room_type?: string | null
          status?: string | null
          utilization_today?: number | null
        }
        Relationships: []
      }
      hms_ot_schedule: {
        Row: {
          anesthetist: string | null
          completed_at: string | null
          created_at: string | null
          created_by: string | null
          duration: string | null
          id: string
          notes: string | null
          nursing_team: string | null
          ot_room: string
          patient_id: string | null
          patient_name: string
          procedure_name: string
          procedure_type: string | null
          schedule_date: string
          scheduled_time: string | null
          started_at: string | null
          status: string | null
          surgeon_name: string | null
        }
        Insert: {
          anesthetist?: string | null
          completed_at?: string | null
          created_at?: string | null
          created_by?: string | null
          duration?: string | null
          id?: string
          notes?: string | null
          nursing_team?: string | null
          ot_room: string
          patient_id?: string | null
          patient_name: string
          procedure_name: string
          procedure_type?: string | null
          schedule_date?: string
          scheduled_time?: string | null
          started_at?: string | null
          status?: string | null
          surgeon_name?: string | null
        }
        Update: {
          anesthetist?: string | null
          completed_at?: string | null
          created_at?: string | null
          created_by?: string | null
          duration?: string | null
          id?: string
          notes?: string | null
          nursing_team?: string | null
          ot_room?: string
          patient_id?: string | null
          patient_name?: string
          procedure_name?: string
          procedure_type?: string | null
          schedule_date?: string
          scheduled_time?: string | null
          started_at?: string | null
          status?: string | null
          surgeon_name?: string | null
        }
        Relationships: []
      }
      hms_pan_validation_log: {
        Row: {
          bill_id: string | null
          cash_amount: number
          clinic_id: string | null
          created_at: string | null
          id: string
          pan_name: string
          pan_number: string
          pan_valid: boolean | null
          patient_id: string | null
          patient_name: string | null
          penalty_risk: number | null
          section_269st_applicable: boolean | null
          validated_at: string | null
          validated_by: string | null
        }
        Insert: {
          bill_id?: string | null
          cash_amount: number
          clinic_id?: string | null
          created_at?: string | null
          id?: string
          pan_name: string
          pan_number: string
          pan_valid?: boolean | null
          patient_id?: string | null
          patient_name?: string | null
          penalty_risk?: number | null
          section_269st_applicable?: boolean | null
          validated_at?: string | null
          validated_by?: string | null
        }
        Update: {
          bill_id?: string | null
          cash_amount?: number
          clinic_id?: string | null
          created_at?: string | null
          id?: string
          pan_name?: string
          pan_number?: string
          pan_valid?: boolean | null
          patient_id?: string | null
          patient_name?: string | null
          penalty_risk?: number | null
          section_269st_applicable?: boolean | null
          validated_at?: string | null
          validated_by?: string | null
        }
        Relationships: []
      }
      hms_patient_advances: {
        Row: {
          amount: number
          amount_refunded: number | null
          amount_used: number | null
          balance: number | null
          collected_by: string | null
          created_at: string | null
          id: string
          ip_admission_id: string | null
          notes: string | null
          patient_id: string
          payment_mode: string
          purpose: string | null
          receipt_number: string | null
          status: string | null
          transaction_reference: string | null
          updated_at: string | null
        }
        Insert: {
          amount: number
          amount_refunded?: number | null
          amount_used?: number | null
          balance?: number | null
          collected_by?: string | null
          created_at?: string | null
          id?: string
          ip_admission_id?: string | null
          notes?: string | null
          patient_id: string
          payment_mode: string
          purpose?: string | null
          receipt_number?: string | null
          status?: string | null
          transaction_reference?: string | null
          updated_at?: string | null
        }
        Update: {
          amount?: number
          amount_refunded?: number | null
          amount_used?: number | null
          balance?: number | null
          collected_by?: string | null
          created_at?: string | null
          id?: string
          ip_admission_id?: string | null
          notes?: string | null
          patient_id?: string
          payment_mode?: string
          purpose?: string | null
          receipt_number?: string | null
          status?: string | null
          transaction_reference?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      hms_patient_card_scans: {
        Row: {
          auto_token_generated: boolean | null
          card_id: string
          created_at: string | null
          id: string
          ip_address: string | null
          patient_id: string
          scan_purpose: string | null
          scanned_at_clinic: string | null
          scanned_at_clinic_name: string | null
          scanned_by: string | null
          token_number: number | null
        }
        Insert: {
          auto_token_generated?: boolean | null
          card_id: string
          created_at?: string | null
          id?: string
          ip_address?: string | null
          patient_id: string
          scan_purpose?: string | null
          scanned_at_clinic?: string | null
          scanned_at_clinic_name?: string | null
          scanned_by?: string | null
          token_number?: number | null
        }
        Update: {
          auto_token_generated?: boolean | null
          card_id?: string
          created_at?: string | null
          id?: string
          ip_address?: string | null
          patient_id?: string
          scan_purpose?: string | null
          scanned_at_clinic?: string | null
          scanned_at_clinic_name?: string | null
          scanned_by?: string | null
          token_number?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "hms_patient_card_scans_card_id_fkey"
            columns: ["card_id"]
            isOneToOne: false
            referencedRelation: "hms_patient_cards"
            referencedColumns: ["id"]
          },
        ]
      }
      hms_patient_cards: {
        Row: {
          allergies: string[] | null
          blood_group: string | null
          card_number: string | null
          card_status: string | null
          created_at: string | null
          digital_wallet_added: boolean | null
          dob: string | null
          emergency_contact: string | null
          expires_at: string | null
          gender: string | null
          id: string
          insurance_summary: string | null
          issued_at: string | null
          issued_at_clinic: string | null
          issued_by: string | null
          last_scanned_at: string | null
          last_scanned_clinic: string | null
          patient_id: string
          patient_name: string
          phone: string | null
          photo_url: string | null
          prakriti_type: string | null
          printed: boolean | null
          qr_code_data: string
          qr_code_url: string | null
          scan_count: number | null
          sent_via_email: boolean | null
          sent_via_whatsapp: boolean | null
          uhid: string
          updated_at: string | null
        }
        Insert: {
          allergies?: string[] | null
          blood_group?: string | null
          card_number?: string | null
          card_status?: string | null
          created_at?: string | null
          digital_wallet_added?: boolean | null
          dob?: string | null
          emergency_contact?: string | null
          expires_at?: string | null
          gender?: string | null
          id?: string
          insurance_summary?: string | null
          issued_at?: string | null
          issued_at_clinic?: string | null
          issued_by?: string | null
          last_scanned_at?: string | null
          last_scanned_clinic?: string | null
          patient_id: string
          patient_name: string
          phone?: string | null
          photo_url?: string | null
          prakriti_type?: string | null
          printed?: boolean | null
          qr_code_data: string
          qr_code_url?: string | null
          scan_count?: number | null
          sent_via_email?: boolean | null
          sent_via_whatsapp?: boolean | null
          uhid: string
          updated_at?: string | null
        }
        Update: {
          allergies?: string[] | null
          blood_group?: string | null
          card_number?: string | null
          card_status?: string | null
          created_at?: string | null
          digital_wallet_added?: boolean | null
          dob?: string | null
          emergency_contact?: string | null
          expires_at?: string | null
          gender?: string | null
          id?: string
          insurance_summary?: string | null
          issued_at?: string | null
          issued_at_clinic?: string | null
          issued_by?: string | null
          last_scanned_at?: string | null
          last_scanned_clinic?: string | null
          patient_id?: string
          patient_name?: string
          phone?: string | null
          photo_url?: string | null
          prakriti_type?: string | null
          printed?: boolean | null
          qr_code_data?: string
          qr_code_url?: string | null
          scan_count?: number | null
          sent_via_email?: boolean | null
          sent_via_whatsapp?: boolean | null
          uhid?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      hms_patient_feedback: {
        Row: {
          category: string | null
          comment: string | null
          created_at: string | null
          date: string | null
          department: string | null
          doctor_name: string | null
          google_review: boolean | null
          id: string
          location: string | null
          nps_score: number | null
          patient_id: string | null
          patient_name: string
          rating: number
          sentiment: string | null
          status: string | null
          updated_at: string | null
          visit_type: string | null
        }
        Insert: {
          category?: string | null
          comment?: string | null
          created_at?: string | null
          date?: string | null
          department?: string | null
          doctor_name?: string | null
          google_review?: boolean | null
          id?: string
          location?: string | null
          nps_score?: number | null
          patient_id?: string | null
          patient_name: string
          rating: number
          sentiment?: string | null
          status?: string | null
          updated_at?: string | null
          visit_type?: string | null
        }
        Update: {
          category?: string | null
          comment?: string | null
          created_at?: string | null
          date?: string | null
          department?: string | null
          doctor_name?: string | null
          google_review?: boolean | null
          id?: string
          location?: string | null
          nps_score?: number | null
          patient_id?: string | null
          patient_name?: string
          rating?: number
          sentiment?: string | null
          status?: string | null
          updated_at?: string | null
          visit_type?: string | null
        }
        Relationships: []
      }
      hms_patient_insurance: {
        Row: {
          card_number: string | null
          card_photo_url: string | null
          company_name: string
          created_at: string | null
          id: string
          insurance_company_id: string | null
          is_active: boolean | null
          is_verified: boolean | null
          member_id: string | null
          patient_id: string | null
          policy_number: string
          relation: string | null
          sum_insured: number | null
          valid_from: string | null
          valid_to: string | null
        }
        Insert: {
          card_number?: string | null
          card_photo_url?: string | null
          company_name: string
          created_at?: string | null
          id?: string
          insurance_company_id?: string | null
          is_active?: boolean | null
          is_verified?: boolean | null
          member_id?: string | null
          patient_id?: string | null
          policy_number: string
          relation?: string | null
          sum_insured?: number | null
          valid_from?: string | null
          valid_to?: string | null
        }
        Update: {
          card_number?: string | null
          card_photo_url?: string | null
          company_name?: string
          created_at?: string | null
          id?: string
          insurance_company_id?: string | null
          is_active?: boolean | null
          is_verified?: boolean | null
          member_id?: string | null
          patient_id?: string | null
          policy_number?: string
          relation?: string | null
          sum_insured?: number | null
          valid_from?: string | null
          valid_to?: string | null
        }
        Relationships: []
      }
      hms_payment_receipts: {
        Row: {
          amount: number
          bill_id: string
          branch: string | null
          created_at: string | null
          id: string
          notes: string | null
          patient_id: string
          payment_mode: string
          payment_reference: string | null
          receipt_date: string | null
          receipt_number: string
          received_by: string | null
        }
        Insert: {
          amount: number
          bill_id: string
          branch?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          patient_id: string
          payment_mode: string
          payment_reference?: string | null
          receipt_date?: string | null
          receipt_number: string
          received_by?: string | null
        }
        Update: {
          amount?: number
          bill_id?: string
          branch?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          patient_id?: string
          payment_mode?: string
          payment_reference?: string | null
          receipt_date?: string | null
          receipt_number?: string
          received_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hms_payment_receipts_bill_id_fkey"
            columns: ["bill_id"]
            isOneToOne: false
            referencedRelation: "hms_bills"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hms_payment_receipts_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "hms_op_patients"
            referencedColumns: ["id"]
          },
        ]
      }
      hms_payroll: {
        Row: {
          absent_days: number | null
          advance_deduction: number | null
          allowances: number | null
          basic: number | null
          branch: string | null
          created_at: string | null
          employee_id: string | null
          employee_name: string
          esi_employee: number | null
          gross_salary: number | null
          hra: number | null
          id: string
          incentive: number | null
          leave_days: number | null
          net_salary: number | null
          other_deductions: number | null
          overtime_pay: number | null
          paid_date: string | null
          pay_month: number
          pay_year: number
          payment_mode: string | null
          pf_employee: number | null
          present_days: number | null
          staff_id: string | null
          status: string | null
          tds: number | null
          total_days: number | null
          total_deductions: number | null
        }
        Insert: {
          absent_days?: number | null
          advance_deduction?: number | null
          allowances?: number | null
          basic?: number | null
          branch?: string | null
          created_at?: string | null
          employee_id?: string | null
          employee_name?: string
          esi_employee?: number | null
          gross_salary?: number | null
          hra?: number | null
          id?: string
          incentive?: number | null
          leave_days?: number | null
          net_salary?: number | null
          other_deductions?: number | null
          overtime_pay?: number | null
          paid_date?: string | null
          pay_month: number
          pay_year: number
          payment_mode?: string | null
          pf_employee?: number | null
          present_days?: number | null
          staff_id?: string | null
          status?: string | null
          tds?: number | null
          total_days?: number | null
          total_deductions?: number | null
        }
        Update: {
          absent_days?: number | null
          advance_deduction?: number | null
          allowances?: number | null
          basic?: number | null
          branch?: string | null
          created_at?: string | null
          employee_id?: string | null
          employee_name?: string
          esi_employee?: number | null
          gross_salary?: number | null
          hra?: number | null
          id?: string
          incentive?: number | null
          leave_days?: number | null
          net_salary?: number | null
          other_deductions?: number | null
          overtime_pay?: number | null
          paid_date?: string | null
          pay_month?: number
          pay_year?: number
          payment_mode?: string | null
          pf_employee?: number | null
          present_days?: number | null
          staff_id?: string | null
          status?: string | null
          tds?: number | null
          total_days?: number | null
          total_deductions?: number | null
        }
        Relationships: []
      }
      hms_phone_unmask_log: {
        Row: {
          clinic_id: string | null
          created_at: string | null
          id: string
          ip_address: string | null
          patient_id: string
          reason: string | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          clinic_id?: string | null
          created_at?: string | null
          id?: string
          ip_address?: string | null
          patient_id: string
          reason?: string | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          clinic_id?: string | null
          created_at?: string | null
          id?: string
          ip_address?: string | null
          patient_id?: string
          reason?: string | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      hms_pk_enrollments: {
        Row: {
          branch: string | null
          completed_sessions: number | null
          created_at: string | null
          end_date: string | null
          id: string
          notes: string | null
          odi_after: number | null
          odi_before: number | null
          package_id: string | null
          package_name: string
          paid_amount: number | null
          pain_score_after: number | null
          pain_score_before: number | null
          patient_display_id: string | null
          patient_id: string
          patient_name: string
          prescribing_doctor: string
          start_date: string
          status: string | null
          total_amount: number | null
          total_sessions: number
          updated_at: string | null
        }
        Insert: {
          branch?: string | null
          completed_sessions?: number | null
          created_at?: string | null
          end_date?: string | null
          id?: string
          notes?: string | null
          odi_after?: number | null
          odi_before?: number | null
          package_id?: string | null
          package_name: string
          paid_amount?: number | null
          pain_score_after?: number | null
          pain_score_before?: number | null
          patient_display_id?: string | null
          patient_id: string
          patient_name: string
          prescribing_doctor: string
          start_date?: string
          status?: string | null
          total_amount?: number | null
          total_sessions: number
          updated_at?: string | null
        }
        Update: {
          branch?: string | null
          completed_sessions?: number | null
          created_at?: string | null
          end_date?: string | null
          id?: string
          notes?: string | null
          odi_after?: number | null
          odi_before?: number | null
          package_id?: string | null
          package_name?: string
          paid_amount?: number | null
          pain_score_after?: number | null
          pain_score_before?: number | null
          patient_display_id?: string | null
          patient_id?: string
          patient_name?: string
          prescribing_doctor?: string
          start_date?: string
          status?: string | null
          total_amount?: number | null
          total_sessions?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hms_pk_enrollments_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "hms_pk_packages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hms_pk_enrollments_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "hms_op_patients"
            referencedColumns: ["id"]
          },
        ]
      }
      hms_pk_packages: {
        Row: {
          branch: string | null
          created_at: string | null
          description: string | null
          duration_days: number
          id: string
          is_active: boolean | null
          package_name: string
          price: number
          therapies: Json | null
          total_sessions: number
        }
        Insert: {
          branch?: string | null
          created_at?: string | null
          description?: string | null
          duration_days: number
          id?: string
          is_active?: boolean | null
          package_name: string
          price: number
          therapies?: Json | null
          total_sessions: number
        }
        Update: {
          branch?: string | null
          created_at?: string | null
          description?: string | null
          duration_days?: number
          id?: string
          is_active?: boolean | null
          package_name?: string
          price?: number
          therapies?: Json | null
          total_sessions?: number
        }
        Relationships: []
      }
      hms_pk_sessions: {
        Row: {
          adverse_reactions: string | null
          bp_after: string | null
          bp_before: string | null
          branch: string | null
          created_at: string | null
          duration_min: number | null
          end_time: string | null
          enrollment_id: string
          herbs_used: string | null
          id: string
          materials_notes: string | null
          observations: string | null
          oil_quantity_ml: number | null
          oil_used: string | null
          pain_after: number | null
          pain_before: number | null
          patient_id: string
          patient_response: string | null
          room: string | null
          session_date: string
          session_number: number
          start_time: string | null
          status: string | null
          therapist_id: string | null
          therapist_name: string | null
          therapy_name: string
          therapy_type: string | null
          updated_at: string | null
        }
        Insert: {
          adverse_reactions?: string | null
          bp_after?: string | null
          bp_before?: string | null
          branch?: string | null
          created_at?: string | null
          duration_min?: number | null
          end_time?: string | null
          enrollment_id: string
          herbs_used?: string | null
          id?: string
          materials_notes?: string | null
          observations?: string | null
          oil_quantity_ml?: number | null
          oil_used?: string | null
          pain_after?: number | null
          pain_before?: number | null
          patient_id: string
          patient_response?: string | null
          room?: string | null
          session_date?: string
          session_number: number
          start_time?: string | null
          status?: string | null
          therapist_id?: string | null
          therapist_name?: string | null
          therapy_name: string
          therapy_type?: string | null
          updated_at?: string | null
        }
        Update: {
          adverse_reactions?: string | null
          bp_after?: string | null
          bp_before?: string | null
          branch?: string | null
          created_at?: string | null
          duration_min?: number | null
          end_time?: string | null
          enrollment_id?: string
          herbs_used?: string | null
          id?: string
          materials_notes?: string | null
          observations?: string | null
          oil_quantity_ml?: number | null
          oil_used?: string | null
          pain_after?: number | null
          pain_before?: number | null
          patient_id?: string
          patient_response?: string | null
          room?: string | null
          session_date?: string
          session_number?: number
          start_time?: string | null
          status?: string | null
          therapist_id?: string | null
          therapist_name?: string | null
          therapy_name?: string
          therapy_type?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hms_pk_sessions_enrollment_id_fkey"
            columns: ["enrollment_id"]
            isOneToOne: false
            referencedRelation: "hms_pk_enrollments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hms_pk_sessions_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "hms_op_patients"
            referencedColumns: ["id"]
          },
        ]
      }
      hms_prescription_items: {
        Row: {
          anupana: string | null
          classical_ref: string | null
          created_at: string | null
          dispensed_qty: number | null
          dosage: string | null
          duration: string | null
          duration_days: number | null
          frequency: string | null
          generic_name: string | null
          id: string
          instructions: string | null
          is_dispensed: boolean | null
          medicine_name: string
          medicine_type: string | null
          prescription_id: string
          quantity: number | null
          route: string | null
          sort_order: number | null
          timing: string | null
        }
        Insert: {
          anupana?: string | null
          classical_ref?: string | null
          created_at?: string | null
          dispensed_qty?: number | null
          dosage?: string | null
          duration?: string | null
          duration_days?: number | null
          frequency?: string | null
          generic_name?: string | null
          id?: string
          instructions?: string | null
          is_dispensed?: boolean | null
          medicine_name: string
          medicine_type?: string | null
          prescription_id: string
          quantity?: number | null
          route?: string | null
          sort_order?: number | null
          timing?: string | null
        }
        Update: {
          anupana?: string | null
          classical_ref?: string | null
          created_at?: string | null
          dispensed_qty?: number | null
          dosage?: string | null
          duration?: string | null
          duration_days?: number | null
          frequency?: string | null
          generic_name?: string | null
          id?: string
          instructions?: string | null
          is_dispensed?: boolean | null
          medicine_name?: string
          medicine_type?: string | null
          prescription_id?: string
          quantity?: number | null
          route?: string | null
          sort_order?: number | null
          timing?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hms_prescription_items_prescription_id_fkey"
            columns: ["prescription_id"]
            isOneToOne: false
            referencedRelation: "hms_prescriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      hms_prescriptions: {
        Row: {
          branch: string | null
          created_at: string | null
          diagnosis: string | null
          diet_instructions: string | null
          doctor_id: string | null
          doctor_name: string
          doctor_user_id: string | null
          follow_up_date: string | null
          icd_code: string | null
          id: string
          is_signed: boolean | null
          namaste_code: string | null
          patient_display_id: string | null
          patient_id: string
          patient_name: string
          pharmacy_status: string | null
          signed_at: string | null
          special_instructions: string | null
          status: string | null
          updated_at: string | null
          valid_days: number | null
          visit_id: string | null
        }
        Insert: {
          branch?: string | null
          created_at?: string | null
          diagnosis?: string | null
          diet_instructions?: string | null
          doctor_id?: string | null
          doctor_name: string
          doctor_user_id?: string | null
          follow_up_date?: string | null
          icd_code?: string | null
          id?: string
          is_signed?: boolean | null
          namaste_code?: string | null
          patient_display_id?: string | null
          patient_id: string
          patient_name: string
          pharmacy_status?: string | null
          signed_at?: string | null
          special_instructions?: string | null
          status?: string | null
          updated_at?: string | null
          valid_days?: number | null
          visit_id?: string | null
        }
        Update: {
          branch?: string | null
          created_at?: string | null
          diagnosis?: string | null
          diet_instructions?: string | null
          doctor_id?: string | null
          doctor_name?: string
          doctor_user_id?: string | null
          follow_up_date?: string | null
          icd_code?: string | null
          id?: string
          is_signed?: boolean | null
          namaste_code?: string | null
          patient_display_id?: string | null
          patient_id?: string
          patient_name?: string
          pharmacy_status?: string | null
          signed_at?: string | null
          special_instructions?: string | null
          status?: string | null
          updated_at?: string | null
          valid_days?: number | null
          visit_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hms_prescriptions_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hms_prescriptions_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "hms_op_patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hms_prescriptions_visit_id_fkey"
            columns: ["visit_id"]
            isOneToOne: false
            referencedRelation: "hms_op_visits"
            referencedColumns: ["id"]
          },
        ]
      }
      hms_purchase_orders: {
        Row: {
          branch: string | null
          created_at: string | null
          created_by: string | null
          discount_amount: number | null
          expected_delivery: string | null
          id: string
          net_amount: number | null
          notes: string | null
          po_date: string | null
          po_number: string
          status: string | null
          supplier_contact: string | null
          supplier_name: string
          tax_amount: number | null
          total_amount: number | null
          updated_at: string | null
        }
        Insert: {
          branch?: string | null
          created_at?: string | null
          created_by?: string | null
          discount_amount?: number | null
          expected_delivery?: string | null
          id?: string
          net_amount?: number | null
          notes?: string | null
          po_date?: string | null
          po_number: string
          status?: string | null
          supplier_contact?: string | null
          supplier_name: string
          tax_amount?: number | null
          total_amount?: number | null
          updated_at?: string | null
        }
        Update: {
          branch?: string | null
          created_at?: string | null
          created_by?: string | null
          discount_amount?: number | null
          expected_delivery?: string | null
          id?: string
          net_amount?: number | null
          notes?: string | null
          po_date?: string | null
          po_number?: string
          status?: string | null
          supplier_contact?: string | null
          supplier_name?: string
          tax_amount?: number | null
          total_amount?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      hms_qr_attendance: {
        Row: {
          attendance_date: string
          check_in_at: string | null
          check_in_lat: number | null
          check_in_lng: number | null
          check_in_location_valid: boolean | null
          check_in_method: string | null
          check_out_at: string | null
          check_out_lat: number | null
          check_out_lng: number | null
          check_out_location_valid: boolean | null
          clinic_id: string | null
          created_at: string | null
          device_info: string | null
          hours_worked: string | null
          id: string
          ip_address: string | null
          late_by_minutes: number | null
          notes: string | null
          qr_code_id: string | null
          role: string | null
          staff_id: string
          staff_name: string | null
          status: string | null
        }
        Insert: {
          attendance_date?: string
          check_in_at?: string | null
          check_in_lat?: number | null
          check_in_lng?: number | null
          check_in_location_valid?: boolean | null
          check_in_method?: string | null
          check_out_at?: string | null
          check_out_lat?: number | null
          check_out_lng?: number | null
          check_out_location_valid?: boolean | null
          clinic_id?: string | null
          created_at?: string | null
          device_info?: string | null
          hours_worked?: string | null
          id?: string
          ip_address?: string | null
          late_by_minutes?: number | null
          notes?: string | null
          qr_code_id?: string | null
          role?: string | null
          staff_id: string
          staff_name?: string | null
          status?: string | null
        }
        Update: {
          attendance_date?: string
          check_in_at?: string | null
          check_in_lat?: number | null
          check_in_lng?: number | null
          check_in_location_valid?: boolean | null
          check_in_method?: string | null
          check_out_at?: string | null
          check_out_lat?: number | null
          check_out_lng?: number | null
          check_out_location_valid?: boolean | null
          clinic_id?: string | null
          created_at?: string | null
          device_info?: string | null
          hours_worked?: string | null
          id?: string
          ip_address?: string | null
          late_by_minutes?: number | null
          notes?: string | null
          qr_code_id?: string | null
          role?: string | null
          staff_id?: string
          staff_name?: string | null
          status?: string | null
        }
        Relationships: []
      }
      hms_queue_config: {
        Row: {
          announce_audio: boolean | null
          branch: string | null
          counter_number: number | null
          created_at: string | null
          department: string | null
          display_name: string
          doctor_name: string | null
          id: string
          is_active: boolean | null
          prefix: string | null
          show_department: boolean | null
          show_patient_name: boolean | null
        }
        Insert: {
          announce_audio?: boolean | null
          branch?: string | null
          counter_number?: number | null
          created_at?: string | null
          department?: string | null
          display_name: string
          doctor_name?: string | null
          id?: string
          is_active?: boolean | null
          prefix?: string | null
          show_department?: boolean | null
          show_patient_name?: boolean | null
        }
        Update: {
          announce_audio?: boolean | null
          branch?: string | null
          counter_number?: number | null
          created_at?: string | null
          department?: string | null
          display_name?: string
          doctor_name?: string | null
          id?: string
          is_active?: boolean | null
          prefix?: string | null
          show_department?: boolean | null
          show_patient_name?: boolean | null
        }
        Relationships: []
      }
      hms_queue_display_state: {
        Row: {
          avg_wait_min: number | null
          branch: string | null
          config_id: string | null
          current_patient_name: string | null
          current_token: number | null
          display_date: string | null
          id: string
          last_called_at: string | null
          next_token: number | null
          total_served: number | null
          total_waiting: number | null
          updated_at: string | null
        }
        Insert: {
          avg_wait_min?: number | null
          branch?: string | null
          config_id?: string | null
          current_patient_name?: string | null
          current_token?: number | null
          display_date?: string | null
          id?: string
          last_called_at?: string | null
          next_token?: number | null
          total_served?: number | null
          total_waiting?: number | null
          updated_at?: string | null
        }
        Update: {
          avg_wait_min?: number | null
          branch?: string | null
          config_id?: string | null
          current_patient_name?: string | null
          current_token?: number | null
          display_date?: string | null
          id?: string
          last_called_at?: string | null
          next_token?: number | null
          total_served?: number | null
          total_waiting?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hms_queue_display_state_config_id_fkey"
            columns: ["config_id"]
            isOneToOne: false
            referencedRelation: "hms_queue_config"
            referencedColumns: ["id"]
          },
        ]
      }
      hms_queue_tokens: {
        Row: {
          called_at: string | null
          completed_at: string | null
          created_at: string | null
          department: string | null
          doctor_name: string | null
          estimated_wait: string | null
          id: string
          location: string | null
          patient_id: string | null
          patient_name: string
          queue_date: string | null
          scheduled_time: string | null
          status: string | null
          token_no: string
        }
        Insert: {
          called_at?: string | null
          completed_at?: string | null
          created_at?: string | null
          department?: string | null
          doctor_name?: string | null
          estimated_wait?: string | null
          id?: string
          location?: string | null
          patient_id?: string | null
          patient_name: string
          queue_date?: string | null
          scheduled_time?: string | null
          status?: string | null
          token_no: string
        }
        Update: {
          called_at?: string | null
          completed_at?: string | null
          created_at?: string | null
          department?: string | null
          doctor_name?: string | null
          estimated_wait?: string | null
          id?: string
          location?: string | null
          patient_id?: string | null
          patient_name?: string
          queue_date?: string | null
          scheduled_time?: string | null
          status?: string | null
          token_no?: string
        }
        Relationships: []
      }
      hms_quiz_attempts: {
        Row: {
          answers: Json | null
          coins_earned: number | null
          completed_at: string | null
          correct_answers: number
          created_at: string | null
          id: string
          quiz_type: string | null
          score_pct: number | null
          skipped: number | null
          started_at: string | null
          streak_day: number | null
          subject: string | null
          time_taken_seconds: number | null
          total_questions: number
          user_id: string
          wrong_answers: number
        }
        Insert: {
          answers?: Json | null
          coins_earned?: number | null
          completed_at?: string | null
          correct_answers?: number
          created_at?: string | null
          id?: string
          quiz_type?: string | null
          score_pct?: number | null
          skipped?: number | null
          started_at?: string | null
          streak_day?: number | null
          subject?: string | null
          time_taken_seconds?: number | null
          total_questions?: number
          user_id: string
          wrong_answers?: number
        }
        Update: {
          answers?: Json | null
          coins_earned?: number | null
          completed_at?: string | null
          correct_answers?: number
          created_at?: string | null
          id?: string
          quiz_type?: string | null
          score_pct?: number | null
          skipped?: number | null
          started_at?: string | null
          streak_day?: number | null
          subject?: string | null
          time_taken_seconds?: number | null
          total_questions?: number
          user_id?: string
          wrong_answers?: number
        }
        Relationships: []
      }
      hms_quiz_questions: {
        Row: {
          correct_answer: number
          created_at: string | null
          created_by: string | null
          difficulty: string | null
          explanation: string | null
          id: string
          is_active: boolean | null
          options: Json
          question: string
          source: string | null
          subject: string
          tags: string[] | null
          topic: string | null
        }
        Insert: {
          correct_answer: number
          created_at?: string | null
          created_by?: string | null
          difficulty?: string | null
          explanation?: string | null
          id?: string
          is_active?: boolean | null
          options?: Json
          question: string
          source?: string | null
          subject: string
          tags?: string[] | null
          topic?: string | null
        }
        Update: {
          correct_answer?: number
          created_at?: string | null
          created_by?: string | null
          difficulty?: string | null
          explanation?: string | null
          id?: string
          is_active?: boolean | null
          options?: Json
          question?: string
          source?: string | null
          subject?: string
          tags?: string[] | null
          topic?: string | null
        }
        Relationships: []
      }
      hms_radiology_orders: {
        Row: {
          clinical_indication: string | null
          completed_at: string | null
          created_at: string | null
          id: string
          investigation: string
          location: string | null
          modality: string
          ordered_by: string | null
          ordered_date: string | null
          patient_name: string
          priority: string | null
          report: string | null
          reported_at: string | null
          reported_by: string | null
          scheduled_time: string | null
          started_at: string | null
          status: string | null
          uhid: string | null
          updated_at: string | null
        }
        Insert: {
          clinical_indication?: string | null
          completed_at?: string | null
          created_at?: string | null
          id?: string
          investigation: string
          location?: string | null
          modality?: string
          ordered_by?: string | null
          ordered_date?: string | null
          patient_name: string
          priority?: string | null
          report?: string | null
          reported_at?: string | null
          reported_by?: string | null
          scheduled_time?: string | null
          started_at?: string | null
          status?: string | null
          uhid?: string | null
          updated_at?: string | null
        }
        Update: {
          clinical_indication?: string | null
          completed_at?: string | null
          created_at?: string | null
          id?: string
          investigation?: string
          location?: string | null
          modality?: string
          ordered_by?: string | null
          ordered_date?: string | null
          patient_name?: string
          priority?: string | null
          report?: string | null
          reported_at?: string | null
          reported_by?: string | null
          scheduled_time?: string | null
          started_at?: string | null
          status?: string | null
          uhid?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      hms_referrals: {
        Row: {
          commission: number | null
          created_at: string | null
          date: string | null
          department: string | null
          id: string
          location: string | null
          notes: string | null
          patient_name: string
          referred_by: string
          referred_to: string | null
          referrer_type: string | null
          status: string | null
        }
        Insert: {
          commission?: number | null
          created_at?: string | null
          date?: string | null
          department?: string | null
          id?: string
          location?: string | null
          notes?: string | null
          patient_name: string
          referred_by: string
          referred_to?: string | null
          referrer_type?: string | null
          status?: string | null
        }
        Update: {
          commission?: number | null
          created_at?: string | null
          date?: string | null
          department?: string | null
          id?: string
          location?: string | null
          notes?: string | null
          patient_name?: string
          referred_by?: string
          referred_to?: string | null
          referrer_type?: string | null
          status?: string | null
        }
        Relationships: []
      }
      hms_refund_requests: {
        Row: {
          advance_id: string | null
          approved_at: string | null
          approved_by: string | null
          bank_details: Json | null
          bill_id: string | null
          created_at: string | null
          id: string
          patient_id: string
          processed_at: string | null
          processed_by: string | null
          refund_amount: number
          refund_mode: string | null
          refund_reason: string
          rejection_reason: string | null
          requested_by: string
          status: string | null
          transaction_reference: string | null
          updated_at: string | null
        }
        Insert: {
          advance_id?: string | null
          approved_at?: string | null
          approved_by?: string | null
          bank_details?: Json | null
          bill_id?: string | null
          created_at?: string | null
          id?: string
          patient_id: string
          processed_at?: string | null
          processed_by?: string | null
          refund_amount: number
          refund_mode?: string | null
          refund_reason: string
          rejection_reason?: string | null
          requested_by: string
          status?: string | null
          transaction_reference?: string | null
          updated_at?: string | null
        }
        Update: {
          advance_id?: string | null
          approved_at?: string | null
          approved_by?: string | null
          bank_details?: Json | null
          bill_id?: string | null
          created_at?: string | null
          id?: string
          patient_id?: string
          processed_at?: string | null
          processed_by?: string | null
          refund_amount?: number
          refund_mode?: string | null
          refund_reason?: string
          rejection_reason?: string | null
          requested_by?: string
          status?: string | null
          transaction_reference?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hms_refund_requests_advance_id_fkey"
            columns: ["advance_id"]
            isOneToOne: false
            referencedRelation: "hms_patient_advances"
            referencedColumns: ["id"]
          },
        ]
      }
      hms_security_config: {
        Row: {
          auto_logout_enabled: boolean | null
          auto_logout_minutes: number | null
          clinic_id: string | null
          created_at: string | null
          force_logout_on_ip_change: boolean | null
          id: string
          ip_whitelist_bypass_roles: string[] | null
          ip_whitelist_enabled: boolean | null
          lockout_duration_minutes: number | null
          max_concurrent_sessions: number | null
          max_login_attempts: number | null
          max_unmask_per_day: number | null
          owner_id: string
          password_expiry_days: number | null
          password_min_length: number | null
          password_require_special: boolean | null
          phone_masking_enabled: boolean | null
          phone_visible_roles: string[] | null
          two_factor_required: boolean | null
          two_factor_roles: string[] | null
          unmask_alert_threshold: number | null
          unmask_requires_reason: boolean | null
          updated_at: string | null
          whitelisted_ips: string[] | null
        }
        Insert: {
          auto_logout_enabled?: boolean | null
          auto_logout_minutes?: number | null
          clinic_id?: string | null
          created_at?: string | null
          force_logout_on_ip_change?: boolean | null
          id?: string
          ip_whitelist_bypass_roles?: string[] | null
          ip_whitelist_enabled?: boolean | null
          lockout_duration_minutes?: number | null
          max_concurrent_sessions?: number | null
          max_login_attempts?: number | null
          max_unmask_per_day?: number | null
          owner_id: string
          password_expiry_days?: number | null
          password_min_length?: number | null
          password_require_special?: boolean | null
          phone_masking_enabled?: boolean | null
          phone_visible_roles?: string[] | null
          two_factor_required?: boolean | null
          two_factor_roles?: string[] | null
          unmask_alert_threshold?: number | null
          unmask_requires_reason?: boolean | null
          updated_at?: string | null
          whitelisted_ips?: string[] | null
        }
        Update: {
          auto_logout_enabled?: boolean | null
          auto_logout_minutes?: number | null
          clinic_id?: string | null
          created_at?: string | null
          force_logout_on_ip_change?: boolean | null
          id?: string
          ip_whitelist_bypass_roles?: string[] | null
          ip_whitelist_enabled?: boolean | null
          lockout_duration_minutes?: number | null
          max_concurrent_sessions?: number | null
          max_login_attempts?: number | null
          max_unmask_per_day?: number | null
          owner_id?: string
          password_expiry_days?: number | null
          password_min_length?: number | null
          password_require_special?: boolean | null
          phone_masking_enabled?: boolean | null
          phone_visible_roles?: string[] | null
          two_factor_required?: boolean | null
          two_factor_roles?: string[] | null
          unmask_alert_threshold?: number | null
          unmask_requires_reason?: boolean | null
          updated_at?: string | null
          whitelisted_ips?: string[] | null
        }
        Relationships: []
      }
      hms_shift_closings: {
        Row: {
          actual_cash: number | null
          card_amount: number | null
          card_count: number | null
          cash_amount: number | null
          cash_count: number | null
          cashier_id: string | null
          cashier_name: string
          cheque_amount: number | null
          cheque_count: number | null
          closed_at: string | null
          created_at: string | null
          denomination: Json | null
          difference: number | null
          end_time: string | null
          expected_cash: number | null
          expenses_paid: number | null
          id: string
          location: string | null
          notes: string | null
          online_amount: number | null
          online_count: number | null
          opening_cash: number | null
          refunds: number | null
          shift_date: string
          shift_name: string
          start_time: string
          status: string
          total_collection: number | null
          updated_at: string | null
          upi_amount: number | null
          upi_count: number | null
          verified_by: string | null
        }
        Insert: {
          actual_cash?: number | null
          card_amount?: number | null
          card_count?: number | null
          cash_amount?: number | null
          cash_count?: number | null
          cashier_id?: string | null
          cashier_name: string
          cheque_amount?: number | null
          cheque_count?: number | null
          closed_at?: string | null
          created_at?: string | null
          denomination?: Json | null
          difference?: number | null
          end_time?: string | null
          expected_cash?: number | null
          expenses_paid?: number | null
          id?: string
          location?: string | null
          notes?: string | null
          online_amount?: number | null
          online_count?: number | null
          opening_cash?: number | null
          refunds?: number | null
          shift_date?: string
          shift_name: string
          start_time: string
          status?: string
          total_collection?: number | null
          updated_at?: string | null
          upi_amount?: number | null
          upi_count?: number | null
          verified_by?: string | null
        }
        Update: {
          actual_cash?: number | null
          card_amount?: number | null
          card_count?: number | null
          cash_amount?: number | null
          cash_count?: number | null
          cashier_id?: string | null
          cashier_name?: string
          cheque_amount?: number | null
          cheque_count?: number | null
          closed_at?: string | null
          created_at?: string | null
          denomination?: Json | null
          difference?: number | null
          end_time?: string | null
          expected_cash?: number | null
          expenses_paid?: number | null
          id?: string
          location?: string | null
          notes?: string | null
          online_amount?: number | null
          online_count?: number | null
          opening_cash?: number | null
          refunds?: number | null
          shift_date?: string
          shift_name?: string
          start_time?: string
          status?: string
          total_collection?: number | null
          updated_at?: string | null
          upi_amount?: number | null
          upi_count?: number | null
          verified_by?: string | null
        }
        Relationships: []
      }
      hms_shift_roster: {
        Row: {
          created_at: string | null
          department: string
          fri: string | null
          id: string
          location: string | null
          mon: string | null
          role: string
          sat: string | null
          staff_id: string | null
          staff_name: string
          sun: string | null
          thu: string | null
          tue: string | null
          updated_at: string | null
          wed: string | null
          week_start: string
        }
        Insert: {
          created_at?: string | null
          department: string
          fri?: string | null
          id?: string
          location?: string | null
          mon?: string | null
          role: string
          sat?: string | null
          staff_id?: string | null
          staff_name: string
          sun?: string | null
          thu?: string | null
          tue?: string | null
          updated_at?: string | null
          wed?: string | null
          week_start: string
        }
        Update: {
          created_at?: string | null
          department?: string
          fri?: string | null
          id?: string
          location?: string | null
          mon?: string | null
          role?: string
          sat?: string | null
          staff_id?: string | null
          staff_name?: string
          sun?: string | null
          thu?: string | null
          tue?: string | null
          updated_at?: string | null
          wed?: string | null
          week_start?: string
        }
        Relationships: []
      }
      hms_staff: {
        Row: {
          aadhaar_masked: string | null
          address: string | null
          address_line1: string | null
          address_line2: string | null
          bank_account_no: string | null
          bank_ifsc: string | null
          bank_name: string | null
          basic_salary: number | null
          blood_group: string | null
          branch: string | null
          branch_id: string | null
          city: string | null
          confirmation_date: string | null
          created_at: string | null
          date_of_birth: string | null
          department: string
          department_id: string | null
          designation: string | null
          designation_id: string | null
          email: string | null
          emergency_contact: string | null
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          emergency_contact_relation: string | null
          emergency_phone: string | null
          employee_code: string | null
          employee_id: string | null
          employee_status: string | null
          employment_type: string | null
          first_name: string | null
          gender: string | null
          hra: number | null
          id: string
          is_active: boolean | null
          join_date: string | null
          joining_date: string | null
          last_name: string | null
          last_working_date: string | null
          location: string | null
          marital_status: string | null
          name: string
          notice_period_days: number | null
          organisation_id: string | null
          other_allowances: number | null
          pan: string | null
          phone: string | null
          photo_url: string | null
          pincode: string | null
          probation_end_date: string | null
          productivity_score: number | null
          relieving_date: string | null
          reporting_manager_id: string | null
          resignation_date: string | null
          role: string
          salary: number | null
          shift_id: string | null
          state: string | null
          status: string | null
          today_attendance: string | null
          updated_at: string | null
          user_id: string | null
          weekly_off: string | null
        }
        Insert: {
          aadhaar_masked?: string | null
          address?: string | null
          address_line1?: string | null
          address_line2?: string | null
          bank_account_no?: string | null
          bank_ifsc?: string | null
          bank_name?: string | null
          basic_salary?: number | null
          blood_group?: string | null
          branch?: string | null
          branch_id?: string | null
          city?: string | null
          confirmation_date?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          department?: string
          department_id?: string | null
          designation?: string | null
          designation_id?: string | null
          email?: string | null
          emergency_contact?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          emergency_contact_relation?: string | null
          emergency_phone?: string | null
          employee_code?: string | null
          employee_id?: string | null
          employee_status?: string | null
          employment_type?: string | null
          first_name?: string | null
          gender?: string | null
          hra?: number | null
          id?: string
          is_active?: boolean | null
          join_date?: string | null
          joining_date?: string | null
          last_name?: string | null
          last_working_date?: string | null
          location?: string | null
          marital_status?: string | null
          name: string
          notice_period_days?: number | null
          organisation_id?: string | null
          other_allowances?: number | null
          pan?: string | null
          phone?: string | null
          photo_url?: string | null
          pincode?: string | null
          probation_end_date?: string | null
          productivity_score?: number | null
          relieving_date?: string | null
          reporting_manager_id?: string | null
          resignation_date?: string | null
          role: string
          salary?: number | null
          shift_id?: string | null
          state?: string | null
          status?: string | null
          today_attendance?: string | null
          updated_at?: string | null
          user_id?: string | null
          weekly_off?: string | null
        }
        Update: {
          aadhaar_masked?: string | null
          address?: string | null
          address_line1?: string | null
          address_line2?: string | null
          bank_account_no?: string | null
          bank_ifsc?: string | null
          bank_name?: string | null
          basic_salary?: number | null
          blood_group?: string | null
          branch?: string | null
          branch_id?: string | null
          city?: string | null
          confirmation_date?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          department?: string
          department_id?: string | null
          designation?: string | null
          designation_id?: string | null
          email?: string | null
          emergency_contact?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          emergency_contact_relation?: string | null
          emergency_phone?: string | null
          employee_code?: string | null
          employee_id?: string | null
          employee_status?: string | null
          employment_type?: string | null
          first_name?: string | null
          gender?: string | null
          hra?: number | null
          id?: string
          is_active?: boolean | null
          join_date?: string | null
          joining_date?: string | null
          last_name?: string | null
          last_working_date?: string | null
          location?: string | null
          marital_status?: string | null
          name?: string
          notice_period_days?: number | null
          organisation_id?: string | null
          other_allowances?: number | null
          pan?: string | null
          phone?: string | null
          photo_url?: string | null
          pincode?: string | null
          probation_end_date?: string | null
          productivity_score?: number | null
          relieving_date?: string | null
          reporting_manager_id?: string | null
          resignation_date?: string | null
          role?: string
          salary?: number | null
          shift_id?: string | null
          state?: string | null
          status?: string | null
          today_attendance?: string | null
          updated_at?: string | null
          user_id?: string | null
          weekly_off?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hms_staff_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "hms_branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hms_staff_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "hrms_v_branch_workforce"
            referencedColumns: ["branch_id"]
          },
          {
            foreignKeyName: "hms_staff_designation_id_fkey"
            columns: ["designation_id"]
            isOneToOne: false
            referencedRelation: "hrms_designations"
            referencedColumns: ["id"]
          },
        ]
      }
      hms_stock_products: {
        Row: {
          branch: string | null
          category: string | null
          created_at: string | null
          current_stock: number | null
          generic_name: string | null
          gst_pct: number | null
          hsn_code: string | null
          id: string
          is_active: boolean | null
          manufacturer: string | null
          max_qty: number | null
          min_qty: number | null
          mrp: number | null
          product_code: string | null
          product_name: string
          purchase_rate: number | null
          rack_location: string | null
          reorder_level: number | null
          sale_rate: number | null
          storage_condition: string | null
          sub_category: string | null
          unit: string | null
          updated_at: string | null
        }
        Insert: {
          branch?: string | null
          category?: string | null
          created_at?: string | null
          current_stock?: number | null
          generic_name?: string | null
          gst_pct?: number | null
          hsn_code?: string | null
          id?: string
          is_active?: boolean | null
          manufacturer?: string | null
          max_qty?: number | null
          min_qty?: number | null
          mrp?: number | null
          product_code?: string | null
          product_name: string
          purchase_rate?: number | null
          rack_location?: string | null
          reorder_level?: number | null
          sale_rate?: number | null
          storage_condition?: string | null
          sub_category?: string | null
          unit?: string | null
          updated_at?: string | null
        }
        Update: {
          branch?: string | null
          category?: string | null
          created_at?: string | null
          current_stock?: number | null
          generic_name?: string | null
          gst_pct?: number | null
          hsn_code?: string | null
          id?: string
          is_active?: boolean | null
          manufacturer?: string | null
          max_qty?: number | null
          min_qty?: number | null
          mrp?: number | null
          product_code?: string | null
          product_name?: string
          purchase_rate?: number | null
          rack_location?: string | null
          reorder_level?: number | null
          sale_rate?: number | null
          storage_condition?: string | null
          sub_category?: string | null
          unit?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      hms_student_progress: {
        Row: {
          badges: Json | null
          current_streak: number | null
          id: string
          last_quiz_date: string | null
          level: number | null
          longest_streak: number | null
          subject_scores: Json | null
          total_coins: number | null
          total_correct: number | null
          total_quizzes_taken: number | null
          updated_at: string | null
          user_id: string
          xp: number | null
        }
        Insert: {
          badges?: Json | null
          current_streak?: number | null
          id?: string
          last_quiz_date?: string | null
          level?: number | null
          longest_streak?: number | null
          subject_scores?: Json | null
          total_coins?: number | null
          total_correct?: number | null
          total_quizzes_taken?: number | null
          updated_at?: string | null
          user_id: string
          xp?: number | null
        }
        Update: {
          badges?: Json | null
          current_streak?: number | null
          id?: string
          last_quiz_date?: string | null
          level?: number | null
          longest_streak?: number | null
          subject_scores?: Json | null
          total_coins?: number | null
          total_correct?: number | null
          total_quizzes_taken?: number | null
          updated_at?: string | null
          user_id?: string
          xp?: number | null
        }
        Relationships: []
      }
      hms_teleconsult_sessions: {
        Row: {
          actual_duration_min: number | null
          actual_end: string | null
          actual_start: string | null
          appointment_id: string | null
          branch: string | null
          completed_at: string | null
          consult_type: string | null
          created_at: string | null
          doctor_joined_at: string | null
          doctor_name: string
          duration: string | null
          id: string
          location: string | null
          notes: string | null
          patient_feedback: string | null
          patient_joined_at: string | null
          patient_name: string
          patient_rating: number | null
          payment_status: string | null
          phone: string | null
          prescription: string | null
          prescription_id: string | null
          recording_url: string | null
          room_id: string | null
          room_url: string | null
          scheduled_at: string
          started_at: string | null
          status: string | null
          updated_at: string | null
          visit_id: string | null
        }
        Insert: {
          actual_duration_min?: number | null
          actual_end?: string | null
          actual_start?: string | null
          appointment_id?: string | null
          branch?: string | null
          completed_at?: string | null
          consult_type?: string | null
          created_at?: string | null
          doctor_joined_at?: string | null
          doctor_name: string
          duration?: string | null
          id?: string
          location?: string | null
          notes?: string | null
          patient_feedback?: string | null
          patient_joined_at?: string | null
          patient_name: string
          patient_rating?: number | null
          payment_status?: string | null
          phone?: string | null
          prescription?: string | null
          prescription_id?: string | null
          recording_url?: string | null
          room_id?: string | null
          room_url?: string | null
          scheduled_at: string
          started_at?: string | null
          status?: string | null
          updated_at?: string | null
          visit_id?: string | null
        }
        Update: {
          actual_duration_min?: number | null
          actual_end?: string | null
          actual_start?: string | null
          appointment_id?: string | null
          branch?: string | null
          completed_at?: string | null
          consult_type?: string | null
          created_at?: string | null
          doctor_joined_at?: string | null
          doctor_name?: string
          duration?: string | null
          id?: string
          location?: string | null
          notes?: string | null
          patient_feedback?: string | null
          patient_joined_at?: string | null
          patient_name?: string
          patient_rating?: number | null
          payment_status?: string | null
          phone?: string | null
          prescription?: string | null
          prescription_id?: string | null
          recording_url?: string | null
          room_id?: string | null
          room_url?: string | null
          scheduled_at?: string
          started_at?: string | null
          status?: string | null
          updated_at?: string | null
          visit_id?: string | null
        }
        Relationships: []
      }
      hms_treatment_estimates: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          auto_approval_threshold: number | null
          auto_approved: boolean | null
          clinic_id: string | null
          converted_to_bill_id: string | null
          created_at: string | null
          created_by: string
          department: string | null
          estimate_number: string | null
          expires_at: string | null
          id: string
          line_items: Json
          patient_id: string | null
          patient_name: string
          patient_notes: string | null
          patient_response: string | null
          patient_response_at: string | null
          rejection_reason: string | null
          sent_to_patient_at: string | null
          sent_via: string | null
          status: string | null
          total_amount: number
          treatment_description: string
          updated_at: string | null
          validity_days: number | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          auto_approval_threshold?: number | null
          auto_approved?: boolean | null
          clinic_id?: string | null
          converted_to_bill_id?: string | null
          created_at?: string | null
          created_by: string
          department?: string | null
          estimate_number?: string | null
          expires_at?: string | null
          id?: string
          line_items?: Json
          patient_id?: string | null
          patient_name: string
          patient_notes?: string | null
          patient_response?: string | null
          patient_response_at?: string | null
          rejection_reason?: string | null
          sent_to_patient_at?: string | null
          sent_via?: string | null
          status?: string | null
          total_amount: number
          treatment_description: string
          updated_at?: string | null
          validity_days?: number | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          auto_approval_threshold?: number | null
          auto_approved?: boolean | null
          clinic_id?: string | null
          converted_to_bill_id?: string | null
          created_at?: string | null
          created_by?: string
          department?: string | null
          estimate_number?: string | null
          expires_at?: string | null
          id?: string
          line_items?: Json
          patient_id?: string | null
          patient_name?: string
          patient_notes?: string | null
          patient_response?: string | null
          patient_response_at?: string | null
          rejection_reason?: string | null
          sent_to_patient_at?: string | null
          sent_via?: string | null
          status?: string | null
          total_amount?: number
          treatment_description?: string
          updated_at?: string | null
          validity_days?: number | null
        }
        Relationships: []
      }
      hms_triage_records: {
        Row: {
          appointment_id: string | null
          blood_pressure_diastolic: number | null
          blood_pressure_systolic: number | null
          blood_sugar_fasting: number | null
          blood_sugar_pp: number | null
          blood_sugar_random: number | null
          bmi: number | null
          captured_at: string | null
          captured_by: string
          chief_complaint: string | null
          complaint_duration: string | null
          created_at: string | null
          current_medications: string[] | null
          height: number | null
          id: string
          jihva_observation: string | null
          known_allergies: string[] | null
          medical_history: string[] | null
          nadi_pareeksha: string | null
          notes: string | null
          opd_queue_id: string | null
          pain_scale: number | null
          patient_id: string
          prakriti_type: string | null
          pulse_rate: number | null
          respiratory_rate: number | null
          spo2: number | null
          status: string | null
          temperature: number | null
          temperature_unit: string | null
          token_number: number | null
          triage_priority: string | null
          updated_at: string | null
          weight: number | null
        }
        Insert: {
          appointment_id?: string | null
          blood_pressure_diastolic?: number | null
          blood_pressure_systolic?: number | null
          blood_sugar_fasting?: number | null
          blood_sugar_pp?: number | null
          blood_sugar_random?: number | null
          bmi?: number | null
          captured_at?: string | null
          captured_by: string
          chief_complaint?: string | null
          complaint_duration?: string | null
          created_at?: string | null
          current_medications?: string[] | null
          height?: number | null
          id?: string
          jihva_observation?: string | null
          known_allergies?: string[] | null
          medical_history?: string[] | null
          nadi_pareeksha?: string | null
          notes?: string | null
          opd_queue_id?: string | null
          pain_scale?: number | null
          patient_id: string
          prakriti_type?: string | null
          pulse_rate?: number | null
          respiratory_rate?: number | null
          spo2?: number | null
          status?: string | null
          temperature?: number | null
          temperature_unit?: string | null
          token_number?: number | null
          triage_priority?: string | null
          updated_at?: string | null
          weight?: number | null
        }
        Update: {
          appointment_id?: string | null
          blood_pressure_diastolic?: number | null
          blood_pressure_systolic?: number | null
          blood_sugar_fasting?: number | null
          blood_sugar_pp?: number | null
          blood_sugar_random?: number | null
          bmi?: number | null
          captured_at?: string | null
          captured_by?: string
          chief_complaint?: string | null
          complaint_duration?: string | null
          created_at?: string | null
          current_medications?: string[] | null
          height?: number | null
          id?: string
          jihva_observation?: string | null
          known_allergies?: string[] | null
          medical_history?: string[] | null
          nadi_pareeksha?: string | null
          notes?: string | null
          opd_queue_id?: string | null
          pain_scale?: number | null
          patient_id?: string
          prakriti_type?: string | null
          pulse_rate?: number | null
          respiratory_rate?: number | null
          spo2?: number | null
          status?: string | null
          temperature?: number | null
          temperature_unit?: string | null
          token_number?: number | null
          triage_priority?: string | null
          updated_at?: string | null
          weight?: number | null
        }
        Relationships: []
      }
      hms_triage_templates: {
        Row: {
          created_at: string | null
          created_by: string | null
          default_questions: Json | null
          department: string | null
          id: string
          is_active: boolean | null
          name: string
          specialty: string | null
          vital_fields_required: string[] | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          default_questions?: Json | null
          department?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          specialty?: string | null
          vital_fields_required?: string[] | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          default_questions?: Json | null
          department?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          specialty?: string | null
          vital_fields_required?: string[] | null
        }
        Relationships: []
      }
      hms_ward_consumption_log: {
        Row: {
          bill_amount: number | null
          billed_to_patient: boolean | null
          consumed_by: string | null
          consumption_type: string | null
          created_at: string | null
          id: string
          ip_admission_id: string | null
          notes: string | null
          panchakarma_session_id: string | null
          patient_id: string | null
          quantity_consumed: number
          ward_stock_item_id: string
          ward_store_id: string
        }
        Insert: {
          bill_amount?: number | null
          billed_to_patient?: boolean | null
          consumed_by?: string | null
          consumption_type?: string | null
          created_at?: string | null
          id?: string
          ip_admission_id?: string | null
          notes?: string | null
          panchakarma_session_id?: string | null
          patient_id?: string | null
          quantity_consumed: number
          ward_stock_item_id: string
          ward_store_id: string
        }
        Update: {
          bill_amount?: number | null
          billed_to_patient?: boolean | null
          consumed_by?: string | null
          consumption_type?: string | null
          created_at?: string | null
          id?: string
          ip_admission_id?: string | null
          notes?: string | null
          panchakarma_session_id?: string | null
          patient_id?: string | null
          quantity_consumed?: number
          ward_stock_item_id?: string
          ward_store_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "hms_ward_consumption_log_ward_stock_item_id_fkey"
            columns: ["ward_stock_item_id"]
            isOneToOne: false
            referencedRelation: "hms_ward_stock_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hms_ward_consumption_log_ward_store_id_fkey"
            columns: ["ward_store_id"]
            isOneToOne: false
            referencedRelation: "hms_ward_stores"
            referencedColumns: ["id"]
          },
        ]
      }
      hms_ward_stock_items: {
        Row: {
          batch_number: string | null
          cost_per_unit: number | null
          created_at: string | null
          expiry_date: string | null
          id: string
          is_critical: boolean | null
          last_consumed_at: string | null
          last_restocked_at: string | null
          max_stock_level: number | null
          min_stock_level: number | null
          product_category: string | null
          product_id: string | null
          product_name: string
          quantity_available: number | null
          quantity_unit: string | null
          updated_at: string | null
          ward_store_id: string
        }
        Insert: {
          batch_number?: string | null
          cost_per_unit?: number | null
          created_at?: string | null
          expiry_date?: string | null
          id?: string
          is_critical?: boolean | null
          last_consumed_at?: string | null
          last_restocked_at?: string | null
          max_stock_level?: number | null
          min_stock_level?: number | null
          product_category?: string | null
          product_id?: string | null
          product_name: string
          quantity_available?: number | null
          quantity_unit?: string | null
          updated_at?: string | null
          ward_store_id: string
        }
        Update: {
          batch_number?: string | null
          cost_per_unit?: number | null
          created_at?: string | null
          expiry_date?: string | null
          id?: string
          is_critical?: boolean | null
          last_consumed_at?: string | null
          last_restocked_at?: string | null
          max_stock_level?: number | null
          min_stock_level?: number | null
          product_category?: string | null
          product_id?: string | null
          product_name?: string
          quantity_available?: number | null
          quantity_unit?: string | null
          updated_at?: string | null
          ward_store_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "hms_ward_stock_items_ward_store_id_fkey"
            columns: ["ward_store_id"]
            isOneToOne: false
            referencedRelation: "hms_ward_stores"
            referencedColumns: ["id"]
          },
        ]
      }
      hms_ward_stock_transfers: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          batch_number: string | null
          created_at: string | null
          from_store_id: string
          id: string
          product_id: string | null
          product_name: string
          quantity: number
          received_at: string | null
          received_by: string | null
          requested_at: string | null
          requested_by: string
          status: string | null
          to_store_id: string
          transfer_reason: string | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          batch_number?: string | null
          created_at?: string | null
          from_store_id: string
          id?: string
          product_id?: string | null
          product_name: string
          quantity: number
          received_at?: string | null
          received_by?: string | null
          requested_at?: string | null
          requested_by: string
          status?: string | null
          to_store_id: string
          transfer_reason?: string | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          batch_number?: string | null
          created_at?: string | null
          from_store_id?: string
          id?: string
          product_id?: string | null
          product_name?: string
          quantity?: number
          received_at?: string | null
          received_by?: string | null
          requested_at?: string | null
          requested_by?: string
          status?: string | null
          to_store_id?: string
          transfer_reason?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hms_ward_stock_transfers_from_store_id_fkey"
            columns: ["from_store_id"]
            isOneToOne: false
            referencedRelation: "hms_ward_stores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hms_ward_stock_transfers_to_store_id_fkey"
            columns: ["to_store_id"]
            isOneToOne: false
            referencedRelation: "hms_ward_stores"
            referencedColumns: ["id"]
          },
        ]
      }
      hms_ward_stores: {
        Row: {
          auto_reorder: boolean | null
          created_at: string | null
          department: string | null
          id: string
          in_charge_id: string | null
          is_active: boolean | null
          location: string | null
          parent_store_id: string | null
          reorder_threshold_percent: number | null
          store_code: string | null
          store_type: string | null
          updated_at: string | null
          ward_id: string | null
          ward_name: string
        }
        Insert: {
          auto_reorder?: boolean | null
          created_at?: string | null
          department?: string | null
          id?: string
          in_charge_id?: string | null
          is_active?: boolean | null
          location?: string | null
          parent_store_id?: string | null
          reorder_threshold_percent?: number | null
          store_code?: string | null
          store_type?: string | null
          updated_at?: string | null
          ward_id?: string | null
          ward_name: string
        }
        Update: {
          auto_reorder?: boolean | null
          created_at?: string | null
          department?: string | null
          id?: string
          in_charge_id?: string | null
          is_active?: boolean | null
          location?: string | null
          parent_store_id?: string | null
          reorder_threshold_percent?: number | null
          store_code?: string | null
          store_type?: string | null
          updated_at?: string | null
          ward_id?: string | null
          ward_name?: string
        }
        Relationships: []
      }
      hms_wards: {
        Row: {
          charge_per_day: number | null
          created_at: string | null
          floor: string | null
          id: string
          is_active: boolean | null
          location: string | null
          name: string
          occupied_beds: number | null
          total_beds: number
          updated_at: string | null
          ward_code: string | null
          ward_type: string | null
        }
        Insert: {
          charge_per_day?: number | null
          created_at?: string | null
          floor?: string | null
          id?: string
          is_active?: boolean | null
          location?: string | null
          name: string
          occupied_beds?: number | null
          total_beds?: number
          updated_at?: string | null
          ward_code?: string | null
          ward_type?: string | null
        }
        Update: {
          charge_per_day?: number | null
          created_at?: string | null
          floor?: string | null
          id?: string
          is_active?: boolean | null
          location?: string | null
          name?: string
          occupied_beds?: number | null
          total_beds?: number
          updated_at?: string | null
          ward_code?: string | null
          ward_type?: string | null
        }
        Relationships: []
      }
      hrms_announcements: {
        Row: {
          branch_id: string | null
          category: string | null
          content: string
          created_at: string | null
          expiry_date: string | null
          id: string
          is_pinned: boolean | null
          is_published: boolean | null
          organisation_id: string | null
          priority: string | null
          publish_date: string | null
          published_by: string | null
          target_departments: string[] | null
          target_roles: string[] | null
          title: string
          updated_at: string | null
        }
        Insert: {
          branch_id?: string | null
          category?: string | null
          content: string
          created_at?: string | null
          expiry_date?: string | null
          id?: string
          is_pinned?: boolean | null
          is_published?: boolean | null
          organisation_id?: string | null
          priority?: string | null
          publish_date?: string | null
          published_by?: string | null
          target_departments?: string[] | null
          target_roles?: string[] | null
          title: string
          updated_at?: string | null
        }
        Update: {
          branch_id?: string | null
          category?: string | null
          content?: string
          created_at?: string | null
          expiry_date?: string | null
          id?: string
          is_pinned?: boolean | null
          is_published?: boolean | null
          organisation_id?: string | null
          priority?: string | null
          publish_date?: string | null
          published_by?: string | null
          target_departments?: string[] | null
          target_roles?: string[] | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hrms_announcements_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "hms_branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hrms_announcements_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "hrms_v_branch_workforce"
            referencedColumns: ["branch_id"]
          },
          {
            foreignKeyName: "hrms_announcements_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "hrms_organisations"
            referencedColumns: ["id"]
          },
        ]
      }
      hrms_attendance: {
        Row: {
          attendance_date: string
          branch_id: string | null
          check_in: string | null
          check_in_location: string | null
          check_in_method: string | null
          check_out: string | null
          check_out_location: string | null
          check_out_method: string | null
          created_at: string | null
          early_departure_minutes: number | null
          employee_id: string
          id: string
          is_regularised: boolean | null
          late_minutes: number | null
          marked_by: string | null
          organisation_id: string | null
          overtime_hours: number | null
          remarks: string | null
          shift_id: string | null
          status: string
          updated_at: string | null
          worked_hours: number | null
        }
        Insert: {
          attendance_date: string
          branch_id?: string | null
          check_in?: string | null
          check_in_location?: string | null
          check_in_method?: string | null
          check_out?: string | null
          check_out_location?: string | null
          check_out_method?: string | null
          created_at?: string | null
          early_departure_minutes?: number | null
          employee_id: string
          id?: string
          is_regularised?: boolean | null
          late_minutes?: number | null
          marked_by?: string | null
          organisation_id?: string | null
          overtime_hours?: number | null
          remarks?: string | null
          shift_id?: string | null
          status?: string
          updated_at?: string | null
          worked_hours?: number | null
        }
        Update: {
          attendance_date?: string
          branch_id?: string | null
          check_in?: string | null
          check_in_location?: string | null
          check_in_method?: string | null
          check_out?: string | null
          check_out_location?: string | null
          check_out_method?: string | null
          created_at?: string | null
          early_departure_minutes?: number | null
          employee_id?: string
          id?: string
          is_regularised?: boolean | null
          late_minutes?: number | null
          marked_by?: string | null
          organisation_id?: string | null
          overtime_hours?: number | null
          remarks?: string | null
          shift_id?: string | null
          status?: string
          updated_at?: string | null
          worked_hours?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "hrms_attendance_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "hms_branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hrms_attendance_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "hrms_v_branch_workforce"
            referencedColumns: ["branch_id"]
          },
          {
            foreignKeyName: "hrms_attendance_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "hms_staff"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hrms_attendance_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "hrms_v_doctor_activity"
            referencedColumns: ["employee_id"]
          },
          {
            foreignKeyName: "hrms_attendance_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "hrms_v_probation_ending"
            referencedColumns: ["employee_id"]
          },
          {
            foreignKeyName: "hrms_attendance_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "hrms_v_therapist_activity"
            referencedColumns: ["employee_id"]
          },
          {
            foreignKeyName: "hrms_attendance_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "hrms_organisations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hrms_attendance_shift_id_fkey"
            columns: ["shift_id"]
            isOneToOne: false
            referencedRelation: "hrms_shifts"
            referencedColumns: ["id"]
          },
        ]
      }
      hrms_attendance_corrections: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          attendance_id: string | null
          correction_date: string
          correction_type: string
          created_at: string | null
          employee_id: string
          id: string
          organisation_id: string | null
          reason: string
          rejection_reason: string | null
          requested_by: string
          requested_check_in: string | null
          requested_check_out: string | null
          requested_status: string | null
          status: string
          updated_at: string | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          attendance_id?: string | null
          correction_date: string
          correction_type: string
          created_at?: string | null
          employee_id: string
          id?: string
          organisation_id?: string | null
          reason: string
          rejection_reason?: string | null
          requested_by: string
          requested_check_in?: string | null
          requested_check_out?: string | null
          requested_status?: string | null
          status?: string
          updated_at?: string | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          attendance_id?: string | null
          correction_date?: string
          correction_type?: string
          created_at?: string | null
          employee_id?: string
          id?: string
          organisation_id?: string | null
          reason?: string
          rejection_reason?: string | null
          requested_by?: string
          requested_check_in?: string | null
          requested_check_out?: string | null
          requested_status?: string | null
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hrms_attendance_corrections_attendance_id_fkey"
            columns: ["attendance_id"]
            isOneToOne: false
            referencedRelation: "hrms_attendance"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hrms_attendance_corrections_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "hms_staff"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hrms_attendance_corrections_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "hrms_v_doctor_activity"
            referencedColumns: ["employee_id"]
          },
          {
            foreignKeyName: "hrms_attendance_corrections_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "hrms_v_probation_ending"
            referencedColumns: ["employee_id"]
          },
          {
            foreignKeyName: "hrms_attendance_corrections_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "hrms_v_therapist_activity"
            referencedColumns: ["employee_id"]
          },
          {
            foreignKeyName: "hrms_attendance_corrections_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "hrms_organisations"
            referencedColumns: ["id"]
          },
        ]
      }
      hrms_audit_log: {
        Row: {
          action: string
          branch_id: string | null
          created_at: string | null
          employee_id: string | null
          entity_id: string | null
          entity_type: string
          id: string
          ip_address: string | null
          new_value: Json | null
          old_value: Json | null
          organisation_id: string | null
          performed_by: string
          reason: string | null
        }
        Insert: {
          action: string
          branch_id?: string | null
          created_at?: string | null
          employee_id?: string | null
          entity_id?: string | null
          entity_type: string
          id?: string
          ip_address?: string | null
          new_value?: Json | null
          old_value?: Json | null
          organisation_id?: string | null
          performed_by: string
          reason?: string | null
        }
        Update: {
          action?: string
          branch_id?: string | null
          created_at?: string | null
          employee_id?: string | null
          entity_id?: string | null
          entity_type?: string
          id?: string
          ip_address?: string | null
          new_value?: Json | null
          old_value?: Json | null
          organisation_id?: string | null
          performed_by?: string
          reason?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hrms_audit_log_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "hms_branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hrms_audit_log_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "hrms_v_branch_workforce"
            referencedColumns: ["branch_id"]
          },
          {
            foreignKeyName: "hrms_audit_log_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "hms_staff"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hrms_audit_log_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "hrms_v_doctor_activity"
            referencedColumns: ["employee_id"]
          },
          {
            foreignKeyName: "hrms_audit_log_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "hrms_v_probation_ending"
            referencedColumns: ["employee_id"]
          },
          {
            foreignKeyName: "hrms_audit_log_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "hrms_v_therapist_activity"
            referencedColumns: ["employee_id"]
          },
          {
            foreignKeyName: "hrms_audit_log_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "hrms_organisations"
            referencedColumns: ["id"]
          },
        ]
      }
      hrms_candidates: {
        Row: {
          converted_employee_id: string | null
          cover_letter: string | null
          created_at: string | null
          current_designation: string | null
          current_employer: string | null
          current_salary: number | null
          date_of_birth: string | null
          email: string | null
          expected_salary: number | null
          experience_years: number | null
          gender: string | null
          id: string
          joining_date: string | null
          name: string
          notes: string | null
          offer_date: string | null
          offer_salary: number | null
          organisation_id: string | null
          phone: string | null
          qualification: string | null
          referred_by: string | null
          rejection_reason: string | null
          resume_url: string | null
          source: string | null
          status: string
          updated_at: string | null
          vacancy_id: string | null
        }
        Insert: {
          converted_employee_id?: string | null
          cover_letter?: string | null
          created_at?: string | null
          current_designation?: string | null
          current_employer?: string | null
          current_salary?: number | null
          date_of_birth?: string | null
          email?: string | null
          expected_salary?: number | null
          experience_years?: number | null
          gender?: string | null
          id?: string
          joining_date?: string | null
          name: string
          notes?: string | null
          offer_date?: string | null
          offer_salary?: number | null
          organisation_id?: string | null
          phone?: string | null
          qualification?: string | null
          referred_by?: string | null
          rejection_reason?: string | null
          resume_url?: string | null
          source?: string | null
          status?: string
          updated_at?: string | null
          vacancy_id?: string | null
        }
        Update: {
          converted_employee_id?: string | null
          cover_letter?: string | null
          created_at?: string | null
          current_designation?: string | null
          current_employer?: string | null
          current_salary?: number | null
          date_of_birth?: string | null
          email?: string | null
          expected_salary?: number | null
          experience_years?: number | null
          gender?: string | null
          id?: string
          joining_date?: string | null
          name?: string
          notes?: string | null
          offer_date?: string | null
          offer_salary?: number | null
          organisation_id?: string | null
          phone?: string | null
          qualification?: string | null
          referred_by?: string | null
          rejection_reason?: string | null
          resume_url?: string | null
          source?: string | null
          status?: string
          updated_at?: string | null
          vacancy_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hrms_candidates_converted_employee_id_fkey"
            columns: ["converted_employee_id"]
            isOneToOne: false
            referencedRelation: "hms_staff"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hrms_candidates_converted_employee_id_fkey"
            columns: ["converted_employee_id"]
            isOneToOne: false
            referencedRelation: "hrms_v_doctor_activity"
            referencedColumns: ["employee_id"]
          },
          {
            foreignKeyName: "hrms_candidates_converted_employee_id_fkey"
            columns: ["converted_employee_id"]
            isOneToOne: false
            referencedRelation: "hrms_v_probation_ending"
            referencedColumns: ["employee_id"]
          },
          {
            foreignKeyName: "hrms_candidates_converted_employee_id_fkey"
            columns: ["converted_employee_id"]
            isOneToOne: false
            referencedRelation: "hrms_v_therapist_activity"
            referencedColumns: ["employee_id"]
          },
          {
            foreignKeyName: "hrms_candidates_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "hrms_organisations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hrms_candidates_vacancy_id_fkey"
            columns: ["vacancy_id"]
            isOneToOne: false
            referencedRelation: "hrms_vacancies"
            referencedColumns: ["id"]
          },
        ]
      }
      hrms_departments: {
        Row: {
          branch_id: string | null
          code: string | null
          created_at: string | null
          description: string | null
          head_employee_id: string | null
          id: string
          is_active: boolean | null
          is_clinical: boolean | null
          name: string
          organisation_id: string | null
          parent_department_id: string | null
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          branch_id?: string | null
          code?: string | null
          created_at?: string | null
          description?: string | null
          head_employee_id?: string | null
          id?: string
          is_active?: boolean | null
          is_clinical?: boolean | null
          name: string
          organisation_id?: string | null
          parent_department_id?: string | null
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          branch_id?: string | null
          code?: string | null
          created_at?: string | null
          description?: string | null
          head_employee_id?: string | null
          id?: string
          is_active?: boolean | null
          is_clinical?: boolean | null
          name?: string
          organisation_id?: string | null
          parent_department_id?: string | null
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hrms_departments_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "hms_branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hrms_departments_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "hrms_v_branch_workforce"
            referencedColumns: ["branch_id"]
          },
          {
            foreignKeyName: "hrms_departments_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "hrms_organisations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hrms_departments_parent_department_id_fkey"
            columns: ["parent_department_id"]
            isOneToOne: false
            referencedRelation: "hrms_departments"
            referencedColumns: ["id"]
          },
        ]
      }
      hrms_designations: {
        Row: {
          code: string | null
          created_at: string | null
          department_id: string | null
          description: string | null
          id: string
          is_active: boolean | null
          level: number | null
          max_salary: number | null
          min_salary: number | null
          name: string
          organisation_id: string | null
          updated_at: string | null
        }
        Insert: {
          code?: string | null
          created_at?: string | null
          department_id?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          level?: number | null
          max_salary?: number | null
          min_salary?: number | null
          name: string
          organisation_id?: string | null
          updated_at?: string | null
        }
        Update: {
          code?: string | null
          created_at?: string | null
          department_id?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          level?: number | null
          max_salary?: number | null
          min_salary?: number | null
          name?: string
          organisation_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hrms_designations_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "hrms_departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hrms_designations_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "hrms_organisations"
            referencedColumns: ["id"]
          },
        ]
      }
      hrms_disciplinary_records: {
        Row: {
          action_by: string | null
          action_date: string | null
          action_taken: string | null
          created_at: string | null
          description: string
          employee_id: string
          employee_response: string | null
          id: string
          incident_date: string
          incident_type: string
          is_confidential: boolean | null
          letter_id: string | null
          organisation_id: string | null
          reported_by: string | null
          resolution: string | null
          resolved_at: string | null
          response_date: string | null
          status: string
          updated_at: string | null
        }
        Insert: {
          action_by?: string | null
          action_date?: string | null
          action_taken?: string | null
          created_at?: string | null
          description: string
          employee_id: string
          employee_response?: string | null
          id?: string
          incident_date: string
          incident_type: string
          is_confidential?: boolean | null
          letter_id?: string | null
          organisation_id?: string | null
          reported_by?: string | null
          resolution?: string | null
          resolved_at?: string | null
          response_date?: string | null
          status?: string
          updated_at?: string | null
        }
        Update: {
          action_by?: string | null
          action_date?: string | null
          action_taken?: string | null
          created_at?: string | null
          description?: string
          employee_id?: string
          employee_response?: string | null
          id?: string
          incident_date?: string
          incident_type?: string
          is_confidential?: boolean | null
          letter_id?: string | null
          organisation_id?: string | null
          reported_by?: string | null
          resolution?: string | null
          resolved_at?: string | null
          response_date?: string | null
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hrms_disciplinary_records_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "hms_staff"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hrms_disciplinary_records_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "hrms_v_doctor_activity"
            referencedColumns: ["employee_id"]
          },
          {
            foreignKeyName: "hrms_disciplinary_records_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "hrms_v_probation_ending"
            referencedColumns: ["employee_id"]
          },
          {
            foreignKeyName: "hrms_disciplinary_records_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "hrms_v_therapist_activity"
            referencedColumns: ["employee_id"]
          },
          {
            foreignKeyName: "hrms_disciplinary_records_letter_id_fkey"
            columns: ["letter_id"]
            isOneToOne: false
            referencedRelation: "hrms_hr_letters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hrms_disciplinary_records_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "hrms_organisations"
            referencedColumns: ["id"]
          },
        ]
      }
      hrms_duty_roster: {
        Row: {
          branch_id: string | null
          created_at: string | null
          created_by: string | null
          department: string | null
          employee_id: string
          id: string
          notes: string | null
          organisation_id: string | null
          roster_date: string
          shift_id: string | null
          status: string
          swap_approved_by: string | null
          swap_reason: string | null
          swapped_with_employee_id: string | null
          updated_at: string | null
        }
        Insert: {
          branch_id?: string | null
          created_at?: string | null
          created_by?: string | null
          department?: string | null
          employee_id: string
          id?: string
          notes?: string | null
          organisation_id?: string | null
          roster_date: string
          shift_id?: string | null
          status?: string
          swap_approved_by?: string | null
          swap_reason?: string | null
          swapped_with_employee_id?: string | null
          updated_at?: string | null
        }
        Update: {
          branch_id?: string | null
          created_at?: string | null
          created_by?: string | null
          department?: string | null
          employee_id?: string
          id?: string
          notes?: string | null
          organisation_id?: string | null
          roster_date?: string
          shift_id?: string | null
          status?: string
          swap_approved_by?: string | null
          swap_reason?: string | null
          swapped_with_employee_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hrms_duty_roster_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "hms_branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hrms_duty_roster_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "hrms_v_branch_workforce"
            referencedColumns: ["branch_id"]
          },
          {
            foreignKeyName: "hrms_duty_roster_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "hms_staff"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hrms_duty_roster_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "hrms_v_doctor_activity"
            referencedColumns: ["employee_id"]
          },
          {
            foreignKeyName: "hrms_duty_roster_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "hrms_v_probation_ending"
            referencedColumns: ["employee_id"]
          },
          {
            foreignKeyName: "hrms_duty_roster_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "hrms_v_therapist_activity"
            referencedColumns: ["employee_id"]
          },
          {
            foreignKeyName: "hrms_duty_roster_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "hrms_organisations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hrms_duty_roster_shift_id_fkey"
            columns: ["shift_id"]
            isOneToOne: false
            referencedRelation: "hrms_shifts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hrms_duty_roster_swapped_with_employee_id_fkey"
            columns: ["swapped_with_employee_id"]
            isOneToOne: false
            referencedRelation: "hms_staff"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hrms_duty_roster_swapped_with_employee_id_fkey"
            columns: ["swapped_with_employee_id"]
            isOneToOne: false
            referencedRelation: "hrms_v_doctor_activity"
            referencedColumns: ["employee_id"]
          },
          {
            foreignKeyName: "hrms_duty_roster_swapped_with_employee_id_fkey"
            columns: ["swapped_with_employee_id"]
            isOneToOne: false
            referencedRelation: "hrms_v_probation_ending"
            referencedColumns: ["employee_id"]
          },
          {
            foreignKeyName: "hrms_duty_roster_swapped_with_employee_id_fkey"
            columns: ["swapped_with_employee_id"]
            isOneToOne: false
            referencedRelation: "hrms_v_therapist_activity"
            referencedColumns: ["employee_id"]
          },
        ]
      }
      hrms_employee_assets: {
        Row: {
          asset_code: string | null
          asset_name: string
          asset_type: string
          condition_at_issue: string | null
          condition_at_return: string | null
          created_at: string | null
          damage_notes: string | null
          description: string | null
          employee_id: string
          expected_return_date: string | null
          id: string
          issued_by: string | null
          issued_date: string | null
          organisation_id: string | null
          returned_date: string | null
          returned_to: string | null
          status: string
          updated_at: string | null
        }
        Insert: {
          asset_code?: string | null
          asset_name: string
          asset_type: string
          condition_at_issue?: string | null
          condition_at_return?: string | null
          created_at?: string | null
          damage_notes?: string | null
          description?: string | null
          employee_id: string
          expected_return_date?: string | null
          id?: string
          issued_by?: string | null
          issued_date?: string | null
          organisation_id?: string | null
          returned_date?: string | null
          returned_to?: string | null
          status?: string
          updated_at?: string | null
        }
        Update: {
          asset_code?: string | null
          asset_name?: string
          asset_type?: string
          condition_at_issue?: string | null
          condition_at_return?: string | null
          created_at?: string | null
          damage_notes?: string | null
          description?: string | null
          employee_id?: string
          expected_return_date?: string | null
          id?: string
          issued_by?: string | null
          issued_date?: string | null
          organisation_id?: string | null
          returned_date?: string | null
          returned_to?: string | null
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hrms_employee_assets_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "hms_staff"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hrms_employee_assets_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "hrms_v_doctor_activity"
            referencedColumns: ["employee_id"]
          },
          {
            foreignKeyName: "hrms_employee_assets_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "hrms_v_probation_ending"
            referencedColumns: ["employee_id"]
          },
          {
            foreignKeyName: "hrms_employee_assets_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "hrms_v_therapist_activity"
            referencedColumns: ["employee_id"]
          },
          {
            foreignKeyName: "hrms_employee_assets_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "hrms_organisations"
            referencedColumns: ["id"]
          },
        ]
      }
      hrms_employee_documents: {
        Row: {
          created_at: string | null
          document_name: string
          document_type: string
          employee_id: string
          expiry_date: string | null
          file_path: string
          file_size: number | null
          id: string
          is_verified: boolean | null
          mime_type: string | null
          notes: string | null
          updated_at: string | null
          uploaded_by: string | null
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          created_at?: string | null
          document_name: string
          document_type: string
          employee_id: string
          expiry_date?: string | null
          file_path: string
          file_size?: number | null
          id?: string
          is_verified?: boolean | null
          mime_type?: string | null
          notes?: string | null
          updated_at?: string | null
          uploaded_by?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          created_at?: string | null
          document_name?: string
          document_type?: string
          employee_id?: string
          expiry_date?: string | null
          file_path?: string
          file_size?: number | null
          id?: string
          is_verified?: boolean | null
          mime_type?: string | null
          notes?: string | null
          updated_at?: string | null
          uploaded_by?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hrms_employee_documents_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "hms_staff"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hrms_employee_documents_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "hrms_v_doctor_activity"
            referencedColumns: ["employee_id"]
          },
          {
            foreignKeyName: "hrms_employee_documents_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "hrms_v_probation_ending"
            referencedColumns: ["employee_id"]
          },
          {
            foreignKeyName: "hrms_employee_documents_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "hrms_v_therapist_activity"
            referencedColumns: ["employee_id"]
          },
        ]
      }
      hrms_employee_incentives: {
        Row: {
          achievement_pct: number | null
          approved_amount: number | null
          approved_at: string | null
          approved_by: string | null
          calculated_amount: number | null
          created_at: string | null
          employee_id: string
          id: string
          incentive_rule_id: string
          metric_value: number | null
          month: number
          organisation_id: string | null
          paid_in_payroll_id: string | null
          remarks: string | null
          status: string
          target_value: number | null
          updated_at: string | null
          year: number
        }
        Insert: {
          achievement_pct?: number | null
          approved_amount?: number | null
          approved_at?: string | null
          approved_by?: string | null
          calculated_amount?: number | null
          created_at?: string | null
          employee_id: string
          id?: string
          incentive_rule_id: string
          metric_value?: number | null
          month: number
          organisation_id?: string | null
          paid_in_payroll_id?: string | null
          remarks?: string | null
          status?: string
          target_value?: number | null
          updated_at?: string | null
          year: number
        }
        Update: {
          achievement_pct?: number | null
          approved_amount?: number | null
          approved_at?: string | null
          approved_by?: string | null
          calculated_amount?: number | null
          created_at?: string | null
          employee_id?: string
          id?: string
          incentive_rule_id?: string
          metric_value?: number | null
          month?: number
          organisation_id?: string | null
          paid_in_payroll_id?: string | null
          remarks?: string | null
          status?: string
          target_value?: number | null
          updated_at?: string | null
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "hrms_employee_incentives_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "hms_staff"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hrms_employee_incentives_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "hrms_v_doctor_activity"
            referencedColumns: ["employee_id"]
          },
          {
            foreignKeyName: "hrms_employee_incentives_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "hrms_v_probation_ending"
            referencedColumns: ["employee_id"]
          },
          {
            foreignKeyName: "hrms_employee_incentives_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "hrms_v_therapist_activity"
            referencedColumns: ["employee_id"]
          },
          {
            foreignKeyName: "hrms_employee_incentives_incentive_rule_id_fkey"
            columns: ["incentive_rule_id"]
            isOneToOne: false
            referencedRelation: "hrms_incentive_rules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hrms_employee_incentives_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "hrms_organisations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hrms_employee_incentives_paid_in_payroll_id_fkey"
            columns: ["paid_in_payroll_id"]
            isOneToOne: false
            referencedRelation: "hrms_payroll_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      hrms_employee_kpis: {
        Row: {
          achievement_pct: number | null
          actual_value: number | null
          created_at: string | null
          data_source: string | null
          employee_id: string
          id: string
          kpi_template_id: string
          month: number
          organisation_id: string | null
          rating: number | null
          remarks: string | null
          scored_at: string | null
          scored_by: string | null
          target_value: number | null
          updated_at: string | null
          weighted_score: number | null
          year: number
        }
        Insert: {
          achievement_pct?: number | null
          actual_value?: number | null
          created_at?: string | null
          data_source?: string | null
          employee_id: string
          id?: string
          kpi_template_id: string
          month: number
          organisation_id?: string | null
          rating?: number | null
          remarks?: string | null
          scored_at?: string | null
          scored_by?: string | null
          target_value?: number | null
          updated_at?: string | null
          weighted_score?: number | null
          year: number
        }
        Update: {
          achievement_pct?: number | null
          actual_value?: number | null
          created_at?: string | null
          data_source?: string | null
          employee_id?: string
          id?: string
          kpi_template_id?: string
          month?: number
          organisation_id?: string | null
          rating?: number | null
          remarks?: string | null
          scored_at?: string | null
          scored_by?: string | null
          target_value?: number | null
          updated_at?: string | null
          weighted_score?: number | null
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "hrms_employee_kpis_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "hms_staff"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hrms_employee_kpis_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "hrms_v_doctor_activity"
            referencedColumns: ["employee_id"]
          },
          {
            foreignKeyName: "hrms_employee_kpis_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "hrms_v_probation_ending"
            referencedColumns: ["employee_id"]
          },
          {
            foreignKeyName: "hrms_employee_kpis_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "hrms_v_therapist_activity"
            referencedColumns: ["employee_id"]
          },
          {
            foreignKeyName: "hrms_employee_kpis_kpi_template_id_fkey"
            columns: ["kpi_template_id"]
            isOneToOne: false
            referencedRelation: "hrms_kpi_templates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hrms_employee_kpis_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "hrms_organisations"
            referencedColumns: ["id"]
          },
        ]
      }
      hrms_employee_qualifications: {
        Row: {
          certificate_url: string | null
          created_at: string | null
          employee_id: string
          id: string
          institution: string | null
          is_primary: boolean | null
          qualification: string
          registration_authority: string | null
          registration_expiry: string | null
          registration_number: string | null
          university: string | null
          updated_at: string | null
          year_of_passing: number | null
        }
        Insert: {
          certificate_url?: string | null
          created_at?: string | null
          employee_id: string
          id?: string
          institution?: string | null
          is_primary?: boolean | null
          qualification: string
          registration_authority?: string | null
          registration_expiry?: string | null
          registration_number?: string | null
          university?: string | null
          updated_at?: string | null
          year_of_passing?: number | null
        }
        Update: {
          certificate_url?: string | null
          created_at?: string | null
          employee_id?: string
          id?: string
          institution?: string | null
          is_primary?: boolean | null
          qualification?: string
          registration_authority?: string | null
          registration_expiry?: string | null
          registration_number?: string | null
          university?: string | null
          updated_at?: string | null
          year_of_passing?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "hrms_employee_qualifications_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "hms_staff"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hrms_employee_qualifications_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "hrms_v_doctor_activity"
            referencedColumns: ["employee_id"]
          },
          {
            foreignKeyName: "hrms_employee_qualifications_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "hrms_v_probation_ending"
            referencedColumns: ["employee_id"]
          },
          {
            foreignKeyName: "hrms_employee_qualifications_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "hrms_v_therapist_activity"
            referencedColumns: ["employee_id"]
          },
        ]
      }
      hrms_employee_requests: {
        Row: {
          amount: number | null
          attachment_url: string | null
          completed_at: string | null
          created_at: string | null
          description: string | null
          employee_id: string
          id: string
          organisation_id: string | null
          request_type: string
          requested_by: string
          review_remarks: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          subject: string
          updated_at: string | null
        }
        Insert: {
          amount?: number | null
          attachment_url?: string | null
          completed_at?: string | null
          created_at?: string | null
          description?: string | null
          employee_id: string
          id?: string
          organisation_id?: string | null
          request_type: string
          requested_by: string
          review_remarks?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          subject: string
          updated_at?: string | null
        }
        Update: {
          amount?: number | null
          attachment_url?: string | null
          completed_at?: string | null
          created_at?: string | null
          description?: string | null
          employee_id?: string
          id?: string
          organisation_id?: string | null
          request_type?: string
          requested_by?: string
          review_remarks?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          subject?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hrms_employee_requests_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "hms_staff"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hrms_employee_requests_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "hrms_v_doctor_activity"
            referencedColumns: ["employee_id"]
          },
          {
            foreignKeyName: "hrms_employee_requests_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "hrms_v_probation_ending"
            referencedColumns: ["employee_id"]
          },
          {
            foreignKeyName: "hrms_employee_requests_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "hrms_v_therapist_activity"
            referencedColumns: ["employee_id"]
          },
          {
            foreignKeyName: "hrms_employee_requests_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "hrms_organisations"
            referencedColumns: ["id"]
          },
        ]
      }
      hrms_employee_salary: {
        Row: {
          annual_ctc: number
          bank_account_no: string | null
          bank_ifsc: string | null
          bank_name: string | null
          basic: number | null
          component_overrides: Json | null
          created_at: string | null
          effective_from: string
          effective_to: string | null
          employee_id: string
          esi_employee: number | null
          esi_employer: number | null
          gross_salary: number | null
          hra: number | null
          id: string
          is_active: boolean | null
          monthly_ctc: number | null
          net_salary: number | null
          organisation_id: string | null
          other_earnings: number | null
          payment_mode: string | null
          pf_employee: number | null
          pf_employer: number | null
          professional_tax: number | null
          revision_number: number | null
          revision_reason: string | null
          salary_structure_id: string | null
          special_allowance: number | null
          tds: number | null
          total_deductions: number | null
          updated_at: string | null
        }
        Insert: {
          annual_ctc: number
          bank_account_no?: string | null
          bank_ifsc?: string | null
          bank_name?: string | null
          basic?: number | null
          component_overrides?: Json | null
          created_at?: string | null
          effective_from?: string
          effective_to?: string | null
          employee_id: string
          esi_employee?: number | null
          esi_employer?: number | null
          gross_salary?: number | null
          hra?: number | null
          id?: string
          is_active?: boolean | null
          monthly_ctc?: number | null
          net_salary?: number | null
          organisation_id?: string | null
          other_earnings?: number | null
          payment_mode?: string | null
          pf_employee?: number | null
          pf_employer?: number | null
          professional_tax?: number | null
          revision_number?: number | null
          revision_reason?: string | null
          salary_structure_id?: string | null
          special_allowance?: number | null
          tds?: number | null
          total_deductions?: number | null
          updated_at?: string | null
        }
        Update: {
          annual_ctc?: number
          bank_account_no?: string | null
          bank_ifsc?: string | null
          bank_name?: string | null
          basic?: number | null
          component_overrides?: Json | null
          created_at?: string | null
          effective_from?: string
          effective_to?: string | null
          employee_id?: string
          esi_employee?: number | null
          esi_employer?: number | null
          gross_salary?: number | null
          hra?: number | null
          id?: string
          is_active?: boolean | null
          monthly_ctc?: number | null
          net_salary?: number | null
          organisation_id?: string | null
          other_earnings?: number | null
          payment_mode?: string | null
          pf_employee?: number | null
          pf_employer?: number | null
          professional_tax?: number | null
          revision_number?: number | null
          revision_reason?: string | null
          salary_structure_id?: string | null
          special_allowance?: number | null
          tds?: number | null
          total_deductions?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hrms_employee_salary_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "hms_staff"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hrms_employee_salary_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "hrms_v_doctor_activity"
            referencedColumns: ["employee_id"]
          },
          {
            foreignKeyName: "hrms_employee_salary_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "hrms_v_probation_ending"
            referencedColumns: ["employee_id"]
          },
          {
            foreignKeyName: "hrms_employee_salary_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "hrms_v_therapist_activity"
            referencedColumns: ["employee_id"]
          },
          {
            foreignKeyName: "hrms_employee_salary_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "hrms_organisations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hrms_employee_salary_salary_structure_id_fkey"
            columns: ["salary_structure_id"]
            isOneToOne: false
            referencedRelation: "hrms_salary_structures"
            referencedColumns: ["id"]
          },
        ]
      }
      hrms_employee_training: {
        Row: {
          assessment_score: number | null
          assigned_at: string | null
          assigned_by: string | null
          attendance_date: string | null
          attended: boolean | null
          certificate_expiry: string | null
          certificate_issued: boolean | null
          certificate_number: string | null
          certificate_url: string | null
          completed_at: string | null
          created_at: string | null
          employee_id: string
          feedback_comments: string | null
          feedback_rating: number | null
          id: string
          organisation_id: string | null
          passed: boolean | null
          status: string
          training_id: string
          updated_at: string | null
        }
        Insert: {
          assessment_score?: number | null
          assigned_at?: string | null
          assigned_by?: string | null
          attendance_date?: string | null
          attended?: boolean | null
          certificate_expiry?: string | null
          certificate_issued?: boolean | null
          certificate_number?: string | null
          certificate_url?: string | null
          completed_at?: string | null
          created_at?: string | null
          employee_id: string
          feedback_comments?: string | null
          feedback_rating?: number | null
          id?: string
          organisation_id?: string | null
          passed?: boolean | null
          status?: string
          training_id: string
          updated_at?: string | null
        }
        Update: {
          assessment_score?: number | null
          assigned_at?: string | null
          assigned_by?: string | null
          attendance_date?: string | null
          attended?: boolean | null
          certificate_expiry?: string | null
          certificate_issued?: boolean | null
          certificate_number?: string | null
          certificate_url?: string | null
          completed_at?: string | null
          created_at?: string | null
          employee_id?: string
          feedback_comments?: string | null
          feedback_rating?: number | null
          id?: string
          organisation_id?: string | null
          passed?: boolean | null
          status?: string
          training_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hrms_employee_training_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "hms_staff"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hrms_employee_training_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "hrms_v_doctor_activity"
            referencedColumns: ["employee_id"]
          },
          {
            foreignKeyName: "hrms_employee_training_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "hrms_v_probation_ending"
            referencedColumns: ["employee_id"]
          },
          {
            foreignKeyName: "hrms_employee_training_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "hrms_v_therapist_activity"
            referencedColumns: ["employee_id"]
          },
          {
            foreignKeyName: "hrms_employee_training_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "hrms_organisations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hrms_employee_training_training_id_fkey"
            columns: ["training_id"]
            isOneToOne: false
            referencedRelation: "hrms_trainings"
            referencedColumns: ["id"]
          },
        ]
      }
      hrms_exit_clearance: {
        Row: {
          clearance_item: string
          cleared_at: string | null
          cleared_by: string | null
          created_at: string | null
          department: string
          employee_id: string
          id: string
          remarks: string | null
          resignation_id: string | null
          status: string
          updated_at: string | null
        }
        Insert: {
          clearance_item: string
          cleared_at?: string | null
          cleared_by?: string | null
          created_at?: string | null
          department: string
          employee_id: string
          id?: string
          remarks?: string | null
          resignation_id?: string | null
          status?: string
          updated_at?: string | null
        }
        Update: {
          clearance_item?: string
          cleared_at?: string | null
          cleared_by?: string | null
          created_at?: string | null
          department?: string
          employee_id?: string
          id?: string
          remarks?: string | null
          resignation_id?: string | null
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hrms_exit_clearance_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "hms_staff"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hrms_exit_clearance_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "hrms_v_doctor_activity"
            referencedColumns: ["employee_id"]
          },
          {
            foreignKeyName: "hrms_exit_clearance_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "hrms_v_probation_ending"
            referencedColumns: ["employee_id"]
          },
          {
            foreignKeyName: "hrms_exit_clearance_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "hrms_v_therapist_activity"
            referencedColumns: ["employee_id"]
          },
          {
            foreignKeyName: "hrms_exit_clearance_resignation_id_fkey"
            columns: ["resignation_id"]
            isOneToOne: false
            referencedRelation: "hrms_resignations"
            referencedColumns: ["id"]
          },
        ]
      }
      hrms_holidays: {
        Row: {
          branch_id: string | null
          created_at: string | null
          date: string
          description: string | null
          id: string
          is_active: boolean | null
          is_paid: boolean | null
          name: string
          organisation_id: string | null
          type: string
          updated_at: string | null
          year: number | null
        }
        Insert: {
          branch_id?: string | null
          created_at?: string | null
          date: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_paid?: boolean | null
          name: string
          organisation_id?: string | null
          type?: string
          updated_at?: string | null
          year?: number | null
        }
        Update: {
          branch_id?: string | null
          created_at?: string | null
          date?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_paid?: boolean | null
          name?: string
          organisation_id?: string | null
          type?: string
          updated_at?: string | null
          year?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "hrms_holidays_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "hms_branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hrms_holidays_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "hrms_v_branch_workforce"
            referencedColumns: ["branch_id"]
          },
          {
            foreignKeyName: "hrms_holidays_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "hrms_organisations"
            referencedColumns: ["id"]
          },
        ]
      }
      hrms_hr_letters: {
        Row: {
          acknowledged_at: string | null
          acknowledged_by_employee: boolean | null
          content: string
          created_at: string | null
          delivered_at: string | null
          delivered_to_employee: boolean | null
          document_url: string | null
          employee_id: string
          id: string
          issued_by: string | null
          issued_date: string | null
          letter_type: string
          organisation_id: string | null
          previous_version_id: string | null
          reference_number: string | null
          subject: string
          template_used: string | null
          updated_at: string | null
          version: number | null
        }
        Insert: {
          acknowledged_at?: string | null
          acknowledged_by_employee?: boolean | null
          content: string
          created_at?: string | null
          delivered_at?: string | null
          delivered_to_employee?: boolean | null
          document_url?: string | null
          employee_id: string
          id?: string
          issued_by?: string | null
          issued_date?: string | null
          letter_type: string
          organisation_id?: string | null
          previous_version_id?: string | null
          reference_number?: string | null
          subject: string
          template_used?: string | null
          updated_at?: string | null
          version?: number | null
        }
        Update: {
          acknowledged_at?: string | null
          acknowledged_by_employee?: boolean | null
          content?: string
          created_at?: string | null
          delivered_at?: string | null
          delivered_to_employee?: boolean | null
          document_url?: string | null
          employee_id?: string
          id?: string
          issued_by?: string | null
          issued_date?: string | null
          letter_type?: string
          organisation_id?: string | null
          previous_version_id?: string | null
          reference_number?: string | null
          subject?: string
          template_used?: string | null
          updated_at?: string | null
          version?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "hrms_hr_letters_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "hms_staff"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hrms_hr_letters_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "hrms_v_doctor_activity"
            referencedColumns: ["employee_id"]
          },
          {
            foreignKeyName: "hrms_hr_letters_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "hrms_v_probation_ending"
            referencedColumns: ["employee_id"]
          },
          {
            foreignKeyName: "hrms_hr_letters_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "hrms_v_therapist_activity"
            referencedColumns: ["employee_id"]
          },
          {
            foreignKeyName: "hrms_hr_letters_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "hrms_organisations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hrms_hr_letters_previous_version_id_fkey"
            columns: ["previous_version_id"]
            isOneToOne: false
            referencedRelation: "hrms_hr_letters"
            referencedColumns: ["id"]
          },
        ]
      }
      hrms_incentive_rules: {
        Row: {
          applicable_departments: string[] | null
          applicable_roles: string[] | null
          base_metric: string | null
          calc_type: string
          code: string
          created_at: string | null
          description: string | null
          fixed_amount: number | null
          frequency: string | null
          id: string
          is_active: boolean | null
          max_amount: number | null
          metric: string
          min_amount: number | null
          name: string
          organisation_id: string | null
          percentage: number | null
          slabs: Json | null
          updated_at: string | null
        }
        Insert: {
          applicable_departments?: string[] | null
          applicable_roles?: string[] | null
          base_metric?: string | null
          calc_type: string
          code: string
          created_at?: string | null
          description?: string | null
          fixed_amount?: number | null
          frequency?: string | null
          id?: string
          is_active?: boolean | null
          max_amount?: number | null
          metric: string
          min_amount?: number | null
          name: string
          organisation_id?: string | null
          percentage?: number | null
          slabs?: Json | null
          updated_at?: string | null
        }
        Update: {
          applicable_departments?: string[] | null
          applicable_roles?: string[] | null
          base_metric?: string | null
          calc_type?: string
          code?: string
          created_at?: string | null
          description?: string | null
          fixed_amount?: number | null
          frequency?: string | null
          id?: string
          is_active?: boolean | null
          max_amount?: number | null
          metric?: string
          min_amount?: number | null
          name?: string
          organisation_id?: string | null
          percentage?: number | null
          slabs?: Json | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hrms_incentive_rules_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "hrms_organisations"
            referencedColumns: ["id"]
          },
        ]
      }
      hrms_interviews: {
        Row: {
          candidate_id: string
          created_at: string | null
          duration_minutes: number | null
          feedback: string | null
          id: string
          interview_type: string | null
          interviewer_id: string | null
          interviewer_name: string | null
          recommendation: string | null
          round: number | null
          scheduled_date: string | null
          scheduled_time: string | null
          score: number | null
          status: string | null
          strengths: string | null
          updated_at: string | null
          vacancy_id: string | null
          weaknesses: string | null
        }
        Insert: {
          candidate_id: string
          created_at?: string | null
          duration_minutes?: number | null
          feedback?: string | null
          id?: string
          interview_type?: string | null
          interviewer_id?: string | null
          interviewer_name?: string | null
          recommendation?: string | null
          round?: number | null
          scheduled_date?: string | null
          scheduled_time?: string | null
          score?: number | null
          status?: string | null
          strengths?: string | null
          updated_at?: string | null
          vacancy_id?: string | null
          weaknesses?: string | null
        }
        Update: {
          candidate_id?: string
          created_at?: string | null
          duration_minutes?: number | null
          feedback?: string | null
          id?: string
          interview_type?: string | null
          interviewer_id?: string | null
          interviewer_name?: string | null
          recommendation?: string | null
          round?: number | null
          scheduled_date?: string | null
          scheduled_time?: string | null
          score?: number | null
          status?: string | null
          strengths?: string | null
          updated_at?: string | null
          vacancy_id?: string | null
          weaknesses?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hrms_interviews_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "hrms_candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hrms_interviews_vacancy_id_fkey"
            columns: ["vacancy_id"]
            isOneToOne: false
            referencedRelation: "hrms_vacancies"
            referencedColumns: ["id"]
          },
        ]
      }
      hrms_kpi_templates: {
        Row: {
          applicable_departments: string[] | null
          applicable_designations: string[] | null
          applicable_roles: string[] | null
          category: string
          code: string
          created_at: string | null
          data_source: string | null
          description: string | null
          frequency: string | null
          id: string
          is_active: boolean | null
          max_value: number | null
          metric_type: string
          name: string
          organisation_id: string | null
          scoring_method: string | null
          scoring_slabs: Json | null
          sort_order: number | null
          target_value: number | null
          unit: string | null
          updated_at: string | null
          weightage: number | null
        }
        Insert: {
          applicable_departments?: string[] | null
          applicable_designations?: string[] | null
          applicable_roles?: string[] | null
          category?: string
          code: string
          created_at?: string | null
          data_source?: string | null
          description?: string | null
          frequency?: string | null
          id?: string
          is_active?: boolean | null
          max_value?: number | null
          metric_type?: string
          name: string
          organisation_id?: string | null
          scoring_method?: string | null
          scoring_slabs?: Json | null
          sort_order?: number | null
          target_value?: number | null
          unit?: string | null
          updated_at?: string | null
          weightage?: number | null
        }
        Update: {
          applicable_departments?: string[] | null
          applicable_designations?: string[] | null
          applicable_roles?: string[] | null
          category?: string
          code?: string
          created_at?: string | null
          data_source?: string | null
          description?: string | null
          frequency?: string | null
          id?: string
          is_active?: boolean | null
          max_value?: number | null
          metric_type?: string
          name?: string
          organisation_id?: string | null
          scoring_method?: string | null
          scoring_slabs?: Json | null
          sort_order?: number | null
          target_value?: number | null
          unit?: string | null
          updated_at?: string | null
          weightage?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "hrms_kpi_templates_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "hrms_organisations"
            referencedColumns: ["id"]
          },
        ]
      }
      hrms_leave_balances: {
        Row: {
          available: number | null
          carried_forward_from: number | null
          created_at: string | null
          credited: number | null
          employee_id: string
          id: string
          leave_type_id: string
          opening_balance: number | null
          organisation_id: string | null
          pending: number | null
          updated_at: string | null
          used: number | null
          year: number
        }
        Insert: {
          available?: number | null
          carried_forward_from?: number | null
          created_at?: string | null
          credited?: number | null
          employee_id: string
          id?: string
          leave_type_id: string
          opening_balance?: number | null
          organisation_id?: string | null
          pending?: number | null
          updated_at?: string | null
          used?: number | null
          year?: number
        }
        Update: {
          available?: number | null
          carried_forward_from?: number | null
          created_at?: string | null
          credited?: number | null
          employee_id?: string
          id?: string
          leave_type_id?: string
          opening_balance?: number | null
          organisation_id?: string | null
          pending?: number | null
          updated_at?: string | null
          used?: number | null
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "hrms_leave_balances_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "hms_staff"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hrms_leave_balances_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "hrms_v_doctor_activity"
            referencedColumns: ["employee_id"]
          },
          {
            foreignKeyName: "hrms_leave_balances_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "hrms_v_probation_ending"
            referencedColumns: ["employee_id"]
          },
          {
            foreignKeyName: "hrms_leave_balances_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "hrms_v_therapist_activity"
            referencedColumns: ["employee_id"]
          },
          {
            foreignKeyName: "hrms_leave_balances_leave_type_id_fkey"
            columns: ["leave_type_id"]
            isOneToOne: false
            referencedRelation: "hrms_leave_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hrms_leave_balances_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "hrms_organisations"
            referencedColumns: ["id"]
          },
        ]
      }
      hrms_leave_requests: {
        Row: {
          applied_by: string
          branch_id: string | null
          cancel_reason: string | null
          cancelled_at: string | null
          created_at: string | null
          document_url: string | null
          employee_id: string
          from_date: string
          half_day_type: string | null
          hr_action_at: string | null
          hr_action_by: string | null
          hr_remarks: string | null
          id: string
          is_half_day: boolean | null
          leave_type_id: string
          manager_action_at: string | null
          manager_action_by: string | null
          manager_remarks: string | null
          organisation_id: string | null
          reason: string
          status: string
          to_date: string
          total_days: number
          updated_at: string | null
        }
        Insert: {
          applied_by: string
          branch_id?: string | null
          cancel_reason?: string | null
          cancelled_at?: string | null
          created_at?: string | null
          document_url?: string | null
          employee_id: string
          from_date: string
          half_day_type?: string | null
          hr_action_at?: string | null
          hr_action_by?: string | null
          hr_remarks?: string | null
          id?: string
          is_half_day?: boolean | null
          leave_type_id: string
          manager_action_at?: string | null
          manager_action_by?: string | null
          manager_remarks?: string | null
          organisation_id?: string | null
          reason: string
          status?: string
          to_date: string
          total_days?: number
          updated_at?: string | null
        }
        Update: {
          applied_by?: string
          branch_id?: string | null
          cancel_reason?: string | null
          cancelled_at?: string | null
          created_at?: string | null
          document_url?: string | null
          employee_id?: string
          from_date?: string
          half_day_type?: string | null
          hr_action_at?: string | null
          hr_action_by?: string | null
          hr_remarks?: string | null
          id?: string
          is_half_day?: boolean | null
          leave_type_id?: string
          manager_action_at?: string | null
          manager_action_by?: string | null
          manager_remarks?: string | null
          organisation_id?: string | null
          reason?: string
          status?: string
          to_date?: string
          total_days?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hrms_leave_requests_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "hms_branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hrms_leave_requests_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "hrms_v_branch_workforce"
            referencedColumns: ["branch_id"]
          },
          {
            foreignKeyName: "hrms_leave_requests_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "hms_staff"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hrms_leave_requests_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "hrms_v_doctor_activity"
            referencedColumns: ["employee_id"]
          },
          {
            foreignKeyName: "hrms_leave_requests_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "hrms_v_probation_ending"
            referencedColumns: ["employee_id"]
          },
          {
            foreignKeyName: "hrms_leave_requests_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "hrms_v_therapist_activity"
            referencedColumns: ["employee_id"]
          },
          {
            foreignKeyName: "hrms_leave_requests_leave_type_id_fkey"
            columns: ["leave_type_id"]
            isOneToOne: false
            referencedRelation: "hrms_leave_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hrms_leave_requests_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "hrms_organisations"
            referencedColumns: ["id"]
          },
        ]
      }
      hrms_leave_types: {
        Row: {
          annual_quota: number | null
          applicable_after_months: number | null
          applicable_gender: string | null
          code: string
          color: string | null
          created_at: string | null
          description: string | null
          document_after_days: number | null
          id: string
          is_active: boolean | null
          is_carry_forward: boolean | null
          is_encashable: boolean | null
          is_paid: boolean | null
          max_carry_forward: number | null
          max_consecutive_days: number | null
          min_days_advance_notice: number | null
          name: string
          organisation_id: string | null
          requires_document: boolean | null
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          annual_quota?: number | null
          applicable_after_months?: number | null
          applicable_gender?: string | null
          code: string
          color?: string | null
          created_at?: string | null
          description?: string | null
          document_after_days?: number | null
          id?: string
          is_active?: boolean | null
          is_carry_forward?: boolean | null
          is_encashable?: boolean | null
          is_paid?: boolean | null
          max_carry_forward?: number | null
          max_consecutive_days?: number | null
          min_days_advance_notice?: number | null
          name: string
          organisation_id?: string | null
          requires_document?: boolean | null
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          annual_quota?: number | null
          applicable_after_months?: number | null
          applicable_gender?: string | null
          code?: string
          color?: string | null
          created_at?: string | null
          description?: string | null
          document_after_days?: number | null
          id?: string
          is_active?: boolean | null
          is_carry_forward?: boolean | null
          is_encashable?: boolean | null
          is_paid?: boolean | null
          max_carry_forward?: number | null
          max_consecutive_days?: number | null
          min_days_advance_notice?: number | null
          name?: string
          organisation_id?: string | null
          requires_document?: boolean | null
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hrms_leave_types_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "hrms_organisations"
            referencedColumns: ["id"]
          },
        ]
      }
      hrms_loans_advances: {
        Row: {
          amount: number
          approved_at: string | null
          approved_by: string | null
          created_at: string | null
          disbursed_date: string | null
          emi_amount: number | null
          employee_id: string
          id: string
          installments_paid: number | null
          organisation_id: string | null
          outstanding: number | null
          reason: string | null
          status: string
          total_installments: number | null
          type: string
          updated_at: string | null
        }
        Insert: {
          amount: number
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string | null
          disbursed_date?: string | null
          emi_amount?: number | null
          employee_id: string
          id?: string
          installments_paid?: number | null
          organisation_id?: string | null
          outstanding?: number | null
          reason?: string | null
          status?: string
          total_installments?: number | null
          type: string
          updated_at?: string | null
        }
        Update: {
          amount?: number
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string | null
          disbursed_date?: string | null
          emi_amount?: number | null
          employee_id?: string
          id?: string
          installments_paid?: number | null
          organisation_id?: string | null
          outstanding?: number | null
          reason?: string | null
          status?: string
          total_installments?: number | null
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hrms_loans_advances_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "hms_staff"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hrms_loans_advances_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "hrms_v_doctor_activity"
            referencedColumns: ["employee_id"]
          },
          {
            foreignKeyName: "hrms_loans_advances_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "hrms_v_probation_ending"
            referencedColumns: ["employee_id"]
          },
          {
            foreignKeyName: "hrms_loans_advances_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "hrms_v_therapist_activity"
            referencedColumns: ["employee_id"]
          },
          {
            foreignKeyName: "hrms_loans_advances_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "hrms_organisations"
            referencedColumns: ["id"]
          },
        ]
      }
      hrms_notifications: {
        Row: {
          action_label: string | null
          action_url: string | null
          category: string
          channels: string[] | null
          created_at: string | null
          email_sent: boolean | null
          expires_at: string | null
          id: string
          is_dismissed: boolean | null
          is_read: boolean | null
          message: string
          organisation_id: string | null
          priority: string | null
          read_at: string | null
          recipient_employee_id: string | null
          recipient_role: string | null
          recipient_user_id: string | null
          sms_sent: boolean | null
          source_entity_id: string | null
          source_module: string | null
          title: string
        }
        Insert: {
          action_label?: string | null
          action_url?: string | null
          category?: string
          channels?: string[] | null
          created_at?: string | null
          email_sent?: boolean | null
          expires_at?: string | null
          id?: string
          is_dismissed?: boolean | null
          is_read?: boolean | null
          message: string
          organisation_id?: string | null
          priority?: string | null
          read_at?: string | null
          recipient_employee_id?: string | null
          recipient_role?: string | null
          recipient_user_id?: string | null
          sms_sent?: boolean | null
          source_entity_id?: string | null
          source_module?: string | null
          title: string
        }
        Update: {
          action_label?: string | null
          action_url?: string | null
          category?: string
          channels?: string[] | null
          created_at?: string | null
          email_sent?: boolean | null
          expires_at?: string | null
          id?: string
          is_dismissed?: boolean | null
          is_read?: boolean | null
          message?: string
          organisation_id?: string | null
          priority?: string | null
          read_at?: string | null
          recipient_employee_id?: string | null
          recipient_role?: string | null
          recipient_user_id?: string | null
          sms_sent?: boolean | null
          source_entity_id?: string | null
          source_module?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "hrms_notifications_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "hrms_organisations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hrms_notifications_recipient_employee_id_fkey"
            columns: ["recipient_employee_id"]
            isOneToOne: false
            referencedRelation: "hms_staff"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hrms_notifications_recipient_employee_id_fkey"
            columns: ["recipient_employee_id"]
            isOneToOne: false
            referencedRelation: "hrms_v_doctor_activity"
            referencedColumns: ["employee_id"]
          },
          {
            foreignKeyName: "hrms_notifications_recipient_employee_id_fkey"
            columns: ["recipient_employee_id"]
            isOneToOne: false
            referencedRelation: "hrms_v_probation_ending"
            referencedColumns: ["employee_id"]
          },
          {
            foreignKeyName: "hrms_notifications_recipient_employee_id_fkey"
            columns: ["recipient_employee_id"]
            isOneToOne: false
            referencedRelation: "hrms_v_therapist_activity"
            referencedColumns: ["employee_id"]
          },
        ]
      }
      hrms_onboarding_tasks: {
        Row: {
          category: string | null
          completed_at: string | null
          completed_by: string | null
          created_at: string | null
          description: string | null
          due_date: string | null
          employee_id: string
          id: string
          is_completed: boolean | null
          is_mandatory: boolean | null
          organisation_id: string | null
          sort_order: number | null
          task_name: string
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          employee_id: string
          id?: string
          is_completed?: boolean | null
          is_mandatory?: boolean | null
          organisation_id?: string | null
          sort_order?: number | null
          task_name: string
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          employee_id?: string
          id?: string
          is_completed?: boolean | null
          is_mandatory?: boolean | null
          organisation_id?: string | null
          sort_order?: number | null
          task_name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hrms_onboarding_tasks_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "hms_staff"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hrms_onboarding_tasks_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "hrms_v_doctor_activity"
            referencedColumns: ["employee_id"]
          },
          {
            foreignKeyName: "hrms_onboarding_tasks_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "hrms_v_probation_ending"
            referencedColumns: ["employee_id"]
          },
          {
            foreignKeyName: "hrms_onboarding_tasks_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "hrms_v_therapist_activity"
            referencedColumns: ["employee_id"]
          },
          {
            foreignKeyName: "hrms_onboarding_tasks_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "hrms_organisations"
            referencedColumns: ["id"]
          },
        ]
      }
      hrms_organisations: {
        Row: {
          address: string | null
          city: string | null
          code: string | null
          created_at: string | null
          email: string | null
          established_date: string | null
          gstin: string | null
          id: string
          is_active: boolean | null
          logo_url: string | null
          name: string
          pan: string | null
          phone: string | null
          pincode: string | null
          registration_no: string | null
          settings: Json | null
          state: string | null
          type: string | null
          updated_at: string | null
          website: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          code?: string | null
          created_at?: string | null
          email?: string | null
          established_date?: string | null
          gstin?: string | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          name: string
          pan?: string | null
          phone?: string | null
          pincode?: string | null
          registration_no?: string | null
          settings?: Json | null
          state?: string | null
          type?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          code?: string | null
          created_at?: string | null
          email?: string | null
          established_date?: string | null
          gstin?: string | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          name?: string
          pan?: string | null
          phone?: string | null
          pincode?: string | null
          registration_no?: string | null
          settings?: Json | null
          state?: string | null
          type?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Relationships: []
      }
      hrms_payroll_items: {
        Row: {
          absent_days: number | null
          advance_deduction: number | null
          arrears: number | null
          basic: number | null
          bonus: number | null
          conveyance: number | null
          created_at: string | null
          deductions_detail: Json | null
          earnings_detail: Json | null
          employee_id: string
          esi_employee: number | null
          esi_employer: number | null
          gross_salary: number | null
          hra: number | null
          id: string
          incentive: number | null
          leave_days: number | null
          loan_deduction: number | null
          lop_days: number | null
          lop_deduction: number | null
          medical_allowance: number | null
          net_salary: number | null
          other_deductions: number | null
          other_earnings: number | null
          overtime_hours: number | null
          overtime_pay: number | null
          paid_days: number | null
          payment_date: string | null
          payment_mode: string | null
          payment_status: string | null
          payroll_run_id: string
          pf_employee: number | null
          pf_employer: number | null
          present_days: number | null
          professional_tax: number | null
          special_allowance: number | null
          tds: number | null
          total_deductions: number | null
          transaction_ref: string | null
          updated_at: string | null
          working_days: number | null
        }
        Insert: {
          absent_days?: number | null
          advance_deduction?: number | null
          arrears?: number | null
          basic?: number | null
          bonus?: number | null
          conveyance?: number | null
          created_at?: string | null
          deductions_detail?: Json | null
          earnings_detail?: Json | null
          employee_id: string
          esi_employee?: number | null
          esi_employer?: number | null
          gross_salary?: number | null
          hra?: number | null
          id?: string
          incentive?: number | null
          leave_days?: number | null
          loan_deduction?: number | null
          lop_days?: number | null
          lop_deduction?: number | null
          medical_allowance?: number | null
          net_salary?: number | null
          other_deductions?: number | null
          other_earnings?: number | null
          overtime_hours?: number | null
          overtime_pay?: number | null
          paid_days?: number | null
          payment_date?: string | null
          payment_mode?: string | null
          payment_status?: string | null
          payroll_run_id: string
          pf_employee?: number | null
          pf_employer?: number | null
          present_days?: number | null
          professional_tax?: number | null
          special_allowance?: number | null
          tds?: number | null
          total_deductions?: number | null
          transaction_ref?: string | null
          updated_at?: string | null
          working_days?: number | null
        }
        Update: {
          absent_days?: number | null
          advance_deduction?: number | null
          arrears?: number | null
          basic?: number | null
          bonus?: number | null
          conveyance?: number | null
          created_at?: string | null
          deductions_detail?: Json | null
          earnings_detail?: Json | null
          employee_id?: string
          esi_employee?: number | null
          esi_employer?: number | null
          gross_salary?: number | null
          hra?: number | null
          id?: string
          incentive?: number | null
          leave_days?: number | null
          loan_deduction?: number | null
          lop_days?: number | null
          lop_deduction?: number | null
          medical_allowance?: number | null
          net_salary?: number | null
          other_deductions?: number | null
          other_earnings?: number | null
          overtime_hours?: number | null
          overtime_pay?: number | null
          paid_days?: number | null
          payment_date?: string | null
          payment_mode?: string | null
          payment_status?: string | null
          payroll_run_id?: string
          pf_employee?: number | null
          pf_employer?: number | null
          present_days?: number | null
          professional_tax?: number | null
          special_allowance?: number | null
          tds?: number | null
          total_deductions?: number | null
          transaction_ref?: string | null
          updated_at?: string | null
          working_days?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "hrms_payroll_items_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "hms_staff"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hrms_payroll_items_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "hrms_v_doctor_activity"
            referencedColumns: ["employee_id"]
          },
          {
            foreignKeyName: "hrms_payroll_items_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "hrms_v_probation_ending"
            referencedColumns: ["employee_id"]
          },
          {
            foreignKeyName: "hrms_payroll_items_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "hrms_v_therapist_activity"
            referencedColumns: ["employee_id"]
          },
          {
            foreignKeyName: "hrms_payroll_items_payroll_run_id_fkey"
            columns: ["payroll_run_id"]
            isOneToOne: false
            referencedRelation: "hrms_payroll_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      hrms_payroll_runs: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          branch_id: string | null
          created_at: string | null
          id: string
          locked_at: string | null
          locked_by: string | null
          month: number
          notes: string | null
          organisation_id: string | null
          period_label: string | null
          processed_at: string | null
          processed_by: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          total_deductions: number | null
          total_employees: number | null
          total_employer_contribution: number | null
          total_gross: number | null
          total_net: number | null
          updated_at: string | null
          year: number
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          branch_id?: string | null
          created_at?: string | null
          id?: string
          locked_at?: string | null
          locked_by?: string | null
          month: number
          notes?: string | null
          organisation_id?: string | null
          period_label?: string | null
          processed_at?: string | null
          processed_by?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          total_deductions?: number | null
          total_employees?: number | null
          total_employer_contribution?: number | null
          total_gross?: number | null
          total_net?: number | null
          updated_at?: string | null
          year: number
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          branch_id?: string | null
          created_at?: string | null
          id?: string
          locked_at?: string | null
          locked_by?: string | null
          month?: number
          notes?: string | null
          organisation_id?: string | null
          period_label?: string | null
          processed_at?: string | null
          processed_by?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          total_deductions?: number | null
          total_employees?: number | null
          total_employer_contribution?: number | null
          total_gross?: number | null
          total_net?: number | null
          updated_at?: string | null
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "hrms_payroll_runs_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "hms_branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hrms_payroll_runs_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "hrms_v_branch_workforce"
            referencedColumns: ["branch_id"]
          },
          {
            foreignKeyName: "hrms_payroll_runs_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "hrms_organisations"
            referencedColumns: ["id"]
          },
        ]
      }
      hrms_performance_reviews: {
        Row: {
          acknowledged_at: string | null
          acknowledged_by_employee: boolean | null
          areas_of_improvement: string | null
          created_at: string | null
          employee_comments: string | null
          employee_id: string
          final_rating: number | null
          goals_next_period: string | null
          grade: string | null
          hr_comments: string | null
          id: string
          increment_percentage: number | null
          kpi_score: number | null
          manager_comments: string | null
          manager_rating: number | null
          organisation_id: string | null
          period_from: string
          period_to: string
          recommendation: string | null
          review_type: string
          reviewed_at: string | null
          reviewed_by: string | null
          self_rating: number | null
          status: string
          strengths: string | null
          updated_at: string | null
        }
        Insert: {
          acknowledged_at?: string | null
          acknowledged_by_employee?: boolean | null
          areas_of_improvement?: string | null
          created_at?: string | null
          employee_comments?: string | null
          employee_id: string
          final_rating?: number | null
          goals_next_period?: string | null
          grade?: string | null
          hr_comments?: string | null
          id?: string
          increment_percentage?: number | null
          kpi_score?: number | null
          manager_comments?: string | null
          manager_rating?: number | null
          organisation_id?: string | null
          period_from: string
          period_to: string
          recommendation?: string | null
          review_type?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          self_rating?: number | null
          status?: string
          strengths?: string | null
          updated_at?: string | null
        }
        Update: {
          acknowledged_at?: string | null
          acknowledged_by_employee?: boolean | null
          areas_of_improvement?: string | null
          created_at?: string | null
          employee_comments?: string | null
          employee_id?: string
          final_rating?: number | null
          goals_next_period?: string | null
          grade?: string | null
          hr_comments?: string | null
          id?: string
          increment_percentage?: number | null
          kpi_score?: number | null
          manager_comments?: string | null
          manager_rating?: number | null
          organisation_id?: string | null
          period_from?: string
          period_to?: string
          recommendation?: string | null
          review_type?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          self_rating?: number | null
          status?: string
          strengths?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hrms_performance_reviews_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "hms_staff"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hrms_performance_reviews_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "hrms_v_doctor_activity"
            referencedColumns: ["employee_id"]
          },
          {
            foreignKeyName: "hrms_performance_reviews_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "hrms_v_probation_ending"
            referencedColumns: ["employee_id"]
          },
          {
            foreignKeyName: "hrms_performance_reviews_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "hrms_v_therapist_activity"
            referencedColumns: ["employee_id"]
          },
          {
            foreignKeyName: "hrms_performance_reviews_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "hrms_organisations"
            referencedColumns: ["id"]
          },
        ]
      }
      hrms_resignations: {
        Row: {
          accepted_at: string | null
          accepted_by: string | null
          created_at: string | null
          employee_id: string
          exit_feedback: string | null
          exit_interview_date: string | null
          exit_interview_done: boolean | null
          id: string
          last_working_date: string | null
          notice_period_days: number | null
          organisation_id: string | null
          reason: string | null
          reason_category: string | null
          resignation_date: string
          status: string
          updated_at: string | null
        }
        Insert: {
          accepted_at?: string | null
          accepted_by?: string | null
          created_at?: string | null
          employee_id: string
          exit_feedback?: string | null
          exit_interview_date?: string | null
          exit_interview_done?: boolean | null
          id?: string
          last_working_date?: string | null
          notice_period_days?: number | null
          organisation_id?: string | null
          reason?: string | null
          reason_category?: string | null
          resignation_date: string
          status?: string
          updated_at?: string | null
        }
        Update: {
          accepted_at?: string | null
          accepted_by?: string | null
          created_at?: string | null
          employee_id?: string
          exit_feedback?: string | null
          exit_interview_date?: string | null
          exit_interview_done?: boolean | null
          id?: string
          last_working_date?: string | null
          notice_period_days?: number | null
          organisation_id?: string | null
          reason?: string | null
          reason_category?: string | null
          resignation_date?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hrms_resignations_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "hms_staff"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hrms_resignations_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "hrms_v_doctor_activity"
            referencedColumns: ["employee_id"]
          },
          {
            foreignKeyName: "hrms_resignations_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "hrms_v_probation_ending"
            referencedColumns: ["employee_id"]
          },
          {
            foreignKeyName: "hrms_resignations_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "hrms_v_therapist_activity"
            referencedColumns: ["employee_id"]
          },
          {
            foreignKeyName: "hrms_resignations_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "hrms_organisations"
            referencedColumns: ["id"]
          },
        ]
      }
      hrms_salary_structures: {
        Row: {
          applicable_designation_ids: string[] | null
          code: string
          components: Json
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          max_ctc: number | null
          min_ctc: number | null
          name: string
          organisation_id: string | null
          updated_at: string | null
        }
        Insert: {
          applicable_designation_ids?: string[] | null
          code: string
          components?: Json
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          max_ctc?: number | null
          min_ctc?: number | null
          name: string
          organisation_id?: string | null
          updated_at?: string | null
        }
        Update: {
          applicable_designation_ids?: string[] | null
          code?: string
          components?: Json
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          max_ctc?: number | null
          min_ctc?: number | null
          name?: string
          organisation_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hrms_salary_structures_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "hrms_organisations"
            referencedColumns: ["id"]
          },
        ]
      }
      hrms_shifts: {
        Row: {
          break_minutes: number | null
          code: string
          color: string | null
          created_at: string | null
          end_time: string
          grace_minutes: number | null
          id: string
          is_active: boolean | null
          is_night_shift: boolean | null
          is_split_shift: boolean | null
          name: string
          organisation_id: string | null
          start_time: string
          updated_at: string | null
          working_hours: number | null
        }
        Insert: {
          break_minutes?: number | null
          code: string
          color?: string | null
          created_at?: string | null
          end_time: string
          grace_minutes?: number | null
          id?: string
          is_active?: boolean | null
          is_night_shift?: boolean | null
          is_split_shift?: boolean | null
          name: string
          organisation_id?: string | null
          start_time: string
          updated_at?: string | null
          working_hours?: number | null
        }
        Update: {
          break_minutes?: number | null
          code?: string
          color?: string | null
          created_at?: string | null
          end_time?: string
          grace_minutes?: number | null
          id?: string
          is_active?: boolean | null
          is_night_shift?: boolean | null
          is_split_shift?: boolean | null
          name?: string
          organisation_id?: string | null
          start_time?: string
          updated_at?: string | null
          working_hours?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "hrms_shifts_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "hrms_organisations"
            referencedColumns: ["id"]
          },
        ]
      }
      hrms_statutory_config: {
        Row: {
          created_at: string | null
          effective_from: string | null
          esi_employee_rate: number | null
          esi_employer_rate: number | null
          esi_enabled: boolean | null
          esi_wage_ceiling: number | null
          financial_year_start: number | null
          id: string
          is_active: boolean | null
          lwf_employee_amount: number | null
          lwf_employer_amount: number | null
          lwf_enabled: boolean | null
          notes: string | null
          organisation_id: string | null
          payroll_lock_day: number | null
          pf_employee_rate: number | null
          pf_employer_rate: number | null
          pf_enabled: boolean | null
          pf_wage_ceiling: number | null
          pt_enabled: boolean | null
          pt_slab: Json | null
          salary_credit_day: number | null
          tds_enabled: boolean | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          effective_from?: string | null
          esi_employee_rate?: number | null
          esi_employer_rate?: number | null
          esi_enabled?: boolean | null
          esi_wage_ceiling?: number | null
          financial_year_start?: number | null
          id?: string
          is_active?: boolean | null
          lwf_employee_amount?: number | null
          lwf_employer_amount?: number | null
          lwf_enabled?: boolean | null
          notes?: string | null
          organisation_id?: string | null
          payroll_lock_day?: number | null
          pf_employee_rate?: number | null
          pf_employer_rate?: number | null
          pf_enabled?: boolean | null
          pf_wage_ceiling?: number | null
          pt_enabled?: boolean | null
          pt_slab?: Json | null
          salary_credit_day?: number | null
          tds_enabled?: boolean | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          effective_from?: string | null
          esi_employee_rate?: number | null
          esi_employer_rate?: number | null
          esi_enabled?: boolean | null
          esi_wage_ceiling?: number | null
          financial_year_start?: number | null
          id?: string
          is_active?: boolean | null
          lwf_employee_amount?: number | null
          lwf_employer_amount?: number | null
          lwf_enabled?: boolean | null
          notes?: string | null
          organisation_id?: string | null
          payroll_lock_day?: number | null
          pf_employee_rate?: number | null
          pf_employer_rate?: number | null
          pf_enabled?: boolean | null
          pf_wage_ceiling?: number | null
          pt_enabled?: boolean | null
          pt_slab?: Json | null
          salary_credit_day?: number | null
          tds_enabled?: boolean | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hrms_statutory_config_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "hrms_organisations"
            referencedColumns: ["id"]
          },
        ]
      }
      hrms_trainings: {
        Row: {
          applicable_departments: string[] | null
          applicable_roles: string[] | null
          category: string
          certificate_validity_months: number | null
          code: string | null
          created_at: string | null
          description: string | null
          duration_hours: number | null
          has_assessment: boolean | null
          has_certificate: boolean | null
          id: string
          is_active: boolean | null
          is_mandatory: boolean | null
          is_online: boolean | null
          is_recurring: boolean | null
          max_participants: number | null
          name: string
          online_link: string | null
          organisation_id: string | null
          passing_score: number | null
          recurrence_months: number | null
          scheduled_date: string | null
          scheduled_time: string | null
          status: string | null
          trainer_name: string | null
          trainer_type: string | null
          updated_at: string | null
          venue: string | null
        }
        Insert: {
          applicable_departments?: string[] | null
          applicable_roles?: string[] | null
          category?: string
          certificate_validity_months?: number | null
          code?: string | null
          created_at?: string | null
          description?: string | null
          duration_hours?: number | null
          has_assessment?: boolean | null
          has_certificate?: boolean | null
          id?: string
          is_active?: boolean | null
          is_mandatory?: boolean | null
          is_online?: boolean | null
          is_recurring?: boolean | null
          max_participants?: number | null
          name: string
          online_link?: string | null
          organisation_id?: string | null
          passing_score?: number | null
          recurrence_months?: number | null
          scheduled_date?: string | null
          scheduled_time?: string | null
          status?: string | null
          trainer_name?: string | null
          trainer_type?: string | null
          updated_at?: string | null
          venue?: string | null
        }
        Update: {
          applicable_departments?: string[] | null
          applicable_roles?: string[] | null
          category?: string
          certificate_validity_months?: number | null
          code?: string | null
          created_at?: string | null
          description?: string | null
          duration_hours?: number | null
          has_assessment?: boolean | null
          has_certificate?: boolean | null
          id?: string
          is_active?: boolean | null
          is_mandatory?: boolean | null
          is_online?: boolean | null
          is_recurring?: boolean | null
          max_participants?: number | null
          name?: string
          online_link?: string | null
          organisation_id?: string | null
          passing_score?: number | null
          recurrence_months?: number | null
          scheduled_date?: string | null
          scheduled_time?: string | null
          status?: string | null
          trainer_name?: string | null
          trainer_type?: string | null
          updated_at?: string | null
          venue?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hrms_trainings_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "hrms_organisations"
            referencedColumns: ["id"]
          },
        ]
      }
      hrms_vacancies: {
        Row: {
          branch_id: string | null
          closed_at: string | null
          closing_date: string | null
          created_at: string | null
          created_by: string | null
          department: string
          department_id: string | null
          description: string | null
          designation: string | null
          experience_max: number | null
          experience_min: number | null
          filled: number | null
          id: string
          organisation_id: string | null
          positions: number | null
          posted_date: string | null
          priority: string | null
          qualification_required: string | null
          salary_range_max: number | null
          salary_range_min: number | null
          skills: string[] | null
          status: string
          title: string
          updated_at: string | null
        }
        Insert: {
          branch_id?: string | null
          closed_at?: string | null
          closing_date?: string | null
          created_at?: string | null
          created_by?: string | null
          department: string
          department_id?: string | null
          description?: string | null
          designation?: string | null
          experience_max?: number | null
          experience_min?: number | null
          filled?: number | null
          id?: string
          organisation_id?: string | null
          positions?: number | null
          posted_date?: string | null
          priority?: string | null
          qualification_required?: string | null
          salary_range_max?: number | null
          salary_range_min?: number | null
          skills?: string[] | null
          status?: string
          title: string
          updated_at?: string | null
        }
        Update: {
          branch_id?: string | null
          closed_at?: string | null
          closing_date?: string | null
          created_at?: string | null
          created_by?: string | null
          department?: string
          department_id?: string | null
          description?: string | null
          designation?: string | null
          experience_max?: number | null
          experience_min?: number | null
          filled?: number | null
          id?: string
          organisation_id?: string | null
          positions?: number | null
          posted_date?: string | null
          priority?: string | null
          qualification_required?: string | null
          salary_range_max?: number | null
          salary_range_min?: number | null
          skills?: string[] | null
          status?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hrms_vacancies_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "hms_branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hrms_vacancies_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "hrms_v_branch_workforce"
            referencedColumns: ["branch_id"]
          },
          {
            foreignKeyName: "hrms_vacancies_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "hrms_departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hrms_vacancies_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "hrms_organisations"
            referencedColumns: ["id"]
          },
        ]
      }
      interaction_search_logs: {
        Row: {
          ai_used: boolean | null
          created_at: string | null
          id: string
          query_substances: string[]
          results_count: number | null
          user_id: string | null
        }
        Insert: {
          ai_used?: boolean | null
          created_at?: string | null
          id?: string
          query_substances: string[]
          results_count?: number | null
          user_id?: string | null
        }
        Update: {
          ai_used?: boolean | null
          created_at?: string | null
          id?: string
          query_substances?: string[]
          results_count?: number | null
          user_id?: string | null
        }
        Relationships: []
      }
      interaction_substances: {
        Row: {
          botanical_name: string | null
          category: string
          common_uses: string[] | null
          contraindications: string[] | null
          created_at: string | null
          guna: string[] | null
          id: string
          is_active: boolean | null
          mechanism_of_action: string | null
          name: string
          name_hindi: string | null
          name_sanskrit: string | null
          pharmacological_class: string | null
          prabhava: string | null
          rasa: string[] | null
          subcategory: string | null
          veerya: string | null
          vipaka: string | null
        }
        Insert: {
          botanical_name?: string | null
          category: string
          common_uses?: string[] | null
          contraindications?: string[] | null
          created_at?: string | null
          guna?: string[] | null
          id?: string
          is_active?: boolean | null
          mechanism_of_action?: string | null
          name: string
          name_hindi?: string | null
          name_sanskrit?: string | null
          pharmacological_class?: string | null
          prabhava?: string | null
          rasa?: string[] | null
          subcategory?: string | null
          veerya?: string | null
          vipaka?: string | null
        }
        Update: {
          botanical_name?: string | null
          category?: string
          common_uses?: string[] | null
          contraindications?: string[] | null
          created_at?: string | null
          guna?: string[] | null
          id?: string
          is_active?: boolean | null
          mechanism_of_action?: string | null
          name?: string
          name_hindi?: string | null
          name_sanskrit?: string | null
          pharmacological_class?: string | null
          prabhava?: string | null
          rasa?: string[] | null
          subcategory?: string | null
          veerya?: string | null
          vipaka?: string | null
        }
        Relationships: []
      }
      internship_applications: {
        Row: {
          applied_at: string | null
          cover_note: string
          id: string
          listing_id: string
          status: string
          user_id: string
        }
        Insert: {
          applied_at?: string | null
          cover_note: string
          id?: string
          listing_id: string
          status?: string
          user_id: string
        }
        Update: {
          applied_at?: string | null
          cover_note?: string
          id?: string
          listing_id?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "internship_applications_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "internship_listings"
            referencedColumns: ["id"]
          },
        ]
      }
      internship_journal_entries: {
        Row: {
          cases_seen: number | null
          challenges: string | null
          created_at: string | null
          department: string
          diagnosis_observed: string[] | null
          hospital_name: string | null
          hours_spent: number | null
          id: string
          learnings: string
          posting_date: string
          procedures_performed: string[] | null
          supervisor_feedback: string | null
          supervisor_name: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          cases_seen?: number | null
          challenges?: string | null
          created_at?: string | null
          department: string
          diagnosis_observed?: string[] | null
          hospital_name?: string | null
          hours_spent?: number | null
          id?: string
          learnings: string
          posting_date?: string
          procedures_performed?: string[] | null
          supervisor_feedback?: string | null
          supervisor_name?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          cases_seen?: number | null
          challenges?: string | null
          created_at?: string | null
          department?: string
          diagnosis_observed?: string[] | null
          hospital_name?: string | null
          hours_spent?: number | null
          id?: string
          learnings?: string
          posting_date?: string
          procedures_performed?: string[] | null
          supervisor_feedback?: string | null
          supervisor_name?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      internship_listings: {
        Row: {
          application_count: number | null
          application_deadline: string | null
          created_at: string | null
          department: string
          description: string
          duration_weeks: number | null
          hospital_name: string
          id: string
          is_active: boolean | null
          location: string
          posted_by: string | null
          requirements: string | null
          spots_available: number | null
          stipend: string | null
          title: string
        }
        Insert: {
          application_count?: number | null
          application_deadline?: string | null
          created_at?: string | null
          department?: string
          description: string
          duration_weeks?: number | null
          hospital_name: string
          id?: string
          is_active?: boolean | null
          location: string
          posted_by?: string | null
          requirements?: string | null
          spots_available?: number | null
          stipend?: string | null
          title: string
        }
        Update: {
          application_count?: number | null
          application_deadline?: string | null
          created_at?: string | null
          department?: string
          description?: string
          duration_weeks?: number | null
          hospital_name?: string
          id?: string
          is_active?: boolean | null
          location?: string
          posted_by?: string | null
          requirements?: string | null
          spots_available?: number | null
          stipend?: string | null
          title?: string
        }
        Relationships: []
      }
      job_aggregation_log: {
        Row: {
          created_at: string
          error_message: string | null
          external_id: string | null
          external_url: string
          id: string
          job_listing_id: string | null
          last_synced_at: string
          raw_data: Json | null
          source: string
          sync_status: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          external_id?: string | null
          external_url: string
          id?: string
          job_listing_id?: string | null
          last_synced_at?: string
          raw_data?: Json | null
          source: string
          sync_status?: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          external_id?: string | null
          external_url?: string
          id?: string
          job_listing_id?: string | null
          last_synced_at?: string
          raw_data?: Json | null
          source?: string
          sync_status?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_aggregation_log_job_listing_id_fkey"
            columns: ["job_listing_id"]
            isOneToOne: false
            referencedRelation: "job_listings"
            referencedColumns: ["id"]
          },
        ]
      }
      job_ai_recommendations: {
        Row: {
          created_at: string
          id: string
          is_dismissed: boolean | null
          job_listing_id: string
          match_reasons: string[] | null
          match_score: number
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_dismissed?: boolean | null
          job_listing_id: string
          match_reasons?: string[] | null
          match_score?: number
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_dismissed?: boolean | null
          job_listing_id?: string
          match_reasons?: string[] | null
          match_score?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_ai_recommendations_job_listing_id_fkey"
            columns: ["job_listing_id"]
            isOneToOne: false
            referencedRelation: "job_listings"
            referencedColumns: ["id"]
          },
        ]
      }
      job_alerts: {
        Row: {
          created_at: string
          filters: Json
          frequency: string
          id: string
          is_active: boolean | null
          last_sent_at: string | null
          matched_count: number | null
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          filters?: Json
          frequency?: string
          id?: string
          is_active?: boolean | null
          last_sent_at?: string | null
          matched_count?: number | null
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          filters?: Json
          frequency?: string
          id?: string
          is_active?: boolean | null
          last_sent_at?: string | null
          matched_count?: number | null
          name?: string
          updated_at?: string
          user_id?: string
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
          employer_notes: string | null
          id: string
          job_listing_id: string
          rejected_at: string | null
          resume_url: string | null
          seeker_profile_id: string | null
          shortlisted_at: string | null
          status: string
          updated_at: string
          user_id: string
          viewed_at: string | null
        }
        Insert: {
          applicant_email?: string | null
          applicant_name?: string | null
          applicant_phone?: string | null
          cover_note?: string | null
          created_at?: string
          employer_notes?: string | null
          id?: string
          job_listing_id: string
          rejected_at?: string | null
          resume_url?: string | null
          seeker_profile_id?: string | null
          shortlisted_at?: string | null
          status?: string
          updated_at?: string
          user_id: string
          viewed_at?: string | null
        }
        Update: {
          applicant_email?: string | null
          applicant_name?: string | null
          applicant_phone?: string | null
          cover_note?: string | null
          created_at?: string
          employer_notes?: string | null
          id?: string
          job_listing_id?: string
          rejected_at?: string | null
          resume_url?: string | null
          seeker_profile_id?: string | null
          shortlisted_at?: string | null
          status?: string
          updated_at?: string
          user_id?: string
          viewed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "job_applications_job_listing_id_fkey"
            columns: ["job_listing_id"]
            isOneToOne: false
            referencedRelation: "job_listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_applications_seeker_profile_id_fkey"
            columns: ["seeker_profile_id"]
            isOneToOne: false
            referencedRelation: "job_seeker_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      job_listings: {
        Row: {
          agency_name: string | null
          ai_match_tags: string[] | null
          application_deadline: string | null
          apply_email: string | null
          apply_url: string | null
          created_at: string | null
          department: string | null
          description: string | null
          experience_years_min: number | null
          expires_at: string | null
          government_body: string | null
          id: string
          is_active: boolean | null
          is_approved: boolean | null
          is_direct_employer: boolean | null
          is_government: boolean | null
          is_verified_employer: boolean | null
          job_title: string
          job_type: string | null
          location_city: string | null
          location_state: string | null
          organization_name: string
          organization_type: string | null
          posted_by: string | null
          poster_type: string | null
          requirements: string | null
          salary_max: number | null
          salary_min: number | null
          source: string | null
          source_url: string | null
          specialization: string | null
          vacancies: number | null
          verification_level: number | null
        }
        Insert: {
          agency_name?: string | null
          ai_match_tags?: string[] | null
          application_deadline?: string | null
          apply_email?: string | null
          apply_url?: string | null
          created_at?: string | null
          department?: string | null
          description?: string | null
          experience_years_min?: number | null
          expires_at?: string | null
          government_body?: string | null
          id?: string
          is_active?: boolean | null
          is_approved?: boolean | null
          is_direct_employer?: boolean | null
          is_government?: boolean | null
          is_verified_employer?: boolean | null
          job_title: string
          job_type?: string | null
          location_city?: string | null
          location_state?: string | null
          organization_name: string
          organization_type?: string | null
          posted_by?: string | null
          poster_type?: string | null
          requirements?: string | null
          salary_max?: number | null
          salary_min?: number | null
          source?: string | null
          source_url?: string | null
          specialization?: string | null
          vacancies?: number | null
          verification_level?: number | null
        }
        Update: {
          agency_name?: string | null
          ai_match_tags?: string[] | null
          application_deadline?: string | null
          apply_email?: string | null
          apply_url?: string | null
          created_at?: string | null
          department?: string | null
          description?: string | null
          experience_years_min?: number | null
          expires_at?: string | null
          government_body?: string | null
          id?: string
          is_active?: boolean | null
          is_approved?: boolean | null
          is_direct_employer?: boolean | null
          is_government?: boolean | null
          is_verified_employer?: boolean | null
          job_title?: string
          job_type?: string | null
          location_city?: string | null
          location_state?: string | null
          organization_name?: string
          organization_type?: string | null
          posted_by?: string | null
          poster_type?: string | null
          requirements?: string | null
          salary_max?: number | null
          salary_min?: number | null
          source?: string | null
          source_url?: string | null
          specialization?: string | null
          vacancies?: number | null
          verification_level?: number | null
        }
        Relationships: []
      }
      job_profile_views: {
        Row: {
          id: string
          seeker_user_id: string
          view_date: string
          viewed_at: string
          viewer_organization: string | null
          viewer_user_id: string
        }
        Insert: {
          id?: string
          seeker_user_id: string
          view_date?: string
          viewed_at?: string
          viewer_organization?: string | null
          viewer_user_id: string
        }
        Update: {
          id?: string
          seeker_user_id?: string
          view_date?: string
          viewed_at?: string
          viewer_organization?: string | null
          viewer_user_id?: string
        }
        Relationships: []
      }
      job_saved_searches: {
        Row: {
          created_at: string
          filters: Json
          id: string
          last_viewed_at: string | null
          name: string
          result_count: number | null
          user_id: string
        }
        Insert: {
          created_at?: string
          filters?: Json
          id?: string
          last_viewed_at?: string | null
          name: string
          result_count?: number | null
          user_id: string
        }
        Update: {
          created_at?: string
          filters?: Json
          id?: string
          last_viewed_at?: string | null
          name?: string
          result_count?: number | null
          user_id?: string
        }
        Relationships: []
      }
      job_seeker_profiles: {
        Row: {
          additional_qualifications: string[] | null
          avatar_url: string | null
          college: string | null
          created_at: string
          current_designation: string | null
          current_organization: string | null
          date_of_birth: string | null
          degree: string
          department: string | null
          email: string | null
          expected_salary_max: number | null
          expected_salary_min: number | null
          experience_years: number | null
          full_name: string
          gender: string | null
          graduation_year: number | null
          headline: string | null
          id: string
          is_actively_looking: boolean | null
          last_active_at: string | null
          notice_period: string | null
          phone: string | null
          preferred_cities: string[] | null
          preferred_job_type: string | null
          preferred_states: string[] | null
          profile_completeness: number | null
          registration_council: string | null
          registration_number: string | null
          resume_filename: string | null
          resume_updated_at: string | null
          resume_url: string | null
          skills: string[] | null
          university: string | null
          updated_at: string
          user_id: string
          visibility: string | null
          willing_to_relocate: boolean | null
        }
        Insert: {
          additional_qualifications?: string[] | null
          avatar_url?: string | null
          college?: string | null
          created_at?: string
          current_designation?: string | null
          current_organization?: string | null
          date_of_birth?: string | null
          degree: string
          department?: string | null
          email?: string | null
          expected_salary_max?: number | null
          expected_salary_min?: number | null
          experience_years?: number | null
          full_name: string
          gender?: string | null
          graduation_year?: number | null
          headline?: string | null
          id?: string
          is_actively_looking?: boolean | null
          last_active_at?: string | null
          notice_period?: string | null
          phone?: string | null
          preferred_cities?: string[] | null
          preferred_job_type?: string | null
          preferred_states?: string[] | null
          profile_completeness?: number | null
          registration_council?: string | null
          registration_number?: string | null
          resume_filename?: string | null
          resume_updated_at?: string | null
          resume_url?: string | null
          skills?: string[] | null
          university?: string | null
          updated_at?: string
          user_id: string
          visibility?: string | null
          willing_to_relocate?: boolean | null
        }
        Update: {
          additional_qualifications?: string[] | null
          avatar_url?: string | null
          college?: string | null
          created_at?: string
          current_designation?: string | null
          current_organization?: string | null
          date_of_birth?: string | null
          degree?: string
          department?: string | null
          email?: string | null
          expected_salary_max?: number | null
          expected_salary_min?: number | null
          experience_years?: number | null
          full_name?: string
          gender?: string | null
          graduation_year?: number | null
          headline?: string | null
          id?: string
          is_actively_looking?: boolean | null
          last_active_at?: string | null
          notice_period?: string | null
          phone?: string | null
          preferred_cities?: string[] | null
          preferred_job_type?: string | null
          preferred_states?: string[] | null
          profile_completeness?: number | null
          registration_council?: string | null
          registration_number?: string | null
          resume_filename?: string | null
          resume_updated_at?: string | null
          resume_url?: string | null
          skills?: string[] | null
          university?: string | null
          updated_at?: string
          user_id?: string
          visibility?: string | null
          willing_to_relocate?: boolean | null
        }
        Relationships: []
      }
      mcp_tool_invocations: {
        Row: {
          ai_client: string | null
          api_key_id: string | null
          clinic_id: string | null
          created_at: string | null
          error_message: string | null
          execution_time_ms: number | null
          id: string
          input_params: Json | null
          ip_address: string | null
          model_name: string | null
          output_result: Json | null
          session_id: string | null
          status: string | null
          tool_category: string | null
          tool_name: string
          user_id: string | null
        }
        Insert: {
          ai_client?: string | null
          api_key_id?: string | null
          clinic_id?: string | null
          created_at?: string | null
          error_message?: string | null
          execution_time_ms?: number | null
          id?: string
          input_params?: Json | null
          ip_address?: string | null
          model_name?: string | null
          output_result?: Json | null
          session_id?: string | null
          status?: string | null
          tool_category?: string | null
          tool_name: string
          user_id?: string | null
        }
        Update: {
          ai_client?: string | null
          api_key_id?: string | null
          clinic_id?: string | null
          created_at?: string | null
          error_message?: string | null
          execution_time_ms?: number | null
          id?: string
          input_params?: Json | null
          ip_address?: string | null
          model_name?: string | null
          output_result?: Json | null
          session_id?: string | null
          status?: string | null
          tool_category?: string | null
          tool_name?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mcp_tool_invocations_api_key_id_fkey"
            columns: ["api_key_id"]
            isOneToOne: false
            referencedRelation: "developer_api_keys"
            referencedColumns: ["id"]
          },
        ]
      }
      medassist_messages: {
        Row: {
          action_data: Json | null
          content: string
          content_type: string | null
          created_at: string | null
          id: string
          latency_ms: number | null
          model_used: string | null
          patient_context_used: boolean | null
          quick_replies: Json | null
          records_referenced: Json | null
          role: string
          session_id: string
          tokens_input: number | null
          tokens_output: number | null
        }
        Insert: {
          action_data?: Json | null
          content: string
          content_type?: string | null
          created_at?: string | null
          id?: string
          latency_ms?: number | null
          model_used?: string | null
          patient_context_used?: boolean | null
          quick_replies?: Json | null
          records_referenced?: Json | null
          role: string
          session_id: string
          tokens_input?: number | null
          tokens_output?: number | null
        }
        Update: {
          action_data?: Json | null
          content?: string
          content_type?: string | null
          created_at?: string | null
          id?: string
          latency_ms?: number | null
          model_used?: string | null
          patient_context_used?: boolean | null
          quick_replies?: Json | null
          records_referenced?: Json | null
          role?: string
          session_id?: string
          tokens_input?: number | null
          tokens_output?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "medassist_messages_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "medassist_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      medassist_sessions: {
        Row: {
          appointment_booked_id: string | null
          created_at: string | null
          duration_seconds: number | null
          ended_at: string | null
          escalated_doctor_id: string | null
          escalated_to: string | null
          id: string
          language: string | null
          message_count: number | null
          patient_id: string
          resolved_action: string | null
          satisfaction_rating: number | null
          session_type: string | null
          started_at: string | null
          status: string | null
          symptom_summary: string | null
          triage_level: string | null
        }
        Insert: {
          appointment_booked_id?: string | null
          created_at?: string | null
          duration_seconds?: number | null
          ended_at?: string | null
          escalated_doctor_id?: string | null
          escalated_to?: string | null
          id?: string
          language?: string | null
          message_count?: number | null
          patient_id: string
          resolved_action?: string | null
          satisfaction_rating?: number | null
          session_type?: string | null
          started_at?: string | null
          status?: string | null
          symptom_summary?: string | null
          triage_level?: string | null
        }
        Update: {
          appointment_booked_id?: string | null
          created_at?: string | null
          duration_seconds?: number | null
          ended_at?: string | null
          escalated_doctor_id?: string | null
          escalated_to?: string | null
          id?: string
          language?: string | null
          message_count?: number | null
          patient_id?: string
          resolved_action?: string | null
          satisfaction_rating?: number | null
          session_type?: string | null
          started_at?: string | null
          status?: string | null
          symptom_summary?: string | null
          triage_level?: string | null
        }
        Relationships: []
      }
      medicine_adherence_logs: {
        Row: {
          created_at: string | null
          id: string
          log_date: string
          medicine_id: string
          notes: string | null
          taken: boolean | null
          taken_at: string | null
          time_slot: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          log_date?: string
          medicine_id: string
          notes?: string | null
          taken?: boolean | null
          taken_at?: string | null
          time_slot: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          log_date?: string
          medicine_id?: string
          notes?: string | null
          taken?: boolean | null
          taken_at?: string | null
          time_slot?: string
          user_id?: string
        }
        Relationships: []
      }
      medicine_subscriptions: {
        Row: {
          auto_renew: boolean | null
          created_at: string | null
          delivery_address: Json | null
          discount_percentage: number | null
          frequency_days: number
          id: string
          last_delivered_at: string | null
          medicines: Json
          next_delivery_date: string
          notes: string | null
          patient_id: string
          payment_method: string | null
          plan_name: string
          prescribed_by_doctor_id: string | null
          started_at: string | null
          status: string
          total_deliveries: number | null
          total_monthly_value: number | null
          updated_at: string | null
        }
        Insert: {
          auto_renew?: boolean | null
          created_at?: string | null
          delivery_address?: Json | null
          discount_percentage?: number | null
          frequency_days?: number
          id?: string
          last_delivered_at?: string | null
          medicines?: Json
          next_delivery_date: string
          notes?: string | null
          patient_id: string
          payment_method?: string | null
          plan_name?: string
          prescribed_by_doctor_id?: string | null
          started_at?: string | null
          status?: string
          total_deliveries?: number | null
          total_monthly_value?: number | null
          updated_at?: string | null
        }
        Update: {
          auto_renew?: boolean | null
          created_at?: string | null
          delivery_address?: Json | null
          discount_percentage?: number | null
          frequency_days?: number
          id?: string
          last_delivered_at?: string | null
          medicines?: Json
          next_delivery_date?: string
          notes?: string | null
          patient_id?: string
          payment_method?: string | null
          plan_name?: string
          prescribed_by_doctor_id?: string | null
          started_at?: string | null
          status?: string
          total_deliveries?: number | null
          total_monthly_value?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      mentorship_messages: {
        Row: {
          content: string
          created_at: string | null
          id: string
          request_id: string
          sender_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          request_id: string
          sender_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          request_id?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "mentorship_messages_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "mentorship_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      mentorship_requests: {
        Row: {
          created_at: string | null
          id: string
          mentee_name: string
          mentee_user_id: string
          mentor_id: string
          message: string
          status: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          mentee_name: string
          mentee_user_id: string
          mentor_id: string
          message: string
          status?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          mentee_name?: string
          mentee_user_id?: string
          mentor_id?: string
          message?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mentorship_requests_mentor_id_fkey"
            columns: ["mentor_id"]
            isOneToOne: false
            referencedRelation: "student_mentors"
            referencedColumns: ["id"]
          },
        ]
      }
      mis_daily_collection: {
        Row: {
          amount: number
          bill_count: number
          collected_by: string | null
          collected_by_name: string | null
          collection_date: string
          created_at: string | null
          department: string
          discount_total: number | null
          id: string
          location: string
          net_amount: number
          notes: string | null
          payment_mode: string
          tax_total: number | null
          updated_at: string | null
        }
        Insert: {
          amount?: number
          bill_count?: number
          collected_by?: string | null
          collected_by_name?: string | null
          collection_date: string
          created_at?: string | null
          department?: string
          discount_total?: number | null
          id?: string
          location?: string
          net_amount?: number
          notes?: string | null
          payment_mode?: string
          tax_total?: number | null
          updated_at?: string | null
        }
        Update: {
          amount?: number
          bill_count?: number
          collected_by?: string | null
          collected_by_name?: string | null
          collection_date?: string
          created_at?: string | null
          department?: string
          discount_total?: number | null
          id?: string
          location?: string
          net_amount?: number
          notes?: string | null
          payment_mode?: string
          tax_total?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      mis_eod_reports: {
        Row: {
          ai_summary: string | null
          avg_waiting_time_min: number | null
          cancelled_appointments: number | null
          cash_collection: number | null
          created_at: string | null
          credit_given: number | null
          credit_recovered: number | null
          detailed_json: Json | null
          digital_collection: number | null
          generated_by: string | null
          id: string
          items_below_reorder: number | null
          items_expiring_30d: number | null
          lab_avg_tat_hrs: number | null
          lab_completed_count: number | null
          lab_orders_count: number | null
          lab_pending_count: number | null
          location: string
          new_patients: number | null
          no_show_count: number | null
          refunds: number | null
          repeat_patients: number | null
          report_date: string
          staff_absent: number | null
          staff_present: number | null
          status: string | null
          stock_value: number | null
          submitted_at: string | null
          total_appointments: number | null
          total_collection: number | null
          total_ip_admissions: number | null
          total_ip_discharges: number | null
          total_opd_visits: number | null
          updated_at: string | null
        }
        Insert: {
          ai_summary?: string | null
          avg_waiting_time_min?: number | null
          cancelled_appointments?: number | null
          cash_collection?: number | null
          created_at?: string | null
          credit_given?: number | null
          credit_recovered?: number | null
          detailed_json?: Json | null
          digital_collection?: number | null
          generated_by?: string | null
          id?: string
          items_below_reorder?: number | null
          items_expiring_30d?: number | null
          lab_avg_tat_hrs?: number | null
          lab_completed_count?: number | null
          lab_orders_count?: number | null
          lab_pending_count?: number | null
          location?: string
          new_patients?: number | null
          no_show_count?: number | null
          refunds?: number | null
          repeat_patients?: number | null
          report_date: string
          staff_absent?: number | null
          staff_present?: number | null
          status?: string | null
          stock_value?: number | null
          submitted_at?: string | null
          total_appointments?: number | null
          total_collection?: number | null
          total_ip_admissions?: number | null
          total_ip_discharges?: number | null
          total_opd_visits?: number | null
          updated_at?: string | null
        }
        Update: {
          ai_summary?: string | null
          avg_waiting_time_min?: number | null
          cancelled_appointments?: number | null
          cash_collection?: number | null
          created_at?: string | null
          credit_given?: number | null
          credit_recovered?: number | null
          detailed_json?: Json | null
          digital_collection?: number | null
          generated_by?: string | null
          id?: string
          items_below_reorder?: number | null
          items_expiring_30d?: number | null
          lab_avg_tat_hrs?: number | null
          lab_completed_count?: number | null
          lab_orders_count?: number | null
          lab_pending_count?: number | null
          location?: string
          new_patients?: number | null
          no_show_count?: number | null
          refunds?: number | null
          repeat_patients?: number | null
          report_date?: string
          staff_absent?: number | null
          staff_present?: number | null
          status?: string | null
          stock_value?: number | null
          submitted_at?: string | null
          total_appointments?: number | null
          total_collection?: number | null
          total_ip_admissions?: number | null
          total_ip_discharges?: number | null
          total_opd_visits?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      mis_org_members: {
        Row: {
          created_at: string | null
          department: string
          email: string | null
          id: string
          is_active: boolean | null
          name: string
          org_level: number | null
          phone: string | null
          report_access: Json | null
          reports_to: string | null
          role: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          department?: string
          email?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          org_level?: number | null
          phone?: string | null
          report_access?: Json | null
          reports_to?: string | null
          role: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          department?: string
          email?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          org_level?: number | null
          phone?: string | null
          report_access?: Json | null
          reports_to?: string | null
          role?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mis_org_members_reports_to_fkey"
            columns: ["reports_to"]
            isOneToOne: false
            referencedRelation: "mis_org_members"
            referencedColumns: ["id"]
          },
        ]
      }
      mis_scheduled_reports: {
        Row: {
          created_at: string | null
          day_of_month: number | null
          day_of_week: string | null
          frequency: string
          id: string
          include_ai_summary: boolean | null
          include_charts: boolean | null
          is_active: boolean | null
          last_sent_at: string | null
          name: string
          next_send_at: string | null
          owner_id: string
          recipients: Json
          reports: Json
          send_time: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          day_of_month?: number | null
          day_of_week?: string | null
          frequency?: string
          id?: string
          include_ai_summary?: boolean | null
          include_charts?: boolean | null
          is_active?: boolean | null
          last_sent_at?: string | null
          name: string
          next_send_at?: string | null
          owner_id: string
          recipients?: Json
          reports?: Json
          send_time?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          day_of_month?: number | null
          day_of_week?: string | null
          frequency?: string
          id?: string
          include_ai_summary?: boolean | null
          include_charts?: boolean | null
          is_active?: boolean | null
          last_sent_at?: string | null
          name?: string
          next_send_at?: string | null
          owner_id?: string
          recipients?: Json
          reports?: Json
          send_time?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      opd_queue_entries: {
        Row: {
          appointment_id: string | null
          check_in_time: string
          consultation_end_time: string | null
          consultation_start_time: string | null
          created_at: string | null
          doctor_id: string
          id: string
          notes: string | null
          patient_id: string | null
          patient_name: string
          priority: string | null
          queue_date: string
          status: string
          token_number: string
          updated_at: string | null
          visit_type: string | null
        }
        Insert: {
          appointment_id?: string | null
          check_in_time?: string
          consultation_end_time?: string | null
          consultation_start_time?: string | null
          created_at?: string | null
          doctor_id: string
          id?: string
          notes?: string | null
          patient_id?: string | null
          patient_name: string
          priority?: string | null
          queue_date?: string
          status?: string
          token_number: string
          updated_at?: string | null
          visit_type?: string | null
        }
        Update: {
          appointment_id?: string | null
          check_in_time?: string
          consultation_end_time?: string | null
          consultation_start_time?: string | null
          created_at?: string | null
          doctor_id?: string
          id?: string
          notes?: string | null
          patient_id?: string | null
          patient_name?: string
          priority?: string | null
          queue_date?: string
          status?: string
          token_number?: string
          updated_at?: string | null
          visit_type?: string | null
        }
        Relationships: []
      }
      orders: {
        Row: {
          address: Json | null
          courier: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          idempotency_key: string | null
          items: Json | null
          notes: string | null
          order_status: string
          payment_method: string | null
          payment_status: string
          phone: string | null
          razorpay_order_id: string | null
          razorpay_payment_id: string | null
          total: number
          tracking_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          address?: Json | null
          courier?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          idempotency_key?: string | null
          items?: Json | null
          notes?: string | null
          order_status?: string
          payment_method?: string | null
          payment_status?: string
          phone?: string | null
          razorpay_order_id?: string | null
          razorpay_payment_id?: string | null
          total?: number
          tracking_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: Json | null
          courier?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          idempotency_key?: string | null
          items?: Json | null
          notes?: string | null
          order_status?: string
          payment_method?: string | null
          payment_status?: string
          phone?: string | null
          razorpay_order_id?: string | null
          razorpay_payment_id?: string | null
          total?: number
          tracking_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      parsed_lab_values: {
        Row: {
          created_at: string | null
          document_id: string
          id: string
          is_abnormal: boolean | null
          is_critical: boolean | null
          lab_name: string | null
          loinc_code: string | null
          method: string | null
          normal_range_max: number | null
          normal_range_min: number | null
          normal_range_text: string | null
          parameter_name: string
          patient_id: string
          sample_date: string | null
          snomed_code: string | null
          test_name: string
          unit: string | null
          value: number | null
          value_text: string | null
        }
        Insert: {
          created_at?: string | null
          document_id: string
          id?: string
          is_abnormal?: boolean | null
          is_critical?: boolean | null
          lab_name?: string | null
          loinc_code?: string | null
          method?: string | null
          normal_range_max?: number | null
          normal_range_min?: number | null
          normal_range_text?: string | null
          parameter_name: string
          patient_id: string
          sample_date?: string | null
          snomed_code?: string | null
          test_name: string
          unit?: string | null
          value?: number | null
          value_text?: string | null
        }
        Update: {
          created_at?: string | null
          document_id?: string
          id?: string
          is_abnormal?: boolean | null
          is_critical?: boolean | null
          lab_name?: string | null
          loinc_code?: string | null
          method?: string | null
          normal_range_max?: number | null
          normal_range_min?: number | null
          normal_range_text?: string | null
          parameter_name?: string
          patient_id?: string
          sample_date?: string | null
          snomed_code?: string | null
          test_name?: string
          unit?: string | null
          value?: number | null
          value_text?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "parsed_lab_values_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "parsed_medical_documents"
            referencedColumns: ["id"]
          },
        ]
      }
      parsed_medical_documents: {
        Row: {
          ai_model_used: string | null
          clinic_id: string | null
          confidence_score: number | null
          corrections: Json | null
          created_at: string | null
          document_date: string | null
          document_type: string | null
          error_message: string | null
          extracted_data: Json | null
          extracted_diagnoses: Json | null
          extracted_lab_values: Json | null
          extracted_medications: Json | null
          extracted_procedures: Json | null
          extracted_text: string | null
          extracted_vitals: Json | null
          file_size_bytes: number | null
          file_type: string | null
          file_url: string
          id: string
          issuing_doctor: string | null
          issuing_facility: string | null
          linked_to_appointment_id: string | null
          linked_to_folder_id: string | null
          metadata: Json | null
          original_file_name: string
          parse_completed_at: string | null
          parse_duration_ms: number | null
          parse_started_at: string | null
          parse_status: string | null
          patient_id: string
          tokens_used: number | null
          updated_at: string | null
          upload_source: string | null
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          ai_model_used?: string | null
          clinic_id?: string | null
          confidence_score?: number | null
          corrections?: Json | null
          created_at?: string | null
          document_date?: string | null
          document_type?: string | null
          error_message?: string | null
          extracted_data?: Json | null
          extracted_diagnoses?: Json | null
          extracted_lab_values?: Json | null
          extracted_medications?: Json | null
          extracted_procedures?: Json | null
          extracted_text?: string | null
          extracted_vitals?: Json | null
          file_size_bytes?: number | null
          file_type?: string | null
          file_url: string
          id?: string
          issuing_doctor?: string | null
          issuing_facility?: string | null
          linked_to_appointment_id?: string | null
          linked_to_folder_id?: string | null
          metadata?: Json | null
          original_file_name: string
          parse_completed_at?: string | null
          parse_duration_ms?: number | null
          parse_started_at?: string | null
          parse_status?: string | null
          patient_id: string
          tokens_used?: number | null
          updated_at?: string | null
          upload_source?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          ai_model_used?: string | null
          clinic_id?: string | null
          confidence_score?: number | null
          corrections?: Json | null
          created_at?: string | null
          document_date?: string | null
          document_type?: string | null
          error_message?: string | null
          extracted_data?: Json | null
          extracted_diagnoses?: Json | null
          extracted_lab_values?: Json | null
          extracted_medications?: Json | null
          extracted_procedures?: Json | null
          extracted_text?: string | null
          extracted_vitals?: Json | null
          file_size_bytes?: number | null
          file_type?: string | null
          file_url?: string
          id?: string
          issuing_doctor?: string | null
          issuing_facility?: string | null
          linked_to_appointment_id?: string | null
          linked_to_folder_id?: string | null
          metadata?: Json | null
          original_file_name?: string
          parse_completed_at?: string | null
          parse_duration_ms?: number | null
          parse_started_at?: string | null
          parse_status?: string | null
          patient_id?: string
          tokens_used?: number | null
          updated_at?: string | null
          upload_source?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: []
      }
      patient_allergies: {
        Row: {
          allergen: string
          allergy_type: string
          created_at: string | null
          id: string
          interacting_with: string | null
          is_active: boolean | null
          notes: string | null
          patient_id: string
          reaction: string | null
          reported_by: string | null
          reported_date: string | null
          severity: string
          updated_at: string | null
          verified: boolean | null
        }
        Insert: {
          allergen: string
          allergy_type: string
          created_at?: string | null
          id?: string
          interacting_with?: string | null
          is_active?: boolean | null
          notes?: string | null
          patient_id: string
          reaction?: string | null
          reported_by?: string | null
          reported_date?: string | null
          severity?: string
          updated_at?: string | null
          verified?: boolean | null
        }
        Update: {
          allergen?: string
          allergy_type?: string
          created_at?: string | null
          id?: string
          interacting_with?: string | null
          is_active?: boolean | null
          notes?: string | null
          patient_id?: string
          reaction?: string | null
          reported_by?: string | null
          reported_date?: string | null
          severity?: string
          updated_at?: string | null
          verified?: boolean | null
        }
        Relationships: []
      }
      patient_compliance_badges: {
        Row: {
          badge_description: string | null
          badge_name: string
          created_at: string | null
          earned: boolean | null
          earned_at: string | null
          id: string
          patient_id: string
          progress_current: number | null
          progress_target: number | null
        }
        Insert: {
          badge_description?: string | null
          badge_name: string
          created_at?: string | null
          earned?: boolean | null
          earned_at?: string | null
          id?: string
          patient_id: string
          progress_current?: number | null
          progress_target?: number | null
        }
        Update: {
          badge_description?: string | null
          badge_name?: string
          created_at?: string | null
          earned?: boolean | null
          earned_at?: string | null
          id?: string
          patient_id?: string
          progress_current?: number | null
          progress_target?: number | null
        }
        Relationships: []
      }
      patient_compliance_scores: {
        Row: {
          checked_in_by: string | null
          created_at: string | null
          diet_compliance: number | null
          followup_visits: number | null
          id: string
          lifestyle_changes: number | null
          medication_adherence: number | null
          notes: string | null
          overall_score: number
          patient_id: string
          score_date: string
          yoga_exercise: number | null
        }
        Insert: {
          checked_in_by?: string | null
          created_at?: string | null
          diet_compliance?: number | null
          followup_visits?: number | null
          id?: string
          lifestyle_changes?: number | null
          medication_adherence?: number | null
          notes?: string | null
          overall_score?: number
          patient_id: string
          score_date?: string
          yoga_exercise?: number | null
        }
        Update: {
          checked_in_by?: string | null
          created_at?: string | null
          diet_compliance?: number | null
          followup_visits?: number | null
          id?: string
          lifestyle_changes?: number | null
          medication_adherence?: number | null
          notes?: string | null
          overall_score?: number
          patient_id?: string
          score_date?: string
          yoga_exercise?: number | null
        }
        Relationships: []
      }
      patient_connected_devices: {
        Row: {
          access_token_hash: string | null
          battery_level: number | null
          brand: string | null
          connection_status: string | null
          created_at: string | null
          device_name: string
          device_type: string
          firmware_version: string | null
          id: string
          is_active: boolean | null
          last_sync_at: string | null
          model: string | null
          patient_id: string
          refresh_token_hash: string | null
          sync_frequency: string | null
          sync_source: string
          token_expires_at: string | null
          updated_at: string | null
        }
        Insert: {
          access_token_hash?: string | null
          battery_level?: number | null
          brand?: string | null
          connection_status?: string | null
          created_at?: string | null
          device_name: string
          device_type: string
          firmware_version?: string | null
          id?: string
          is_active?: boolean | null
          last_sync_at?: string | null
          model?: string | null
          patient_id: string
          refresh_token_hash?: string | null
          sync_frequency?: string | null
          sync_source: string
          token_expires_at?: string | null
          updated_at?: string | null
        }
        Update: {
          access_token_hash?: string | null
          battery_level?: number | null
          brand?: string | null
          connection_status?: string | null
          created_at?: string | null
          device_name?: string
          device_type?: string
          firmware_version?: string | null
          id?: string
          is_active?: boolean | null
          last_sync_at?: string | null
          model?: string | null
          patient_id?: string
          refresh_token_hash?: string | null
          sync_frequency?: string | null
          sync_source?: string
          token_expires_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      patient_critical_conditions: {
        Row: {
          condition_name: string
          created_at: string | null
          id: string
          is_active: boolean | null
          notes: string | null
          patient_id: string
          reported_date: string | null
        }
        Insert: {
          condition_name: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          notes?: string | null
          patient_id: string
          reported_date?: string | null
        }
        Update: {
          condition_name?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          notes?: string | null
          patient_id?: string
          reported_date?: string | null
        }
        Relationships: []
      }
      patient_duplicate_candidates: {
        Row: {
          created_at: string | null
          id: string
          match_criteria: Json | null
          match_score: number
          notes: string | null
          patient_a_id: string
          patient_b_id: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          match_criteria?: Json | null
          match_score?: number
          notes?: string | null
          patient_a_id: string
          patient_b_id: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
        }
        Update: {
          created_at?: string | null
          id?: string
          match_criteria?: Json | null
          match_score?: number
          notes?: string | null
          patient_a_id?: string
          patient_b_id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
        }
        Relationships: []
      }
      patient_health_documents: {
        Row: {
          ai_summary: string | null
          created_at: string | null
          document_date: string | null
          file_name: string
          file_size_bytes: number | null
          file_type: string | null
          file_url: string
          folder_id: string
          id: string
          is_verified: boolean | null
          ocr_text: string | null
          patient_id: string
          source: string | null
          source_clinic_name: string | null
          source_hms_id: string | null
          tags: string[] | null
        }
        Insert: {
          ai_summary?: string | null
          created_at?: string | null
          document_date?: string | null
          file_name: string
          file_size_bytes?: number | null
          file_type?: string | null
          file_url: string
          folder_id: string
          id?: string
          is_verified?: boolean | null
          ocr_text?: string | null
          patient_id: string
          source?: string | null
          source_clinic_name?: string | null
          source_hms_id?: string | null
          tags?: string[] | null
        }
        Update: {
          ai_summary?: string | null
          created_at?: string | null
          document_date?: string | null
          file_name?: string
          file_size_bytes?: number | null
          file_type?: string | null
          file_url?: string
          folder_id?: string
          id?: string
          is_verified?: boolean | null
          ocr_text?: string | null
          patient_id?: string
          source?: string | null
          source_clinic_name?: string | null
          source_hms_id?: string | null
          tags?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "patient_health_documents_folder_id_fkey"
            columns: ["folder_id"]
            isOneToOne: false
            referencedRelation: "patient_health_folders"
            referencedColumns: ["id"]
          },
        ]
      }
      patient_health_folders: {
        Row: {
          created_at: string | null
          description: string | null
          document_count: number | null
          folder_name: string
          folder_type: string | null
          id: string
          is_shared_with_doctor: boolean | null
          patient_id: string
          shared_doctor_ids: string[] | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          document_count?: number | null
          folder_name: string
          folder_type?: string | null
          id?: string
          is_shared_with_doctor?: boolean | null
          patient_id: string
          shared_doctor_ids?: string[] | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          document_count?: number | null
          folder_name?: string
          folder_type?: string | null
          id?: string
          is_shared_with_doctor?: boolean | null
          patient_id?: string
          shared_doctor_ids?: string[] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      patient_journey_stages: {
        Row: {
          ayush_name: string | null
          completed_date: string | null
          created_at: string | null
          detail: string | null
          doctor_id: string | null
          id: string
          patient_id: string
          plan_id: string | null
          scheduled_date: string | null
          stage_name: string
          stage_number: number
          status: string
          updated_at: string | null
        }
        Insert: {
          ayush_name?: string | null
          completed_date?: string | null
          created_at?: string | null
          detail?: string | null
          doctor_id?: string | null
          id?: string
          patient_id: string
          plan_id?: string | null
          scheduled_date?: string | null
          stage_name: string
          stage_number: number
          status?: string
          updated_at?: string | null
        }
        Update: {
          ayush_name?: string | null
          completed_date?: string | null
          created_at?: string | null
          detail?: string | null
          doctor_id?: string | null
          id?: string
          patient_id?: string
          plan_id?: string | null
          scheduled_date?: string | null
          stage_name?: string
          stage_number?: number
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "patient_journey_stages_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "patient_treatment_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      patient_merge_history: {
        Row: {
          id: string
          merge_reason: string | null
          merged_patient_id: string
          merged_patient_snapshot: Json
          performed_at: string | null
          performed_by: string
          primary_patient_id: string
          records_transferred: Json | null
          rollback_available: boolean | null
          rolled_back_at: string | null
          rolled_back_by: string | null
        }
        Insert: {
          id?: string
          merge_reason?: string | null
          merged_patient_id: string
          merged_patient_snapshot?: Json
          performed_at?: string | null
          performed_by: string
          primary_patient_id: string
          records_transferred?: Json | null
          rollback_available?: boolean | null
          rolled_back_at?: string | null
          rolled_back_by?: string | null
        }
        Update: {
          id?: string
          merge_reason?: string | null
          merged_patient_id?: string
          merged_patient_snapshot?: Json
          performed_at?: string | null
          performed_by?: string
          primary_patient_id?: string
          records_transferred?: Json | null
          rollback_available?: boolean | null
          rolled_back_at?: string | null
          rolled_back_by?: string | null
        }
        Relationships: []
      }
      patient_prescribed_medicines: {
        Row: {
          appointment_id: string | null
          created_at: string | null
          dosage: string
          end_date: string | null
          frequency: string
          id: string
          is_active: boolean | null
          name: string
          notes: string | null
          patient_id: string
          prescribed_by: string | null
          prescribed_by_doctor_id: string | null
          start_date: string
          time_slots: string[] | null
          updated_at: string | null
        }
        Insert: {
          appointment_id?: string | null
          created_at?: string | null
          dosage: string
          end_date?: string | null
          frequency?: string
          id?: string
          is_active?: boolean | null
          name: string
          notes?: string | null
          patient_id: string
          prescribed_by?: string | null
          prescribed_by_doctor_id?: string | null
          start_date?: string
          time_slots?: string[] | null
          updated_at?: string | null
        }
        Update: {
          appointment_id?: string | null
          created_at?: string | null
          dosage?: string
          end_date?: string | null
          frequency?: string
          id?: string
          is_active?: boolean | null
          name?: string
          notes?: string | null
          patient_id?: string
          prescribed_by?: string | null
          prescribed_by_doctor_id?: string | null
          start_date?: string
          time_slots?: string[] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      patient_record_access_requests: {
        Row: {
          consent_given: boolean | null
          consent_given_at: string | null
          created_at: string | null
          date_range_from: string | null
          date_range_to: string | null
          expires_at: string | null
          id: string
          patient_id: string
          purpose: string | null
          record_types: string[] | null
          requesting_clinic_id: string | null
          requesting_clinic_name: string | null
          requesting_doctor_id: string | null
          shared_records: Json | null
          source_clinic_id: string | null
          source_clinic_name: string | null
          status: string | null
        }
        Insert: {
          consent_given?: boolean | null
          consent_given_at?: string | null
          created_at?: string | null
          date_range_from?: string | null
          date_range_to?: string | null
          expires_at?: string | null
          id?: string
          patient_id: string
          purpose?: string | null
          record_types?: string[] | null
          requesting_clinic_id?: string | null
          requesting_clinic_name?: string | null
          requesting_doctor_id?: string | null
          shared_records?: Json | null
          source_clinic_id?: string | null
          source_clinic_name?: string | null
          status?: string | null
        }
        Update: {
          consent_given?: boolean | null
          consent_given_at?: string | null
          created_at?: string | null
          date_range_from?: string | null
          date_range_to?: string | null
          expires_at?: string | null
          id?: string
          patient_id?: string
          purpose?: string | null
          record_types?: string[] | null
          requesting_clinic_id?: string | null
          requesting_clinic_name?: string | null
          requesting_doctor_id?: string | null
          shared_records?: Json | null
          source_clinic_id?: string | null
          source_clinic_name?: string | null
          status?: string | null
        }
        Relationships: []
      }
      patient_reliability_scores: {
        Row: {
          attended_count: number | null
          cancelled_count: number | null
          id: string
          last_noshow_date: string | null
          late_arrival_count: number | null
          noshow_count: number | null
          patient_id: string
          reliability_score: number | null
          risk_level: string | null
          streak_attended: number | null
          total_appointments: number | null
          updated_at: string | null
        }
        Insert: {
          attended_count?: number | null
          cancelled_count?: number | null
          id?: string
          last_noshow_date?: string | null
          late_arrival_count?: number | null
          noshow_count?: number | null
          patient_id: string
          reliability_score?: number | null
          risk_level?: string | null
          streak_attended?: number | null
          total_appointments?: number | null
          updated_at?: string | null
        }
        Update: {
          attended_count?: number | null
          cancelled_count?: number | null
          id?: string
          last_noshow_date?: string | null
          late_arrival_count?: number | null
          noshow_count?: number | null
          patient_id?: string
          reliability_score?: number | null
          risk_level?: string | null
          streak_attended?: number | null
          total_appointments?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      patient_reviews: {
        Row: {
          appointment_id: string | null
          communication_rating: number | null
          consultation_type: string | null
          created_at: string | null
          doctor_id: string
          doctor_responded_at: string | null
          doctor_response: string | null
          helpful_count: number | null
          id: string
          is_anonymous: boolean | null
          moderated_by: string | null
          moderation_notes: string | null
          patient_id: string
          rating: number
          report_count: number | null
          review_text: string | null
          status: string
          title: string | null
          treatment_effectiveness: number | null
          updated_at: string | null
          wait_time_rating: number | null
          would_recommend: boolean | null
        }
        Insert: {
          appointment_id?: string | null
          communication_rating?: number | null
          consultation_type?: string | null
          created_at?: string | null
          doctor_id: string
          doctor_responded_at?: string | null
          doctor_response?: string | null
          helpful_count?: number | null
          id?: string
          is_anonymous?: boolean | null
          moderated_by?: string | null
          moderation_notes?: string | null
          patient_id: string
          rating: number
          report_count?: number | null
          review_text?: string | null
          status?: string
          title?: string | null
          treatment_effectiveness?: number | null
          updated_at?: string | null
          wait_time_rating?: number | null
          would_recommend?: boolean | null
        }
        Update: {
          appointment_id?: string | null
          communication_rating?: number | null
          consultation_type?: string | null
          created_at?: string | null
          doctor_id?: string
          doctor_responded_at?: string | null
          doctor_response?: string | null
          helpful_count?: number | null
          id?: string
          is_anonymous?: boolean | null
          moderated_by?: string | null
          moderation_notes?: string | null
          patient_id?: string
          rating?: number
          report_count?: number | null
          review_text?: string | null
          status?: string
          title?: string | null
          treatment_effectiveness?: number | null
          updated_at?: string | null
          wait_time_rating?: number | null
          would_recommend?: boolean | null
        }
        Relationships: []
      }
      patient_risk_assessments: {
        Row: {
          ai_recommendations: Json | null
          assessed_by: string | null
          assessment_date: string
          categories: Json
          created_at: string | null
          id: string
          notes: string | null
          overall_score: number
          patient_id: string
          risk_level: string | null
        }
        Insert: {
          ai_recommendations?: Json | null
          assessed_by?: string | null
          assessment_date?: string
          categories?: Json
          created_at?: string | null
          id?: string
          notes?: string | null
          overall_score?: number
          patient_id: string
          risk_level?: string | null
        }
        Update: {
          ai_recommendations?: Json | null
          assessed_by?: string | null
          assessment_date?: string
          categories?: Json
          created_at?: string | null
          id?: string
          notes?: string | null
          overall_score?: number
          patient_id?: string
          risk_level?: string | null
        }
        Relationships: []
      }
      patient_timeline_events: {
        Row: {
          appointment_id: string | null
          created_at: string | null
          created_by: string | null
          detail: string | null
          doctor_id: string | null
          doctor_name: string | null
          event_date: string
          event_time: string | null
          event_type: string
          id: string
          metadata: Json | null
          patient_id: string
          title: string
        }
        Insert: {
          appointment_id?: string | null
          created_at?: string | null
          created_by?: string | null
          detail?: string | null
          doctor_id?: string | null
          doctor_name?: string | null
          event_date: string
          event_time?: string | null
          event_type: string
          id?: string
          metadata?: Json | null
          patient_id: string
          title: string
        }
        Update: {
          appointment_id?: string | null
          created_at?: string | null
          created_by?: string | null
          detail?: string | null
          doctor_id?: string | null
          doctor_name?: string | null
          event_date?: string
          event_time?: string | null
          event_type?: string
          id?: string
          metadata?: Json | null
          patient_id?: string
          title?: string
        }
        Relationships: []
      }
      patient_treatment_plan_days: {
        Row: {
          activity: string
          completed_at: string | null
          created_at: string | null
          day_number: number
          id: string
          notes: string | null
          phase: string
          plan_id: string
          status: string | null
        }
        Insert: {
          activity: string
          completed_at?: string | null
          created_at?: string | null
          day_number: number
          id?: string
          notes?: string | null
          phase: string
          plan_id: string
          status?: string | null
        }
        Update: {
          activity?: string
          completed_at?: string | null
          created_at?: string | null
          day_number?: number
          id?: string
          notes?: string | null
          phase?: string
          plan_id?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "patient_treatment_plan_days_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "patient_treatment_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      patient_treatment_plans: {
        Row: {
          condition: string | null
          created_at: string | null
          current_day: number | null
          doctor_id: string | null
          doctor_name: string | null
          end_date: string | null
          id: string
          notes: string | null
          patient_id: string
          start_date: string
          status: string | null
          title: string
          total_days: number
          updated_at: string | null
        }
        Insert: {
          condition?: string | null
          created_at?: string | null
          current_day?: number | null
          doctor_id?: string | null
          doctor_name?: string | null
          end_date?: string | null
          id?: string
          notes?: string | null
          patient_id: string
          start_date: string
          status?: string | null
          title: string
          total_days?: number
          updated_at?: string | null
        }
        Update: {
          condition?: string | null
          created_at?: string | null
          current_day?: number | null
          doctor_id?: string | null
          doctor_name?: string | null
          end_date?: string | null
          id?: string
          notes?: string | null
          patient_id?: string
          start_date?: string
          status?: string | null
          title?: string
          total_days?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      patient_vitals_readings: {
        Row: {
          ai_flag: string | null
          ai_recommendation: string | null
          alert_sent: boolean | null
          alert_sent_to: string | null
          created_at: string | null
          device_id: string | null
          id: string
          is_abnormal: boolean | null
          is_critical: boolean | null
          measurement_context: string | null
          patient_id: string
          recorded_at: string
          source: string | null
          sync_source: string | null
          synced_at: string | null
          unit: string
          value_primary: number
          value_secondary: number | null
          vital_type: string
        }
        Insert: {
          ai_flag?: string | null
          ai_recommendation?: string | null
          alert_sent?: boolean | null
          alert_sent_to?: string | null
          created_at?: string | null
          device_id?: string | null
          id?: string
          is_abnormal?: boolean | null
          is_critical?: boolean | null
          measurement_context?: string | null
          patient_id: string
          recorded_at?: string
          source?: string | null
          sync_source?: string | null
          synced_at?: string | null
          unit: string
          value_primary: number
          value_secondary?: number | null
          vital_type: string
        }
        Update: {
          ai_flag?: string | null
          ai_recommendation?: string | null
          alert_sent?: boolean | null
          alert_sent_to?: string | null
          created_at?: string | null
          device_id?: string | null
          id?: string
          is_abnormal?: boolean | null
          is_critical?: boolean | null
          measurement_context?: string | null
          patient_id?: string
          recorded_at?: string
          source?: string | null
          sync_source?: string | null
          synced_at?: string | null
          unit?: string
          value_primary?: number
          value_secondary?: number | null
          vital_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "patient_vitals_readings_device_id_fkey"
            columns: ["device_id"]
            isOneToOne: false
            referencedRelation: "patient_connected_devices"
            referencedColumns: ["id"]
          },
        ]
      }
      pk_patient_packages: {
        Row: {
          amount_paid: number | null
          amount_total: number | null
          completed_sessions: number | null
          created_at: string | null
          doctor_id: string | null
          doctor_name: string | null
          end_date: string | null
          id: string
          location: string | null
          notes: string | null
          package_id: string | null
          package_name: string
          patient_id: string | null
          patient_name: string
          start_date: string
          status: string | null
          total_sessions: number
          updated_at: string | null
        }
        Insert: {
          amount_paid?: number | null
          amount_total?: number | null
          completed_sessions?: number | null
          created_at?: string | null
          doctor_id?: string | null
          doctor_name?: string | null
          end_date?: string | null
          id?: string
          location?: string | null
          notes?: string | null
          package_id?: string | null
          package_name: string
          patient_id?: string | null
          patient_name: string
          start_date: string
          status?: string | null
          total_sessions?: number
          updated_at?: string | null
        }
        Update: {
          amount_paid?: number | null
          amount_total?: number | null
          completed_sessions?: number | null
          created_at?: string | null
          doctor_id?: string | null
          doctor_name?: string | null
          end_date?: string | null
          id?: string
          location?: string | null
          notes?: string | null
          package_id?: string | null
          package_name?: string
          patient_id?: string | null
          patient_name?: string
          start_date?: string
          status?: string | null
          total_sessions?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pk_patient_packages_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "pk_therapy_packages"
            referencedColumns: ["id"]
          },
        ]
      }
      pk_therapy_packages: {
        Row: {
          contraindications: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          duration_days: number
          duration_label: string
          id: string
          indications: string | null
          is_active: boolean | null
          name: string
          post_care_instructions: string | null
          pre_care_instructions: string | null
          price: number
          sessions_per_day: number | null
          therapies: Json
          total_sessions: number
          updated_at: string | null
        }
        Insert: {
          contraindications?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          duration_days?: number
          duration_label?: string
          id?: string
          indications?: string | null
          is_active?: boolean | null
          name: string
          post_care_instructions?: string | null
          pre_care_instructions?: string | null
          price?: number
          sessions_per_day?: number | null
          therapies?: Json
          total_sessions?: number
          updated_at?: string | null
        }
        Update: {
          contraindications?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          duration_days?: number
          duration_label?: string
          id?: string
          indications?: string | null
          is_active?: boolean | null
          name?: string
          post_care_instructions?: string | null
          pre_care_instructions?: string | null
          price?: number
          sessions_per_day?: number | null
          therapies?: Json
          total_sessions?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      pk_therapy_sessions: {
        Row: {
          checklist: Json | null
          completed_at: string | null
          created_at: string | null
          created_by: string | null
          doctor_notes: string | null
          duration_minutes: number | null
          id: string
          location: string | null
          materials: Json | null
          oil_quantity: string | null
          oil_used: string | null
          patient_id: string | null
          patient_name: string
          patient_package_id: string | null
          reaction_notes: string | null
          room: string | null
          session_date: string
          started_at: string | null
          status: string | null
          therapist_id: string | null
          therapist_name: string | null
          therapist_notes: string | null
          therapy_name: string
          time_slot: string | null
          updated_at: string | null
          vitals_bp: string | null
          vitals_pulse: string | null
        }
        Insert: {
          checklist?: Json | null
          completed_at?: string | null
          created_at?: string | null
          created_by?: string | null
          doctor_notes?: string | null
          duration_minutes?: number | null
          id?: string
          location?: string | null
          materials?: Json | null
          oil_quantity?: string | null
          oil_used?: string | null
          patient_id?: string | null
          patient_name: string
          patient_package_id?: string | null
          reaction_notes?: string | null
          room?: string | null
          session_date?: string
          started_at?: string | null
          status?: string | null
          therapist_id?: string | null
          therapist_name?: string | null
          therapist_notes?: string | null
          therapy_name: string
          time_slot?: string | null
          updated_at?: string | null
          vitals_bp?: string | null
          vitals_pulse?: string | null
        }
        Update: {
          checklist?: Json | null
          completed_at?: string | null
          created_at?: string | null
          created_by?: string | null
          doctor_notes?: string | null
          duration_minutes?: number | null
          id?: string
          location?: string | null
          materials?: Json | null
          oil_quantity?: string | null
          oil_used?: string | null
          patient_id?: string | null
          patient_name?: string
          patient_package_id?: string | null
          reaction_notes?: string | null
          room?: string | null
          session_date?: string
          started_at?: string | null
          status?: string | null
          therapist_id?: string | null
          therapist_name?: string | null
          therapist_notes?: string | null
          therapy_name?: string
          time_slot?: string | null
          updated_at?: string | null
          vitals_bp?: string | null
          vitals_pulse?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pk_therapy_sessions_patient_package_id_fkey"
            columns: ["patient_package_id"]
            isOneToOne: false
            referencedRelation: "pk_patient_packages"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_audit_log: {
        Row: {
          action_type: string
          actor_email: string | null
          actor_role: string | null
          actor_user_id: string | null
          created_at: string
          description: string
          id: string
          ip_address: string | null
          metadata: Json | null
          module: string
          new_values: Json | null
          old_values: Json | null
          resource_id: string | null
          resource_type: string | null
          severity: string
          user_agent: string | null
        }
        Insert: {
          action_type: string
          actor_email?: string | null
          actor_role?: string | null
          actor_user_id?: string | null
          created_at?: string
          description: string
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          module: string
          new_values?: Json | null
          old_values?: Json | null
          resource_id?: string | null
          resource_type?: string | null
          severity?: string
          user_agent?: string | null
        }
        Update: {
          action_type?: string
          actor_email?: string | null
          actor_role?: string | null
          actor_user_id?: string | null
          created_at?: string
          description?: string
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          module?: string
          new_values?: Json | null
          old_values?: Json | null
          resource_id?: string | null
          resource_type?: string | null
          severity?: string
          user_agent?: string | null
        }
        Relationships: []
      }
      platform_modules: {
        Row: {
          category: string
          created_at: string
          description: string | null
          display_name: string
          id: string
          module_key: string
          sort_order: number
        }
        Insert: {
          category?: string
          created_at?: string
          description?: string | null
          display_name: string
          id?: string
          module_key: string
          sort_order?: number
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          display_name?: string
          id?: string
          module_key?: string
          sort_order?: number
        }
        Relationships: []
      }
      platform_role_permissions: {
        Row: {
          can_approve: boolean
          can_create: boolean
          can_delete: boolean
          can_edit: boolean
          can_export: boolean
          can_view: boolean
          created_at: string
          id: string
          module_id: string
          role_id: string
          updated_at: string
        }
        Insert: {
          can_approve?: boolean
          can_create?: boolean
          can_delete?: boolean
          can_edit?: boolean
          can_export?: boolean
          can_view?: boolean
          created_at?: string
          id?: string
          module_id: string
          role_id: string
          updated_at?: string
        }
        Update: {
          can_approve?: boolean
          can_create?: boolean
          can_delete?: boolean
          can_edit?: boolean
          can_export?: boolean
          can_view?: boolean
          created_at?: string
          id?: string
          module_id?: string
          role_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "platform_role_permissions_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "platform_modules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "platform_role_permissions_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "platform_roles"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_roles: {
        Row: {
          created_at: string
          description: string | null
          display_name: string
          id: string
          is_system_role: boolean
          role_name: string
          tier_level: number
        }
        Insert: {
          created_at?: string
          description?: string | null
          display_name: string
          id?: string
          is_system_role?: boolean
          role_name: string
          tier_level?: number
        }
        Update: {
          created_at?: string
          description?: string | null
          display_name?: string
          id?: string
          is_system_role?: boolean
          role_name?: string
          tier_level?: number
        }
        Relationships: []
      }
      platform_support_tickets: {
        Row: {
          admin_response: string | null
          assigned_to: string | null
          assigned_to_name: string | null
          category: string
          created_at: string
          description: string
          id: string
          internal_notes: string | null
          priority: string
          resolution_summary: string | null
          resolved_at: string | null
          sla_breached: boolean
          sla_due_at: string | null
          status: string
          subject: string
          submitter_email: string | null
          submitter_name: string | null
          submitter_role: string
          submitter_user_id: string
          updated_at: string
        }
        Insert: {
          admin_response?: string | null
          assigned_to?: string | null
          assigned_to_name?: string | null
          category: string
          created_at?: string
          description: string
          id?: string
          internal_notes?: string | null
          priority?: string
          resolution_summary?: string | null
          resolved_at?: string | null
          sla_breached?: boolean
          sla_due_at?: string | null
          status?: string
          subject: string
          submitter_email?: string | null
          submitter_name?: string | null
          submitter_role: string
          submitter_user_id: string
          updated_at?: string
        }
        Update: {
          admin_response?: string | null
          assigned_to?: string | null
          assigned_to_name?: string | null
          category?: string
          created_at?: string
          description?: string
          id?: string
          internal_notes?: string | null
          priority?: string
          resolution_summary?: string | null
          resolved_at?: string | null
          sla_breached?: boolean
          sla_due_at?: string | null
          status?: string
          subject?: string
          submitter_email?: string | null
          submitter_name?: string | null
          submitter_role?: string
          submitter_user_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      platform_user_roles: {
        Row: {
          assigned_at: string
          assigned_by: string | null
          expires_at: string | null
          id: string
          is_active: boolean
          role_id: string
          scope_type: string | null
          scope_value: string | null
          user_id: string
        }
        Insert: {
          assigned_at?: string
          assigned_by?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean
          role_id: string
          scope_type?: string | null
          scope_value?: string | null
          user_id: string
        }
        Update: {
          assigned_at?: string
          assigned_by?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean
          role_id?: string
          scope_type?: string | null
          scope_value?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "platform_user_roles_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "platform_roles"
            referencedColumns: ["id"]
          },
        ]
      }
      product_requests: {
        Row: {
          admin_notes: string | null
          brand: string | null
          created_at: string | null
          fulfilled_product_id: string | null
          id: string
          notes: string | null
          product_name: string
          status: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          admin_notes?: string | null
          brand?: string | null
          created_at?: string | null
          fulfilled_product_id?: string | null
          id?: string
          notes?: string | null
          product_name: string
          status?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          admin_notes?: string | null
          brand?: string | null
          created_at?: string | null
          fulfilled_product_id?: string | null
          id?: string
          notes?: string | null
          product_name?: string
          status?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      products: {
        Row: {
          approval_status: string | null
          ayush_system: string | null
          category: string | null
          created_at: string | null
          description: string | null
          id: string
          image_url: string | null
          images: string[] | null
          is_active: boolean | null
          is_prescription_required: boolean | null
          manufacturer_id: string | null
          mrp: number | null
          name: string
          price: number
          seller_id: string | null
          slug: string | null
          stock: number | null
        }
        Insert: {
          approval_status?: string | null
          ayush_system?: string | null
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          images?: string[] | null
          is_active?: boolean | null
          is_prescription_required?: boolean | null
          manufacturer_id?: string | null
          mrp?: number | null
          name: string
          price?: number
          seller_id?: string | null
          slug?: string | null
          stock?: number | null
        }
        Update: {
          approval_status?: string | null
          ayush_system?: string | null
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          images?: string[] | null
          is_active?: boolean | null
          is_prescription_required?: boolean | null
          manufacturer_id?: string | null
          mrp?: number | null
          name?: string
          price?: number
          seller_id?: string | null
          slug?: string | null
          stock?: number | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          abha_id: string | null
          avatar_url: string | null
          ayuzee_patient_id: string | null
          blood_group: string | null
          city: string | null
          created_at: string | null
          date_of_birth: string | null
          email: string | null
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          full_name: string | null
          gender: string | null
          hms_branch_id: string | null
          hms_op_number: string | null
          hms_patient_linked: boolean | null
          id: string
          is_active: boolean | null
          patient_uhid: string | null
          phone: string | null
          pincode: string | null
          preferred_languages: string[] | null
          referral_code: string | null
          referred_by: string | null
          state: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          abha_id?: string | null
          avatar_url?: string | null
          ayuzee_patient_id?: string | null
          blood_group?: string | null
          city?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          email?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          full_name?: string | null
          gender?: string | null
          hms_branch_id?: string | null
          hms_op_number?: string | null
          hms_patient_linked?: boolean | null
          id?: string
          is_active?: boolean | null
          patient_uhid?: string | null
          phone?: string | null
          pincode?: string | null
          preferred_languages?: string[] | null
          referral_code?: string | null
          referred_by?: string | null
          state?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          abha_id?: string | null
          avatar_url?: string | null
          ayuzee_patient_id?: string | null
          blood_group?: string | null
          city?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          email?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          full_name?: string | null
          gender?: string | null
          hms_branch_id?: string | null
          hms_op_number?: string | null
          hms_patient_linked?: boolean | null
          id?: string
          is_active?: boolean | null
          patient_uhid?: string | null
          phone?: string | null
          pincode?: string | null
          preferred_languages?: string[] | null
          referral_code?: string | null
          referred_by?: string | null
          state?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_hms_branch_id_fkey"
            columns: ["hms_branch_id"]
            isOneToOne: false
            referencedRelation: "hms_branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_hms_branch_id_fkey"
            columns: ["hms_branch_id"]
            isOneToOne: false
            referencedRelation: "hrms_v_branch_workforce"
            referencedColumns: ["branch_id"]
          },
        ]
      }
      question_bank: {
        Row: {
          correct_option: string
          created_at: string | null
          created_by: string
          difficulty: string
          explanation: string | null
          id: string
          option_a: string
          option_b: string
          option_c: string
          option_d: string
          question: string
          reference_text: string | null
          review_note: string | null
          reviewed_by: string | null
          status: string
          subject: string
          tags: string[] | null
          topic: string
          updated_at: string | null
          used_count: number | null
        }
        Insert: {
          correct_option: string
          created_at?: string | null
          created_by: string
          difficulty?: string
          explanation?: string | null
          id?: string
          option_a: string
          option_b: string
          option_c: string
          option_d: string
          question: string
          reference_text?: string | null
          review_note?: string | null
          reviewed_by?: string | null
          status?: string
          subject: string
          tags?: string[] | null
          topic?: string
          updated_at?: string | null
          used_count?: number | null
        }
        Update: {
          correct_option?: string
          created_at?: string | null
          created_by?: string
          difficulty?: string
          explanation?: string | null
          id?: string
          option_a?: string
          option_b?: string
          option_c?: string
          option_d?: string
          question?: string
          reference_text?: string | null
          review_note?: string | null
          reviewed_by?: string | null
          status?: string
          subject?: string
          tags?: string[] | null
          topic?: string
          updated_at?: string | null
          used_count?: number | null
        }
        Relationships: []
      }
      quiz_competitions: {
        Row: {
          created_at: string | null
          created_by: string
          description: string | null
          difficulty: string
          ends_at: string
          id: string
          max_participants: number | null
          questions: Json
          starts_at: string
          status: string
          subject: string
          time_limit_seconds: number
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by: string
          description?: string | null
          difficulty?: string
          ends_at: string
          id?: string
          max_participants?: number | null
          questions?: Json
          starts_at: string
          status?: string
          subject?: string
          time_limit_seconds?: number
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string
          description?: string | null
          difficulty?: string
          ends_at?: string
          id?: string
          max_participants?: number | null
          questions?: Json
          starts_at?: string
          status?: string
          subject?: string
          time_limit_seconds?: number
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      research_collaboration_requests: {
        Row: {
          created_at: string | null
          id: string
          message: string
          project_id: string
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          message: string
          project_id: string
          status?: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          message?: string
          project_id?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "research_collaboration_requests_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "research_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      research_projects: {
        Row: {
          collaborator_count: number | null
          created_at: string | null
          description: string
          id: string
          looking_for: string
          research_area: string
          skills_needed: string[] | null
          status: string
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          collaborator_count?: number | null
          created_at?: string | null
          description: string
          id?: string
          looking_for: string
          research_area?: string
          skills_needed?: string[] | null
          status?: string
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          collaborator_count?: number | null
          created_at?: string | null
          description?: string
          id?: string
          looking_for?: string
          research_area?: string
          skills_needed?: string[] | null
          status?: string
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      review_helpful_votes: {
        Row: {
          created_at: string | null
          id: string
          review_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          review_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          review_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "review_helpful_votes_review_id_fkey"
            columns: ["review_id"]
            isOneToOne: false
            referencedRelation: "patient_reviews"
            referencedColumns: ["id"]
          },
        ]
      }
      shout_out_reactions: {
        Row: {
          created_at: string
          emoji: string
          id: string
          shout_out_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          emoji: string
          id?: string
          shout_out_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          emoji?: string
          id?: string
          shout_out_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "shout_out_reactions_shout_out_id_fkey"
            columns: ["shout_out_id"]
            isOneToOne: false
            referencedRelation: "shout_outs"
            referencedColumns: ["id"]
          },
        ]
      }
      shout_outs: {
        Row: {
          coins_awarded: number
          created_at: string
          emoji: string
          from_name: string
          from_role: string
          from_user_id: string
          id: string
          message: string
          to_name: string
          to_role: string
          to_user_id: string
        }
        Insert: {
          coins_awarded?: number
          created_at?: string
          emoji?: string
          from_name: string
          from_role: string
          from_user_id: string
          id?: string
          message: string
          to_name: string
          to_role: string
          to_user_id: string
        }
        Update: {
          coins_awarded?: number
          created_at?: string
          emoji?: string
          from_name?: string
          from_role?: string
          from_user_id?: string
          id?: string
          message?: string
          to_name?: string
          to_role?: string
          to_user_id?: string
        }
        Relationships: []
      }
      spine_ayush_exercise_prescriptions: {
        Row: {
          ayush_adjuncts: Json | null
          created_at: string | null
          diagnosis: string
          doctor_id: string
          dosha_involvement: string | null
          duration_weeks: number | null
          end_date: string | null
          exercise_plan: Json | null
          frequency: string | null
          id: string
          module_id: string | null
          notes: string | null
          patient_id: string
          precautions: string | null
          review_date: string | null
          spinal_level: string | null
          start_date: string | null
          status: string | null
          topic_ids: string[] | null
          updated_at: string | null
        }
        Insert: {
          ayush_adjuncts?: Json | null
          created_at?: string | null
          diagnosis: string
          doctor_id: string
          dosha_involvement?: string | null
          duration_weeks?: number | null
          end_date?: string | null
          exercise_plan?: Json | null
          frequency?: string | null
          id?: string
          module_id?: string | null
          notes?: string | null
          patient_id: string
          precautions?: string | null
          review_date?: string | null
          spinal_level?: string | null
          start_date?: string | null
          status?: string | null
          topic_ids?: string[] | null
          updated_at?: string | null
        }
        Update: {
          ayush_adjuncts?: Json | null
          created_at?: string | null
          diagnosis?: string
          doctor_id?: string
          dosha_involvement?: string | null
          duration_weeks?: number | null
          end_date?: string | null
          exercise_plan?: Json | null
          frequency?: string | null
          id?: string
          module_id?: string | null
          notes?: string | null
          patient_id?: string
          precautions?: string | null
          review_date?: string | null
          spinal_level?: string | null
          start_date?: string | null
          status?: string | null
          topic_ids?: string[] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "spine_ayush_exercise_prescriptions_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "spine_ayush_modules"
            referencedColumns: ["id"]
          },
        ]
      }
      spine_ayush_module_topics: {
        Row: {
          ayush_context: string | null
          content_body: string | null
          content_type: string | null
          contraindications: string[] | null
          created_at: string | null
          description: string | null
          doctor_notes: string | null
          duration_minutes: number | null
          exercise_steps: Json | null
          id: string
          image_url: string | null
          is_active: boolean | null
          module_id: string
          patient_instructions: string | null
          precautions: string[] | null
          references: string[] | null
          sort_order: number | null
          title: string
          topic_number: number
          updated_at: string | null
          video_url: string | null
        }
        Insert: {
          ayush_context?: string | null
          content_body?: string | null
          content_type?: string | null
          contraindications?: string[] | null
          created_at?: string | null
          description?: string | null
          doctor_notes?: string | null
          duration_minutes?: number | null
          exercise_steps?: Json | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          module_id: string
          patient_instructions?: string | null
          precautions?: string[] | null
          references?: string[] | null
          sort_order?: number | null
          title: string
          topic_number: number
          updated_at?: string | null
          video_url?: string | null
        }
        Update: {
          ayush_context?: string | null
          content_body?: string | null
          content_type?: string | null
          contraindications?: string[] | null
          created_at?: string | null
          description?: string | null
          doctor_notes?: string | null
          duration_minutes?: number | null
          exercise_steps?: Json | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          module_id?: string
          patient_instructions?: string | null
          precautions?: string[] | null
          references?: string[] | null
          sort_order?: number | null
          title?: string
          topic_number?: number
          updated_at?: string | null
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "spine_ayush_module_topics_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "spine_ayush_modules"
            referencedColumns: ["id"]
          },
        ]
      }
      spine_ayush_modules: {
        Row: {
          ayush_system: string | null
          category: string
          color_class: string | null
          cover_image_url: string | null
          created_at: string | null
          description: string | null
          difficulty_level: string | null
          duration_minutes: number | null
          for_role: string[] | null
          icon_name: string | null
          id: string
          is_active: boolean | null
          is_premium: boolean | null
          module_number: number
          prerequisites: number[] | null
          sort_order: number | null
          subtitle: string | null
          tags: string[] | null
          title: string
          topic_count: number
          updated_at: string | null
          video_intro_url: string | null
        }
        Insert: {
          ayush_system?: string | null
          category: string
          color_class?: string | null
          cover_image_url?: string | null
          created_at?: string | null
          description?: string | null
          difficulty_level?: string | null
          duration_minutes?: number | null
          for_role?: string[] | null
          icon_name?: string | null
          id?: string
          is_active?: boolean | null
          is_premium?: boolean | null
          module_number: number
          prerequisites?: number[] | null
          sort_order?: number | null
          subtitle?: string | null
          tags?: string[] | null
          title: string
          topic_count?: number
          updated_at?: string | null
          video_intro_url?: string | null
        }
        Update: {
          ayush_system?: string | null
          category?: string
          color_class?: string | null
          cover_image_url?: string | null
          created_at?: string | null
          description?: string | null
          difficulty_level?: string | null
          duration_minutes?: number | null
          for_role?: string[] | null
          icon_name?: string | null
          id?: string
          is_active?: boolean | null
          is_premium?: boolean | null
          module_number?: number
          prerequisites?: number[] | null
          sort_order?: number | null
          subtitle?: string | null
          tags?: string[] | null
          title?: string
          topic_count?: number
          updated_at?: string | null
          video_intro_url?: string | null
        }
        Relationships: []
      }
      spine_ayush_posture_assessments: {
        Row: {
          anterior_carrying_angle: string | null
          anterior_foot: string | null
          anterior_head_position: string | null
          anterior_knee: string | null
          anterior_notes: string | null
          anterior_pelvis: string | null
          anterior_shoulder_level: string | null
          assessed_by: string | null
          assessment_date: string | null
          created_at: string | null
          dorsiflexion_test: string | null
          id: string
          kapha_score: number | null
          lateral_cervical: string | null
          lateral_head_position: string | null
          lateral_knee: string | null
          lateral_lumbar: string | null
          lateral_notes: string | null
          lateral_pelvis_tilt: string | null
          lateral_thoracic: string | null
          overall_score: number | null
          patient_id: string
          photo_anterior_url: string | null
          photo_lateral_url: string | null
          photo_posterior_url: string | null
          pitta_score: number | null
          posterior_foot: string | null
          posterior_head_position: string | null
          posterior_knee: string | null
          posterior_lumbar_spine: string | null
          posterior_notes: string | null
          posterior_pelvis: string | null
          posterior_scapular_position: string | null
          posterior_shoulder_asymmetry: string | null
          posterior_thoracic_spine: string | null
          predominant_dosha: string | null
          recommended_modules: number[] | null
          scapular_dyskinesia: string | null
          severity: string | null
          single_leg_stability: string | null
          syndrome_identified: string | null
          thoracic_rotation: string | null
          treatment_plan: string | null
          updated_at: string | null
          vata_score: number | null
        }
        Insert: {
          anterior_carrying_angle?: string | null
          anterior_foot?: string | null
          anterior_head_position?: string | null
          anterior_knee?: string | null
          anterior_notes?: string | null
          anterior_pelvis?: string | null
          anterior_shoulder_level?: string | null
          assessed_by?: string | null
          assessment_date?: string | null
          created_at?: string | null
          dorsiflexion_test?: string | null
          id?: string
          kapha_score?: number | null
          lateral_cervical?: string | null
          lateral_head_position?: string | null
          lateral_knee?: string | null
          lateral_lumbar?: string | null
          lateral_notes?: string | null
          lateral_pelvis_tilt?: string | null
          lateral_thoracic?: string | null
          overall_score?: number | null
          patient_id: string
          photo_anterior_url?: string | null
          photo_lateral_url?: string | null
          photo_posterior_url?: string | null
          pitta_score?: number | null
          posterior_foot?: string | null
          posterior_head_position?: string | null
          posterior_knee?: string | null
          posterior_lumbar_spine?: string | null
          posterior_notes?: string | null
          posterior_pelvis?: string | null
          posterior_scapular_position?: string | null
          posterior_shoulder_asymmetry?: string | null
          posterior_thoracic_spine?: string | null
          predominant_dosha?: string | null
          recommended_modules?: number[] | null
          scapular_dyskinesia?: string | null
          severity?: string | null
          single_leg_stability?: string | null
          syndrome_identified?: string | null
          thoracic_rotation?: string | null
          treatment_plan?: string | null
          updated_at?: string | null
          vata_score?: number | null
        }
        Update: {
          anterior_carrying_angle?: string | null
          anterior_foot?: string | null
          anterior_head_position?: string | null
          anterior_knee?: string | null
          anterior_notes?: string | null
          anterior_pelvis?: string | null
          anterior_shoulder_level?: string | null
          assessed_by?: string | null
          assessment_date?: string | null
          created_at?: string | null
          dorsiflexion_test?: string | null
          id?: string
          kapha_score?: number | null
          lateral_cervical?: string | null
          lateral_head_position?: string | null
          lateral_knee?: string | null
          lateral_lumbar?: string | null
          lateral_notes?: string | null
          lateral_pelvis_tilt?: string | null
          lateral_thoracic?: string | null
          overall_score?: number | null
          patient_id?: string
          photo_anterior_url?: string | null
          photo_lateral_url?: string | null
          photo_posterior_url?: string | null
          pitta_score?: number | null
          posterior_foot?: string | null
          posterior_head_position?: string | null
          posterior_knee?: string | null
          posterior_lumbar_spine?: string | null
          posterior_notes?: string | null
          posterior_pelvis?: string | null
          posterior_scapular_position?: string | null
          posterior_shoulder_asymmetry?: string | null
          posterior_thoracic_spine?: string | null
          predominant_dosha?: string | null
          recommended_modules?: number[] | null
          scapular_dyskinesia?: string | null
          severity?: string | null
          single_leg_stability?: string | null
          syndrome_identified?: string | null
          thoracic_rotation?: string | null
          treatment_plan?: string | null
          updated_at?: string | null
          vata_score?: number | null
        }
        Relationships: []
      }
      spine_ayush_user_progress: {
        Row: {
          completed_at: string | null
          created_at: string | null
          id: string
          module_id: string
          notes: string | null
          progress_pct: number | null
          score: number | null
          status: string
          time_spent_seconds: number | null
          topic_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          id?: string
          module_id: string
          notes?: string | null
          progress_pct?: number | null
          score?: number | null
          status?: string
          time_spent_seconds?: number | null
          topic_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          id?: string
          module_id?: string
          notes?: string | null
          progress_pct?: number | null
          score?: number | null
          status?: string
          time_spent_seconds?: number | null
          topic_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "spine_ayush_user_progress_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "spine_ayush_modules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "spine_ayush_user_progress_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "spine_ayush_module_topics"
            referencedColumns: ["id"]
          },
        ]
      }
      spine_checklists: {
        Row: {
          all_clear: boolean
          checklist_title: string
          checklist_type: string
          completed_items: number
          completion_pct: number
          created_at: string
          id: string
          items: Json
          notes: string | null
          owner_id: string | null
          patient_name: string | null
          performed_by: string | null
          red_flags_triggered: string[] | null
          therapy_name: string | null
          total_items: number
        }
        Insert: {
          all_clear?: boolean
          checklist_title: string
          checklist_type: string
          completed_items?: number
          completion_pct?: number
          created_at?: string
          id?: string
          items?: Json
          notes?: string | null
          owner_id?: string | null
          patient_name?: string | null
          performed_by?: string | null
          red_flags_triggered?: string[] | null
          therapy_name?: string | null
          total_items?: number
        }
        Update: {
          all_clear?: boolean
          checklist_title?: string
          checklist_type?: string
          completed_items?: number
          completion_pct?: number
          created_at?: string
          id?: string
          items?: Json
          notes?: string | null
          owner_id?: string | null
          patient_name?: string | null
          performed_by?: string | null
          red_flags_triggered?: string[] | null
          therapy_name?: string | null
          total_items?: number
        }
        Relationships: []
      }
      spine_clinical_resources: {
        Row: {
          authors: string | null
          avg_pain_reduction: number | null
          break_even_sessions: number | null
          category: string
          compared_to_modern: string | null
          condition: string | null
          contents: Json | null
          cost_per_session: number | null
          cost_per_vas_point: number | null
          created_at: string | null
          created_by: string | null
          description: string | null
          evidence_level: string | null
          finding: string | null
          follow_up: string | null
          format: string | null
          id: string
          is_active: boolean | null
          journal: string | null
          key_learning: string | null
          outcome: string | null
          package_suggestion: string | null
          pages: string | null
          patient_profile: string | null
          patient_retention: number | null
          publication_year: number | null
          pubmed_id: string | null
          pubmed_url: string | null
          resource_type: string
          revenue_per_patient: number | null
          roi: string | null
          sessions_needed: number | null
          sort_order: number | null
          study_type: string | null
          success_rate: number | null
          therapy: string
          title: string
          total_cost: number | null
          treatment_duration: string | null
          treatment_given: string | null
          updated_at: string | null
          vas_after: number | null
          vas_before: number | null
          video_duration: string | null
          video_language: string | null
          video_url: string | null
        }
        Insert: {
          authors?: string | null
          avg_pain_reduction?: number | null
          break_even_sessions?: number | null
          category?: string
          compared_to_modern?: string | null
          condition?: string | null
          contents?: Json | null
          cost_per_session?: number | null
          cost_per_vas_point?: number | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          evidence_level?: string | null
          finding?: string | null
          follow_up?: string | null
          format?: string | null
          id?: string
          is_active?: boolean | null
          journal?: string | null
          key_learning?: string | null
          outcome?: string | null
          package_suggestion?: string | null
          pages?: string | null
          patient_profile?: string | null
          patient_retention?: number | null
          publication_year?: number | null
          pubmed_id?: string | null
          pubmed_url?: string | null
          resource_type: string
          revenue_per_patient?: number | null
          roi?: string | null
          sessions_needed?: number | null
          sort_order?: number | null
          study_type?: string | null
          success_rate?: number | null
          therapy?: string
          title: string
          total_cost?: number | null
          treatment_duration?: string | null
          treatment_given?: string | null
          updated_at?: string | null
          vas_after?: number | null
          vas_before?: number | null
          video_duration?: string | null
          video_language?: string | null
          video_url?: string | null
        }
        Update: {
          authors?: string | null
          avg_pain_reduction?: number | null
          break_even_sessions?: number | null
          category?: string
          compared_to_modern?: string | null
          condition?: string | null
          contents?: Json | null
          cost_per_session?: number | null
          cost_per_vas_point?: number | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          evidence_level?: string | null
          finding?: string | null
          follow_up?: string | null
          format?: string | null
          id?: string
          is_active?: boolean | null
          journal?: string | null
          key_learning?: string | null
          outcome?: string | null
          package_suggestion?: string | null
          pages?: string | null
          patient_profile?: string | null
          patient_retention?: number | null
          publication_year?: number | null
          pubmed_id?: string | null
          pubmed_url?: string | null
          resource_type?: string
          revenue_per_patient?: number | null
          roi?: string | null
          sessions_needed?: number | null
          sort_order?: number | null
          study_type?: string | null
          success_rate?: number | null
          therapy?: string
          title?: string
          total_cost?: number | null
          treatment_duration?: string | null
          treatment_given?: string | null
          updated_at?: string | null
          vas_after?: number | null
          vas_before?: number | null
          video_duration?: string | null
          video_language?: string | null
          video_url?: string | null
        }
        Relationships: []
      }
      spine_csr_allocations: {
        Row: {
          allocated_date: string | null
          amount: number
          created_at: string
          donor_id: string | null
          donor_name: string | null
          id: string
          notes: string | null
          outcome: string | null
          owner_id: string | null
          patient_id: string | null
          patient_name: string | null
          status: string
          utilized: number
        }
        Insert: {
          allocated_date?: string | null
          amount?: number
          created_at?: string
          donor_id?: string | null
          donor_name?: string | null
          id?: string
          notes?: string | null
          outcome?: string | null
          owner_id?: string | null
          patient_id?: string | null
          patient_name?: string | null
          status?: string
          utilized?: number
        }
        Update: {
          allocated_date?: string | null
          amount?: number
          created_at?: string
          donor_id?: string | null
          donor_name?: string | null
          id?: string
          notes?: string | null
          outcome?: string | null
          owner_id?: string | null
          patient_id?: string | null
          patient_name?: string | null
          status?: string
          utilized?: number
        }
        Relationships: [
          {
            foreignKeyName: "spine_csr_allocations_donor_id_fkey"
            columns: ["donor_id"]
            isOneToOne: false
            referencedRelation: "spine_csr_donors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "spine_csr_allocations_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "spine_injury_patients"
            referencedColumns: ["id"]
          },
        ]
      }
      spine_csr_donors: {
        Row: {
          allocated_amount: number
          contact: string | null
          contact_person: string | null
          created_at: string
          donor_name: string
          donor_type: string | null
          grant_amount: number
          grant_date: string | null
          id: string
          notes: string | null
          owner_id: string | null
          purpose: string | null
          status: string
          utilized_amount: number
        }
        Insert: {
          allocated_amount?: number
          contact?: string | null
          contact_person?: string | null
          created_at?: string
          donor_name: string
          donor_type?: string | null
          grant_amount?: number
          grant_date?: string | null
          id?: string
          notes?: string | null
          owner_id?: string | null
          purpose?: string | null
          status?: string
          utilized_amount?: number
        }
        Update: {
          allocated_amount?: number
          contact?: string | null
          contact_person?: string | null
          created_at?: string
          donor_name?: string
          donor_type?: string | null
          grant_amount?: number
          grant_date?: string | null
          id?: string
          notes?: string | null
          owner_id?: string | null
          purpose?: string | null
          status?: string
          utilized_amount?: number
        }
        Relationships: []
      }
      spine_franchise_data: {
        Row: {
          booking_date: string | null
          booking_status: string | null
          center_name: string | null
          channel: string | null
          city: string | null
          completed_items: Json | null
          condition: string | null
          conversion_rate: number | null
          created_at: string | null
          delivery_address: string | null
          id: string
          is_active: boolean | null
          kit_name: string | null
          kit_price: number | null
          metadata: Json | null
          model: string | null
          monthly_growth: number | null
          notes: string | null
          order_status: string | null
          owner_id: string | null
          packages: number | null
          patient_name: string | null
          patients: number | null
          phone: string | null
          pincode: string | null
          record_type: string
          revenue: number | null
          roster_grid: Json | null
          satisfaction: number | null
          setup_progress: number | null
          staff_list: Json | null
          target_launch: string | null
          time_slot: string | null
          updated_at: string | null
        }
        Insert: {
          booking_date?: string | null
          booking_status?: string | null
          center_name?: string | null
          channel?: string | null
          city?: string | null
          completed_items?: Json | null
          condition?: string | null
          conversion_rate?: number | null
          created_at?: string | null
          delivery_address?: string | null
          id?: string
          is_active?: boolean | null
          kit_name?: string | null
          kit_price?: number | null
          metadata?: Json | null
          model?: string | null
          monthly_growth?: number | null
          notes?: string | null
          order_status?: string | null
          owner_id?: string | null
          packages?: number | null
          patient_name?: string | null
          patients?: number | null
          phone?: string | null
          pincode?: string | null
          record_type: string
          revenue?: number | null
          roster_grid?: Json | null
          satisfaction?: number | null
          setup_progress?: number | null
          staff_list?: Json | null
          target_launch?: string | null
          time_slot?: string | null
          updated_at?: string | null
        }
        Update: {
          booking_date?: string | null
          booking_status?: string | null
          center_name?: string | null
          channel?: string | null
          city?: string | null
          completed_items?: Json | null
          condition?: string | null
          conversion_rate?: number | null
          created_at?: string | null
          delivery_address?: string | null
          id?: string
          is_active?: boolean | null
          kit_name?: string | null
          kit_price?: number | null
          metadata?: Json | null
          model?: string | null
          monthly_growth?: number | null
          notes?: string | null
          order_status?: string | null
          owner_id?: string | null
          packages?: number | null
          patient_name?: string | null
          patients?: number | null
          phone?: string | null
          pincode?: string | null
          record_type?: string
          revenue?: number | null
          roster_grid?: Json | null
          satisfaction?: number | null
          setup_progress?: number | null
          staff_list?: Json | null
          target_launch?: string | null
          time_slot?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      spine_injury_patients: {
        Row: {
          age: number | null
          asia_grade: string | null
          assigned_protocol: string | null
          baseline_mobility: number | null
          care_notes: string | null
          created_at: string
          current_mobility: number | null
          gender: string | null
          goals: string | null
          id: string
          injury_date: string | null
          injury_level: string | null
          injury_type: string
          is_csr_sponsored: boolean
          owner_id: string | null
          patient_name: string
          phase: string
          phone: string | null
          referred_by: string | null
          status: string
        }
        Insert: {
          age?: number | null
          asia_grade?: string | null
          assigned_protocol?: string | null
          baseline_mobility?: number | null
          care_notes?: string | null
          created_at?: string
          current_mobility?: number | null
          gender?: string | null
          goals?: string | null
          id?: string
          injury_date?: string | null
          injury_level?: string | null
          injury_type?: string
          is_csr_sponsored?: boolean
          owner_id?: string | null
          patient_name: string
          phase?: string
          phone?: string | null
          referred_by?: string | null
          status?: string
        }
        Update: {
          age?: number | null
          asia_grade?: string | null
          assigned_protocol?: string | null
          baseline_mobility?: number | null
          care_notes?: string | null
          created_at?: string
          current_mobility?: number | null
          gender?: string | null
          goals?: string | null
          id?: string
          injury_date?: string | null
          injury_level?: string | null
          injury_type?: string
          is_csr_sponsored?: boolean
          owner_id?: string | null
          patient_name?: string
          phase?: string
          phone?: string | null
          referred_by?: string | null
          status?: string
        }
        Relationships: []
      }
      spine_leads: {
        Row: {
          age: number | null
          created_at: string | null
          email: string | null
          entry_path: string | null
          id: string
          name: string
          notes: string | null
          place: string | null
          sex: string | null
          source: string | null
          status: string | null
          updated_at: string | null
          whatsapp: string | null
        }
        Insert: {
          age?: number | null
          created_at?: string | null
          email?: string | null
          entry_path?: string | null
          id?: string
          name: string
          notes?: string | null
          place?: string | null
          sex?: string | null
          source?: string | null
          status?: string | null
          updated_at?: string | null
          whatsapp?: string | null
        }
        Update: {
          age?: number | null
          created_at?: string | null
          email?: string | null
          entry_path?: string | null
          id?: string
          name?: string
          notes?: string | null
          place?: string | null
          sex?: string | null
          source?: string | null
          status?: string | null
          updated_at?: string | null
          whatsapp?: string | null
        }
        Relationships: []
      }
      spine_library_resources: {
        Row: {
          audience: string | null
          category: string | null
          condition_tag: string | null
          content: string | null
          created_at: string
          display_order: number | null
          id: string
          is_published: boolean
          owner_id: string | null
          resource_type: string | null
          title: string
          url: string | null
          youtube_id: string | null
        }
        Insert: {
          audience?: string | null
          category?: string | null
          condition_tag?: string | null
          content?: string | null
          created_at?: string
          display_order?: number | null
          id?: string
          is_published?: boolean
          owner_id?: string | null
          resource_type?: string | null
          title: string
          url?: string | null
          youtube_id?: string | null
        }
        Update: {
          audience?: string | null
          category?: string | null
          condition_tag?: string | null
          content?: string | null
          created_at?: string
          display_order?: number | null
          id?: string
          is_published?: boolean
          owner_id?: string | null
          resource_type?: string | null
          title?: string
          url?: string | null
          youtube_id?: string | null
        }
        Relationships: []
      }
      spine_offers: {
        Row: {
          created_at: string
          description: string | null
          discount_label: string | null
          id: string
          is_active: boolean
          offer_price: number | null
          offer_type: string | null
          original_price: number | null
          owner_id: string | null
          promo_code: string | null
          terms: string | null
          title: string
          valid_from: string | null
          valid_until: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          discount_label?: string | null
          id?: string
          is_active?: boolean
          offer_price?: number | null
          offer_type?: string | null
          original_price?: number | null
          owner_id?: string | null
          promo_code?: string | null
          terms?: string | null
          title: string
          valid_from?: string | null
          valid_until?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          discount_label?: string | null
          id?: string
          is_active?: boolean
          offer_price?: number | null
          offer_type?: string | null
          original_price?: number | null
          owner_id?: string | null
          promo_code?: string | null
          terms?: string | null
          title?: string
          valid_from?: string | null
          valid_until?: string | null
        }
        Relationships: []
      }
      spine_patient_pipeline: {
        Row: {
          created_at: string | null
          entered_stage_at: string | null
          id: string
          is_active: boolean | null
          modules_completed: number | null
          notes: string | null
          patient_id: string
          referrals_made: number | null
          sessions_completed: number | null
          stage: number
          stage_name: string
          tier: string | null
          total_vas_improvement: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          entered_stage_at?: string | null
          id?: string
          is_active?: boolean | null
          modules_completed?: number | null
          notes?: string | null
          patient_id: string
          referrals_made?: number | null
          sessions_completed?: number | null
          stage?: number
          stage_name?: string
          tier?: string | null
          total_vas_improvement?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          entered_stage_at?: string | null
          id?: string
          is_active?: boolean | null
          modules_completed?: number | null
          notes?: string | null
          patient_id?: string
          referrals_made?: number | null
          sessions_completed?: number | null
          stage?: number
          stage_name?: string
          tier?: string | null
          total_vas_improvement?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      spine_patient_subscriptions: {
        Row: {
          billing_cycle: string | null
          created_at: string
          id: string
          next_billing_date: string | null
          notes: string | null
          owner_id: string | null
          patient_name: string
          phone: string | null
          plan_id: string | null
          plan_name: string | null
          price: number | null
          sessions_used: number | null
          start_date: string | null
          status: string
        }
        Insert: {
          billing_cycle?: string | null
          created_at?: string
          id?: string
          next_billing_date?: string | null
          notes?: string | null
          owner_id?: string | null
          patient_name: string
          phone?: string | null
          plan_id?: string | null
          plan_name?: string | null
          price?: number | null
          sessions_used?: number | null
          start_date?: string | null
          status?: string
        }
        Update: {
          billing_cycle?: string | null
          created_at?: string
          id?: string
          next_billing_date?: string | null
          notes?: string | null
          owner_id?: string | null
          patient_name?: string
          phone?: string | null
          plan_id?: string | null
          plan_name?: string | null
          price?: number | null
          sessions_used?: number | null
          start_date?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "spine_patient_subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "spine_subscription_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      spine_recovery_scores: {
        Row: {
          assessed_by: string | null
          baseline_vas: number | null
          created_at: string | null
          daily_activity: number | null
          functional_score: number | null
          id: string
          improvement_percentage: number | null
          medication_usage: string | null
          ndi_score: number | null
          notes: string | null
          odi_score: number | null
          patient_id: string
          recovery_percentage: number | null
          rom_extension: number | null
          rom_flexion: number | null
          rom_lateral_flexion: number | null
          rom_rotation: number | null
          score_date: string
          session_id: string | null
          sleep_quality: number | null
          vas_pain: number | null
        }
        Insert: {
          assessed_by?: string | null
          baseline_vas?: number | null
          created_at?: string | null
          daily_activity?: number | null
          functional_score?: number | null
          id?: string
          improvement_percentage?: number | null
          medication_usage?: string | null
          ndi_score?: number | null
          notes?: string | null
          odi_score?: number | null
          patient_id: string
          recovery_percentage?: number | null
          rom_extension?: number | null
          rom_flexion?: number | null
          rom_lateral_flexion?: number | null
          rom_rotation?: number | null
          score_date?: string
          session_id?: string | null
          sleep_quality?: number | null
          vas_pain?: number | null
        }
        Update: {
          assessed_by?: string | null
          baseline_vas?: number | null
          created_at?: string | null
          daily_activity?: number | null
          functional_score?: number | null
          id?: string
          improvement_percentage?: number | null
          medication_usage?: string | null
          ndi_score?: number | null
          notes?: string | null
          odi_score?: number | null
          patient_id?: string
          recovery_percentage?: number | null
          rom_extension?: number | null
          rom_flexion?: number | null
          rom_lateral_flexion?: number | null
          rom_rotation?: number | null
          score_date?: string
          session_id?: string | null
          sleep_quality?: number | null
          vas_pain?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "spine_recovery_scores_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "spine_therapy_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      spine_referral_applications: {
        Row: {
          applicant_type: string
          audience_size: string | null
          created_at: string
          email: string | null
          handle: string | null
          id: string
          message: string | null
          name: string
          phone: string | null
          status: string
        }
        Insert: {
          applicant_type?: string
          audience_size?: string | null
          created_at?: string
          email?: string | null
          handle?: string | null
          id?: string
          message?: string | null
          name: string
          phone?: string | null
          status?: string
        }
        Update: {
          applicant_type?: string
          audience_size?: string | null
          created_at?: string
          email?: string | null
          handle?: string | null
          id?: string
          message?: string | null
          name?: string
          phone?: string | null
          status?: string
        }
        Relationships: []
      }
      spine_referral_rules: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          min_conversions_to_upgrade: number | null
          owner_id: string | null
          referred_benefit: string | null
          referrer_type: string
          reward_type: string
          reward_value: number
          tier: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          min_conversions_to_upgrade?: number | null
          owner_id?: string | null
          referred_benefit?: string | null
          referrer_type: string
          reward_type?: string
          reward_value?: number
          tier?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          min_conversions_to_upgrade?: number | null
          owner_id?: string | null
          referred_benefit?: string | null
          referrer_type?: string
          reward_type?: string
          reward_value?: number
          tier?: string
        }
        Relationships: []
      }
      spine_referrals: {
        Row: {
          condition: string | null
          converted_at: string | null
          created_at: string
          id: string
          lead_id: string | null
          notes: string | null
          owner_id: string | null
          referral_code: string | null
          referred_name: string
          referred_phone: string | null
          referrer_id: string | null
          reward_amount: number | null
          reward_status: string | null
          status: string
        }
        Insert: {
          condition?: string | null
          converted_at?: string | null
          created_at?: string
          id?: string
          lead_id?: string | null
          notes?: string | null
          owner_id?: string | null
          referral_code?: string | null
          referred_name: string
          referred_phone?: string | null
          referrer_id?: string | null
          reward_amount?: number | null
          reward_status?: string | null
          status?: string
        }
        Update: {
          condition?: string | null
          converted_at?: string | null
          created_at?: string
          id?: string
          lead_id?: string | null
          notes?: string | null
          owner_id?: string | null
          referral_code?: string | null
          referred_name?: string
          referred_phone?: string | null
          referrer_id?: string | null
          reward_amount?: number | null
          reward_status?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "spine_referrals_referrer_id_fkey"
            columns: ["referrer_id"]
            isOneToOne: false
            referencedRelation: "spine_referrers"
            referencedColumns: ["id"]
          },
        ]
      }
      spine_referrers: {
        Row: {
          created_at: string
          email: string | null
          ethical_mode: boolean
          handle: string | null
          id: string
          name: string
          notes: string | null
          owner_id: string | null
          phone: string | null
          referral_code: string
          referrer_type: string
          reward_mode: string | null
          status: string
          tier: string
          total_conversions: number
          total_earned: number
          total_paid: number
          total_referrals: number
        }
        Insert: {
          created_at?: string
          email?: string | null
          ethical_mode?: boolean
          handle?: string | null
          id?: string
          name: string
          notes?: string | null
          owner_id?: string | null
          phone?: string | null
          referral_code: string
          referrer_type?: string
          reward_mode?: string | null
          status?: string
          tier?: string
          total_conversions?: number
          total_earned?: number
          total_paid?: number
          total_referrals?: number
        }
        Update: {
          created_at?: string
          email?: string | null
          ethical_mode?: boolean
          handle?: string | null
          id?: string
          name?: string
          notes?: string | null
          owner_id?: string | null
          phone?: string | null
          referral_code?: string
          referrer_type?: string
          reward_mode?: string | null
          status?: string
          tier?: string
          total_conversions?: number
          total_earned?: number
          total_paid?: number
          total_referrals?: number
        }
        Relationships: []
      }
      spine_rehab_followups: {
        Row: {
          adherence_pct: number | null
          created_at: string
          followup_type: string | null
          id: string
          mobility_score: number | null
          needs_referral: boolean
          next_plan: string | null
          owner_id: string | null
          pain_score: number | null
          patient_id: string | null
          patient_name: string | null
          progress_note: string | null
          red_flags: string[] | null
          session_week: number | null
          spasticity_score: number | null
        }
        Insert: {
          adherence_pct?: number | null
          created_at?: string
          followup_type?: string | null
          id?: string
          mobility_score?: number | null
          needs_referral?: boolean
          next_plan?: string | null
          owner_id?: string | null
          pain_score?: number | null
          patient_id?: string | null
          patient_name?: string | null
          progress_note?: string | null
          red_flags?: string[] | null
          session_week?: number | null
          spasticity_score?: number | null
        }
        Update: {
          adherence_pct?: number | null
          created_at?: string
          followup_type?: string | null
          id?: string
          mobility_score?: number | null
          needs_referral?: boolean
          next_plan?: string | null
          owner_id?: string | null
          pain_score?: number | null
          patient_id?: string | null
          patient_name?: string | null
          progress_note?: string | null
          red_flags?: string[] | null
          session_week?: number | null
          spasticity_score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "spine_rehab_followups_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "spine_injury_patients"
            referencedColumns: ["id"]
          },
        ]
      }
      spine_retreat_registrations: {
        Row: {
          created_at: string
          email: string | null
          id: string
          notes: string | null
          owner_id: string | null
          package: string | null
          participant_name: string
          phone: string | null
          retreat_id: string | null
          retreat_title: string | null
          status: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          notes?: string | null
          owner_id?: string | null
          package?: string | null
          participant_name: string
          phone?: string | null
          retreat_id?: string | null
          retreat_title?: string | null
          status?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          notes?: string | null
          owner_id?: string | null
          package?: string | null
          participant_name?: string
          phone?: string | null
          retreat_id?: string | null
          retreat_title?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "spine_retreat_registrations_retreat_id_fkey"
            columns: ["retreat_id"]
            isOneToOne: false
            referencedRelation: "spine_retreats"
            referencedColumns: ["id"]
          },
        ]
      }
      spine_retreats: {
        Row: {
          capacity: number | null
          created_at: string
          description: string | null
          duration_days: number | null
          early_bird_price: number | null
          end_date: string | null
          highlights: string[] | null
          id: string
          inclusions: string[] | null
          is_published: boolean
          location: string | null
          owner_id: string | null
          price: number | null
          retreat_type: string | null
          seats_filled: number | null
          start_date: string | null
          title: string
        }
        Insert: {
          capacity?: number | null
          created_at?: string
          description?: string | null
          duration_days?: number | null
          early_bird_price?: number | null
          end_date?: string | null
          highlights?: string[] | null
          id?: string
          inclusions?: string[] | null
          is_published?: boolean
          location?: string | null
          owner_id?: string | null
          price?: number | null
          retreat_type?: string | null
          seats_filled?: number | null
          start_date?: string | null
          title: string
        }
        Update: {
          capacity?: number | null
          created_at?: string
          description?: string | null
          duration_days?: number | null
          early_bird_price?: number | null
          end_date?: string | null
          highlights?: string[] | null
          id?: string
          inclusions?: string[] | null
          is_published?: boolean
          location?: string | null
          owner_id?: string | null
          price?: number | null
          retreat_type?: string | null
          seats_filled?: number | null
          start_date?: string | null
          title?: string
        }
        Relationships: []
      }
      spine_social_links: {
        Row: {
          created_at: string
          display_order: number | null
          follower_label: string | null
          handle: string | null
          id: string
          is_active: boolean
          owner_id: string | null
          platform: string
          url: string
        }
        Insert: {
          created_at?: string
          display_order?: number | null
          follower_label?: string | null
          handle?: string | null
          id?: string
          is_active?: boolean
          owner_id?: string | null
          platform: string
          url: string
        }
        Update: {
          created_at?: string
          display_order?: number | null
          follower_label?: string | null
          handle?: string | null
          id?: string
          is_active?: boolean
          owner_id?: string | null
          platform?: string
          url?: string
        }
        Relationships: []
      }
      spine_social_posts: {
        Row: {
          caption: string | null
          created_at: string
          display_order: number | null
          id: string
          is_published: boolean
          owner_id: string | null
          platform: string
          post_url: string
          thumbnail_url: string | null
        }
        Insert: {
          caption?: string | null
          created_at?: string
          display_order?: number | null
          id?: string
          is_published?: boolean
          owner_id?: string | null
          platform?: string
          post_url: string
          thumbnail_url?: string | null
        }
        Update: {
          caption?: string | null
          created_at?: string
          display_order?: number | null
          id?: string
          is_published?: boolean
          owner_id?: string | null
          platform?: string
          post_url?: string
          thumbnail_url?: string | null
        }
        Relationships: []
      }
      spine_subscription_plans: {
        Row: {
          billing_cycle: string | null
          created_at: string
          description: string | null
          display_order: number | null
          features: string[] | null
          id: string
          is_active: boolean
          name: string
          owner_id: string | null
          price: number
          sessions_included: number | null
          tier: string | null
        }
        Insert: {
          billing_cycle?: string | null
          created_at?: string
          description?: string | null
          display_order?: number | null
          features?: string[] | null
          id?: string
          is_active?: boolean
          name: string
          owner_id?: string | null
          price?: number
          sessions_included?: number | null
          tier?: string | null
        }
        Update: {
          billing_cycle?: string | null
          created_at?: string
          description?: string | null
          display_order?: number | null
          features?: string[] | null
          id?: string
          is_active?: boolean
          name?: string
          owner_id?: string | null
          price?: number
          sessions_included?: number | null
          tier?: string | null
        }
        Relationships: []
      }
      spine_success_stories: {
        Row: {
          age_group: string | null
          condition: string
          created_at: string
          display_order: number | null
          duration_weeks: number | null
          id: string
          is_featured: boolean
          is_published: boolean
          owner_id: string | null
          pain_after: number | null
          pain_before: number | null
          patient_initial: string | null
          patient_name: string
          photo_url: string | null
          rating: number | null
          sessions_taken: number | null
          story: string
          therapies_used: string[] | null
          video_url: string | null
        }
        Insert: {
          age_group?: string | null
          condition: string
          created_at?: string
          display_order?: number | null
          duration_weeks?: number | null
          id?: string
          is_featured?: boolean
          is_published?: boolean
          owner_id?: string | null
          pain_after?: number | null
          pain_before?: number | null
          patient_initial?: string | null
          patient_name: string
          photo_url?: string | null
          rating?: number | null
          sessions_taken?: number | null
          story: string
          therapies_used?: string[] | null
          video_url?: string | null
        }
        Update: {
          age_group?: string | null
          condition?: string
          created_at?: string
          display_order?: number | null
          duration_weeks?: number | null
          id?: string
          is_featured?: boolean
          is_published?: boolean
          owner_id?: string | null
          pain_after?: number | null
          pain_before?: number | null
          patient_initial?: string | null
          patient_name?: string
          photo_url?: string | null
          rating?: number | null
          sessions_taken?: number | null
          story?: string
          therapies_used?: string[] | null
          video_url?: string | null
        }
        Relationships: []
      }
      spine_therapy_checkpoints: {
        Row: {
          checkpoint_category: string | null
          checkpoint_name: string
          created_at: string | null
          description: string | null
          id: string
          is_mandatory: boolean | null
          sort_order: number | null
          therapy_id: number
          therapy_name: string
        }
        Insert: {
          checkpoint_category?: string | null
          checkpoint_name: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_mandatory?: boolean | null
          sort_order?: number | null
          therapy_id: number
          therapy_name: string
        }
        Update: {
          checkpoint_category?: string | null
          checkpoint_name?: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_mandatory?: boolean | null
          sort_order?: number | null
          therapy_id?: number
          therapy_name?: string
        }
        Relationships: []
      }
      spine_therapy_prescriptions: {
        Row: {
          actual_end_date: string | null
          created_at: string | null
          doctor_id: string
          dosha_involvement: string | null
          expected_end_date: string | null
          final_recovery_pct: number | null
          id: string
          outcome_summary: string | null
          patient_id: string
          patient_satisfaction: number | null
          prescribed_therapies: Json
          prescription_date: string | null
          primary_diagnosis: string
          spinal_levels: string[] | null
          start_date: string | null
          status: string | null
          syndrome_type: string | null
          target_duration_weeks: number | null
          target_recovery_pct: number | null
          target_vas: number | null
          total_sessions_completed: number | null
          total_sessions_planned: number | null
          updated_at: string | null
        }
        Insert: {
          actual_end_date?: string | null
          created_at?: string | null
          doctor_id: string
          dosha_involvement?: string | null
          expected_end_date?: string | null
          final_recovery_pct?: number | null
          id?: string
          outcome_summary?: string | null
          patient_id: string
          patient_satisfaction?: number | null
          prescribed_therapies?: Json
          prescription_date?: string | null
          primary_diagnosis: string
          spinal_levels?: string[] | null
          start_date?: string | null
          status?: string | null
          syndrome_type?: string | null
          target_duration_weeks?: number | null
          target_recovery_pct?: number | null
          target_vas?: number | null
          total_sessions_completed?: number | null
          total_sessions_planned?: number | null
          updated_at?: string | null
        }
        Update: {
          actual_end_date?: string | null
          created_at?: string | null
          doctor_id?: string
          dosha_involvement?: string | null
          expected_end_date?: string | null
          final_recovery_pct?: number | null
          id?: string
          outcome_summary?: string | null
          patient_id?: string
          patient_satisfaction?: number | null
          prescribed_therapies?: Json
          prescription_date?: string | null
          primary_diagnosis?: string
          spinal_levels?: string[] | null
          start_date?: string | null
          status?: string | null
          syndrome_type?: string | null
          target_duration_weeks?: number | null
          target_recovery_pct?: number | null
          target_vas?: number | null
          total_sessions_completed?: number | null
          total_sessions_planned?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      spine_therapy_sessions: {
        Row: {
          body_area: string | null
          checkpoints_completed: Json | null
          checkpoints_done: number | null
          created_at: string | null
          doctor_id: string
          doctor_notes: string | null
          duration_minutes: number | null
          home_exercise_given: string | null
          id: string
          immediate_response: string | null
          intensity: string | null
          next_session_plan: string | null
          pain_after: number | null
          pain_before: number | null
          patient_feedback: string | null
          patient_id: string
          points_treated: Json | null
          session_date: string
          session_number: number | null
          spinal_level: string | null
          status: string | null
          therapy_id: number
          therapy_name: string
          total_checkpoints: number | null
          updated_at: string | null
        }
        Insert: {
          body_area?: string | null
          checkpoints_completed?: Json | null
          checkpoints_done?: number | null
          created_at?: string | null
          doctor_id: string
          doctor_notes?: string | null
          duration_minutes?: number | null
          home_exercise_given?: string | null
          id?: string
          immediate_response?: string | null
          intensity?: string | null
          next_session_plan?: string | null
          pain_after?: number | null
          pain_before?: number | null
          patient_feedback?: string | null
          patient_id: string
          points_treated?: Json | null
          session_date?: string
          session_number?: number | null
          spinal_level?: string | null
          status?: string | null
          therapy_id: number
          therapy_name: string
          total_checkpoints?: number | null
          updated_at?: string | null
        }
        Update: {
          body_area?: string | null
          checkpoints_completed?: Json | null
          checkpoints_done?: number | null
          created_at?: string | null
          doctor_id?: string
          doctor_notes?: string | null
          duration_minutes?: number | null
          home_exercise_given?: string | null
          id?: string
          immediate_response?: string | null
          intensity?: string | null
          next_session_plan?: string | null
          pain_after?: number | null
          pain_before?: number | null
          patient_feedback?: string | null
          patient_id?: string
          points_treated?: Json | null
          session_date?: string
          session_number?: number | null
          spinal_level?: string | null
          status?: string | null
          therapy_id?: number
          therapy_name?: string
          total_checkpoints?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      spine_videos: {
        Row: {
          audience: string | null
          category: string | null
          condition_tag: string | null
          created_at: string
          description: string | null
          display_order: number | null
          duration_label: string | null
          id: string
          is_published: boolean
          owner_id: string | null
          title: string
          youtube_id: string
        }
        Insert: {
          audience?: string | null
          category?: string | null
          condition_tag?: string | null
          created_at?: string
          description?: string | null
          display_order?: number | null
          duration_label?: string | null
          id?: string
          is_published?: boolean
          owner_id?: string | null
          title: string
          youtube_id: string
        }
        Update: {
          audience?: string | null
          category?: string | null
          condition_tag?: string | null
          created_at?: string
          description?: string | null
          display_order?: number | null
          duration_label?: string | null
          id?: string
          is_published?: boolean
          owner_id?: string | null
          title?: string
          youtube_id?: string
        }
        Relationships: []
      }
      spine_vitality_assessments: {
        Row: {
          age: number
          consent_given: boolean
          created_at: string
          duration: string | null
          gender: string | null
          id: string
          metabolic_factor: number | null
          notes: string | null
          owner_id: string | null
          patient_ref: string
          pc_muscle_strength: number | null
          plan: Json | null
          primary_concern: string
          severity: string | null
          sleep_quality: number | null
          spine_involvement: number | null
          stress_level: number | null
        }
        Insert: {
          age: number
          consent_given?: boolean
          created_at?: string
          duration?: string | null
          gender?: string | null
          id?: string
          metabolic_factor?: number | null
          notes?: string | null
          owner_id?: string | null
          patient_ref: string
          pc_muscle_strength?: number | null
          plan?: Json | null
          primary_concern: string
          severity?: string | null
          sleep_quality?: number | null
          spine_involvement?: number | null
          stress_level?: number | null
        }
        Update: {
          age?: number
          consent_given?: boolean
          created_at?: string
          duration?: string | null
          gender?: string | null
          id?: string
          metabolic_factor?: number | null
          notes?: string | null
          owner_id?: string | null
          patient_ref?: string
          pc_muscle_strength?: number | null
          plan?: Json | null
          primary_concern?: string
          severity?: string | null
          sleep_quality?: number | null
          spine_involvement?: number | null
          stress_level?: number | null
        }
        Relationships: []
      }
      spine_vitality_protocols: {
        Row: {
          audience: string | null
          ayurvedic_protocol: string[] | null
          condition_key: string
          created_at: string
          display_order: number | null
          id: string
          is_active: boolean
          lifestyle_protocol: string[] | null
          overview: string | null
          owner_id: string | null
          pelvic_protocol: string[] | null
          red_flags: string[] | null
          spine_protocol: string[] | null
          title: string
        }
        Insert: {
          audience?: string | null
          ayurvedic_protocol?: string[] | null
          condition_key: string
          created_at?: string
          display_order?: number | null
          id?: string
          is_active?: boolean
          lifestyle_protocol?: string[] | null
          overview?: string | null
          owner_id?: string | null
          pelvic_protocol?: string[] | null
          red_flags?: string[] | null
          spine_protocol?: string[] | null
          title: string
        }
        Update: {
          audience?: string | null
          ayurvedic_protocol?: string[] | null
          condition_key?: string
          created_at?: string
          display_order?: number | null
          id?: string
          is_active?: boolean
          lifestyle_protocol?: string[] | null
          overview?: string | null
          owner_id?: string | null
          pelvic_protocol?: string[] | null
          red_flags?: string[] | null
          spine_protocol?: string[] | null
          title?: string
        }
        Relationships: []
      }
      spine_wellness_assessments: {
        Row: {
          activity_score: number | null
          age_gap: number | null
          agni_score: number | null
          balance_seconds: number | null
          biological_age: number | null
          bp_diastolic: number | null
          bp_systolic: number | null
          category: string | null
          chronological_age: number
          created_at: string
          diet_score: number | null
          flexibility_cm: number | null
          gait_speed_ms: number | null
          gender: string | null
          grip_strength_kg: number | null
          id: string
          notes: string | null
          ojas_score: number | null
          owner_id: string | null
          patient_name: string
          phone: string | null
          recommendations: string[] | null
          resting_hr: number | null
          sit_to_stand: number | null
          sleep_score: number | null
          stress_score: number | null
          vitality_score: number | null
          waist_hip_ratio: number | null
        }
        Insert: {
          activity_score?: number | null
          age_gap?: number | null
          agni_score?: number | null
          balance_seconds?: number | null
          biological_age?: number | null
          bp_diastolic?: number | null
          bp_systolic?: number | null
          category?: string | null
          chronological_age: number
          created_at?: string
          diet_score?: number | null
          flexibility_cm?: number | null
          gait_speed_ms?: number | null
          gender?: string | null
          grip_strength_kg?: number | null
          id?: string
          notes?: string | null
          ojas_score?: number | null
          owner_id?: string | null
          patient_name: string
          phone?: string | null
          recommendations?: string[] | null
          resting_hr?: number | null
          sit_to_stand?: number | null
          sleep_score?: number | null
          stress_score?: number | null
          vitality_score?: number | null
          waist_hip_ratio?: number | null
        }
        Update: {
          activity_score?: number | null
          age_gap?: number | null
          agni_score?: number | null
          balance_seconds?: number | null
          biological_age?: number | null
          bp_diastolic?: number | null
          bp_systolic?: number | null
          category?: string | null
          chronological_age?: number
          created_at?: string
          diet_score?: number | null
          flexibility_cm?: number | null
          gait_speed_ms?: number | null
          gender?: string | null
          grip_strength_kg?: number | null
          id?: string
          notes?: string | null
          ojas_score?: number | null
          owner_id?: string | null
          patient_name?: string
          phone?: string | null
          recommendations?: string[] | null
          resting_hr?: number | null
          sit_to_stand?: number | null
          sleep_score?: number | null
          stress_score?: number | null
          vitality_score?: number | null
          waist_hip_ratio?: number | null
        }
        Relationships: []
      }
      spine_whatsapp_messages: {
        Row: {
          created_at: string | null
          exercise_done: boolean | null
          id: string
          message_body: string | null
          message_type: string | null
          phone_number: string
          processed: boolean | null
          responded: boolean | null
          vas_score: number | null
        }
        Insert: {
          created_at?: string | null
          exercise_done?: boolean | null
          id?: string
          message_body?: string | null
          message_type?: string | null
          phone_number: string
          processed?: boolean | null
          responded?: boolean | null
          vas_score?: number | null
        }
        Update: {
          created_at?: string | null
          exercise_done?: boolean | null
          id?: string
          message_body?: string | null
          message_type?: string | null
          phone_number?: string
          processed?: boolean | null
          responded?: boolean | null
          vas_score?: number | null
        }
        Relationships: []
      }
      startup_idea_upvotes: {
        Row: {
          created_at: string | null
          id: string
          idea_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          idea_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          idea_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "startup_idea_upvotes_idea_id_fkey"
            columns: ["idea_id"]
            isOneToOne: false
            referencedRelation: "startup_ideas"
            referencedColumns: ["id"]
          },
        ]
      }
      startup_ideas: {
        Row: {
          category: string
          created_at: string | null
          description: string
          id: string
          looking_for: string[] | null
          stage: string
          tagline: string
          title: string
          updated_at: string | null
          upvotes: number | null
          user_id: string
        }
        Insert: {
          category?: string
          created_at?: string | null
          description: string
          id?: string
          looking_for?: string[] | null
          stage?: string
          tagline: string
          title: string
          updated_at?: string | null
          upvotes?: number | null
          user_id: string
        }
        Update: {
          category?: string
          created_at?: string | null
          description?: string
          id?: string
          looking_for?: string[] | null
          stage?: string
          tagline?: string
          title?: string
          updated_at?: string | null
          upvotes?: number | null
          user_id?: string
        }
        Relationships: []
      }
      student_admin_roles: {
        Row: {
          college_name: string | null
          granted_at: string | null
          granted_by: string | null
          id: string
          is_active: boolean | null
          role: string
          user_id: string
        }
        Insert: {
          college_name?: string | null
          granted_at?: string | null
          granted_by?: string | null
          id?: string
          is_active?: boolean | null
          role?: string
          user_id: string
        }
        Update: {
          college_name?: string | null
          granted_at?: string | null
          granted_by?: string | null
          id?: string
          is_active?: boolean | null
          role?: string
          user_id?: string
        }
        Relationships: []
      }
      student_coin_transactions: {
        Row: {
          amount: number
          created_at: string | null
          id: string
          reason: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          id?: string
          reason: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          id?: string
          reason?: string
          user_id?: string
        }
        Relationships: []
      }
      student_mentors: {
        Row: {
          bio: string | null
          college_name: string | null
          created_at: string | null
          current_mentees: number | null
          full_name: string
          id: string
          is_available: boolean | null
          max_mentees: number | null
          rating: number | null
          specialization: string
          subjects: string[] | null
          updated_at: string | null
          user_id: string
          year_of_study: number | null
        }
        Insert: {
          bio?: string | null
          college_name?: string | null
          created_at?: string | null
          current_mentees?: number | null
          full_name: string
          id?: string
          is_available?: boolean | null
          max_mentees?: number | null
          rating?: number | null
          specialization?: string
          subjects?: string[] | null
          updated_at?: string | null
          user_id: string
          year_of_study?: number | null
        }
        Update: {
          bio?: string | null
          college_name?: string | null
          created_at?: string | null
          current_mentees?: number | null
          full_name?: string
          id?: string
          is_available?: boolean | null
          max_mentees?: number | null
          rating?: number | null
          specialization?: string
          subjects?: string[] | null
          updated_at?: string | null
          user_id?: string
          year_of_study?: number | null
        }
        Relationships: []
      }
      student_notes: {
        Row: {
          content: string
          created_at: string | null
          id: string
          is_pinned: boolean | null
          subject: string
          tags: string[] | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          content?: string
          created_at?: string | null
          id?: string
          is_pinned?: boolean | null
          subject?: string
          tags?: string[] | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          is_pinned?: boolean | null
          subject?: string
          tags?: string[] | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      student_profiles: {
        Row: {
          achievements: string[] | null
          areas_of_interest: string[] | null
          badges: string[] | null
          bio: string | null
          city: string | null
          coins: number | null
          college_name: string | null
          course: string | null
          created_at: string | null
          full_name: string | null
          graduation_year: number | null
          id: string
          interests: string[] | null
          is_verified: boolean | null
          level: string | null
          linkedin_url: string | null
          phone: string | null
          profile_photo_url: string | null
          referral_code: string | null
          referred_by: string | null
          registration_number: string | null
          skills: string[] | null
          state: string | null
          streak_days: number | null
          student_id_url: string | null
          updated_at: string | null
          user_id: string
          xp: number | null
          year_of_study: string | null
        }
        Insert: {
          achievements?: string[] | null
          areas_of_interest?: string[] | null
          badges?: string[] | null
          bio?: string | null
          city?: string | null
          coins?: number | null
          college_name?: string | null
          course?: string | null
          created_at?: string | null
          full_name?: string | null
          graduation_year?: number | null
          id?: string
          interests?: string[] | null
          is_verified?: boolean | null
          level?: string | null
          linkedin_url?: string | null
          phone?: string | null
          profile_photo_url?: string | null
          referral_code?: string | null
          referred_by?: string | null
          registration_number?: string | null
          skills?: string[] | null
          state?: string | null
          streak_days?: number | null
          student_id_url?: string | null
          updated_at?: string | null
          user_id: string
          xp?: number | null
          year_of_study?: string | null
        }
        Update: {
          achievements?: string[] | null
          areas_of_interest?: string[] | null
          badges?: string[] | null
          bio?: string | null
          city?: string | null
          coins?: number | null
          college_name?: string | null
          course?: string | null
          created_at?: string | null
          full_name?: string | null
          graduation_year?: number | null
          id?: string
          interests?: string[] | null
          is_verified?: boolean | null
          level?: string | null
          linkedin_url?: string | null
          phone?: string | null
          profile_photo_url?: string | null
          referral_code?: string | null
          referred_by?: string | null
          registration_number?: string | null
          skills?: string[] | null
          state?: string | null
          streak_days?: number | null
          student_id_url?: string | null
          updated_at?: string | null
          user_id?: string
          xp?: number | null
          year_of_study?: string | null
        }
        Relationships: []
      }
      student_quiz_progress: {
        Row: {
          best_streak: number
          coins: number
          correct_answers: number
          created_at: string | null
          last_quiz_date: string | null
          quizzes_completed: number
          streak: number
          total_answers: number
          updated_at: string | null
          user_id: string
          xp: number
        }
        Insert: {
          best_streak?: number
          coins?: number
          correct_answers?: number
          created_at?: string | null
          last_quiz_date?: string | null
          quizzes_completed?: number
          streak?: number
          total_answers?: number
          updated_at?: string | null
          user_id: string
          xp?: number
        }
        Update: {
          best_streak?: number
          coins?: number
          correct_answers?: number
          created_at?: string | null
          last_quiz_date?: string | null
          quizzes_completed?: number
          streak?: number
          total_answers?: number
          updated_at?: string | null
          user_id?: string
          xp?: number
        }
        Relationships: []
      }
      student_study_sessions: {
        Row: {
          created_at: string | null
          duration_minutes: number
          id: string
          notes: string | null
          studied_at: string
          subject: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          duration_minutes: number
          id?: string
          notes?: string | null
          studied_at?: string
          subject?: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          duration_minutes?: number
          id?: string
          notes?: string | null
          studied_at?: string
          subject?: string
          user_id?: string
        }
        Relationships: []
      }
      study_group_members: {
        Row: {
          group_id: string
          id: string
          joined_at: string | null
          role: string
          user_id: string
        }
        Insert: {
          group_id: string
          id?: string
          joined_at?: string | null
          role?: string
          user_id: string
        }
        Update: {
          group_id?: string
          id?: string
          joined_at?: string | null
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "study_group_members_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "study_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      study_group_posts: {
        Row: {
          content: string
          created_at: string | null
          group_id: string
          id: string
          post_type: string
          resource_url: string | null
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          group_id: string
          id?: string
          post_type?: string
          resource_url?: string | null
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          group_id?: string
          id?: string
          post_type?: string
          resource_url?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "study_group_posts_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "study_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      study_groups: {
        Row: {
          created_at: string | null
          created_by: string
          description: string | null
          id: string
          is_public: boolean | null
          max_members: number | null
          member_count: number
          name: string
          subject: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by: string
          description?: string | null
          id?: string
          is_public?: boolean | null
          max_members?: number | null
          member_count?: number
          name: string
          subject?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string
          description?: string | null
          id?: string
          is_public?: boolean | null
          max_members?: number | null
          member_count?: number
          name?: string
          subject?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      task_tracker_goals: {
        Row: {
          created_at: string
          description: string | null
          goal_type: string
          id: string
          is_completed: boolean
          progress: number
          role_context: string
          target_date: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          goal_type?: string
          id?: string
          is_completed?: boolean
          progress?: number
          role_context?: string
          target_date?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          goal_type?: string
          id?: string
          is_completed?: boolean
          progress?: number
          role_context?: string
          target_date?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      task_tracker_habit_log: {
        Row: {
          completed_date: string
          habit_id: string
          id: string
          user_id: string
        }
        Insert: {
          completed_date: string
          habit_id: string
          id?: string
          user_id: string
        }
        Update: {
          completed_date?: string
          habit_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_tracker_habit_log_habit_id_fkey"
            columns: ["habit_id"]
            isOneToOne: false
            referencedRelation: "task_tracker_habits"
            referencedColumns: ["id"]
          },
        ]
      }
      task_tracker_habits: {
        Row: {
          created_at: string
          current_streak: number
          custom_days: Json | null
          emoji: string | null
          frequency: string
          habit_name: string
          id: string
          is_active: boolean
          longest_streak: number
          role_context: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_streak?: number
          custom_days?: Json | null
          emoji?: string | null
          frequency?: string
          habit_name: string
          id?: string
          is_active?: boolean
          longest_streak?: number
          role_context?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_streak?: number
          custom_days?: Json | null
          emoji?: string | null
          frequency?: string
          habit_name?: string
          id?: string
          is_active?: boolean
          longest_streak?: number
          role_context?: string
          user_id?: string
        }
        Relationships: []
      }
      task_tracker_journal: {
        Row: {
          content: string
          created_at: string
          entry_date: string
          id: string
          mood: string | null
          role_context: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content?: string
          created_at?: string
          entry_date: string
          id?: string
          mood?: string | null
          role_context?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          entry_date?: string
          id?: string
          mood?: string | null
          role_context?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      task_tracker_recurring: {
        Row: {
          created_at: string
          description: string | null
          end_date: string | null
          first_date: string
          frequency: string
          id: string
          importance: string
          is_active: boolean
          person_in_charge: string | null
          priority: string
          role_context: string
          task_name: string
          updated_at: string
          urgency: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          end_date?: string | null
          first_date: string
          frequency?: string
          id?: string
          importance?: string
          is_active?: boolean
          person_in_charge?: string | null
          priority?: string
          role_context?: string
          task_name: string
          updated_at?: string
          urgency?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          end_date?: string | null
          first_date?: string
          frequency?: string
          id?: string
          importance?: string
          is_active?: boolean
          person_in_charge?: string | null
          priority?: string
          role_context?: string
          task_name?: string
          updated_at?: string
          urgency?: string
          user_id?: string
        }
        Relationships: []
      }
      task_tracker_schedule: {
        Row: {
          created_at: string
          decision: string | null
          done_at: string | null
          id: string
          is_done: boolean
          new_date: string | null
          occurrence_date: string
          override_decision: string | null
          override_description: string | null
          override_person: string | null
          override_priority: string | null
          recurring_task_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          decision?: string | null
          done_at?: string | null
          id?: string
          is_done?: boolean
          new_date?: string | null
          occurrence_date: string
          override_decision?: string | null
          override_description?: string | null
          override_person?: string | null
          override_priority?: string | null
          recurring_task_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          decision?: string | null
          done_at?: string | null
          id?: string
          is_done?: boolean
          new_date?: string | null
          occurrence_date?: string
          override_decision?: string | null
          override_description?: string | null
          override_person?: string | null
          override_priority?: string | null
          recurring_task_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_tracker_schedule_recurring_task_id_fkey"
            columns: ["recurring_task_id"]
            isOneToOne: false
            referencedRelation: "task_tracker_recurring"
            referencedColumns: ["id"]
          },
        ]
      }
      task_tracker_settings: {
        Row: {
          created_at: string
          holidays: Json
          id: string
          kanban_categories: Json
          people_in_charge: Json
          role_context: string
          statuses: Json
          theme: string
          updated_at: string
          user_id: string
          working_days: Json
        }
        Insert: {
          created_at?: string
          holidays?: Json
          id?: string
          kanban_categories?: Json
          people_in_charge?: Json
          role_context?: string
          statuses?: Json
          theme?: string
          updated_at?: string
          user_id: string
          working_days?: Json
        }
        Update: {
          created_at?: string
          holidays?: Json
          id?: string
          kanban_categories?: Json
          people_in_charge?: Json
          role_context?: string
          statuses?: Json
          theme?: string
          updated_at?: string
          user_id?: string
          working_days?: Json
        }
        Relationships: []
      }
      task_tracker_tasks: {
        Row: {
          completed_at: string | null
          created_at: string
          decision: string | null
          description: string | null
          due_date: string | null
          gantt_color: string | null
          id: string
          importance: string
          is_completed: boolean
          kanban_category: string | null
          notes: string | null
          person_in_charge: string | null
          priority: string
          progress: number
          project_name: string | null
          role_context: string
          start_date: string | null
          status: string
          task_name: string
          updated_at: string
          urgency: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          decision?: string | null
          description?: string | null
          due_date?: string | null
          gantt_color?: string | null
          id?: string
          importance?: string
          is_completed?: boolean
          kanban_category?: string | null
          notes?: string | null
          person_in_charge?: string | null
          priority?: string
          progress?: number
          project_name?: string | null
          role_context?: string
          start_date?: string | null
          status?: string
          task_name: string
          updated_at?: string
          urgency?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          decision?: string | null
          description?: string | null
          due_date?: string | null
          gantt_color?: string | null
          id?: string
          importance?: string
          is_completed?: boolean
          kanban_category?: string | null
          notes?: string | null
          person_in_charge?: string | null
          priority?: string
          progress?: number
          project_name?: string | null
          role_context?: string
          start_date?: string | null
          status?: string
          task_name?: string
          updated_at?: string
          urgency?: string
          user_id?: string
        }
        Relationships: []
      }
      telegram_bot_users: {
        Row: {
          appointment_reminders: boolean | null
          chat_id: string
          created_at: string | null
          first_name: string | null
          id: string
          is_linked: boolean | null
          lab_alerts: boolean | null
          last_message_at: string | null
          last_name: string | null
          medicine_reminders: boolean | null
          message_count: number | null
          notifications_enabled: boolean | null
          patient_id: string | null
          phone: string | null
          preferred_language: string | null
          telegram_id: string
          username: string | null
        }
        Insert: {
          appointment_reminders?: boolean | null
          chat_id: string
          created_at?: string | null
          first_name?: string | null
          id?: string
          is_linked?: boolean | null
          lab_alerts?: boolean | null
          last_message_at?: string | null
          last_name?: string | null
          medicine_reminders?: boolean | null
          message_count?: number | null
          notifications_enabled?: boolean | null
          patient_id?: string | null
          phone?: string | null
          preferred_language?: string | null
          telegram_id: string
          username?: string | null
        }
        Update: {
          appointment_reminders?: boolean | null
          chat_id?: string
          created_at?: string | null
          first_name?: string | null
          id?: string
          is_linked?: boolean | null
          lab_alerts?: boolean | null
          last_message_at?: string | null
          last_name?: string | null
          medicine_reminders?: boolean | null
          message_count?: number | null
          notifications_enabled?: boolean | null
          patient_id?: string | null
          phone?: string | null
          preferred_language?: string | null
          telegram_id?: string
          username?: string | null
        }
        Relationships: []
      }
      therapist_availability_slots: {
        Row: {
          created_at: string
          day_of_week: number
          end_time: string
          id: string
          is_active: boolean
          start_time: string
          therapist_id: string
        }
        Insert: {
          created_at?: string
          day_of_week: number
          end_time: string
          id?: string
          is_active?: boolean
          start_time: string
          therapist_id: string
        }
        Update: {
          created_at?: string
          day_of_week?: number
          end_time?: string
          id?: string
          is_active?: boolean
          start_time?: string
          therapist_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "therapist_availability_slots_therapist_id_fkey"
            columns: ["therapist_id"]
            isOneToOne: false
            referencedRelation: "therapists"
            referencedColumns: ["id"]
          },
        ]
      }
      therapist_blocked_dates: {
        Row: {
          blocked_date: string
          created_at: string
          id: string
          reason: string | null
          therapist_id: string
        }
        Insert: {
          blocked_date: string
          created_at?: string
          id?: string
          reason?: string | null
          therapist_id: string
        }
        Update: {
          blocked_date?: string
          created_at?: string
          id?: string
          reason?: string | null
          therapist_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "therapist_blocked_dates_therapist_id_fkey"
            columns: ["therapist_id"]
            isOneToOne: false
            referencedRelation: "therapists"
            referencedColumns: ["id"]
          },
        ]
      }
      therapist_content_posts: {
        Row: {
          body: string | null
          created_at: string
          id: string
          image_url: string | null
          is_published: boolean
          post_type: string
          share_count: number
          therapist_id: string
          therapy_type: string | null
          title: string
          updated_at: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          is_published?: boolean
          post_type: string
          share_count?: number
          therapist_id: string
          therapy_type?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          body?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          is_published?: boolean
          post_type?: string
          share_count?: number
          therapist_id?: string
          therapy_type?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "therapist_content_posts_therapist_id_fkey"
            columns: ["therapist_id"]
            isOneToOne: false
            referencedRelation: "therapists"
            referencedColumns: ["id"]
          },
        ]
      }
      therapist_geofence_logs: {
        Row: {
          action_allowed: boolean
          action_attempted: string
          created_at: string
          distance_meters: number
          id: string
          session_id: string
          therapist_id: string
          therapist_lat: number
          therapist_lng: number
          venue_lat: number | null
          venue_lng: number | null
          within_range: boolean
        }
        Insert: {
          action_allowed: boolean
          action_attempted: string
          created_at?: string
          distance_meters: number
          id?: string
          session_id: string
          therapist_id: string
          therapist_lat: number
          therapist_lng: number
          venue_lat?: number | null
          venue_lng?: number | null
          within_range: boolean
        }
        Update: {
          action_allowed?: boolean
          action_attempted?: string
          created_at?: string
          distance_meters?: number
          id?: string
          session_id?: string
          therapist_id?: string
          therapist_lat?: number
          therapist_lng?: number
          venue_lat?: number | null
          venue_lng?: number | null
          within_range?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "therapist_geofence_logs_therapist_id_fkey"
            columns: ["therapist_id"]
            isOneToOne: false
            referencedRelation: "therapists"
            referencedColumns: ["id"]
          },
        ]
      }
      therapist_learning_content: {
        Row: {
          article_body: string | null
          content_type: string
          created_at: string
          description: string | null
          difficulty_level: string | null
          duration_minutes: number | null
          id: string
          is_published: boolean
          therapy_type: string | null
          thumbnail_url: string | null
          title: string
          video_url: string | null
        }
        Insert: {
          article_body?: string | null
          content_type: string
          created_at?: string
          description?: string | null
          difficulty_level?: string | null
          duration_minutes?: number | null
          id?: string
          is_published?: boolean
          therapy_type?: string | null
          thumbnail_url?: string | null
          title: string
          video_url?: string | null
        }
        Update: {
          article_body?: string | null
          content_type?: string
          created_at?: string
          description?: string | null
          difficulty_level?: string | null
          duration_minutes?: number | null
          id?: string
          is_published?: boolean
          therapy_type?: string | null
          thumbnail_url?: string | null
          title?: string
          video_url?: string | null
        }
        Relationships: []
      }
      therapist_learning_progress: {
        Row: {
          completed_at: string | null
          content_id: string
          created_at: string
          id: string
          score: number | null
          status: string
          therapist_id: string
        }
        Insert: {
          completed_at?: string | null
          content_id: string
          created_at?: string
          id?: string
          score?: number | null
          status?: string
          therapist_id: string
        }
        Update: {
          completed_at?: string | null
          content_id?: string
          created_at?: string
          id?: string
          score?: number | null
          status?: string
          therapist_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "therapist_learning_progress_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "therapist_learning_content"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "therapist_learning_progress_therapist_id_fkey"
            columns: ["therapist_id"]
            isOneToOne: false
            referencedRelation: "therapists"
            referencedColumns: ["id"]
          },
        ]
      }
      therapist_material_consumption: {
        Row: {
          created_at: string
          discrepancy_notes: string | null
          estimated_cost: number | null
          has_discrepancy: boolean
          id: string
          items: Json
          session_id: string
          therapist_id: string
          venue_acknowledged: boolean
          venue_acknowledged_at: string | null
          venue_acknowledged_by: string | null
          venue_id: string | null
        }
        Insert: {
          created_at?: string
          discrepancy_notes?: string | null
          estimated_cost?: number | null
          has_discrepancy?: boolean
          id?: string
          items?: Json
          session_id: string
          therapist_id: string
          venue_acknowledged?: boolean
          venue_acknowledged_at?: string | null
          venue_acknowledged_by?: string | null
          venue_id?: string | null
        }
        Update: {
          created_at?: string
          discrepancy_notes?: string | null
          estimated_cost?: number | null
          has_discrepancy?: boolean
          id?: string
          items?: Json
          session_id?: string
          therapist_id?: string
          venue_acknowledged?: boolean
          venue_acknowledged_at?: string | null
          venue_acknowledged_by?: string | null
          venue_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "therapist_material_consumption_therapist_id_fkey"
            columns: ["therapist_id"]
            isOneToOne: false
            referencedRelation: "therapists"
            referencedColumns: ["id"]
          },
        ]
      }
      therapist_messages: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          is_urgent: boolean
          message: string
          message_type: string
          read_at: string | null
          recipient_id: string
          recipient_type: string
          sender_id: string
          sender_type: string
          session_id: string | null
          subject: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          is_urgent?: boolean
          message: string
          message_type?: string
          read_at?: string | null
          recipient_id: string
          recipient_type: string
          sender_id: string
          sender_type: string
          session_id?: string | null
          subject?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          is_urgent?: boolean
          message?: string
          message_type?: string
          read_at?: string | null
          recipient_id?: string
          recipient_type?: string
          sender_id?: string
          sender_type?: string
          session_id?: string | null
          subject?: string | null
        }
        Relationships: []
      }
      therapist_patient_notes: {
        Row: {
          allergies: string | null
          contraindications: string | null
          created_at: string
          id: string
          pain_tolerance: string | null
          patient_name: string
          patient_phone: string | null
          preferences: Json | null
          special_notes: string | null
          tags: string[] | null
          therapist_id: string
          updated_at: string
        }
        Insert: {
          allergies?: string | null
          contraindications?: string | null
          created_at?: string
          id?: string
          pain_tolerance?: string | null
          patient_name: string
          patient_phone?: string | null
          preferences?: Json | null
          special_notes?: string | null
          tags?: string[] | null
          therapist_id: string
          updated_at?: string
        }
        Update: {
          allergies?: string | null
          contraindications?: string | null
          created_at?: string
          id?: string
          pain_tolerance?: string | null
          patient_name?: string
          patient_phone?: string | null
          preferences?: Json | null
          special_notes?: string | null
          tags?: string[] | null
          therapist_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "therapist_patient_notes_therapist_id_fkey"
            columns: ["therapist_id"]
            isOneToOne: false
            referencedRelation: "therapists"
            referencedColumns: ["id"]
          },
        ]
      }
      therapist_patient_reviews: {
        Row: {
          comment: string | null
          compliment_tags: string[] | null
          created_at: string
          id: string
          is_public: boolean
          patient_name: string
          rating: number
          responded_at: string | null
          session_id: string | null
          therapist_id: string
          therapist_response: string | null
        }
        Insert: {
          comment?: string | null
          compliment_tags?: string[] | null
          created_at?: string
          id?: string
          is_public?: boolean
          patient_name: string
          rating: number
          responded_at?: string | null
          session_id?: string | null
          therapist_id: string
          therapist_response?: string | null
        }
        Update: {
          comment?: string | null
          compliment_tags?: string[] | null
          created_at?: string
          id?: string
          is_public?: boolean
          patient_name?: string
          rating?: number
          responded_at?: string | null
          session_id?: string | null
          therapist_id?: string
          therapist_response?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "therapist_patient_reviews_therapist_id_fkey"
            columns: ["therapist_id"]
            isOneToOne: false
            referencedRelation: "therapists"
            referencedColumns: ["id"]
          },
        ]
      }
      therapist_performance_scores: {
        Row: {
          calculated_at: string
          checklists_completed: number
          doctor_approvals_received: number
          doctor_satisfaction_score: number
          id: string
          ontime_arrival_score: number
          overall_score: number
          patient_feedback_score: number
          period_month: number
          period_year: number
          protocol_adherence_score: number
          session_completion_score: number
          sessions_completed: number
          sessions_on_time: number
          therapist_id: string
          total_sessions: number
        }
        Insert: {
          calculated_at?: string
          checklists_completed?: number
          doctor_approvals_received?: number
          doctor_satisfaction_score?: number
          id?: string
          ontime_arrival_score?: number
          overall_score?: number
          patient_feedback_score?: number
          period_month: number
          period_year: number
          protocol_adherence_score?: number
          session_completion_score?: number
          sessions_completed?: number
          sessions_on_time?: number
          therapist_id: string
          total_sessions?: number
        }
        Update: {
          calculated_at?: string
          checklists_completed?: number
          doctor_approvals_received?: number
          doctor_satisfaction_score?: number
          id?: string
          ontime_arrival_score?: number
          overall_score?: number
          patient_feedback_score?: number
          period_month?: number
          period_year?: number
          protocol_adherence_score?: number
          session_completion_score?: number
          sessions_completed?: number
          sessions_on_time?: number
          therapist_id?: string
          total_sessions?: number
        }
        Relationships: [
          {
            foreignKeyName: "therapist_performance_scores_therapist_id_fkey"
            columns: ["therapist_id"]
            isOneToOne: false
            referencedRelation: "therapists"
            referencedColumns: ["id"]
          },
        ]
      }
      therapist_pre_procedure_checklists: {
        Row: {
          all_clear: boolean
          completed_at: string | null
          created_at: string
          doctor_instruction_received: boolean
          id: string
          materials_match_prescription: boolean
          notes: string | null
          patient_consent_acknowledged: boolean
          patient_identity_verified: boolean
          room_table_ready: boolean
          session_id: string
          therapist_id: string
          verified_by_venue_staff: string | null
        }
        Insert: {
          all_clear?: boolean
          completed_at?: string | null
          created_at?: string
          doctor_instruction_received?: boolean
          id?: string
          materials_match_prescription?: boolean
          notes?: string | null
          patient_consent_acknowledged?: boolean
          patient_identity_verified?: boolean
          room_table_ready?: boolean
          session_id: string
          therapist_id: string
          verified_by_venue_staff?: string | null
        }
        Update: {
          all_clear?: boolean
          completed_at?: string | null
          created_at?: string
          doctor_instruction_received?: boolean
          id?: string
          materials_match_prescription?: boolean
          notes?: string | null
          patient_consent_acknowledged?: boolean
          patient_identity_verified?: boolean
          room_table_ready?: boolean
          session_id?: string
          therapist_id?: string
          verified_by_venue_staff?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "therapist_pre_procedure_checklists_therapist_id_fkey"
            columns: ["therapist_id"]
            isOneToOne: false
            referencedRelation: "therapists"
            referencedColumns: ["id"]
          },
        ]
      }
      therapist_progress_entries: {
        Row: {
          course_id: string
          created_at: string
          digestion_score: number | null
          dosha_current: Json | null
          energy_score: number | null
          id: string
          mobility_score: number | null
          pain_score: number | null
          patient_feedback: string | null
          session_date: string
          session_number: number
          sleep_score: number | null
          therapist_observation: string | null
        }
        Insert: {
          course_id: string
          created_at?: string
          digestion_score?: number | null
          dosha_current?: Json | null
          energy_score?: number | null
          id?: string
          mobility_score?: number | null
          pain_score?: number | null
          patient_feedback?: string | null
          session_date: string
          session_number: number
          sleep_score?: number | null
          therapist_observation?: string | null
        }
        Update: {
          course_id?: string
          created_at?: string
          digestion_score?: number | null
          dosha_current?: Json | null
          energy_score?: number | null
          id?: string
          mobility_score?: number | null
          pain_score?: number | null
          patient_feedback?: string | null
          session_date?: string
          session_number?: number
          sleep_score?: number | null
          therapist_observation?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "therapist_progress_entries_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "therapist_treatment_courses"
            referencedColumns: ["id"]
          },
        ]
      }
      therapist_referral_links: {
        Row: {
          bookings_from_referral: number
          clicks: number
          created_at: string
          id: string
          referral_code: string
          therapist_id: string
        }
        Insert: {
          bookings_from_referral?: number
          clicks?: number
          created_at?: string
          id?: string
          referral_code: string
          therapist_id: string
        }
        Update: {
          bookings_from_referral?: number
          clicks?: number
          created_at?: string
          id?: string
          referral_code?: string
          therapist_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "therapist_referral_links_therapist_id_fkey"
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
          created_at: string | null
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
          created_at?: string | null
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
          created_at?: string | null
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
            foreignKeyName: "therapist_safety_flags_therapist_id_fkey"
            columns: ["therapist_id"]
            isOneToOne: false
            referencedRelation: "therapists"
            referencedColumns: ["id"]
          },
        ]
      }
      therapist_scheduling_settings: {
        Row: {
          advance_booking_days: number
          auto_accept_bookings: boolean
          buffer_minutes: number
          max_sessions_per_day: number
          therapist_id: string
          updated_at: string
        }
        Insert: {
          advance_booking_days?: number
          auto_accept_bookings?: boolean
          buffer_minutes?: number
          max_sessions_per_day?: number
          therapist_id: string
          updated_at?: string
        }
        Update: {
          advance_booking_days?: number
          auto_accept_bookings?: boolean
          buffer_minutes?: number
          max_sessions_per_day?: number
          therapist_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "therapist_scheduling_settings_therapist_id_fkey"
            columns: ["therapist_id"]
            isOneToOne: true
            referencedRelation: "therapists"
            referencedColumns: ["id"]
          },
        ]
      }
      therapist_session_notes: {
        Row: {
          adverse_reactions: string | null
          after_care_instructions: string | null
          agni_status: string | null
          ai_generated_summary: string | null
          ama_status: string | null
          created_at: string
          doctor_acknowledged: boolean
          doctor_acknowledged_at: string | null
          doctor_id: string | null
          doctor_response: string | null
          dosha_assessment: Json | null
          duration_applied: number | null
          id: string
          note_status: string
          observations: string | null
          oil_decoction_used: string | null
          patient_name: string
          patient_tolerance: string | null
          prakriti_observed: string | null
          procedure_notes: string | null
          pulse_after: string | null
          pulse_before: string | null
          quantity_used: string | null
          recommendations_for_doctor: string | null
          roga_bala: string | null
          rogi_bala: string | null
          sent_to_doctor: boolean
          session_id: string
          skin_response: string | null
          sweat_response: string | null
          temperature: string | null
          therapist_id: string
          therapy_response: string | null
          therapy_type: string
          updated_at: string
          vyadhi_assessment: string | null
        }
        Insert: {
          adverse_reactions?: string | null
          after_care_instructions?: string | null
          agni_status?: string | null
          ai_generated_summary?: string | null
          ama_status?: string | null
          created_at?: string
          doctor_acknowledged?: boolean
          doctor_acknowledged_at?: string | null
          doctor_id?: string | null
          doctor_response?: string | null
          dosha_assessment?: Json | null
          duration_applied?: number | null
          id?: string
          note_status?: string
          observations?: string | null
          oil_decoction_used?: string | null
          patient_name: string
          patient_tolerance?: string | null
          prakriti_observed?: string | null
          procedure_notes?: string | null
          pulse_after?: string | null
          pulse_before?: string | null
          quantity_used?: string | null
          recommendations_for_doctor?: string | null
          roga_bala?: string | null
          rogi_bala?: string | null
          sent_to_doctor?: boolean
          session_id: string
          skin_response?: string | null
          sweat_response?: string | null
          temperature?: string | null
          therapist_id: string
          therapy_response?: string | null
          therapy_type: string
          updated_at?: string
          vyadhi_assessment?: string | null
        }
        Update: {
          adverse_reactions?: string | null
          after_care_instructions?: string | null
          agni_status?: string | null
          ai_generated_summary?: string | null
          ama_status?: string | null
          created_at?: string
          doctor_acknowledged?: boolean
          doctor_acknowledged_at?: string | null
          doctor_id?: string | null
          doctor_response?: string | null
          dosha_assessment?: Json | null
          duration_applied?: number | null
          id?: string
          note_status?: string
          observations?: string | null
          oil_decoction_used?: string | null
          patient_name?: string
          patient_tolerance?: string | null
          prakriti_observed?: string | null
          procedure_notes?: string | null
          pulse_after?: string | null
          pulse_before?: string | null
          quantity_used?: string | null
          recommendations_for_doctor?: string | null
          roga_bala?: string | null
          rogi_bala?: string | null
          sent_to_doctor?: boolean
          session_id?: string
          skin_response?: string | null
          sweat_response?: string | null
          temperature?: string | null
          therapist_id?: string
          therapy_response?: string | null
          therapy_type?: string
          updated_at?: string
          vyadhi_assessment?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "therapist_session_notes_therapist_id_fkey"
            columns: ["therapist_id"]
            isOneToOne: false
            referencedRelation: "therapists"
            referencedColumns: ["id"]
          },
        ]
      }
      therapist_session_signoffs: {
        Row: {
          auto_approve_after: string | null
          created_at: string
          doctor_comments: string | null
          doctor_id: string | null
          doctor_rating: number | null
          earnings_amount: number | null
          earnings_released: boolean
          earnings_released_at: string | null
          id: string
          reviewed_at: string | null
          revision_reason: string | null
          session_id: string
          status: string
          submitted_at: string
          therapist_id: string
        }
        Insert: {
          auto_approve_after?: string | null
          created_at?: string
          doctor_comments?: string | null
          doctor_id?: string | null
          doctor_rating?: number | null
          earnings_amount?: number | null
          earnings_released?: boolean
          earnings_released_at?: string | null
          id?: string
          reviewed_at?: string | null
          revision_reason?: string | null
          session_id: string
          status?: string
          submitted_at?: string
          therapist_id: string
        }
        Update: {
          auto_approve_after?: string | null
          created_at?: string
          doctor_comments?: string | null
          doctor_id?: string | null
          doctor_rating?: number | null
          earnings_amount?: number | null
          earnings_released?: boolean
          earnings_released_at?: string | null
          id?: string
          reviewed_at?: string | null
          revision_reason?: string | null
          session_id?: string
          status?: string
          submitted_at?: string
          therapist_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "therapist_session_signoffs_therapist_id_fkey"
            columns: ["therapist_id"]
            isOneToOne: false
            referencedRelation: "therapists"
            referencedColumns: ["id"]
          },
        ]
      }
      therapist_shift_assignments: {
        Row: {
          assigned_at: string
          assigned_by: string | null
          completed_sessions: number
          created_at: string
          end_time: string
          expected_sessions: number
          id: string
          notes: string | null
          shift_date: string
          shift_type: string
          start_time: string
          status: string
          therapist_confirmed_at: string | null
          therapist_id: string
          venue_address: string | null
          venue_id: string | null
          venue_name: string
        }
        Insert: {
          assigned_at?: string
          assigned_by?: string | null
          completed_sessions?: number
          created_at?: string
          end_time: string
          expected_sessions?: number
          id?: string
          notes?: string | null
          shift_date: string
          shift_type: string
          start_time: string
          status?: string
          therapist_confirmed_at?: string | null
          therapist_id: string
          venue_address?: string | null
          venue_id?: string | null
          venue_name: string
        }
        Update: {
          assigned_at?: string
          assigned_by?: string | null
          completed_sessions?: number
          created_at?: string
          end_time?: string
          expected_sessions?: number
          id?: string
          notes?: string | null
          shift_date?: string
          shift_type?: string
          start_time?: string
          status?: string
          therapist_confirmed_at?: string | null
          therapist_id?: string
          venue_address?: string | null
          venue_id?: string | null
          venue_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "therapist_shift_assignments_therapist_id_fkey"
            columns: ["therapist_id"]
            isOneToOne: false
            referencedRelation: "therapists"
            referencedColumns: ["id"]
          },
        ]
      }
      therapist_support_tickets: {
        Row: {
          admin_response: string | null
          category: string
          created_at: string
          description: string
          id: string
          priority: string
          resolved_at: string | null
          status: string
          subject: string
          therapist_id: string
          updated_at: string
        }
        Insert: {
          admin_response?: string | null
          category: string
          created_at?: string
          description: string
          id?: string
          priority?: string
          resolved_at?: string | null
          status?: string
          subject: string
          therapist_id: string
          updated_at?: string
        }
        Update: {
          admin_response?: string | null
          category?: string
          created_at?: string
          description?: string
          id?: string
          priority?: string
          resolved_at?: string | null
          status?: string
          subject?: string
          therapist_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "therapist_support_tickets_therapist_id_fkey"
            columns: ["therapist_id"]
            isOneToOne: false
            referencedRelation: "therapists"
            referencedColumns: ["id"]
          },
        ]
      }
      therapist_treatment_courses: {
        Row: {
          after_photo_url: string | null
          before_photo_url: string | null
          completed_sessions: number
          created_at: string
          doctor_approved: boolean
          dosha_baseline: Json | null
          expected_end_date: string | null
          id: string
          patient_name: string
          patient_phone: string | null
          photo_consent: boolean
          prescribing_doctor_id: string | null
          start_date: string
          status: string
          therapist_id: string
          therapy_type: string
          total_sessions: number
          updated_at: string
        }
        Insert: {
          after_photo_url?: string | null
          before_photo_url?: string | null
          completed_sessions?: number
          created_at?: string
          doctor_approved?: boolean
          dosha_baseline?: Json | null
          expected_end_date?: string | null
          id?: string
          patient_name: string
          patient_phone?: string | null
          photo_consent?: boolean
          prescribing_doctor_id?: string | null
          start_date: string
          status?: string
          therapist_id: string
          therapy_type: string
          total_sessions?: number
          updated_at?: string
        }
        Update: {
          after_photo_url?: string | null
          before_photo_url?: string | null
          completed_sessions?: number
          created_at?: string
          doctor_approved?: boolean
          dosha_baseline?: Json | null
          expected_end_date?: string | null
          id?: string
          patient_name?: string
          patient_phone?: string | null
          photo_consent?: boolean
          prescribing_doctor_id?: string | null
          start_date?: string
          status?: string
          therapist_id?: string
          therapy_type?: string
          total_sessions?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "therapist_treatment_courses_therapist_id_fkey"
            columns: ["therapist_id"]
            isOneToOne: false
            referencedRelation: "therapists"
            referencedColumns: ["id"]
          },
        ]
      }
      therapists: {
        Row: {
          avatar_url: string | null
          bio: string | null
          city: string | null
          created_at: string | null
          email: string | null
          experience_years: number | null
          full_name: string
          id: string
          is_banned: boolean | null
          is_suspended: boolean | null
          is_verified: boolean | null
          phone: string | null
          rating: number | null
          rejection_reason: string | null
          specialization: string | null
          total_sessions: number | null
          user_id: string | null
          verification_status: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          city?: string | null
          created_at?: string | null
          email?: string | null
          experience_years?: number | null
          full_name: string
          id?: string
          is_banned?: boolean | null
          is_suspended?: boolean | null
          is_verified?: boolean | null
          phone?: string | null
          rating?: number | null
          rejection_reason?: string | null
          specialization?: string | null
          total_sessions?: number | null
          user_id?: string | null
          verification_status?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          city?: string | null
          created_at?: string | null
          email?: string | null
          experience_years?: number | null
          full_name?: string
          id?: string
          is_banned?: boolean | null
          is_suspended?: boolean | null
          is_verified?: boolean | null
          phone?: string | null
          rating?: number | null
          rejection_reason?: string | null
          specialization?: string | null
          total_sessions?: number | null
          user_id?: string | null
          verification_status?: string | null
        }
        Relationships: []
      }
      therapy_protocol_library: {
        Row: {
          contraindications: string[] | null
          created_at: string
          description: string | null
          difficulty_level: string | null
          duration_minutes: number | null
          id: string
          indications: string[] | null
          is_published: boolean
          materials_required: Json | null
          post_procedure_steps: Json | null
          precautions: string[] | null
          preparation_steps: Json | null
          procedure_steps: Json | null
          reference_text: string | null
          therapy_type: string
          title: string
          updated_at: string
        }
        Insert: {
          contraindications?: string[] | null
          created_at?: string
          description?: string | null
          difficulty_level?: string | null
          duration_minutes?: number | null
          id?: string
          indications?: string[] | null
          is_published?: boolean
          materials_required?: Json | null
          post_procedure_steps?: Json | null
          precautions?: string[] | null
          preparation_steps?: Json | null
          procedure_steps?: Json | null
          reference_text?: string | null
          therapy_type: string
          title: string
          updated_at?: string
        }
        Update: {
          contraindications?: string[] | null
          created_at?: string
          description?: string | null
          difficulty_level?: string | null
          duration_minutes?: number | null
          id?: string
          indications?: string[] | null
          is_published?: boolean
          materials_required?: Json | null
          post_procedure_steps?: Json | null
          precautions?: string[] | null
          preparation_steps?: Json | null
          procedure_steps?: Json | null
          reference_text?: string | null
          therapy_type?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      therapy_venues: {
        Row: {
          address: string | null
          city: string | null
          created_at: string | null
          facilities: string[] | null
          id: string
          is_verified: boolean | null
          name: string
          phone: string | null
          rating: number | null
          user_id: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          created_at?: string | null
          facilities?: string[] | null
          id?: string
          is_verified?: boolean | null
          name: string
          phone?: string | null
          rating?: number | null
          user_id?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          created_at?: string | null
          facilities?: string[] | null
          id?: string
          is_verified?: boolean | null
          name?: string
          phone?: string | null
          rating?: number | null
          user_id?: string | null
        }
        Relationships: []
      }
      treatment_outcomes: {
        Row: {
          baseline_severity: number | null
          condition_treated: string
          created_at: string | null
          diagnosis_details: string | null
          doctor_id: string
          duration_days: number | null
          final_severity: number | null
          follow_up_count: number | null
          id: string
          improvement_percentage: number | null
          is_published: boolean | null
          medicines_used: Json | null
          notes: string | null
          outcome_status: string
          patient_id: string | null
          patient_satisfaction: number | null
          protocol_id: string | null
          side_effects: string | null
          therapies_used: Json | null
          treatment_end_date: string | null
          treatment_start_date: string
          updated_at: string | null
          verified: boolean | null
        }
        Insert: {
          baseline_severity?: number | null
          condition_treated: string
          created_at?: string | null
          diagnosis_details?: string | null
          doctor_id: string
          duration_days?: number | null
          final_severity?: number | null
          follow_up_count?: number | null
          id?: string
          improvement_percentage?: number | null
          is_published?: boolean | null
          medicines_used?: Json | null
          notes?: string | null
          outcome_status?: string
          patient_id?: string | null
          patient_satisfaction?: number | null
          protocol_id?: string | null
          side_effects?: string | null
          therapies_used?: Json | null
          treatment_end_date?: string | null
          treatment_start_date: string
          updated_at?: string | null
          verified?: boolean | null
        }
        Update: {
          baseline_severity?: number | null
          condition_treated?: string
          created_at?: string | null
          diagnosis_details?: string | null
          doctor_id?: string
          duration_days?: number | null
          final_severity?: number | null
          follow_up_count?: number | null
          id?: string
          improvement_percentage?: number | null
          is_published?: boolean | null
          medicines_used?: Json | null
          notes?: string | null
          outcome_status?: string
          patient_id?: string | null
          patient_satisfaction?: number | null
          protocol_id?: string | null
          side_effects?: string | null
          therapies_used?: Json | null
          treatment_end_date?: string | null
          treatment_start_date?: string
          updated_at?: string | null
          verified?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "treatment_outcomes_protocol_id_fkey"
            columns: ["protocol_id"]
            isOneToOne: false
            referencedRelation: "treatment_protocols"
            referencedColumns: ["id"]
          },
        ]
      }
      treatment_protocols: {
        Row: {
          condition: string
          contraindications: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          dietary_guidelines: string | null
          duration_days: number | null
          expected_outcomes: string | null
          id: string
          is_standard: boolean | null
          lifestyle_guidelines: string | null
          medicines: Json | null
          name: string
          status: string | null
          steps: Json | null
          success_rate: number | null
          system_of_medicine: string
          therapies: Json | null
          updated_at: string | null
          usage_count: number | null
        }
        Insert: {
          condition: string
          contraindications?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          dietary_guidelines?: string | null
          duration_days?: number | null
          expected_outcomes?: string | null
          id?: string
          is_standard?: boolean | null
          lifestyle_guidelines?: string | null
          medicines?: Json | null
          name: string
          status?: string | null
          steps?: Json | null
          success_rate?: number | null
          system_of_medicine?: string
          therapies?: Json | null
          updated_at?: string | null
          usage_count?: number | null
        }
        Update: {
          condition?: string
          contraindications?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          dietary_guidelines?: string | null
          duration_days?: number | null
          expected_outcomes?: string | null
          id?: string
          is_standard?: boolean | null
          lifestyle_guidelines?: string | null
          medicines?: Json | null
          name?: string
          status?: string | null
          steps?: Json | null
          success_rate?: number | null
          system_of_medicine?: string
          therapies?: Json | null
          updated_at?: string | null
          usage_count?: number | null
        }
        Relationships: []
      }
      unified_notifications: {
        Row: {
          created_at: string
          expires_at: string | null
          id: string
          is_dismissed: boolean
          is_read: boolean
          message: string
          priority: string
          read_at: string | null
          source_id: string | null
          source_module: string
          source_url: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          id?: string
          is_dismissed?: boolean
          is_read?: boolean
          message?: string
          priority?: string
          read_at?: string | null
          source_id?: string | null
          source_module?: string
          source_url?: string | null
          title: string
          type?: string
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          id?: string
          is_dismissed?: boolean
          is_read?: boolean
          message?: string
          priority?: string
          read_at?: string | null
          source_id?: string | null
          source_module?: string
          source_url?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      user_badges: {
        Row: {
          badge_id: string
          coins_awarded: number
          earned_at: string
          id: string
          points_awarded: number
          role: string
          user_id: string
        }
        Insert: {
          badge_id: string
          coins_awarded?: number
          earned_at?: string
          id?: string
          points_awarded?: number
          role: string
          user_id: string
        }
        Update: {
          badge_id?: string
          coins_awarded?: number
          earned_at?: string
          id?: string
          points_awarded?: number
          role?: string
          user_id?: string
        }
        Relationships: []
      }
      user_coins: {
        Row: {
          created_at: string
          current_rank: string
          id: string
          role: string
          total_coins: number
          total_points: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_rank?: string
          id?: string
          role: string
          total_coins?: number
          total_points?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_rank?: string
          id?: string
          role?: string
          total_coins?: number
          total_points?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_streaks: {
        Row: {
          created_at: string
          current_streak: number
          id: string
          last_activity_date: string
          longest_streak: number
          role: string
          streak_start_date: string
          streak_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_streak?: number
          id?: string
          last_activity_date?: string
          longest_streak?: number
          role: string
          streak_start_date?: string
          streak_type?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_streak?: number
          id?: string
          last_activity_date?: string
          longest_streak?: number
          role?: string
          streak_start_date?: string
          streak_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      vaidya_answers: {
        Row: {
          content: string
          created_at: string | null
          id: string
          is_accepted: boolean | null
          question_id: string
          upvotes: number | null
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          is_accepted?: boolean | null
          question_id: string
          upvotes?: number | null
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          is_accepted?: boolean | null
          question_id?: string
          upvotes?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vaidya_answers_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "vaidya_questions"
            referencedColumns: ["id"]
          },
        ]
      }
      vaidya_question_upvotes: {
        Row: {
          created_at: string | null
          id: string
          question_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          question_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          question_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vaidya_question_upvotes_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "vaidya_questions"
            referencedColumns: ["id"]
          },
        ]
      }
      vaidya_questions: {
        Row: {
          answer_count: number | null
          body: string
          created_at: string | null
          id: string
          is_resolved: boolean | null
          subject: string
          tags: string[] | null
          title: string
          updated_at: string | null
          upvotes: number | null
          user_id: string
        }
        Insert: {
          answer_count?: number | null
          body: string
          created_at?: string | null
          id?: string
          is_resolved?: boolean | null
          subject?: string
          tags?: string[] | null
          title: string
          updated_at?: string | null
          upvotes?: number | null
          user_id: string
        }
        Update: {
          answer_count?: number | null
          body?: string
          created_at?: string | null
          id?: string
          is_resolved?: boolean | null
          subject?: string
          tags?: string[] | null
          title?: string
          updated_at?: string | null
          upvotes?: number | null
          user_id?: string
        }
        Relationships: []
      }
      voice_agent_sessions: {
        Row: {
          ai_confidence: number | null
          call_duration_seconds: number | null
          caller_phone: string | null
          channel: string | null
          clinic_id: string | null
          created_at: string | null
          ended_at: string | null
          entities_extracted: Json | null
          id: string
          intent_detected: string | null
          language: string | null
          outcome: string | null
          outcome_data: Json | null
          patient_id: string | null
          patient_satisfaction: number | null
          recording_url: string | null
          session_type: string | null
          started_at: string | null
          status: string | null
          transcript: string | null
          transcript_segments: Json | null
          transfer_reason: string | null
          transferred_to: string | null
        }
        Insert: {
          ai_confidence?: number | null
          call_duration_seconds?: number | null
          caller_phone?: string | null
          channel?: string | null
          clinic_id?: string | null
          created_at?: string | null
          ended_at?: string | null
          entities_extracted?: Json | null
          id?: string
          intent_detected?: string | null
          language?: string | null
          outcome?: string | null
          outcome_data?: Json | null
          patient_id?: string | null
          patient_satisfaction?: number | null
          recording_url?: string | null
          session_type?: string | null
          started_at?: string | null
          status?: string | null
          transcript?: string | null
          transcript_segments?: Json | null
          transfer_reason?: string | null
          transferred_to?: string | null
        }
        Update: {
          ai_confidence?: number | null
          call_duration_seconds?: number | null
          caller_phone?: string | null
          channel?: string | null
          clinic_id?: string | null
          created_at?: string | null
          ended_at?: string | null
          entities_extracted?: Json | null
          id?: string
          intent_detected?: string | null
          language?: string | null
          outcome?: string | null
          outcome_data?: Json | null
          patient_id?: string | null
          patient_satisfaction?: number | null
          recording_url?: string | null
          session_type?: string | null
          started_at?: string | null
          status?: string | null
          transcript?: string | null
          transcript_segments?: Json | null
          transfer_reason?: string | null
          transferred_to?: string | null
        }
        Relationships: []
      }
      volume_discount_slabs: {
        Row: {
          bonus_reward_points: number | null
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          margin_percentage: number
          max_order_value: number | null
          min_order_value: number
          slab_name: string
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          bonus_reward_points?: number | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          margin_percentage?: number
          max_order_value?: number | null
          min_order_value?: number
          slab_name: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          bonus_reward_points?: number | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          margin_percentage?: number
          max_order_value?: number | null
          min_order_value?: number
          slab_name?: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      competition_college_leaderboard: {
        Row: {
          avg_score: number | null
          college_name: string | null
          competition_id: string | null
          participants: number | null
          top_score: number | null
          total_attempted: number | null
          total_correct: number | null
          total_score: number | null
        }
        Relationships: []
      }
      gamification_leaderboard: {
        Row: {
          badge_count: number | null
          current_rank: string | null
          login_streak: number | null
          role: string | null
          total_coins: number | null
          total_points: number | null
          updated_at: string | null
          user_id: string | null
        }
        Relationships: []
      }
      hrms_v_attrition_monthly: {
        Row: {
          better_opportunity: number | null
          dissatisfaction: number | null
          health: number | null
          month: number | null
          other: number | null
          period_label: string | null
          personal: number | null
          relocation: number | null
          resignations: number | null
          year: number | null
        }
        Relationships: []
      }
      hrms_v_branch_workforce: {
        Row: {
          absent_today: number | null
          branch_code: string | null
          branch_id: string | null
          branch_name: string | null
          branch_payroll: number | null
          branch_type: string | null
          present_today: number | null
          total_staff: number | null
        }
        Relationships: []
      }
      hrms_v_department_workforce: {
        Row: {
          absent_today: number | null
          active: number | null
          avg_salary: number | null
          department: string | null
          department_payroll: number | null
          female: number | null
          male: number | null
          on_leave_today: number | null
          present_today: number | null
          total_employees: number | null
        }
        Relationships: []
      }
      hrms_v_doctor_activity: {
        Row: {
          avg_patient_rating: number | null
          consultations_month: number | null
          consultations_today: number | null
          department: string | null
          employee_code: string | null
          employee_id: string | null
          follow_up_rate: number | null
          name: string | null
          productivity_score: number | null
          revenue_month: number | null
          role: string | null
          salary: number | null
          today_attendance: string | null
        }
        Insert: {
          avg_patient_rating?: never
          consultations_month?: never
          consultations_today?: never
          department?: string | null
          employee_code?: string | null
          employee_id?: string | null
          follow_up_rate?: never
          name?: string | null
          productivity_score?: number | null
          revenue_month?: never
          role?: string | null
          salary?: never
          today_attendance?: string | null
        }
        Update: {
          avg_patient_rating?: never
          consultations_month?: never
          consultations_today?: never
          department?: string | null
          employee_code?: string | null
          employee_id?: string | null
          follow_up_rate?: never
          name?: string | null
          productivity_score?: number | null
          revenue_month?: never
          role?: string | null
          salary?: never
          today_attendance?: string | null
        }
        Relationships: []
      }
      hrms_v_expiring_documents: {
        Row: {
          days_until_expiry: number | null
          document_id: string | null
          document_name: string | null
          document_type: string | null
          employee_code: string | null
          employee_id: string | null
          employee_name: string | null
          expiry_date: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hrms_employee_documents_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "hms_staff"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hrms_employee_documents_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "hrms_v_doctor_activity"
            referencedColumns: ["employee_id"]
          },
          {
            foreignKeyName: "hrms_employee_documents_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "hrms_v_probation_ending"
            referencedColumns: ["employee_id"]
          },
          {
            foreignKeyName: "hrms_employee_documents_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "hrms_v_therapist_activity"
            referencedColumns: ["employee_id"]
          },
        ]
      }
      hrms_v_expiring_registrations: {
        Row: {
          days_until_expiry: number | null
          employee_code: string | null
          employee_id: string | null
          employee_name: string | null
          qualification: string | null
          qualification_id: string | null
          registration_authority: string | null
          registration_expiry: string | null
          registration_number: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hrms_employee_qualifications_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "hms_staff"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hrms_employee_qualifications_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "hrms_v_doctor_activity"
            referencedColumns: ["employee_id"]
          },
          {
            foreignKeyName: "hrms_employee_qualifications_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "hrms_v_probation_ending"
            referencedColumns: ["employee_id"]
          },
          {
            foreignKeyName: "hrms_employee_qualifications_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "hrms_v_therapist_activity"
            referencedColumns: ["employee_id"]
          },
        ]
      }
      hrms_v_expiring_training_certs: {
        Row: {
          certificate_expiry: string | null
          days_until_expiry: number | null
          employee_code: string | null
          employee_id: string | null
          employee_name: string | null
          training_name: string | null
          training_record_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hrms_employee_training_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "hms_staff"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hrms_employee_training_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "hrms_v_doctor_activity"
            referencedColumns: ["employee_id"]
          },
          {
            foreignKeyName: "hrms_employee_training_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "hrms_v_probation_ending"
            referencedColumns: ["employee_id"]
          },
          {
            foreignKeyName: "hrms_employee_training_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "hrms_v_therapist_activity"
            referencedColumns: ["employee_id"]
          },
        ]
      }
      hrms_v_probation_ending: {
        Row: {
          days_until_end: number | null
          department: string | null
          employee_code: string | null
          employee_id: string | null
          join_date: string | null
          name: string | null
          probation_end_date: string | null
          role: string | null
        }
        Insert: {
          days_until_end?: never
          department?: string | null
          employee_code?: string | null
          employee_id?: string | null
          join_date?: string | null
          name?: string | null
          probation_end_date?: string | null
          role?: string | null
        }
        Update: {
          days_until_end?: never
          department?: string | null
          employee_code?: string | null
          employee_id?: string | null
          join_date?: string | null
          name?: string | null
          probation_end_date?: string | null
          role?: string | null
        }
        Relationships: []
      }
      hrms_v_therapist_activity: {
        Row: {
          avg_therapy_rating: number | null
          department: string | null
          employee_code: string | null
          employee_id: string | null
          name: string | null
          procedures_month: number | null
          procedures_today: number | null
          productivity_score: number | null
          role: string | null
          today_attendance: string | null
        }
        Insert: {
          avg_therapy_rating?: never
          department?: string | null
          employee_code?: string | null
          employee_id?: string | null
          name?: string | null
          procedures_month?: never
          procedures_today?: never
          productivity_score?: number | null
          role?: string | null
          today_attendance?: string | null
        }
        Update: {
          avg_therapy_rating?: never
          department?: string | null
          employee_code?: string | null
          employee_id?: string | null
          name?: string | null
          procedures_month?: never
          procedures_today?: never
          productivity_score?: number | null
          role?: string | null
          today_attendance?: string | null
        }
        Relationships: []
      }
      hrms_v_workforce_summary: {
        Row: {
          active_employees: number | null
          avg_salary: number | null
          avg_tenure_days: number | null
          consultant_count: number | null
          contract_count: number | null
          exited_total: number | null
          female_count: number | null
          male_count: number | null
          new_joiners_30d: number | null
          new_joiners_90d: number | null
          on_notice: number | null
          on_probation: number | null
          other_gender_count: number | null
          other_type_count: number | null
          permanent_count: number | null
          total_active: number | null
          total_monthly_payroll: number | null
        }
        Relationships: []
      }
      mis_daily_revenue: {
        Row: {
          bill_date: string | null
          branch: string | null
          collected: number | null
          outstanding: number | null
          paid_count: number | null
          pending_count: number | null
          total_bills: number | null
          total_revenue: number | null
        }
        Relationships: []
      }
      mis_department_revenue: {
        Row: {
          bill_count: number | null
          bill_date: string | null
          branch: string | null
          department: string | null
          revenue: number | null
        }
        Relationships: []
      }
      mis_doctor_revenue: {
        Row: {
          bill_count: number | null
          branch: string | null
          doctor_name: string | null
          month: string | null
          revenue: number | null
        }
        Relationships: []
      }
      mis_opd_summary: {
        Row: {
          branch: string | null
          completed: number | null
          followups: number | null
          no_shows: number | null
          teleconsults: number | null
          total_visits: number | null
          visit_date: string | null
          walkins: number | null
        }
        Relationships: []
      }
      mis_today_collection_by_dept: {
        Row: {
          department: string | null
          pct: number | null
          total_amount: number | null
          total_bills: number | null
        }
        Relationships: []
      }
      mis_today_collection_by_user: {
        Row: {
          collected_by_name: string | null
          payment_mode: string | null
          total_amount: number | null
          total_bills: number | null
        }
        Relationships: []
      }
      mis_today_hourly_collection: {
        Row: {
          hour: number | null
          total_amount: number | null
        }
        Relationships: []
      }
      unified_patient_directory: {
        Row: {
          abha_id: string | null
          ayuzee_patient_id: string | null
          blood_group: string | null
          city: string | null
          created_at: string | null
          date_of_birth: string | null
          email: string | null
          full_name: string | null
          gender: string | null
          hms_branch_id: string | null
          hms_op_number: string | null
          hms_patient_linked: boolean | null
          is_active: boolean | null
          linked_branch: string | null
          phone: string | null
          profile_id: string | null
          state: string | null
          sync_status: string | null
          user_id: string | null
        }
        Insert: {
          abha_id?: string | null
          ayuzee_patient_id?: string | null
          blood_group?: string | null
          city?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          email?: string | null
          full_name?: string | null
          gender?: string | null
          hms_branch_id?: string | null
          hms_op_number?: string | null
          hms_patient_linked?: boolean | null
          is_active?: boolean | null
          linked_branch?: never
          phone?: string | null
          profile_id?: string | null
          state?: string | null
          sync_status?: never
          user_id?: string | null
        }
        Update: {
          abha_id?: string | null
          ayuzee_patient_id?: string | null
          blood_group?: string | null
          city?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          email?: string | null
          full_name?: string | null
          gender?: string | null
          hms_branch_id?: string | null
          hms_op_number?: string | null
          hms_patient_linked?: boolean | null
          is_active?: boolean | null
          linked_branch?: never
          phone?: string | null
          profile_id?: string | null
          state?: string | null
          sync_status?: never
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_hms_branch_id_fkey"
            columns: ["hms_branch_id"]
            isOneToOne: false
            referencedRelation: "hms_branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_hms_branch_id_fkey"
            columns: ["hms_branch_id"]
            isOneToOne: false
            referencedRelation: "hrms_v_branch_workforce"
            referencedColumns: ["branch_id"]
          },
        ]
      }
      unified_patient_view: {
        Row: {
          bridge_records_count: number | null
          city: string | null
          date_of_birth: string | null
          gender: string | null
          has_hms_record: boolean | null
          name: string | null
          phone: string | null
          user_id: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      auto_mark_noshow: { Args: never; Returns: number }
      calculate_level: {
        Args: { total_xp: number }
        Returns: {
          level: number
          title: string
          xp_to_next: number
        }[]
      }
      check_ip_rate_limit: { Args: { p_ip_address: string }; Returns: Json }
      check_login_rate_limit: {
        Args: { p_email: string; p_ip_address?: string }
        Returns: Json
      }
      check_slot_available: {
        Args: {
          p_branch?: string
          p_date: string
          p_doctor_name: string
          p_start_time: string
        }
        Returns: boolean
      }
      complete_account_onboarding: {
        Args: { p_full_name: string; p_requested_role: string }
        Returns: undefined
      }
      create_notification: {
        Args: {
          p_message?: string
          p_priority?: string
          p_source_id?: string
          p_source_module?: string
          p_source_url?: string
          p_title: string
          p_type?: string
          p_user_id: string
        }
        Returns: string
      }
      detect_patient_duplicates: { Args: never; Returns: number }
      find_or_link_patient: {
        Args: {
          _branch_id?: string
          _city?: string
          _date_of_birth?: string
          _email?: string
          _gender?: string
          _name?: string
          _phone: string
        }
        Returns: {
          ayuzee_patient_id: string
          full_name: string
          is_existing: boolean
          profile_id: string
          user_id: string
        }[]
      }
      generate_ayuzee_patient_id: { Args: never; Returns: string }
      generate_bill_number: { Args: { p_branch?: string }; Returns: string }
      generate_claim_number: { Args: never; Returns: string }
      generate_eod_report: {
        Args: { p_date: string; p_location?: string }
        Returns: string
      }
      generate_grn_number: { Args: never; Returns: string }
      generate_ip_number: { Args: never; Returns: string }
      generate_lab_order_number: { Args: never; Returns: string }
      generate_op_number: { Args: { _branch_code?: string }; Returns: string }
      generate_patient_id: { Args: { prefix?: string }; Returns: string }
      generate_patient_uhid: { Args: never; Returns: string }
      generate_po_number: { Args: never; Returns: string }
      generate_receipt_number: { Args: never; Returns: string }
      get_account_onboarding: {
        Args: never
        Returns: {
          completed_at: string
          full_name: string
          requested_role: string
        }[]
      }
      get_accounts_daily_summary: {
        Args: { p_date?: string }
        Returns: {
          cash_collection: number
          digital_collection: number
          expense_count: number
          net_position: number
          receipt_count: number
          total_collection: number
          total_expenses: number
        }[]
      }
      get_doctor_queue_stats: {
        Args: { p_doctor_id: string }
        Returns: {
          avg_consultation_minutes: number
          avg_wait_minutes: number
          longest_wait_minutes: number
          queue_depth: number
          seen_today: number
        }[]
      }
      get_doctor_revenue_summary: {
        Args: { p_doctor_id: string; p_from: string; p_to: string }
        Returns: {
          category: string
          entry_count: number
          percentage: number
          total_amount: number
        }[]
      }
      get_expense_summary: {
        Args: { p_from: string; p_location?: string; p_to: string }
        Returns: {
          category: string
          entry_count: number
          percentage: number
          total_amount: number
        }[]
      }
      get_hms_entity_id: { Args: never; Returns: string }
      get_lab_dashboard_stats: {
        Args: { p_location?: string }
        Returns: {
          avg_tat_minutes: number
          cancelled_today: number
          completed_today: number
          critical_alerts: number
          in_progress_today: number
          pending_amount: number
          pending_today: number
          total_orders_today: number
          total_revenue_today: number
        }[]
      }
      get_lab_dept_performance: {
        Args: { p_from: string; p_to: string }
        Returns: {
          avg_tat_minutes: number
          completed_count: number
          department: string
          revenue: number
          test_count: number
        }[]
      }
      get_lab_revenue_by_doctor: {
        Args: { p_from: string; p_location?: string; p_to: string }
        Returns: {
          doctor_name: string
          referral_count: number
          revenue: number
        }[]
      }
      get_lab_revenue_by_test: {
        Args: { p_from: string; p_location?: string; p_to: string }
        Returns: {
          avg_price: number
          revenue: number
          test_count: number
          test_name: string
        }[]
      }
      get_mis_appointment_summary: {
        Args: { p_from: string; p_to: string }
        Returns: {
          cancelled: number
          completed: number
          doctor_id: string
          doctor_name: string
          no_show: number
          total_fee: number
          total_visits: number
        }[]
      }
      get_mis_collection_summary: {
        Args: { p_from: string; p_location?: string; p_to: string }
        Returns: {
          bill_count: number
          card_amount: number
          cash_amount: number
          collection_date: string
          credit_amount: number
          total_amount: number
          upi_amount: number
        }[]
      }
      get_patient_allergy_summary: {
        Args: { p_patient_id: string }
        Returns: {
          drug_count: number
          food_count: number
          interaction_count: number
          severe_count: number
          total_allergies: number
        }[]
      }
      get_patient_compliance_summary: {
        Args: { p_patient_id: string }
        Returns: {
          diet_compliance: number
          followup_visits: number
          lifestyle_changes: number
          medication_adherence: number
          overall_score: number
          streak_days: number
          yoga_exercise: number
        }[]
      }
      has_hms_role: { Args: { required_roles: string[] }; Returns: boolean }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      hrms_is_holiday: {
        Args: { _branch_id?: string; _date: string }
        Returns: boolean
      }
      hrms_working_days: {
        Args: {
          _branch_id?: string
          _from: string
          _to: string
          _weekly_off?: string
        }
        Returns: number
      }
      is_admin_or_super: { Args: { _user_id: string }; Returns: boolean }
      is_branch_manager: {
        Args: { _branch_id: string; _user_id: string }
        Returns: boolean
      }
      is_hms_staff:
        | { Args: never; Returns: boolean }
        | { Args: { _user_id: string }; Returns: boolean }
      is_hr_admin: { Args: { _user_id: string }; Returns: boolean }
      next_session_token: {
        Args: { p_branch?: string; p_doctor_id?: string }
        Returns: number
      }
      record_login_attempt: {
        Args: {
          p_clinic_id?: string
          p_email: string
          p_failure_reason?: string
          p_ip_address?: string
          p_success?: boolean
          p_user_agent?: string
          p_user_id?: string
        }
        Returns: undefined
      }
      search_patient: {
        Args: { _query: string }
        Returns: {
          ayuzee_patient_id: string
          city: string
          date_of_birth: string
          email: string
          full_name: string
          gender: string
          hms_op_number: string
          hms_patient_linked: boolean
          phone: string
          profile_id: string
          sync_status: string
        }[]
      }
      set_leaderboard_visibility: {
        Args: { p_published: boolean }
        Returns: undefined
      }
      spine_csr_public_impact: { Args: never; Returns: Json }
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
        | "product_admin"
        | "blog_admin"
        | "content_admin"
        | "orders_admin"
        | "accounts_admin"
        | "doctor_admin"
        | "ayush_admin"
        | "support_admin"
        | "manufacturer"
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
      app_role: [
        "admin",
        "doctor",
        "patient",
        "therapist",
        "provider",
        "super_admin",
        "student",
        "venue_owner",
        "product_admin",
        "blog_admin",
        "content_admin",
        "orders_admin",
        "accounts_admin",
        "doctor_admin",
        "ayush_admin",
        "support_admin",
        "manufacturer",
      ],
    },
  },
} as const
