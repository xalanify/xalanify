-- Force drop all import_playlist functions using OID
SELECT 'DROP FUNCTION IF EXISTS ' || oid::regprocedure::text || ' CASCADE' as cmd
FROM pg_proc
WHERE proname LIKE 'import_playlist%';
