require('dotenv').config({ path: '.env.local' });
const { sql } = require('@vercel/postgres');

async function createSeasonsTable() {
  try {
    // Create seasons table
    await sql`
      CREATE TABLE IF NOT EXISTS seasons (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'inactive' CHECK (status IN ('active', 'inactive')),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;

    console.log('Seasons table created successfully');

    // Insert sample seasons
    await sql`
      INSERT INTO seasons (name, start_date, end_date, status) VALUES
      ('Season 1', '2024-01-01', '2024-06-30', 'inactive'),
      ('Season 2', '2024-07-01', '2024-12-31', 'active')
      ON CONFLICT (id) DO NOTHING
    `;

    console.log('Sample seasons inserted successfully');

    // Add season_id to farmers table
    await sql`
      ALTER TABLE farmers ADD COLUMN IF NOT EXISTS season_id UUID REFERENCES seasons(id)
    `;

    console.log('Added season_id to farmers table');

    // Add season_id to goods table
    await sql`
      ALTER TABLE goods ADD COLUMN IF NOT EXISTS season_id UUID REFERENCES seasons(id)
    `;

    console.log('Added season_id to goods table');

    // Add season_id to sales table
    await sql`
      ALTER TABLE sales ADD COLUMN IF NOT EXISTS season_id UUID REFERENCES seasons(id)
    `;

    console.log('Added season_id to sales table');

  } catch (error) {
    console.error('Error creating seasons table:', error);
  }
}

createSeasonsTable();
