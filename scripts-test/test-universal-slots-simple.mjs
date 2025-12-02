// Test inline del sistema slot universali (senza import TypeScript)

// ============================================================
// COPIA DELLE FUNZIONI DA universal-slots.ts
// ============================================================

function getUniversalSlots(dayOfWeek) {
  const slots = [];
  
  // Sunday (0) - Always closed
  if (dayOfWeek === 0) {
    return [];
  }
  
  // Monday (1): 09:00-12:30 + 15:00-18:00
  if (dayOfWeek === 1) {
    // Morning: 09:00-12:30 (8 slots)
    for (let hour = 9; hour <= 12; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
      if (hour < 12) slots.push(`${hour.toString().padStart(2, '0')}:30`);
    }
    slots.push('12:30');
    
    // Afternoon: 15:00-18:00 (7 slots)
    for (let hour = 15; hour <= 18; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
      if (hour < 18) slots.push(`${hour.toString().padStart(2, '0')}:30`);
    }
    
    return slots;
  }
  
  // Tuesday-Friday (2-5): 09:00-12:30 + 15:00-17:30
  if (dayOfWeek >= 2 && dayOfWeek <= 5) {
    // Morning: 09:00-12:30 (8 slots)
    for (let hour = 9; hour <= 12; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
      if (hour < 12) slots.push(`${hour.toString().padStart(2, '0')}:30`);
    }
    slots.push('12:30');
    
    // Afternoon: 15:00-17:30 (6 slots)
    for (let hour = 15; hour <= 17; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
      if (hour <= 17) slots.push(`${hour.toString().padStart(2, '0')}:30`);
    }
    
    return slots;
  }
  
  // Saturday (6): 09:00-12:30 + 14:30-17:00
  if (dayOfWeek === 6) {
    // Morning: 09:00-12:30 (8 slots)
    for (let hour = 9; hour <= 12; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
      if (hour < 12) slots.push(`${hour.toString().padStart(2, '0')}:30`);
    }
    slots.push('12:30');
    
    // Afternoon: 14:30-17:00 (6 slots, NO 17:30)
    slots.push('14:30');
    for (let hour = 15; hour <= 17; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
      if (hour < 17) slots.push(`${hour.toString().padStart(2, '0')}:30`);
    }
    
    return slots;
  }
  
  return [];
}

function isMorningSlot(timeSlot) {
  const hour = parseInt(timeSlot.split(':')[0]);
  return hour < 14;
}

function isAfternoonSlot(timeSlot) {
  const hour = parseInt(timeSlot.split(':')[0]);
  return hour >= 14;
}

function filterSlotsByClosureType(slots, closureType) {
  if (!closureType) return slots;
  
  if (closureType === 'full') return [];
  
  if (closureType === 'morning') {
    return slots.filter(slot => isAfternoonSlot(slot));
  }
  
  if (closureType === 'afternoon') {
    return slots.filter(slot => isMorningSlot(slot));
  }
  
  return slots;
}

function getAutoClosureType(barberEmail, dayOfWeek) {
  // Michele: morning closure on Monday
  if (barberEmail === 'michelebiancofiore0230@gmail.com' && dayOfWeek === 1) {
    return 'morning';
  }
  
  // Fabio: full closure on Monday
  if (barberEmail === 'fabio.cassano97@icloud.com' && dayOfWeek === 1) {
    return 'full';
  }
  
  // Nicolò: morning closure every day (Mon-Sat)
  if (barberEmail === 'giorgiodesa00@gmail.com' && dayOfWeek >= 1 && dayOfWeek <= 6) {
    return 'morning';
  }
  
  return null;
}

function getAutoClosureReason(barberEmail, closureType) {
  if (barberEmail === 'michelebiancofiore0230@gmail.com') {
    return 'Chiusura automatica - Solo pomeriggio il lunedì';
  }
  
  if (barberEmail === 'fabio.cassano97@icloud.com') {
    return 'Chiusura automatica - Riposo settimanale';
  }
  
  if (barberEmail === 'giorgiodesa00@gmail.com') {
    return 'Chiusura automatica - Solo appuntamenti pomeridiani';
  }
  
  return 'Chiusura automatica';
}

// ============================================================
// INIZIO TEST
// ============================================================

console.log('🧪 TEST SISTEMA SLOT UNIVERSALI\n');

// TEST 1: Slot per giorno
console.log('1️⃣ TEST SLOT UNIVERSALI PER GIORNO DELLA SETTIMANA');
console.log('─'.repeat(60));

const days = [
  { num: 0, name: 'Domenica' },
  { num: 1, name: 'Lunedì' },
  { num: 2, name: 'Martedì' },
  { num: 3, name: 'Mercoledì' },
  { num: 4, name: 'Giovedì' },
  { num: 5, name: 'Venerdì' },
  { num: 6, name: 'Sabato' }
];

let errors = [];

for (const day of days) {
  const slots = getUniversalSlots(day.num);
  const has18 = slots.includes('18:00');
  const lastSlot = slots.length > 0 ? slots[slots.length - 1] : 'CHIUSO';
  
  console.log(`\n${day.name} (${day.num}):`);
  console.log(`  Totale slot: ${slots.length}`);
  console.log(`  Ultimo slot: ${lastSlot}`);
  console.log(`  Ha 18:00: ${has18 ? '✅' : '❌'}`);
  
  if (slots.length > 0) {
    const morning = slots.filter(s => isMorningSlot(s));
    const afternoon = slots.filter(s => isAfternoonSlot(s));
    console.log(`  Mattina: ${morning.length} slot (${morning[0]} - ${morning[morning.length - 1]})`);
    console.log(`  Pomeriggio: ${afternoon.length} slot (${afternoon[0]} - ${afternoon[afternoon.length - 1]})`);
  }
  
  // Verifica aspettative
  if (day.num === 0 && slots.length !== 0) {
    errors.push('Domenica dovrebbe essere chiusa');
  }
  if (day.num === 1 && !has18) {
    errors.push('Lunedì dovrebbe avere 18:00');
  }
  if (day.num === 1 && slots.length !== 15) {
    errors.push(`Lunedì dovrebbe avere 15 slot, ha ${slots.length}`);
  }
  if (day.num >= 2 && day.num <= 5 && slots.length !== 14) {
    errors.push(`${day.name} dovrebbe avere 14 slot, ha ${slots.length}`);
  }
  if (day.num === 6 && slots.length !== 14) {
    errors.push(`Sabato dovrebbe avere 14 slot, ha ${slots.length}`);
  }
  if (day.num === 6 && lastSlot !== '17:00') {
    errors.push(`Sabato dovrebbe finire alle 17:00, finisce alle ${lastSlot}`);
  }
}

// TEST 2: Chiusure automatiche
console.log('\n\n2️⃣ TEST CHIUSURE AUTOMATICHE');
console.log('─'.repeat(60));

const barbers = [
  { email: 'fabio.cassano97@icloud.com', name: 'Fabio' },
  { email: 'michelebiancofiore0230@gmail.com', name: 'Michele' },
  { email: 'giorgiodesa00@gmail.com', name: 'Nicolò' }
];

for (const barber of barbers) {
  console.log(`\n👤 ${barber.name}:`);
  
  for (const day of days) {
    if (day.num === 0) continue;
    
    const closureType = getAutoClosureType(barber.email, day.num);
    
    if (closureType) {
      const reason = getAutoClosureReason(barber.email, closureType);
      console.log(`  ${day.name}: 🔒 ${closureType.toUpperCase()}`);
    } else {
      console.log(`  ${day.name}: ✅ Aperto`);
    }
  }
}

// Verifica regole specifiche
console.log('\n📋 VERIFICA REGOLE SPECIFICHE:');

const micheleMondayMorning = getAutoClosureType('michelebiancofiore0230@gmail.com', 1);
const micheleTuesdayMorning = getAutoClosureType('michelebiancofiore0230@gmail.com', 2);
console.log(`  Michele lunedì mattina: ${micheleMondayMorning === 'morning' ? '✅' : '❌'}`);
console.log(`  Michele martedì: ${micheleTuesdayMorning === null ? '✅ aperto' : '❌ chiuso'}`);

const fabioMondayFull = getAutoClosureType('fabio.cassano97@icloud.com', 1);
const fabioTuesdayFull = getAutoClosureType('fabio.cassano97@icloud.com', 2);
console.log(`  Fabio lunedì completo: ${fabioMondayFull === 'full' ? '✅' : '❌'}`);
console.log(`  Fabio martedì: ${fabioTuesdayFull === null ? '✅ aperto' : '❌ chiuso'}`);

const nicoloMondayMorning = getAutoClosureType('giorgiodesa00@gmail.com', 1);
const nicoloTuesdayMorning = getAutoClosureType('giorgiodesa00@gmail.com', 2);
const nicoloSaturdayMorning = getAutoClosureType('giorgiodesa00@gmail.com', 6);
const nicoloSunday = getAutoClosureType('giorgiodesa00@gmail.com', 0);
console.log(`  Nicolò lunedì mattina: ${nicoloMondayMorning === 'morning' ? '✅' : '❌'}`);
console.log(`  Nicolò martedì mattina: ${nicoloTuesdayMorning === 'morning' ? '✅' : '❌'}`);
console.log(`  Nicolò sabato mattina: ${nicoloSaturdayMorning === 'morning' ? '✅' : '❌'}`);
console.log(`  Nicolò domenica: ${nicoloSunday === null ? '✅ nessuna chiusura' : '❌'}`);

// TEST 3: Filtro slot
console.log('\n\n3️⃣ TEST FILTRO SLOT PER TIPO CHIUSURA');
console.log('─'.repeat(60));

const mondaySlots = getUniversalSlots(1);
console.log(`\nSlot lunedì base: ${mondaySlots.length} slot`);

const mondayAfternoonOnly = filterSlotsByClosureType(mondaySlots, 'morning');
console.log(`\n🌅 Con chiusura MORNING: ${mondayAfternoonOnly.length} slot`);
console.log(`  Range: ${mondayAfternoonOnly[0]} - ${mondayAfternoonOnly[mondayAfternoonOnly.length - 1]}`);
console.log(`  Tutti pomeriggio? ${mondayAfternoonOnly.every(s => isAfternoonSlot(s)) ? '✅' : '❌'}`);

const mondayMorningOnly = filterSlotsByClosureType(mondaySlots, 'afternoon');
console.log(`\n🌆 Con chiusura AFTERNOON: ${mondayMorningOnly.length} slot`);
console.log(`  Range: ${mondayMorningOnly[0]} - ${mondayMorningOnly[mondayMorningOnly.length - 1]}`);
console.log(`  Tutti mattina? ${mondayMorningOnly.every(s => isMorningSlot(s)) ? '✅' : '❌'}`);

const mondayClosed = filterSlotsByClosureType(mondaySlots, 'full');
console.log(`\n🔒 Con chiusura FULL: ${mondayClosed.length} slot`);
console.log(`  Corretto (0 slot)? ${mondayClosed.length === 0 ? '✅' : '❌'}`);

// TEST 4: Simulazione finale
console.log('\n\n4️⃣ SIMULAZIONE SLOT EFFETTIVI PER BARBIERE');
console.log('─'.repeat(60));

for (const barber of barbers) {
  console.log(`\n👤 ${barber.name}:`);
  
  // Lunedì
  const mondayBase = getUniversalSlots(1);
  const mondayClosure = getAutoClosureType(barber.email, 1);
  const mondayFinal = filterSlotsByClosureType(mondayBase, mondayClosure);
  console.log(`  Lunedì: ${mondayBase.length} → ${mondayFinal.length} slot (chiusura: ${mondayClosure || 'none'})`);
  if (mondayFinal.length > 0) {
    console.log(`         ${mondayFinal[0]} - ${mondayFinal[mondayFinal.length - 1]}`);
  }
  
  // Martedì
  const tuesdayBase = getUniversalSlots(2);
  const tuesdayClosure = getAutoClosureType(barber.email, 2);
  const tuesdayFinal = filterSlotsByClosureType(tuesdayBase, tuesdayClosure);
  console.log(`  Martedì: ${tuesdayBase.length} → ${tuesdayFinal.length} slot (chiusura: ${tuesdayClosure || 'none'})`);
  if (tuesdayFinal.length > 0) {
    console.log(`          ${tuesdayFinal[0]} - ${tuesdayFinal[tuesdayFinal.length - 1]}`);
  }
}

// RIEPILOGO
console.log('\n\n📊 RIEPILOGO TEST');
console.log('─'.repeat(60));

if (errors.length === 0) {
  console.log('✅ TUTTI I TEST PASSATI!');
} else {
  console.log(`❌ ${errors.length} ERRORI TROVATI:`);
  errors.forEach(err => console.log(`  - ${err}`));
}

console.log('\n🎯 Test completati!');
