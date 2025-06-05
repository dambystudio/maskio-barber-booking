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

export async function GET(request: NextRequest) {
  try {
    const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY;
    const PLACE_ID = process.env.GOOGLE_PLACE_ID; // Il Place ID del tuo barbiere su Google

    if (!GOOGLE_PLACES_API_KEY || !PLACE_ID) {
      console.warn('Google Places API Key or Place ID not configured');
      
      // Restituisci dati mock se le API non sono configurate
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
          },
          {
            id: 'demo_4',
            author_name: 'Giuseppe N.',
            rating: 4,
            text: 'Ottimo servizio, prezzi giusti e risultato eccellente. Tornerò sicuramente!',
            time: Date.now() - 86400000 * 30,
            relative_time_description: '1 mese fa',
            profile_photo_url: null
          },
          {
            id: 'demo_5',
            author_name: 'Francesco B.',
            rating: 5,
            text: 'Taglio perfetto e rasatura impeccabile. Consigliatissimo a tutti!',
            time: Date.now() - 86400000 * 45,
            relative_time_description: '1 mese fa',
            profile_photo_url: null
          },
          {
            id: 'demo_6',
            author_name: 'Davide G.',
            rating: 5,
            text: 'Esperienza top! Ambiente elegante e personale super professionale.',
            time: Date.now() - 86400000 * 60,
            relative_time_description: '2 mesi fa',
            profile_photo_url: null
          }
        ],
        averageRating: 4.8,
        totalReviews: 47,
        isDemo: true,
        message: '⚠️ Recensioni di esempio - Configura Google Places API per mostrare quelle reali'
      };

      return NextResponse.json(mockData);
    }

    // Chiama l'API di Google Places per ottenere i dettagli del posto con le recensioni
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${PLACE_ID}&fields=name,rating,reviews,user_ratings_total&key=${GOOGLE_PLACES_API_KEY}&language=it`;
    
    const response = await fetch(url);
    const data: GooglePlacesResponse = await response.json();

    if (data.status !== 'OK') {
      throw new Error(`Google Places API error: ${data.status}`);
    }

    // Trasforma i dati nel formato richiesto dal frontend
    const transformedReviews = data.result.reviews?.map((review, index) => ({
      id: `google_${index}`,
      author_name: review.author_name,
      author_url: review.author_url,
      rating: review.rating,
      text: review.text,
      time: review.time * 1000, // Converti in millisecondi
      relative_time_description: review.relative_time_description,
      profile_photo_url: review.profile_photo_url
    })) || [];

    const result = {
      reviews: transformedReviews,
      averageRating: data.result.rating || 0,
      totalReviews: data.result.user_ratings_total || 0,
      placeName: data.result.name,
      isDemo: false
    };

    return NextResponse.json(result);

  } catch (error) {
    console.error('Error fetching Google reviews:', error);
    
    // In caso di errore, restituisci dati mock
    const fallbackData = {
      reviews: [
        {
          id: 'fallback_1',
          author_name: 'Cliente Soddisfatto',
          rating: 5,
          text: 'Servizio eccellente, molto professionale!',
          time: Date.now() - 86400000 * 3,
          relative_time_description: '3 giorni fa',
          profile_photo_url: null
        }
      ],
      averageRating: 4.8,
      totalReviews: 25,
      isDemo: true,
      error: 'Impossibile caricare le recensioni di Google. Mostrando dati di esempio.'
    };

    return NextResponse.json(fallbackData, { status: 200 });
  }
}
