// Test script to check barbers API with specialties
import { neon } from '@neondatabase/serverless';

const DATABASE_URL = process.env.DATABASE_URL || 'postgres://neondb_owner:npg_Wj09qDUmTsxE@ep-old-forest-a2ur722g-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require';
const sql = neon(DATABASE_URL);

async function checkBarbersWithSpecialties() {
    console.log('🔍 Checking barbers with specialties...');
    
    try {
        const barbers = await sql`
            SELECT id, name, specialties, is_active 
            FROM barbers 
            WHERE is_active = true
            ORDER BY name
        `;
        
        console.log('👨‍💼 Barbers with specialties:');
        barbers.forEach(barber => {
            console.log(`  - ID: ${barber.id}`);
            console.log(`    Name: ${barber.name}`);
            console.log(`    Specialties: ${barber.specialties}`);
            console.log(`    Active: ${barber.is_active}`);
            console.log('---');
        });
        
    } catch (error) {
        console.error('❌ Error checking barbers:', error);
    }
}

checkBarbersWithSpecialties();
