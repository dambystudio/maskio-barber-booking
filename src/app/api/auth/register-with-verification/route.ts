import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // This endpoint is currently redirected to the main register endpoint
    // The verification functionality is handled elsewhere in the app
    return NextResponse.json(
      { 
        error: 'Endpoint temporaneamente disabilitato. Utilizzare /api/auth/register',
        redirect: '/api/auth/register'
      },
      { status: 501 }
    );
  } catch (error) {
    console.error('Error in register-with-verification:', error);
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    );
  }
}
