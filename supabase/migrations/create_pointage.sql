/*
  # Create pointage table
  1. New Tables: pointage (id uuid, user_id uuid, date date, heure_entree time, etc.)
  2. Security: Enable RLS, add policies for authenticated users
*/
CREATE TABLE IF NOT EXISTS pointage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  date date NOT NULL,
  heure_entree time,
  heure_sortie time,
  statut text NOT NULL,
  localisation jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz
);

ALTER TABLE pointage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own pointages" 
ON pointage FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own pointages" 
ON pointage FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own pointages" 
ON pointage FOR UPDATE 
TO authenticated 
USING (auth.uid() = user_id);
