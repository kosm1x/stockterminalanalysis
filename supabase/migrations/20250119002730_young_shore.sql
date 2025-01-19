/*
  # Create watchlist schema

  1. New Tables
    - `watchlist_stocks`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `symbol` (text)
      - `last_signal` (text)
      - `signal_date` (timestamptz)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `watchlist_stocks` table
    - Add policies for authenticated users to manage their watchlist
*/

CREATE TABLE IF NOT EXISTS watchlist_stocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  symbol text NOT NULL,
  last_signal text,
  signal_date timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, symbol)
);

ALTER TABLE watchlist_stocks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own watchlist"
  ON watchlist_stocks
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can add stocks to their watchlist"
  ON watchlist_stocks
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their watchlist stocks"
  ON watchlist_stocks
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove stocks from their watchlist"
  ON watchlist_stocks
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);