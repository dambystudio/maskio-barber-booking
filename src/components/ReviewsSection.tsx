'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { StarIcon } from '@heroicons/react/24/solid';
import Link from 'next/link';
import BookingButton from './BookingButton';

interface GoogleReview {
  id: string;
  author_name: string;
  rating: number;
  text: string;
  relative_time_description: string;
}

interface ReviewsData {
  reviews: GoogleReview[];
  averageRating: number;
  totalReviews?: number;
  isDemo?: boolean;
  isFallback?: boolean;
  cached?: boolean;
  cacheExpired?: boolean;
  message?: string;
  error?: string;
  lastUpdated?: string;
}

const ReviewsSection = () => {
  const [reviews, setReviews] = useState<GoogleReview[]>([]);
  const [averageRating, setAverageRating] = useState(0);
  const [loading, setLoading] = useState(true);
  const [reviewsData, setReviewsData] = useState<ReviewsData | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const loadReviews = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/google-reviews', {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data: ReviewsData = await response.json();
      
      if (data.reviews && data.reviews.length > 0) {
        // Mostra solo le prime 3 recensioni sulla homepage
        setReviews(data.reviews.slice(0, 3));
        setAverageRating(data.averageRating || 0);
        setReviewsData(data);
      } else {
        // Se non ci sono recensioni, prova un retry
        if (retryCount < 2) {
          console.log(`Retry ${retryCount + 1}/2 - Nessuna recensione ricevuta`);
          setRetryCount(prev => prev + 1);
          setTimeout(loadReviews, 2000); // Retry dopo 2 secondi
          return;
        }
      }
    } catch (error) {
      console.error('Error loading reviews:', error);
      
      // Se fallisce, prova un retry
      if (retryCount < 2) {
        console.log(`Retry ${retryCount + 1}/2 dopo errore:`, error);
        setRetryCount(prev => prev + 1);
        setTimeout(loadReviews, 2000);
        return;
      }
      
      // Fallback locale dopo tutti i retry
      const fallbackData: ReviewsData = {
        reviews: [
          {
            id: 'local_fallback_1',
            author_name: 'Cliente Verificato',
            rating: 5,
            text: 'Servizio eccellente! Taglio perfetto e ambiente molto professionale.',
            relative_time_description: 'Recente'
          },
          {
            id: 'local_fallback_2', 
            author_name: 'Marco T.',
            rating: 5,
            text: 'Esperienza fantastica, consigliatissimo! Staff molto competente.',
            relative_time_description: 'Recente'
          },
          {
            id: 'local_fallback_3',
            author_name: 'Andrea R.',
            rating: 4,
            text: 'Ottimo servizio e prezzi onesti. Ambiente moderno e accogliente.',
            relative_time_description: 'Recente'
          }
        ],
        averageRating: 4.8,
        totalReviews: 25,
        isDemo: true,
        isFallback: true,
        message: 'Recensioni temporaneamente non disponibili - Mostrando dati di esempio'
      };
      
      setReviews(fallbackData.reviews);
      setAverageRating(fallbackData.averageRating);
      setReviewsData(fallbackData);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, []);

  // Funzione per riprovare il caricamento
  const handleRetry = () => {
    setRetryCount(0);
    loadReviews();
  };

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

  const StarRating = ({ rating }: { rating: number }) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <StarIcon 
            key={star}
            className={`w-4 h-4 ${star <= rating ? 'text-yellow-400' : 'text-gray-400'}`}
          />
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <motion.section className="py-20 bg-gradient-to-br from-black via-gray-900 to-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            className="inline-block w-8 h-8 border-2 border-yellow-500 border-t-transparent rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
        </div>
      </motion.section>
    );
  }

  return (
    <motion.section 
      className="py-20 bg-gradient-to-br from-black via-gray-900 to-gray-800 relative overflow-hidden"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={staggerContainer}
    >
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-16 right-16 w-2 h-2 bg-amber-400/30 rounded-full"
          animate={{
            scale: [1, 2, 1],
            opacity: [0.3, 0.8, 0.3]
          }}
          transition={{
            duration: 4,
            ease: "easeInOut",
            repeat: Infinity,
            repeatType: "reverse"
          }}
        />
        <motion.div
          className="absolute bottom-20 left-20 w-3 h-3 bg-amber-300/20 rounded-full"
          animate={{
            y: [10, -10, 10],
            scale: [1.2, 0.8, 1.2],
            opacity: [0.2, 0.6, 0.2]
          }}
          transition={{
            duration: 6,
            ease: "easeInOut",
            repeat: Infinity,
            repeatType: "reverse",
            delay: 1
          }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div 
          className="text-center mb-16"
          variants={fadeInUp}
        >
          <motion.h2 
            className="text-4xl md:text-5xl font-bold text-white mb-4"
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
              i Nostri Clienti
            </motion.span>
          </motion.h2>
          
          <motion.p 
            className="text-lg text-gray-300 max-w-3xl mx-auto mb-8"
            variants={fadeInUp}
          >
            Le recensioni autentiche dei nostri clienti parlano per noi
          </motion.p>          {/* Rating Summary */}
          {averageRating > 0 && (
            <motion.div 
              className="flex items-center justify-center gap-4 bg-white/10 backdrop-blur-sm rounded-xl p-4 max-w-xs mx-auto"
              variants={fadeInUp}
              whileHover={{ scale: 1.02 }}
            >
              <div className="text-2xl font-bold text-amber-400">
                {averageRating}/5
              </div>
              <div className="flex flex-col items-center">
                <StarRating rating={Math.round(averageRating)} />                <span className="text-xs text-gray-400 mt-1">
                  {reviewsData?.isDemo ? 'Demo Reviews' : 'Google Reviews'}
                </span>
              </div>
            </motion.div>
          )}          {/* Demo/Error Messages */}
          {reviewsData?.message && (reviewsData.isDemo || reviewsData.isFallback || reviewsData.cacheExpired) && (
            <motion.div 
              className={`border rounded-lg p-3 max-w-md mx-auto mt-4 ${
                reviewsData.isFallback || reviewsData.error 
                  ? 'bg-red-500/20 border-red-500/30' 
                  : 'bg-amber-500/20 border-amber-500/30'
              }`}
              variants={fadeInUp}
            >
              <p className={`text-sm text-center ${
                reviewsData.isFallback || reviewsData.error 
                  ? 'text-red-200' 
                  : 'text-amber-200'
              }`}>
                {reviewsData.message}
              </p>
              {reviewsData.isFallback && (
                <button
                  onClick={handleRetry}
                  className="mt-2 px-3 py-1 bg-amber-500 text-white text-xs rounded-md hover:bg-amber-600 transition-colors mx-auto block"
                >
                  Riprova
                </button>
              )}
            </motion.div>
          )}
        </motion.div>

        {reviews.length > 0 && (
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12"
            variants={staggerContainer}
          >
            {reviews.map((review, index) => (
              <motion.div
                key={review.id}
                className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-2xl p-6 text-white"
                variants={fadeInUp}
                whileHover={{ 
                  y: -5,
                  scale: 1.02,
                  background: "linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.08) 100%)"
                }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center text-white font-bold">
                    {review.author_name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-semibold">{review.author_name}</h4>
                    <div className="flex items-center gap-2">
                      <StarRating rating={review.rating} />
                      <span className="text-xs text-gray-400">
                        {review.relative_time_description}
                      </span>
                    </div>
                  </div>
                </div>
                
                <p className="text-gray-300 text-sm leading-relaxed">
                  "{review.text}"
                </p>

                {/* Google logo */}
                <div className="flex items-center gap-1 mt-4 text-xs text-gray-400">
                  <svg className="w-3 h-3" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <span>Google</span>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        <motion.div 
          className="text-center"
          variants={fadeInUp}
        >
          <Link href="/testimonianze">
            <motion.button 
              className="bg-gradient-to-r from-amber-500 to-amber-600 text-white px-8 py-3 rounded-xl font-semibold shadow-lg transition-all duration-300"
              whileHover={{
                boxShadow: "0 15px 30px rgba(245, 158, 11, 0.3)",
                y: -2,
                scale: 1.05
              }}
              whileTap={{ scale: 0.98 }}
            >
              Vedi Tutte le Recensioni
            </motion.button>
          </Link>
        </motion.div>
      </div>
    </motion.section>
  );
};

export default ReviewsSection;
