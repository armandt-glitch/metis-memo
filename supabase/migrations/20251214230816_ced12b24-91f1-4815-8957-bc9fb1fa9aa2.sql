-- Create table for published packs
CREATE TABLE public.published_packs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  pack_id TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  theme TEXT,
  level TEXT CHECK (level IN ('beginner', 'intermediate', 'advanced')),
  tags TEXT[] DEFAULT '{}',
  card_count INTEGER NOT NULL DEFAULT 0,
  cards JSONB NOT NULL DEFAULT '[]',
  has_media BOOLEAN NOT NULL DEFAULT false,
  rating NUMERIC(2,1) DEFAULT 0,
  download_count INTEGER NOT NULL DEFAULT 0,
  is_approved BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.published_packs ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view approved packs
CREATE POLICY "Anyone can view approved packs"
ON public.published_packs
FOR SELECT
USING (is_approved = true);

-- Policy: Users can view their own packs (even if not approved)
CREATE POLICY "Users can view their own packs"
ON public.published_packs
FOR SELECT
USING (auth.uid() = user_id);

-- Policy: Users can create their own packs
CREATE POLICY "Users can create their own packs"
ON public.published_packs
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own packs
CREATE POLICY "Users can update their own packs"
ON public.published_packs
FOR UPDATE
USING (auth.uid() = user_id);

-- Policy: Users can delete their own packs
CREATE POLICY "Users can delete their own packs"
ON public.published_packs
FOR DELETE
USING (auth.uid() = user_id);

-- Add trigger for automatic timestamp updates
CREATE TRIGGER update_published_packs_updated_at
BEFORE UPDATE ON public.published_packs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for pack media (images/audio)
INSERT INTO storage.buckets (id, name, public) VALUES ('pack-media', 'pack-media', true);

-- Storage policy: Anyone can view pack media
CREATE POLICY "Anyone can view pack media"
ON storage.objects
FOR SELECT
USING (bucket_id = 'pack-media');

-- Storage policy: Authenticated users can upload pack media
CREATE POLICY "Authenticated users can upload pack media"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'pack-media' AND auth.role() = 'authenticated');

-- Storage policy: Users can delete their own pack media
CREATE POLICY "Users can delete their own pack media"
ON storage.objects
FOR DELETE
USING (bucket_id = 'pack-media' AND auth.uid()::text = (storage.foldername(name))[1]);