import { NextRequest, NextResponse } from 'next/server';
import { DatabaseService } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const customerQuery = searchParams.get('customer');
    
    console.log('🔍 Search API called with query:', customerQuery);
    
    if (!customerQuery || customerQuery.trim().length < 2) {
      return NextResponse.json(
        { error: 'Query parameter "customer" must be at least 2 characters' },
        { status: 400 }
      );
    }

    // Search for bookings by customer name (case-insensitive, partial match)
    const bookings = await DatabaseService.searchBookingsByCustomer(customerQuery.trim());
    
    console.log('✅ Search found', bookings.length, 'bookings');
    
    return NextResponse.json({ 
      bookings,
      count: bookings.length 
    });
    
  } catch (error) {
    console.error('❌ Error searching bookings:', error);
    return NextResponse.json(
      { error: 'Failed to search bookings', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
