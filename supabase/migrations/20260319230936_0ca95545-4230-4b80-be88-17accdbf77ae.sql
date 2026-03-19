
-- RPC to get aggregated clinic metrics for admin dashboard (avoids fetching all rows)
CREATE OR REPLACE FUNCTION public.admin_clinic_metrics()
RETURNS TABLE (
  clinic_id uuid,
  patient_count bigint,
  appointment_count bigint,
  approved_revenue numeric
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    c.id AS clinic_id,
    COALESCE(p.cnt, 0) AS patient_count,
    COALESCE(a.cnt, 0) AS appointment_count,
    COALESCE(b.revenue, 0) AS approved_revenue
  FROM clinics c
  LEFT JOIN (SELECT clinic_id, COUNT(*) AS cnt FROM patients GROUP BY clinic_id) p ON p.clinic_id = c.id
  LEFT JOIN (SELECT clinic_id, COUNT(*) AS cnt FROM appointments GROUP BY clinic_id) a ON a.clinic_id = c.id
  LEFT JOIN (SELECT clinic_id, SUM(COALESCE(total, 0)) AS revenue FROM budgets WHERE status = 'aprovado' GROUP BY clinic_id) b ON b.clinic_id = c.id
$$;

-- RPC to get counts for a single clinic detail page
CREATE OR REPLACE FUNCTION public.clinic_detail_counts(_clinic_id uuid)
RETURNS TABLE (
  patient_count bigint,
  appointment_count bigint,
  budget_count bigint,
  approved_revenue numeric,
  lead_count bigint,
  in_treatment_count bigint
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    (SELECT COUNT(*) FROM patients WHERE clinic_id = _clinic_id),
    (SELECT COUNT(*) FROM appointments WHERE clinic_id = _clinic_id),
    (SELECT COUNT(*) FROM budgets WHERE clinic_id = _clinic_id),
    (SELECT COALESCE(SUM(total), 0) FROM budgets WHERE clinic_id = _clinic_id AND status = 'aprovado'),
    (SELECT COUNT(*) FROM patients WHERE clinic_id = _clinic_id AND stage = 'lead'),
    (SELECT COUNT(*) FROM patients WHERE clinic_id = _clinic_id AND stage IN ('in_treatment', 'em_tratamento'))
$$;
