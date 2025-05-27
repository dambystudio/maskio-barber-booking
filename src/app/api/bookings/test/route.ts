import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const BOOKINGS_FILE = path.join(DATA_DIR, 'bookings.json');

export async function POST(request: NextRequest) {
  try {
    console.log('📝 Test API: Creating booking...');
    
    const requestData = await request.json();
    console.log('📋 Request data:', JSON.stringify(requestData, null, 2));

    // Read existing bookings
    let bookings = [];
    
    try {
      if (fs.existsSync(BOOKINGS_FILE)) {
        const data = fs.readFileSync(BOOKINGS_FILE, 'utf8');
        bookings = JSON.parse(data);
      }
    } catch (error) {
      console.log('📁 Creating new bookings file...');
      bookings = [];
    }

    // Create new booking
    const newBooking = {
      id: `booking_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      barberId: String(requestData.barberId),
      customerInfo: {
        name: requestData.customerInfo?.name || 'Test Cliente',
        email: requestData.customerInfo?.email || 'test@example.com',
        phone: requestData.customerInfo?.phone || '+39 123 456 7890',
        notes: requestData.customerInfo?.notes || '',
      },
      date: requestData.date,
      time: requestData.time,
      services: Array.isArray(requestData.services) ? requestData.services : [requestData.services],
      totalDuration: requestData.totalDuration || 30,
      totalPrice: requestData.totalPrice || 25,
      status: 'confirmed',
      createdAt: new Date().toISOString(),
    };

    // Validate data
    if (!newBooking.date || !newBooking.time || !newBooking.barberId) {
      return NextResponse.json(
        { error: 'Dati mancanti: data, ora o barbiere' },
        { status: 400 }
      );
    }

    // Check for conflicts
    const existingBooking = bookings.find(
      (booking: any) => 
        booking.date === newBooking.date && 
        booking.time === newBooking.time && 
        booking.barberId === newBooking.barberId &&
        booking.status !== 'cancelled'
    );

    if (existingBooking) {
      return NextResponse.json(
        { error: 'Questo slot non è più disponibile' },
        { status: 409 }
      );
    }

    // Add to bookings array
    bookings.push(newBooking);

    // Ensure data directory exists
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    // Write back to file
    fs.writeFileSync(BOOKINGS_FILE, JSON.stringify(bookings, null, 2));

    console.log('✅ Booking saved:', newBooking.id);

    return NextResponse.json({
      booking: newBooking,
      message: 'Prenotazione creata con successo!'
    }, { status: 201 });

  } catch (error) {
    console.error('❌ Error creating booking:', error);
    return NextResponse.json(
      { error: 'Errore nella creazione della prenotazione' },
      { status: 500 }
    );
  }
}
