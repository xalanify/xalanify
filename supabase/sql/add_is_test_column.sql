-- Add is_test column to playlists table if it doesn't exist
ALTER TABLE public.playlists 
ADD COLUMN IF NOT EXISTS is_test boolean DEFAULT false;

-- Update existing playlists that have "teste" or "demo" in the name to be marked as test
UPDATE public.playlists 
SET is_test = true 
WHERE LOWER(name) LIKE '%teste%' OR LOWER(name) LIKE '%demo%';

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.playlists TO authenticated;

-- Verify the column was added
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'playlists' AND column_name = 'is_test';
