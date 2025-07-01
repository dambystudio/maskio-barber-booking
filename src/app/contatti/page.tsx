'use client';

import { motion } from 'framer-motion';
import BookingButton from '../../components/BookingButton';

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: "easeOut" }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

const cardHover = {
  whileHover: { 
    scale: 1.05, 
    transition: { duration: 0.3, ease: "easeOut" }
  }
};

export default function Page() {
  return (
    <main className="min-h-screen bg-black py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <motion.h1 
            className="text-4xl font-bold tracking-tight text-white sm:text-5xl mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            Contattaci
          </motion.h1>
          
          <motion.div 
            className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            {/* Phone */}
            <motion.a 
              href="tel:+393317100730"
              className="bg-gray-900 border border-gray-800 p-6 rounded-lg cursor-pointer hover:bg-gray-800 transition-colors duration-200 block"
              variants={fadeInUp}
              {...cardHover}
            >
              <h3 className="text-lg font-semibold text-white mb-2">📞 Telefono</h3>
              <p className="text-gray-300">+39 331 710 0730</p>
              <p className="text-sm text-yellow-400 mt-2">Tocca per chiamare</p>
            </motion.a>
            
            {/* Email */}
            <motion.a 
              href="mailto:fabio.cassano97@icloud.com"
              className="bg-gray-900 border border-gray-800 p-6 rounded-lg cursor-pointer hover:bg-gray-800 transition-colors duration-200 block"
              variants={fadeInUp}
              {...cardHover}
            >
              <h3 className="text-lg font-semibold text-white mb-2">✉️ Email</h3>
              <p className="text-gray-300">fabio.cassano97@icloud.com</p>
              <p className="text-sm text-yellow-400 mt-2">Tocca per scrivere</p>
            </motion.a>

            {/* Address */}
            <motion.a 
              href="https://maps.google.com/?q=Via+Sant'Agata+24+San+Giovanni+Rotondo+FG"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-gray-900 border border-gray-800 p-6 rounded-lg cursor-pointer hover:bg-gray-800 transition-colors duration-200 block"
              variants={fadeInUp}
              {...cardHover}
            >
              <h3 className="text-lg font-semibold text-white mb-2">📍 Indirizzo</h3>
              <p className="text-gray-300">Via Sant'Agata, 24<br />San Giovanni Rotondo (FG) 71013</p>
              <p className="text-sm text-yellow-400 mt-2">Tocca per navigare</p>
            </motion.a>
          </motion.div>

          {/* Quick Actions */}
          <motion.div 
            className="mt-8 flex flex-wrap justify-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <motion.a
              href="tel:+393317100730"
              className="bg-green-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-600 transition-colors duration-200 flex items-center gap-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              📞 Chiama Ora
            </motion.a>
            <motion.a
              href="https://wa.me/393317100730"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors duration-200 flex items-center gap-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              💬 WhatsApp
            </motion.a>
            <motion.a
              href="mailto:fabio.cassano97@icloud.com"
              className="bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-600 transition-colors duration-200 flex items-center gap-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              ✉️ Email
            </motion.a>
          </motion.div>

          {/* Operating Hours */}
          <motion.div 
            className="mt-12"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
          >
            <motion.h2 
              className="text-2xl font-semibold text-white mb-6"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              Orari di Apertura
            </motion.h2>
            <motion.div 
              className="max-w-2xl mx-auto bg-gray-900 border border-gray-800 p-6 rounded-lg"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              whileHover={{ 
                scale: 1.02,
                boxShadow: "0 10px 25px rgba(0,0,0,0.3)",
                transition: { duration: 0.3 }
              }}
            >
              <div className="grid grid-cols-2 gap-4">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 1.0 }}
                >
                  <h3 className="font-medium text-white">Lunedì - Sabato</h3>
                  <p className="text-gray-300">09:00 - 13:00</p>
                  <p className="text-gray-300">15:00 - 18:00</p>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 1.1 }}
                >
                  <h3 className="font-medium text-white">Giovedì</h3>
                  <p className="text-red-400">Chiuso</p>
                </motion.div>
                <motion.div 
                  className="col-span-2"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 1.2 }}
                >
                  <h3 className="font-medium text-white">Domenica</h3>
                  <p className="text-red-400">Chiuso</p>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>

          {/* Call to Action */}
          <motion.div 
            className="mt-12 text-center"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.4, ease: "easeOut" }}
          >
            <motion.div 
              className="bg-gradient-to-r from-yellow-400 to-yellow-300 p-8 rounded-lg"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 1.6 }}
              whileHover={{ 
                scale: 1.02,
                transition: { duration: 0.3 }
              }}
            >
              <h2 className="text-2xl font-bold text-black mb-4">
                Pronto per il tuo nuovo look?
              </h2>
              <p className="text-black/80 mb-6 max-w-2xl mx-auto">
                Non aspettare! Prenota subito il tuo appuntamento e lasciati trasformare dai nostri esperti.
              </p>
              <BookingButton variant="secondary" size="lg">
                Prenota Ora
              </BookingButton>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </main>
  );
}
