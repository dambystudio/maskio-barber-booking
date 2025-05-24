'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import BookingButton from '../components/BookingButton';

export default function Home() {
  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 60 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.8, ease: "easeOut" }
    }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3
      }
    }
  };

  const scaleIn = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: { 
      scale: 1, 
      opacity: 1,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative h-screen">
        {/* Hero Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/sediaOro.jpg"
            alt="Maskio Barber Concept"
            fill
            className="object-cover brightness-[0.3]"
            priority
          />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center text-white px-4">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-4xl md:text-6xl font-bold tracking-tight mb-4"
          >
            Maskio Barber Concept
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl md:text-2xl mb-8 max-w-3xl"
          >
            Una nuova concezione del barbiere, dove tradizione e innovazione si incontrano per creare il tuo stile perfetto
          </motion.p>          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <BookingButton size="lg" className="text-lg">
              Prenota Subito
            </BookingButton>
            <Link href="/servizi">
              <motion.button 
                className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:text-black transition-all duration-200"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Scopri i Servizi
              </motion.button>
            </Link>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div 
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1 }}
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="flex flex-col items-center"
          >
            <span className="text-sm mb-2">Scorri per saperne di più</span>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </motion.div>
        </motion.div>
      </div>

      {/* About Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <motion.div variants={fadeInUp}>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                L'Arte del Barbiere Moderno
              </h2>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                Da oltre 10 anni, Maskio Barber Concept rappresenta l'eccellenza nella cura dell'uomo. 
                Il nostro team di professionisti esperti combina tecniche tradizionali con le ultime 
                tendenze per offrirti un'esperienza unica e personalizzata.
              </p>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                Ogni taglio, ogni rasatura, ogni trattamento è pensato per esaltare la tua personalità 
                e farti sentire al meglio. Perché per noi, ogni cliente è unico.
              </p>
              <Link href="/chi-siamo">
                <motion.button 
                  className="bg-black text-white px-8 py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors duration-200"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  La Nostra Storia
                </motion.button>
              </Link>
            </motion.div>

            <motion.div 
              variants={scaleIn}
              className="relative h-96 rounded-2xl overflow-hidden shadow-2xl"
            >
              <Image
                src="/taglio1.jpg"
                alt="Il nostro barbiere al lavoro"
                fill
                className="object-cover"
              />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Services Preview */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">I Nostri Servizi</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Dalla consulenza personalizzata ai trattamenti più avanzati, 
              offriamo una gamma completa di servizi per la cura dell'uomo moderno
            </p>
          </motion.div>

          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {[
              {
                title: 'Taglio & Styling',
                description: 'Tagli personalizzati per esaltare la tua personalità e stile',
                icon: '✂️',
                price: 'da 25€'
              },
              {
                title: 'Rasatura Tradizionale',
                description: 'L\'arte della rasatura con rasoio a mano libera',
                icon: '🪒',
                price: 'da 20€'
              },
              {
                title: 'Trattamenti Barba',
                description: 'Cura completa per una barba sempre perfetta',
                icon: '🧔',
                price: 'da 15€'
              }
            ].map((service, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="bg-gray-50 p-8 rounded-2xl text-center hover:shadow-lg transition-shadow duration-300"
                whileHover={{ y: -5 }}
              >
                <div className="text-4xl mb-4">{service.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{service.title}</h3>
                <p className="text-gray-600 mb-4">{service.description}</p>
                <div className="text-lg font-semibold text-yellow-600 mb-4">{service.price}</div>
              </motion.div>
            ))}
          </motion.div>

          <motion.div 
            className="text-center mt-12"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            <Link href="/servizi">
              <motion.button 
                className="bg-yellow-400 text-black px-8 py-3 rounded-lg font-semibold hover:bg-yellow-300 transition-colors duration-200"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Vedi Tutti i Servizi
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl font-bold mb-4">Perché Scegliere Maskio</h2>
            <p className="text-lg text-gray-300 max-w-3xl mx-auto">
              Non siamo solo un barbiere, siamo i tuoi partner nella cura del tuo stile
            </p>
          </motion.div>

          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {[
              {
                icon: '👨‍💼',
                title: 'Professionisti Esperti',
                description: 'Team di barbieri qualificati con anni di esperienza'
              },
              {
                icon: '🏆',
                title: 'Qualità Premium',
                description: 'Utilizziamo solo prodotti professionali di alta qualità'
              },
              {
                icon: '🎯',
                title: 'Stile Personalizzato',
                description: 'Ogni servizio è studiato per le tue esigenze specifiche'
              },
              {
                icon: '🌟',
                title: 'Esperienza Unica',
                description: 'Un ambiente moderno e accogliente per il tuo relax'
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="text-center"
                whileHover={{ scale: 1.05 }}
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-gray-300">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Gallery Preview */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">I Nostri Lavori</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Scopri alcune delle nostre creazioni e lasciati ispirare per il tuo prossimo look
            </p>
          </motion.div>

          <motion.div 
            className="grid grid-cols-2 md:grid-cols-4 gap-4"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {['/taglio1.jpg', '/taglio2.jpg', '/sediaOro.jpg', '/prodotti.jpg'].map((image, index) => (
              <motion.div
                key={index}
                variants={scaleIn}
                className="relative aspect-square rounded-lg overflow-hidden"
                whileHover={{ scale: 1.05 }}
              >
                <Image
                  src={image}
                  alt={`Lavoro ${index + 1}`}
                  fill
                  className="object-cover"
                />
              </motion.div>
            ))}
          </motion.div>

          <motion.div 
            className="text-center mt-12"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            <Link href="/blog">
              <motion.button 
                className="bg-black text-white px-8 py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors duration-200"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Vedi Tutte le Gallerie
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </section>      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-gray-900 to-gray-700 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl font-bold mb-6">Pronto per il Tuo Nuovo Look?</h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Prenota ora il tuo appuntamento e scopri l'esperienza Maskio Barber Concept
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <BookingButton size="lg" className="text-lg">
                Prenota il Tuo Appuntamento
              </BookingButton>
              <Link href="/contatti">
                <motion.button 
                  className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:text-black transition-all duration-200"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Contattaci
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
