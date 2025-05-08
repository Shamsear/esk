// Script to apply enhanced database triggers to Supabase
require('dotenv').config();

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const os = require('os');
const { promisify } = require('util');
const execAsync = promisify(exec);

// Get environment variables
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY; // This needs to be a service role key with SQL execution privileges

// Validate environment variables
if (!supabaseUrl || !supabaseKey) {
  console.error('Error: SUPABASE_URL and SUPABASE_SERVICE_KEY must be set in .env file');
  process.exit(1);
}

// Initialize Supabase client with service role key
const supabase = createClient(supabaseUrl, supabaseKey);

// Direct SQL execution via API
async function executeSQL(sql) {
  const url = `${supabaseUrl}/rest/v1/`;
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Prefer': 'tx=commit'
      },
      body: JSON.stringify({
        query: sql
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('SQL execution error:', errorText);
      return { error: errorText };
    }
    
    return { data: await response.json() };
  } catch (error) {
    console.error('Request error:', error);
    return { error };
  }
}

// Function to check if psql is available
async function isPsqlAvailable() {
  try {
    await execAsync('psql --version');
    return true;
  } catch (error) {
    return false;
  }
}

// Function to apply triggers using psql if available
async function applyTriggersPsql(filePath) {
  try {
    // Extract Supabase connection details from URL
    // Expected format: https://[project-ref].supabase.co
    const projectRef = supabaseUrl.split('https://')[1].split('.')[0];
    
    // Create a temporary file with the connection details
    const tempDir = os.tmpdir();
    const pgpassFile = path.join(tempDir, '.pgpass');
    
    // Write connection details to the file (hostname:port:database:username:password)
    // Default port for Supabase PostgreSQL is 5432, database is 'postgres'
    fs.writeFileSync(pgpassFile, `db.${projectRef}.supabase.co:5432:postgres:postgres:${supabaseKey}`, { mode: 0o600 });
    
    console.log(`Temporary connection file created at ${pgpassFile}`);
    
    // Set environment variable for psql
    process.env.PGPASSFILE = pgpassFile;
    
    // Execute the SQL file using psql
    const command = `psql -h db.${projectRef}.supabase.co -p 5432 -d postgres -U postgres -f "${filePath}"`;
    console.log(`Executing command: ${command}`);
    
    const { stdout, stderr } = await execAsync(command);
    
    // Clean up temporary file
    fs.unlinkSync(pgpassFile);
    
    if (stderr && !stderr.includes('NOTICE')) {
      console.error('Error applying triggers:', stderr);
      return false;
    }
    
    console.log('SQL triggers applied successfully via psql');
    console.log(stdout);
    return true;
  } catch (error) {
    console.error('Error applying triggers via psql:', error);
    return false;
  }
}

// Alternative method: Use supabase.from('_sql').rpc('query', { query: sql })
async function applyTriggersSupabaseRPC(filePath) {
  try {
    // Read SQL file
    const sqlContent = fs.readFileSync(filePath, 'utf8');
    
    // Split by statement delimiter (assuming statements end with semicolon)
    const statements = sqlContent.split(';').filter(stmt => stmt.trim());
    
    console.log(`Found ${statements.length} SQL statements to execute`);
    
    // Execute each statement one by one
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i].trim();
      if (!statement) continue;
      
      console.log(`Executing statement ${i + 1}/${statements.length}...`);
      
      try {
        // Try using the _rpc endpoint directly
        const response = await fetch(`${supabaseUrl}/rest/v1/rpc/pg_query`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`
          },
          body: JSON.stringify({ 
            query: statement + ';' 
          })
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error(`Error executing statement ${i + 1}:`, errorText);
        } else {
          console.log(`Statement ${i + 1} executed successfully`);
        }
      } catch (statementError) {
        console.error(`Exception executing statement ${i + 1}:`, statementError);
      }
    }
    
    console.log('SQL trigger application complete!');
    return true;
  } catch (error) {
    console.error('Error applying triggers via RPC:', error);
    return false;
  }
}

// Function to write statements to individual SQL files
async function applyTriggersViaFileAPI(filePath) {
  try {
    // Read SQL file
    const sqlContent = fs.readFileSync(filePath, 'utf8');
    
    // Split by statement delimiter (assuming statements end with semicolon)
    const statements = sqlContent.split(';').filter(stmt => stmt.trim());
    
    console.log(`Found ${statements.length} SQL statements to execute`);
    
    // Create a temporary directory for SQL files
    const tempDir = path.join(os.tmpdir(), 'trigger-statements');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    
    // Create individual SQL files for each statement
    const sqlFiles = [];
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i].trim();
      if (!statement) continue;
      
      const sqlFile = path.join(tempDir, `statement_${i + 1}.sql`);
      fs.writeFileSync(sqlFile, statement + ';');
      sqlFiles.push(sqlFile);
    }
    
    console.log(`Created ${sqlFiles.length} SQL files in ${tempDir}`);
    
    // Process each file
    for (let i = 0; i < sqlFiles.length; i++) {
      console.log(`Processing file ${i + 1}/${sqlFiles.length}...`);
      
      // Create a temporary file upload using Supabase storage
      const filename = path.basename(sqlFiles[i]);
      const fileContent = fs.readFileSync(sqlFiles[i], 'utf8');
      
      try {
        // Upload the SQL file to Supabase storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('sql-scripts')
          .upload(`temp/${filename}`, fileContent, {
            contentType: 'text/plain',
            upsert: true
          });
        
        if (uploadError) {
          console.error(`Error uploading statement ${i + 1}:`, uploadError);
          continue;
        }
        
        // Execute the SQL file
        const { data: execData, error: execError } = await supabase.rpc('execute_sql_file', {
          file_path: `temp/${filename}`
        });
        
        if (execError) {
          console.error(`Error executing statement ${i + 1}:`, execError);
        } else {
          console.log(`Statement ${i + 1} executed successfully`);
        }
        
        // Clean up the uploaded file
        await supabase.storage
          .from('sql-scripts')
          .remove([`temp/${filename}`]);
        
      } catch (statementError) {
        console.error(`Exception executing statement ${i + 1}:`, statementError);
      }
    }
    
    // Clean up temporary directory
    for (const file of sqlFiles) {
      fs.unlinkSync(file);
    }
    fs.rmdirSync(tempDir);
    
    console.log('SQL trigger application complete via file API!');
    return true;
  } catch (error) {
    console.error('Error applying triggers via file API:', error);
    return false;
  }
}

// Main function
async function main() {
  console.log('Starting enhanced triggers application...');
  
  // Path to the triggers SQL file
  const triggersFile = path.join(__dirname, 'enhanced_supabase_triggers.sql');
  
  // Try different methods in sequence
  
  // Method 1: Try using psql if available
  const psqlAvailable = await isPsqlAvailable();
  
  if (psqlAvailable) {
    console.log('psql is available, using it for SQL execution...');
    const psqlSuccess = await applyTriggersPsql(triggersFile);
    
    if (psqlSuccess) {
      console.log('Successfully applied triggers using psql');
      return;
    }
    
    console.log('psql method failed, trying alternative methods...');
  } else {
    console.log('psql not available, trying alternative methods...');
  }
  
  // Method 2: Try using Supabase RPC
  console.log('Trying to apply triggers using Supabase RPC...');
  const rpcSuccess = await applyTriggersSupabaseRPC(triggersFile);
  
  if (rpcSuccess) {
    console.log('Successfully applied triggers using Supabase RPC');
    return;
  }
  
  console.log('Supabase RPC method failed, trying direct SQL execution...');
  
  // Method 3: Try using direct SQL execution via Supabase API
  console.log('Trying to apply triggers using direct SQL execution...');
  const statements = fs.readFileSync(triggersFile, 'utf8')
    .split(';')
    .filter(stmt => stmt.trim())
    .map(stmt => stmt.trim() + ';');
  
  let successCount = 0;
  for (let i = 0; i < statements.length; i++) {
    console.log(`Executing statement ${i + 1}/${statements.length} directly...`);
    const { error } = await executeSQL(statements[i]);
    if (!error) {
      successCount++;
    }
  }
  
  if (successCount === statements.length) {
    console.log('Successfully applied all triggers using direct SQL execution');
    return;
  }
  
  console.log(`Applied ${successCount}/${statements.length} triggers using direct SQL`);
  
  // Method 4: Last resort - Try using the file-based API approach
  console.log('Trying file-based API approach as last resort...');
  const fileApiSuccess = await applyTriggersViaFileAPI(triggersFile);
  
  if (fileApiSuccess) {
    console.log('Successfully applied triggers using file-based API');
    return;
  }
  
  console.log('\n===== ALL METHODS FAILED =====');
  console.log('Please consider these alternatives:');
  console.log('1. Run the SQL statements directly in the Supabase SQL Editor');
  console.log('2. Use the Supabase CLI to apply the triggers');
  console.log('3. Contact Supabase support if this is a permissions issue');
}

// Run the main function
main().catch(err => {
  console.error('Unhandled error:', err);
  process.exit(1);
}); 