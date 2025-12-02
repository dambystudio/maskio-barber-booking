// Simple booking creation via API
const testBookingData = {
  customerInfo: {
    name: "Mario Rossi",
    email: "mario.rossi@email.com",
    phone: "+39 333 1234567"
  },
  barberId: "fabio",
  barberName: "Fabio",
  services: [{
    name: "Taglio Uomo",
    price: 25
  }],
  date: "2025-05-27",
  time: "10:00",
  totalPrice: 25,
  totalDuration: 30,
  notes: "Prenotazione di test"
};

fetch('http://localhost:3001/api/bookings', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(testBookingData)
})
.then(response => response.json())
.then(data => {
  console.log('✅ Booking created:', data);
})
.catch(error => {
  console.error('❌ Error:', error);
});

console.log('🚀 Sending test booking request...');
