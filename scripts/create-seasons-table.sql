-- Create seasons table
CREATE TABLE IF NOT EXISTS seasons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'inactive' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert sample seasons
INSERT INTO seasons (name, start_date, end_date, status) VALUES
('Season 1', '2024-01-01', '2024-06-30', 'inactive'),
('Season 2', '2024-07-01', '2024-12-31', 'active');

-- Later we'll need to add season_id to farmers and goods tables
-- ALTER TABLE farmers ADD COLUMN season_id UUID REFERENCES seasons(id);
-- ALTER TABLE goods ADD COLUMN season_id UUID REFERENCES seasons(id);
