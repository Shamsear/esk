-- Function to calculate salary as 5% of value
CREATE OR REPLACE FUNCTION calculate_salary_from_value()
RETURNS TRIGGER AS $$
BEGIN
    -- Only update the salary if value is not null
    IF NEW.value IS NOT NULL THEN
        -- Set salary to 5% of value, rounded to 1 decimal place
        NEW.salary := ROUND((NEW.value * 0.05)::numeric, 1);
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop the trigger if it already exists to avoid errors on recreation
DROP TRIGGER IF EXISTS set_salary_on_squad_changes ON manager_squads;

-- Create trigger to run before insert or update on manager_squads
CREATE TRIGGER set_salary_on_squad_changes
BEFORE INSERT OR UPDATE ON manager_squads
FOR EACH ROW
EXECUTE FUNCTION calculate_salary_from_value();

-- Explanation:
-- This trigger automatically sets the salary to 5% of the value whenever:
-- 1. A new record is inserted into manager_squads
-- 2. An existing record's value is updated in manager_squads
-- 
-- For existing records, you can run:
-- UPDATE manager_squads SET value = value WHERE value IS NOT NULL;
-- This will trigger the calculation for all existing records 