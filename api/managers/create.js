const { query } = require('../db');

/**
 * API endpoint for creating a new manager
 * POST - Create a new manager
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
    
    // Extract manager data from request body
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
    } = req.body;
    
    // Validate required fields
    if (!name || !age || !club || overall_rating === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Start a transaction
    await query('BEGIN');
    
    try {
      // Insert the manager
      const insertManagerQuery = `
        INSERT INTO managers 
          (name, age, club, overall_rating, balance, wage_budget, transfer_budget)
        VALUES 
          ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
      `;
      
      const managerResult = await query(insertManagerQuery, [
        name,
        age,
        club,
        overall_rating,
        balance || 0,
        wage_budget || 0,
        transfer_budget || 0
      ]);
      
      const newManager = managerResult.rows[0];
      
      // Insert squad connections if provided
      if (Array.isArray(squad) && squad.length > 0) {
        for (const player of squad) {
          const insertSquadQuery = `
            INSERT INTO squad_players 
              (manager_id, player_id, contract_years, salary, is_starting)
            VALUES
              ($1, $2, $3, $4, $5)
          `;
          
          await query(insertSquadQuery, [
            newManager.id,
            player.player_id,
            player.contract_years,
            player.salary,
            player.is_starting || false
          ]);
        }
      }
      
      // Insert performance data if provided
      if (Array.isArray(performance) && performance.length > 0) {
        for (const perf of performance) {
          const insertPerfQuery = `
            INSERT INTO manager_performance 
              (manager_id, matches_played, wins, draws, losses, goals_scored, goals_conceded)
            VALUES
              ($1, $2, $3, $4, $5, $6, $7)
          `;
          
          await query(insertPerfQuery, [
            newManager.id,
            perf.matches_played || 0,
            perf.wins || 0,
            perf.draws || 0,
            perf.losses || 0,
            perf.goals_scored || 0,
            perf.goals_conceded || 0
          ]);
        }
      }
      
      // Insert seasons data if provided
      if (Array.isArray(seasons) && seasons.length > 0) {
        for (const season of seasons) {
          const insertSeasonQuery = `
            INSERT INTO manager_seasons 
              (manager_id, season, league_position, points, competition_position)
            VALUES
              ($1, $2, $3, $4, $5)
          `;
          
          await query(insertSeasonQuery, [
            newManager.id,
            season.season,
            season.league_position || 0,
            season.points || 0,
            season.competition_position || ''
          ]);
        }
      }
      
      // Commit the transaction
      await query('COMMIT');
      
      // Get the complete manager with relationships
      const completeManagerQuery = `
        SELECT m.*, 
          (SELECT json_agg(sp.*) FROM squad_players sp WHERE sp.manager_id = m.id) as squad,
          (SELECT json_agg(mp.*) FROM manager_performance mp WHERE mp.manager_id = m.id) as performance,
          (SELECT json_agg(ms.*) FROM manager_seasons ms WHERE ms.manager_id = m.id) as seasons
        FROM managers m
        WHERE m.id = $1
      `;
      
      const completeResult = await query(completeManagerQuery, [newManager.id]);
      
      return res.status(201).json(completeResult.rows[0]);
    } catch (error) {
      // Rollback transaction on error
      await query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('Error creating manager:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}; 