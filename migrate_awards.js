// Import required modules
const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');
const path = require('path');

// Initialize Supabase client - replace with your credentials
const supabaseUrl = process.env.SUPABASE_URL || 'https://aikjdwmacnpdsrqdkhkq.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFpa2pkd21hY25wZHNycWRraGtxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY2MDY1NTQsImV4cCI6MjA2MjE4MjU1NH0.vcJZ5TxAdm4jC22CxaV4CxiElFt9OHYZhFzEIasyz-M';
const supabase = createClient(supabaseUrl, supabaseKey);

// Path to manager_data.json file
const managerDataPath = path.join(__dirname, 'manager_data.json');

// Map of award types
const awardTypes = {
  'golden_boot': 'Golden Boot',
  'golden_glove': 'Golden Glove',
  'league_golden_boot': 'League Golden Boot',
  'league_golden_glove': 'League Golden Glove',
  'ucl_golden_boot': 'UCL Golden Boot',
  'ucl_golden_glove': 'UCL Golden Glove',
  'uel_golden_boot': 'UEL Golden Boot',
  'uel_golden_glove': 'UEL Golden Glove',
  'super_cup_golden_boot': 'Super Cup Golden Boot',
  'super_cup_golden_glove': 'Super Cup Golden Glove'
};

// Map of competition names
const competitionMap = {
  'DIVISION': 'Division',
  'DIVISION 1': 'Division 1',
  'DIVISION 2': 'Division 2',
  'DIVISION 3': 'Division 3',
  'DIVISION 4': 'Division 4',
  'SUPER CUP': 'Super Cup',
  'UCL': 'UCL',
  'UEL': 'UEL',
  'UCEL': 'UCEL',
  'CLUB WC': 'Club World Cup',
  'KINGS CUP': 'Kings Cup',
  'ELITE CUP': 'Elite Cup',
  'AUTHENTIC': 'Authentic'
};

async function findOrCreateAward(awardName) {
  // Check if award exists
  const { data: existingAward, error: findError } = await supabase
    .from('awards')
    .select('id')
    .eq('name', awardName)
    .single();

  if (findError && findError.code !== 'PGRST116') {
    console.error(`Error finding award ${awardName}:`, findError);
    return null;
  }

  // If award exists, return its ID
  if (existingAward) {
    return existingAward.id;
  }

  // Create the award
  const { data: newAward, error: createError } = await supabase
    .from('awards')
    .insert({ name: awardName })
    .select('id')
    .single();

  if (createError) {
    console.error(`Error creating award ${awardName}:`, createError);
    return null;
  }

  console.log(`Created award: ${awardName} with ID ${newAward.id}`);
  return newAward.id;
}

async function findCompetitionByName(name) {
  const { data, error } = await supabase
    .from('competitions')
    .select('id')
    .eq('name', name)
    .single();
  
  if (error) {
    console.error(`Error finding competition ${name}:`, error);
    return null;
  }
  
  return data.id;
}

async function findOrCreateCompetition(name) {
  const compId = await findCompetitionByName(name);
  if (compId) return compId;
  
  // If not found, create it
  const { data, error } = await supabase
    .from('competitions')
    .insert({ name: name })
    .select('id')
    .single();
    
  if (error) {
    console.error(`Error creating competition ${name}:`, error);
    return null;
  }
  
  console.log(`Created competition: ${name} with ID ${data.id}`);
  return data.id;
}

async function findSeasonByManagerAndNumber(managerId, seasonNumber) {
  const { data, error } = await supabase
    .from('seasons')
    .select('id')
    .eq('manager_id', managerId)
    .eq('number', seasonNumber)
    .single();
  
  if (error) {
    console.error(`Error finding season for manager ${managerId}, season ${seasonNumber}:`, error);
    return null;
  }
  
  return data.id;
}

async function findManagerByName(name) {
  const { data, error } = await supabase
    .from('managers')
    .select('id')
    .eq('name', name)
    .single();
  
  if (error) {
    console.error(`Error finding manager ${name}:`, error);
    return null;
  }
  
  return data.id;
}

async function findOrCreateSeasonCompetition(seasonId, competitionId, placement, stage) {
  // Check if season_competition exists
  const { data: existingRecord, error: findError } = await supabase
    .from('season_competitions')
    .select('id')
    .eq('season_id', seasonId)
    .eq('competition_id', competitionId)
    .single();

  if (findError && findError.code !== 'PGRST116') {
    console.error(`Error finding season_competition:`, findError);
    return null;
  }

  // If record exists, return its ID
  if (existingRecord) {
    // Update placement/stage if needed
    if (placement || stage) {
      const { error: updateError } = await supabase
        .from('season_competitions')
        .update({ 
          placement: placement || existingRecord.placement,
          stage: stage || existingRecord.stage
        })
        .eq('id', existingRecord.id);
        
      if (updateError) {
        console.error(`Error updating season_competition:`, updateError);
      }
    }
    return existingRecord.id;
  }

  // Create the record
  const { data: newRecord, error: createError } = await supabase
    .from('season_competitions')
    .insert({ 
      season_id: seasonId, 
      competition_id: competitionId,
      placement: placement || null,
      stage: stage || null
    })
    .select('id')
    .single();

  if (createError) {
    console.error(`Error creating season_competition:`, createError);
    return null;
  }

  console.log(`Created season_competition with ID ${newRecord.id}`);
  return newRecord.id;
}

async function createCompetitionAward(competitionId, seasonId, awardType, managerId) {
  // Check if record already exists
  const { data: existingRecord, error: findError } = await supabase
    .from('competition_awards')
    .select('id')
    .eq('competition_id', competitionId)
    .eq('season_id', seasonId)
    .eq('award_type', awardType)
    .single();

  if (findError && findError.code !== 'PGRST116') {
    console.error(`Error finding competition_award:`, findError);
    return null;
  }

  // If record exists, update it if needed
  if (existingRecord) {
    if (existingRecord.manager_id !== managerId) {
      const { error: updateError } = await supabase
        .from('competition_awards')
        .update({ manager_id: managerId })
        .eq('id', existingRecord.id);
        
      if (updateError) {
        console.error(`Error updating competition_award:`, updateError);
      }
    }
    return existingRecord.id;
  }

  // Create new record
  const { data: newRecord, error: createError } = await supabase
    .from('competition_awards')
    .insert({
      competition_id: competitionId,
      season_id: seasonId,
      award_type: awardType,
      manager_id: managerId
    })
    .select('id')
    .single();

  if (createError) {
    console.error(`Error creating competition_award:`, createError);
    return null;
  }

  console.log(`Created competition_award with ID ${newRecord.id}`);
  return newRecord.id;
}

async function createSeasonAward(seasonId, awardId) {
  // Check if season_award exists
  const { data: existingRecord, error: findError } = await supabase
    .from('season_awards')
    .select('id')
    .eq('season_id', seasonId)
    .eq('award_id', awardId)
    .single();

  if (findError && findError.code !== 'PGRST116') {
    console.error(`Error finding season_award:`, findError);
    return null;
  }

  // If record exists, return its ID
  if (existingRecord) {
    return existingRecord.id;
  }

  // Create the record
  const { data: newRecord, error: createError } = await supabase
    .from('season_awards')
    .insert({ season_id: seasonId, award_id: awardId })
    .select('id')
    .single();

  if (createError) {
    console.error(`Error creating season_award:`, createError);
    return null;
  }

  console.log(`Created season_award with ID ${newRecord.id}`);
  return newRecord.id;
}

async function migrateAwards() {
  try {
    console.log('Starting award migration...');
    
    // Read manager data
    const managerData = JSON.parse(fs.readFileSync(managerDataPath, 'utf8'));
    
    if (!managerData || !managerData.managers) {
      throw new Error('Invalid manager data format');
    }
    
    console.log(`Found ${managerData.managers.length} managers in the data file`);
    
    // Process each manager
    for (const manager of managerData.managers) {
      console.log(`Processing manager: ${manager.name}`);
      
      if (!manager.seasons || manager.seasons.length === 0) {
        console.log(`No seasons found for manager ${manager.name}, skipping`);
        continue;
      }
      
      // Get or create manager ID
      const managerId = await findManagerByName(manager.name);
      if (!managerId) {
        console.log(`Could not find manager record for ${manager.name}, skipping`);
        continue;
      }
      
      // Process each season
      for (const season of manager.seasons) {
        if (!season.number) {
          console.log('Skipping season with no number');
          continue;
        }
        
        console.log(`Processing season ${season.number} for manager ${manager.name}`);
        
        // Get or create season ID
        const seasonId = await findSeasonByManagerAndNumber(managerId, season.number);
        if (!seasonId) {
          console.log(`Could not find season record for ${manager.name}, season ${season.number}, skipping`);
          continue;
        }
        
        // Process competitions
        if (season.competitions) {
          for (const [compKey, compDetails] of Object.entries(season.competitions)) {
            if (!compDetails || typeof compDetails !== 'object') continue;
            
            const compName = compDetails.name;
            if (!compName) continue;
            
            console.log(`Processing competition ${compName} for season ${season.number}`);
            
            // Get or create competition ID
            const competitionId = await findOrCreateCompetition(compName);
            if (!competitionId) continue;
            
            // Create season_competition entry
            const scId = await findOrCreateSeasonCompetition(
              seasonId, 
              competitionId, 
              compDetails.placement, 
              compDetails.stage
            );
          }
        }
        
        // Process awards
        if (season.awards) {
          for (const [awardKey, hasAward] of Object.entries(season.awards)) {
            if (hasAward !== true) continue;
            
            console.log(`Processing award ${awardKey} for season ${season.number}`);
            
            // Get formatted award name
            const awardName = awardTypes[awardKey] || awardKey;
            
            // Get or create award
            const awardId = await findOrCreateAward(awardName);
            if (!awardId) continue;
            
            // Create season_award entry
            await createSeasonAward(seasonId, awardId);
            
            // Determine which competition this award belongs to
            let competitionName = null;
            let awardType = null;
            
            if (awardKey.includes('league') || awardKey === 'golden_boot' || awardKey === 'golden_glove') {
              // Find the division competition for this season
              for (const [compKey, compDetails] of Object.entries(season.competitions || {})) {
                if (compDetails && compDetails.name && compDetails.name.includes('DIVISION')) {
                  competitionName = compDetails.name;
                  awardType = awardKey.includes('glove') ? 'golden_glove' : 'golden_boot';
                  break;
                }
              }
            } else if (awardKey.includes('ucl')) {
              competitionName = 'UCL';
              awardType = awardKey.includes('glove') ? 'golden_glove' : 'golden_boot';
            } else if (awardKey.includes('uel')) {
              competitionName = 'UEL';
              awardType = awardKey.includes('glove') ? 'golden_glove' : 'golden_boot';
            } else if (awardKey.includes('super_cup')) {
              competitionName = 'SUPER CUP';
              awardType = awardKey.includes('glove') ? 'golden_glove' : 'golden_boot';
            }
            
            if (competitionName && awardType) {
              const competitionId = await findOrCreateCompetition(competitionName);
              if (competitionId) {
                await createCompetitionAward(competitionId, seasonId, awardType, managerId);
              }
            }
          }
        }
      }
    }
    
    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration error:', error);
  }
}

// Run the migration
migrateAwards(); 