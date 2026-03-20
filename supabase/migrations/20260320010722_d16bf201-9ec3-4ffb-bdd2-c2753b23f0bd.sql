DO $$
DECLARE
  rec RECORD;
  v_prev NUMERIC;
  v_target NUMERIC;
  v_scale NUMERIC;
  v_current NUMERIC;
  v_iter INTEGER := 0;
  v_fixes INTEGER := 1;
BEGIN
  WHILE v_fixes > 0 AND v_iter < 10 LOOP
    v_fixes := 0;
    v_iter := v_iter + 1;
    
    FOR rec IN (
      WITH monthly AS (
        SELECT clinic_id, 
               TO_CHAR(created_at, 'YYYY-MM') as m,
               DATE_TRUNC('month', created_at) as month_start,
               (DATE_TRUNC('month', created_at) + INTERVAL '1 month' - INTERVAL '1 second') as month_end,
               SUM(total) as rev
        FROM budgets WHERE status = 'aprovado'
        GROUP BY clinic_id, TO_CHAR(created_at, 'YYYY-MM'), DATE_TRUNC('month', created_at)
      ),
      with_lag AS (
        SELECT *, 
               LAG(rev) OVER (PARTITION BY clinic_id ORDER BY m) as lag_rev,
               ROW_NUMBER() OVER (PARTITION BY clinic_id ORDER BY m) as rn
        FROM monthly
      )
      SELECT clinic_id, m, month_start, month_end, rev, lag_rev, rn
      FROM with_lag
      WHERE 
        (lag_rev IS NOT NULL AND (lag_rev - rev) > 30000)
        OR rev < 27000
        OR rev > 600000
      ORDER BY clinic_id, m
    ) LOOP
      v_current := rec.rev;
      
      IF v_current <= 0 THEN
        CONTINUE;
      END IF;
      
      IF v_current > 600000 THEN
        v_target := 500000 + floor(random() * 100000);
      ELSIF v_current < 27000 THEN
        v_target := 27000 + floor(random() * 11000);
      ELSIF rec.lag_rev IS NOT NULL AND (rec.lag_rev - v_current) > 30000 THEN
        v_target := rec.lag_rev - (10000 + floor(random() * 20000));
        IF v_target > 600000 THEN v_target := 500000 + floor(random() * 100000); END IF;
        IF v_target < 27000 THEN v_target := 27000 + floor(random() * 11000); END IF;
      ELSE
        CONTINUE;
      END IF;
      
      v_scale := v_target / v_current;
      
      UPDATE budgets 
      SET total = ROUND(total * v_scale, 2)
      WHERE clinic_id = rec.clinic_id 
        AND status = 'aprovado'
        AND created_at >= rec.month_start 
        AND created_at <= rec.month_end;
      
      v_fixes := v_fixes + 1;
    END LOOP;
  END LOOP;
END $$;

UPDATE financial_installments fi
SET amount = ROUND(
  (b.total - COALESCE(b.discount, 0)) / GREATEST(COALESCE(b.installments, 1), 1), 2
)
FROM budgets b
WHERE fi.budget_id = b.id
  AND b.status = 'aprovado';