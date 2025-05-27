// Test the time slot generation logic
function generateTimeSlots(date) {
  const slots = [];
  const dayOfWeek = date.getDay();
  
  if (dayOfWeek === 0) {
    return slots;
  }

  // Slot mattina: 9:00-12:30 (incluso 12:30)
  for (let hour = 9; hour <= 12; hour++) {
    const maxMinute = hour === 12 ? 30 : 60;
    for (let minute = 0; minute <= maxMinute; minute += 30) {
      if (hour === 12 && minute > 30) break; // Evita 12:60
      const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      slots.push(timeString);
    }
  }
  
  // Slot pomeriggio: 15:00-17:30 (incluso 17:30)
  for (let hour = 15; hour <= 17; hour++) {
    const maxMinute = hour === 17 ? 30 : 60;
    for (let minute = 0; minute <= maxMinute; minute += 30) {
      if (hour === 17 && minute > 30) break; // Evita 17:60
      const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      slots.push(timeString);
    }
  }
  
  return slots;
}

const testDate = new Date('2024-01-15'); // Monday
const slots = generateTimeSlots(testDate);
console.log('Generated slots:', slots);
console.log('Total slots:', slots.length);
console.log('Has 12:30:', slots.includes('12:30'));
console.log('Has 17:30:', slots.includes('17:30'));
