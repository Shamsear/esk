-- Create seasons table
CREATE TABLE IF NOT EXISTS seasons (
    id SERIAL PRIMARY KEY,
    name TEXT,
    year INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'upcoming',
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(year)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_seasons_year ON seasons (year);
CREATE INDEX IF NOT EXISTS idx_seasons_status ON seasons (status);

-- Add some initial data
INSERT INTO seasons (name, year, status, start_date, end_date)
VALUES 
    ('Season 2023', 2023, 'completed', '2023-08-01', '2024-05-31'),
    ('Season 2024', 2024, 'active', '2024-08-01', '2025-05-31')
ON CONFLICT (year) DO NOTHING;

-- Add a trigger to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_timestamp ON seasons;
CREATE TRIGGER set_timestamp
BEFORE UPDATE ON seasons
FOR EACH ROW
EXECUTE FUNCTION update_modified_column(); 