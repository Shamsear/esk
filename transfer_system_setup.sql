-- This script sets up all necessary tables and relationships for the transfer system

-- Ensure clubs table exists (if not already created)
CREATE TABLE IF NOT EXISTS clubs (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    logo_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ensure players table exists with proper relationships
CREATE TABLE IF NOT EXISTS players (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    position TEXT,
    value INTEGER,
    club_id INTEGER REFERENCES clubs(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ensure managers table exists with proper relationships
CREATE TABLE IF NOT EXISTS managers (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    age INTEGER,
    club_id INTEGER REFERENCES clubs(id),
    overall_rating NUMERIC(4,1),
    r2g_coin_balance INTEGER DEFAULT 0,
    r2g_token_balance INTEGER DEFAULT 0,
    club_total_value INTEGER DEFAULT 0,
    manager_rating NUMERIC(4,1),
    trophies INTEGER DEFAULT 0,
    awards INTEGER DEFAULT 0,
    current_season INTEGER DEFAULT 1,
    star_rating INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ensure manager_squads table exists with proper relationships
CREATE TABLE IF NOT EXISTS manager_squads (
    id SERIAL PRIMARY KEY,
    manager_id INTEGER NOT NULL REFERENCES managers(id),
    player_id INTEGER REFERENCES players(id),
    player_name TEXT,
    position TEXT,
    value INTEGER,
    contract TEXT,
    salary NUMERIC(10,1),
    player_type TEXT DEFAULT 'standard',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ensure player_season_stats table exists with proper relationships
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
CREATE INDEX IF NOT EXISTS idx_players_club_id ON players (club_id);
CREATE INDEX IF NOT EXISTS idx_players_name ON players (name);
CREATE INDEX IF NOT EXISTS idx_managers_club_id ON managers (club_id);
CREATE INDEX IF NOT EXISTS idx_managers_name ON managers (name);
CREATE INDEX IF NOT EXISTS idx_manager_squads_manager_id ON manager_squads (manager_id);
CREATE INDEX IF NOT EXISTS idx_manager_squads_player_id ON manager_squads (player_id);
CREATE INDEX IF NOT EXISTS idx_player_season_stats_player_id ON player_season_stats (player_id);
CREATE INDEX IF NOT EXISTS idx_player_season_stats_season ON player_season_stats (season);
CREATE INDEX IF NOT EXISTS idx_player_season_stats_club_id ON player_season_stats (club_id);

-- Create update timestamp trigger function (if not already created)
CREATE OR REPLACE FUNCTION update_timestamp_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for update timestamps
DO $$
DECLARE
    t text;
BEGIN
    FOR t IN 
        SELECT 'clubs', 'players', 'managers', 'manager_squads', 'player_season_stats'
    LOOP
        EXECUTE format('
            DROP TRIGGER IF EXISTS set_%s_timestamp ON %s;
            CREATE TRIGGER set_%s_timestamp
            BEFORE UPDATE ON %s
            FOR EACH ROW
            EXECUTE FUNCTION update_timestamp_column();
        ', t, t, t, t);
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to sync player name in manager_squads when player name changes
CREATE OR REPLACE FUNCTION sync_player_name_on_squad()
RETURNS TRIGGER AS $$
BEGIN
    -- Only update if name has changed
    IF OLD.name IS DISTINCT FROM NEW.name THEN
        UPDATE manager_squads
        SET player_name = NEW.name
        WHERE player_id = NEW.id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS sync_player_name_squad_trigger ON players;
CREATE TRIGGER sync_player_name_squad_trigger
AFTER UPDATE OF name ON players
FOR EACH ROW
EXECUTE FUNCTION sync_player_name_on_squad();

-- Create trigger to sync player name in player_season_stats when player name changes
CREATE OR REPLACE FUNCTION sync_player_name_on_stats()
RETURNS TRIGGER AS $$
BEGIN
    -- Only update if name has changed
    IF OLD.name IS DISTINCT FROM NEW.name THEN
        UPDATE player_season_stats
        SET player_name = NEW.name
        WHERE player_id = NEW.id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS sync_player_name_stats_trigger ON players;
CREATE TRIGGER sync_player_name_stats_trigger
AFTER UPDATE OF name ON players
FOR EACH ROW
EXECUTE FUNCTION sync_player_name_on_stats();

-- Add sample data for testing (run this only if you need test data)
/*
INSERT INTO clubs (name) VALUES 
('Manchester United'), ('Liverpool FC'), ('Arsenal FC'), ('Chelsea FC')
ON CONFLICT DO NOTHING;

INSERT INTO managers (name, current_season) VALUES
('Alex Ferguson', 8), ('Jurgen Klopp', 8), ('Arsene Wenger', 8), ('Jose Mourinho', 8)
ON CONFLICT DO NOTHING;

INSERT INTO players (name, position, value) VALUES
('Cristiano Ronaldo', 'ST', 100000000), ('Mohamed Salah', 'RW', 90000000),
('Thierry Henry', 'ST', 80000000), ('Didier Drogba', 'ST', 75000000)
ON CONFLICT DO NOTHING;
*/ 