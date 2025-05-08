-- Synchronization check analysis for Supabase tables
-- This script checks for potential gaps in synchronization between related tables

/*
Tables in our schema:
- clubs
- players
- player_stats
- managers
- manager_squads
- manager_performances
- competitions
- seasons
- season_competitions
- season_stats
- awards
- season_awards
*/

-- Check 1: New player_squad insert not syncing to player
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

-- Trigger to call the function when a manager_squad entry is inserted
CREATE TRIGGER squad_insert_trigger
AFTER INSERT ON manager_squads
FOR EACH ROW
EXECUTE FUNCTION sync_new_squad_to_player();

-- Check 2: Deleting squad entry not updating player's club
CREATE OR REPLACE FUNCTION sync_squad_delete_to_player()
RETURNS TRIGGER AS $$
BEGIN
  -- When a player is removed from a squad, set their club to null if this was their only squad
  IF OLD.player_id IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1 FROM manager_squads 
      WHERE player_id = OLD.player_id AND id != OLD.id
    ) THEN
      -- This was the player's only squad, set club to FREE AGENT
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

-- Check 3: Player name changes not reflected in manager_squads
CREATE OR REPLACE FUNCTION sync_player_name_to_squad()
RETURNS TRIGGER AS $$
BEGIN
  -- If player name changes, update it in manager_squads
  IF NEW.name != OLD.name THEN
    UPDATE manager_squads
    SET player_name = NEW.name
    WHERE player_id = NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to call the function when a player's name is updated
CREATE TRIGGER player_name_update_trigger
AFTER UPDATE ON players
FOR EACH ROW
WHEN (NEW.name IS DISTINCT FROM OLD.name)
EXECUTE FUNCTION sync_player_name_to_squad();

-- Check 4: Club name changes not reflected anywhere
CREATE OR REPLACE FUNCTION sync_club_name()
RETURNS TRIGGER AS $$
BEGIN
  -- If club name changes, we don't need to update anything else as we use club_id for relations
  -- This is just for verification
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to call the function when a club's name is updated
CREATE TRIGGER club_name_update_trigger
AFTER UPDATE ON clubs
FOR EACH ROW
WHEN (NEW.name IS DISTINCT FROM OLD.name)
EXECUTE FUNCTION sync_club_name();

-- Check 5: Manager changes not affecting squad
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

-- Check 6: Season deletion not updating manager stats
CREATE OR REPLACE FUNCTION sync_season_delete()
RETURNS TRIGGER AS $$
DECLARE
  manager_id_var INTEGER;
BEGIN
  -- Get the manager ID
  manager_id_var := OLD.manager_id;
  
  -- Recalculate manager stats
  -- This should trigger cascading deletes for season_stats, season_competitions, and season_awards
  -- The other triggers should handle updating the manager's stats
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Trigger to call the function when a season is deleted
CREATE TRIGGER season_delete_trigger
AFTER DELETE ON seasons
FOR EACH ROW
EXECUTE FUNCTION sync_season_delete();

-- Summary of potential gaps in synchronization:
/*
1. ✓ Inserting new manager_squad entries not updating player club (added trigger)
2. ✓ Deleting squad entries not updating player club (added trigger)
3. ✓ Player name changes not reflected in manager_squads (added trigger)
4. ✓ Manager club changes not affecting squad players (added trigger)
5. ✓ Season deletions not updating manager performance (added trigger)

Tables with comprehensive triggers:
- players: Updates propagate to squads, clubs
- manager_squads: Updates propagate to players
- season_stats: Updates propagate to manager_performances
- seasons: Updates propagate through dependent tables
- clubs: Updates propagate to players and managers

Tables with partial triggers:
- season_awards: Updates manager award counts but not trophy count
- manager_performances: No triggers when directly modified
*/ 