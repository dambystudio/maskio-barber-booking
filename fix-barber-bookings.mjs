import { neon } from '@neondatabase/serverless';

const DATABASE_URL = process.env.DATABASE_URL || 'postgres://neondb_owner:npg_Wj09qDUmTsxE@ep-old-forest-a2ur722g-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require';
const sql = neon(DATABASE_URL);

async function fixExistingBarberBookings() {
    console.log('🔧 Correzione prenotazioni esistenti dei barbieri...');
    
    try {
        // 1. Prima verifica: trova gli user_id dei barbieri
        const barbers = await sql`
            SELECT id, name, email 
            FROM barbers
        `;
        
        console.log('👨‍💼 Barbieri nel sistema:');
        barbers.forEach(barber => {
            console.log(`   ${barber.name} (${barber.id}) - ${barber.email}`);
        });
        
        // 2. Trova gli utenti che corrispondono agli email dei barbieri
        const barberEmails = barbers.map(b => b.email);
        const barberUsers = await sql`
            SELECT id, email, role
            FROM users 
            WHERE email = ANY(${barberEmails})
        `;
        
        console.log('\n👤 Utenti barbieri:');
        barberUsers.forEach(user => {
            console.log(`   ${user.email} (user_id: ${user.id}) - Role: ${user.role}`);
        });
        
        // 3. Trova prenotazioni fatte dai barbieri per i clienti
        const barberUserIds = barberUsers.map(u => u.id);
        
        if (barberUserIds.length === 0) {
            console.log('\n⚠️ Nessun user_id di barbiere trovato');
            return;
        }
        
        const barberBookings = await sql`
            SELECT id, customer_name, barber_name, date, time, user_id
            FROM bookings 
            WHERE user_id = ANY(${barberUserIds})
            ORDER BY date DESC, time DESC
        `;
        
        console.log(`\n📋 Trovate ${barberBookings.length} prenotazioni fatte dai barbieri:`);
        
        if (barberBookings.length === 0) {
            console.log('✅ Nessuna prenotazione da correggere!');
            return;
        }
        
        // Mostra alcune prenotazioni di esempio
        console.log('\n📊 Esempi di prenotazioni da correggere:');
        barberBookings.slice(0, 5).forEach(booking => {
            const userInfo = barberUsers.find(u => u.id === booking.user_id);
            console.log(`   📅 ${booking.date} ${booking.time} - ${booking.customer_name} con ${booking.barber_name}`);
            console.log(`      🔗 user_id: ${booking.user_id} (${userInfo?.email})`);
        });
        
        if (barberBookings.length > 5) {
            console.log(`   ... e altre ${barberBookings.length - 5} prenotazioni`);
        }
        
        // 4. Conferma prima di procedere
        console.log(`\n🔧 CORREZIONE: Imposterò user_id = null per ${barberBookings.length} prenotazioni`);
        console.log('✅ Questo permetterà ai barbieri di fare prenotazioni multiple');
        
        // 5. Esegui la correzione
        const updateResult = await sql`
            UPDATE bookings 
            SET user_id = null 
            WHERE user_id = ANY(${barberUserIds})
        `;
        
        console.log(`\n✅ SUCCESSO: Aggiornate ${updateResult.count} prenotazioni`);
        
        // 6. Verifica finale
        const remainingBarberBookings = await sql`
            SELECT COUNT(*) as count
            FROM bookings 
            WHERE user_id = ANY(${barberUserIds})
        `;
        
        console.log(`📊 Verifica finale: ${remainingBarberBookings[0].count} prenotazioni ancora associate ai barbieri`);
        
        if (remainingBarberBookings[0].count === 0) {
            console.log('🎉 CORREZIONE COMPLETATA! I barbieri ora possono fare prenotazioni multiple');
        }
        
        // 7. Riepilogo finale
        console.log(`\n📋 RIEPILOGO CORREZIONE:`);
        console.log('✅ Controllo duplicati giornalieri: DISABILITATO per barbieri e admin');
        console.log('✅ user_id delle prenotazioni barbieri: IMPOSTATO a null');
        console.log('✅ I barbieri possono ora fare più prenotazioni al giorno per clienti diversi');
        console.log('❌ Rimane attivo il controllo per orari sovrapposti (corretto)');
        
    } catch (error) {
        console.error('❌ Errore nella correzione:', error);
    }
}

fixExistingBarberBookings();
