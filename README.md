# Award Migration System

This project contains tools to migrate season awards from manager_data.json to your Supabase database tables.

## Components

1. `competition_awards_schema.sql` - Creates the necessary database structure
2. `migrate_awards.js` - JavaScript migration script to import awards data

## How to Use

### 1. Set Up the Database Schema

First, run the SQL schema to create the required tables:

```bash
# Connect to your database and run
psql -U your_user -d your_database -f competition_awards_schema.sql
```

### 2. Run the Migration Script

Before running the migration script:

1. Install dependencies:
   ```bash
   npm install @supabase/supabase-js fs path
   ```

2. Configure your Supabase credentials:
   - Option 1: Set environment variables:
     ```bash
     export SUPABASE_URL=https://your-project-id.supabase.co
     export SUPABASE_KEY=your-api-key
     ```
   - Option 2: Edit the script to hardcode your credentials (for testing only, don't commit these)

3. Make sure manager_data.json is in the same directory as the script

4. Run the migration:
   ```bash
   node migrate_awards.js
   ```

### Troubleshooting

- If you get an "Invalid URL" error, make sure your Supabase URL is in the correct format (https://your-project-id.supabase.co)
- Make sure your Supabase API key has the necessary permissions to read/write to the relevant tables
- Check that your manager_data.json file is properly formatted

## Schema Overview

The migration creates the following:

1. **competition_awards table**: Links awards to specific competitions and managers
2. **Updates season_competitions**: Ensures all competitions from the JSON are properly connected to seasons
3. **season_awards table**: Links awards to seasons

## Award Types

The system supports various award types:
- Golden Boot
- Golden Glove
- League Golden Boot
- League Golden Glove
- UCL Golden Boot/Glove
- UEL Golden Boot/Glove
- Super Cup Golden Boot/Glove

## Viewing Award Data

After migration, you can view award data using the `competition_award_winners` view:

```sql
SELECT * FROM competition_award_winners;
``` 