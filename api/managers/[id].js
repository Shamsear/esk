const { query } = require('../db');

/**
 * API endpoint for operations on a specific manager
 * GET - Get manager details
 * PUT - Update manager
 * DELETE - Delete manager
 */
module.exports = async (req, res) => {
  try {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }
    
    // Extract the ID from the URL query parameters
    const { id } = req.query;
    
    if (!id) {
      return res.status(400).json({ error: 'Manager ID is required' });
    }
    
    // Handle different HTTP methods
    switch (req.method) {
      case 'GET':
        return await getManager(id, res);
      case 'PUT':
        return await updateManager(id, req.body, res);
      case 'DELETE':
        return await deleteManager(id, res);
      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error(`Error in manager/${req.query.id} endpoint:`, error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Get manager details
 */
async function getManager(id, res) {
  const managerQuery = `
    SELECT m.*, 
      (SELECT json_agg(sp.*) FROM squad_players sp WHERE sp.manager_id = m.id) as squad,
      (SELECT json_agg(mp.*) FROM manager_performance mp WHERE mp.manager_id = m.id) as performance,
      (SELECT json_agg(ms.*) FROM manager_seasons ms WHERE ms.manager_id = m.id) as seasons
    FROM managers m
    WHERE m.id = $1
  `;
  
  const result = await query(managerQuery, [id]);
  
  if (result.rows.length === 0) {
    return res.status(404).json({ error: 'Manager not found' });
  }
  
  return res.status(200).json(result.rows[0]);
}

/**
 * Update manager information
 */
async function updateManager(id, data, res) {
  const {
    name,
    age,
    club,
    overall_rating,
    balance,
    wage_budget,
    transfer_budget,
    squad = [],
    performance = [],
    seasons = []
  } = data;
  
  // Check if manager exists
  const checkResult = await query('SELECT id FROM managers WHERE id = $1', [id]);
  
  if (checkResult.rows.length === 0) {
    return res.status(404).json({ error: 'Manager not found' });
  }
  
  // Start a transaction
  await query('BEGIN');
  
  try {
    // Update manager info
    const updateManagerQuery = `
      UPDATE managers 
      SET name = $1, 
          age = $2, 
          club = $3, 
          overall_rating = $4, 
          balance = $5, 
          wage_budget = $6, 
          transfer_budget = $7,
          updated_at = NOW()
      WHERE id = $8
      RETURNING *
    `;
    
    const managerResult = await query(updateManagerQuery, [
      name,
      age,
      club,
      overall_rating,
      balance,
      wage_budget,
      transfer_budget,
      id
    ]);
    
    // Handle squad players update
    if (Array.isArray(squad) && squad.length > 0) {
      // Clear existing squad connections
      await query('DELETE FROM squad_players WHERE manager_id = $1', [id]);
      
      // Insert new squad connections
      for (const player of squad) {
        await query(`
          INSERT INTO squad_players 
            (manager_id, player_id, contract_years, salary, is_starting)
          VALUES
            ($1, $2, $3, $4, $5)
        `, [
          id,
          player.player_id,
          player.contract_years,
          player.salary,
          player.is_starting
        ]);
      }
    }
    
    // Handle performance update
    if (Array.isArray(performance) && performance.length > 0) {
      // Clear existing performance data
      await query('DELETE FROM manager_performance WHERE manager_id = $1', [id]);
      
      // Insert new performance data
      for (const perf of performance) {
        await query(`
          INSERT INTO manager_performance 
            (manager_id, matches_played, wins, draws, losses, goals_scored, goals_conceded)
          VALUES
            ($1, $2, $3, $4, $5, $6, $7)
        `, [
          id,
          perf.matches_played,
          perf.wins,
          perf.draws,
          perf.losses,
          perf.goals_scored,
          perf.goals_conceded
        ]);
      }
    }
    
    // Handle seasons update
    if (Array.isArray(seasons) && seasons.length > 0) {
      // Clear existing seasons data
      await query('DELETE FROM manager_seasons WHERE manager_id = $1', [id]);
      
      // Insert new seasons data
      for (const season of seasons) {
        await query(`
          INSERT INTO manager_seasons 
            (manager_id, season, league_position, points, competition_position)
          VALUES
            ($1, $2, $3, $4, $5)
        `, [
          id,
          season.season,
          season.league_position,
          season.points,
          season.competition_position
        ]);
      }
    }
    
    // Commit the transaction
    await query('COMMIT');
    
    // Get updated manager with all relationships
    const updatedManager = await getManager(id, {
      status: (code) => ({ json: (data) => ({ code, data }) })
    });
    
    return res.status(200).json(updatedManager.data);
  } catch (error) {
    // Rollback transaction on error
    await query('ROLLBACK');
    throw error;
  }
}

/**
 * Delete a manager
 */
async function deleteManager(id, res) {
  // Start a transaction
  await query('BEGIN');
  
  try {
    // Delete related records first (these should cascade with proper FK constraints)
    await query('DELETE FROM squad_players WHERE manager_id = $1', [id]);
    await query('DELETE FROM manager_performance WHERE manager_id = $1', [id]);
    await query('DELETE FROM manager_seasons WHERE manager_id = $1', [id]);
    
    // Delete the manager
    const result = await query('DELETE FROM managers WHERE id = $1 RETURNING id', [id]);
    
    if (result.rows.length === 0) {
      await query('ROLLBACK');
      return res.status(404).json({ error: 'Manager not found' });
    }
    
    // Commit the transaction
    await query('COMMIT');
    
    return res.status(200).json({ message: 'Manager deleted successfully' });
  } catch (error) {
    // Rollback transaction on error
    await query('ROLLBACK');
    throw error;
  }
} 