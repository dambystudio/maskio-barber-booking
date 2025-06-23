import { neon } from '@neondatabase/serverless';
import 'dotenv/config';

const sql = neon(process.env.DATABASE_URL);

async function resetClosureDays() {
  try {
    console.log('🔄 Resetting closure days for all barbers...\n');
    
    // 1. Reset general shop closures (Giovedì=4, Domenica=0)
    console.log('1️⃣ Setting general shop closures: Thursday and Sunday');
    await sql`
      UPDATE closure_settings 
      SET 
        closed_days = '[4,0]',
        closed_dates = '[]',
        updated_at = NOW()
      WHERE id = 'shop_closures'
    `;
    
    // Check if the record exists, if not create it
    const existingSettings = await sql`
      SELECT * FROM closure_settings WHERE id = 'shop_closures'
    `;
    
    if (existingSettings.length === 0) {
      console.log('   📝 Creating new closure_settings record...');
      await sql`
        INSERT INTO closure_settings (id, closed_days, closed_dates, updated_at)
        VALUES ('shop_closures', '[4,0]', '[]', NOW())
      `;
    }
    
    console.log('   ✅ General shop closures set to Thursday and Sunday\n');
    
    // 2. Get all barbers
    const barbers = await sql`SELECT id, name, email FROM barbers`;
    console.log(`2️⃣ Found ${barbers.length} barbers to update:`);
    barbers.forEach(barber => {
      console.log(`   - ${barber.name} (${barber.id}) - ${barber.email}`);
    });
    console.log('');
    
    // 3. Clear existing recurring closures for all barbers
    console.log('3️⃣ Clearing existing barber recurring closures...');
    await sql`DELETE FROM barber_recurring_closures`;
    console.log('   ✅ Cleared all existing recurring closures\n');
    
    // 4. Set Thursday and Sunday closures for each barber
    console.log('4️⃣ Setting Thursday and Sunday closures for each barber...');
    
    for (const barber of barbers) {
      console.log(`   Setting closures for ${barber.name}:`);
      
      // Add closures for Thursday (4) and Sunday (0)
      await sql`
        INSERT INTO barber_recurring_closures (barber_email, closed_days, created_by, created_at, updated_at)
        VALUES (${barber.email}, '[4,0]', 'manual_reset', NOW(), NOW())
      `;
      console.log(`     ✅ Thursday and Sunday closures added`);
    }
    
    console.log('\n🎉 All closures have been reset successfully!\n');
    
    // 5. Verify the results
    console.log('5️⃣ Verification:');
    
    // Check general closures
    const generalClosures = await sql`
      SELECT * FROM closure_settings WHERE id = 'shop_closures'
    `;
    console.log('   General shop closures:', {
      closedDays: JSON.parse(generalClosures[0].closed_days),
      closedDates: JSON.parse(generalClosures[0].closed_dates)
    });
    
    // Check barber closures
    for (const barber of barbers) {
      const barberClosures = await sql`
        SELECT closed_days 
        FROM barber_recurring_closures 
        WHERE barber_email = ${barber.email}
      `;
      
      if (barberClosures.length > 0) {
        const closedDays = JSON.parse(barberClosures[0].closed_days);
        console.log(`   ${barber.name} closures:`, closedDays.map(day => 
          day === 0 ? 'Sunday' : day === 4 ? 'Thursday' : `Day ${day}`
        ));
      } else {
        console.log(`   ${barber.name}: No closures found`);
      }
    }
    
    console.log('\n✨ Reset completed! Both general shop and individual barber closures are now set to Thursday and Sunday.');
    
  } catch (error) {
    console.error('❌ Error resetting closure days:', error);
  }
}

resetClosureDays();
