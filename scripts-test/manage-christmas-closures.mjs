/**
 * Gestione chiusure natalizie - Dicembre 2025 / Gennaio 2026
 */

import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

async function manageChristmasClosures() {
    console.log('🎄 GESTIONE CHIUSURE NATALIZIE\n');
    
    const barbers = [
        { email: 'michelebiancofiore0230@gmail.com', name: 'Michele' },
        { email: 'fabio.cassano97@icloud.com', name: 'Fabio' },
        { email: 'giorgiodesa00@gmail.com', name: 'Nicolò' }
    ];
    
    // Configurazione chiusure
    const closureConfig = [
        // 22-23-24 dicembre: solo mattina aperti (chiusura AFTERNOON)
        { date: '2025-12-22', type: 'afternoon', reason: 'Chiusura pomeridiana pre-natale' },
        { date: '2025-12-23', type: 'afternoon', reason: 'Chiusura pomeridiana pre-natale' },
        { date: '2025-12-24', type: 'afternoon', reason: 'Chiusura pomeridiana Vigilia di Natale' },
        
        // 25-26 dicembre: chiusi (già dovrebbero esserci, verifico)
        { date: '2025-12-25', type: 'full', reason: 'Natale', check: true },
        { date: '2025-12-26', type: 'full', reason: 'Santo Stefano', check: true },
        
        // 27-29-30 dicembre: aperti tutto il giorno (rimuovere chiusure se presenti)
        { date: '2025-12-27', type: null, reason: 'Apertura normale' },
        { date: '2025-12-29', type: null, reason: 'Apertura normale' },
        { date: '2025-12-30', type: null, reason: 'Apertura normale' },
        
        // 31 dicembre: solo mattina aperti (chiusura AFTERNOON)
        { date: '2025-12-31', type: 'afternoon', reason: 'Chiusura pomeridiana San Silvestro' },
        
        // 1 gennaio: chiuso (già dovrebbe esserci, verifico)
        { date: '2026-01-01', type: 'full', reason: 'Capodanno', check: true },
        
        // 5 gennaio: aperti tutto il giorno (rimuovere chiusure se presenti)
        { date: '2026-01-05', type: null, reason: 'Apertura normale' },
        
        // 6 gennaio: chiusi (FULL)
        { date: '2026-01-06', type: 'full', reason: 'Epifania' }
    ];
    
    try {
        console.log('📋 PIANO CHIUSURE:');
        console.log('===================\n');
        
        for (const config of closureConfig) {
            if (config.type === null) {
                console.log(`${config.date}: ✅ APERTI tutto il giorno (rimuovere chiusure)`);
            } else if (config.check) {
                console.log(`${config.date}: 🔍 Verificare chiusura ${config.type.toUpperCase()}`);
            } else {
                console.log(`${config.date}: 🔒 Chiusura ${config.type.toUpperCase()} - ${config.reason}`);
            }
        }
        
        console.log('\n\n🔄 APPLICAZIONE MODIFICHE...\n');
        
        for (const barber of barbers) {
            console.log(`\n📧 ${barber.name} (${barber.email})`);
            console.log('─'.repeat(60));
            
            for (const config of closureConfig) {
                // Verifica chiusure esistenti per questa data
                const existingClosures = await sql`
                    SELECT id, closure_type, created_by, reason
                    FROM barber_closures
                    WHERE barber_email = ${barber.email}
                    AND closure_date = ${config.date}
                `;
                
                if (config.type === null) {
                    // Apertura normale - rimuovere TUTTE le chiusure eccetto automatiche lunedì
                    if (existingClosures.length > 0) {
                        // Controlla se è lunedì
                        const dateObj = new Date(config.date + 'T12:00:00');
                        const isMonday = dateObj.getDay() === 1;
                        
                        for (const closure of existingClosures) {
                            // Non eliminare chiusure automatiche lunedì per Michele/Fabio
                            if (isMonday && closure.created_by === 'system-auto') {
                                console.log(`   ℹ️  ${config.date}: Mantenuta chiusura automatica lunedì (${closure.closure_type})`);
                                continue;
                            }
                            
                            await sql`
                                DELETE FROM barber_closures
                                WHERE id = ${closure.id}
                            `;
                            console.log(`   ✅ ${config.date}: Rimossa chiusura ${closure.closure_type} (${closure.created_by})`);
                        }
                    } else {
                        console.log(`   ✅ ${config.date}: Nessuna chiusura da rimuovere`);
                    }
                    
                } else {
                    // Chiusura richiesta - creare o verificare
                    const alreadyHasClosure = existingClosures.find(c => c.closure_type === config.type);
                    
                    if (alreadyHasClosure) {
                        console.log(`   ✅ ${config.date}: Chiusura ${config.type} già presente (${alreadyHasClosure.created_by})`);
                    } else {
                        // Rimuovere chiusure di tipo diverso
                        for (const closure of existingClosures) {
                            await sql`
                                DELETE FROM barber_closures
                                WHERE id = ${closure.id}
                            `;
                            console.log(`   🗑️  ${config.date}: Rimossa chiusura ${closure.closure_type} (sostituita)`);
                        }
                        
                        // Creare nuova chiusura
                        await sql`
                            INSERT INTO barber_closures (
                                barber_email,
                                closure_date,
                                closure_type,
                                reason,
                                created_by
                            ) VALUES (
                                ${barber.email},
                                ${config.date},
                                ${config.type},
                                ${config.reason},
                                'admin'
                            )
                        `;
                        console.log(`   ✅ ${config.date}: Creata chiusura ${config.type.toUpperCase()}`);
                    }
                }
            }
        }
        
        console.log('\n\n🔄 AGGIORNAMENTO SCHEDULES...\n');
        
        // Aggiorna gli schedules per riflettere le chiusure
        for (const config of closureConfig) {
            const schedules = await sql`
                SELECT bs.id, bs.barber_id, bs.available_slots, b.email, b.name
                FROM barber_schedules bs
                JOIN barbers b ON bs.barber_id = b.id
                WHERE bs.date = ${config.date}
            `;
            
            for (const schedule of schedules) {
                const slots = JSON.parse(schedule.available_slots);
                let newSlots = slots;
                
                if (config.type === 'afternoon') {
                    // Solo mattina - slot 09:00-12:30
                    newSlots = slots.filter(slot => {
                        const hour = parseInt(slot.split(':')[0]);
                        return hour < 14;
                    });
                } else if (config.type === 'full') {
                    // Chiuso tutto il giorno
                    newSlots = [];
                } else if (config.type === null) {
                    // Apertura normale - ripristina slot completi (dipende dal giorno della settimana)
                    const dateObj = new Date(config.date + 'T12:00:00');
                    const dayOfWeek = dateObj.getDay();
                    
                    if (dayOfWeek === 1) {
                        // Lunedì: 15 slot (09:00-18:00)
                        newSlots = ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', 
                                    '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00'];
                    } else if (dayOfWeek >= 2 && dayOfWeek <= 5) {
                        // Mar-Ven: 14 slot (09:00-17:30)
                        newSlots = ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30',
                                    '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'];
                    } else if (dayOfWeek === 6) {
                        // Sabato: 14 slot (09:00-17:00)
                        newSlots = ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30',
                                    '14:30', '15:00', '15:30', '16:00', '16:30', '17:00'];
                    }
                }
                
                if (JSON.stringify(newSlots) !== JSON.stringify(slots)) {
                    await sql`
                        UPDATE barber_schedules
                        SET available_slots = ${JSON.stringify(newSlots)},
                            day_off = ${newSlots.length === 0}
                        WHERE id = ${schedule.id}
                    `;
                    console.log(`✅ ${schedule.name} ${config.date}: ${slots.length} → ${newSlots.length} slots`);
                }
            }
        }
        
        console.log('\n\n📊 RIEPILOGO FINALE:');
        console.log('===================\n');
        
        for (const config of closureConfig) {
            const closures = await sql`
                SELECT COUNT(*) as count, closure_type
                FROM barber_closures
                WHERE closure_date = ${config.date}
                GROUP BY closure_type
            `;
            
            let status = '';
            if (config.type === null) {
                status = closures.length === 0 ? '✅ Aperti' : `⚠️ Chiusure: ${closures.map(c => `${c.count}x${c.closure_type}`).join(', ')}`;
            } else {
                const hasClosure = closures.find(c => c.closure_type === config.type);
                status = hasClosure ? `✅ ${hasClosure.count} chiusure ${config.type}` : '❌ Chiusura mancante';
            }
            
            console.log(`${config.date}: ${status}`);
        }
        
        console.log('\n\n🎉 COMPLETATO!');
        
    } catch (error) {
        console.error('❌ Errore:', error);
        throw error;
    }
}

manageChristmasClosures();
