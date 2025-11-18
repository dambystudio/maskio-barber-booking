import { 
  getUniversalSlots, 
  getAutoClosureType,
  isMorningSlot,
  isAfternoonSlot,
  filterSlotsByClosureType,
  getAutoClosureReason 
} from '../src/lib/universal-slots.js';

console.log('🧪 TEST SISTEMA SLOT UNIVERSALI\n');

// ============================================================
// TEST 1: Verifica slot universali per ogni giorno
// ============================================================
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
    console.log('  ❌ ERRORE: Domenica dovrebbe essere chiusa!');
  }
  if (day.num === 1 && !has18) {
    console.log('  ❌ ERRORE: Lunedì dovrebbe avere 18:00!');
  }
  if (day.num === 1 && slots.length !== 15) {
    console.log(`  ❌ ERRORE: Lunedì dovrebbe avere 15 slot, ha ${slots.length}!`);
  }
  if (day.num >= 2 && day.num <= 5 && slots.length !== 14) {
    console.log(`  ❌ ERRORE: ${day.name} dovrebbe avere 14 slot, ha ${slots.length}!`);
  }
  if (day.num === 6 && slots.length !== 14) {
    console.log(`  ❌ ERRORE: Sabato dovrebbe avere 14 slot, ha ${slots.length}!`);
  }
  if (day.num === 6 && lastSlot !== '17:00') {
    console.log(`  ❌ ERRORE: Sabato dovrebbe finire alle 17:00, finisce alle ${lastSlot}!`);
  }
}

// ============================================================
// TEST 2: Verifica chiusure automatiche
// ============================================================
console.log('\n\n2️⃣ TEST CHIUSURE AUTOMATICHE');
console.log('─'.repeat(60));

const barbers = [
  { email: 'fabio.cassano97@icloud.com', name: 'Fabio' },
  { email: 'michelebiancofiore0230@gmail.com', name: 'Michele' },
  { email: 'giorgiodesa00@gmail.com', name: 'Nicolò' }
];

for (const barber of barbers) {
  console.log(`\n👤 ${barber.name} (${barber.email}):`);
  
  for (const day of days) {
    if (day.num === 0) continue; // Skip Sunday
    
    const closureType = getAutoClosureType(barber.email, day.num);
    
    if (closureType) {
      const reason = getAutoClosureReason(barber.email, closureType);
      console.log(`  ${day.name}: 🔒 ${closureType.toUpperCase()} - "${reason}"`);
    } else {
      console.log(`  ${day.name}: ✅ Aperto (nessuna chiusura automatica)`);
    }
  }
}

// Verifica aspettative specifiche
console.log('\n📋 VERIFICA REGOLE SPECIFICHE:');

// Michele: solo lunedì mattina
const micheleMondayMorning = getAutoClosureType('michelebiancofiore0230@gmail.com', 1);
const micheleTuesdayMorning = getAutoClosureType('michelebiancofiore0230@gmail.com', 2);
console.log(`  Michele lunedì mattina: ${micheleMondayMorning === 'morning' ? '✅' : '❌'} (${micheleMondayMorning})`);
console.log(`  Michele martedì: ${micheleTuesdayMorning === null ? '✅' : '❌'} (nessuna chiusura)`);

// Fabio: solo lunedì completo
const fabioMondayFull = getAutoClosureType('fabio.cassano97@icloud.com', 1);
const fabioTuesdayFull = getAutoClosureType('fabio.cassano97@icloud.com', 2);
console.log(`  Fabio lunedì completo: ${fabioMondayFull === 'full' ? '✅' : '❌'} (${fabioMondayFull})`);
console.log(`  Fabio martedì: ${fabioTuesdayFull === null ? '✅' : '❌'} (nessuna chiusura)`);

// Nicolò: mattina tutti i giorni (1-6)
const nicoloMondayMorning = getAutoClosureType('giorgiodesa00@gmail.com', 1);
const nicoloTuesdayMorning = getAutoClosureType('giorgiodesa00@gmail.com', 2);
const nicoloSaturdayMorning = getAutoClosureType('giorgiodesa00@gmail.com', 6);
const nicoloSunday = getAutoClosureType('giorgiodesa00@gmail.com', 0);
console.log(`  Nicolò lunedì mattina: ${nicoloMondayMorning === 'morning' ? '✅' : '❌'} (${nicoloMondayMorning})`);
console.log(`  Nicolò martedì mattina: ${nicoloTuesdayMorning === 'morning' ? '✅' : '❌'} (${nicoloTuesdayMorning})`);
console.log(`  Nicolò sabato mattina: ${nicoloSaturdayMorning === 'morning' ? '✅' : '❌'} (${nicoloSaturdayMorning})`);
console.log(`  Nicolò domenica: ${nicoloSunday === null ? '✅' : '❌'} (nessuna chiusura, già chiuso)`);

// ============================================================
// TEST 3: Filtro slot in base a chiusure
// ============================================================
console.log('\n\n3️⃣ TEST FILTRO SLOT PER TIPO CHIUSURA');
console.log('─'.repeat(60));

const mondaySlots = getUniversalSlots(1);
console.log(`\nSlot lunedì base: ${mondaySlots.length} slot`);
console.log(`Primo: ${mondaySlots[0]}, Ultimo: ${mondaySlots[mondaySlots.length - 1]}`);

// Test chiusura mattina
const mondayAfternoonOnly = filterSlotsByClosureType(mondaySlots, 'morning');
console.log(`\n🌅 Con chiusura MORNING:`);
console.log(`  Slot rimanenti: ${mondayAfternoonOnly.length}`);
console.log(`  Range: ${mondayAfternoonOnly[0]} - ${mondayAfternoonOnly[mondayAfternoonOnly.length - 1]}`);
console.log(`  Tutti pomeriggio? ${mondayAfternoonOnly.every(s => isAfternoonSlot(s)) ? '✅' : '❌'}`);

// Test chiusura pomeriggio
const mondayMorningOnly = filterSlotsByClosureType(mondaySlots, 'afternoon');
console.log(`\n🌆 Con chiusura AFTERNOON:`);
console.log(`  Slot rimanenti: ${mondayMorningOnly.length}`);
console.log(`  Range: ${mondayMorningOnly[0]} - ${mondayMorningOnly[mondayMorningOnly.length - 1]}`);
console.log(`  Tutti mattina? ${mondayMorningOnly.every(s => isMorningSlot(s)) ? '✅' : '❌'}`);

// Test chiusura completa
const mondayClosed = filterSlotsByClosureType(mondaySlots, 'full');
console.log(`\n🔒 Con chiusura FULL:`);
console.log(`  Slot rimanenti: ${mondayClosed.length}`);
console.log(`  Corretto (0 slot)? ${mondayClosed.length === 0 ? '✅' : '❌'}`);

// ============================================================
// TEST 4: Simulazione slot per ogni barbiere dopo chiusure
// ============================================================
console.log('\n\n4️⃣ SIMULAZIONE SLOT EFFETTIVI PER BARBIERE');
console.log('─'.repeat(60));

for (const barber of barbers) {
  console.log(`\n👤 ${barber.name}:`);
  
  // Lunedì
  const mondayBase = getUniversalSlots(1);
  const mondayClosure = getAutoClosureType(barber.email, 1);
  const mondayFinal = filterSlotsByClosureType(mondayBase, mondayClosure);
  console.log(`  Lunedì: ${mondayBase.length} base → ${mondayFinal.length} dopo chiusura ${mondayClosure || 'none'}`);
  if (mondayFinal.length > 0) {
    console.log(`         Range: ${mondayFinal[0]} - ${mondayFinal[mondayFinal.length - 1]}`);
  } else {
    console.log(`         CHIUSO`);
  }
  
  // Martedì
  const tuesdayBase = getUniversalSlots(2);
  const tuesdayClosure = getAutoClosureType(barber.email, 2);
  const tuesdayFinal = filterSlotsByClosureType(tuesdayBase, tuesdayClosure);
  console.log(`  Martedì: ${tuesdayBase.length} base → ${tuesdayFinal.length} dopo chiusura ${tuesdayClosure || 'none'}`);
  if (tuesdayFinal.length > 0) {
    console.log(`          Range: ${tuesdayFinal[0]} - ${tuesdayFinal[tuesdayFinal.length - 1]}`);
  }
  
  // Sabato
  const saturdayBase = getUniversalSlots(6);
  const saturdayClosure = getAutoClosureType(barber.email, 6);
  const saturdayFinal = filterSlotsByClosureType(saturdayBase, saturdayClosure);
  console.log(`  Sabato: ${saturdayBase.length} base → ${saturdayFinal.length} dopo chiusura ${saturdayClosure || 'none'}`);
  if (saturdayFinal.length > 0) {
    console.log(`         Range: ${saturdayFinal[0]} - ${saturdayFinal[saturdayFinal.length - 1]}`);
  }
}

// ============================================================
// RIEPILOGO FINALE
// ============================================================
console.log('\n\n📊 RIEPILOGO FINALE');
console.log('─'.repeat(60));

console.log('\n✅ SLOT UNIVERSALI (uguali per tutti):');
console.log('  • Lunedì: 09:00-12:30 + 15:00-18:00 (15 slot)');
console.log('  • Mar-Ven: 09:00-12:30 + 15:00-17:30 (14 slot)');
console.log('  • Sabato: 09:00-12:30 + 14:30-17:00 (14 slot)');
console.log('  • Domenica: CHIUSO');

console.log('\n🔒 CHIUSURE AUTOMATICHE:');
console.log('  • Michele: Lunedì MATTINA');
console.log('  • Fabio: Lunedì COMPLETO');
console.log('  • Nicolò: MATTINA tutti i giorni (Lun-Sab)');

console.log('\n📅 SLOT EFFETTIVI DOPO CHIUSURE:');
console.log('  • Fabio lunedì: 0 slot (chiuso)');
console.log('  • Fabio mar-sab: 14 slot (completo)');
console.log('  • Michele lunedì: 7 slot (15:00-18:00)');
console.log('  • Michele mar-ven: 14 slot (completo)');
console.log('  • Michele sabato: 14 slot (completo)');
console.log('  • Nicolò lun-ven: 6-7 slot (solo pomeriggio)');
console.log('  • Nicolò sabato: 6 slot (solo pomeriggio)');

console.log('\n🎯 Test completati! Verifica che tutti i check siano ✅');
