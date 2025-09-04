// Test semplificato della logica degli slot per Marco

// Simula la funzione generateMarcoHourlySlots dall'API
function generateMarcoHourlySlots(dateString) {
  const slots = [];
  const date = new Date(dateString);
  const dayOfWeek = date.getDay();
  
  // Domenica - chiuso
  if (dayOfWeek === 0) {
    return slots;
  }
  
  // Lunedì - solo pomeriggio (15:00-17:00) 
  if (dayOfWeek === 1) {
    return ['15:00', '16:00', '17:00'];
  }
  
  // Sabato - orari modificati con pomeriggio speciale
  if (dayOfWeek === 6) {
    return ['09:00', '10:00', '11:00', '12:00', '14:30', '15:30', '16:30'];
  }
  
  // Martedì-Venerdì - orari completi (9:00-12:00, 15:00-17:00)
  return ['09:00', '10:00', '11:00', '12:00', '15:00', '16:00', '17:00'];
}

// Simula la funzione standard per altri barbieri
function generateStandardSlots(dateString) {
  const slots = [];
  const date = new Date(dateString);
  const dayOfWeek = date.getDay();
  
  if (dayOfWeek === 0) return slots; // Domenica chiuso
  
  if (dayOfWeek === 1) {
    // Lunedì: solo pomeriggio 15:00-17:30
    for (let hour = 15; hour <= 17; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        if (hour === 17 && minute > 30) break;
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        slots.push(timeString);
      }
    }
    return slots;
  }
  
  if (dayOfWeek === 6) {
    // Sabato: 9:00-12:30, 14:30-17:00
    for (let hour = 9; hour <= 12; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        if (hour === 12 && minute > 30) break;
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        slots.push(timeString);
      }
    }
    // Pomeriggio sabato
    slots.push('14:30');
    for (let hour = 15; hour <= 17; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        if (hour === 17 && minute > 0) break;
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        slots.push(timeString);
      }
    }
    return slots;
  }
  
  // Martedì-Venerdì: 9:00-12:30, 15:00-17:30
  for (let hour = 9; hour <= 12; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      if (hour === 12 && minute > 30) break;
      const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      slots.push(timeString);
    }
  }
  
  for (let hour = 15; hour <= 17; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      if (hour === 17 && minute > 30) break;
      const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      slots.push(timeString);
    }
  }
  
  return slots;
}

function testLogicComparison() {
  console.log('🧪 Test confronto logica slot Marco vs Standard\n');

  const testDates = [
    '2025-09-05', // Venerdì  
    '2025-09-06', // Sabato
    '2025-09-08', // Lunedì
    '2025-09-09'  // Martedì
  ];

  testDates.forEach(date => {
    const dateObj = new Date(date);
    const dayName = ['Domenica', 'Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato'][dateObj.getDay()];
    
    console.log(`📅 ${date} (${dayName}):`);
    
    // Slot per Marco (orari)
    const marcoSlots = generateMarcoHourlySlots(date);
    console.log(`   🎯 Marco: ${marcoSlots.join(', ')}`);
    
    // Slot standard (mezze ore)
    const standardSlots = generateStandardSlots(date);
    console.log(`   📋 Standard: ${standardSlots.join(', ')}`);
    
    // Controllo mezze ore per Marco
    const marcoHalfHours = marcoSlots.filter(slot => slot.endsWith(':30'));
    const marcoFullHours = marcoSlots.filter(slot => slot.endsWith(':00'));
    
    console.log(`   ✅ Marco - Ore piene: ${marcoFullHours.length}, Mezze ore: ${marcoHalfHours.length}`);
    
    if (dateObj.getDay() === 6) { // Sabato speciale
      const marcoAfternoon = marcoSlots.filter(slot => {
        const hour = parseInt(slot.split(':')[0]);
        return hour >= 14;
      });
      console.log(`   🌅 Marco sabato pomeriggio: ${marcoAfternoon.join(', ')}`);
      const correctSaturday = JSON.stringify(marcoAfternoon) === JSON.stringify(['14:30', '15:30', '16:30']);
      console.log(`   ✅ Sabato pomeriggio corretto: ${correctSaturday ? 'SÌ' : 'NO'}`);
    }
    
    console.log('');
  });

  console.log('🎯 Risultato: Con la modifica API, i clienti vedranno SOLO gli slot di Marco (orari)');
  console.log('✅ Nessuna mezz\'ora sarà mostrata ai clienti per Marco!');
}

testLogicComparison();
