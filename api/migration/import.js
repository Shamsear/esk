const { query } = require('../db');
const fs = require('fs');
const path = require('path');

/**
 * API endpoint for importing data from JSON files into the database
 * POST - Import players and managers data
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
    
    // Extract data type from request body
    const { dataType } = req.body;
    
    if (!dataType || (dataType !== 'players' && dataType !== 'managers')) {
      return res.status(400).json({ error: 'Valid dataType (players or managers) is required' });
    }
    
    // Read data from JSON file
    const dataPath = path.join(process.cwd(), `${dataType}.json`);
    
    if (!fs.existsSync(dataPath)) {
      return res.status(404).json({ error: `${dataType}.json file not found` });
    }
    
    const jsonData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    
    if (!jsonData || !Array.isArray(jsonData)) {
      return res.status(400).json({ error: `Invalid ${dataType} data format` });
    }
    
    let importResult;
    
    // Start a transaction
    await query('BEGIN');
    
    try {
      // Process data based on type
      if (dataType === 'players') {
        importResult = await importPlayers(jsonData);
      } else {
        importResult = await importManagers(jsonData);
      }
      
      // Commit the transaction
      await query('COMMIT');
      
      return res.status(200).json({
        message: `${dataType} data imported successfully`,
        imported: importResult.imported,
        skipped: importResult.skipped,
        errors: importResult.errors
      });
    } catch (error) {
      // Rollback transaction on error
      await query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error(`Error importing ${req.body?.dataType || 'unknown'} data:`, error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Import players data
 */
async function importPlayers(players) {
  const result = {
    imported: 0,
    skipped: 0,
    errors: []
  };
  
  for (const player of players) {
    try {
      // Check for duplicate by name
      const existingCheck = await query('SELECT id FROM players WHERE name = $1', [player.name]);
      
      if (existingCheck.rows.length > 0) {
        result.skipped++;
        continue;
      }
      
      // Insert player
      const insertPlayerQuery = `
        INSERT INTO players 
          (name, star, level, club, position, value, games_played, image_path)
        VALUES 
          ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING id
      `;
      
      const playerResult = await query(insertPlayerQuery, [
        player.name,
        player.star,
        player.level,
        player.club,
        player.position,
        player.value,
        player.games_played || 0,
        player.image_path || null
      ]);
      
      const playerId = playerResult.rows[0].id;
      
      // Insert stats if available
      if (player.stats && Array.isArray(player.stats)) {
        for (const stat of player.stats) {
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
            stat.apps || '00'
          ]);
        }
      }
      
      result.imported++;
    } catch (error) {
      console.error(`Error importing player ${player.name}:`, error);
      result.errors.push({ name: player.name, error: error.message });
    }
  }
  
  return result;
}

/**
 * Import managers data
 */
async function importManagers(managers) {
  const result = {
    imported: 0,
    skipped: 0,
    errors: []
  };
  
  for (const manager of managers) {
    try {
      // Check for duplicate by name
      const existingCheck = await query('SELECT id FROM managers WHERE name = $1', [manager.name]);
      
      if (existingCheck.rows.length > 0) {
        result.skipped++;
        continue;
      }
      
      // Insert manager
      const insertManagerQuery = `
        INSERT INTO managers 
          (name, age, club, overall_rating, balance, wage_budget, transfer_budget)
        VALUES 
          ($1, $2, $3, $4, $5, $6, $7)
        RETURNING id
      `;
      
      const managerResult = await query(insertManagerQuery, [
        manager.name,
        manager.age,
        manager.club,
        manager.overall_rating,
        manager.balance || 0,
        manager.wage_budget || 0,
        manager.transfer_budget || 0
      ]);
      
      const managerId = managerResult.rows[0].id;
      
      // Insert squad if available
      if (manager.squad && Array.isArray(manager.squad)) {
        for (const player of manager.squad) {
          // Find player id by name
          const playerQuery = await query('SELECT id FROM players WHERE name = $1', [player.name]);
          
          if (playerQuery.rows.length > 0) {
            const playerId = playerQuery.rows[0].id;
            
            const insertSquadQuery = `
              INSERT INTO squad_players 
                (manager_id, player_id, contract_years, salary, is_starting)
              VALUES
                ($1, $2, $3, $4, $5)
            `;
            
            await query(insertSquadQuery, [
              managerId,
              playerId,
              player.contract_years || 1,
              player.salary || 0,
              player.is_starting || false
            ]);
          }
        }
      }
      
      // Insert performance if available
      if (manager.performance) {
        const insertPerfQuery = `
          INSERT INTO manager_performance 
            (manager_id, matches_played, wins, draws, losses, goals_scored, goals_conceded)
          VALUES
            ($1, $2, $3, $4, $5, $6, $7)
        `;
        
        await query(insertPerfQuery, [
          managerId,
          manager.performance.matches_played || 0,
          manager.performance.wins || 0,
          manager.performance.draws || 0,
          manager.performance.losses || 0,
          manager.performance.goals_scored || 0,
          manager.performance.goals_conceded || 0
        ]);
      }
      
      // Insert seasons if available
      if (manager.seasons && Array.isArray(manager.seasons)) {
        for (const season of manager.seasons) {
          const insertSeasonQuery = `
            INSERT INTO manager_seasons 
              (manager_id, season, league_position, points, competition_position)
            VALUES
              ($1, $2, $3, $4, $5)
          `;
          
          await query(insertSeasonQuery, [
            managerId,
            season.season,
            season.league_position || 0,
            season.points || 0,
            season.competition_position || ''
          ]);
        }
      }
      
      result.imported++;
    } catch (error) {
      console.error(`Error importing manager ${manager.name}:`, error);
      result.errors.push({ name: manager.name, error: error.message });
    }
  }
  
  return result;
} 