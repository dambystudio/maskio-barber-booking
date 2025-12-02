// Test per verificare la correzione del timezone
console.log("🧪 Test Correzione Timezone");
console.log("=============================");

// Simula la data "2025-06-09" (un lunedì)
const testDateString = "2025-06-09";
console.log(`\n📅 Test con data: ${testDateString}`);

// Formato frontend (BookingForm.tsx)
const [year, month, day] = testDateString.split('-').map(Number);
const frontendDate = new Date(Date.UTC(year, month - 1, day));

console.log(`\n🖥️ Frontend formatSelectedDate:`);
const dayNames = ['Domenica', 'Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato'];
const monthNames = ['Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno', 'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'];
const formattedDate = `${dayNames[frontendDate.getUTCDay()]} ${frontendDate.getUTCDate()} ${monthNames[frontendDate.getUTCMonth()]}`;
console.log(`   Risultato: ${formattedDate}`);
console.log(`   getUTCDay(): ${frontendDate.getUTCDay()} (1 = Lunedì ✅)`);

// Formato backend (API slots)
const [yearAPI, monthAPI, dayAPI] = testDateString.split('-').map(Number);
const backendDate = new Date(Date.UTC(yearAPI, monthAPI - 1, dayAPI));

console.log(`\n🔧 Backend generateTimeSlots:`);
console.log(`   getUTCDay(): ${backendDate.getUTCDay()} (1 = Lunedì ✅)`);
console.log(`   È domenica? ${backendDate.getUTCDay() === 0 ? 'Sì ❌' : 'No ✅'}`);

// Controlla formato dateString nel backend
const yearFormat = backendDate.getUTCFullYear();
const monthFormat = String(backendDate.getUTCMonth() + 1).padStart(2, '0');
const dayFormat = String(backendDate.getUTCDate()).padStart(2, '0');
const dateStringBackend = `${yearFormat}-${monthFormat}-${dayFormat}`;
console.log(`   dateString generato: ${dateStringBackend}`);
console.log(`   Corrisponde all'input? ${dateStringBackend === testDateString ? 'Sì ✅' : 'No ❌'}`);

// Test con una domenica
console.log(`\n🔴 Test con domenica: 2025-06-08`);
const sundayString = "2025-06-08";
const [ySun, mSun, dSun] = sundayString.split('-').map(Number);
const sundayDate = new Date(Date.UTC(ySun, mSun - 1, dSun));
console.log(`   getUTCDay(): ${sundayDate.getUTCDay()} (0 = Domenica ✅)`);
console.log(`   Sarà rifiutato? ${sundayDate.getUTCDay() === 0 ? 'Sì ✅' : 'No ❌'}`);

console.log(`\n✅ Test completato!`);
