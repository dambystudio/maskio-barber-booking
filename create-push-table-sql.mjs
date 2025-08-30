// Script per creare manualmente la tabella push_subscriptions
import pkg from 'pg';
const { Client } = pkg;

const client = new Client({
  connectionString: process.env.DATABASE_URL || 'postgres://neondb_owner:npg_Wj09qDUmTsxE@ep-old-forest-a2ur722g-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require'
});

async function createPushTable() {
  try {
    await client.connect();
    console.log('🔌 Connesso al database');
    
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS push_subscriptions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        endpoint TEXT NOT NULL,
        p256dh TEXT NOT NULL,
        auth TEXT NOT NULL,
        user_agent TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `;
    
    await client.query(createTableSQL);
    console.log('✅ Tabella push_subscriptions creata!');
    
    const createIndexSQL = `
      CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user_id 
      ON push_subscriptions(user_id);
    `;
    
    await client.query(createIndexSQL);
    console.log('✅ Indice creato!');
    
  } catch (error) {
    console.error('❌ Errore:', error);
  } finally {
    await client.end();
    console.log('🔌 Connessione chiusa');
  }
}

createPushTable();
