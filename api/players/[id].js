const { query } = require('../db');

/**
 * API endpoint for CRUD operations on a specific player
 * GET - Get player details
 * PUT - Update player
 * DELETE - Delete player
 */
module.exports = async (req, res) => {
  try {
    // Set CORS headers to allow requests from any origin
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }
    
    // Extract player ID from URL
    const playerId = req.query.id;
    
    if (!playerId) {
      return res.status(400).json({ error: 'Player ID is required' });
    }
    
    // Handle different HTTP methods
    switch (req.method) {
      case 'GET':
        return await getPlayer(req, res, playerId);
      case 'PUT':
        return await updatePlayer(req, res, playerId);
      case 'DELETE':
        return await deletePlayer(req, res, playerId);
      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error(`Error in players/[id] API:`, error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Get a specific player by ID
 */
async function getPlayer(req, res, playerId) {
  // Query to get player with stats
  const queryString = `
    SELECT p.*, 
      (SELECT json_agg(ps.*) FROM player_stats ps WHERE ps.player_id = p.id) as stats
    FROM players p
    WHERE p.id = $1
  `;
  
  const result = await query(queryString, [playerId]);
  
  if (result.rows.length === 0) {
    return res.status(404).json({ error: 'Player not found' });
  }
  
  return res.status(200).json(result.rows[0]);
}

/**
 * Update a player
 */
async function updatePlayer(req, res, playerId) {
  // Start a transaction
  await query('BEGIN');
  
  try {
    const { name, star, level, club, position, value, games_played, image_path, stats } = req.body;
    
    // Update player record
    const updatePlayerQuery = `
      UPDATE players
      SET 
        name = $1,
        star = $2,
        level = $3,
        club = $4,
        position = $5,
        value = $6,
        games_played = $7,
        image_path = $8,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $9
      RETURNING *
    `;
    
    const playerResult = await query(updatePlayerQuery, [
      name,
      star,
      level,
      club,
      position,
      value,
      games_played,
      image_path,
      playerId
    ]);
    
    if (playerResult.rows.length === 0) {
      await query('ROLLBACK');
      return res.status(404).json({ error: 'Player not found' });
    }
    
    // Handle stats updates if provided
    if (stats && Array.isArray(stats)) {
      // Delete existing stats
      await query('DELETE FROM player_stats WHERE player_id = $1', [playerId]);
      
      // Insert new stats
      for (const stat of stats) {
        const insertStatQuery = `
          INSERT INTO player_stats 
            (player_id, season, team, value, apps)
          VALUES
            ($1, $2, $3, $4, $5)
        `;
        
        await query(insertStatQuery, [
          playerId,
          stat.season,
          stat.team,
          stat.value,
          stat.apps
        ]);
      }
    }
    
    // Commit transaction
    await query('COMMIT');
    
    // Get updated player with stats
    const updatedPlayer = await getPlayer(req, res, playerId);
    return updatedPlayer;
  } catch (error) {
    // Rollback transaction on error
    await query('ROLLBACK');
    throw error;
  }
}

/**
 * Delete a player
 */
async function deletePlayer(req, res, playerId) {
  // Delete the player (this will cascade to stats due to foreign key)
  const result = await query('DELETE FROM players WHERE id = $1 RETURNING id', [playerId]);
  
  if (result.rows.length === 0) {
    return res.status(404).json({ error: 'Player not found' });
  }
  
  return res.status(200).json({ message: 'Player deleted successfully' });
} 