-- Add columns to track comprehensive player statistics
ALTER TABLE player_stats
ADD COLUMN IF NOT EXISTS best_rank text DEFAULT 'Beginner',
ADD COLUMN IF NOT EXISTS games_played integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS current_streak integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS best_streak integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_played_date date DEFAULT NULL;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_player_stats_session_date ON player_stats(session_id, game_date DESC);