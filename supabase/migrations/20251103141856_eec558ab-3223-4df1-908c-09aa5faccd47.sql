-- Create table for player progress and scores
CREATE TABLE public.player_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id text NOT NULL,
  score integer NOT NULL DEFAULT 0,
  words_found text[] NOT NULL DEFAULT '{}',
  pangrams_found text[] NOT NULL DEFAULT '{}',
  game_date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(session_id, game_date)
);

-- Enable RLS
ALTER TABLE public.player_stats ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read their own stats (by session_id for guests, user_id for logged in)
CREATE POLICY "Users can view their own stats"
  ON public.player_stats
  FOR SELECT
  USING (
    session_id = current_setting('request.headers', true)::json->>'x-session-id'
    OR user_id = auth.uid()
  );

-- Policy: Anyone can insert their own stats
CREATE POLICY "Users can insert their own stats"
  ON public.player_stats
  FOR INSERT
  WITH CHECK (
    session_id = current_setting('request.headers', true)::json->>'x-session-id'
    OR user_id = auth.uid()
  );

-- Policy: Anyone can update their own stats
CREATE POLICY "Users can update their own stats"
  ON public.player_stats
  FOR UPDATE
  USING (
    session_id = current_setting('request.headers', true)::json->>'x-session-id'
    OR user_id = auth.uid()
  );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_player_stats_updated_at
  BEFORE UPDATE ON public.player_stats
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Create index for faster lookups
CREATE INDEX idx_player_stats_session_date ON public.player_stats(session_id, game_date);
CREATE INDEX idx_player_stats_user_date ON public.player_stats(user_id, game_date) WHERE user_id IS NOT NULL;