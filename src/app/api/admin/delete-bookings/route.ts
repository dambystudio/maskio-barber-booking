import { NextRequest, NextResponse } from 'next/server';
import { DatabaseService } from '../../../../lib/database-postgres';

export async function DELETE() {
  try {
    console.log('Deleting all bookings...');
    
    // Get all bookings first to count them
    const allBookings = await DatabaseService.getAllBookings();
    const count = allBookings.length;
    
    // Delete all bookings
    await DatabaseService.deleteAllBookings();
    
    console.log(`Deleted ${count} bookings successfully!`);
    
    return NextResponse.json({ 
      success: true, 
      message: `Successfully deleted ${count} bookings`,
      deletedCount: count
    });
  } catch (error) {
    console.error('Error deleting bookings:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete bookings' },
      { status: 500 }
    );
  }
}
