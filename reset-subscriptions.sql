-- Reset completo delle push subscriptions
-- Esegui questo query per eliminare TUTTE le subscriptions esistenti

DELETE FROM push_subscriptions;

-- Verifica che siano state eliminate
SELECT COUNT(*) as remaining_subscriptions FROM push_subscriptions;

-- Se vuoi vedere i dettagli prima di eliminare, usa questa query:
-- SELECT ps.id, ps.created_at, u.email, ps.endpoint
-- FROM push_subscriptions ps
-- JOIN users u ON ps.user_id = u.id
-- ORDER BY ps.created_at DESC;
