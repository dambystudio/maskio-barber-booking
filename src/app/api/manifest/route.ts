// API Route per manifest dinamico basato sul tema
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Rileva il tema preferito dall'header o query string
  const url = new URL(request.url);
  const theme = url.searchParams.get('theme') || 'dark'; // default dark
  
  // Usa sempre le icone predefinite
  const iconFolder = 'predefinita';
  
  const manifest = {
    "name": "Maskio Barber Concept",
    "short_name": "Maskio Barber",
    "description": "Una nuova concezione del barbiere - Prenota il tuo appuntamento",
    "start_url": "/?standalone=true",
    "display": "standalone",
    "background_color": theme === 'light' ? "#ffffff" : "#000000",
    "theme_color": theme === 'light' ? "#ffffff" : "#000000",
    "orientation": "portrait-primary",
    "scope": "/",
    "lang": "it",
    "categories": ["business", "lifestyle"],
    "icons": [
      {
        "src": `/icone/${iconFolder}/512x512.png`,
        "sizes": "512x512",
        "type": "image/png",
        "purpose": "maskable any"
      },
      {
        "src": `/icone/${iconFolder}/192x192.png`,
        "sizes": "192x192",
        "type": "image/png",
        "purpose": "maskable any"
      },
      {
        "src": `/icone/${iconFolder}/180x180.png`,
        "sizes": "180x180",
        "type": "image/png",
        "purpose": "any"
      },
      {
        "src": `/icone/${iconFolder}/32x32.png`,
        "sizes": "32x32",
        "type": "image/png",
        "purpose": "any"
      },
      {
        "src": `/icone/${iconFolder}/16x16.png`,
        "sizes": "16x16",
        "type": "image/png",
        "purpose": "any"
      }
    ],
    "shortcuts": [
      {
        "name": "Prenota Appuntamento",
        "short_name": "Prenota",
        "description": "Prenota velocemente il tuo appuntamento",
        "url": "/prenota",
        "icons": [
          {
            "src": `/icone/${iconFolder}/192x192.png`,
            "sizes": "192x192"
          }
        ]
      },
      {
        "name": "Contatti",
        "short_name": "Contatti", 
        "description": "Visualizza i nostri contatti",
        "url": "/contatti",
        "icons": [
          {
            "src": `/icone/${iconFolder}/192x192.png`,
            "sizes": "192x192"
          }
        ]
      },
      {
        "name": "Pannello Prenotazioni",
        "short_name": "Pannello",
        "description": "Accesso barbieri al pannello prenotazioni",
        "url": "/pannello-prenotazioni",
        "icons": [
          {
            "src": `/icone/${iconFolder}/192x192.png`,
            "sizes": "192x192"
          }
        ]
      }
    ],
    "related_applications": [
      {
        "platform": "web",
        "url": "https://maskio-barber.vercel.app"
      }
    ]
  };

  return new NextResponse(JSON.stringify(manifest, null, 2), {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=3600' // Cache per 1 ora
    }
  });
}
