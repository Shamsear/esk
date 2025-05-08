require('dotenv').config();
const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Load JSON data
const playersData = JSON.parse(fs.readFileSync('./players.json', 'utf8'));
const managersData = JSON.parse(fs.readFileSync('./manager_data.json', 'utf8')).managers;

// Map old positions to valid enum values if needed
const positionMapping = {
  'GK': 'GK',
  'CB': 'CB',
  'RB': 'RB',
  'LB': 'LB',
  'CDM': 'DM',
  'CM': 'CM',
  'CAM': 'AM',
  'AM': 'AM',
  'LW': 'LW',
  'RW': 'RW',
  'CF': 'ST',
  'ST': 'ST'
};

// Function to safely convert to integer
function safeInteger(value) {
  if (value === undefined || value === null || value === '-' || value === '') {
    return 0;
  }
  const parsed = parseInt(value);
  return isNaN(parsed) ? 0 : parsed;
}

// Function to safely convert to float
function safeFloat(value) {
  if (value === undefined || value === null || value === '-' || value === '') {
    return 0;
  }
  const parsed = parseFloat(value);
  return isNaN(parsed) ? 0 : parsed;
}

// Function to insert data in chunks to avoid rate limits
async function insertDataInChunks(tableName, data, chunkSize = 50) {
  console.log(`Inserting ${data.length} records into ${tableName}...`);
  
  if (data.length === 0) {
    console.log(`No data to insert for ${tableName}, skipping.`);
    return [];
  }
  
  const results = [];
  
  for (let i = 0; i < data.length; i += chunkSize) {
    const chunk = data.slice(i, i + chunkSize);
    const { data: insertedData, error } = await supabase.from(tableName).insert(chunk).select();
    
    if (error) {
      console.error(`Error inserting chunk ${Math.floor(i / chunkSize) + 1} into ${tableName}:`, error);
      // Log the first problematic record to help debug
      if (chunk.length > 0) {
        console.error(`First record in failed chunk:`, JSON.stringify(chunk[0], null, 2));
      }
    } else {
      console.log(`Inserted chunk ${Math.floor(i / chunkSize) + 1}/${Math.ceil(data.length / chunkSize)} into ${tableName}`);
      if (insertedData) {
        results.push(...insertedData);
      }
    }
  }
  
  return results;
}

// Function to extract unique clubs from players and managers
async function extractAndInsertClubs() {
  console.log('Extracting and inserting clubs...');
  
  const clubsSet = new Set();
  
  // Extract clubs from players
  playersData.forEach(player => {
    if (player.club && player.club !== 'FREE AGENT') {
      clubsSet.add(player.club);
    }
  });
  
  // Extract clubs from managers
  managersData.forEach(manager => {
    if (manager.club) {
      clubsSet.add(manager.club);
    }
  });
  
  const clubsData = Array.from(clubsSet).map((name, index) => ({
    id: index + 1,
    name
  }));
  
  const insertedClubs = await insertDataInChunks('clubs', clubsData);
  
  // Create a mapping of club names to IDs for later use
  const clubsMap = {};
  insertedClubs.forEach(club => {
    clubsMap[club.name] = club.id;
  });
  
  return clubsMap;
}

// Validate player position against the updated enum values
function validatePosition(position) {
  return positionMapping[position] || 'ST'; // Default to ST if unknown
}

// Insert players data
async function insertPlayers(clubsMap) {
  console.log('Inserting players...');
  
  const playersToInsert = playersData.map(player => {
    return {
      id: player.id,
      name: player.name,
      star: player.star,
      level: player.level,
      club_id: player.club && player.club !== 'FREE AGENT' ? clubsMap[player.club] : null,
      position: validatePosition(player.position),
      value: safeInteger(player.value),
      games_played: safeInteger(player.gamesPlayed),
      image_path: player.imagePath,
      club_logo: player.clubLogo
    };
  });
  
  const insertedPlayers = await insertDataInChunks('players', playersToInsert);
  
  // Create a mapping of player names to IDs for later use
  const playersMap = {};
  insertedPlayers.forEach(player => {
    playersMap[player.name] = player.id;
  });
  
  return playersMap;
}

// Insert player stats
async function insertPlayerStats(playersMap) {
  console.log('Inserting player stats...');
  
  const statsToInsert = [];
  
  playersData.forEach(player => {
    if (player.stats && player.stats.length > 0) {
      player.stats.forEach(stat => {
        statsToInsert.push({
          player_id: player.id,
          season: stat.season,
          team: stat.team,
          value: stat.value,
          apps: stat.apps || ''
        });
      });
    }
  });
  
  await insertDataInChunks('player_stats', statsToInsert);
}

// Insert managers data
async function insertManagers(clubsMap) {
  console.log('Inserting managers...');
  
  const managersToInsert = managersData.map((manager, index) => {
    return {
      id: index + 1,
      name: manager.name,
      age: safeInteger(manager.age),
      club_id: manager.club ? clubsMap[manager.club] : null,
      overall_rating: safeFloat(manager.overall_rating),
      r2g_coin_balance: safeInteger(manager.r2g_coin_balance),
      r2g_token_balance: safeInteger(manager.r2g_token_balance),
      club_total_value: safeInteger(manager.club_total_value),
      manager_rating: safeFloat(manager.manager_rating),
      trophies: safeInteger(manager.trophies),
      awards: safeInteger(manager.awards),
      current_season: safeInteger(manager.current_season),
      star_rating: safeInteger(manager.star_rating)
    };
  });
  
  const insertedManagers = await insertDataInChunks('managers', managersToInsert);
  
  // Return the mapping of manager names to IDs
  const managersMap = {};
  insertedManagers.forEach(manager => {
    managersMap[manager.name] = manager.id;
  });
  
  return managersMap;
}

// Insert manager performance data
async function insertManagerPerformances(managersMap) {
  console.log('Inserting manager performances...');
  
  const performancesToInsert = [];
  
  managersData.forEach(manager => {
    if (manager.performance && managersMap[manager.name]) {
      performancesToInsert.push({
        manager_id: managersMap[manager.name],
        matches: safeInteger(manager.performance.matches),
        wins: safeInteger(manager.performance.wins),
        draws: safeInteger(manager.performance.draws),
        losses: safeInteger(manager.performance.losses),
        goals_scored: safeInteger(manager.performance.goals_scored),
        goals_conceded: safeInteger(manager.performance.goals_conceded),
        goal_difference: safeInteger(manager.performance.goal_difference),
        clean_sheets: safeInteger(manager.performance.clean_sheets)
      });
    }
  });
  
  await insertDataInChunks('manager_performances', performancesToInsert);
}

// Insert competitions
async function insertCompetitions() {
  console.log('Inserting competitions...');
  
  const competitionsSet = new Set();
  
  // Extract all competition names from all managers' seasons
  managersData.forEach(manager => {
    if (manager.seasons && manager.seasons.length > 0) {
      manager.seasons.forEach(season => {
        const competitions = season.competitions;
        if (competitions) {
          for (const key in competitions) {
            if (competitions[key] && competitions[key].name) {
              competitionsSet.add(competitions[key].name);
            }
          }
        }
      });
    }
  });
  
  const competitionsData = Array.from(competitionsSet).map((name, index) => ({
    id: index + 1,
    name
  }));
  
  const insertedCompetitions = await insertDataInChunks('competitions', competitionsData);
  
  // Return a mapping of competition names to IDs
  const competitionsMap = {};
  insertedCompetitions.forEach(comp => {
    competitionsMap[comp.name] = comp.id;
  });
  
  return competitionsMap;
}

// Insert seasons, season_competitions, and season_stats
async function insertSeasons(managersMap, competitionsMap) {
  console.log('Inserting seasons and related data...');
  
  const seasonsToInsert = [];
  
  managersData.forEach((manager, managerIndex) => {
    if (manager.seasons && manager.seasons.length > 0 && managersMap[manager.name]) {
      manager.seasons.forEach((season, seasonIndex) => {
        // Insert season
        const seasonEntry = {
          id: (managerIndex * 10) + seasonIndex + 1, // Generate predictable IDs
          number: safeInteger(season.number),
          manager_id: managersMap[manager.name],
          manager_rank: String(season.manager_rank || '-'),
          rank_point: safeFloat(season.rank_point),
          team_income: safeInteger(season.team_income),
          team_expense: safeInteger(season.team_expense),
          team_profit: safeInteger(season.team_profit),
          session_rewards: safeInteger(season.session_rewards)
        };
        
        seasonsToInsert.push(seasonEntry);
      });
    }
  });
  
  const insertedSeasons = await insertDataInChunks('seasons', seasonsToInsert);
  
  // Create a mapping from manager+season to season_id
  const seasonIdsMap = {};
  insertedSeasons.forEach(season => {
    seasonIdsMap[`${season.manager_id}_${season.number}`] = season.id;
  });
  
  // Now that seasons are inserted, add season-related data
  const seasonCompetitionsToInsert = [];
  const seasonStatsToInsert = [];
  
  managersData.forEach((manager) => {
    if (manager.seasons && manager.seasons.length > 0 && managersMap[manager.name]) {
      manager.seasons.forEach((season) => {
        const seasonId = seasonIdsMap[`${managersMap[manager.name]}_${safeInteger(season.number)}`];
        if (!seasonId) return; // Skip if we couldn't find the season ID
        
        // Insert season competitions
        const competitions = season.competitions;
        if (competitions) {
          for (const key in competitions) {
            if (competitions[key] && competitions[key].name && competitionsMap[competitions[key].name]) {
              seasonCompetitionsToInsert.push({
                season_id: seasonId,
                competition_id: competitionsMap[competitions[key].name],
                placement: competitions[key].placement || null,
                stage: competitions[key].stage || null
              });
            }
          }
        }
        
        // Insert season stats
        if (season.season_stats) {
          seasonStatsToInsert.push({
            season_id: seasonId,
            is_special_tour: false,
            matches: safeInteger(season.season_stats.matches),
            wins: safeInteger(season.season_stats.wins),
            draws: safeInteger(season.season_stats.draws),
            losses: safeInteger(season.season_stats.losses),
            goals_scored: safeInteger(season.season_stats.goals_scored),
            goals_conceded: safeInteger(season.season_stats.goals_conceded),
            goal_difference: safeInteger(season.season_stats.goal_difference),
            clean_sheets: safeInteger(season.season_stats.clean_sheets)
          });
        }
        
        // Insert special tour stats if they exist
        if (season.sp_tour_stats) {
          seasonStatsToInsert.push({
            season_id: seasonId,
            is_special_tour: true,
            matches: safeInteger(season.sp_tour_stats.matches),
            wins: safeInteger(season.sp_tour_stats.wins),
            draws: safeInteger(season.sp_tour_stats.draws),
            losses: safeInteger(season.sp_tour_stats.losses),
            goals_scored: safeInteger(season.sp_tour_stats.goals_scored),
            goals_conceded: safeInteger(season.sp_tour_stats.goals_conceded),
            goal_difference: safeInteger(season.sp_tour_stats.goal_difference),
            clean_sheets: safeInteger(season.sp_tour_stats.clean_sheets)
          });
        }
      });
    }
  });
  
  await insertDataInChunks('season_competitions', seasonCompetitionsToInsert);
  await insertDataInChunks('season_stats', seasonStatsToInsert);
  
  return seasonIdsMap;
}

// Insert awards and season awards
async function insertAwards(seasonIdsMap) {
  console.log('Inserting awards data...');
  
  // Pre-defined list of possible awards
  const awardsList = ['golden_boot', 'golden_glove', 'manager_of_season', 'best_player'];
  
  // Insert all possible awards
  const awardsToInsert = awardsList.map((name, index) => ({
    id: index + 1,
    name
  }));
  
  const insertedAwards = await insertDataInChunks('awards', awardsToInsert);
  
  // Create awards mapping
  const awardsMap = {};
  insertedAwards.forEach(award => {
    awardsMap[award.name] = award.id;
  });
  
  // Extract and insert season awards
  const seasonAwardsToInsert = [];
  
  managersData.forEach((manager) => {
    if (manager.seasons && manager.seasons.length > 0 && managersMap[manager.name]) {
      manager.seasons.forEach((season) => {
        const seasonId = seasonIdsMap[`${managersMap[manager.name]}_${safeInteger(season.number)}`];
        if (!seasonId) return; // Skip if we couldn't find the season ID
        
        if (season.awards) {
          for (const awardKey in season.awards) {
            if (season.awards[awardKey] === true && awardsMap[awardKey]) {
              seasonAwardsToInsert.push({
                season_id: seasonId,
                award_id: awardsMap[awardKey]
              });
            }
          }
        }
      });
    }
  });
  
  await insertDataInChunks('season_awards', seasonAwardsToInsert);
}

// Insert manager squad data
async function insertManagerSquads(managersMap, playersMap) {
  console.log('Inserting manager squads...');
  
  const squadsToInsert = [];
  
  managersData.forEach(manager => {
    if (manager.squad && manager.squad.players && manager.squad.players.length > 0 && managersMap[manager.name]) {
      manager.squad.players.forEach(player => {
        // Handle player types to match the enum
        let playerType = player.type;
        if (!['standard', 'prime', 'icon', 'legend', 'prime legend'].includes(playerType)) {
          // Handle any unexpected player types
          if (playerType === 'prime-legend') {
            playerType = 'prime legend';
          } else {
            playerType = 'standard'; // Default fallback
          }
        }
        
        squadsToInsert.push({
          manager_id: managersMap[manager.name],
          player_name: player.name,
          position: validatePosition(player.position),
          value: safeInteger(player.value),
          contract: player.contract,
          salary: safeFloat(player.salary),
          player_type: playerType,
          player_id: playersMap[player.name] || null
        });
      });
    }
  });
  
  await insertDataInChunks('manager_squads', squadsToInsert);
}

// Global variable for manager mapping
let managersMap = {};

// Main migration function
async function runMigration() {
  try {
    console.log('Starting data migration...');
    
    // Step 1: Insert clubs and get mapping
    const clubsMap = await extractAndInsertClubs();
    
    // Step 2: Insert players and get mapping
    const playersMap = await insertPlayers(clubsMap);
    
    // Step 3: Insert player stats
    await insertPlayerStats(playersMap);
    
    // Step 4: Insert managers and get mapping
    managersMap = await insertManagers(clubsMap);
    
    // Step 5: Insert manager performances
    await insertManagerPerformances(managersMap);
    
    // Step 6: Insert competitions and get mapping
    const competitionsMap = await insertCompetitions();
    
    // Step 7: Insert seasons and related data
    const seasonIdsMap = await insertSeasons(managersMap, competitionsMap);
    
    // Step 8: Insert awards and season awards
    await insertAwards(seasonIdsMap);
    
    // Step 9: Insert manager squads
    await insertManagerSquads(managersMap, playersMap);
    
    console.log('Migration completed successfully!');
    
  } catch (error) {
    console.error('Migration failed:', error);
  }
}

runMigration(); 