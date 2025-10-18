import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function debugSlots() {
    const testDate = '2025-10-30';
    const micheleEmail = 'michelebiancofiore0230@gmail.com';
    
    console.log('\n🔍 DEBUG SLOT 30 OTTOBRE - MICHELE');
    console.log('='.repeat(80));
    
    try {
        const michele = await sql`SELECT id FROM barbers WHERE email = ${micheleEmail}`;
        const barberId = michele[0].id;
        
        // 1. Check schedule
        console.log('\n📅 SCHEDULE:');
        const schedule = await sql`
            SELECT * FROM barber_schedules 
            WHERE barber_id = ${barberId} AND date = ${testDate}
        `;
        
        if (schedule.length > 0) {
            const availableSlots = JSON.parse(schedule[0].available_slots);
            const unavailableSlots = JSON.parse(schedule[0].unavailable_slots || '[]');
            
            console.log(`   day_off: ${schedule[0].day_off}`);
            console.log(`   available_slots: ${availableSlots.length} slot`);
            console.log(`   Available: ${availableSlots.join(', ')}`);
            console.log(`   unavailable_slots: ${unavailableSlots.length} slot`);
            if (unavailableSlots.length > 0) {
                console.log(`   Unavailable: ${unavailableSlots.join(', ')}`);
            }
        }
        
        // 2. Check bookings
        console.log('\n📋 PRENOTAZIONI:');
        const bookings = await sql`
            SELECT * FROM bookings 
            WHERE barber_id = ${barberId} 
            AND date = ${testDate}
            ORDER BY time
        `;
        
        console.log(`   Totale prenotazioni: ${bookings.length}`);
        
        if (bookings.length > 0) {
            bookings.forEach(b => {
                console.log(`   - ${b.time}: ${b.status} (ID: ${b.id.substring(0, 8)}...)`);
            });
            
            const activeBookings = bookings.filter(b => b.status !== 'cancelled');
            console.log(`\n   Prenotazioni attive: ${activeBookings.length}`);
            console.log(`   Slot occupati: ${activeBookings.map(b => b.time).join(', ')}`);
        } else {
            console.log('   ✅ Nessuna prenotazione');
        }
        
        // 3. Calculate available slots manually
        console.log('\n🔢 CALCOLO MANUALE:');
        const availableSlots = JSON.parse(schedule[0].available_slots);
        const unavailableSlots = JSON.parse(schedule[0].unavailable_slots || '[]');
        const bookedSlots = bookings
            .filter(b => b.status !== 'cancelled')
            .map(b => b.time);
        
        const actuallyAvailable = availableSlots.filter(slot => 
            !bookedSlots.includes(slot) && !unavailableSlots.includes(slot)
        );
        
        console.log(`   Total slots: ${availableSlots.length}`);
        console.log(`   - Booked: ${bookedSlots.length}`);
        console.log(`   - Unavailable: ${unavailableSlots.length}`);
        console.log(`   = Available: ${actuallyAvailable.length}`);
        
        if (actuallyAvailable.length > 0) {
            console.log(`   ✅ Slot disponibili: ${actuallyAvailable.join(', ')}`);
        } else {
            console.log(`   ❌ NESSUNO SLOT DISPONIBILE`);
        }
        
        // 4. Check barber closures for specific times
        console.log('\n🚫 CHIUSURE SPECIFICHE ORARIE:');
        const barberClosures = await sql`
            SELECT * FROM barber_closures 
            WHERE barber_email = ${micheleEmail} 
            AND closure_date = ${testDate}
        `;
        
        if (barberClosures.length > 0) {
            console.log(`   ⚠️ Trovate ${barberClosures.length} chiusure:`);
            barberClosures.forEach(c => {
                console.log(`   - Tipo: ${c.closure_type}`);
                console.log(`     All day: ${c.all_day}`);
                console.log(`     Motivo: ${c.reason || 'N/A'}`);
            });
        } else {
            console.log('   ✅ Nessuna chiusura specifica');
        }
        
        // 5. Diagnosis
        console.log('\n' + '='.repeat(80));
        console.log('🎯 DIAGNOSI:');
        console.log('='.repeat(80));
        
        if (schedule[0].day_off) {
            console.log('❌ PROBLEMA: day_off è TRUE');
        } else if (unavailableSlots.length === availableSlots.length) {
            console.log('❌ PROBLEMA: Tutti gli slot sono in unavailable_slots!');
            console.log('   SOLUZIONE: Svuota unavailable_slots');
        } else if (bookedSlots.length === availableSlots.length) {
            console.log('❌ PROBLEMA: Tutti gli slot sono prenotati!');
            console.log('   SOLUZIONE: Elimina prenotazioni fantasma');
        } else if (actuallyAvailable.length === 0) {
            console.log('❌ PROBLEMA: Combinazione di prenotazioni + unavailable = 100%');
        } else {
            console.log(`✅ CI SONO ${actuallyAvailable.length} SLOT DISPONIBILI`);
            console.log('⚠️ Ma l\'API dice hasSlots=false');
            console.log('   PROBLEMA: Bug nell\'API batch-availability');
        }
        
    } catch (error) {
        console.error('❌ ERRORE:', error);
        throw error;
    }
}

debugSlots()
    .then(() => {
        console.log('\n✅ Debug completato\n');
        process.exit(0);
    })
    .catch(error => {
        console.error('\n❌ Debug fallito:', error);
        process.exit(1);
    });
