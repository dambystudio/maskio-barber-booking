import { NextRequest, NextResponse } from 'next/server';

// Interfaccia per le recensioni Google Places
interface GooglePlacesReview {
  author_name: string;
  author_url?: string;
  language: string;
  profile_photo_url?: string;
  rating: number;
  relative_time_description: string;
  text: string;
  time: number;
}

interface GooglePlacesResponse {
  result: {
    name: string;
    rating: number;
    reviews: GooglePlacesReview[];
    user_ratings_total: number;
  };
  status: string;
}

// Cache in memoria per le recensioni (semplice implementazione)
let reviewsCache: {
  data: any;
  timestamp: number;
} | null = null;

const CACHE_DURATION = 30 * 60 * 1000; // 30 minuti in millisecondi
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 secondo

// Funzione di delay per i retry
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Funzione per chiamare l'API Google Places con retry
async function fetchGoogleReviewsWithRetry(apiKey: string, placeId: string, retries = MAX_RETRIES): Promise<GooglePlacesResponse> {
  const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,rating,reviews,user_ratings_total&key=${apiKey}&language=it`;
  
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`🌐 Tentativo ${attempt}/${retries} - Calling Google Places API...`);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Maskio-Barber-Website/1.0'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
      }

      const data: GooglePlacesResponse = await response.json();
      
      console.log(`📊 Tentativo ${attempt} - API Status: ${data.status}`);
      
      if (data.status === 'OK') {
        console.log(`✅ Successo al tentativo ${attempt} - Recensioni trovate: ${data.result.reviews?.length || 0}`);
        return data;
      }
      
      // Se lo status non è OK, considera questo come un errore
      throw new Error(`Google Places API Status: ${data.status}`);
      
    } catch (error) {
      console.error(`❌ Tentativo ${attempt} fallito:`, error);
      
      if (attempt === retries) {
        throw error; // Ultimo tentativo fallito
      }
      
      // Attesa prima del prossimo tentativo
      await delay(RETRY_DELAY * attempt);
    }
  }
  
  throw new Error('Tutti i tentativi falliti');
}

export async function GET(request: NextRequest) {
  try {
    const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY;
    const PLACE_ID = process.env.GOOGLE_PLACE_ID;

    console.log('🔑 API Key presente:', !!GOOGLE_PLACES_API_KEY);
    console.log('📍 Place ID presente:', !!PLACE_ID);

    // Verifica cache prima di tutto
    if (reviewsCache && (Date.now() - reviewsCache.timestamp) < CACHE_DURATION) {
      console.log('📦 Restituendo dati dalla cache');
      return NextResponse.json(reviewsCache.data);
    }

    if (!GOOGLE_PLACES_API_KEY || !PLACE_ID) {
      console.warn('Google Places API Key or Place ID not configured - Using mock data');
      
      const mockData = {
        reviews: [
          {
            id: 'demo_1',
            author_name: 'Marco R.',
            rating: 5,
            text: 'Esperienza fantastica! Il taglio è stato perfetto e il servizio impeccabile. Consigliatissimo!',
            time: Date.now() - 86400000 * 7,
            relative_time_description: '1 settimana fa',
            profile_photo_url: null
          },
          {
            id: 'demo_2',
            author_name: 'Luca B.', 
            rating: 5,
            text: 'Professionalità e cortesia al top. Finalmente ho trovato il mio barbiere di fiducia!',
            time: Date.now() - 86400000 * 14,
            relative_time_description: '2 settimane fa',
            profile_photo_url: null
          },
          {
            id: 'demo_3',
            author_name: 'Andrea V.',
            rating: 5,
            text: 'Ambiente moderno e accogliente. Il personale è molto preparato e attento ai dettagli.',
            time: Date.now() - 86400000 * 21,
            relative_time_description: '3 settimane fa',
            profile_photo_url: null
          }
        ],
        averageRating: 4.9,
        totalReviews: 47,
        isDemo: true,
        message: '⚠️ Recensioni di esempio - Configura Google Places API per mostrare quelle reali',
        cached: false
      };

      return NextResponse.json(mockData);
    }

    // Prova a ottenere le recensioni con retry
    const data = await fetchGoogleReviewsWithRetry(GOOGLE_PLACES_API_KEY, PLACE_ID);    // Trasforma i dati nel formato richiesto dal frontend
    const allReviews = data.result.reviews?.map((review, index) => ({
      id: `google_${index}`,
      author_name: review.author_name,
      author_url: review.author_url,
      rating: review.rating,
      text: review.text && review.text.trim() ? review.text : 'Esperienza positiva!',
      time: review.time * 1000,
      relative_time_description: review.relative_time_description,
      profile_photo_url: review.profile_photo_url,
      hasOriginalText: !!(review.text && review.text.trim())
    })) || [];

    // Priorità: recensioni con testo originale, poi quelle con fallback
    const reviewsWithText = allReviews.filter(r => r.hasOriginalText);
    const reviewsWithFallback = allReviews.filter(r => !r.hasOriginalText);
    
    // Combina per avere sempre qualcosa da mostrare
    const transformedReviews = [...reviewsWithText, ...reviewsWithFallback];

    const result = {
      reviews: transformedReviews,
      averageRating: data.result.rating || 0,
      totalReviews: data.result.user_ratings_total || 0,
      placeName: data.result.name,
      isDemo: false,
      cached: false,
      lastUpdated: new Date().toISOString()
    };

    // Salva nella cache
    reviewsCache = {
      data: result,
      timestamp: Date.now()
    };

    console.log(`✅ Recensioni caricate e salvate in cache - Totale: ${transformedReviews.length}`);
    return NextResponse.json(result, {
      headers: {
        'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=3600',
        'CDN-Cache-Control': 'public, s-maxage=1800'
      }
    });

  } catch (error) {
    console.error('❌ Errore finale nel caricamento recensioni:', error);
    
    // Se abbiamo dati in cache (anche se scaduti), usali come fallback
    if (reviewsCache) {
      console.log('📦 Usando cache scaduta come fallback');
      const cachedResult = {
        ...reviewsCache.data,
        cached: true,
        cacheExpired: true,
        message: 'Dati da cache - Aggiornamento temporaneamente non disponibile'
      };
      return NextResponse.json(cachedResult);
    }
    
    // Fallback finale con dati mock realistici
    console.log('🎭 Usando fallback con dati mock');
    const fallbackData = {
      reviews: [
        {
          id: 'fallback_1',
          author_name: 'Cliente Soddisfatto',
          rating: 5,
          text: 'Servizio eccellente e molto professionale! Taglio perfetto e ambiente accogliente.',
          time: Date.now() - 86400000 * 5,
          relative_time_description: '5 giorni fa',
          profile_photo_url: null
        },
        {
          id: 'fallback_2',
          author_name: 'Marco B.',
          rating: 5,
          text: 'Esperienza fantastica, consigliatissimo! Personale cortese e competente.',
          time: Date.now() - 86400000 * 12,
          relative_time_description: '12 giorni fa',
          profile_photo_url: null
        },
        {
          id: 'fallback_3',
          author_name: 'Luca V.',
          rating: 4,
          text: 'Ottimo servizio, prezzi giusti e risultato eccellente. Tornerò sicuramente!',
          time: Date.now() - 86400000 * 20,
          relative_time_description: '20 giorni fa',
          profile_photo_url: null
        }
      ],
      averageRating: 4.8,
      totalReviews: 25,
      isDemo: true,
      isFallback: true,
      message: 'Recensioni temporaneamente non disponibili - Mostrando dati di esempio',
      error: error instanceof Error ? error.message : 'Errore sconosciuto'
    };

    return NextResponse.json(fallbackData, { status: 200 });
  }
}
