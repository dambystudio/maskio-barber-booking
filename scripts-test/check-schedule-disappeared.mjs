import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function checkSchedule() {
    const testDate = '2025-10-30';
    const micheleEmail = 'michelebiancofiore0230@gmail.com';
    
    console.log('\n🔍 VERIFICA SCHEDULE 30 OTTOBRE');
    console.log('='.repeat(80));
    
    try {
        const michele = await sql`SELECT id FROM barbers WHERE email = ${micheleEmail}`;
        const barberId = michele[0].id;
        
        console.log(`\n📋 Barbiere: ${barberId}`);
        console.log(`📅 Data: ${testDate}`);
        
        // Check if schedule exists
        const schedules = await sql`
            SELECT * FROM barber_schedules 
            WHERE barber_id = ${barberId} AND date = ${testDate}
        `;
        
        console.log('\n' + '='.repeat(80));
        
        if (schedules.length === 0) {
            console.log('❌ SCHEDULE NON TROVATO!');
            console.log('\n🔍 Cerco schedule simili...\n');
            
            // Check for nearby dates
            const nearby = await sql`
                SELECT date, day_off, available_slots 
                FROM barber_schedules 
                WHERE barber_id = ${barberId} 
                AND date BETWEEN '2025-10-01' AND '2025-11-30'
                ORDER BY date
            `;
            
            if (nearby.length > 0) {
                console.log(`📅 Schedule trovati in ottobre/novembre (${nearby.length}):`);
                nearby.forEach(s => {
                    const slots = JSON.parse(s.available_slots || '[]');
                    console.log(`   ${s.date}: day_off=${s.day_off}, slots=${slots.length}`);
                });
            } else {
                console.log('   Nessun schedule trovato in ottobre/novembre');
            }
            
            // Check for any schedules for Michele
            const allSchedules = await sql`
                SELECT COUNT(*) as count FROM barber_schedules 
                WHERE barber_id = ${barberId}
            `;
            console.log(`\n📊 Totale schedule per Michele: ${allSchedules[0].count}`);
            
        } else {
            console.log('✅ SCHEDULE TROVATO!');
            const schedule = schedules[0];
            const availableSlots = JSON.parse(schedule.available_slots || '[]');
            const unavailableSlots = JSON.parse(schedule.unavailable_slots || '[]');
            
            console.log('\n📊 DETTAGLI:');
            console.log(`   ID: ${schedule.id}`);
            console.log(`   day_off: ${schedule.day_off}`);
            console.log(`   available_slots: ${availableSlots.length} slot`);
            console.log(`   unavailable_slots: ${unavailableSlots.length} slot`);
            console.log(`   created_at: ${schedule.created_at}`);
            console.log(`   updated_at: ${schedule.updated_at}`);
            
            if (availableSlots.length > 0) {
                console.log(`\n   Slot disponibili: ${availableSlots.join(', ')}`);
            }
        }
        
        console.log('\n' + '='.repeat(80));
        
        // Check exceptional_openings table
        console.log('\n🔍 VERIFICA EXCEPTIONAL_OPENINGS:');
        const exceptionalOpenings = await sql`
            SELECT * FROM exceptional_openings 
            WHERE barber_email = ${micheleEmail} 
            AND opening_date = ${testDate}
        `;
        
        if (exceptionalOpenings.length > 0) {
            console.log('✅ Apertura eccezionale trovata:');
            exceptionalOpenings.forEach(o => {
                console.log(`   ID: ${o.id}`);
                console.log(`   Tipo: ${o.opening_type}`);
                console.log(`   Motivo: ${o.reason || 'N/A'}`);
                console.log(`   Creata: ${o.created_at}`);
            });
        } else {
            console.log('❌ Nessuna apertura eccezionale trovata');
        }
        
    } catch (error) {
        console.error('❌ ERRORE:', error);
        throw error;
    }
}

checkSchedule()
    .then(() => {
        console.log('\n✅ Verifica completata\n');
        process.exit(0);
    })
    .catch(error => {
        console.error('\n❌ Verifica fallita:', error);
        process.exit(1);
    });
