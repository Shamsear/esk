# Google Sheets to Supabase Auto-Sync

This guide will help you set up automatic synchronization from your Google Sheet to your Supabase database.

## Prerequisites

1. Your Google Sheet with manager stats
2. Supabase project credentials (you already have these)
3. Access to Google Apps Script (built into Google Sheets)

## Setup Instructions

### Step 1: Prepare Your Google Sheet

Your sheet should have columns matching your database structure. Example:

| Manager Name | Club | Matches | Wins | Draws | Losses | Goals Scored | Goals Conceded | R2G Coins | R2G Tokens |
|--------------|------|---------|------|-------|--------|--------------|----------------|-----------|------------|
| Fayis        | Arsenal | 10   | 7    | 2     | 1      | 25           | 10             | 5000      | 100        |

### Step 2: Open Apps Script Editor

1. Open your Google Sheet
2. Click on **Extensions** → **Apps Script**
3. Delete any existing code
4. Copy and paste the code from `sync-script.gs`

### Step 3: Configure the Script

In the script, update these values:

```javascript
const SUPABASE_URL = 'https://hydmjqeamcxzbnbesdfh.supabase.co';
const SUPABASE_SERVICE_KEY = 'your-service-role-key-here';
```

**IMPORTANT:** Use the SERVICE ROLE KEY (not the anon key) for write operations.

Your service role key is:
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh5ZG1qcWVhbWN4emJuYmVzZGZoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTczOTExNiwiZXhwIjoyMDkxMzE1MTE2fQ.ffylsxEPigNTjyS8JmozU3pfGcK2rrJJe6JxuWzThg0
```

### Step 4: Set Up Triggers

1. In Apps Script editor, click the **clock icon** (Triggers) on the left
2. Click **+ Add Trigger**
3. Configure:
   - Function: `onEdit` (for real-time updates when you edit)
   - Event source: From spreadsheet
   - Event type: On edit
   
4. (Optional) Add a scheduled trigger:
   - Function: `syncAllManagers`
   - Event source: Time-driven
   - Type: Minutes timer
   - Interval: Every 5 minutes (or your preference)

### Step 5: Test the Setup

1. In Apps Script, run the `syncAllManagers` function manually
2. Check the **Execution log** for any errors
3. Verify data appears in your Supabase database

## How It Works

### Real-Time Sync (onEdit)
- Triggers whenever you edit a cell in the sheet
- Only syncs the row that was changed
- Updates happen within seconds

### Scheduled Sync (syncAllManagers)
- Runs on a schedule (e.g., every 5 minutes)
- Syncs all rows in the sheet
- Good as a backup to catch any missed updates

## Troubleshooting

### Error: "Exception: Request failed"
- Check your Supabase URL and service key
- Verify your internet connection
- Check Supabase dashboard for API status

### Error: "Manager n