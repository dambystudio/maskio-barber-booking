import { NextResponse } from 'next/server';
import { DatabaseService } from '@/lib/database';

export async function GET() {
  try {
    const barbers = await DatabaseService.getBarbers();
    return NextResponse.json(barbers);
  } catch (error) {
    console.error('Error fetching barbers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch barbers' },
      { status: 500 }
    );
  }
}
