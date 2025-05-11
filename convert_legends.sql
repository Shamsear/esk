-- SQL script to convert 4-star and 5-star legend players to legend type
-- This script updates the manager_squads table based on player star ratings

-- First, let's create a function to handle the conversion
CREATE OR REPLACE FUNCTION convert_legend_players()
RETURNS void AS $$
DECLARE
    updated_count INTEGER := 0;
BEGIN
    -- Update manager_squads table to set type = 'legend' for all players who are 4 or 5 star legends
    UPDATE manager_squads ms
    SET player_type = 'legend'
    FROM players p
    WHERE ms.player_id = p.id
    AND p.star IN ('5-star-legend'::star_rating, '4-star-legend'::star_rating)
    AND (ms.player_type IS NULL OR ms.player_type != 'legend');
    
    -- Get the count of updated rows
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    
    -- Log the results
    RAISE NOTICE 'Converted % players to legend type', updated_count;
END;
$$ LANGUAGE plpgsql;

-- Execute the function to perform the conversion
SELECT convert_legend_players();

-- Verify the results
SELECT 
    p.id AS player_id,
    p.name AS player_name,
    p.star AS star_rating,
    ms.player_type AS squad_type,
    m.name AS manager_name
FROM 
    manager_squads ms
JOIN 
    players p ON ms.player_id = p.id
JOIN
    managers m ON ms.manager_id = m.id
WHERE 
    p.star IN ('5-star-legend'::star_rating, '4-star-legend'::star_rating)
ORDER BY 
    p.star DESC, p.name;

-- Drop the function as it's no longer needed after execution
DROP FUNCTION convert_legend_players();

-- To run this script:
-- psql -U your_username -d your_database -f convert_legends.sql 