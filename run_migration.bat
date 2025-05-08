@echo off
REM Run awards migration script with proper Supabase credentials

REM Set your Supabase URL and API key here
set SUPABASE_URL=https://your-project-id.supabase.co
set SUPABASE_KEY=your-api-key

echo Supabase URL set to: %SUPABASE_URL%
echo Starting migration...

node migrate_awards.js

echo.
echo Migration completed. Press any key to exit.
pause > nul 