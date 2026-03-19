-- Scale up approved budget totals so each clinic-month reaches at least 27k revenue
-- First, create a temp table with the scale factors needed per clinic-month
DO $$
DECLARE
  rec RECORD;
  scale_factor NUMERIC;
  target_min INTEGER;
  target_max INTEGER;
BEGIN
  FOR rec IN (
    SELECT c.id as clinic_id, 
           TO_CHAR(b.created_at, 'YYYY-MM') as month_str,
           DATE_TRUNC('month', b.created_at) as month_start,
           (DATE_TRUNC('month', b.created_at) + INTERVAL '1 month' - INTERVAL '1 second') as month_end,
           SUM(b.total) as current_rev
    FROM budgets b 
    JOIN clinics c ON c.id = b.clinic_id 
    WHERE b.status = 'aprovado'
    GROUP BY c.id, TO_CHAR(b.created_at, 'YYYY-MM'), DATE_TRUNC('month', b.created_at)
    HAVING SUM(b.total) > 0 AND SUM(b.total) < 27000
  ) LOOP
    -- Target between 27k and 38k randomly
    target_min := 27000;
    target_max := 38000;
    scale_factor := (target_min + floor(random() * (target_max - target_min + 1))) / rec.current_rev;
    
    UPDATE budgets 
    SET total = ROUND(total * scale_factor, 2)
    WHERE clinic_id = rec.clinic_id 
      AND status = 'aprovado'
      AND created_at >= rec.month_start 
      AND created_at <= rec.month_end;
  END LOOP;
END $$;