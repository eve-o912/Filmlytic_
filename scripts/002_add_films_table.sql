-- Create films table for admin to configure films before voting
CREATE TABLE IF NOT EXISTS films (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES voting_sessions(id) ON DELETE CASCADE,
  film_number INTEGER NOT NULL, -- 1-10
  title TEXT NOT NULL,
  logline TEXT NOT NULL,
  director TEXT NOT NULL,
  producer TEXT NOT NULL,
  poster_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_films_session_id ON films(session_id);
CREATE INDEX idx_films_film_number ON films(session_id, film_number);

-- Enable RLS
ALTER TABLE films ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Anyone can view films" ON films FOR SELECT USING (true);
CREATE POLICY "Allow insert films" ON films FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update films" ON films FOR UPDATE USING (true);
