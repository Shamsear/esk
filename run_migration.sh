#!/bin/bash
# Run awards migration script with proper Supabase credentials

# Set your Supabase URL and API key here
export SUPABASE_URL="https://your-project-id.supabase.co"
export SUPABASE_KEY="your-api-key"

echo "Supabase URL set to: $SUPABASE_URL"
echo "Starting migration..."

node migrate_awards.js

echo ""
echo "Migration completed." 