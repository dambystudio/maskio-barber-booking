import { BookingEmailData } from '@/lib/email';

export function BookingConfirmationEmail(data: BookingEmailData) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Conferma Prenotazione - Maskio Barber</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #f8f9fa;">
      <div style="max-width: 600px; margin: 0 auto; background: white; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #1f2937 0%, #111827 100%); color: white; padding: 40px 30px; text-align: center;">
          <h1 style="margin: 0; font-size: 28px; font-weight: 300;">Maskio Barber</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9; font-size: 16px;">Prenotazione Confermata ✅</p>
        </div>

        <!-- Content -->
        <div style="padding: 40px 30px;">
          <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 24px;">Ciao ${data.customerName}! 👋</h2>
          
          <p style="color: #4b5563; line-height: 1.6; margin: 0 0 30px 0; font-size: 16px;">
            La tua prenotazione è stata <strong>confermata con successo</strong>. 
            Ecco i dettagli del tuo appuntamento:
          </p>

          <!-- Booking Details Card -->
          <div style="background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%); border-radius: 12px; padding: 30px; margin: 30px 0; border-left: 4px solid #10b981;">
            <h3 style="color: #1f2937; margin: 0 0 20px 0; font-size: 20px; display: flex; align-items: center;">
              📅 Dettagli Appuntamento
            </h3>
            
            <div style="display: grid; gap: 15px;">
              <div style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #d1d5db;">
                <span style="color: #6b7280; font-weight: 500;">Servizio:</span>
                <span style="color: #1f2937; font-weight: 600;">${data.service}</span>
              </div>
              
              <div style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #d1d5db;">
                <span style="color: #6b7280; font-weight: 500;">Barbiere:</span>
                <span style="color: #1f2937; font-weight: 600;">${data.barberName}</span>
              </div>
              
              <div style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #d1d5db;">
                <span style="color: #6b7280; font-weight: 500;">Data:</span>
                <span style="color: #1f2937; font-weight: 600;">${new Date(data.date).toLocaleDateString('it-IT', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</span>
              </div>
              
              <div style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #d1d5db;">
                <span style="color: #6b7280; font-weight: 500;">Orario:</span>
                <span style="color: #1f2937; font-weight: 600; font-size: 18px;">⏰ ${data.time}</span>
              </div>
              
              <div style="display: flex; justify-content: space-between; padding: 15px 0; background: #10b981; color: white; margin: 10px -15px -15px -15px; padding: 15px; border-radius: 0 0 8px 8px;">
                <span style="font-weight: 500; font-size: 18px;">Prezzo:</span>
                <span style="font-weight: 700; font-size: 20px;">€${data.price}</span>
              </div>
            </div>
          </div>

          <!-- Important Notes -->
          <div style="background: #fef3c7; border: 1px solid #fbbf24; border-radius: 8px; padding: 20px; margin: 30px 0;">
            <h4 style="color: #92400e; margin: 0 0 10px 0; display: flex; align-items: center;">
              ⚠️ Informazioni Importanti
            </h4>
            <ul style="color: #92400e; margin: 0; padding-left: 20px; line-height: 1.6;">
              <li>Ti invieremo un promemoria 24 ore prima dell'appuntamento</li>
              <li>In caso di ritardo, ti preghiamo di avvisare telefonicamente</li>
              <li>Per cancellazioni, contattaci almeno 2 ore prima</li>
            </ul>
          </div>

          <!-- Contact Info -->
          <div style="text-align: center; background: #f9fafb; border-radius: 8px; padding: 25px; margin: 30px 0;">
            <h4 style="color: #1f2937; margin: 0 0 15px 0;">📞 Contatti</h4>
            <p style="color: #4b5563; margin: 0; line-height: 1.6;">
              <strong>Telefono:</strong> +39 123 456 7890<br>
              <strong>Email:</strong> info@maskiobarber.com<br>
              <strong>Indirizzo:</strong> Via Roma 123, Milano
            </p>
          </div>

          <!-- CTA Button -->
          <div style="text-align: center; margin: 40px 0;">
            <a href="https://maskiobarber.com/prenotazioni" 
               style="display: inline-block; background: linear-gradient(135deg, #1f2937 0%, #111827 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
              👀 Visualizza Prenotazione
            </a>
          </div>
        </div>

        <!-- Footer -->
        <div style="background: #f3f4f6; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
          <p style="color: #6b7280; margin: 0 0 10px 0; font-size: 14px;">
            Grazie per aver scelto Maskio Barber! 💈
          </p>
          <p style="color: #9ca3af; margin: 0; font-size: 12px;">
            ID Prenotazione: #${data.bookingId}
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}

export function BookingReminderEmail(data: BookingEmailData) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Promemoria Appuntamento - Maskio Barber</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #f8f9fa;">
      <div style="max-width: 600px; margin: 0 auto; background: white; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 40px 30px; text-align: center;">
          <h1 style="margin: 0; font-size: 28px; font-weight: 300;">Maskio Barber</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9; font-size: 16px;">Promemoria Appuntamento ⏰</p>
        </div>

        <!-- Content -->
        <div style="padding: 40px 30px;">
          <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 24px;">Ciao ${data.customerName}! 👋</h2>
          
          <p style="color: #4b5563; line-height: 1.6; margin: 0 0 30px 0; font-size: 18px;">
            <strong>Il tuo appuntamento è domani!</strong> 🎉<br>
            Ecco un promemoria dei dettagli:
          </p>

          <!-- Tomorrow Appointment Card -->
          <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-radius: 12px; padding: 30px; margin: 30px 0; border-left: 4px solid #f59e0b;">
            <h3 style="color: #92400e; margin: 0 0 20px 0; font-size: 20px; display: flex; align-items: center;">
              ⏰ Appuntamento di Domani
            </h3>
            
            <div style="display: grid; gap: 15px;">
              <div style="display: flex; justify-content: space-between; padding: 10px 0;">
                <span style="color: #92400e; font-weight: 500;">Servizio:</span>
                <span style="color: #1f2937; font-weight: 600;">${data.service}</span>
              </div>
              
              <div style="display: flex; justify-content: space-between; padding: 10px 0;">
                <span style="color: #92400e; font-weight: 500;">Barbiere:</span>
                <span style="color: #1f2937; font-weight: 600;">${data.barberName}</span>
              </div>
              
              <div style="display: flex; justify-content: space-between; padding: 10px 0;">
                <span style="color: #92400e; font-weight: 500; font-size: 18px;">Orario:</span>
                <span style="color: #1f2937; font-weight: 700; font-size: 22px;">🕐 ${data.time}</span>
              </div>
            </div>
          </div>

          <!-- Quick Tips -->
          <div style="background: #dbeafe; border: 1px solid #3b82f6; border-radius: 8px; padding: 20px; margin: 30px 0;">
            <h4 style="color: #1e40af; margin: 0 0 10px 0; display: flex; align-items: center;">
              💡 Suggerimenti Utili
            </h4>
            <ul style="color: #1e40af; margin: 0; padding-left: 20px; line-height: 1.6;">
              <li>Arriva 5 minuti prima per evitare attese</li>
              <li>Porta con te un documento di identità</li>
              <li>Se hai dubbi sullo stile, chiedi consiglio al barbiere</li>
            </ul>
          </div>

          <!-- Emergency Contact -->
          <div style="text-align: center; background: #fee2e2; border: 1px solid #ef4444; border-radius: 8px; padding: 20px; margin: 30px 0;">
            <h4 style="color: #dc2626; margin: 0 0 10px 0;">🚨 Devi cancellare o rinviare?</h4>
            <p style="color: #dc2626; margin: 0; font-weight: 600;">
              Chiamaci subito: <a href="tel:+391234567890" style="color: #dc2626; text-decoration: none;">+39 123 456 7890</a>
            </p>
          </div>

          <!-- See You Tomorrow -->
          <div style="text-align: center; margin: 40px 0;">
            <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 25px; border-radius: 12px;">
              <h3 style="margin: 0 0 10px 0; font-size: 22px;">Ci vediamo domani! 🎉</h3>
              <p style="margin: 0; opacity: 0.9; font-size: 16px;">Il team Maskio Barber ti aspetta</p>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div style="background: #f3f4f6; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
          <p style="color: #6b7280; margin: 0 0 10px 0; font-size: 14px;">
            Maskio Barber - Via Roma 123, Milano 💈
          </p>
          <p style="color: #9ca3af; margin: 0; font-size: 12px;">
            ID Prenotazione: #${data.bookingId}
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}

export function AdminNotificationEmail(data: BookingEmailData) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Nuova Prenotazione - Admin Maskio Barber</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f3f4f6;">
      <div style="max-width: 600px; margin: 0 auto; background: white;">
        
        <!-- Header -->
        <div style="background: #dc2626; color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0; font-size: 24px;">🚨 NUOVA PRENOTAZIONE</h1>
          <p style="margin: 5px 0 0 0; opacity: 0.9;">Admin Panel - Maskio Barber</p>
        </div>

        <!-- Content -->
        <div style="padding: 30px;">
          <h2 style="color: #1f2937; margin: 0 0 20px 0;">📋 Dettagli Prenotazione</h2>
          
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <tr style="background: #f9fafb;">
              <td style="padding: 12px; border: 1px solid #e5e7eb; font-weight: 600;">Cliente:</td>
              <td style="padding: 12px; border: 1px solid #e5e7eb;">${data.customerName}</td>
            </tr>
            <tr>
              <td style="padding: 12px; border: 1px solid #e5e7eb; font-weight: 600;">Email:</td>
              <td style="padding: 12px; border: 1px solid #e5e7eb;">${data.customerEmail}</td>
            </tr>
            <tr style="background: #f9fafb;">
              <td style="padding: 12px; border: 1px solid #e5e7eb; font-weight: 600;">Servizio:</td>
              <td style="padding: 12px; border: 1px solid #e5e7eb;">${data.service}</td>
            </tr>
            <tr>
              <td style="padding: 12px; border: 1px solid #e5e7eb; font-weight: 600;">Barbiere:</td>
              <td style="padding: 12px; border: 1px solid #e5e7eb;">${data.barberName}</td>
            </tr>
            <tr style="background: #f9fafb;">
              <td style="padding: 12px; border: 1px solid #e5e7eb; font-weight: 600;">Data:</td>
              <td style="padding: 12px; border: 1px solid #e5e7eb;">${data.date}</td>
            </tr>
            <tr>
              <td style="padding: 12px; border: 1px solid #e5e7eb; font-weight: 600;">Orario:</td>
              <td style="padding: 12px; border: 1px solid #e5e7eb; font-size: 18px; font-weight: 600;">${data.time}</td>
            </tr>
            <tr style="background: #dcfce7;">
              <td style="padding: 12px; border: 1px solid #e5e7eb; font-weight: 600;">Prezzo:</td>
              <td style="padding: 12px; border: 1px solid #e5e7eb; font-size: 18px; font-weight: 700; color: #059669;">€${data.price}</td>
            </tr>
          </table>

          <!-- Quick Actions -->
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://maskiobarber.com/admin/bookings" 
               style="display: inline-block; background: #dc2626; color: white; padding: 12px 25px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 0 10px;">
              🏥 Vai al Pannello Admin
            </a>
          </div>

          <p style="color: #6b7280; text-align: center; margin: 20px 0; font-size: 14px;">
            ID Prenotazione: #${data.bookingId}<br>
            Ricevuto: ${new Date().toLocaleString('it-IT')}
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}
