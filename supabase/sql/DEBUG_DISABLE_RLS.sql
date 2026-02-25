-- Script temporário para desativar RLS e testar
-- Execute isto no Supabase SQL Editor para desativar RLS temporariamente

-- Desativar RLS temporariamente
ALTER TABLE public.playlists DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.liked_tracks DISABLE ROW LEVEL SECURITY;

-- Verificar se funcionou
SELECT 
  'playlists' as table_name, 
  rowsecurity 
FROM pg_tables 
WHERE tablename = 'playlists'
AND schemaname = 'public';

SELECT 
  'liked_tracks' as table_name, 
  rowsecurity 
FROM pg_tables 
WHERE tablename = 'liked_tracks'
AND schemaname = 'public';

-- Testar insert diretamente
INSERT INTO public.playlists (user_id, name, tracks_json)
VALUES ('0fa809b2-4637-4cc1-88f8-a2afcb2b2ceb', 'TESTE_DEBUG', '[]')
RETURNING id, name;
