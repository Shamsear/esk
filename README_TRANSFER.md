# Admin Transfer System

This feature allows administrators to transfer multiple players to a manager's squad, with each player having customizable contract terms, player types, and values.

## Features

- Transfer multiple players at once to a manager's squad
- Set different values, contract terms, and player types for each player
- Automatic calculation of salary based on player value (5%)
- Special handling for high contract seasons (6+) with automatic season stats creation
- Live transfer summary showing total players, value, and salary
- View current squad of selected manager

## Installation

1. Add the `admin-transfer.html` file to your project's root directory
2. Run the SQL scripts to create required database tables:
   - seasons_table.sql (if not already created)
   - player_season_stats.sql

## Database Requirements

The transfer system requires these tables in your Supabase database:

- `managers` - Stores manager information
- `players` - Stores player data
- `manager_squads` - Links managers to their squad players
- `clubs` - Stores club information
- `player_season_stats` - Tracks player statistics across seasons

## Contract Season Rules

When setting a contract season number, the system will:

1. Set the contract in `manager_squads` as "SEASON X" (where X is the number you entered)
2. For contract seasons 6 and above, automatically create entries in the `player_season_stats` table for:
   - The current contract season
   - The previous two seasons (if season number is 8, creates stats for 6, 7, and 8)

## Usage Instructions

1. Select a manager from the sidebar list
2. Click "Add Player" to search for available players
3. Enter player name to search
4. Click on a player to set their details:
   - Position
   - Value (contract value)
   - Contract Season
   - Salary (auto-calculated at 5% of value)
   - Player Type
5. Click "Add to Transfer" to add the player to the transfer list
6. Repeat steps 2-5 for additional players
7. Review the transfer summary
8. Click "Complete Transfer" to process all transfers

## Understanding the Transfer Process

When you complete a transfer, the system:

1. Adds entries to the `manager_squads` table for each player
2. Updates each player's club_id in the `players` table
3. Creates season statistics entries for eligible players
4. Refreshes the manager's squad list display

## Troubleshooting

- If a player is greyed out in search results, they're either already in the manager's squad or already in your transfer list
- If transfer fails, check browser console for detailed error messages
- Use the "Current Squad" tab to verify if players were successfully transferred

For technical support, please contact the system administrator. 