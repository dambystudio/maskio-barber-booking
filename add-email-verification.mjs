import { neon } from '@neondatabase/serverless';

const DATABASE_URL = process.env.DATABASE_URL || 'postgres://neondb_owner:npg_Wj09qDUmTsxE@ep-old-forest-a2ur722g-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require';
const sql = neon(DATABASE_URL);

async function addEmailVerificationColumn() {
  try {
    console.log('🔧 Aggiungendo colonna emailVerified al database...\n');
    
    // Check if column exists
    const columns = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'email_verified'
    `;
    
    if (columns.length > 0) {
      console.log('✅ Colonna email_verified già esistente');
      return;
    }
    
    // Add column
    await sql`
      ALTER TABLE users 
      ADD COLUMN email_verified TIMESTAMP DEFAULT NULL
    `;
    
    console.log('✅ Colonna email_verified aggiunta con successo!');
    
    // Show current users
    const users = await sql`SELECT id, email, email_verified FROM users`;
    console.log('\n📊 Account attuali:');
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email} - Verificata: ${user.email_verified ? '✅' : '❌'}`);
    });
    
  } catch (error) {
    console.error('❌ Errore:', error.message);
  }
}

addEmailVerificationColumn();
