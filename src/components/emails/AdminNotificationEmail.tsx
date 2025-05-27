import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
  Link,
  Hr,
  Button
} from '@react-email/components';

interface AdminNotificationEmailProps {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  barberName: string;
  service: string;
  date: string;
  time: string;
  price: number;
  notes?: string;
  bookingId: string;
}

export default function AdminNotificationEmail({
  customerName,
  customerEmail,
  customerPhone,
  barberName,
  service,
  date,
  time,
  price,
  notes,
  bookingId
}: AdminNotificationEmailProps) {
  const formattedDate = new Date(date).toLocaleDateString('it-IT', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <Html>
      <Head />
      <Preview>Nuova prenotazione ricevuta - {customerName}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Heading style={h1}>🔔 Nuova Prenotazione</Heading>
            <Text style={subtitle}>Maskio Barber Admin Panel</Text>
          </Section>

          {/* Alert */}
          <Section style={alertSection}>
            <Text style={alertText}>
              ⚡ È stata appena ricevuta una nuova prenotazione!
            </Text>
          </Section>

          {/* Main Content */}
          <Section style={content}>
            {/* Customer Details */}
            <Section style={customerCard}>
              <Heading style={h2}>👤 Dettagli Cliente</Heading>
              
              <Text style={detail}>
                <strong>Nome:</strong> {customerName}
              </Text>
              <Text style={detail}>
                <strong>Email:</strong> 
                <Link href={`mailto:${customerEmail}`} style={emailLink}>
                  {customerEmail}
                </Link>
              </Text>
              <Text style={detail}>
                <strong>Telefono:</strong> 
                <Link href={`tel:${customerPhone}`} style={phoneLink}>
                  {customerPhone}
                </Link>
              </Text>
            </Section>

            {/* Booking Details */}
            <Section style={bookingCard}>
              <Heading style={h2}>📋 Dettagli Prenotazione</Heading>
              
              <Text style={detail}>
                <strong>📅 Data:</strong> {formattedDate}
              </Text>
              <Text style={detail}>
                <strong>🕐 Ora:</strong> {time}
              </Text>
              <Text style={detail}>
                <strong>👨‍💼 Barbiere:</strong> {barberName}
              </Text>
              <Text style={detail}>
                <strong>✂️ Servizio:</strong> {service}
              </Text>
              <Text style={detail}>
                <strong>💰 Prezzo:</strong> €{price}
              </Text>
              <Text style={detail}>
                <strong>🔗 ID Prenotazione:</strong> {bookingId}
              </Text>
              {notes && (
                <Text style={detail}>
                  <strong>📝 Note Cliente:</strong> {notes}
                </Text>
              )}
            </Section>

            {/* Quick Actions */}
            <Section style={actionsSection}>
              <Heading style={h3}>⚡ Azioni Rapide</Heading>
              
              <div style={buttonGroup}>
                <Button href={`/admin`} style={primaryButton}>
                  📊 Vai alla Dashboard
                </Button>
                
                <Button href={`tel:${customerPhone}`} style={secondaryButton}>
                  📞 Chiama Cliente
                </Button>
                
                <Button href={`mailto:${customerEmail}`} style={secondaryButton}>
                  ✉️ Invia Email
                </Button>
              </div>
            </Section>

            {/* Statistics */}
            <Section style={statsSection}>
              <Heading style={h3}>📊 Oggi</Heading>
              <Text style={statsText}>
                Questa prenotazione è stata registrata il {new Date().toLocaleDateString('it-IT')} alle {new Date().toLocaleTimeString('it-IT')}
              </Text>
            </Section>
          </Section>

          <Hr style={hr} />

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              <strong>Maskio Barber Admin</strong><br />
              Sistema di Gestione Prenotazioni
            </Text>
            <Text style={footerLinks}>
              <Link href="/admin" style={link}>Dashboard Admin</Link> • 
              <Link href="/admin/bookings" style={link}>Tutte le Prenotazioni</Link> • 
              <Link href="/admin/stats" style={link}>Statistiche</Link>
            </Text>
            <Text style={footerNote}>
              Questa email è stata inviata automaticamente dal sistema di prenotazioni.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// Styles
const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
  maxWidth: '600px',
};

const header = {
  padding: '32px 24px 0',
  textAlign: 'center' as const,
};

const h1 = {
  color: '#1f2937',
  fontSize: '28px',
  fontWeight: 'bold',
  margin: '0 0 8px',
};

const subtitle = {
  color: '#6b7280',
  fontSize: '16px',
  margin: '0',
};

const alertSection = {
  backgroundColor: '#dcfce7',
  border: '1px solid #bbf7d0',
  borderRadius: '8px',
  padding: '16px',
  margin: '24px 24px 0',
  textAlign: 'center' as const,
};

const alertText = {
  color: '#15803d',
  fontSize: '16px',
  fontWeight: 'bold',
  margin: '0',
};

const content = {
  padding: '24px',
};

const customerCard = {
  backgroundColor: '#eff6ff',
  border: '1px solid #bfdbfe',
  borderRadius: '8px',
  padding: '24px',
  margin: '24px 0',
};

const bookingCard = {
  backgroundColor: '#fef3c7',
  border: '1px solid #fcd34d',
  borderRadius: '8px',
  padding: '24px',
  margin: '24px 0',
};

const h2 = {
  color: '#1f2937',
  fontSize: '20px',
  fontWeight: 'bold',
  margin: '0 0 16px',
};

const h3 = {
  color: '#1f2937',
  fontSize: '18px',
  fontWeight: 'bold',
  margin: '0 0 12px',
};

const detail = {
  color: '#374151',
  fontSize: '14px',
  margin: '8px 0',
};

const emailLink = {
  color: '#3b82f6',
  textDecoration: 'none',
};

const phoneLink = {
  color: '#059669',
  textDecoration: 'none',
};

const actionsSection = {
  backgroundColor: '#f9fafb',
  border: '1px solid #e5e7eb',
  borderRadius: '8px',
  padding: '24px',
  margin: '24px 0',
  textAlign: 'center' as const,
};

const buttonGroup = {
  display: 'flex',
  flexDirection: 'column' as const,
  gap: '12px',
  alignItems: 'center',
};

const primaryButton = {
  backgroundColor: '#3b82f6',
  borderRadius: '6px',
  color: '#ffffff',
  fontSize: '14px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 24px',
  margin: '4px',
};

const secondaryButton = {
  backgroundColor: '#6b7280',
  borderRadius: '6px',
  color: '#ffffff',
  fontSize: '14px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '10px 20px',
  margin: '4px',
};

const statsSection = {
  backgroundColor: '#f0f9ff',
  border: '1px solid #bae6fd',
  borderRadius: '8px',
  padding: '20px',
  margin: '24px 0',
};

const statsText = {
  color: '#374151',
  fontSize: '14px',
  margin: '0',
};

const hr = {
  borderColor: '#e5e7eb',
  margin: '32px 0',
};

const footer = {
  padding: '0 24px',
  textAlign: 'center' as const,
};

const footerText = {
  color: '#6b7280',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '0 0 12px',
};

const footerLinks = {
  color: '#6b7280',
  fontSize: '12px',
  margin: '0 0 12px',
};

const link = {
  color: '#3b82f6',
  textDecoration: 'none',
  margin: '0 4px',
};

const footerNote = {
  color: '#9ca3af',
  fontSize: '11px',
  margin: '0',
};
