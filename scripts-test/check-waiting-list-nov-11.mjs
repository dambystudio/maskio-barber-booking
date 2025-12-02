import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function checkWaitingList() {
    console.log('\n🔍 CONTROLLO LISTA D\'ATTESA - 11 NOVEMBRE 2025\n');
    
    const date = '2025-11-11';
    
    // Check waiting list entries
    const waitingList = await sql`
        SELECT 
            id,
            barber_id,
            barber_name,
            customer_name,
            customer_email,
            customer_phone,
            notes,
            status,
            position,
            created_at
        FROM waitlist
        WHERE date = ${date}
        ORDER BY position, created_at
    `;
    
    console.log(`📋 LISTA D'ATTESA per ${date}: ${waitingList.length} persone\n`);
    
    if (waitingList.length === 0) {
        console.log('❌ Nessuna persona in lista d\'attesa per questa data\n');
    } else {
        waitingList.forEach((entry, index) => {
            console.log(`${index + 1}. ${entry.customer_name} (Posizione: ${entry.position})`);
            console.log(`   Email: ${entry.customer_email || '❌ NON DISPONIBILE'}`);
            console.log(`   Telefono: ${entry.customer_phone || '❌ NON DISPONIBILE'}`);
            console.log(`   Note: ${entry.notes || 'N/A'}`);
            console.log(`   Barbiere: ${entry.barber_name} (${entry.barber_id})`);
            console.log(`   Status: ${entry.status}`);
            console.log(`   Iscritto: ${entry.created_at}`);
            console.log('');
        });
        
        // Analisi problemi
        const noPhone = waitingList.filter(e => !e.customer_phone || e.customer_phone.trim() === '');
        const noEmail = waitingList.filter(e => !e.customer_email || e.customer_email.trim() === '');
        
        console.log('📊 ANALISI:');
        console.log(`   Totale persone: ${waitingList.length}`);
        console.log(`   ❌ Senza telefono: ${noPhone.length}`);
        console.log(`   ❌ Senza email: ${noEmail.length}`);
        console.log(`   ✅ Con telefono: ${waitingList.length - noPhone.length}`);
        console.log(`   ✅ Con email: ${waitingList.length - noEmail.length}`);
        
        if (noPhone.length > 0) {
            console.log('\n⚠️ PROBLEMA: Persone senza telefono:');
            noPhone.forEach(e => {
                console.log(`   - ${e.customer_name} (${e.customer_email || 'no email'})`);
            });
        }
    }
    
    // Check user profiles for those in waiting list
    if (waitingList.length > 0) {
        console.log('\n\n🔍 CONTROLLO PROFILI UTENTE:\n');
        
        const emails = waitingList
            .filter(e => e.customer_email)
            .map(e => e.customer_email);
        
        if (emails.length > 0) {
            const users = await sql`
                SELECT id, name, email, phone
                FROM users
                WHERE email = ANY(${emails})
            `;
            
            console.log(`📋 Trovati ${users.length} profili utente:\n`);
            
            users.forEach(user => {
                const waitingEntry = waitingList.find(w => w.customer_email === user.email);
                console.log(`👤 ${user.name} (${user.email})`);
                console.log(`   Telefono nel profilo: ${user.phone || '❌ NON DISPONIBILE'}`);
                console.log(`   Telefono in waiting_list: ${waitingEntry?.customer_phone || '❌ NON DISPONIBILE'}`);
                console.log('');
            });
        }
    }
    
    process.exit(0);
}

checkWaitingList().catch(error => {
    console.error('❌ ERRORE:', error);
    process.exit(1);
});
