import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function debugDec22() {
    console.log('\n🔍 DEBUG 22 DICEMBRE - Fabio & Michele');
    console.log('='.repeat(80));
    
    try {
        const date = '2025-12-22';
        
        // Get barbers
        const fabio = await sql`SELECT id, email, name FROM barbers WHERE email = 'fabio.cassano97@icloud.com'`;
        const michele = await sql`SELECT id, email, name FROM barbers WHERE email = 'michelebiancofiore0230@gmail.com'`;
        
        console.log('\n📅 DATA: 22 Dicembre 2025 (Lunedì)\n');
        
        // FABIO
        console.log('=' .repeat(80));
        console.log('👤 FABIO:');
        console.log('='.repeat(80));
        
        const fabioSchedule = await sql`
            SELECT * FROM barber_schedules 
            WHERE barber_id = ${fabio[0].id} AND date = ${date}
        `;
        
        if (fabioSchedule.length === 0) {
            console.log('❌ SCHEDULE NON TROVATO!\n');
        } else {
            const s = fabioSchedule[0];
            const available = JSON.parse(s.available_slots || '[]');
            const unavailable = JSON.parse(s.unavailable_slots || '[]');
            
            console.log(`✅ Schedule trovato:`);
            console.log(`   day_off: ${s.day_off}`);
            console.log(`   available_slots: ${available.length} slot`);
            console.log(`   unavailable_slots: ${unavailable.length} slot`);
            console.log(`   created_at: ${s.created_at}`);
            console.log(`   updated_at: ${s.updated_at}`);
            
            if (available.length > 0) {
                console.log(`\n   Slot disponibili: ${available.join(', ')}`);
            }
            if (unavailable.length > 0) {
                console.log(`   Slot NON disponibili: ${unavailable.join(', ')}`);
            }
        }
        
        // Check bookings
        const fabioBookings = await sql`
            SELECT time, status FROM bookings 
            WHERE barber_id = ${fabio[0].id} AND date = ${date}
            ORDER BY time
        `;
        
        console.log(`\n   Prenotazioni: ${fabioBookings.length}`);
        if (fabioBookings.length > 0) {
            fabioBookings.forEach(b => {
                console.log(`      - ${b.time}: ${b.status}`);
            });
        }
        
        // MICHELE
        console.log('\n' + '='.repeat(80));
        console.log('👤 MICHELE:');
        console.log('='.repeat(80));
        
        const micheleSchedule = await sql`
            SELECT * FROM barber_schedules 
            WHERE barber_id = ${michele[0].id} AND date = ${date}
        `;
        
        if (micheleSchedule.length === 0) {
            console.log('❌ SCHEDULE NON TROVATO!\n');
        } else {
            const s = micheleSchedule[0];
            const available = JSON.parse(s.available_slots || '[]');
            const unavailable = JSON.parse(s.unavailable_slots || '[]');
            
            console.log(`✅ Schedule trovato:`);
            console.log(`   day_off: ${s.day_off}`);
            console.log(`   available_slots: ${available.length} slot`);
            console.log(`   unavailable_slots: ${unavailable.length} slot`);
            console.log(`   created_at: ${s.created_at}`);
            console.log(`   updated_at: ${s.updated_at}`);
            
            if (available.length > 0) {
                console.log(`\n   Slot disponibili: ${available.join(', ')}`);
            }
            if (unavailable.length > 0) {
                console.log(`   Slot NON disponibili: ${unavailable.join(', ')}`);
            }
        }
        
        // Check bookings
        const micheleBookings = await sql`
            SELECT time, status FROM bookings 
            WHERE barber_id = ${michele[0].id} AND date = ${date}
            ORDER BY time
        `;
        
        console.log(`\n   Prenotazioni: ${micheleBookings.length}`);
        if (micheleBookings.length > 0) {
            micheleBookings.forEach(b => {
                console.log(`      - ${b.time}: ${b.status}`);
            });
        }
        
        // Test API
        console.log('\n' + '='.repeat(80));
        console.log('🌐 TEST API BATCH-AVAILABILITY:');
        console.log('='.repeat(80));
        
        console.log('\nFabio:');
        const fabioApi = await fetch('https://www.maskiobarberconcept.it/api/bookings/batch-availability', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                barberId: fabio[0].id,
                dates: [date]
            })
        });
        const fabioResult = await fabioApi.json();
        console.log(`   hasSlots: ${fabioResult.availability[date].hasSlots}`);
        console.log(`   availableCount: ${fabioResult.availability[date].availableCount}`);
        console.log(`   totalSlots: ${fabioResult.availability[date].totalSlots}`);
        
        console.log('\nMichele:');
        const micheleApi = await fetch('https://www.maskiobarberconcept.it/api/bookings/batch-availability', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                barberId: michele[0].id,
                dates: [date]
            })
        });
        const micheleResult = await micheleApi.json();
        console.log(`   hasSlots: ${micheleResult.availability[date].hasSlots}`);
        console.log(`   availableCount: ${micheleResult.availability[date].availableCount}`);
        console.log(`   totalSlots: ${micheleResult.availability[date].totalSlots}`);
        
        console.log('\n' + '='.repeat(80));
        console.log('🎯 DIAGNOSI:');
        console.log('='.repeat(80));
        
        if (fabioSchedule.length === 0) {
            console.log('\n❌ FABIO: Schedule non trovato - deve essere creato');
        } else if (fabioSchedule[0].day_off === true) {
            console.log('\n❌ FABIO: day_off=true invece di false');
        } else {
            const available = JSON.parse(fabioSchedule[0].available_slots || '[]');
            if (available.length < 15) {
                console.log(`\n❌ FABIO: Solo ${available.length} slot invece di 15`);
            } else {
                console.log('\n✅ FABIO: Schedule corretto nel database');
            }
        }
        
        if (micheleSchedule.length === 0) {
            console.log('❌ MICHELE: Schedule non trovato - deve essere creato');
        } else if (micheleSchedule[0].day_off === true) {
            console.log('❌ MICHELE: day_off=true invece di false');
        } else {
            const available = JSON.parse(micheleSchedule[0].available_slots || '[]');
            if (available.length < 15) {
                console.log(`❌ MICHELE: Solo ${available.length} slot invece di 15`);
            } else {
                console.log('✅ MICHELE: Schedule corretto nel database');
            }
        }
        
    } catch (error) {
        console.error('❌ ERRORE:', error);
        throw error;
    }
}

debugDec22()
    .then(() => {
        console.log('\n✅ Debug completato\n');
        process.exit(0);
    })
    .catch(error => {
        console.error('\n❌ Debug fallito:', error);
        process.exit(1);
    });
