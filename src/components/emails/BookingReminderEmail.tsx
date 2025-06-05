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

interface BookingReminderEmailProps {
  customerName: string;
  barberName: string;
  service: string;
  date: string;
  time: string;
  price: number;
  notes?: string;
}

export default function BookingReminderEmail({
  customerName,
  barberName,
  service,
  date,
  time,
  price,
  notes
}: BookingReminderEmailProps) {
  const formattedDate = new Date(date).toLocaleDateString('it-IT', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <Html>
      <Head />
      <Preview>Promemoria: La tua prenotazione da Maskio Barber è domani!</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Heading style={h1}>⏰ Promemoria Prenotazione</Heading>
            <Text style={subtitle}>Maskio Barber Concept</Text>
          </Section>

          {/* Main Content */}
          <Section style={content}>
            <Text style={greeting}>Ciao {customerName},</Text>
            
            <Text style={paragraph}>
              Ti ricordiamo che la tua prenotazione da <strong>Maskio Barber</strong> è prevista per <strong>domani</strong>!
            </Text>

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
              {notes && (
                <Text style={detail}>
                  <strong>📝 Note:</strong> {notes}
                </Text>
              )}
            </Section>

            {/* Important Info */}
            <Section style={importantInfo}>
              <Heading style={h3}>⚠️ Informazioni Importanti</Heading>
              <Text style={bulletPoint}>• Ti chiediamo di arrivare <strong>5 minuti prima</strong> dell'orario prenotato</Text>
              <Text style={bulletPoint}>• In caso di ritardo superiore a 15 minuti, potremmo dover riprogrammare l'appuntamento</Text>
              <Text style={bulletPoint}>• Per cancellazioni, ti chiediamo di avvisare almeno 2 ore prima</Text>
            </Section>

            {/* Location */}
            <Section style={locationSection}>
              <Heading style={h3}>📍 Dove Trovarci</Heading>              <Text style={locationText}>
                <strong>Maskio Barber Concept</strong><br />
                Via Sant'Agata 24<br />
                71013 San Giovanni Rotondo (FG)<br />
                📞 +39 123 456 7890
              </Text>
              
              <Button href="https://maps.google.com" style={locationButton}>
                📍 Apri in Google Maps
              </Button>
            </Section>

            <Text style={paragraph}>
              Non vediamo l'ora di averti da noi! 😊
            </Text>
          </Section>

          <Hr style={hr} />

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              <strong>Maskio Barber Concept</strong><br />
              Una nuova concezione del barbiere
            </Text>
            <Text style={footerLinks}>
              <Link href="#" style={link}>Il Nostro Sito</Link> • 
              <Link href="#" style={link}>Instagram</Link> • 
              <Link href="#" style={link}>Contatti</Link>
            </Text>
            <Text style={footerNote}>
              Questa email è stata inviata automaticamente. Non rispondere a questo messaggio.
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

const content = {
  padding: '24px',
};

const greeting = {
  color: '#1f2937',
  fontSize: '18px',
  fontWeight: '600',
  margin: '0 0 16px',
};

const paragraph = {
  color: '#374151',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '16px 0',
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

const importantInfo = {
  backgroundColor: '#fef2f2',
  border: '1px solid #fecaca',
  borderRadius: '8px',
  padding: '20px',
  margin: '24px 0',
};

const bulletPoint = {
  color: '#374151',
  fontSize: '14px',
  margin: '6px 0',
};

const locationSection = {
  backgroundColor: '#f0f9ff',
  border: '1px solid #bae6fd',
  borderRadius: '8px',
  padding: '20px',
  margin: '24px 0',
  textAlign: 'center' as const,
};

const locationText = {
  color: '#374151',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '0 0 16px',
};

const locationButton = {
  backgroundColor: '#3b82f6',
  borderRadius: '6px',
  color: '#ffffff',
  fontSize: '14px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 24px',
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
