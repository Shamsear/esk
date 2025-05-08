-- Supabase Triggers and Functions for Automatic Data Synchronization

-- 1. Player and Manager Squad Synchronization

-- Function to update manager_squads when a player is updated
CREATE OR REPLACE FUNCTION sync_player_to_squad()
RETURNS TRIGGER AS $$
BEGIN
  -- Update all manager_squads entries that reference this player
  UPDATE manager_squads
  SET 
    position = NEW.position,
    value = NEW.value
  WHERE player_id = NEW.id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to call the function when a player is updated
CREATE TRIGGER player_update_trigger
AFTER UPDATE ON players
FOR EACH ROW
EXECUTE FUNCTION sync_player_to_squad();

-- 2. Club Synchronization

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

-- 3. Bidirectional Player-Squad Relationship

-- Function to update players when manager_squads are updated
CREATE OR REPLACE FUNCTION sync_squad_to_player()
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

-- Trigger to call the function when a manager_squad entry is updated
CREATE TRIGGER squad_update_trigger
AFTER UPDATE ON manager_squads
FOR EACH ROW
EXECUTE FUNCTION sync_squad_to_player();

-- 4. Performance Statistics Aggregation

-- Function to update manager performance when season stats change
CREATE OR REPLACE FUNCTION update_manager_performance()
RETURNS TRIGGER AS $$
DECLARE
  manager_id_var INTEGER;
BEGIN
  -- Get the manager_id from the season
  SELECT manager_id INTO manager_id_var FROM seasons WHERE id = NEW.season_id;
  
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
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to call the function when season stats are inserted or updated
CREATE TRIGGER season_stats_trigger
AFTER INSERT OR UPDATE ON season_stats
FOR EACH ROW
EXECUTE FUNCTION update_manager_performance();

-- 5. Club Total Value Calculation

-- Function to update a club's total value in managers table
CREATE OR REPLACE FUNCTION update_club_total_value()
RETURNS TRIGGER AS $$
DECLARE
  club_id_var INTEGER;
  total_value_var INTEGER;
BEGIN
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
  END IF;
  
  -- Now update the new/current club's total value
  IF NEW.club_id IS NOT NULL THEN
    -- Calculate total value for new/current club
    SELECT COALESCE(SUM(value), 0) INTO total_value_var
    FROM players
    WHERE club_id = NEW.club_id;
    
    -- Update managers with this club_id
    UPDATE managers
    SET club_total_value = total_value_var
    WHERE club_id = NEW.club_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to call the function when a player is inserted, updated, or deleted
CREATE TRIGGER player_value_trigger
AFTER INSERT OR UPDATE OR DELETE ON players
FOR EACH ROW
EXECUTE FUNCTION update_club_total_value();

-- 6. Award Counting for Managers

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
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to call the function when season_awards are changed
CREATE TRIGGER season_awards_trigger
AFTER INSERT OR UPDATE OR DELETE ON season_awards
FOR EACH ROW
EXECUTE FUNCTION update_manager_awards(); 