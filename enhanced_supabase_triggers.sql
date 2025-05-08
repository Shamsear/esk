-- Enhanced Supabase Triggers for Complete Table Synchronization

-- 1. Two-way synchronization when player club changes
CREATE OR REPLACE FUNCTION sync_player_club_changes()
RETURNS TRIGGER AS $$
DECLARE
  manager_id_var INTEGER;
  manager_club_id_var INTEGER;
BEGIN
  -- If the player's club has changed
  IF NEW.club_id IS DISTINCT FROM OLD.club_id THEN
    -- First, if the player was in a manager's squad but now has a different club,
    -- we need to update or remove them from that manager's squad
    IF OLD.club_id IS NOT NULL THEN
      -- Find managers with the old club_id
      FOR manager_id_var IN (SELECT id FROM managers WHERE club_id = OLD.club_id) LOOP
        -- If player becomes a free agent (club_id is NULL), remove from manager_squads
        IF NEW.club_id IS NULL THEN
          DELETE FROM manager_squads 
          WHERE manager_id = manager_id_var AND player_id = NEW.id;
        -- Otherwise, player moved to another club
        ELSIF NEW.club_id IS NOT NULL THEN
          -- Get the club_id for the new manager that should have this player
          SELECT id INTO manager_club_id_var FROM managers WHERE club_id = NEW.club_id LIMIT 1;
          
          IF manager_club_id_var IS NOT NULL THEN
            -- Update the manager_id to the new club's manager
            UPDATE manager_squads
            SET manager_id = manager_club_id_var
            WHERE manager_id = manager_id_var AND player_id = NEW.id;
          END IF;
        END IF;
      END LOOP;
    END IF;
    
    -- If the player now has a new club, add them to that manager's squad (if not already there)
    IF NEW.club_id IS NOT NULL THEN
      -- Find the manager(s) of the new club
      FOR manager_id_var IN (SELECT id FROM managers WHERE club_id = NEW.club_id) LOOP
        -- Check if the player is already in this manager's squad
        IF NOT EXISTS (SELECT 1 FROM manager_squads WHERE manager_id = manager_id_var AND player_id = NEW.id) THEN
          -- Add the player to the manager's squad
          INSERT INTO manager_squads (
            manager_id, 
            player_id, 
            player_name, 
            position, 
            value, 
            contract, 
            salary, 
            player_type
          ) VALUES (
            manager_id_var,
            NEW.id,
            NEW.name,
            NEW.position,
            NEW.value,
            'SEASON 8', -- Default contract
            NEW.value * 0.1, -- Default salary (10% of value)
            'standard' -- Default player type
          );
        END IF;
      END LOOP;
    END IF;
    
    -- Update player_stats to include entry for the club change
    IF NEW.club_id IS NOT NULL THEN
      -- Get club name
      DECLARE
        club_name TEXT;
      BEGIN
        SELECT name INTO club_name FROM clubs WHERE id = NEW.club_id;
        
        IF club_name IS NOT NULL THEN
          -- Find current season (simplified - you may need to adjust this)
          DECLARE
            current_season TEXT := '6-8'; -- Or fetch from a settings table
          BEGIN
            -- Check if there's already a stat entry for this club and season
            IF NOT EXISTS (
              SELECT 1 FROM player_stats 
              WHERE player_id = NEW.id 
              AND team = club_name 
              AND season = current_season
            ) THEN
              -- Add new player_stats entry
              INSERT INTO player_stats (
                player_id,
                season,
                team,
                value,
                apps
              ) VALUES (
                NEW.id,
                current_season,
                club_name,
                NEW.value::TEXT,
                '0'
              );
            END IF;
          END;
        END IF;
      END;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to call the function when a player's club is updated
CREATE TRIGGER player_club_update_trigger
AFTER UPDATE ON players
FOR EACH ROW
WHEN (NEW.club_id IS DISTINCT FROM OLD.club_id)
EXECUTE FUNCTION sync_player_club_changes();

-- 2. Add a player to manager squad when not already present
CREATE OR REPLACE FUNCTION add_player_to_manager_squads()
RETURNS TRIGGER AS $$
DECLARE
  manager_id_var INTEGER;
BEGIN
  -- When a player is assigned to a club, add to manager squad if not already there
  IF NEW.club_id IS NOT NULL THEN
    -- Find all managers for this club
    FOR manager_id_var IN (SELECT id FROM managers WHERE club_id = NEW.club_id) LOOP
      -- Check if player is already in the squad
      IF NOT EXISTS (SELECT 1 FROM manager_squads WHERE manager_id = manager_id_var AND player_id = NEW.id) THEN
        -- Add player to the squad
        INSERT INTO manager_squads (
          manager_id,
          player_id,
          player_name,
          position,
          value,
          contract,
          salary,
          player_type
        ) VALUES (
          manager_id_var,
          NEW.id,
          NEW.name,
          NEW.position,
          NEW.value,
          'SEASON 8', -- Default contract
          NEW.value * 0.1, -- Default salary calculation
          'standard' -- Default player type
        );
      END IF;
    END LOOP;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for new player insertions
CREATE TRIGGER player_insert_trigger
AFTER INSERT ON players
FOR EACH ROW
WHEN (NEW.club_id IS NOT NULL)
EXECUTE FUNCTION add_player_to_manager_squads();

-- 3. Ensure club changes in manager_squads update the player record
CREATE OR REPLACE FUNCTION sync_squad_club_changes()
RETURNS TRIGGER AS $$
DECLARE
  old_manager_club_id INTEGER;
  new_manager_club_id INTEGER;
BEGIN
  -- If manager_id changed, we need to update the player's club
  IF NEW.manager_id IS DISTINCT FROM OLD.manager_id AND NEW.player_id IS NOT NULL THEN
    -- Get club IDs for both managers
    SELECT club_id INTO old_manager_club_id FROM managers WHERE id = OLD.manager_id;
    SELECT club_id INTO new_manager_club_id FROM managers WHERE id = NEW.manager_id;
    
    -- Only proceed if the clubs are different
    IF new_manager_club_id IS DISTINCT FROM old_manager_club_id THEN
      -- Update the player's club_id
      UPDATE players
      SET club_id = new_manager_club_id
      WHERE id = NEW.player_id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for manager_squads updates
CREATE TRIGGER squad_manager_update_trigger
AFTER UPDATE ON manager_squads
FOR EACH ROW
WHEN (NEW.manager_id IS DISTINCT FROM OLD.manager_id)
EXECUTE FUNCTION sync_squad_club_changes();

-- 4. Update player stats when club or value changes
CREATE OR REPLACE FUNCTION update_player_stats_on_changes()
RETURNS TRIGGER AS $$
DECLARE
  club_name TEXT;
  current_season TEXT := '6-8'; -- Adjust as needed
BEGIN
  -- Only proceed if value or club changed
  IF NEW.value IS DISTINCT FROM OLD.value OR NEW.club_id IS DISTINCT FROM OLD.club_id THEN
    -- Get club name if we have a club_id
    IF NEW.club_id IS NOT NULL THEN
      SELECT name INTO club_name FROM clubs WHERE id = NEW.club_id;
      
      IF club_name IS NOT NULL THEN
        -- Check if we already have a stat for this club and season
        IF EXISTS (
          SELECT 1 FROM player_stats
          WHERE player_id = NEW.id
          AND team = club_name
          AND season = current_season
        ) THEN
          -- Update the existing stat
          UPDATE player_stats
          SET value = NEW.value::TEXT
          WHERE player_id = NEW.id
          AND team = club_name
          AND season = current_season;
        ELSE
          -- Create a new stat
          INSERT INTO player_stats (
            player_id,
            season,
            team,
            value,
            apps
          ) VALUES (
            NEW.id,
            current_season,
            club_name,
            NEW.value::TEXT,
            '0'
          );
        END IF;
      END IF;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for player value or club updates
CREATE TRIGGER player_stats_sync_trigger
AFTER UPDATE ON players
FOR EACH ROW
WHEN (NEW.value IS DISTINCT FROM OLD.value OR NEW.club_id IS DISTINCT FROM OLD.club_id)
EXECUTE FUNCTION update_player_stats_on_changes();

-- 5. Sync player_name in manager_squads when player name changes
CREATE OR REPLACE FUNCTION sync_player_name_changes()
RETURNS TRIGGER AS $$
BEGIN
  -- If name changed, update all references in manager_squads
  IF NEW.name IS DISTINCT FROM OLD.name THEN
    UPDATE manager_squads
    SET player_name = NEW.name
    WHERE player_id = NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for player name updates
CREATE TRIGGER player_name_update_trigger
AFTER UPDATE ON players
FOR EACH ROW
WHEN (NEW.name IS DISTINCT FROM OLD.name)
EXECUTE FUNCTION sync_player_name_changes();

-- 6. Remove player from manager_squads when deleted
CREATE OR REPLACE FUNCTION remove_deleted_player_from_squads()
RETURNS TRIGGER AS $$
BEGIN
  -- Remove from all manager squads
  DELETE FROM manager_squads
  WHERE player_id = OLD.id;
  
  -- Also delete related stats
  DELETE FROM player_stats
  WHERE player_id = OLD.id;
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Trigger for player deletions
CREATE TRIGGER player_delete_trigger
BEFORE DELETE ON players
FOR EACH ROW
EXECUTE FUNCTION remove_deleted_player_from_squads();

-- 7. Sync season awards from manager data
CREATE OR REPLACE FUNCTION sync_season_awards()
RETURNS TRIGGER AS $$
DECLARE
  award_id_var INTEGER;
  season_id_var INTEGER;
BEGIN
  -- If the manager has been updated with new awards data
  IF NEW.awards IS NOT NULL AND (OLD.awards IS NULL OR NEW.awards > OLD.awards) THEN
    -- Get the manager's current season
    SELECT id INTO season_id_var FROM seasons 
    WHERE manager_id = NEW.id 
    AND number = NEW.current_season;
    
    -- If we found a valid season
    IF season_id_var IS NOT NULL THEN
      -- Check if there are specific awards in the seasons data
      -- Loop through the manager's seasons to find awards
      FOR i IN 1..array_length(NEW.seasons, 1) LOOP
        IF NEW.seasons[i] IS NOT NULL AND NEW.seasons[i]->>'awards' IS NOT NULL THEN
          -- Golden Boot award
          IF NEW.seasons[i]->'awards'->>'golden_boot' = 'true' OR 
             NEW.seasons[i]->'awards'->>'league_golden_boot' = 'true' THEN
            -- Get the award ID
            SELECT id INTO award_id_var FROM awards WHERE name = 'Golden Boot';
            IF award_id_var IS NULL THEN
              -- Create the award if it doesn't exist
              INSERT INTO awards (name) VALUES ('Golden Boot') RETURNING id INTO award_id_var;
            END IF;
            
            -- Add the season award if it doesn't exist
            IF NOT EXISTS (
              SELECT 1 FROM season_awards 
              WHERE season_id = season_id_var AND award_id = award_id_var
            ) THEN
              INSERT INTO season_awards (season_id, award_id)
              VALUES (season_id_var, award_id_var);
            END IF;
          END IF;
          
          -- Golden Glove award
          IF NEW.seasons[i]->'awards'->>'golden_glove' = 'true' OR 
             NEW.seasons[i]->'awards'->>'league_golden_glove' = 'true' THEN
            -- Get the award ID
            SELECT id INTO award_id_var FROM awards WHERE name = 'Golden Glove';
            IF award_id_var IS NULL THEN
              -- Create the award if it doesn't exist
              INSERT INTO awards (name) VALUES ('Golden Glove') RETURNING id INTO award_id_var;
            END IF;
            
            -- Add the season award if it doesn't exist
            IF NOT EXISTS (
              SELECT 1 FROM season_awards 
              WHERE season_id = season_id_var AND award_id = award_id_var
            ) THEN
              INSERT INTO season_awards (season_id, award_id)
              VALUES (season_id_var, award_id_var);
            END IF;
          END IF;
          
          -- UCL Golden Boot award
          IF NEW.seasons[i]->'awards'->>'ucl_golden_boot' = 'true' THEN
            -- Get the award ID
            SELECT id INTO award_id_var FROM awards WHERE name = 'UCL Golden Boot';
            IF award_id_var IS NULL THEN
              -- Create the award if it doesn't exist
              INSERT INTO awards (name) VALUES ('UCL Golden Boot') RETURNING id INTO award_id_var;
            END IF;
            
            -- Add the season award if it doesn't exist
            IF NOT EXISTS (
              SELECT 1 FROM season_awards 
              WHERE season_id = season_id_var AND award_id = award_id_var
            ) THEN
              INSERT INTO season_awards (season_id, award_id)
              VALUES (season_id_var, award_id_var);
            END IF;
          END IF;
          
          -- UEL Golden Boot award
          IF NEW.seasons[i]->'awards'->>'uel_golden_boot' = 'true' THEN
            -- Get the award ID
            SELECT id INTO award_id_var FROM awards WHERE name = 'UEL Golden Boot';
            IF award_id_var IS NULL THEN
              -- Create the award if it doesn't exist
              INSERT INTO awards (name) VALUES ('UEL Golden Boot') RETURNING id INTO award_id_var;
            END IF;
            
            -- Add the season award if it doesn't exist
            IF NOT EXISTS (
              SELECT 1 FROM season_awards 
              WHERE season_id = season_id_var AND award_id = award_id_var
            ) THEN
              INSERT INTO season_awards (season_id, award_id)
              VALUES (season_id_var, award_id_var);
            END IF;
          END IF;
          
          -- UEL Golden Glove award
          IF NEW.seasons[i]->'awards'->>'uel_golden_glove' = 'true' THEN
            -- Get the award ID
            SELECT id INTO award_id_var FROM awards WHERE name = 'UEL Golden Glove';
            IF award_id_var IS NULL THEN
              -- Create the award if it doesn't exist
              INSERT INTO awards (name) VALUES ('UEL Golden Glove') RETURNING id INTO award_id_var;
            END IF;
            
            -- Add the season award if it doesn't exist
            IF NOT EXISTS (
              SELECT 1 FROM season_awards 
              WHERE season_id = season_id_var AND award_id = award_id_var
            ) THEN
              INSERT INTO season_awards (season_id, award_id)
              VALUES (season_id_var, award_id_var);
            END IF;
          END IF;
          
          -- Super Cup Golden Boot award
          IF NEW.seasons[i]->'awards'->>'super_cup_golden_boot' = 'true' THEN
            -- Get the award ID
            SELECT id INTO award_id_var FROM awards WHERE name = 'Super Cup Golden Boot';
            IF award_id_var IS NULL THEN
              -- Create the award if it doesn't exist
              INSERT INTO awards (name) VALUES ('Super Cup Golden Boot') RETURNING id INTO award_id_var;
            END IF;
            
            -- Add the season award if it doesn't exist
            IF NOT EXISTS (
              SELECT 1 FROM season_awards 
              WHERE season_id = season_id_var AND award_id = award_id_var
            ) THEN
              INSERT INTO season_awards (season_id, award_id)
              VALUES (season_id_var, award_id_var);
            END IF;
          END IF;
        END IF;
      END LOOP;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for manager updates to sync awards
CREATE TRIGGER manager_awards_sync_trigger
AFTER UPDATE OF awards ON managers
FOR EACH ROW
WHEN (NEW.awards IS DISTINCT FROM OLD.awards)
EXECUTE FUNCTION sync_season_awards();

-- 8. Sync player value changes to manager_squads
CREATE OR REPLACE FUNCTION sync_player_value_changes()
RETURNS TRIGGER AS $$
BEGIN
  -- If the player's value has changed
  IF NEW.value IS DISTINCT FROM OLD.value THEN
    -- Update the value in the manager_squads table
    UPDATE manager_squads
    SET value = NEW.value,
        -- Also update salary based on value (10% of value as per add_player_to_manager_squads function)
        salary = NEW.value * 0.1
    WHERE player_id = NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to call the function when a player's value is updated
CREATE TRIGGER player_value_update_trigger
AFTER UPDATE OF value ON players
FOR EACH ROW
EXECUTE FUNCTION sync_player_value_changes();

-- 9. Sync player name changes to manager_squads
CREATE OR REPLACE FUNCTION sync_player_name_changes_to_squads()
RETURNS TRIGGER AS $$
BEGIN
  -- If the player's name has changed
  IF NEW.name IS DISTINCT FROM OLD.name THEN
    -- Update the name in the manager_squads table
    UPDATE manager_squads
    SET player_name = NEW.name
    WHERE player_id = NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to call the function when a player's name is updated
CREATE TRIGGER player_name_update_to_squads_trigger
AFTER UPDATE OF name ON players
FOR EACH ROW
EXECUTE FUNCTION sync_player_name_changes_to_squads();

-- 10. Sync player position changes to manager_squads
CREATE OR REPLACE FUNCTION sync_player_position_changes()
RETURNS TRIGGER AS $$
BEGIN
  -- If the player's position has changed
  IF NEW.position IS DISTINCT FROM OLD.position THEN
    -- Update the position in the manager_squads table
    UPDATE manager_squads
    SET position = NEW.position
    WHERE player_id = NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to call the function when a player's position is updated
CREATE TRIGGER player_position_update_trigger
AFTER UPDATE OF position ON players
FOR EACH ROW
EXECUTE FUNCTION sync_player_position_changes(); 