import fetch from 'node-fetch';

async function testBookingsAPIFilters() {
  try {
    console.log('🧪 Testing bookings API with filters...\n');
    
    // Prima ottieni tutti i barbieri per sapere quali email usare
    console.log('📋 Getting all barbers first...');
    const barbersResponse = await fetch('http://localhost:3000/api/barbers');
    if (barbersResponse.ok) {
      const barbersData = await barbersResponse.json();
      console.log('Available barbers:');
      barbersData.forEach(barber => {
        console.log(`  - ${barber.name} (${barber.email}) - ID: ${barber.id}`);
      });
      console.log('');
    }
    
    // Test filtro status
    console.log('📡 Testing status filter (confirmed):');
    const statusResponse = await fetch('http://localhost:3000/api/bookings?status=confirmed');
    if (statusResponse.ok) {
      const statusData = await statusResponse.json();
      console.log(`✅ Confirmed bookings: ${statusData.bookings.length}`);
    } else {
      console.log(`❌ Status filter error: ${statusResponse.status}`);
    }
    
    // Test filtro date + status
    console.log('📡 Testing date + status filter:');
    const dateStatusResponse = await fetch('http://localhost:3000/api/bookings?date=2025-06-18&status=confirmed');
    if (dateStatusResponse.ok) {
      const dateStatusData = await dateStatusResponse.json();
      console.log(`✅ June 18 confirmed bookings: ${dateStatusData.bookings.length}`);
      if (dateStatusData.bookings.length > 0) {
        console.log('Sample booking:', {
          customer: dateStatusData.bookings[0].customer_name,
          barber: dateStatusData.bookings[0].barber_name,
          time: dateStatusData.bookings[0].booking_time
        });
      }
    } else {
      console.log(`❌ Date+Status filter error: ${dateStatusResponse.status}`);
    }
    
    // Test filtro barber email (se ci sono barbieri)
    if (barbersResponse.ok) {
      const barbersData = await barbersResponse.json();
      if (barbersData.length > 0) {
        const testBarberEmail = barbersData[0].email;
        console.log(`📡 Testing barber filter (${testBarberEmail}):`);
        
        const barberResponse = await fetch(`http://localhost:3000/api/bookings?barberEmail=${encodeURIComponent(testBarberEmail)}`);
        if (barberResponse.ok) {
          const barberData = await barberResponse.json();
          console.log(`✅ Bookings for ${testBarberEmail}: ${barberData.bookings.length}`);
        } else {
          console.log(`❌ Barber filter error: ${barberResponse.status}`);
        }
      }
    }
    
    console.log('\n🎉 API filter testing completed!');
    
  } catch (error) {
    console.error('❌ Error testing API filters:', error);
  }
}

// Run the test
testBookingsAPIFilters();
