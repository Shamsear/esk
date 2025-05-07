const { query } = require('../db');

/**
 * API endpoint for creating a new player
 * POST - Create a new player
 */
module.exports = async (req, res) => {
  try {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }
    
    // Only allow POST requests
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }
    
    // Extract player data from request body
    const { name, star, level, club, position, value, games_played = 0, image_path, stats = [] } = req.body;
    
    // Validate required fields
    if (!name || !star || !level || !club || !position || value === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Start a transaction
    await query('BEGIN');
    
    try {
      // Insert the player
      const insertPlayerQuery = `
        INSERT INTO players 
          (name, star, level, club, position, value, games_played, image_path)
        VALUES 
          ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *
      `;
      
      const playerResult = await query(insertPlayerQuery, [
        name,
        star,
        level,
        club,
        position,
        value,
        games_played,
        image_path
      ]);
      
      const newPlayer = playerResult.rows[0];
      
      // Insert stats if provided
      if (stats && Array.isArray(stats) && stats.length > 0) {
        for (const stat of stats) {
          const insertStatQuery = `
            INSERT INTO player_stats 
              (player_id, season, team, value, apps)
            VALUES
              ($1, $2, $3, $4, $5)
          `;
          
          await query(insertStatQuery, [
            newPlayer.id,
            stat.season,
            stat.team,
            stat.value,
            stat.apps || '00'
          ]);
        }
      }
      
      // Commit the transaction
      await query('COMMIT');
      
      // Get the complete player with stats
      const completePlayerQuery = `
        SELECT p.*, 
          (SELECT json_agg(ps.*) FROM player_stats ps WHERE ps.player_id = p.id) as stats
        FROM players p
        WHERE p.id = $1
      `;
      
      const completeResult = await query(completePlayerQuery, [newPlayer.id]);
      
      return res.status(201).json(completeResult.rows[0]);
    } catch (error) {
      // Rollback transaction on error
      await query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('Error creating player:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}; 