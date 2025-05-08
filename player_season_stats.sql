-- Create player_season_stats table for tracking player statistics across seasons
CREATE TABLE IF NOT EXISTS player_season_stats (
    id SERIAL PRIMARY KEY,
    player_id INTEGER NOT NULL REFERENCES players(id),
    player_name TEXT NOT NULL,
    season INTEGER NOT NULL,
    games INTEGER DEFAULT 0,
    goals INTEGER DEFAULT 0,
    assists INTEGER DEFAULT 0,
    clean_sheets INTEGER DEFAULT 0,
    club_id INTEGER REFERENCES clubs(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(player_id, season)
);

-- Create indexes for improved query performance
CREATE INDEX IF NOT EXISTS idx_player_season_stats_player_id ON player_season_stats (player_id);
CREATE INDEX IF NOT EXISTS idx_player_season_stats_season ON player_season_stats (season);
CREATE INDEX IF NOT EXISTS idx_player_season_stats_club_id ON player_season_stats (club_id);

-- Add trigger to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_player_stats_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_player_stats_timestamp ON player_season_stats;
CREATE TRIGGER set_player_stats_timestamp
BEFORE UPDATE ON player_season_stats
FOR EACH ROW
EXECUTE FUNCTION update_player_stats_modified_column();

-- Create trigger to automatically update player_name when player changes
CREATE OR REPLACE FUNCTION sync_player_name_on_stats()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE player_season_stats
    SET player_name = NEW.name
    WHERE player_id = NEW.id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS sync_player_name_trigger ON players;
CREATE TRIGGER sync_player_name_trigger
AFTER UPDATE OF name ON players
FOR EACH ROW
WHEN (OLD.name IS DISTINCT FROM NEW.name)
EXECUTE FUNCTION sync_player_name_on_stats(); 