-- Selection enhancements
ALTER TABLE public.case_rubric_selections
  ADD COLUMN IF NOT EXISTS doctor_grade SMALLINT NOT NULL DEFAULT 2 CHECK (doctor_grade BETWEEN 1 AND 4),
  ADD COLUMN IF NOT EXISTS is_srp BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_keynote BOOLEAN NOT NULL DEFAULT false;

-- Rubric meta
ALTER TABLE public.homeopathy_rubrics
  ADD COLUMN IF NOT EXISTS is_small_rubric BOOLEAN NOT NULL DEFAULT false;

-- Repertorisation function
-- remedies JSONB shape: [{"abbr":"sulph","name":"Sulphur","grade":3}, ...]
CREATE OR REPLACE FUNCTION public.repertorize_case(_case_id UUID)
RETURNS TABLE(
  abbreviation TEXT,
  remedy_name TEXT,
  total_score NUMERIC,
  rubrics_covered INT,
  total_rubrics INT,
  coverage_pct NUMERIC,
  max_grade INT,
  srp_hits INT
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH sel AS (
    SELECT s.rubric_id, s.doctor_grade, s.is_srp, s.is_keynote, r.remedies
    FROM case_rubric_selections s
    JOIN homeopathy_rubrics r ON r.id = s.rubric_id
    WHERE s.case_id = _case_id
  ),
  totals AS (
    SELECT count(*)::int AS total_rubrics FROM sel
  ),
  exploded AS (
    SELECT
      lower(coalesce(rem->>'abbr', rem->>'abbreviation', rem->>'name'))                AS abbr,
      coalesce(rem->>'name', rem->>'abbr', rem->>'abbreviation')                       AS rname,
      coalesce((rem->>'grade')::int, 1)                                                AS r_grade,
      sel.doctor_grade,
      sel.is_srp,
      sel.is_keynote,
      sel.rubric_id
    FROM sel, jsonb_array_elements(sel.remedies) AS rem
    WHERE coalesce(rem->>'abbr', rem->>'abbreviation', rem->>'name') IS NOT NULL
  ),
  scored AS (
    SELECT
      abbr,
      max(rname) AS remedy_name,
      sum(
        r_grade::numeric * doctor_grade::numeric
        * CASE WHEN is_srp THEN 2.0 ELSE 1.0 END
        * CASE WHEN is_keynote THEN 1.5 ELSE 1.0 END
      ) AS total_score,
      count(DISTINCT rubric_id)::int AS rubrics_covered,
      max(r_grade)::int AS max_grade,
      count(DISTINCT rubric_id) FILTER (WHERE is_srp)::int AS srp_hits
    FROM exploded
    GROUP BY abbr
  )
  SELECT
    s.abbr,
    s.remedy_name,
    s.total_score,
    s.rubrics_covered,
    t.total_rubrics,
    CASE WHEN t.total_rubrics > 0 THEN round((s.rubrics_covered::numeric / t.total_rubrics) * 100, 1) ELSE 0 END,
    s.max_grade,
    s.srp_hits
  FROM scored s, totals t
  ORDER BY s.rubrics_covered DESC, s.total_score DESC, s.remedy_name ASC
  LIMIT 50;
$$;

GRANT EXECUTE ON FUNCTION public.repertorize_case(UUID) TO authenticated;