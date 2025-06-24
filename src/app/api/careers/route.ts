import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const phone = formData.get('phone') as string;
    const experience = formData.get('experience') as string;
    const message = formData.get('message') as string;
    const cvFile = formData.get('cv') as File;

    // Validazione campi obbligatori
    if (!name || !email || !phone || !cvFile) {
      return NextResponse.json(
        { error: 'Tutti i campi obbligatori devono essere compilati' },
        { status: 400 }
      );
    }

    // Validazione formato CV
    if (cvFile.type !== 'application/pdf') {
      return NextResponse.json(
        { error: 'Il CV deve essere in formato PDF' },
        { status: 400 }
      );
    }

    // Validazione dimensione file (max 5MB)
    if (cvFile.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'Il CV non può superare i 5MB' },
        { status: 400 }
      );
    }

    // Converti il file in buffer per l'attachment
    const cvBuffer = Buffer.from(await cvFile.arrayBuffer());    // Prepara l'email per Maskio Barber
    const emailToMaskio = {
      from: process.env.FROM_EMAIL || 'onboarding@resend.dev',
      to: 'fabio.cassano97@icloud.com', // Email dove riceverai i CV
      subject: `Nuova Candidatura: ${name}`,
      html: `
        <h2>Nuova Candidatura Ricevuta</h2>
        <p><strong>Nome:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Telefono:</strong> ${phone}</p>
        <p><strong>Esperienza:</strong> ${experience || 'Non specificata'}</p>
        <p><strong>Messaggio:</strong></p>
        <p>${message || 'Nessun messaggio aggiuntivo'}</p>
        <p><em>CV allegato in formato PDF</em></p>
      `,
      attachments: [
        {
          filename: `CV_${name.replace(/\s+/g, '_')}.pdf`,
          content: cvBuffer,
          contentType: 'application/pdf',
        },
      ],
    };    // Prepara email di conferma per il candidato
    const emailToCandidate = {
      from: process.env.FROM_EMAIL || 'onboarding@resend.dev',
      to: email,
      subject: 'Candidatura Ricevuta - Maskio Barber',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #d97706;">Grazie per la tua candidatura!</h2>
          <p>Ciao ${name},</p>
          <p>Abbiamo ricevuto la tua candidatura per lavorare con noi in Maskio Barber.</p>
          <p>Il nostro team esaminerà il tuo CV e ti contatteremo presto se il tuo profilo dovesse essere in linea con le nostre necessità.</p>
          
          <h3 style="color: #d97706;">Riepilogo della tua candidatura:</h3>
          <ul>
            <li><strong>Nome:</strong> ${name}</li>
            <li><strong>Email:</strong> ${email}</li>
            <li><strong>Telefono:</strong> ${phone}</li>
            <li><strong>Esperienza:</strong> ${experience || 'Non specificata'}</li>
          </ul>
          
          <p>Nel frattempo, puoi seguirci sui nostri social media per rimanere aggiornato sulle novità di Maskio Barber!</p>
          
          <p style="margin-top: 30px;">
            <strong>Maskio Barber</strong><br>
            Via Sant'Agata 24, San Giovanni Rotondo (FG)<br>
            Tel: +39 331 710 0730<br>
            Email: fabio.cassano97@icloud.com
          </p>
        </div>
      `,
    };

    // Invia entrambe le email
    await Promise.all([
      resend.emails.send(emailToMaskio),
      resend.emails.send(emailToCandidate)
    ]);

    return NextResponse.json(
      { message: 'Candidatura inviata con successo!' },
      { status: 200 }
    );

  } catch (error) {
    console.error('Errore nell\'invio della candidatura:', error);
    return NextResponse.json(
      { error: 'Errore interno del server. Riprova più tardi.' },
      { status: 500 }
    );
  }
}
