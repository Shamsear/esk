const { query } = require('../db');

/**
 * API endpoint to get all players
 * Supports optional filtering by club, position, etc.
 */
module.exports = async (req, res) => {
  try {
    // Set CORS headers to allow requests from any origin
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }
    
    // Only allow GET requests
    if (req.method !== 'GET') {
      return res.status(405).json({ error: 'Method not allowed' });
    }
    
    // Extract query parameters for filtering
    const { club, position, star, search, limit = 1000, offset = 0 } = req.query;
    
    // Build the base query
    let queryString = `
      SELECT p.*, 
        (SELECT json_agg(ps.*) FROM player_stats ps WHERE ps.player_id = p.id) as stats
      FROM players p
      WHERE 1=1
    `;
    
    // Add filters if they exist
    const queryParams = [];
    let paramIndex = 1;
    
    if (club && club !== 'ALL') {
      queryString += ` AND p.club = $${paramIndex++}`;
      queryParams.push(club);
    }
    
    if (position) {
      queryString += ` AND LOWER(p.position) = LOWER($${paramIndex++})`;
      queryParams.push(position);
    }
    
    if (star && star !== 'all') {
      queryString += ` AND p.star = $${paramIndex++}`;
      queryParams.push(star);
    }
    
    if (search) {
      queryString += ` AND p.name ILIKE $${paramIndex++}`;
      queryParams.push(`%${search}%`);
    }
    
    // Add order by and pagination
    queryString += ` ORDER BY p.value DESC, p.name ASC LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
    queryParams.push(parseInt(limit), parseInt(offset));
    
    // Execute the query
    const result = await query(queryString, queryParams);
    
    // Return the result
    return res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error in players API:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}; 