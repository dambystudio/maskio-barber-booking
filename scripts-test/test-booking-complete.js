// Test completo del sistema di prenotazione
const { BookingService } = require('./src/services/bookingService.ts');

async function testCompleteBooking() {
    console.log('🧪 Test del sistema di prenotazione completo...\n');
    
    // Test 1: Verifica che l'API degli slot funzioni
    console.log('1️⃣ Test API slots disponibili...');
    try {
        const response = await fetch('http://localhost:3003/api/bookings/slots?date=2025-05-26&barberId=1');
        const result = await response.json();
        
        if (response.ok) {
            console.log('✅ API slots funziona correttamente');
            console.log(`📅 Slots trovati per 2025-05-26: ${result.slots.length}`);
            
            // Verifica che 12:30 e 17:30 siano presenti
            const morningSlots = result.slots.filter(s => s.time.startsWith('12:'));
            const eveningSlots = result.slots.filter(s => s.time.startsWith('17:'));
            
            console.log(`🌅 Slots mattutini (12:xx): ${morningSlots.map(s => s.time).join(', ')}`);
            console.log(`🌆 Slots serali (17:xx): ${eveningSlots.map(s => s.time).join(', ')}`);
            
            const has1230 = result.slots.some(s => s.time === '12:30');
            const has1730 = result.slots.some(s => s.time === '17:30');
            
            if (has1230) console.log('✅ Slot 12:30 presente');
            else console.log('❌ Slot 12:30 mancante');
            
            if (has1730) console.log('✅ Slot 17:30 presente');
            else console.log('❌ Slot 17:30 mancante');
            
        } else {
            console.log('❌ Errore API slots:', result);
        }
    } catch (error) {
        console.log('❌ Errore nella chiamata API slots:', error.message);
    }
    
    console.log('\n' + '='.repeat(50) + '\n');
    
    // Test 2: Verifica che l'API di creazione prenotazione funzioni
    console.log('2️⃣ Test API creazione prenotazione...');
    
    const testBookingData = {
        barberId: 1,
        date: '2025-05-26',
        time: '10:00',
        services: [
            { id: 1, name: 'Taglio Classico', price: 25, duration: 30 }
        ],
        customerInfo: {
            name: 'Test Cliente',
            email: 'test@example.com',
            phone: '+39 123 456 7890'
        },
        totalPrice: 25,
        totalDuration: 30
    };
    
    try {
        const response = await fetch('http://localhost:3003/api/bookings', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(testBookingData)
        });
        
        const result = await response.json();
        
        if (response.ok) {
            console.log('✅ API creazione prenotazione funziona');
            console.log(`📋 Prenotazione creata con ID: ${result.booking.id}`);
            console.log(`📅 Data: ${result.booking.date}`);
            console.log(`🕐 Ora: ${result.booking.time}`);
            console.log(`👨‍💼 Barbiere: ${result.booking.barberId}`);
            console.log(`💰 Prezzo: €${result.booking.totalPrice}`);
        } else {
            console.log('❌ Errore creazione prenotazione:', result);
        }
    } catch (error) {
        console.log('❌ Errore nella chiamata API prenotazione:', error.message);
    }
    
    console.log('\n' + '='.repeat(50) + '\n');
    
    // Test 3: Verifica integrità database prenotazioni
    console.log('3️⃣ Test integrità database...');
    
    try {
        const fs = require('fs');
        const path = require('path');
        const bookingsPath = path.join(__dirname, 'data', 'bookings.json');
        
        if (fs.existsSync(bookingsPath)) {
            const bookingsData = JSON.parse(fs.readFileSync(bookingsPath, 'utf8'));
            console.log('✅ File database esistente');
            console.log(`📊 Prenotazioni totali: ${bookingsData.bookings.length}`);
            
            // Mostra le ultime 3 prenotazioni
            const recentBookings = bookingsData.bookings.slice(-3);
            console.log('\n📋 Ultime prenotazioni:');
            recentBookings.forEach((booking, index) => {
                console.log(`   ${index + 1}. ${booking.date} ${booking.time} - ${booking.customerInfo.name} (€${booking.totalPrice})`);
            });
        } else {
            console.log('❌ File database non trovato');
        }
    } catch (error) {
        console.log('❌ Errore lettura database:', error.message);
    }
    
    console.log('\n🎉 Test completato!');
}

testCompleteBooking().catch(console.error);
