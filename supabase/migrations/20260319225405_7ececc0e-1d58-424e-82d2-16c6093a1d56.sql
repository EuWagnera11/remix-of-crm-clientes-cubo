
-- Reduce budget totals for clinics with monthly revenue > 600k
UPDATE budgets SET total = total * 0.60, discount = discount * 0.60
WHERE clinic_id IN (SELECT id FROM clinics WHERE owner_name = 'Dr(a). Ricardo Rodrigues');

UPDATE budgets SET total = total * 0.62, discount = discount * 0.62
WHERE clinic_id IN (SELECT id FROM clinics WHERE owner_name = 'Dr(a). Sandra Reis');

UPDATE budgets SET total = total * 0.68, discount = discount * 0.68
WHERE clinic_id IN (SELECT id FROM clinics WHERE owner_name = 'Dr(a). Matheus Barbosa');

-- Reduce installment amounts too
UPDATE financial_installments SET amount = amount * 0.60
WHERE clinic_id IN (SELECT id FROM clinics WHERE owner_name = 'Dr(a). Ricardo Rodrigues');

UPDATE financial_installments SET amount = amount * 0.62
WHERE clinic_id IN (SELECT id FROM clinics WHERE owner_name = 'Dr(a). Sandra Reis');

UPDATE financial_installments SET amount = amount * 0.68
WHERE clinic_id IN (SELECT id FROM clinics WHERE owner_name = 'Dr(a). Matheus Barbosa');
