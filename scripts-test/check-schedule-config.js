const API_BASE = 'http://localhost:3007/api';

async function checkBarberSchedules() {
    console.log('🔍 Checking barber schedules configuration...\n');
    
    try {
        // Tentiamo di accedere direttamente al database per vedere la configurazione degli orari
        console.log('📊 This requires direct database access. Let me check the database configuration files...\n');
        
        // Per ora, controlliamo cosa restituisce l'API per capire la logica
        const response = await fetch(`${API_BASE}/bookings/slots?date=2025-05-28&barberId=fabio`);
        const slots = await response.json();
        
        console.log('🔍 Raw API response for Fabio 2025-05-28:');
        console.log(JSON.stringify(slots, null, 2));
        
    } catch (error) {
        console.error('❌ Error:', error);
    }
}

checkBarberSchedules().catch(console.error);
