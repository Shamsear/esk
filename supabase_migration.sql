-- Migration script for Supabase

-- Create enum types for positions
CREATE TYPE player_position AS ENUM ('GK', 'CB', 'RB', 'LB', 'DM', 'CM', 'AM', 'LW', 'RW', 'ST');

-- Create enum types for player levels
CREATE TYPE player_level AS ENUM ('LEGENDARY', 'STANDARD', 'ICON');

-- Create enum types for player types in manager data
CREATE TYPE player_type AS ENUM ('standard', 'prime', 'icon', 'legend', 'prime legend');

-- Create enum for star ratings
CREATE TYPE star_rating AS ENUM ('5-star-legend', '4-star-legend', '5-star-standard', '4-star-standard', '3-star-standard');

-- Create clubs table
CREATE TABLE clubs (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  logo_path TEXT
);

-- Create players table
CREATE TABLE players (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  star star_rating NOT NULL,
  level player_level NOT NULL,
  club_id INTEGER REFERENCES clubs(id),
  position player_position NOT NULL,
  value INTEGER NOT NULL,
  games_played INTEGER DEFAULT 0,
  image_path TEXT,
  club_logo TEXT
);

-- Create player_stats table to store historical stats
CREATE TABLE player_stats (
  id SERIAL PRIMARY KEY,
  player_id INTEGER REFERENCES players(id),
  season TEXT NOT NULL,
  team TEXT NOT NULL,
  value TEXT NOT NULL,
  apps TEXT,
  UNIQUE (player_id, season, team)
);

-- Create managers table
CREATE TABLE managers (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  age INTEGER NOT NULL,
  club_id INTEGER REFERENCES clubs(id),
  overall_rating NUMERIC(10, 1) NOT NULL,
  r2g_coin_balance INTEGER NOT NULL,
  r2g_token_balance INTEGER NOT NULL,
  club_total_value INTEGER NOT NULL,
  manager_rating NUMERIC(10, 1) NOT NULL,
  trophies INTEGER NOT NULL,
  awards INTEGER NOT NULL,
  current_season INTEGER,
  star_rating INTEGER
);

-- Create manager_squad table to store squad relationships
CREATE TABLE manager_squads (
  id SERIAL PRIMARY KEY,
  manager_id INTEGER REFERENCES managers(id),
  player_name TEXT NOT NULL,
  position player_position NOT NULL,
  value INTEGER NOT NULL,
  contract TEXT NOT NULL,
  salary NUMERIC(10, 1) NOT NULL,
  player_type player_type NOT NULL,
  player_id INTEGER REFERENCES players(id)
);

-- Create manager_performance table
CREATE TABLE manager_performances (
  id SERIAL PRIMARY KEY,
  manager_id INTEGER REFERENCES managers(id),
  matches INTEGER NOT NULL,
  wins INTEGER NOT NULL,
  draws INTEGER NOT NULL,
  losses INTEGER NOT NULL,
  goals_scored INTEGER NOT NULL,
  goals_conceded INTEGER NOT NULL,
  goal_difference INTEGER NOT NULL,
  clean_sheets INTEGER NOT NULL
);

-- Create competitions table
CREATE TABLE competitions (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE
);

-- Create seasons table
CREATE TABLE seasons (
  id SERIAL PRIMARY KEY,
  number INTEGER NOT NULL,
  manager_id INTEGER REFERENCES managers(id),
  manager_rank TEXT NOT NULL,
  rank_point NUMERIC(10, 1) NOT NULL,
  team_income INTEGER NOT NULL,
  team_expense INTEGER NOT NULL,
  team_profit INTEGER NOT NULL,
  session_rewards INTEGER NOT NULL,
  UNIQUE (number, manager_id)
);

-- Create season_competitions table
CREATE TABLE season_competitions (
  id SERIAL PRIMARY KEY,
  season_id INTEGER REFERENCES seasons(id),
  competition_id INTEGER REFERENCES competitions(id),
  placement TEXT,
  stage TEXT
);

-- Create season_stats table
CREATE TABLE season_stats (
  id SERIAL PRIMARY KEY,
  season_id INTEGER REFERENCES seasons(id),
  is_special_tour BOOLEAN DEFAULT FALSE,
  matches INTEGER NOT NULL,
  wins INTEGER NOT NULL,
  draws INTEGER NOT NULL,
  losses INTEGER NOT NULL,
  goals_scored INTEGER NOT NULL,
  goals_conceded INTEGER NOT NULL,
  goal_difference INTEGER NOT NULL,
  clean_sheets INTEGER NOT NULL
);

-- Create awards table
CREATE TABLE awards (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE
);

-- Create season_awards table
CREATE TABLE season_awards (
  id SERIAL PRIMARY KEY,
  season_id INTEGER REFERENCES seasons(id),
  award_id INTEGER REFERENCES awards(id),
  UNIQUE (season_id, award_id)
);

-- Indexes for better performance
CREATE INDEX idx_players_name ON players(name);
CREATE INDEX idx_players_star ON players(star);
CREATE INDEX idx_players_level ON players(level);
CREATE INDEX idx_players_club_id ON players(club_id);
CREATE INDEX idx_players_position ON players(position);

CREATE INDEX idx_manager_name ON managers(name);
CREATE INDEX idx_manager_club_id ON managers(club_id);

CREATE INDEX idx_manager_squad_manager_id ON manager_squads(manager_id);
CREATE INDEX idx_manager_squad_player_id ON manager_squads(player_id);

CREATE INDEX idx_season_manager_id ON seasons(manager_id); 