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
    <main className="min-h-screen bg-white py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <motion.h1 
            className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl mb-8"
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
              href="tel:+393123456789"
              className="bg-gray-50 p-6 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors duration-200 block"
              variants={fadeInUp}
              {...cardHover}
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-2">📞 Telefono</h3>
              <p className="text-gray-600">+39 312 345 6789</p>
              <p className="text-sm text-blue-600 mt-2">Tocca per chiamare</p>
            </motion.a>

            {/* Email */}
            <motion.a 
              href="mailto:info@maskiobarber.com"
              className="bg-gray-50 p-6 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors duration-200 block"
              variants={fadeInUp}
              {...cardHover}
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-2">✉️ Email</h3>
              <p className="text-gray-600">info@maskiobarber.com</p>
              <p className="text-sm text-blue-600 mt-2">Tocca per scrivere</p>
            </motion.a>

            {/* Address */}
            <motion.a 
              href="https://maps.google.com/?q=Via+Roma+123+Milano"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-gray-50 p-6 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors duration-200 block"
              variants={fadeInUp}
              {...cardHover}
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-2">📍 Indirizzo</h3>
              <p className="text-gray-600">Via Roma, 123<br />Milano, MI 20121</p>
              <p className="text-sm text-blue-600 mt-2">Tocca per navigare</p>
            </motion.a>          </motion.div>

          {/* Quick Actions */}
          <motion.div 
            className="mt-8 flex flex-wrap justify-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <motion.a
              href="tel:+393123456789"
              className="bg-green-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-600 transition-colors duration-200 flex items-center gap-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              📞 Chiama Ora
            </motion.a>
            <motion.a
              href="https://wa.me/393123456789"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors duration-200 flex items-center gap-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              💬 WhatsApp
            </motion.a>
            <motion.a
              href="mailto:info@maskiobarber.com"
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
              className="text-2xl font-semibold text-gray-900 mb-6"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              Orari di Apertura
            </motion.h2>
            <motion.div 
              className="max-w-2xl mx-auto bg-gray-50 p-6 rounded-lg"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              whileHover={{ 
                scale: 1.02,
                boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                transition: { duration: 0.3 }
              }}
            >
              <div className="grid grid-cols-2 gap-4">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 1.0 }}
                >
                  <h3 className="font-medium text-gray-900">Lunedì - Venerdì</h3>
                  <p className="text-gray-600">09:00 - 19:00</p>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 1.1 }}
                >
                  <h3 className="font-medium text-gray-900">Sabato</h3>
                  <p className="text-gray-600">09:00 - 18:00</p>
                </motion.div>
                <motion.div 
                  className="col-span-2"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 1.2 }}
                >
                  <h3 className="font-medium text-gray-900">Domenica</h3>
                  <p className="text-gray-600">Chiuso</p>
                </motion.div>
              </div>            </motion.div>
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
