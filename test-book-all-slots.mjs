import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function bookAllSlotsForDate(date) {
  console.log(`🔍 Prenotando tutti gli slot per il ${date}...`);
  
  try {
    // Trova tutti i barbieri
    const barbers = await prisma.barber.findMany({
      include: {
        specialties: {
          include: {
            service: true
          }
        }
      }
    });

    console.log(`👨‍💼 Trovati ${barbers.length} barbieri`);

    // Trova tutti i servizi
    const services = await prisma.service.findMany();
    console.log(`✂️ Trovati ${services.length} servizi`);

    // Per ogni barbiere, prenota tutti gli slot dalle 9:00 alle 18:00
    const timeSlots = [
      '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
      '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'
    ];

    let bookingCount = 0;

    for (const barber of barbers) {
      for (const timeSlot of timeSlots) {
        // Prendi il primo servizio disponibile per questo barbiere
        const service = barber.specialties[0]?.service || services[0];
        
        if (!service) continue;

        const bookingData = {
          customerName: `Test Cliente ${bookingCount + 1}`,
          customerEmail: `test${bookingCount + 1}@example.com`,
          customerPhone: `+39 320 000 ${String(bookingCount + 1).padStart(4, '0')}`,
          date: date,
          time: timeSlot,
          barberId: barber.id,
          serviceId: service.id,
          notes: `Prenotazione di test per slot ${timeSlot}`,
          status: 'confirmed'
        };

        try {
          // Controlla se esiste già una prenotazione per questo slot
          const existingBooking = await prisma.booking.findFirst({
            where: {
              date: date,
              time: timeSlot,
              barberId: barber.id,
              status: {
                not: 'cancelled'
              }
            }
          });

          if (existingBooking) {
            console.log(`⏭️  Slot ${timeSlot} con ${barber.name} già occupato`);
            continue;
          }

          const booking = await prisma.booking.create({
            data: bookingData
          });

          bookingCount++;
          console.log(`✅ Prenotazione creata: ${booking.customerName} - ${timeSlot} con ${barber.name}`);
          
        } catch (error) {
          console.log(`❌ Errore creando prenotazione per ${timeSlot}: ${error.message}`);
        }
      }
    }

    console.log(`\n🎉 Completato! Create ${bookingCount} prenotazioni per il ${date}`);

    // Verifica quanti slot sono ora occupati
    const totalBookings = await prisma.booking.count({
      where: {
        date: date,
        status: {
          not: 'cancelled'
        }
      }
    });

    console.log(`📊 Totale prenotazioni attive per il ${date}: ${totalBookings}`);

  } catch (error) {
    console.error('❌ Errore:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Prenota tutti gli slot per il 18 giugno 2025
const targetDate = '2025-06-18';
bookAllSlotsForDate(targetDate);
