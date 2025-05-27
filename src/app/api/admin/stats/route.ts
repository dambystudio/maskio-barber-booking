import { NextRequest, NextResponse } from 'next/server';
import { DatabaseService } from '../../../../lib/database';

export async function GET(request: NextRequest) {
  try {
    // Get date ranges
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay()); // Start of week (Sunday)
    const weekStartStr = weekStart.toISOString().split('T')[0];
    
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthStartStr = monthStart.toISOString().split('T')[0];

    // Get today's bookings
    const todayBookings = await DatabaseService.getBookingsByDate(todayStr);
    
    // Get week's bookings
    const allBookings = await DatabaseService.getAllBookings();
    const weekBookings = allBookings.filter(booking => 
      booking.date >= weekStartStr && booking.date <= todayStr
    );
    
    // Get month's bookings
    const monthBookings = allBookings.filter(booking => 
      booking.date >= monthStartStr && booking.date <= todayStr
    );

    // Calculate revenue for all bookings
    const totalRevenue = allBookings.reduce((sum, booking) => 
      sum + (parseFloat(booking.price?.toString() || '0') || 0), 0
    );

    const stats = {
      totalBookings: allBookings.length, // Add totalBookings
      todayBookings: todayBookings.length,
      weekBookings: weekBookings.length,
      monthBookings: monthBookings.length,
      totalRevenue: totalRevenue
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
