-- Competition Awards Schema
-- This script creates award tables for each competition type and populates them from manager_data.json

-- 1. First, create a table to link awards to specific competitions
CREATE TABLE IF NOT EXISTS competition_awards (
  id SERIAL PRIMARY KEY,
  competition_id INTEGER REFERENCES competitions(id),
  season_id INTEGER REFERENCES seasons(id),
  award_type TEXT NOT NULL, -- 'golden_boot', 'golden_glove', etc.
  player_name TEXT, -- Optional: if we want to track which player won the award
  manager_id INTEGER REFERENCES managers(id),
  UNIQUE (competition_id, season_id, award_type)
);

-- 2. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_competition_awards_competition_id ON competition_awards(competition_id);
CREATE INDEX IF NOT EXISTS idx_competition_awards_season_id ON competition_awards(season_id);
CREATE INDEX IF NOT EXISTS idx_competition_awards_manager_id ON competition_awards(manager_id);

-- 3. Create a function to sync awards from manager_data.json to competition_awards table
CREATE OR REPLACE FUNCTION sync_competition_awards()
RETURNS TRIGGER AS $$
DECLARE
  season_id_var INTEGER;
  competition_id_var INTEGER;
BEGIN
  -- Get the current season ID for this manager
  SELECT id INTO season_id_var FROM seasons 
  WHERE manager_id = NEW.id 
  AND number = NEW.current_season;
  
  -- Only proceed if we have a valid season
  IF season_id_var IS NOT NULL THEN
    -- Process each season record for this manager
    FOR i IN 1..array_length(NEW.seasons, 1) LOOP
      IF NEW.seasons[i] IS NOT NULL AND NEW.seasons[i]->'awards' IS NOT NULL THEN
        
        -- League Golden Boot
        IF (NEW.seasons[i]->'awards'->>'golden_boot' = 'true' OR 
            NEW.seasons[i]->'awards'->>'league_golden_boot' = 'true') THEN
          
          -- Find the division competition ID
          SELECT sc.competition_id INTO competition_id_var
          FROM season_competitions sc
          JOIN competitions c ON sc.competition_id = c.id
          WHERE sc.season_id = season_id_var
          AND (c.name LIKE 'DIVISION%' OR c.name = 'DIVISION');
          
          IF competition_id_var IS NOT NULL THEN
            -- Insert or update the award
            INSERT INTO competition_awards 
              (competition_id, season_id, award_type, manager_id)
            VALUES 
              (competition_id_var, season_id_var, 'golden_boot', NEW.id)
            ON CONFLICT (competition_id, season_id, award_type)
            DO UPDATE SET manager_id = NEW.id;
          END IF;
        END IF;
        
        -- League Golden Glove
        IF (NEW.seasons[i]->'awards'->>'golden_glove' = 'true' OR 
            NEW.seasons[i]->'awards'->>'league_golden_glove' = 'true') THEN
          
          -- Find the division competition ID
          SELECT sc.competition_id INTO competition_id_var
          FROM season_competitions sc
          JOIN competitions c ON sc.competition_id = c.id
          WHERE sc.season_id = season_id_var
          AND (c.name LIKE 'DIVISION%' OR c.name = 'DIVISION');
          
          IF competition_id_var IS NOT NULL THEN
            -- Insert or update the award
            INSERT INTO competition_awards 
              (competition_id, season_id, award_type, manager_id)
            VALUES 
              (competition_id_var, season_id_var, 'golden_glove', NEW.id)
            ON CONFLICT (competition_id, season_id, award_type)
            DO UPDATE SET manager_id = NEW.id;
          END IF;
        END IF;
        
        -- UCL Golden Boot
        IF NEW.seasons[i]->'awards'->>'ucl_golden_boot' = 'true' THEN
          -- Find the UCL competition ID
          SELECT sc.competition_id INTO competition_id_var
          FROM season_competitions sc
          JOIN competitions c ON sc.competition_id = c.id
          WHERE sc.season_id = season_id_var
          AND c.name = 'UCL';
          
          IF competition_id_var IS NOT NULL THEN
            -- Insert or update the award
            INSERT INTO competition_awards 
              (competition_id, season_id, award_type, manager_id)
            VALUES 
              (competition_id_var, season_id_var, 'golden_boot', NEW.id)
            ON CONFLICT (competition_id, season_id, award_type)
            DO UPDATE SET manager_id = NEW.id;
          END IF;
        END IF;
        
        -- UEL Golden Boot
        IF NEW.seasons[i]->'awards'->>'uel_golden_boot' = 'true' THEN
          -- Find the UEL competition ID
          SELECT sc.competition_id INTO competition_id_var
          FROM season_competitions sc
          JOIN competitions c ON sc.competition_id = c.id
          WHERE sc.season_id = season_id_var
          AND c.name = 'UEL';
          
          IF competition_id_var IS NOT NULL THEN
            -- Insert or update the award
            INSERT INTO competition_awards 
              (competition_id, season_id, award_type, manager_id)
            VALUES 
              (competition_id_var, season_id_var, 'golden_boot', NEW.id)
            ON CONFLICT (competition_id, season_id, award_type)
            DO UPDATE SET manager_id = NEW.id;
          END IF;
        END IF;
        
        -- UEL Golden Glove
        IF NEW.seasons[i]->'awards'->>'uel_golden_glove' = 'true' THEN
          -- Find the UEL competition ID
          SELECT sc.competition_id INTO competition_id_var
          FROM season_competitions sc
          JOIN competitions c ON sc.competition_id = c.id
          WHERE sc.season_id = season_id_var
          AND c.name = 'UEL';
          
          IF competition_id_var IS NOT NULL THEN
            -- Insert or update the award
            INSERT INTO competition_awards 
              (competition_id, season_id, award_type, manager_id)
            VALUES 
              (competition_id_var, season_id_var, 'golden_glove', NEW.id)
            ON CONFLICT (competition_id, season_id, award_type)
            DO UPDATE SET manager_id = NEW.id;
          END IF;
        END IF;
        
        -- Super Cup Golden Boot
        IF NEW.seasons[i]->'awards'->>'super_cup_golden_boot' = 'true' THEN
          -- Find the Super Cup competition ID
          SELECT sc.competition_id INTO competition_id_var
          FROM season_competitions sc
          JOIN competitions c ON sc.competition_id = c.id
          WHERE sc.season_id = season_id_var
          AND c.name = 'SUPER CUP';
          
          IF competition_id_var IS NOT NULL THEN
            -- Insert or update the award
            INSERT INTO competition_awards 
              (competition_id, season_id, award_type, manager_id)
            VALUES 
              (competition_id_var, season_id_var, 'golden_boot', NEW.id)
            ON CONFLICT (competition_id, season_id, award_type)
            DO UPDATE SET manager_id = NEW.id;
          END IF;
        END IF;
      END IF;
    END LOOP;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Create the trigger on managers table
CREATE TRIGGER competition_awards_sync_trigger
AFTER UPDATE OF awards ON managers
FOR EACH ROW
WHEN (NEW.awards IS DISTINCT FROM OLD.awards)
EXECUTE FUNCTION sync_competition_awards();

-- 5. Create a view to make it easier to query award data
CREATE OR REPLACE VIEW competition_award_winners AS
SELECT 
  ca.id,
  c.name AS competition_name,
  s.number AS season_number,
  ca.award_type,
  m.name AS manager_name,
  cl.name AS club_name,
  ca.player_name
FROM 
  competition_awards ca
JOIN competitions c ON ca.competition_id = c.id
JOIN seasons s ON ca.season_id = s.id
JOIN managers m ON ca.manager_id = m.id
LEFT JOIN clubs cl ON m.club_id = cl.id
ORDER BY 
  s.number DESC,
  c.name,
  ca.award_type;

-- 6. Create a procedure to populate initial competition_awards data from existing JSON data
CREATE OR REPLACE PROCEDURE populate_initial_competition_awards()
LANGUAGE plpgsql
AS $$
DECLARE
  manager_rec RECORD;
BEGIN
  -- For each manager, trigger the award sync function
  FOR manager_rec IN SELECT id FROM managers WHERE awards > 0 LOOP
    -- Update the manager to trigger the award sync
    UPDATE managers
    SET awards = awards
    WHERE id = manager_rec.id;
  END LOOP;
END;
$$;

-- 7. Create a procedure to ensure all competition records exist
CREATE OR REPLACE PROCEDURE ensure_competition_records()
LANGUAGE plpgsql
AS $$
BEGIN
  -- Insert competition records if they don't exist
  INSERT INTO competitions (name) VALUES ('DIVISION') 
  ON CONFLICT (name) DO NOTHING;
  
  INSERT INTO competitions (name) VALUES ('DIVISION 1') 
  ON CONFLICT (name) DO NOTHING;
  
  INSERT INTO competitions (name) VALUES ('DIVISION 2') 
  ON CONFLICT (name) DO NOTHING;
  
  INSERT INTO competitions (name) VALUES ('DIVISION 3') 
  ON CONFLICT (name) DO NOTHING;
  
  INSERT INTO competitions (name) VALUES ('DIVISION 4') 
  ON CONFLICT (name) DO NOTHING;
  
  INSERT INTO competitions (name) VALUES ('SUPER CUP') 
  ON CONFLICT (name) DO NOTHING;
  
  INSERT INTO competitions (name) VALUES ('UCL') 
  ON CONFLICT (name) DO NOTHING;
  
  INSERT INTO competitions (name) VALUES ('UEL') 
  ON CONFLICT (name) DO NOTHING;
  
  INSERT INTO competitions (name) VALUES ('UCEL') 
  ON CONFLICT (name) DO NOTHING;
  
  INSERT INTO competitions (name) VALUES ('CLUB WC') 
  ON CONFLICT (name) DO NOTHING;
  
  INSERT INTO competitions (name) VALUES ('KINGS CUP') 
  ON CONFLICT (name) DO NOTHING;
  
  INSERT INTO competitions (name) VALUES ('ELITE CUP') 
  ON CONFLICT (name) DO NOTHING;
  
  INSERT INTO competitions (name) VALUES ('AUTHENTIC') 
  ON CONFLICT (name) DO NOTHING;
END;
$$;

-- 8. Execute the procedures to set up initial data
CALL ensure_competition_records();
-- Note: Uncomment the next line after importing all managers data
-- CALL populate_initial_competition_awards(); 