import { config } from 'dotenv';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { eq, and, like, gte } from 'drizzle-orm';
import * as schema from '../lib/schema';

// Load env vars from .env.local or .env
config({ path: '.env.local' });
config();

async function main() {
    if (!process.env.DATABASE_URL) {
        console.error('❌ DATABASE_URL is not set in environment variables');
        process.exit(1);
    }

    const sql = neon(process.env.DATABASE_URL);
    const db = drizzle(sql, { schema });

    console.log('🔍 Searching for barber Nicolò...');

    // Find Nicolò by name
    const barbers = await db
        .select()
        .from(schema.barbers)
        .where(like(schema.barbers.name, '%Nicolò%'));

    if (barbers.length === 0) {
        console.error('❌ Nicolò not found in database!');
        process.exit(1);
    }

    const nicolo = barbers[0];
    console.log(`✅ Found: ${nicolo.name} (${nicolo.email})`);

    if (barbers.length > 1) {
        console.warn('⚠️  Warning: Multiple barbers matched. Using the first one found.');
    }

    const today = new Date().toISOString().split('T')[0];
    console.log(`🧹 Deleting "morning" closures from ${today} onwards...`);

    // Execute deletion using direct SQL condition if needed, or structured query
    // Note: closureDate is likely a string in YYYY-MM-DD format based on other files
    const deleted = await db.delete(schema.barberClosures)
        .where(and(
            eq(schema.barberClosures.barberEmail, nicolo.email!),
            eq(schema.barberClosures.closureType, 'morning'),
            gte(schema.barberClosures.closureDate, today)
        ))
        .returning();

    console.log(`✅ Success! Deleted ${deleted.length} closure records.`);
}

main()
    .then(() => process.exit(0))
    .catch((err) => {
        console.error('❌ Error executing script:', err);
        process.exit(1);
    });
