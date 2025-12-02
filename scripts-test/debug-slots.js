// Debug time slot generation
console.log('Testing time slot generation logic...');

// Morning slots: 9:00-12:30
console.log('\nMorning slots:');
for (let hour = 9; hour <= 12; hour++) {
  const maxMinute = hour === 12 ? 30 : 60;
  console.log(`Hour ${hour}, maxMinute: ${maxMinute}`);
  for (let minute = 0; minute <= maxMinute; minute += 30) {
    if (hour === 12 && minute > 30) {
      console.log(`  Breaking at ${hour}:${minute} (> 30)`);
      break;
    }
    const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    console.log(`  Generated: ${timeString}`);
  }
}

// Afternoon slots: 15:00-17:30
console.log('\nAfternoon slots:');
for (let hour = 15; hour <= 17; hour++) {
  const maxMinute = hour === 17 ? 30 : 60;
  console.log(`Hour ${hour}, maxMinute: ${maxMinute}`);
  for (let minute = 0; minute <= maxMinute; minute += 30) {
    if (hour === 17 && minute > 30) {
      console.log(`  Breaking at ${hour}:${minute} (> 30)`);
      break;
    }
    const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    console.log(`  Generated: ${timeString}`);
  }
}
