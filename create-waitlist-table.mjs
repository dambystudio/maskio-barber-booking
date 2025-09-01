import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

// Carica le variabili d'ambiente
dotenv.config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function createWaitlistTable() {
    console.log('🗃️ Creazione tabella waitlist...\n');
    
    try {
        // Crea la tabella waitlist
        await sql`
            CREATE TABLE IF NOT EXISTS waitlist (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                user_id UUID REFERENCES users(id) ON DELETE CASCADE,
                barber_id VARCHAR(100) NOT NULL,
                barber_name VARCHAR(100) NOT NULL,
                date VARCHAR(20) NOT NULL,
                service VARCHAR(100),
                price DECIMAL(8,2),
                customer_name VARCHAR(100) NOT NULL,
                customer_email VARCHAR(100),
                customer_phone VARCHAR(20),
                notes TEXT,
                status VARCHAR(20) DEFAULT 'waiting',
                position INTEGER NOT NULL DEFAULT 1,
                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP DEFAULT NOW()
            )
        `;
        
        console.log('✅ Tabella waitlist creata con successo!');
        
        // Crea indici per ottimizzare le query
        await sql`
            CREATE INDEX IF NOT EXISTS idx_waitlist_date ON waitlist(date);
        `;
        
        await sql`
            CREATE INDEX IF NOT EXISTS idx_waitlist_barber_date ON waitlist(barber_id, date);
        `;
        
        await sql`
            CREATE INDEX IF NOT EXISTS idx_waitlist_user ON waitlist(user_id);
        `;
        
        await sql`
            CREATE INDEX IF NOT EXISTS idx_waitlist_status ON waitlist(status);
        `;
        
        console.log('✅ Indici creati per ottimizzare le performance!');
        
        // Verifica la struttura
        const columns = await sql`
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns 
            WHERE table_name = 'waitlist' 
            ORDER BY ordinal_position
        `;
        
        console.log('\n📊 Struttura tabella waitlist:');
        columns.forEach(col => {
            console.log(`  - ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
        });
        
        console.log('\n🎉 Setup tabella waitlist completato!');
        
    } catch (error) {
        console.error('❌ Errore durante la creazione tabella:', error);
    }
}

createWaitlistTable();
