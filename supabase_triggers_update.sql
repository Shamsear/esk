-- Additional triggers to provide complete synchronization

-- 1. Trophy count update when season competitions change
CREATE OR REPLACE FUNCTION update_manager_trophies()
RETURNS TRIGGER AS $$
DECLARE
  manager_id_var INTEGER;
BEGIN
  -- Get the manager_id from the season
  SELECT manager_id INTO manager_id_var FROM seasons WHERE id = NEW.season_id;
  
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
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to call the function when season_competitions are changed
CREATE TRIGGER season_competitions_trigger
AFTER INSERT OR UPDATE OR DELETE ON season_competitions
FOR EACH ROW
EXECUTE FUNCTION update_manager_trophies();

-- 2. Protecting manager_performances from direct edits
CREATE OR REPLACE FUNCTION sync_performance_to_season_stats()
RETURNS TRIGGER AS $$
DECLARE
  manager_id_var INTEGER := NEW.manager_id;
BEGIN
  -- Log a warning that direct edits to manager_performances may be overwritten
  RAISE WARNING 'Direct edits to manager_performances may be overwritten by aggregated season stats';
  
  -- We let the edit happen but return a warning
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to warn when manager_performances is directly edited
CREATE TRIGGER performance_edit_warning_trigger
BEFORE UPDATE ON manager_performances
FOR EACH ROW
EXECUTE FUNCTION sync_performance_to_season_stats();

-- 3. Bidirectional synchronization for player value changes
CREATE OR REPLACE FUNCTION sync_player_value_to_squad()
RETURNS TRIGGER AS $$
BEGIN
  -- If the player's value changed, update it in all manager_squads
  IF NEW.value != OLD.value THEN
    UPDATE manager_squads
    SET value = NEW.value
    WHERE player_id = NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to call the function when a player's value is updated
CREATE TRIGGER player_value_update_trigger
AFTER UPDATE ON players
FOR EACH ROW
WHEN (NEW.value IS DISTINCT FROM OLD.value)
EXECUTE FUNCTION sync_player_value_to_squad();

-- 4. Protect club deletion by checking references
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
CREATE TRIGGER club_delete_reference_check_trigger
BEFORE DELETE ON clubs
FOR EACH ROW
EXECUTE FUNCTION check_club_references();

-- 5. Add a trigger for player_stats to update player games_played
CREATE OR REPLACE FUNCTION update_player_games_played()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the player's games_played count
  UPDATE players
  SET games_played = (
    SELECT COALESCE(SUM(NULLIF(apps, '')::INTEGER), 0)
    FROM player_stats
    WHERE player_id = NEW.player_id
  )
  WHERE id = NEW.player_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to call the function when player_stats are changed
CREATE TRIGGER player_stats_update_trigger
AFTER INSERT OR UPDATE OR DELETE ON player_stats
FOR EACH ROW
EXECUTE FUNCTION update_player_games_played();

-- 6. Update manager overall rating when related tables change
CREATE OR REPLACE FUNCTION update_manager_overall_rating()
RETURNS TRIGGER AS $$
DECLARE
  manager_id_var INTEGER := NEW.manager_id;
  trophy_weight NUMERIC := 0.4;
  performance_weight NUMERIC := 0.3;
  squad_weight NUMERIC := 0.3;
  trophies_var INTEGER;
  win_percentage NUMERIC;
  avg_squad_value NUMERIC;
  calculated_rating NUMERIC;
BEGIN
  -- Get trophy count
  SELECT trophies INTO trophies_var FROM managers WHERE id = manager_id_var;
  
  -- Calculate win percentage
  SELECT 
    CASE 
      WHEN matches > 0 THEN (wins::NUMERIC / matches::NUMERIC) * 100
      ELSE 0
    END INTO win_percentage
  FROM manager_performances
  WHERE manager_id = manager_id_var;
  
  -- Calculate average squad value
  SELECT COALESCE(AVG(value), 0) INTO avg_squad_value
  FROM manager_squads
  WHERE manager_id = manager_id_var;
  
  -- Calculate overall rating (simplified formula)
  calculated_rating := (
    (trophies_var * 10 * trophy_weight) + 
    (win_percentage * performance_weight) +
    (avg_squad_value / 10 * squad_weight)
  );
  
  -- Update the manager's overall rating
  UPDATE managers
  SET overall_rating = ROUND(calculated_rating, 1)
  WHERE id = manager_id_var;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers to update overall rating when related data changes
CREATE TRIGGER manager_squad_rating_trigger
AFTER INSERT OR UPDATE OR DELETE ON manager_squads
FOR EACH ROW
EXECUTE FUNCTION update_manager_overall_rating();

CREATE TRIGGER manager_performance_rating_trigger
AFTER UPDATE ON manager_performances
FOR EACH ROW
EXECUTE FUNCTION update_manager_overall_rating();

CREATE TRIGGER manager_trophy_rating_trigger
AFTER UPDATE OF trophies ON managers
FOR EACH ROW
WHEN (NEW.trophies IS DISTINCT FROM OLD.trophies)
EXECUTE FUNCTION update_manager_overall_rating(); 