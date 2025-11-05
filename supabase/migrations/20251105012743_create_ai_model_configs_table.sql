/*
  # Create AI Model Configs table

  1. New Tables
    - `ai_model_configs`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `provider` (text) - xai, openai, anthropic, google
      - `model_id` (text) - specific model identifier
      - `api_key` (text) - encrypted API key
      - `base_url` (text, optional) - custom base URL
      - `persona` (text, optional) - custom persona instructions
      - `enabled` (boolean) - whether this provider is enabled
      - `selected_model_id` (text, optional) - currently selected model
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `ai_model_configs` table
    - Add policy for authenticated users to read/write their own configs
    - Ensure users cannot access other users' API keys

  3. Indexes
    - Add index on user_id and provider for faster queries
*/

CREATE TABLE IF NOT EXISTS ai_model_configs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider text NOT NULL CHECK (provider IN ('xai', 'openai', 'anthropic', 'google')),
  model_id text NOT NULL,
  api_key text,
  base_url text,
  persona text,
  enabled boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, provider)
);

CREATE TABLE IF NOT EXISTS user_model_selection (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  selected_model_id text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE ai_model_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_model_selection ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own AI configs"
  ON ai_model_configs FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own AI configs"
  ON ai_model_configs FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own AI configs"
  ON ai_model_configs FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own AI configs"
  ON ai_model_configs FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view own model selection"
  ON user_model_selection FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own model selection"
  ON user_model_selection FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own model selection"
  ON user_model_selection FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS ai_model_configs_user_id_provider_idx 
  ON ai_model_configs(user_id, provider);

CREATE INDEX IF NOT EXISTS user_model_selection_user_id_idx 
  ON user_model_selection(user_id);
