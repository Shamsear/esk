const { query } = require('../db');

/**
 * API endpoint for managers
 * GET - List all managers with optional filtering
 */
module.exports = async (req, res) => {
  try {
    // Set CORS headers
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
    const { 
      search = '', 
      club = '', 
      limit = 50, 
      offset = 0,
      sort_by = 'overall_rating',
      sort_order = 'DESC'
    } = req.query;
    
    // Base query
    let queryString = `
      SELECT m.*, 
        (SELECT json_agg(sp.*) FROM squad_players sp WHERE sp.manager_id = m.id) as squad,
        (SELECT json_agg(mp.*) FROM manager_performance mp WHERE mp.manager_id = m.id) as performance,
        (SELECT json_agg(ms.*) FROM manager_seasons ms WHERE ms.manager_id = m.id) as seasons
      FROM managers m
      WHERE 1=1
    `;
    
    const queryParams = [];
    let paramIndex = 1;
    
    // Add search filter if provided
    if (search) {
      queryString += ` AND LOWER(m.name) LIKE LOWER($${paramIndex})`;
      queryParams.push(`%${search}%`);
      paramIndex++;
    }
    
    // Add club filter if provided
    if (club) {
      queryString += ` AND LOWER(m.club) = LOWER($${paramIndex})`;
      queryParams.push(club);
      paramIndex++;
    }
    
    // Add sorting
    queryString += ` ORDER BY m.${sort_by} ${sort_order}`;
    
    // Add pagination
    queryString += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    queryParams.push(limit, offset);
    
    // Execute query
    const result = await query(queryString, queryParams);
    
    // Get total count for pagination
    const countResult = await query(`
      SELECT COUNT(*) FROM managers m WHERE 1=1
      ${search ? " AND LOWER(m.name) LIKE LOWER($1)" : ""}
      ${club ? ` AND LOWER(m.club) = LOWER($${search ? 2 : 1})` : ""}
    `, search || club ? [
      ...(search ? [`%${search}%`] : []),
      ...(club ? [club] : [])
    ] : []);
    
    return res.status(200).json({
      managers: result.rows,
      total: parseInt(countResult.rows[0].count, 10),
      limit: parseInt(limit, 10),
      offset: parseInt(offset, 10)
    });
  } catch (error) {
    console.error('Error fetching managers:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}; 