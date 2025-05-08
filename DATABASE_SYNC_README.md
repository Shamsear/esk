# Database Synchronization Setup

This guide explains how to set up and use the enhanced database triggers for automatic synchronization between tables when data is changed.

## Overview

The triggers ensure that when you edit values in one table, the corresponding values in related tables are automatically updated. For example:

- When you update a player's club, they are automatically added to the manager's squad for that club
- When you update a player's value, it's automatically reflected in all manager_squads entries
- When you update club information, all related player and manager data is synchronized
- When you edit manager squad entries, the player records are updated accordingly

## Setting Up

### 1. Update your environment variables

Ensure your `.env` file contains the following variables:

```
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_anon_key
SUPABASE_SERVICE_KEY=your_service_role_key
```

You can get the service role key from your Supabase dashboard under Project Settings > API.

**IMPORTANT**: The service role key has full access to your database. Keep it secure and never expose it in client-side code.

### 2. Apply the database triggers

Run the following command to apply the enhanced triggers to your Supabase database:

```bash
node apply_enhanced_triggers.js
```

This script will:
1. Create any necessary RPC functions if they don't exist
2. Apply all the triggers defined in `enhanced_supabase_triggers.sql` to your database

### 3. Verify that the triggers are working correctly

Run the verification script to ensure all triggers are functioning:

```bash
node verify_triggers.js
```

This will perform several tests to check that data is being properly synchronized between tables.

## How It Works

The system uses PostgreSQL triggers to automatically keep data in sync. Here's what happens behind the scenes:

1. **Player Updates**:
   - When a player's value changes, it's updated in manager_squads
   - When a player's club changes, they're removed from their old manager's squad and added to the new club's manager squad
   - When a player's name changes, all references in manager_squads are updated

2. **Club Updates**:
   - When a club is updated, all players and managers referring to that club are updated
   - Clubs with references cannot be deleted (to prevent orphaned records)

3. **Manager Squad Updates**:
   - When a player is added to a manager's squad, their club_id is updated to match the manager's club
   - When a player's value is updated in a manager's squad, the player record is updated to match

4. **Player Statistics**:
   - Player stats are automatically updated when a player changes clubs
   - Games played, goals, etc. are accumulated correctly

## Troubleshooting

If you encounter issues with the database triggers:

1. **Check the Supabase logs** in your Supabase dashboard
2. **Run the verification script** to see which triggers might not be working correctly
3. **Check for database errors** in your application logs

For specific errors or if triggers appear to not be working:

1. Ensure your Supabase service role key has the proper permissions
2. Check if any conflicting triggers exist in your database
3. Verify that all tables have the expected structure

## Advanced Customization

You can customize the triggers in `enhanced_supabase_triggers.sql` to suit your specific needs:

- Change how new players are added to manager squads (default contract duration, salary calculation, etc.)
- Modify how player stats are tracked and updated
- Add additional synchronization logic for your specific use cases

After making changes to the triggers, run the apply script again to update them in the database. 