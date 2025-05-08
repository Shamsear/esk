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

async function testConnection() {
  try {
    console.log('Testing Supabase connection...');
    
    // Try to query the public schema
    const { data, error } = await supabase.from('pg_catalog.pg_tables')
      .select('*')
      .eq('schemaname', 'public')
      .limit(1);
    
    if (error) {
      console.error('Connection test failed:', error);
    } else {
      console.log('Connection successful!');
      console.log('Supabase URL:', supabaseUrl);
    }
    
    // Verify if our tables exist
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public');
    
    if (tablesError) {
      console.error('Error checking tables:', tablesError);
    } else if (tables && tables.length > 0) {
      console.log('Tables found in public schema:');
      tables.forEach(table => console.log(`- ${table.table_name}`));
    } else {
      console.log('No tables found in public schema. You may need to run the supabase_migration.sql script first.');
    }
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

testConnection(); 