const { query } = require('../db');

/**
 * API endpoint for initializing the database schema
 * POST - Create all required database tables
 */
module.exports = async (req, res) => {
  try {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }
    
    // Only allow POST requests
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }
    
    // SQL to create all tables
    const createTablesSql = `
      -- Players table
      CREATE TABLE IF NOT EXISTS players (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        star INTEGER NOT NULL,
        level VARCHAR(50) NOT NULL,
        club VARCHAR(100) NOT NULL,
        position VARCHAR(50) NOT NULL,
        value DECIMAL(12,2) NOT NULL,
        games_played INTEGER DEFAULT 0,
        image_path VARCHAR(255),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- Player stats table
      CREATE TABLE IF NOT EXISTS player_stats (
        id SERIAL PRIMARY KEY,
        player_id INTEGER NOT NULL REFERENCES players(id) ON DELETE CASCADE,
        season VARCHAR(20) NOT NULL,
        team VARCHAR(100) NOT NULL,
        value DECIMAL(12,2) NOT NULL,
        apps VARCHAR(10) DEFAULT '00',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- Managers table
      CREATE TABLE IF NOT EXISTS managers (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        age INTEGER NOT NULL,
        club VARCHAR(100) NOT NULL,
        overall_rating DECIMAL(5,2) NOT NULL,
        balance DECIMAL(12,2) DEFAULT 0,
        wage_budget DECIMAL(12,2) DEFAULT 0,
        transfer_budget DECIMAL(12,2) DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- Squad players linking managers and players
      CREATE TABLE IF NOT EXISTS squad_players (
        id SERIAL PRIMARY KEY,
        manager_id INTEGER NOT NULL REFERENCES managers(id) ON DELETE CASCADE,
        player_id INTEGER NOT NULL REFERENCES players(id) ON DELETE CASCADE,
        contract_years INTEGER DEFAULT 1,
        salary DECIMAL(12,2) DEFAULT 0,
        is_starting BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(manager_id, player_id)
      );

      -- Manager performance stats
      CREATE TABLE IF NOT EXISTS manager_performance (
        id SERIAL PRIMARY KEY,
        manager_id INTEGER NOT NULL REFERENCES managers(id) ON DELETE CASCADE,
        matches_played INTEGER DEFAULT 0,
        wins INTEGER DEFAULT 0,
        draws INTEGER DEFAULT 0,
        losses INTEGER DEFAULT 0,
        goals_scored INTEGER DEFAULT 0,
        goals_conceded INTEGER DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- Manager seasons
      CREATE TABLE IF NOT EXISTS manager_seasons (
        id SERIAL PRIMARY KEY,
        manager_id INTEGER NOT NULL REFERENCES managers(id) ON DELETE CASCADE,
        season VARCHAR(20) NOT NULL,
        league_position INTEGER DEFAULT 0,
        points INTEGER DEFAULT 0,
        competition_position VARCHAR(50) DEFAULT '',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- Season competitions
      CREATE TABLE IF NOT EXISTS season_competitions (
        id SERIAL PRIMARY KEY,
        manager_id INTEGER NOT NULL REFERENCES managers(id) ON DELETE CASCADE,
        season VARCHAR(20) NOT NULL,
        competition_name VARCHAR(100) NOT NULL,
        result VARCHAR(50) DEFAULT '',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- Season awards
      CREATE TABLE IF NOT EXISTS season_awards (
        id SERIAL PRIMARY KEY,
        manager_id INTEGER NOT NULL REFERENCES managers(id) ON DELETE CASCADE,
        season VARCHAR(20) NOT NULL,
        award_name VARCHAR(100) NOT NULL,
        award_category VARCHAR(50) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- Season stats
      CREATE TABLE IF NOT EXISTS season_stats (
        id SERIAL PRIMARY KEY,
        manager_id INTEGER NOT NULL REFERENCES managers(id) ON DELETE CASCADE,
        season VARCHAR(20) NOT NULL,
        stat_name VARCHAR(100) NOT NULL,
        stat_value VARCHAR(50) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- Create indexes for faster queries
      CREATE INDEX IF NOT EXISTS idx_players_club ON players(club);
      CREATE INDEX IF NOT EXISTS idx_players_position ON players(position);
      CREATE INDEX IF NOT EXISTS idx_players_star ON players(star);
      CREATE INDEX IF NOT EXISTS idx_managers_club ON managers(club);
      CREATE INDEX IF NOT EXISTS idx_managers_overall_rating ON managers(overall_rating);
      CREATE INDEX IF NOT EXISTS idx_player_stats_player_id ON player_stats(player_id);
      CREATE INDEX IF NOT EXISTS idx_squad_players_manager_id ON squad_players(manager_id);
      CREATE INDEX IF NOT EXISTS idx_squad_players_player_id ON squad_players(player_id);
      CREATE INDEX IF NOT EXISTS idx_manager_performance_manager_id ON manager_performance(manager_id);
      CREATE INDEX IF NOT EXISTS idx_manager_seasons_manager_id ON manager_seasons(manager_id);
      CREATE INDEX IF NOT EXISTS idx_manager_seasons_season ON manager_seasons(season);
    `;
    
    // Execute the SQL
    await query(createTablesSql);
    
    return res.status(200).json({
      message: 'Database schema initialized successfully'
    });
  } catch (error) {
    console.error('Error initializing database schema:', error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}; 