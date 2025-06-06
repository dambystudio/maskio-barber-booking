'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { StarIcon } from '@heroicons/react/24/solid';
import { StarIcon as StarOutlineIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';

// Interfaccia per le recensioni Google
interface GoogleReview {
  id: string;
  author_name: string;
  author_url?: string;
  profile_photo_url?: string;
  rating: number;
  text: string;
  time: number;
  relative_time_description: string;
}

// Recensioni di esempio (da sostituire con quelle reali di Google)
// Using static timestamps to avoid hydration mismatch
const baseTimestamp = 1733481600000; // Fixed timestamp (Dec 6, 2024)
const mockReviews: GoogleReview[] = [
  {
    id: '1',
    author_name: 'Marco Rossi',
    rating: 5,
    text: 'Esperienza fantastica! Il taglio è stato perfetto e il servizio impeccabile. Consigliatissimo!',
    time: baseTimestamp - 86400000 * 7,
    relative_time_description: '1 settimana fa',
    profile_photo_url: '/api/placeholder/40/40'
  },
  {
    id: '2', 
    author_name: 'Luca Bianchi',
    rating: 5,
    text: 'Professionalità e cortesia al top. Finalmente ho trovato il mio barbiere di fiducia!',
    time: baseTimestamp - 86400000 * 14,
    relative_time_description: '2 settimane fa',
    profile_photo_url: '/api/placeholder/40/40'
  },
  {
    id: '3',
    author_name: 'Andrea Verdi',
    rating: 5,
    text: 'Ambiente moderno e accogliente. Il personale è molto preparato e attento ai dettagli.',
    time: baseTimestamp - 86400000 * 21,
    relative_time_description: '3 settimane fa',
    profile_photo_url: '/api/placeholder/40/40'
  },
  {
    id: '4',
    author_name: 'Giuseppe Neri',
    rating: 4,
    text: 'Ottimo servizio, prezzi giusti e risultato eccellente. Tornerò sicuramente!',
    time: baseTimestamp - 86400000 * 30,
    relative_time_description: '1 mese fa',
    profile_photo_url: '/api/placeholder/40/40'
  },
  {
    id: '5',
    author_name: 'Francesco Blu',
    rating: 5,
    text: 'Taglio perfetto e rasatura impeccabile. Consigliatissimo a tutti!',
    time: baseTimestamp - 86400000 * 45,
    relative_time_description: '1 mese fa',
    profile_photo_url: '/api/placeholder/40/40'
  },
  {
    id: '6',
    author_name: 'Davide Gialli',
    rating: 5,
    text: 'Esperienza top! Ambiente elegante e personale super professionale.',
    time: baseTimestamp - 86400000 * 60,
    relative_time_description: '2 mesi fa',
    profile_photo_url: '/api/placeholder/40/40'
  }
];

// Componente per le stelle di rating
const StarRating = ({ rating }: { rating: number }) => {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <motion.div
          key={star}
          whileHover={{ scale: 1.2 }}
          transition={{ duration: 0.2 }}
        >
          {star <= rating ? (
            <StarIcon className="w-5 h-5 text-yellow-400" />
          ) : (
            <StarOutlineIcon className="w-5 h-5 text-gray-300" />
          )}
        </motion.div>
      ))}
    </div>
  );
};

export default function TestimonianzePage() {
  const [reviews, setReviews] = useState<GoogleReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [averageRating, setAverageRating] = useState(0);
  const [isDemo, setIsDemo] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  useEffect(() => {
    // Carica le recensioni di Google tramite API
    const loadReviews = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/google-reviews');
        const data = await response.json();
          if (data.reviews && data.reviews.length > 0) {
          setReviews(data.reviews);
          setAverageRating(data.averageRating || 0);
          setIsDemo(data.isDemo || false);
          setMessage(data.message || null);
        } else {
          // Fallback ai dati mock se non ci sono recensioni
          setReviews(mockReviews);
          const avg = mockReviews.reduce((sum, review) => sum + review.rating, 0) / mockReviews.length;
          setAverageRating(Math.round(avg * 10) / 10);
          setIsDemo(true);
        }
        
        if (data.error) {
          console.warn('Google Reviews API warning:', data.error);
        }
      } catch (error) {
        console.error('Error loading reviews:', error);
        // Fallback ai dati mock in caso di errore
        setReviews(mockReviews);
        const avg = mockReviews.reduce((sum, review) => sum + review.rating, 0) / mockReviews.length;
        setAverageRating(Math.round(avg * 10) / 10);
      } finally {
        setLoading(false);
      }
    };

    loadReviews();
  }, []);

  const fadeInUp = {
    hidden: { opacity: 0, y: 60 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.8, 
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const cardVariant = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: { 
        duration: 0.6,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <motion.section 
        className="relative py-20 bg-gradient-to-br from-black via-gray-900 to-amber-900/20 overflow-hidden"
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
      >
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-amber-200/20 to-amber-400/20 rounded-full blur-xl"
            animate={{
              y: [-10, 10, -10],
              x: [-5, 5, -5],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 8,
              ease: "easeInOut",
              repeat: Infinity,
              repeatType: "reverse"
            }}
          />
          <motion.div
            className="absolute bottom-20 right-10 w-40 h-40 bg-gradient-to-br from-amber-300/15 to-orange-400/15 rounded-full blur-xl"
            animate={{
              y: [10, -10, 10],
              x: [5, -5, 5],
              scale: [1.1, 1, 1.1],
            }}
            transition={{
              duration: 10,
              ease: "easeInOut",
              repeat: Infinity,
              repeatType: "reverse",
              delay: 2
            }}
          />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div 
            className="text-center mb-16"
            variants={fadeInUp}
          >
            <motion.h1 
              className="text-5xl md:text-6xl font-bold mb-6"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
            >
              Cosa Dicono{" "}
              <motion.span 
                className="text-amber-600 inline-block"
                animate={{ 
                  textShadow: [
                    "0 0 0px rgba(245, 158, 11, 0)",
                    "0 0 25px rgba(245, 158, 11, 0.6)",
                    "0 0 0px rgba(245, 158, 11, 0)"
                  ]
                }}
                transition={{
                  duration: 4,
                  ease: "easeInOut",
                  repeat: Infinity,
                  repeatType: "reverse"
                }}
              >
                di Noi
              </motion.span>
            </motion.h1>
            
            <motion.p 
              className="text-xl text-gray-300 max-w-3xl mx-auto mb-8"
              variants={fadeInUp}
            >
              Le opinioni dei nostri clienti sono la nostra migliore pubblicità. 
              Scopri cosa pensano di Maskio Barber Concept!
            </motion.p>

            {/* Rating Summary */}
            <motion.div 
              className="flex flex-col sm:flex-row items-center justify-center gap-6 bg-white/10 backdrop-blur-sm rounded-2xl p-6 max-w-md mx-auto"
              variants={fadeInUp}
              whileHover={{ scale: 1.02 }}
            >
              <div className="text-center">
                <div className="text-4xl font-bold text-amber-400 mb-2">
                  {averageRating}/5
                </div>
                <StarRating rating={Math.round(averageRating)} />
              </div>
              
              <div className="text-center border-l border-white/20 pl-6">
                <div className="text-2xl font-semibold mb-1">
                  {reviews.length}+
                </div>
                <div className="text-gray-300 text-sm">
                  Recensioni Google
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* Reviews Section */}
      <motion.section 
        className="py-20 bg-gradient-to-br from-black to-gray-900"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={staggerContainer}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="text-center">
              <motion.div
                className="inline-block w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
              <p className="mt-4 text-gray-300">Caricamento recensioni...</p>
            </div>
          ) : (
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
              variants={staggerContainer}
            >
              {reviews.map((review, index) => (
                <motion.div
                  key={review.id}
                  variants={cardVariant}
                  className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-2xl p-6 hover:from-white/15 hover:to-white/10 transition-all duration-300 cursor-pointer"
                  whileHover={{ 
                    y: -5,
                    scale: 1.02,
                    boxShadow: "0 20px 40px rgba(0, 0, 0, 0.2)"
                  }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Header with profile and rating */}
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                      {review.author_name.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-white text-lg">
                        {review.author_name}
                      </h3>
                      <div className="flex items-center gap-2">
                        <StarRating rating={review.rating} />
                        <span className="text-gray-400 text-sm">
                          {review.relative_time_description}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Review text */}
                  <p className="text-gray-300 leading-relaxed mb-4">
                    "{review.text}"
                  </p>

                  {/* Google logo */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <svg className="w-4 h-4" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                      <span>Google</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </motion.section>

      {/* Call to Action */}
      <motion.section 
        className="py-20 bg-gradient-to-br from-amber-600 via-amber-500 to-orange-600 text-white"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={fadeInUp}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h2 
            className="text-4xl md:text-5xl font-bold mb-6"
            variants={fadeInUp}
          >
            Vuoi Essere il Prossimo Cliente Soddisfatto?
          </motion.h2>
          <motion.p 
            className="text-xl mb-8 opacity-90"
            variants={fadeInUp}
          >
            Prenota il tuo appuntamento e scopri perché siamo il barbiere più apprezzato della zona!
          </motion.p>
          <motion.div
            variants={fadeInUp}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <button className="bg-black text-white px-10 py-4 rounded-xl font-semibold text-lg shadow-lg hover:bg-gray-900 transition-all duration-300">
              Prenota Ora
            </button>
          </motion.div>
        </div>
      </motion.section>
    </div>
  );
}
