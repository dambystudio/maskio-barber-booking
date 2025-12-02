const { DatabaseService } = require('./src/lib/database-postgres.ts');

async function createTestBooking() {
  try {
    console.log('🔧 Creating a test booking...');
    
    const bookingData = {
      userId: 'test-user-123',
      customerName: 'Mario Rossi',
      customerEmail: 'mario.rossi@email.com',
      customerPhone: '+39 333 1234567',
      barberId: 'fabio',
      barberName: 'Fabio',
      service: 'Taglio Uomo',
      price: 25,
      date: '2025-05-27',
      time: '10:00',
      duration: 30,
      status: 'confirmed',
      notes: 'Prenotazione di test per il pannello'
    };

    const newBooking = await DatabaseService.createBooking(bookingData);
    console.log('✅ Test booking created:', newBooking);

    // Create a few more test bookings
    const moreBookings = [
      {
        userId: 'test-user-124',
        customerName: 'Luigi Bianchi',
        customerEmail: 'luigi.bianchi@email.com',
        customerPhone: '+39 333 7654321',
        barberId: 'michele',
        barberName: 'Michele',
        service: 'Barba',
        price: 15,
        date: '2025-05-26', // Today
        time: '14:30',
        duration: 20,
        status: 'pending',
        notes: 'Da confermare'
      },
      {
        userId: 'test-user-125',
        customerName: 'Giuseppe Verdi',
        customerEmail: 'giuseppe.verdi@email.com',
        customerPhone: '+39 333 9876543',
        barberId: 'fabio',
        barberName: 'Fabio',
        service: 'Taglio + Barba',
        price: 35,
        date: '2025-05-26', // Today
        time: '16:00',
        duration: 45,
        status: 'confirmed',
        notes: 'Cliente abituale'
      }
    ];

    for (const booking of moreBookings) {
      const created = await DatabaseService.createBooking(booking);
      console.log(`✅ Created booking for ${booking.customerName}`);
    }

    console.log('\n🎉 All test bookings created successfully!');
    console.log('🔗 Check the panel at: http://localhost:3001/pannello-prenotazioni');
    
  } catch (error) {
    console.error('💥 Error creating test booking:', error);
  }
}

createTestBooking();
