'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: "easeOut" }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.15
    }
  }
};

const cardHover = {
  whileHover: { 
    scale: 1.05,
    y: -5,
    boxShadow: "0 15px 30px rgba(0,0,0,0.1)",
    transition: { duration: 0.3, ease: "easeOut" }
  }
};

const imageHover = {
  whileHover: { 
    scale: 1.1,
    transition: { duration: 0.4, ease: "easeOut" }
  }
};

export default function ChiSiamo() {
  return (
    <main className="relative min-h-screen pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center mb-16"
        >
          <motion.h1 
            className="text-4xl md:text-5xl font-bold mb-6"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
          >
            Chi Siamo
          </motion.h1>
          <motion.p 
            className="text-xl text-gray-600 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
          >
            Da anni nel settore del grooming maschile, portiamo stile e professionalità
            nel cuore di San Giovanni Rotondo.
          </motion.p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          >
            <motion.div 
              className="relative h-[400px] rounded-lg overflow-hidden"
              {...imageHover}
            >
              <Image
                src="/taglio1.jpg"
                alt="Il nostro salone"
                fill
                className="object-cover"
              />
            </motion.div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
            className="space-y-6"
          >
            <motion.h2 
              className="text-3xl font-semibold"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              La Nostra Storia
            </motion.h2>
            <motion.p 
              className="text-gray-600"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
            >
              Maskio Barber Concept nasce dalla passione per l&apos;arte del barbiere
              e dalla volontà di creare un ambiente dove tradizione e modernità si
              fondono perfettamente. Il nostro obiettivo è offrire non solo un
              servizio, ma un&apos;esperienza completa di grooming maschile.
            </motion.p>
            <motion.p 
              className="text-gray-600"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
            >
              Ogni dettaglio del nostro salone è stato pensato per garantire
              comfort e stile, mentre il nostro team di professionisti si dedica
              a soddisfare le esigenze di ogni cliente con cura e attenzione.
            </motion.p>
          </motion.div>
        </div>

        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="grid md:grid-cols-3 gap-8"
        >
          <motion.div 
            className="text-center p-6 rounded-lg bg-gray-50 cursor-pointer"
            variants={fadeInUp}
            {...cardHover}
          >
            <motion.h3 
              className="text-xl font-semibold mb-4"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 1.0 }}
            >
              Esperienza
            </motion.h3>
            <p className="text-gray-600">
              Anni di esperienza nel settore e formazione continua per essere
              sempre aggiornati sulle ultime tendenze.
            </p>
          </motion.div>
          <motion.div 
            className="text-center p-6 rounded-lg bg-gray-50 cursor-pointer"
            variants={fadeInUp}
            {...cardHover}
          >
            <motion.h3 
              className="text-xl font-semibold mb-4"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 1.1 }}
            >
              Qualità
            </motion.h3>
            <p className="text-gray-600">
              Utilizziamo solo prodotti di alta qualità per garantire i migliori
              risultati ai nostri clienti.
            </p>
          </motion.div>
          <motion.div 
            className="text-center p-6 rounded-lg bg-gray-50 cursor-pointer"
            variants={fadeInUp}
            {...cardHover}
          >
            <motion.h3 
              className="text-xl font-semibold mb-4"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 1.2 }}
            >
              Stile
            </motion.h3>
            <p className="text-gray-600">
              Un ambiente moderno e accogliente dove rilassarsi e prendersi
              cura del proprio look.
            </p>
          </motion.div>
        </motion.div>
      </div>
    </main>
  );
}