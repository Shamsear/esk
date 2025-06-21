-- Supabase Triggers and Functions for Automatic Data Synchronization

-- =============================================================================
-- 1. PLAYER SYNCHRONIZATION TRIGGERS
-- =============================================================================

-- Function to update manager_squads when a player is updated
CREATE OR REPLACE FUNCTION sync_player_to_squad()
RETURNS TRIGGER AS $$
BEGIN
  -- Prevent recursive trigger loops - only update if values have actually changed
  IF (NEW.name IS DISTINCT FROM OLD.name OR 
      NEW.position IS DISTINCT FROM OLD.position OR 
      NEW.value IS DISTINCT FROM OLD.value) THEN
      
    -- Check if this update was triggered by the squad update function
    IF current_setting('app.updating_from_squad', true) = 'true' THEN
      -- Skip updating manager_squads if we're in the middle of processing a squad update
      RETURN NEW;
    END IF;
    
    -- Set custom setting to indicate we're updating from player
    PERFORM set_config('app.updating_from_player', 'true', true);
    
    -- Update all manager_squads entries that reference this player
    UPDATE manager_squads
    SET 
      player_name = NEW.name,
      position = NEW.position,
      value = NEW.value
    WHERE player_id = NEW.id;
    
    -- Reset the setting
    PERFORM set_config('app.updating_from_player', 'false', true);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to call the function when a player is updated
DROP TRIGGER IF EXISTS player_update_trigger ON players;
CREATE TRIGGER player_update_trigger
AFTER UPDATE ON players
FOR EACH ROW
EXECUTE FUNCTION sync_player_to_squad();

-- Function to automatically calculate player salary as 5% of value in manager_squads
CREATE OR REPLACE FUNCTION calculate_player_salary()
RETURNS TRIGGER AS $$
BEGIN
  -- Calculate salary as 5% of value
  NEW.salary := NEW.value * 0.05;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically calculate salary when manager_squads is inserted or updated
DROP TRIGGER IF EXISTS calculate_salary_trigger ON manager_squads;
CREATE TRIGGER calculate_salary_trigger
BEFORE INSERT OR UPDATE OF value ON manager_squads
FOR EACH ROW
EXECUTE FUNCTION calculate_player_salary();

-- Function to update games_played in players when player_stats change
CREATE OR REPLACE FUNCTION update_player_games_played()
RETURNS TRIGGER AS $$
BEGIN
  -- For INSERT or UPDATE
  IF (TG_OP = 'INSERT' OR TG_OP = 'UPDATE') THEN
    -- Update the player's games_played count
    UPDATE players
    SET games_played = (
      SELECT COALESCE(SUM(NULLIF(apps, '')::INTEGER), 0)
      FROM player_stats
      WHERE player_id = NEW.player_id
    )
    WHERE id = NEW.player_id;
    
    RETURN NEW;
  -- For DELETE
  ELSIF (TG_OP = 'DELETE') THEN
    -- Update the player's games_played count
    UPDATE players
    SET games_played = (
      SELECT COALESCE(SUM(NULLIF(apps, '')::INTEGER), 0)
      FROM player_stats
      WHERE player_id = OLD.player_id
    )
    WHERE id = OLD.player_id;
    
    RETURN OLD;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger to call the function when player_stats are changed
DROP TRIGGER IF EXISTS player_stats_update_trigger ON player_stats;
CREATE TRIGGER player_stats_update_trigger
AFTER INSERT OR UPDATE OR DELETE ON player_stats
FOR EACH ROW
EXECUTE FUNCTION update_player_games_played();

-- =============================================================================
-- 2. CLUB SYNCHRONIZATION TRIGGERS
-- =============================================================================

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
DROP TRIGGER IF EXISTS club_update_trigger ON clubs;
CREATE TRIGGER club_update_trigger
AFTER UPDATE ON clubs
FOR EACH ROW
WHEN (NEW.id IS DISTINCT FROM OLD.id)
EXECUTE FUNCTION sync_club_changes();

-- Function to update club_total_value in managers when players change
CREATE OR REPLACE FUNCTION update_club_total_value()
RETURNS TRIGGER AS $$
DECLARE
  total_value_var BIGINT;
BEGIN
  -- Skip processing if we're in the middle of other updates
  IF current_setting('app.updating_club_total', true) = 'true' THEN
    RETURN CASE WHEN TG_OP = 'DELETE' THEN OLD ELSE NEW END;
  END IF;

  -- Set flag to avoid recursive updates
  PERFORM set_config('app.updating_club_total', 'true', true);

  -- For updated players, check if club_id has changed
  IF TG_OP = 'UPDATE' THEN
    -- If player moved to a new club, update old club's total value
    IF OLD.club_id IS NOT NULL AND (NEW.club_id != OLD.club_id OR NEW.club_id IS NULL) THEN
      -- Calculate total value for old club
      SELECT COALESCE(SUM(value), 0) INTO total_value_var
      FROM players
      WHERE club_id = OLD.club_id;
      
      -- Update managers with this club_id
      UPDATE managers
      SET club_total_value = total_value_var
      WHERE club_id = OLD.club_id;
    END IF;
  -- For deleted players
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.club_id IS NOT NULL THEN
      -- Calculate total value for old club
      SELECT COALESCE(SUM(value), 0) INTO total_value_var
      FROM players
      WHERE club_id = OLD.club_id;
      
      -- Update managers with this club_id
      UPDATE managers
      SET club_total_value = total_value_var
      WHERE club_id = OLD.club_id;
    END IF;
    
    -- Reset flag before returning
    PERFORM set_config('app.updating_club_total', 'false', true);
    RETURN OLD;
  END IF;
  
  -- Now update the new/current club's total value
  IF (TG_OP = 'INSERT' OR TG_OP = 'UPDATE') AND NEW.club_id IS NOT NULL THEN
    -- Calculate total value for new/current club
    SELECT COALESCE(SUM(value), 0) INTO total_value_var
    FROM players
    WHERE club_id = NEW.club_id;
    
    -- Update managers with this club_id
    UPDATE managers
    SET club_total_value = total_value_var
    WHERE club_id = NEW.club_id;
  END IF;
  
  -- Reset flag before returning
  PERFORM set_config('app.updating_club_total', 'false', true);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to call the function when a player is inserted, updated, or deleted
DROP TRIGGER IF EXISTS player_value_trigger ON players;
CREATE TRIGGER player_value_trigger
AFTER INSERT OR UPDATE OR DELETE ON players
FOR EACH ROW
EXECUTE FUNCTION update_club_total_value();

-- =============================================================================
-- 3. MANAGER SYNCHRONIZATION TRIGGERS
-- =============================================================================

-- Function to update players' club_id when a manager's club changes
CREATE OR REPLACE FUNCTION sync_manager_club_to_players()
RETURNS TRIGGER AS $$
BEGIN
  -- If manager's club has changed, update all players in their squad
  IF OLD.club_id IS DISTINCT FROM NEW.club_id THEN
    -- Get all player IDs from manager_squads
    UPDATE players
    SET club_id = NEW.club_id
    WHERE id IN (
      SELECT player_id 
      FROM manager_squads 
      WHERE manager_id = NEW.id
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update players when a manager's club changes
DROP TRIGGER IF EXISTS manager_club_update_trigger ON managers;
CREATE TRIGGER manager_club_update_trigger
AFTER UPDATE OF club_id ON managers
FOR EACH ROW
EXECUTE FUNCTION sync_manager_club_to_players();

-- Function to update the manager's performance statistics based on seasons data
CREATE OR REPLACE FUNCTION update_manager_performance()
RETURNS TRIGGER AS $$
DECLARE
  total_matches INTEGER;
  total_wins INTEGER;
  total_draws INTEGER;
  total_losses INTEGER;
  total_goals_scored INTEGER;
  total_goals_conceded INTEGER;
  total_clean_sheets INTEGER;
  total_trophies INTEGER;
  manager_id_var INTEGER;
BEGIN
  -- Get the manager_id based on whether this is a delete operation or not
  IF TG_OP = 'DELETE' THEN
    manager_id_var := OLD.manager_id;
  ELSE
    manager_id_var := NEW.manager_id;
  END IF;

  -- Calculate statistics from season_stats joined with seasons
  SELECT 
    COALESCE(SUM(ss.matches), 0),
    COALESCE(SUM(ss.wins), 0),
    COALESCE(SUM(ss.draws), 0),
    COALESCE(SUM(ss.losses), 0),
    COALESCE(SUM(ss.goals_scored), 0),
    COALESCE(SUM(ss.goals_conceded), 0),
    COALESCE(SUM(ss.clean_sheets), 0)
  INTO 
    total_matches, total_wins, total_draws, total_losses,
    total_goals_scored, total_goals_conceded, total_clean_sheets
  FROM season_stats ss
  JOIN seasons s ON ss.season_id = s.id
  WHERE s.manager_id = manager_id_var;
  
  -- Count trophies from season_competitions where placement is 1st
  SELECT COUNT(*) INTO total_trophies
  FROM season_competitions sc
  JOIN seasons s ON sc.season_id = s.id
  WHERE 
    s.manager_id = manager_id_var
    AND sc.placement LIKE '1%'; -- Count only first place finishes
  
  -- Either update existing performance record or insert a new one
  INSERT INTO manager_performances(
    manager_id, matches, wins, draws, losses, 
    goals_scored, goals_conceded, goal_difference, clean_sheets
  )
  VALUES (
    manager_id_var,
    total_matches,
    total_wins,
    total_draws,
    total_losses,
    total_goals_scored,
    total_goals_conceded,
    total_goals_scored - total_goals_conceded,
    total_clean_sheets
  )
  ON CONFLICT (manager_id) 
  DO UPDATE SET
    matches = EXCLUDED.matches,
    wins = EXCLUDED.wins,
    draws = EXCLUDED.draws,
    losses = EXCLUDED.losses,
    goals_scored = EXCLUDED.goals_scored,
    goals_conceded = EXCLUDED.goals_conceded,
    goal_difference = EXCLUDED.goal_difference,
    clean_sheets = EXCLUDED.clean_sheets;
    
  -- Update trophies in the managers table
  UPDATE managers
  SET trophies = total_trophies
  WHERE id = manager_id_var;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Add unique constraint on manager_id if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'manager_performances_manager_id_key' 
    AND conrelid = 'manager_performances'::regclass
  ) THEN
    ALTER TABLE manager_performances ADD CONSTRAINT manager_performances_manager_id_key UNIQUE (manager_id);
  END IF;
EXCEPTION
  WHEN undefined_table THEN
    -- Table doesn't exist, constraint can't be added
    RAISE NOTICE 'Table manager_performances does not exist, skipping constraint';
END $$;

-- Triggers for seasons
DROP TRIGGER IF EXISTS seasons_stats_trigger ON seasons;
CREATE TRIGGER seasons_stats_trigger
AFTER INSERT OR UPDATE OR DELETE ON seasons
FOR EACH ROW
EXECUTE FUNCTION update_manager_performance();

-- Triggers for season_stats
DROP TRIGGER IF EXISTS season_stats_trigger ON season_stats;
CREATE TRIGGER season_stats_trigger
AFTER INSERT OR UPDATE OR DELETE ON season_stats
FOR EACH ROW
EXECUTE FUNCTION update_manager_performance();

-- Triggers for season_competitions
DROP TRIGGER IF EXISTS season_competitions_stats_trigger ON season_competitions;
CREATE TRIGGER season_competitions_stats_trigger
AFTER INSERT OR UPDATE OR DELETE ON season_competitions
FOR EACH ROW
EXECUTE FUNCTION update_manager_performance();

-- Function to update the manager's award count
CREATE OR REPLACE FUNCTION update_manager_awards()
RETURNS TRIGGER AS $$
DECLARE
  award_count INTEGER;
  manager_id_var INTEGER;
BEGIN
  -- Get manager_id based on season_id
  IF TG_OP = 'DELETE' THEN
    SELECT manager_id INTO manager_id_var FROM seasons WHERE id = OLD.season_id;
  ELSE
    SELECT manager_id INTO manager_id_var FROM seasons WHERE id = NEW.season_id;
  END IF;

  IF manager_id_var IS NULL THEN
    RETURN NULL; -- Can't update if we can't find the manager
  END IF;
  
  -- Count awards for this manager
  SELECT COUNT(*) INTO award_count
  FROM season_awards sa
  JOIN seasons s ON sa.season_id = s.id
  WHERE s.manager_id = manager_id_var;
  
  -- Update the manager's awards count
  UPDATE managers
  SET awards = award_count
  WHERE id = manager_id_var;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger for season_awards
DROP TRIGGER IF EXISTS season_awards_trigger ON season_awards;
CREATE TRIGGER season_awards_trigger
AFTER INSERT OR UPDATE OR DELETE ON season_awards
FOR EACH ROW
EXECUTE FUNCTION update_manager_awards();

-- =============================================================================
-- 4. BIDIRECTIONAL SQUAD-PLAYER RELATIONSHIP
-- =============================================================================

-- Function to update players when manager_squads are updated
CREATE OR REPLACE FUNCTION sync_squad_to_player()
RETURNS TRIGGER AS $$
DECLARE
  club_id_var INTEGER;
BEGIN
  -- Check if this update was triggered by the player update function
  IF current_setting('app.updating_from_player', true) = 'true' THEN
    -- Skip updating players if we're in the middle of processing a player update
    RETURN NEW;
  END IF;

  -- Only proceed if values have actually changed
  IF TG_OP = 'INSERT' OR 
     NEW.position IS DISTINCT FROM OLD.position OR 
     NEW.value IS DISTINCT FROM OLD.value THEN
    
    -- Get the club_id from the manager
    SELECT club_id INTO club_id_var FROM managers WHERE id = NEW.manager_id;
    
    -- Set custom setting to indicate we're updating from squad
    PERFORM set_config('app.updating_from_squad', 'true', true);
    
    -- Only update if we have a valid player_id
    IF NEW.player_id IS NOT NULL THEN
      -- Update the player's club and value
      UPDATE players
      SET 
        club_id = club_id_var,
        position = NEW.position,
        value = NEW.value
      WHERE id = NEW.player_id;
    END IF;
    
    -- Reset the setting
    PERFORM set_config('app.updating_from_squad', 'false', true);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update players when squad entries are added or updated
DROP TRIGGER IF EXISTS squad_update_trigger ON manager_squads;
CREATE TRIGGER squad_update_trigger
AFTER INSERT OR UPDATE OF position, value ON manager_squads
FOR EACH ROW
EXECUTE FUNCTION sync_squad_to_player();

-- Function to handle deletion of squad entries
CREATE OR REPLACE FUNCTION handle_squad_deletion()
RETURNS TRIGGER AS $$
BEGIN
  -- Optional: Set the player as a free agent when removed from squad
  -- UPDATE players SET club_id = NULL WHERE id = OLD.player_id;
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Trigger for squad deletion
DROP TRIGGER IF EXISTS squad_delete_trigger ON manager_squads;
CREATE TRIGGER squad_delete_trigger
AFTER DELETE ON manager_squads
FOR EACH ROW
EXECUTE FUNCTION handle_squad_deletion();

-- =============================================================================
-- 5. PROTECTION TRIGGERS
-- =============================================================================

-- Function to protect club deletion
CREATE OR REPLACE FUNCTION check_club_references()
RETURNS TRIGGER AS $$
DECLARE
  player_count INTEGER;
  manager_count INTEGER;
BEGIN
  -- Check if any players or managers reference this club
  SELECT COUNT(*) INTO player_count FROM players WHERE club_id = OLD.id;
  SELECT COUNT(*) INTO manager_count FROM managers WHERE club_id = OLD.id;
  
  IF player_count > 0 OR manager_count > 0 THEN
    RAISE EXCEPTION 'Cannot delete club (ID: %) as it is referenced by % players and % managers', 
      OLD.id, player_count, manager_count;
  END IF;
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Trigger to check references before club deletion
DROP TRIGGER IF EXISTS club_delete_reference_check_trigger ON clubs;
CREATE TRIGGER club_delete_reference_check_trigger
BEFORE DELETE ON clubs
FOR EACH ROW
EXECUTE FUNCTION check_club_references();

-- Initialize custom settings if not exists
DO $$
BEGIN
  -- This creates the custom settings if they don't exist
  PERFORM set_config('app.updating_from_player', 'false', false);
  PERFORM set_config('app.updating_from_squad', 'false', false);
  PERFORM set_config('app.updating_club_total', 'false', false);
EXCEPTION
  WHEN insufficient_privilege THEN
    RAISE NOTICE 'Unable to set global variables. Make sure you have the right permissions.';
END $$;
