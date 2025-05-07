-- Define tables for the player auction system

-- Players table
CREATE TABLE IF NOT EXISTS players (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  star VARCHAR(50) NOT NULL,
  level VARCHAR(50) NOT NULL,
  club VARCHAR(255) NOT NULL,
  position VARCHAR(10) NOT NULL,
  value INTEGER NOT NULL,
  games_played INTEGER NOT NULL DEFAULT 0,
  image_path VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Stats table (child of players)
CREATE TABLE IF NOT EXISTS player_stats (
  id SERIAL PRIMARY KEY,
  player_id INTEGER NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  season VARCHAR(50) NOT NULL,
  team VARCHAR(255) NOT NULL,
  value VARCHAR(50),
  apps VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Managers table
CREATE TABLE IF NOT EXISTS managers (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  age INTEGER,
  club VARCHAR(255) NOT NULL,
  overall_rating DECIMAL(10,2),
  r2g_coin_balance INTEGER NOT NULL DEFAULT 0,
  r2g_token_balance INTEGER NOT NULL DEFAULT 0,
  club_total_value INTEGER NOT NULL DEFAULT 0,
  manager_rating DECIMAL(10,2),
  trophies INTEGER NOT NULL DEFAULT 0,
  awards INTEGER NOT NULL DEFAULT 0,
  star_rating INTEGER NOT NULL DEFAULT 0,
  current_season INTEGER,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Squad players (relationship between managers and players)
CREATE TABLE IF NOT EXISTS squad_players (
  id SERIAL PRIMARY KEY,
  manager_id INTEGER NOT NULL REFERENCES managers(id) ON DELETE CASCADE,
  player_name VARCHAR(255) NOT NULL,
  position VARCHAR(10) NOT NULL,
  value INTEGER NOT NULL,
  contract VARCHAR(50),
  salary DECIMAL(10,2),
  type VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Performance statistics for managers
CREATE TABLE IF NOT EXISTS manager_performance (
  id SERIAL PRIMARY KEY,
  manager_id INTEGER NOT NULL REFERENCES managers(id) ON DELETE CASCADE,
  matches INTEGER NOT NULL DEFAULT 0,
  wins INTEGER NOT NULL DEFAULT 0,
  draws INTEGER NOT NULL DEFAULT 0,
  losses INTEGER NOT NULL DEFAULT 0,
  goals_scored INTEGER NOT NULL DEFAULT 0,
  goals_conceded INTEGER NOT NULL DEFAULT 0,
  goal_difference INTEGER NOT NULL DEFAULT 0,
  clean_sheets INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Seasons for managers
CREATE TABLE IF NOT EXISTS manager_seasons (
  id SERIAL PRIMARY KEY,
  manager_id INTEGER NOT NULL REFERENCES managers(id) ON DELETE CASCADE,
  number INTEGER NOT NULL,
  manager_rank VARCHAR(50),
  rank_point DECIMAL(10,2),
  team_income INTEGER,
  team_expense INTEGER,
  team_profit VARCHAR(50),
  session_rewards INTEGER,
  status VARCHAR(50) DEFAULT 'completed',
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Season competitions
CREATE TABLE IF NOT EXISTS season_competitions (
  id SERIAL PRIMARY KEY,
  season_id INTEGER NOT NULL REFERENCES manager_seasons(id) ON DELETE CASCADE,
  competition_type VARCHAR(50) NOT NULL,
  name VARCHAR(100),
  placement VARCHAR(100),
  stage VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Season awards
CREATE TABLE IF NOT EXISTS season_awards (
  id SERIAL PRIMARY KEY,
  season_id INTEGER NOT NULL REFERENCES manager_seasons(id) ON DELETE CASCADE,
  award_type VARCHAR(100) NOT NULL,
  is_awarded BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Season statistics
CREATE TABLE IF NOT EXISTS season_stats (
  id SERIAL PRIMARY KEY,
  season_id INTEGER NOT NULL REFERENCES manager_seasons(id) ON DELETE CASCADE,
  stats_type VARCHAR(50) NOT NULL, -- 'season_stats' or 'sp_tour_stats'
  matches INTEGER NOT NULL DEFAULT 0,
  wins INTEGER NOT NULL DEFAULT 0,
  draws INTEGER NOT NULL DEFAULT 0,
  losses INTEGER NOT NULL DEFAULT 0,
  goals_scored INTEGER NOT NULL DEFAULT 0,
  goals_conceded INTEGER NOT NULL DEFAULT 0,
  goal_difference INTEGER NOT NULL DEFAULT 0,
  clean_sheets INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_players_club ON players(club);
CREATE INDEX IF NOT EXISTS idx_players_position ON players(position);
CREATE INDEX IF NOT EXISTS idx_players_star ON players(star);
CREATE INDEX IF NOT EXISTS idx_player_stats_player_id ON player_stats(player_id);
CREATE INDEX IF NOT EXISTS idx_managers_club ON managers(club);
CREATE INDEX IF NOT EXISTS idx_squad_players_manager_id ON squad_players(manager_id);
CREATE INDEX IF NOT EXISTS idx_manager_seasons_manager_id ON manager_seasons(manager_id); 