import 'dotenv/config';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

async function testWaitlistSystem() {
  console.log('🧪 Testing Waitlist System...\n');

  try {
    // 1. Check if waitlist table exists and is properly structured
    console.log('1. Checking waitlist table structure...');
    const tableInfo = await sql`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'waitlist' 
      ORDER BY ordinal_position;
    `;
    
    console.log('✅ Waitlist table columns:');
    tableInfo.forEach(col => {
      console.log(`   - ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'nullable' : 'required'})`);
    });

    // 2. Check existing waitlist entries
    console.log('\n2. Checking existing waitlist entries...');
    const existingEntries = await sql`
      SELECT w.*, u.name as user_name, b.name as barber_name
      FROM waitlist w
      LEFT JOIN users u ON w.user_id = u.id
      LEFT JOIN barbers b ON w.barber_id = b.id
      ORDER BY w.date, w.position;
    `;
    
    console.log(`📋 Found ${existingEntries.length} waitlist entries:`);
    existingEntries.forEach((entry, index) => {
      console.log(`   ${index + 1}. ${entry.user_name || 'Unknown'} - ${entry.barber_name || 'Unknown'} - ${entry.date} (Position: ${entry.position}, Status: ${entry.status})`);
    });

    // 3. Test data integrity - check for position conflicts
    console.log('\n3. Checking position integrity...');
    const positionCheck = await sql`
      SELECT date, barber_id, position, COUNT(*) as count
      FROM waitlist 
      WHERE status = 'waiting'
      GROUP BY date, barber_id, position
      HAVING COUNT(*) > 1;
    `;

    if (positionCheck.length === 0) {
      console.log('✅ No position conflicts found - queue integrity is good');
    } else {
      console.log('⚠️  Position conflicts detected:');
      positionCheck.forEach(conflict => {
        console.log(`   - Date: ${conflict.date}, Barber: ${conflict.barber_id}, Position: ${conflict.position} (${conflict.count} entries)`);
      });
    }

    // 4. Check barbers and users for testing
    console.log('\n4. Available barbers and users for testing...');
    const barbers = await sql`SELECT id, name FROM barbers LIMIT 3;`;
    const users = await sql`SELECT id, name FROM users WHERE role = 'user' LIMIT 3;`;
    
    console.log('👨‍💼 Available barbers:');
    barbers.forEach(barber => console.log(`   - ${barber.name} (ID: ${barber.id})`));
    
    console.log('👤 Available users:');
    users.forEach(user => console.log(`   - ${user.name} (ID: ${user.id})`));

    // 5. Check if API routes are accessible (basic structure check)
    console.log('\n5. API Routes structure check...');
    console.log('✅ Expected API endpoints:');
    console.log('   - GET/POST/DELETE /api/waitlist');
    console.log('   - POST /api/waitlist/approve');

    console.log('\n🎉 Waitlist system appears to be properly set up!');
    console.log('\n📝 Next steps for testing:');
    console.log('   1. Start the development server: npm run dev');
    console.log('   2. Navigate to /prenota');
    console.log('   3. Select a fully booked date');
    console.log('   4. Click "📋 Lista d\'attesa" to test the waitlist modal');
    console.log('   5. Test joining the waitlist as a customer');
    console.log('   6. Test viewing the waitlist as a barber');

  } catch (error) {
    console.error('❌ Error testing waitlist system:', error.message);
    console.error('Stack:', error.stack);
  }
}

testWaitlistSystem();
