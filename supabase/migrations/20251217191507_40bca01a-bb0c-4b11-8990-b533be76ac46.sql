-- Drop the existing restrictive INSERT policy
DROP POLICY IF EXISTS "Users can create their own packs" ON public.published_packs;

-- Create a new policy that allows anyone to insert packs
CREATE POLICY "Anyone can create packs" 
ON public.published_packs 
FOR INSERT 
WITH CHECK (true);