-- RESET FINALE PUSH SUBSCRIPTIONS
-- Esegui su Neon Console

-- 1. Controlla subscriptions correnti
SELECT ps.id, ps.created_at, u.email, 
       SUBSTRING(ps.endpoint, 1, 60) as endpoint_preview
FROM push_subscriptions ps
JOIN users u ON ps.user_id = u.id
ORDER BY ps.created_at DESC;

-- 2. ELIMINA TUTTE (decomment per eseguire)
DELETE FROM push_subscriptions;

-- 3. Verifica eliminazione
SELECT COUNT(*) as remaining FROM push_subscriptions;
-- Dovrebbe restituire: remaining = 0
