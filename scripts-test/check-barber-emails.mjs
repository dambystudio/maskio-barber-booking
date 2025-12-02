/**
 * Verifica email reali dei barbieri dalla tabella barbers
 */

import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

async function checkBarberEmails() {
    console.log('🔍 EMAIL REALI DEI BARBIERI\n');
    
    const barbers = await sql`
        SELECT id, name, email
        FROM barbers
        ORDER BY name
    `;
    
    console.log('📧 Barbieri registrati:');
    console.log('=======================\n');
    
    barbers.forEach(b => {
        console.log(`${b.name.padEnd(20)} → ${b.email}`);
    });
    
    console.log('\n\n📝 Codice da aggiornare in universal-slots.ts:');
    console.log('================================================\n');
    
    barbers.forEach(b => {
        const name = b.name.toLowerCase();
        if (name.includes('michele')) {
            console.log(`const MICHELE_EMAIL = '${b.email}';`);
        } else if (name.includes('fabio')) {
            console.log(`const FABIO_EMAIL = '${b.email}';`);
        } else if (name.includes('nicol')) {
            console.log(`const NICOLO_EMAIL = '${b.email}';`);
        }
    });
}

checkBarberEmails();
