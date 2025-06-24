interface FAQItem {
  question: string;
  answer: string;
}

interface FAQSchemaProps {
  faqs: FAQItem[];
  pageName?: string;
}

export default function FAQSchema({ faqs, pageName = 'FAQ' }: FAQSchemaProps) {
  if (typeof window !== 'undefined') {
    const faqSchema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "name": `${pageName} - Maskio Barber Concept`,
      "mainEntity": faqs.map(faq => ({
        "@type": "Question",
        "name": faq.question,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": faq.answer
        }
      }))
    };

    // Rimuovi script FAQ esistenti per questa pagina
    const existingFAQScript = document.querySelector(`script[data-page="${pageName}"]`);
    if (existingFAQScript) {
      existingFAQScript.remove();
    }

    // Aggiungi nuovo schema FAQ
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute('data-page', pageName);
    script.textContent = JSON.stringify(faqSchema);
    document.head.appendChild(script);
  }

  return null;
}

// FAQ predefinite per i servizi
export const barberFAQs: FAQItem[] = [
  {
    question: "Quanto costa un taglio di capelli da Maskio Barber Concept?",
    answer: "I nostri tagli partono da €15 per un taglio base. Offriamo anche pacchetti combinati taglio + barba a prezzi vantaggiosi."
  },
  {
    question: "È necessario prenotare un appuntamento?",
    answer: "Consigliamo sempre di prenotare tramite il nostro sistema online per garantire la disponibilità. Accettiamo anche clienti senza appuntamento quando possibile."
  },
  {
    question: "Quali metodi di pagamento accettate?",
    answer: "Accettiamo contanti e carte di credito/debito. Non accettiamo assegni."
  },
  {
    question: "Fate anche trattamenti per la barba?",
    answer: "Sì, siamo specializzati in rasatura tradizionale, styling barba e trattamenti specifici per la cura della barba."
  },
  {
    question: "Quali sono gli orari di apertura?",
    answer: "Siamo aperti Lunedì, Martedì, Mercoledì e Venerdì dalle 9:00 alle 13:00 e dalle 15:00 alle 18:00. Chiusi Giovedì, Sabato e Domenica."
  },
  {
    question: "Dove si trova il negozio?",
    answer: "Ci troviamo in Via Sant'Agata 24, San Giovanni Rotondo (FG). Facilmente raggiungibile e con parcheggio disponibile nelle vicinanze."
  }
];
