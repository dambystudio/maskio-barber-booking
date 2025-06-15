'use client';

import { motion } from 'framer-motion';
import { StarIcon } from '@heroicons/react/24/solid';
import { useState, useEffect } from 'react';

interface GoogleReview {
  author_name: string;
  rating: number;
  text: string;
  time: number;
  profile_photo_url?: string;
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<GoogleReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/google-reviews');
      
      if (!response.ok) {
        throw new Error('Errore nel caricamento delle recensioni');
      }
      
      const data = await response.json();
      setReviews(data.reviews || []);
    } catch (error) {
      console.error('Errore:', error);
      setError('Impossibile caricare le recensioni al momento');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString('it-IT', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <StarIcon
        key={index}
        className={`w-5 h-5 ${
          index < rating ? 'text-yellow-400' : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <div className="min-h-screen bg-gray-900 py-16 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Cosa Dicono di Noi
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Le opinioni dei nostri clienti sono il nostro biglietto da visita. 
            Scopri cosa pensano del nostro servizio e della nostra professionalità.
          </p>
        </motion.div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400"></div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <p className="text-red-400 text-lg mb-4">{error}</p>
            <button
              onClick={fetchReviews}
              className="px-6 py-3 bg-yellow-400 text-black font-semibold rounded-lg hover:bg-yellow-500 transition-colors"
            >
              Riprova
            </button>
          </motion.div>
        )}

        {/* Reviews Grid */}
        {!loading && !error && reviews.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {reviews.map((review, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-700"
              >
                {/* Author Info */}
                <div className="flex items-center mb-4">
                  {review.profile_photo_url ? (
                    <img
                      src={review.profile_photo_url}
                      alt={review.author_name}
                      className="w-12 h-12 rounded-full mr-4"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center mr-4">
                      <span className="text-black font-bold text-lg">
                        {review.author_name.charAt(0)}
                      </span>
                    </div>
                  )}
                  <div>
                    <h3 className="text-white font-semibold">{review.author_name}</h3>
                    <p className="text-gray-400 text-sm">
                      {formatDate(review.time)}
                    </p>
                  </div>
                </div>

                {/* Rating */}
                <div className="flex items-center mb-4">
                  {renderStars(review.rating)}
                  <span className="ml-2 text-gray-300">({review.rating}/5)</span>
                </div>

                {/* Review Text */}
                <p className="text-gray-300 leading-relaxed">{review.text}</p>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* No Reviews State */}
        {!loading && !error && reviews.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <p className="text-gray-400 text-lg">
              Nessuna recensione disponibile al momento.
            </p>
          </motion.div>
        )}

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-16 p-8 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-lg"
        >
          <h2 className="text-2xl font-bold text-black mb-4">
            Vuoi lasciare anche tu una recensione?
          </h2>
          <p className="text-black/80 mb-6">
            Condividi la tua esperienza con Maskio Barber e aiuta altri clienti a scoprire i nostri servizi.
          </p>
          <a
            href="https://maps.google.com/maps?q=Maskio+Barber+Concept"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-8 py-3 bg-black text-white font-semibold rounded-lg hover:bg-gray-800 transition-colors"
          >
            Lascia una Recensione su Google
          </a>
        </motion.div>
      </div>
    </div>
  );
}
