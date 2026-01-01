import { NextRequest, NextResponse } from 'next/server';
import { DatabaseService } from '../../../../lib/database';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

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

    // Ottimizzazione: Query SQL aggregata invece di filtrare in memoria
    let barberCondition = '';
    let barberId = null;
    
    if (barberEmail) {
      const allBarbers = await DatabaseService.getBarbers();
      const barber = allBarbers.find(b => b.email === barberEmail);
      if (barber) {
        barberId = barber.id;
        barberCondition = `AND barber_id = '${barberId}'`;
        console.log(`🧔 Filtering for barber: ${barberEmail} (ID: ${barber.id})`);
      } else {
        console.warn(`⚠️ Barber not found: ${barberEmail}`);
        // Return empty stats
        return NextResponse.json({
          totalBookings: 0,
          todayBookings: 0,
          selectedDateBookings: 0,
          dailyRevenue: 0,
          selectedDate: targetDate
        });
      }
    }

    // Query aggregata per statistiche (molto più veloce)
    const baseQuery = `
      SELECT 
        COUNT(*) FILTER (WHERE status != 'cancelled') as total_bookings,
        COUNT(*) FILTER (WHERE date = '${todayStr}' AND status != 'cancelled') as today_bookings,
        COUNT(*) FILTER (WHERE date = '${targetDate}' AND status != 'cancelled') as selected_date_bookings,
        COALESCE(SUM(CASE WHEN date = '${targetDate}' AND status = 'confirmed' THEN price ELSE 0 END), 0) as daily_revenue
      FROM bookings
      WHERE date >= (CURRENT_DATE - INTERVAL '90 days')
      ${barberCondition}
    `;
    
    const statsQuery = await sql([baseQuery]);

    const result = statsQuery[0];

    console.log(`💰 Revenue for ${targetDate}: €${result.daily_revenue} (${result.selected_date_bookings} bookings)`);

    const stats = {
      totalBookings: Number(result.total_bookings),
      todayBookings: Number(result.today_bookings),
      selectedDateBookings: Number(result.selected_date_bookings),
      dailyRevenue: Number(result.daily_revenue),
      selectedDate: targetDate
    };

    return NextResponse.json(stats, {
      headers: {
        'Cache-Control': 'private, max-age=60' // Cache 1 minuto
      }
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json(
      { error: 'Errore nel caricamento delle statistiche' },
      { status: 500 }
    );
  }
}
