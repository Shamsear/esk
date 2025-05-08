require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: SUPABASE_URL and SUPABASE_KEY must be set in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Tables in reverse order of dependencies
const tables = [
  'season_awards',
  'manager_squads',
  'season_stats',
  'season_competitions',
  'seasons',
  'awards',
  'manager_performances',
  'player_stats',
  'managers',
  'players',
  'competitions',
  'clubs'
];

async function clearDatabase() {
  try {
    console.log('Clearing database for fresh migration...');
    
    for (const table of tables) {
      console.log(`Deleting all data from ${table}...`);
      const { error } = await supabase.from(table).delete().neq('id', 0);
      
      if (error) {
        console.error(`Error clearing ${table}:`, error);
      } else {
        console.log(`${table} cleared successfully`);
      }
    }
    
    console.log('Database cleared. You can now run the migration again.');
  } catch (error) {
    console.error('Failed to clear database:', error);
  }
}

// Confirm before proceeding
const args = process.argv.slice(2);
if (args.includes('--force') || args.includes('-f')) {
  clearDatabase();
} else {
  console.log('WARNING: This will delete ALL data in your database tables.');
  console.log('To proceed, run this command with the --force or -f flag:');
  console.log('npm run clear -- --force');
} 