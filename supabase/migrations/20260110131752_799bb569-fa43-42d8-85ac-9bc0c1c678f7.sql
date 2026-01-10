-- Supprimer l'ancienne politique non sécurisée
DROP POLICY "Anyone can create packs" ON published_packs;

-- Créer une nouvelle politique sécurisée
CREATE POLICY "Users can create their own packs"
ON published_packs
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);