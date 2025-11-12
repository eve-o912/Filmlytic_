-- Create voting_sessions table to track voting events
CREATE TABLE IF NOT EXISTS voting_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'active', 'closed'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  voting_started_at TIMESTAMP WITH TIME ZONE,
  voting_ends_at TIMESTAMP WITH TIME ZONE,
  total_films INTEGER NOT NULL DEFAULT 10
);

-- Create voters table to store unique voter IDs
CREATE TABLE IF NOT EXISTS voters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES voting_sessions(id) ON DELETE CASCADE,
  voter_serial_number TEXT NOT NULL, -- e.g., 'X001', 'X002'
  qr_code_token TEXT NOT NULL UNIQUE,
  has_voted BOOLEAN DEFAULT FALSE,
  voted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create votes table to store individual votes (transparent - everyone can see)
CREATE TABLE IF NOT EXISTS votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES voting_sessions(id) ON DELETE CASCADE,
  voter_serial_number TEXT NOT NULL, -- Display voter ID (e.g., X001)
  film_id INTEGER NOT NULL, -- 1-10
  voted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE voting_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE voters ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;

-- Policies for public viewing of votes (transparency)
CREATE POLICY "Anyone can view all votes" ON votes FOR SELECT USING (true);
CREATE POLICY "Anyone can view all voters" ON voters FOR SELECT USING (true);
CREATE POLICY "Anyone can view voting sessions" ON voting_sessions FOR SELECT USING (true);

-- Admin insert policies (no auth required for now - use API key protection)
CREATE POLICY "Allow insert votes" ON votes FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow insert voters" ON voters FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow insert sessions" ON voting_sessions FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update sessions" ON voting_sessions FOR UPDATE USING (true);
CREATE POLICY "Allow update voters" ON voters FOR UPDATE USING (true);

-- Create indexes for performance
CREATE INDEX idx_votes_session_id ON votes(session_id);
CREATE INDEX idx_votes_voter_serial ON votes(voter_serial_number);
CREATE INDEX idx_voters_session_id ON voters(session_id);
CREATE INDEX idx_voters_qr_code ON voters(qr_code_token);
