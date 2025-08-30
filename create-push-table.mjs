// Migration per creare la tabella push_subscriptions
import { db } from './src/lib/database-postgres.js';

async function createPushSubscriptionsTable() {
  try {
    console.log('📊 Creazione tabella push_subscriptions...');
    
    await db.execute(`
      CREATE TABLE IF NOT EXISTS push_subscriptions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        endpoint TEXT NOT NULL,
        p256dh TEXT NOT NULL,
        auth TEXT NOT NULL,
        user_agent TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    
    console.log('✅ Tabella push_subscriptions creata con successo!');
    
    // Crea indice per performance
    await db.execute(`
      CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user_id 
      ON push_subscriptions(user_id);
    `);
    
    console.log('✅ Indice creato per user_id');
    
  } catch (error) {
    console.error('❌ Errore creazione tabella:', error);
    throw error;
  }
}

createPushSubscriptionsTable()
  .then(() => {
    console.log('🎉 Migration completata!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Migration fallita:', error);
    process.exit(1);
  });
