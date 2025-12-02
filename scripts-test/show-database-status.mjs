// Script per visualizzare lo stato del database
import { db } from './src/lib/database-postgres.js';
import { users, bookings, closureSettings } from './src/lib/schema.js';
import { sql } from 'drizzle-orm';

async function showDatabaseStatus() {
  try {
    console.log('📊 MASKIO BARBER - Database Status');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    // Conta utenti per ruolo
    console.log('👥 UTENTI:');
    const userStats = await db
      .select({
        role: users.role,
        count: sql`count(*)`.as('count')
      })
      .from(users)
      .groupBy(users.role);

    let totalUsers = 0;
    userStats.forEach(stat => {
      const role = stat.role || 'user';
      const count = parseInt(stat.count);
      console.log(`   ${role.toUpperCase()}: ${count}`);
      totalUsers += count;
    });
    console.log(`   TOTALE: ${totalUsers}`);

    // Mostra gli ultimi 5 utenti registrati
    if (totalUsers > 0) {
      console.log('\n📝 Ultimi utenti registrati:');
      const recentUsers = await db
        .select({
          name: users.name,
          email: users.email,
          role: users.role,
          createdAt: users.createdAt
        })
        .from(users)
        .orderBy(sql`${users.createdAt} DESC`)
        .limit(5);

      recentUsers.forEach(user => {
        const role = (user.role || 'user').toUpperCase();
        const date = user.createdAt?.toLocaleDateString('it-IT') || 'N/A';
        console.log(`   • ${user.name} (${user.email}) - ${role} - ${date}`);
      });
    }

    console.log('\n📅 PRENOTAZIONI:');
    
    // Conta prenotazioni per stato
    const bookingStats = await db
      .select({
        status: bookings.status,
        count: sql`count(*)`.as('count')
      })
      .from(bookings)
      .groupBy(bookings.status);

    let totalBookings = 0;
    if (bookingStats.length > 0) {
      bookingStats.forEach(stat => {
        const status = stat.status || 'confirmed';
        const count = parseInt(stat.count);
        console.log(`   ${status.toUpperCase()}: ${count}`);
        totalBookings += count;
      });
    } else {
      console.log('   Nessuna prenotazione trovata');
    }
    console.log(`   TOTALE: ${totalBookings}`);

    // Mostra le prossime prenotazioni
    if (totalBookings > 0) {
      console.log('\n🔮 Prossime prenotazioni:');
      const upcomingBookings = await db
        .select({
          customerName: bookings.customerName,
          serviceName: bookings.serviceName,
          barberName: bookings.barberName,
          bookingDate: bookings.bookingDate,
          bookingTime: bookings.bookingTime,
          status: bookings.status
        })
        .from(bookings)
        .where(sql`${bookings.bookingDate} >= CURRENT_DATE`)
        .orderBy(bookings.bookingDate, bookings.bookingTime)
        .limit(5);

      if (upcomingBookings.length > 0) {
        upcomingBookings.forEach(booking => {
          const date = booking.bookingDate ? new Date(booking.bookingDate).toLocaleDateString('it-IT') : 'N/A';
          console.log(`   • ${booking.customerName} - ${booking.serviceName} - ${date} ${booking.bookingTime} (${booking.status})`);
        });
      } else {
        console.log('   Nessuna prenotazione futura trovata');
      }
    }

    // Verifica impostazioni chiusure
    console.log('\n🔒 IMPOSTAZIONI CHIUSURE:');
    const closures = await db
      .select()
      .from(closureSettings)
      .where(sql`${closureSettings.id} = 'shop_closures'`)
      .limit(1);

    if (closures.length > 0) {
      const settings = closures[0];
      const closedDays = JSON.parse(settings.closedDays);
      const closedDates = JSON.parse(settings.closedDates);
      
      const dayNames = ['Domenica', 'Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato'];
      const closedDayNames = closedDays.map(day => dayNames[day]).join(', ');
      
      console.log(`   Giorni chiusi: ${closedDayNames || 'Nessuno'}`);
      console.log(`   Date specifiche chiuse: ${closedDates.length} date`);
      
      if (closedDates.length > 0) {
        console.log('   📋 Date chiuse:');
        closedDates.slice(0, 5).forEach(date => {
          console.log(`      • ${new Date(date + 'T00:00:00').toLocaleDateString('it-IT')}`);
        });
        if (closedDates.length > 5) {
          console.log(`      ... e altre ${closedDates.length - 5} date`);
        }
      }
    } else {
      console.log('   ❌ Impostazioni chiusure non trovate');
    }

    console.log('\n🎯 RIEPILOGO:');
    console.log(`   • ${totalUsers} utenti totali`);
    console.log(`   • ${totalBookings} prenotazioni totali`);
    console.log(`   • Database ${totalUsers > 0 || totalBookings > 0 ? 'POPOLATO' : 'VUOTO'}`);
    
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  } catch (error) {
    console.error('❌ Errore nel leggere lo stato del database:', error);
    process.exit(1);
  }
}

// Esegui solo se chiamato direttamente
if (import.meta.url === `file://${process.argv[1]}`) {
  showDatabaseStatus();
}
