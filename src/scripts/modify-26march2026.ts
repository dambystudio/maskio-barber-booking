import { config } from 'dotenv';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { eq, and, like } from 'drizzle-orm';
import * as schema from '../lib/schema';

// Load env vars from .env.local or .env
config({ path: '.env.local' });
config();

const TARGET_DATE = '2026-03-26';

// Slot pomeridiani standard giovedì + 18:00 extra
const AFTERNOON_SLOTS = [
    '15:00', '15:30',
    '16:00', '16:30',
    '17:00', '17:30',
    '18:00'
];

async function main() {
    if (!process.env.DATABASE_URL) {
        console.error('❌ DATABASE_URL is not set in environment variables');
        process.exit(1);
    }

    const sql = neon(process.env.DATABASE_URL);
    const db = drizzle(sql, { schema });

    // ── 1. Trova Michele e Nicolò ──────────────────────────────────────────────
    console.log('🔍 Searching for barbers...');

    const allBarbers = await db.select().from(schema.barbers);
    const michele = allBarbers.find(b => b.name?.toLowerCase().includes('michele'));
    const nicolo  = allBarbers.find(b => b.name?.toLowerCase().includes('nicol'));

    if (!michele) { console.error('❌ Michele not found!'); process.exit(1); }
    if (!nicolo)  { console.error('❌ Nicolò not found!');  process.exit(1); }

    console.log(`✅ Michele: ${michele.name} (${michele.email}) [id: ${michele.id}]`);
    console.log(`✅ Nicolò:  ${nicolo.name}  (${nicolo.email})  [id: ${nicolo.id}]`);

    const barbers = [michele, nicolo];

    for (const barber of barbers) {
        const barberEmail = barber.email!;
        const barberId    = barber.id;
        const barberName  = barber.name;

        console.log(`\n──────────────────────────────────────────`);
        console.log(`👤 Processing: ${barberName}`);

        // ── 2. Inserisci chiusura "morning" per il 26/03/2026 ──────────────────
        // Prima controlla se esiste già
        const existing = await db
            .select()
            .from(schema.barberClosures)
            .where(and(
                eq(schema.barberClosures.barberEmail, barberEmail),
                eq(schema.barberClosures.closureDate, TARGET_DATE),
                eq(schema.barberClosures.closureType, 'morning')
            ));

        if (existing.length > 0) {
            console.log(`ℹ️  Morning closure already exists for ${barberName} on ${TARGET_DATE}`);
        } else {
            await db.insert(schema.barberClosures).values({
                barberEmail,
                closureDate: TARGET_DATE,
                closureType: 'morning',
                reason: 'Chiusura mattutina eccezionale 26/03/2026',
                createdBy: 'admin-script',
            });
            console.log(`✅ Morning closure inserted for ${barberName} on ${TARGET_DATE}`);
        }

        // ── 3. Crea/aggiorna barber_schedules per aggiungere 18:00 ─────────────
        // Gli slot disponibili saranno quelli pomeridiani + 18:00
        // Gli slot non disponibili: tutti quelli mattutini standard
        const morningSlots = [
            '09:00', '09:30', '10:00', '10:30',
            '11:00', '11:30', '12:00', '12:30'
        ];

        const existingSchedule = await db
            .select()
            .from(schema.barberSchedules)
            .where(and(
                eq(schema.barberSchedules.barberId, barberId),
                eq(schema.barberSchedules.date, TARGET_DATE)
            ));

        if (existingSchedule.length > 0) {
            // Aggiorna lo schedule esistente
            const currentAvailable: string[] = existingSchedule[0].availableSlots
                ? JSON.parse(existingSchedule[0].availableSlots)
                : [];
            const currentUnavailable: string[] = existingSchedule[0].unavailableSlots
                ? JSON.parse(existingSchedule[0].unavailableSlots)
                : [];

            // Aggiungi 18:00 agli disponibili se non c'è già
            const newAvailable = Array.from(new Set([...currentAvailable, ...AFTERNOON_SLOTS]));
            // Rimuovi 18:00 dagli unavailable nel caso ci fosse
            const newUnavailable = currentUnavailable.filter(s => !AFTERNOON_SLOTS.includes(s));

            await db
                .update(schema.barberSchedules)
                .set({
                    availableSlots: JSON.stringify(newAvailable),
                    unavailableSlots: JSON.stringify(newUnavailable),
                    dayOff: false,
                    updatedAt: new Date(),
                })
                .where(and(
                    eq(schema.barberSchedules.barberId, barberId),
                    eq(schema.barberSchedules.date, TARGET_DATE)
                ));
            console.log(`✅ Schedule updated for ${barberName} – available slots: ${newAvailable.join(', ')}`);
        } else {
            // Crea un nuovo schedule
            // Available = slot pomeridiani + 18:00
            // Unavailable = slot mattutini (così vengono considerati nelle "allPossibleSlots")
            await db.insert(schema.barberSchedules).values({
                barberId,
                date: TARGET_DATE,
                availableSlots: JSON.stringify(AFTERNOON_SLOTS),
                unavailableSlots: JSON.stringify(morningSlots),
                dayOff: false,
            });
            console.log(`✅ Schedule created for ${barberName} – available slots: ${AFTERNOON_SLOTS.join(', ')}`);
        }
    }

    console.log(`\n✅ Done! On ${TARGET_DATE}:`);
    console.log('   • Morning closed for both Michele and Nicolò');
    console.log('   • Afternoon slots: 15:00–17:30 + 18:00 available');
}

main()
    .then(() => process.exit(0))
    .catch((err) => {
        console.error('❌ Error executing script:', err);
        process.exit(1);
    });
