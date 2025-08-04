/*
  # Enhance pointage table
  1. Added new columns: commentaire, duree_travail, validated_by
  2. Updated RLS policies for manager validation
  3. Added status constraints
*/
ALTER TABLE pointage ADD COLUMN IF NOT EXISTS commentaire text DEFAULT '';
ALTER TABLE pointage ADD COLUMN IF NOT EXISTS duree_travail interval;
ALTER TABLE pointage ADD COLUMN IF NOT EXISTS validated_by uuid REFERENCES auth.users;
ALTER TABLE pointage ADD COLUMN IF NOT EXISTS validation_date timestamptz;

-- Update RLS policies
DROP POLICY IF EXISTS "Users can view their own pointages" ON pointage;
DROP POLICY IF EXISTS "Users can insert their own pointages" ON pointage;
DROP POLICY IF EXISTS "Users can update their own pointages" ON pointage;

CREATE POLICY "Users can view their pointages" 
ON pointage FOR SELECT 
TO authenticated 
USING (
  auth.uid() = user_id OR 
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE id = auth.uid() AND raw_user_meta_data->>'role' = 'manager'
  )
);

CREATE POLICY "Users can insert their pointages" 
ON pointage FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their pointages" 
ON pointage FOR UPDATE 
TO authenticated 
USING (
  auth.uid() = user_id OR 
  (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE id = auth.uid() AND raw_user_meta_data->>'role' = 'manager'
    ) AND 
    (statut = 'En attente' OR statut = 'Validé')
  )
);

-- Function to calculate work duration
CREATE OR REPLACE FUNCTION calculate_work_duration()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.heure_entree IS NOT NULL AND NEW.heure_sortie IS NOT NULL THEN
    NEW.duree_travail = (
      (NEW.heure_sortie::timestamp - NEW.heure_entree::timestamp) -
      CASE 
        WHEN (NEW.heure_sortie::timestamp - NEW.heure_entree::timestamp) > interval '1 hour' 
        THEN interval '1 hour' -- Subtract lunch break
        ELSE interval '0'
      END
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for work duration
DROP TRIGGER IF EXISTS trg_calculate_work_duration ON pointage;
CREATE TRIGGER trg_calculate_work_duration
BEFORE INSERT OR UPDATE ON pointage
FOR EACH ROW
EXECUTE FUNCTION calculate_work_duration();
