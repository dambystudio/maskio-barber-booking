import { Resend } from 'resend';
import { render } from '@react-email/render';
import { BookingConfirmationEmail } from '@/components/emails/BookingConfirmationEmail';
import BookingReminderEmail from '@/components/emails/BookingReminderEmail';
import AdminNotificationEmail from '@/components/emails/AdminNotificationEmail';

const resend = new Resend(process.env.RESEND_API_KEY || 'placeholder-key-for-build');

export interface BookingEmailData {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  barberName: string;
  service: string;
  date: string;
  time: string;
  price: number;
  bookingId: string;
}

export class EmailService {  private static FROM_EMAIL = 'Maskio Barber <fabio.cassano97@icloud.com>';
  private static ADMIN_EMAIL = 'fabio.cassano97@icloud.com';  // Send booking confirmation to customer
  static async sendBookingConfirmation(bookingData: BookingEmailData): Promise<boolean> {
    try {
      const emailHtml = BookingConfirmationEmail(bookingData);
      
      const { data, error } = await resend.emails.send({
        from: this.FROM_EMAIL,
        to: [bookingData.customerEmail],
        subject: `Conferma Prenotazione - ${bookingData.service}`,
        html: emailHtml,
        headers: {
          'X-Entity-Ref-ID': bookingData.bookingId,
        },
      });

      if (error) {
        console.error('Error sending confirmation email:', error);
        return false;
      }

      console.log('Confirmation email sent:', data);
      return true;
    } catch (error) {
      console.error('Error sending confirmation email:', error);
      return false;
    }
  }
  // Send booking reminder (1 day before)
  static async sendBookingReminder(bookingData: BookingEmailData): Promise<boolean> {
    try {
      const emailHtml = await render(BookingReminderEmail(bookingData));
      
      const { data, error } = await resend.emails.send({
        from: this.FROM_EMAIL,
        to: [bookingData.customerEmail],
        subject: `Promemoria Appuntamento - Domani ${bookingData.time}`,
        html: emailHtml,
        headers: {
          'X-Entity-Ref-ID': bookingData.bookingId,
        },
      });

      if (error) {
        console.error('Error sending reminder email:', error);
        return false;
      }

      console.log('Reminder email sent:', data);
      return true;
    } catch (error) {
      console.error('Error sending reminder email:', error);
      return false;
    }
  }
  // Send notification to admin about new booking
  static async sendAdminNotification(bookingData: BookingEmailData): Promise<boolean> {
    try {
      const emailHtml = await render(AdminNotificationEmail(bookingData));
      
      const { data, error } = await resend.emails.send({
        from: this.FROM_EMAIL,
        to: [this.ADMIN_EMAIL],
        subject: `Nuova Prenotazione - ${bookingData.customerName}`,
        html: emailHtml,
        headers: {
          'X-Entity-Ref-ID': bookingData.bookingId,
        },
      });

      if (error) {
        console.error('Error sending admin notification:', error);
        return false;
      }

      console.log('Admin notification sent:', data);
      return true;
    } catch (error) {
      console.error('Error sending admin notification:', error);
      return false;
    }
  }

  // Schedule reminder emails (to be called by cron job)
  static async scheduleReminders(): Promise<void> {
    try {
      // Get tomorrow's date
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = tomorrow.toISOString().split('T')[0];

      // Get all bookings for tomorrow
      const { DatabaseService } = await import('@/lib/database');
      const tomorrowBookings = await DatabaseService.getBookingsByDate(tomorrowStr);      // Send reminder for each confirmed booking
      for (const booking of tomorrowBookings) {
        if (booking.status === 'confirmed') {
          await this.sendBookingReminder({
            customerName: booking.customerName,
            customerEmail: booking.customerEmail,            customerPhone: booking.customerPhone,
            barberName: booking.barberName,
            service: booking.service,
            date: booking.date,
            time: booking.time,
            price: parseFloat(booking.price.toString()),
            bookingId: booking.id,
          });
          
          // Small delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      console.log(`Sent ${tomorrowBookings.length} reminder emails for ${tomorrowStr}`);
    } catch (error) {
      console.error('Error scheduling reminders:', error);
    }
  }

  // Send booking cancellation email
  static async sendBookingCancellation(bookingData: BookingEmailData): Promise<boolean> {
    try {
      const { data, error } = await resend.emails.send({
        from: this.FROM_EMAIL,
        to: [bookingData.customerEmail],
        subject: `Prenotazione Cancellata - ${bookingData.service}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #d32f2f;">Prenotazione Cancellata</h2>
            <p>Ciao ${bookingData.customerName},</p>
            <p>La tua prenotazione è stata cancellata:</p>
            
            <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin: 0 0 10px 0;">Dettagli Prenotazione</h3>
              <p><strong>Servizio:</strong> ${bookingData.service}</p>
              <p><strong>Barbiere:</strong> ${bookingData.barberName}</p>
              <p><strong>Data:</strong> ${bookingData.date}</p>
              <p><strong>Orario:</strong> ${bookingData.time}</p>
            </div>
            
            <p>Se hai domande, non esitare a contattarci.</p>
            <p>Grazie,<br>Team Maskio Barber</p>
          </div>
        `,
        headers: {
          'X-Entity-Ref-ID': bookingData.bookingId,
        },
      });

      if (error) {
        console.error('Error sending cancellation email:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error sending cancellation email:', error);
      return false;
    }
  }

  // Test email configuration
  static async testEmail(): Promise<boolean> {
    try {
      const { data, error } = await resend.emails.send({
        from: this.FROM_EMAIL,
        to: ['test@example.com'],
        subject: 'Test Email - Maskio Barber',
        html: '<h1>Email configuration working!</h1><p>Your email service is properly configured.</p>',
      });

      if (error) {
        console.error('Email test failed:', error);
        return false;
      }

      console.log('Test email sent successfully:', data);
      return true;
    } catch (error) {
      console.error('Email test failed:', error);
      return false;
    }
  }
}
