-- ═══════════════════════════════════════════════════════════════════════════════
-- FIX: Grant permissions for P3 Clinical Intelligence tables
-- These GRANT statements allow the Supabase client (authenticated users)
-- to access the tables via PostgREST API.
-- Without these, even with RLS policies, the API returns 404/permission denied.
-- ═══════════════════════════════════════════════════════════════════════════════

-- AI Feedback table
GRANT SELECT, INSERT ON public.ai_feedback TO authenticated;
GRANT ALL ON public.ai_feedback TO service_role;

-- MedAssist Triage Bot tables
GRANT SELECT, INSERT, UPDATE ON public.medassist_sessions TO authenticated;
GRANT ALL ON public.medassist_sessions TO service_role;

GRANT SELECT, INSERT ON public.medassist_messages TO authenticated;
GRANT ALL ON public.medassist_messages TO service_role;

-- Drug-Herb Interaction tables (edge function uses service_role, but also allow read from client)
GRANT SELECT ON public.interaction_substances TO authenticated;
GRANT SELECT ON public.interaction_substances TO anon;
GRANT ALL ON public.interaction_substances TO service_role;

GRANT SELECT ON public.drug_herb_interactions TO authenticated;
GRANT SELECT ON public.drug_herb_interactions TO anon;
GRANT ALL ON public.drug_herb_interactions TO service_role;

GRANT SELECT, INSERT ON public.interaction_search_logs TO authenticated;
GRANT ALL ON public.interaction_search_logs TO service_role;

-- Classical Reference tables (edge function uses service_role, but also allow read from client)
GRANT SELECT ON public.classical_texts TO authenticated;
GRANT SELECT ON public.classical_texts TO anon;
GRANT ALL ON public.classical_texts TO service_role;

GRANT SELECT ON public.classical_references TO authenticated;
GRANT SELECT ON public.classical_references TO anon;
GRANT ALL ON public.classical_references TO service_role;

GRANT SELECT, INSERT ON public.classical_reference_searches TO authenticated;
GRANT ALL ON public.classical_reference_searches TO service_role;

-- Parsed Medical Documents (OCR pipeline)
GRANT SELECT, INSERT, UPDATE ON public.parsed_medical_documents TO authenticated;
GRANT ALL ON public.parsed_medical_documents TO service_role;

GRANT SELECT, INSERT ON public.parsed_lab_values TO authenticated;
GRANT ALL ON public.parsed_lab_values TO service_role;

GRANT SELECT, INSERT ON public.document_parsing_queue TO authenticated;
GRANT ALL ON public.document_parsing_queue TO service_role;

-- AI Usage Logs (ai-gateway writes here)
GRANT SELECT, INSERT ON public.ai_usage_logs TO authenticated;
GRANT ALL ON public.ai_usage_logs TO service_role;
