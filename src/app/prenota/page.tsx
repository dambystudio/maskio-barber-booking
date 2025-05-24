'use client';

import BookingForm from '../../components/BookingForm';
import { motion } from 'framer-motion';

export default function Page() {
  return (
    <div className="min-h-screen bg-gray-50 py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl mb-4">
            Prenota il tuo appuntamento
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Scegli il servizio perfetto per te e prenota con il nostro team di professionisti
          </p>
        </motion.div>
        
        <BookingForm />
      </div>
    </div>
  );
}
