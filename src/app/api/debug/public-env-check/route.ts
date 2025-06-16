import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Check delle variabili d'ambiente (senza dati sensibili)
    const adminEmails = process.env.ADMIN_EMAILS?.split(',').map(email => email.trim()) || [];
    const barberEmails = process.env.BARBER_EMAILS?.split(',').map(email => email.trim()) || [];
    
    // Test specifico per davide431@outlook.it
    const testEmail = 'davide431@outlook.it';
    const isDavideAdmin = adminEmails.includes(testEmail);
    const isDavideBarber = barberEmails.includes(testEmail);
    
    return NextResponse.json({
      success: true,
      config: {
        adminEmailsCount: adminEmails.length,
        barberEmailsCount: barberEmails.length,
        hasAdminEmails: !!process.env.ADMIN_EMAILS,
        hasBarberEmails: !!process.env.BARBER_EMAILS,
        testResults: {
          email: testEmail,
          isAdmin: isDavideAdmin,
          isBarber: isDavideBarber,
          hasManagementAccess: isDavideAdmin || isDavideBarber
        }
      },
      // Solo per debug, senza mostrare le email complete
      debugInfo: {
        adminEmailsPresent: adminEmails.length > 0,
        firstAdminEmailPrefix: adminEmails[0]?.substring(0, 5) + '...',
        barberEmailsPresent: barberEmails.length > 0,
        envVarsSet: {
          ADMIN_EMAILS: !!process.env.ADMIN_EMAILS,
          BARBER_EMAILS: !!process.env.BARBER_EMAILS,
          NEXTAUTH_SECRET: !!process.env.NEXTAUTH_SECRET,
          DATABASE_URL: !!process.env.DATABASE_URL
        }
      }
    });
  } catch (error) {
    console.error('Error in public-env-check:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
