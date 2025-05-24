'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import BookingButton from '../../components/BookingButton';

const services = [
  {
    name: 'Taglio Classico',
    description: 'Taglio personalizzato con finish styling',
    duration: '45 min',
    price: '28',
  },
  {
    name: 'Barba',
    description: 'Rifinitura barba con asciugatura e prodotti specifici',
    duration: '30 min',
    price: '25',
  },
  {
    name: 'Taglio & Barba',
    description: 'Servizio completo di taglio capelli e rifinitura barba',
    duration: '75 min',
    price: '48',
  },
  {
    name: 'Shampoo & Styling',
    description: 'Lavaggio con prodotti premium e styling personalizzato',
    duration: '20 min',
    price: '15',
  },
  {
    name: 'Trattamento Deluxe',
    description: 'Taglio, barba, maschera e massaggio del cuoio capelluto',
    duration: '90 min',
    price: '65',
  },
];

export default function Servizi() {
  return (
    <main className="relative min-h-screen pt-24 pb-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-6">I Nostri Servizi</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Scopri la nostra gamma completa di servizi professionali per la cura
            dei capelli e della barba
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {services.map((service, index) => (
            <motion.div
              key={service.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold">{service.name}</h3>
                  <p className="text-gray-600">{service.description}</p>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-bold">€{service.price}</span>
                  <p className="text-sm text-gray-500">{service.duration}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="text-center bg-white p-8 rounded-lg shadow-sm"
        >
          <h2 className="text-2xl font-bold mb-4">Pronto per prenotare?</h2>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Scegli il servizio che fa per te e prenota il tuo appuntamento con il nostro team di professionisti
          </p>
          <BookingButton size="lg">
            Prenota Ora
          </BookingButton>
        </motion.div>
      </div>
    </main>
  );
}