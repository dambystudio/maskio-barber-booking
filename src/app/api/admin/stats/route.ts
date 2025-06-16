import { NextRequest, NextResponse } from 'next/server';
import { DatabaseService } from '../../../../lib/database';

export async function GET(request: NextRequest) {
  try {
    // Get the date parameter from the URL, default to today
    const { searchParams } = new URL(request.url);
    const selectedDate = searchParams.get('date');
    const barberEmail = searchParams.get('barber'); // Filtro per email barbiere
    
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const targetDate = selectedDate || todayStr;

    console.log(`📊 Calculating stats for date: ${targetDate}${barberEmail ? ` (barber: ${barberEmail})` : ''}`);

    // Get all bookings
    let allBookings = await DatabaseService.getAllBookings();
    
    // Applica filtro barbiere se specificato
    if (barberEmail) {
      // Get all barbers and find by email
      const allBarbers = await DatabaseService.getBarbers();
      const barber = allBarbers.find(b => b.email === barberEmail);
      if (barber) {
        allBookings = allBookings.filter(booking => booking.barberId === barber.id);
        console.log(`🧔 Filtering for barber: ${barberEmail} (ID: ${barber.id}) - ${allBookings.length} bookings found`);
      } else {
        console.warn(`⚠️ Barber not found: ${barberEmail}`);
        // If barber not found, return empty stats
        allBookings = [];
      }
    }
    
    // Get selected date's bookings (non-cancelled)
    const selectedDateBookings = allBookings.filter(booking => 
      booking.date === targetDate && booking.status !== 'cancelled'
    );
    
    // Get today's bookings for comparison (non-cancelled)
    const todayBookings = allBookings.filter(booking => 
      booking.date === todayStr && booking.status !== 'cancelled'
    );
    
    // Calculate total bookings (non-cancelled)
    const totalBookings = allBookings.filter(booking => 
      booking.status !== 'cancelled'
    );
    
    // Calculate daily revenue for selected date (confirmed bookings only)
    const dailyRevenue = selectedDateBookings
      .filter(booking => booking.status === 'confirmed')
      .reduce((sum, booking) => 
        sum + (parseFloat(booking.price?.toString() || '0') || 0), 0
      );

    console.log(`💰 Revenue for ${targetDate}: €${dailyRevenue} (${selectedDateBookings.length} bookings)`);

    const stats = {
      totalBookings: totalBookings.length,
      todayBookings: todayBookings.length,
      selectedDateBookings: selectedDateBookings.length,
      dailyRevenue: dailyRevenue,
      selectedDate: targetDate
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json(
      { error: 'Errore nel caricamento delle statistiche' },
      { status: 500 }
    );
  }
}
