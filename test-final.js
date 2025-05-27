// Test script per verificare la generazione corretta degli slot temporali
console.log('=== Test Time Slots Generation ===\n');

// Simulazione della funzione generateTimeSlots
function generateTimeSlots(date) {
  const slots = [];
  const dayOfWeek = date.getDay();
  
  // Domenica chiuso
  if (dayOfWeek === 0) {
    return slots;
  }

  console.log(`Testing slots for ${date.toDateString()}`);

  // Slot mattina: 9:00-12:30 (incluso 12:30)
  console.log('\nMorning slots:');
  for (let hour = 9; hour <= 12; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      // Stop at 12:30 for the last morning slot
      if (hour === 12 && minute > 30) break;
      const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      slots.push(timeString);
      console.log(`  ${timeString}`);
    }
  }
  
  // Slot pomeriggio: 15:00-17:30 (incluso 17:30)
  console.log('\nAfternoon slots:');
  for (let hour = 15; hour <= 17; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      // Stop at 17:30 for the last afternoon slot
      if (hour === 17 && minute > 30) break;
      const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      slots.push(timeString);
      console.log(`  ${timeString}`);
    }
  }
  
  return slots;
}

// Test con una data di lunedì
const testDate = new Date('2024-01-15'); // Monday
const slots = generateTimeSlots(testDate);

console.log(`\n=== SUMMARY ===`);
console.log(`Total slots generated: ${slots.length}`);
console.log(`Has 12:30: ${slots.includes('12:30') ? '✅' : '❌'}`);
console.log(`Has 17:30: ${slots.includes('17:30') ? '✅' : '❌'}`);
console.log(`All slots: ${slots.join(', ')}`);

// Test della funzione formatSelectedDate
console.log('\n=== Test Date Formatting ===');
function formatSelectedDate(dateString) {
  if (!dateString) return '';
  
  const [year, month, day] = dateString.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  
  const dayNames = ['Domenica', 'Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato'];
  const monthNames = ['Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno', 'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'];
  
  return `${dayNames[date.getUTCDay()]} ${date.getUTCDate()} ${monthNames[date.getUTCMonth()]}`;
}

// Test con alcune date
const testDates = ['2024-01-15', '2024-12-25', '2024-06-15'];
testDates.forEach(dateStr => {
  const formatted = formatSelectedDate(dateStr);
  console.log(`${dateStr} → ${formatted}`);
});

console.log('\n=== Test Complete ===');
