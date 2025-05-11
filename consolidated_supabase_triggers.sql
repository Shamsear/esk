-- Consolidated Supabase Triggers for Data Migration
-- This file combines all necessary triggers from:
-- - supabase_triggers.sql
-- - supabase_triggers_update.sql
-- - supabase_triggers_check.sql
-- - salary_trigger.sql
-- With redundant and unnecessary triggers removed

-- =============================================
-- 1. PLAYER-RELATED TRIGGERS
-- =============================================

-- Function to update manager_squads when a player is updated
CREATE OR REPLACE FUNCTION sync_player_to_squad()
RETURNS TRIGGER AS $$
BEGIN
  -- Prevent recursive trigger calls by checking for changes
  IF TG_OP = 'UPDATE' AND 
     OLD.value = NEW.value AND 
     OLD.position = NEW.position AND
     OLD.name = NEW.name AND
     OLD.club_id IS NOT DISTINCT FROM NEW.club_id THEN
    RETURN NEW;
  END IF;

  -- Validate position - make sure it's a valid value
  IF NEW.position NOT IN ('GK', 'CB', 'RB', 'LB', 'DM', 'CM', 'AM', 'LW', 'RW', 'ST') THEN
    RAISE WARNING 'Invalid position % detected for player % (ID: %). Not updating position in manager_squads.',
      NEW.position, NEW.name, NEW.id;
    
    -- Update manager_squads entries without changing position
    UPDATE manager_squads
    SET 
      value = NEW.value,
      player_name = NEW.name
    WHERE player_id = NEW.id;
  ELSE
    -- Add logging for debugging
    RAISE NOTICE 'Syncing player % (ID: %) to squad: position=%, value=%, name=%', 
      NEW.name, NEW.id, NEW.position, NEW.value, NEW.name;

    -- Update all manager_squads entries with valid position
    UPDATE manager_squads
    SET 
      position = NEW.position,
      value = NEW.value,
      player_name = NEW.name
    WHERE player_id = NEW.id;
  END IF;
  
  -- Also update salary which is 5% of value, stored as a decimal number
  -- Use NUMERIC to ensure decimal precision and ROUND to 1 decimal place
  UPDATE manager_squads
  SET salary = ROUND((NEW.value * 0.05)::numeric, 1)
  WHERE player_id = NEW.id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to call the function when a player is updated
DROP TRIGGER IF EXISTS player_update_trigger ON players;
CREATE TRIGGER player_update_trigger
AFTER UPDATE ON players
FOR EACH ROW
EXECUTE FUNCTION sync_player_to_squad();

-- Redundant now that we've improved the main sync_player_to_squad function
-- Function to sync player name changes to manager_squads
DROP FUNCTION IF EXISTS sync_player_name_to_squad() CASCADE;
DROP TRIGGER IF EXISTS player_name_update_trigger ON players;

-- Add a more comprehensive trigger to catch all player changes
CREATE OR REPLACE FUNCTION debug_player_changes()
RETURNS TRIGGER AS $$
BEGIN
  -- Log detailed information about the change
  RAISE NOTICE 'Player change detected - ID: %, Name: % -> %, Value: % -> %, Position: % -> %, Club: % -> %',
    NEW.id,
    COALESCE(OLD.name, 'New Player'),
    NEW.name,
    COALESCE(OLD.value, 0),
    NEW.value,
    COALESCE(OLD.position, 'None'),
    NEW.position,
    COALESCE(OLD.club_id::text, 'NULL'),
    COALESCE(NEW.club_id::text, 'NULL');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add debug trigger to track all player changes
DROP TRIGGER IF EXISTS debug_player_changes_trigger ON players;
CREATE TRIGGER debug_player_changes_trigger
AFTER INSERT OR UPDATE ON players
FOR EACH ROW
EXECUTE FUNCTION debug_player_changes();

-- =============================================
-- Additional improvements and fixes
-- =============================================

-- Function to fetch the next available player ID
CREATE OR REPLACE FUNCTION get_next_player_id()
RETURNS INTEGER AS $$
DECLARE
  next_id INTEGER;
BEGIN
  -- Get the maximum ID and add 1
  SELECT COALESCE(MAX(id), 0) + 1 INTO next_id FROM players;
  RETURN next_id;
END;
$$ LANGUAGE plpgsql;

-- Function to ensure player IDs are set on insert
CREATE OR REPLACE FUNCTION ensure_player_id()
RETURNS TRIGGER AS $$
BEGIN
  -- If ID is NULL or 0, generate a new one
  IF NEW.id IS NULL OR NEW.id = 0 THEN
    NEW.id := get_next_player_id();
    RAISE NOTICE 'Auto-assigned player ID: %', NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to set player ID on insert
DROP TRIGGER IF EXISTS player_ensure_id_trigger ON players;
CREATE TRIGGER player_ensure_id_trigger
BEFORE INSERT ON players
FOR EACH ROW
EXECUTE FUNCTION ensure_player_id();

-- =============================================
-- 2. CLUB-RELATED TRIGGERS
-- =============================================

-- Function to update players and managers when a club is updated
CREATE OR REPLACE FUNCTION sync_club_changes()
RETURNS TRIGGER AS $$
BEGIN
  -- Update all players that reference this club
  UPDATE players
  SET club_id = NEW.id
  WHERE club_id = OLD.id;
  
  -- Update all managers that reference this club
  UPDATE managers
  SET club_id = NEW.id
  WHERE club_id = OLD.id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to call the function when a club is updated
CREATE TRIGGER club_update_trigger
AFTER UPDATE ON clubs
FOR EACH ROW
EXECUTE FUNCTION sync_club_changes();

-- Function to handle club deletion (set references to NULL instead of blocking)
CREATE OR REPLACE FUNCTION handle_club_deletion()
RETURNS TRIGGER AS $$
BEGIN
  -- Set club_id to NULL for any players or managers referencing this club
  UPDATE players SET club_id = NULL WHERE club_id = OLD.id;
  UPDATE managers SET club_id = NULL WHERE club_id = OLD.id;
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Trigger to handle references before club deletion
CREATE TRIGGER club_delete_trigger
BEFORE DELETE ON clubs
FOR EACH ROW
EXECUTE FUNCTION handle_club_deletion();

-- =============================================
-- 3. MANAGER_SQUADS-RELATED TRIGGERS
-- =============================================

-- Function to check for duplicates in manager_squads
CREATE OR REPLACE FUNCTION check_squad_duplicates()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if this player already exists in this manager's squad
  IF EXISTS (
    SELECT 1 FROM manager_squads 
    WHERE manager_id = NEW.manager_id 
    AND player_id = NEW.player_id 
    AND id != COALESCE(NEW.id, -1)
  ) THEN
    RAISE EXCEPTION 'Duplicate player entry detected: Player % already exists in manager % squad', 
      NEW.player_id, NEW.manager_id;
    RETURN NULL;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to update players when manager_squads are updated
CREATE OR REPLACE FUNCTION sync_squad_to_player()
RETURNS TRIGGER AS $$
DECLARE
  club_id_var INTEGER;
  current_value INTEGER;
BEGIN
  -- Get the current player value to avoid recursive updates
  SELECT value INTO current_value FROM players WHERE id = NEW.player_id;
  
  -- Skip if values are the same to prevent recursion
  IF current_value = NEW.value THEN
    RETURN NEW;
  END IF;

  -- Get the club_id from the manager
  SELECT club_id INTO club_id_var FROM managers WHERE id = NEW.manager_id;
  
  -- Only update if we have a valid player_id and club_id
  IF NEW.player_id IS NOT NULL AND club_id_var IS NOT NULL THEN
    -- Update the player's club and value
    UPDATE players
    SET 
      club_id = club_id_var,
      value = NEW.value
    WHERE id = NEW.player_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to call the function when a manager_squad entry is updated
CREATE TRIGGER squad_update_trigger
AFTER UPDATE ON manager_squads
FOR EACH ROW
WHEN (NEW.value IS DISTINCT FROM OLD.value)
EXECUTE FUNCTION sync_squad_to_player();

-- Function to sync new squad entries to player records
CREATE OR REPLACE FUNCTION sync_new_squad_to_player()
RETURNS TRIGGER AS $$
DECLARE
  club_id_var INTEGER;
BEGIN
  -- Get the club_id from the manager
  SELECT club_id INTO club_id_var FROM managers WHERE id = NEW.manager_id;
  
  -- Only update if we have a valid player_id and club_id
  IF NEW.player_id IS NOT NULL AND club_id_var IS NOT NULL THEN
    -- Update the player's club and value
    UPDATE players
    SET 
      club_id = club_id_var,
      value = NEW.value
    WHERE id = NEW.player_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to sync new squad entries to player records
DROP TRIGGER IF EXISTS sync_squad_insert_to_player ON manager_squads;
CREATE TRIGGER sync_squad_insert_to_player
AFTER INSERT ON manager_squads
FOR EACH ROW
EXECUTE FUNCTION sync_new_squad_to_player();

-- Function to handle player transfers between teams
CREATE OR REPLACE FUNCTION handle_player_transfer()
RETURNS TRIGGER AS $$
DECLARE
  new_club_id INTEGER;
  old_club_id INTEGER;
  player_name_var TEXT;
  current_season INTEGER;
BEGIN
  -- Get the new club ID from the manager
  SELECT club_id, current_season INTO new_club_id, current_season 
  FROM managers 
  WHERE id = NEW.manager_id;
  
  -- Get the player's old club ID and name
  SELECT club_id, name INTO old_club_id, player_name_var
  FROM players
  WHERE id = NEW.player_id;
  
  -- If this is actually a transfer (different clubs)
  IF old_club_id IS DISTINCT FROM new_club_id AND old_club_id IS NOT NULL AND new_club_id IS NOT NULL THEN
    RAISE NOTICE 'Transfer detected for player % (ID: %) from club % to club %',
      player_name_var, NEW.player_id, old_club_id, new_club_id;
      
    -- Get old club name
    DECLARE
      old_club_name TEXT;
      new_club_name TEXT;
    BEGIN
      SELECT name INTO old_club_name 
      FROM clubs 
      WHERE id = old_club_id;
      
      SELECT name INTO new_club_name 
      FROM clubs 
      WHERE id = new_club_id;
      
      -- Create a record in player_stats for the transfer
      -- This allows tracking which seasons a player spent at which club
      INSERT INTO player_stats (
        player_id,
        season,
        team,
        value,
        apps
      ) VALUES (
        NEW.player_id,
        CASE 
          WHEN current_season IS NOT NULL THEN current_season::TEXT
          ELSE 'Transfer'
        END,
        old_club_name || ' → ' || new_club_name,
        NEW.value,
        0
      );
      
      RAISE NOTICE 'Created transfer record for % from % to % in season %',
        player_name_var, old_club_name, new_club_name, current_season;
    END;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for player transfers (used by admin-transfer.html)
DROP TRIGGER IF EXISTS handle_player_transfer_trigger ON manager_squads;
CREATE TRIGGER handle_player_transfer_trigger
AFTER INSERT ON manager_squads
FOR EACH ROW
EXECUTE FUNCTION handle_player_transfer();

-- Function to adjust player season stats based on contract
CREATE OR REPLACE FUNCTION adjust_player_season_stats_on_contract()
RETURNS TRIGGER AS $$
DECLARE
  player_name_var TEXT;
  current_club_name TEXT;
  current_season INTEGER;
  contract_seasons TEXT[];
  start_season INTEGER;
  end_season INTEGER;
BEGIN
  -- Get player name and club name
  SELECT p.name, c.name, m.current_season
  INTO player_name_var, current_club_name, current_season
  FROM players p
  JOIN managers m ON m.id = NEW.manager_id
  LEFT JOIN clubs c ON c.id = m.club_id
  WHERE p.id = NEW.player_id;
  
  -- If contract contains SEASON information, extract the range
  IF NEW.contract LIKE 'SEASON %' THEN
    -- For single season contracts like "SEASON 5"
    IF NEW.contract NOT LIKE '%-%' THEN
      -- Just use the current season number
      start_season := current_season;
      end_season := current_season;
    ELSE
      -- For range contracts like "SEASON 5-7"
      contract_seasons := regexp_matches(NEW.contract, 'SEASON (\d+)-(\d+)');
      start_season := contract_seasons[1]::INTEGER;
      end_season := contract_seasons[2]::INTEGER;
    END IF;
    
    -- Create a stats entry for this contract period if it doesn't exist
    IF NOT EXISTS (
      SELECT 1 FROM player_stats 
      WHERE player_id = NEW.player_id 
      AND team = current_club_name
      AND season = start_season::TEXT || '-' || end_season::TEXT
    ) THEN
      -- Insert the season stats entry
      INSERT INTO player_stats (
        player_id,
        season,
        team,
        value,
        apps
      ) VALUES (
        NEW.player_id,
        start_season::TEXT || '-' || end_season::TEXT,
        current_club_name,
        NEW.value,
        0  -- Initial appearances is 0
      );
      
      RAISE NOTICE 'Created contract stats for % at % for seasons % to %',
        player_name_var, current_club_name, start_season, end_season;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to adjust season stats based on contract when adding to squad
DROP TRIGGER IF EXISTS adjust_season_stats_on_squad_insert ON manager_squads;
CREATE TRIGGER adjust_season_stats_on_squad_insert
AFTER INSERT ON manager_squads
FOR EACH ROW
EXECUTE FUNCTION adjust_player_season_stats_on_contract();

-- Trigger to prevent duplicate players in the same squad
DROP TRIGGER IF EXISTS prevent_duplicate_squad_entries ON manager_squads;
CREATE TRIGGER prevent_duplicate_squad_entries
BEFORE INSERT OR UPDATE ON manager_squads
FOR EACH ROW
EXECUTE FUNCTION check_squad_duplicates();

-- Function to update player's club when removed from squad
CREATE OR REPLACE FUNCTION sync_squad_delete_to_player()
RETURNS TRIGGER AS $$
BEGIN
  -- When a player is removed from a squad, set their club to null if this was their only squad
  IF OLD.player_id IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1 FROM manager_squads 
      WHERE player_id = OLD.player_id AND id != OLD.id
    ) THEN
      -- This was the player's only squad, set club to NULL (FREE AGENT)
      UPDATE players
      SET club_id = NULL
      WHERE id = OLD.player_id;
    END IF;
  END IF;
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Trigger to call the function when a manager_squad entry is deleted
CREATE TRIGGER squad_delete_trigger
AFTER DELETE ON manager_squads
FOR EACH ROW
EXECUTE FUNCTION sync_squad_delete_to_player();

-- Function to calculate salary as 5% of value
CREATE OR REPLACE FUNCTION calculate_salary_from_value()
RETURNS TRIGGER AS $$
BEGIN
    -- Only update the salary if value is not null
    IF NEW.value IS NOT NULL THEN
        -- Set salary to 5% of value, rounded to 1 decimal place
        -- Use NUMERIC type to ensure decimal precision
        NEW.salary := ROUND((NEW.value * 0.05)::numeric, 1);
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to run before insert or update on manager_squads
CREATE TRIGGER set_salary_on_squad_changes
BEFORE INSERT OR UPDATE ON manager_squads
FOR EACH ROW
EXECUTE FUNCTION calculate_salary_from_value();

-- =============================================
-- 4. MANAGER-RELATED TRIGGERS
-- =============================================

-- Function to update squad players when manager changes club
CREATE OR REPLACE FUNCTION sync_manager_club_to_squad()
RETURNS TRIGGER AS $$
BEGIN
  -- If manager's club changes, we might need to update their squad players' clubs
  IF NEW.club_id IS DISTINCT FROM OLD.club_id THEN
    -- Update all players in this manager's squad to the new club
    UPDATE players
    SET club_id = NEW.club_id
    WHERE id IN (
      SELECT player_id 
      FROM manager_squads 
      WHERE manager_id = NEW.id AND player_id IS NOT NULL
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to call the function when a manager's club is updated
CREATE TRIGGER manager_club_update_trigger
AFTER UPDATE ON managers
FOR EACH ROW
WHEN (NEW.club_id IS DISTINCT FROM OLD.club_id)
EXECUTE FUNCTION sync_manager_club_to_squad();

-- =============================================
-- 5. CLUB VALUE CALCULATION
-- =============================================

-- Function to update a club's total value in managers table
CREATE OR REPLACE FUNCTION update_club_total_value()
RETURNS TRIGGER AS $$
DECLARE
  club_id_var INTEGER;
  total_value_var INTEGER;
  old_club_id INTEGER;
  new_club_id INTEGER;
BEGIN
  -- Set club IDs based on operation type
  IF TG_OP = 'DELETE' THEN
    old_club_id := OLD.club_id;
    new_club_id := NULL;
  ELSIF TG_OP = 'UPDATE' THEN
    old_club_id := OLD.club_id;
    new_club_id := NEW.club_id;
  ELSE -- INSERT
    old_club_id := NULL;
    new_club_id := NEW.club_id;
  END IF;

  -- Update old club's total value if applicable
  IF old_club_id IS NOT NULL AND (new_club_id IS DISTINCT FROM old_club_id) THEN
    -- Calculate total value for old club
    SELECT COALESCE(SUM(value), 0) INTO total_value_var
    FROM players
    WHERE club_id = old_club_id;
    
    -- Update managers with this club_id
    UPDATE managers
    SET club_total_value = total_value_var
    WHERE club_id = old_club_id;
  END IF;
  
  -- Update new club's total value if applicable
  IF new_club_id IS NOT NULL THEN
    -- Calculate total value for new/current club
    SELECT COALESCE(SUM(value), 0) INTO total_value_var
    FROM players
    WHERE club_id = new_club_id;
    
    -- Update managers with this club_id
    UPDATE managers
    SET club_total_value = total_value_var
    WHERE club_id = new_club_id;
  END IF;
  
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Trigger to call the function when a player is inserted, updated, or deleted
CREATE TRIGGER player_value_trigger
AFTER INSERT OR UPDATE OR DELETE ON players
FOR EACH ROW
EXECUTE FUNCTION update_club_total_value();

-- =============================================
-- 6. PERFORMANCE AND STATISTICS TRIGGERS
-- =============================================

-- Function to update manager performance when season stats change
CREATE OR REPLACE FUNCTION update_manager_performance()
RETURNS TRIGGER AS $$
DECLARE
  manager_id_var INTEGER;
BEGIN
  -- Get the manager_id from the season
  IF TG_OP = 'DELETE' THEN
    SELECT manager_id INTO manager_id_var FROM seasons WHERE id = OLD.season_id;
  ELSE
    SELECT manager_id INTO manager_id_var FROM seasons WHERE id = NEW.season_id;
  END IF;
  
  -- Only proceed if we found a valid manager_id
  IF manager_id_var IS NOT NULL THEN
    -- Recalculate and update the manager's performance
    UPDATE manager_performances
    SET
      matches = (
        SELECT COALESCE(SUM(matches), 0)
        FROM season_stats
        WHERE season_id IN (SELECT id FROM seasons WHERE manager_id = manager_id_var)
          AND is_special_tour = FALSE
      ),
      wins = (
        SELECT COALESCE(SUM(wins), 0)
        FROM season_stats
        WHERE season_id IN (SELECT id FROM seasons WHERE manager_id = manager_id_var)
          AND is_special_tour = FALSE
      ),
      draws = (
        SELECT COALESCE(SUM(draws), 0)
        FROM season_stats
        WHERE season_id IN (SELECT id FROM seasons WHERE manager_id = manager_id_var)
          AND is_special_tour = FALSE
      ),
      losses = (
        SELECT COALESCE(SUM(losses), 0)
        FROM season_stats
        WHERE season_id IN (SELECT id FROM seasons WHERE manager_id = manager_id_var)
          AND is_special_tour = FALSE
      ),
      goals_scored = (
        SELECT COALESCE(SUM(goals_scored), 0)
        FROM season_stats
        WHERE season_id IN (SELECT id FROM seasons WHERE manager_id = manager_id_var)
          AND is_special_tour = FALSE
      ),
      goals_conceded = (
        SELECT COALESCE(SUM(goals_conceded), 0)
        FROM season_stats
        WHERE season_id IN (SELECT id FROM seasons WHERE manager_id = manager_id_var)
          AND is_special_tour = FALSE
      ),
      goal_difference = (
        SELECT COALESCE(SUM(goal_difference), 0)
        FROM season_stats
        WHERE season_id IN (SELECT id FROM seasons WHERE manager_id = manager_id_var)
          AND is_special_tour = FALSE
      ),
      clean_sheets = (
        SELECT COALESCE(SUM(clean_sheets), 0)
        FROM season_stats
        WHERE season_id IN (SELECT id FROM seasons WHERE manager_id = manager_id_var)
          AND is_special_tour = FALSE
      )
    WHERE manager_id = manager_id_var;
  END IF;
  
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Trigger to call the function when season stats are changed
CREATE TRIGGER season_stats_trigger
AFTER INSERT OR UPDATE OR DELETE ON season_stats
FOR EACH ROW
EXECUTE FUNCTION update_manager_performance();

-- =============================================
-- 7. AWARDS AND TROPHIES TRIGGERS
-- =============================================

-- Function to update manager awards count
CREATE OR REPLACE FUNCTION update_manager_awards()
RETURNS TRIGGER AS $$
DECLARE
  manager_id_var INTEGER;
BEGIN
  -- Get the manager_id from the season
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    SELECT manager_id INTO manager_id_var FROM seasons WHERE id = NEW.season_id;
  ELSIF TG_OP = 'DELETE' THEN
    SELECT manager_id INTO manager_id_var FROM seasons WHERE id = OLD.season_id;
  END IF;
  
  -- Update the manager's award count
  IF manager_id_var IS NOT NULL THEN
    UPDATE managers
    SET awards = (
      SELECT COUNT(*)
      FROM season_awards sa
      JOIN seasons s ON sa.season_id = s.id
      WHERE s.manager_id = manager_id_var
    )
    WHERE id = manager_id_var;
  END IF;
  
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Trigger to call the function when season_awards are changed
CREATE TRIGGER season_awards_trigger
AFTER INSERT OR UPDATE OR DELETE ON season_awards
FOR EACH ROW
EXECUTE FUNCTION update_manager_awards();

-- Function to update manager trophy count when season competitions change
CREATE OR REPLACE FUNCTION update_manager_trophies()
RETURNS TRIGGER AS $$
DECLARE
  manager_id_var INTEGER;
BEGIN
  -- Get the manager_id from the season
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    SELECT manager_id INTO manager_id_var FROM seasons WHERE id = NEW.season_id;
  ELSIF TG_OP = 'DELETE' THEN
    SELECT manager_id INTO manager_id_var FROM seasons WHERE id = OLD.season_id;
  END IF;
  
  -- Only proceed if we found a valid manager_id
  IF manager_id_var IS NOT NULL THEN
    -- Update the manager's trophy count based on competitions with 1st place
    UPDATE managers
    SET trophies = (
      SELECT COUNT(*)
      FROM season_competitions sc
      JOIN seasons s ON sc.season_id = s.id
      WHERE s.manager_id = manager_id_var
        AND (sc.placement = '1st' OR sc.placement ILIKE '%winner%' OR sc.placement ILIKE '%champion%')
    )
    WHERE id = manager_id_var;
  END IF;
  
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Trigger to call the function when season_competitions are changed
CREATE TRIGGER season_competitions_trigger
AFTER INSERT OR UPDATE OR DELETE ON season_competitions
FOR EACH ROW
EXECUTE FUNCTION update_manager_trophies();

-- =============================================
-- 8. MANAGER RATING CALCULATION
-- =============================================

-- Optimized function to update manager overall rating
-- This is now a separate function that can be called directly
-- rather than using a trigger for every small change
CREATE OR REPLACE FUNCTION calculate_manager_rating(manager_id_param INTEGER)
RETURNS VOID AS $$
DECLARE
  trophy_weight NUMERIC := 0.4;
  performance_weight NUMERIC := 0.3;
  squad_weight NUMERIC := 0.3;
  trophies_var INTEGER;
  win_percentage NUMERIC;
  avg_squad_value NUMERIC;
  calculated_rating NUMERIC;
BEGIN
  -- Get trophy count
  SELECT trophies INTO trophies_var FROM managers WHERE id = manager_id_param;
  
  -- Calculate win percentage
  SELECT 
    CASE 
      WHEN matches > 0 THEN (wins::NUMERIC / matches::NUMERIC) * 100
      ELSE 0
    END INTO win_percentage
  FROM manager_performances
  WHERE manager_id = manager_id_param;
  
  -- Calculate average squad value
  SELECT COALESCE(AVG(value), 0) INTO avg_squad_value
  FROM manager_squads
  WHERE manager_id = manager_id_param;
  
  -- Calculate overall rating (simplified formula)
  calculated_rating := (
    (trophies_var * 10 * trophy_weight) + 
    (win_percentage * performance_weight) +
    (avg_squad_value / 10 * squad_weight)
  );
  
  -- Update the manager's overall rating
  UPDATE managers
  SET overall_rating = ROUND(calculated_rating, 1)
  WHERE id = manager_id_param;
END;
$$ LANGUAGE plpgsql;

-- Create a scheduled function to update all manager ratings periodically
-- instead of using triggers that might cause recursion
CREATE OR REPLACE FUNCTION update_all_manager_ratings()
RETURNS VOID AS $$
DECLARE
  manager_rec RECORD;
BEGIN
  FOR manager_rec IN SELECT id FROM managers LOOP
    PERFORM calculate_manager_rating(manager_rec.id);
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger that will update a specific manager's rating
-- but only on significant changes to avoid recursion
CREATE OR REPLACE FUNCTION trigger_manager_rating_update()
RETURNS TRIGGER AS $$
DECLARE
  manager_id_var INTEGER;
BEGIN
  -- Determine manager_id based on trigger context
  IF TG_TABLE_NAME = 'manager_squads' THEN
    manager_id_var := NEW.manager_id;
  ELSIF TG_TABLE_NAME = 'manager_performances' THEN
    manager_id_var := NEW.manager_id;
  ELSIF TG_TABLE_NAME = 'managers' THEN
    -- Only update if trophies changed significantly
    IF NEW.trophies IS DISTINCT FROM OLD.trophies AND ABS(NEW.trophies - OLD.trophies) >= 1 THEN
      manager_id_var := NEW.id;
    ELSE
      RETURN NEW;
    END IF;
  ELSE
    RETURN NEW; -- Exit if we can't determine manager_id
  END IF;
  
  -- Call the rating calculation function
  PERFORM calculate_manager_rating(manager_id_var);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Replace the multiple triggers with a single trigger for each table
-- that only fires on significant changes
CREATE TRIGGER manager_performance_rating_trigger
AFTER UPDATE ON manager_performances
FOR EACH ROW
WHEN (
  NEW.wins IS DISTINCT FROM OLD.wins OR 
  NEW.matches IS DISTINCT FROM OLD.matches
)
EXECUTE FUNCTION trigger_manager_rating_update();

CREATE TRIGGER manager_squad_rating_trigger
AFTER INSERT OR DELETE ON manager_squads
FOR EACH ROW
EXECUTE FUNCTION trigger_manager_rating_update();

CREATE TRIGGER manager_trophy_rating_trigger
AFTER UPDATE OF trophies ON managers
FOR EACH ROW
WHEN (NEW.trophies IS DISTINCT FROM OLD.trophies)
EXECUTE FUNCTION trigger_manager_rating_update();

-- Add comment explaining how to run the periodic update
COMMENT ON FUNCTION update_all_manager_ratings() IS 
'Run this function periodically to update all manager ratings:
SELECT update_all_manager_ratings();

Consider creating a cron job to run this daily:
SELECT cron.schedule(''daily_manager_rating_update'', ''0 0 * * *'', ''SELECT update_all_manager_ratings()'');'; 