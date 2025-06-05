import { neon } from "@neondatabase/serverless";

const DATABASE_URL = process.env.DATABASE_URL || "postgres://neondb_owner:npg_Wj09qDUmTsxE@ep-old-forest-a2ur722g-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require";
const sql = neon(DATABASE_URL);

async function fixBarberSpecialties() {
    console.log(" Fixing barber specialties formatting...");
    
    try {
        // Update both barbers with properly formatted specialties
        const correctSpecialties = ["Tagli moderni", "Tagli classici", "Barba"];
        
        await sql`
            UPDATE barbers 
            SET specialties = ${JSON.stringify(correctSpecialties)}
            WHERE id IN ('fabio', 'michele')
        `;
        
        console.log(" Updated barber specialties");
        
        // Verify the update
        const barbers = await sql`
            SELECT id, name, specialties 
            FROM barbers 
            ORDER BY id
        `;
        
        console.log(" Updated barbers:");
        barbers.forEach(barber => {
            console.log(`  - ${barber.name}: ${barber.specialties}`);
        });
        
    } catch (error) {
        console.error(" Error fixing specialties:", error);
    }
}

fixBarberSpecialties();