-- Script para verificar o estado das tabelas e funções
-- Execute no Supabase SQL Editor

-- 1) Verificar se as tabelas existem
SELECT 
  'Table: ' || tablename AS check_name,
  rowsecurity AS rls_enabled
FROM pg_tables 
WHERE schemaname = 'public'
AND tablename IN ('playlists', 'liked_tracks', 'share_requests');

-- 2) Verificar políticas RLS
SELECT 
  policyname,
  tablename,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('playlists', 'liked_tracks');

-- 3) Verificar se as funções existem
SELECT 
  proname,
  prosrc
FROM pg_proc
WHERE proname IN ('add_liked_track', 'create_playlist_fn', 'add_track_to_playlist_fn');

-- 4) Verificar grants nas tabelas
SELECT 
  tablename,
  grantee,
  privilege_type
FROM information_schema.table_privileges
WHERE table_schema = 'public'
AND tablename IN ('playlists', 'liked_tracks');

-- 5) Testar insert com utilizador específico
-- Substitua pelo user_id correto
INSERT INTO public.playlists (user_id, name, tracks_json)
VALUES ('0fa809b2-4637-4cc1-88f8-a2afcb2b2ceb', 'TEST_CHECK_' || now()::text, '[]')
RETURNING id, name;

-- 6) Ver dados existentes
SELECT * FROM public.playlists LIMIT 5;
SELECT * FROM public.liked_tracks LIMIT 5;
