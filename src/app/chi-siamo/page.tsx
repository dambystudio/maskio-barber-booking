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
    <main className="relative min-h-screen pt-28 pb-24 bg-black overflow-hidden">
      {/* Elementi decorativi di sfondo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.4 }}
          transition={{ duration: 1.5 }}
          className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-br from-amber-300/5 to-amber-600/4 rounded-full blur-3xl"
        />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.3 }}
          transition={{ duration: 1.5, delay: 0.3 }}
          className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-br from-amber-400/4 to-orange-500/4 rounded-full blur-3xl"
        />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.2 }}
          transition={{ duration: 1.5, delay: 0.5 }}
          className="absolute top-1/3 right-1/4 w-64 h-64 bg-gradient-to-tr from-amber-500/5 to-amber-600/3 rounded-full blur-3xl"
        />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.15 }}
          transition={{ duration: 1.5, delay: 0.7 }}
          className="absolute bottom-1/3 left-1/5 w-80 h-80 bg-gradient-to-tl from-orange-400/5 to-amber-300/3 rounded-full blur-3xl"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black to-black/80"></div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center mb-20"
        >
          <div className="relative inline-block mb-3">
            <motion.span
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ duration: 1.2, delay: 0.5, ease: "easeInOut" }}
              className="absolute h-[1px] bg-gradient-to-r from-amber-500/50 to-amber-500/0 top-0 left-0"
            />
            <motion.span
              initial={{ width: 0 }}
              animate={{ width: "80%" }}
              transition={{ duration: 1.2, delay: 0.7, ease: "easeInOut" }}
              className="absolute h-[1px] bg-gradient-to-r from-amber-500/30 to-amber-500/0 top-2 left-[10%]"
            />
            <motion.h1 
              className="text-5xl md:text-7xl font-bold mb-6 text-white tracking-wide relative inline-block py-4 font-serif"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            >
              <span className="text-amber-400">Chi</span> Siamo
            </motion.h1>
            <motion.span
              initial={{ width: 0 }}
              animate={{ width: "80%" }}
              transition={{ duration: 1.2, delay: 0.7, ease: "easeInOut" }}
              className="absolute h-[1px] bg-gradient-to-r from-amber-500/30 to-amber-500/0 bottom-2 left-[10%]"
            />
            <motion.span
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ duration: 1.2, delay: 0.5, ease: "easeInOut" }}
              className="absolute h-[1px] bg-gradient-to-r from-amber-500/50 to-amber-500/0 bottom-0 left-0"
            />
          </div>
          
          <motion.p 
            className="text-xl text-gray-300 max-w-3xl mx-auto font-light leading-relaxed tracking-wide"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
          >
            <span className="text-amber-300/90">Da anni</span> nel settore del grooming maschile, portiamo stile e professionalità
            nel cuore di <span className="italic font-medium text-white">San Giovanni Rotondo</span>.
          </motion.p>
          
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, delay: 1.0, ease: "easeOut" }}
            className="flex justify-center mt-8"
          >
            <div className="h-1 w-24 bg-gradient-to-r from-amber-500/60 to-transparent rounded-full" />
          </motion.div>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-16 items-center mb-28">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="relative"
          >
            {/* Cornice decorativa */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.6 }}
              className="absolute -top-6 -left-6 w-[40%] h-[40%] border-l-2 border-t-2 border-amber-400/40 z-10"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.7 }}
              className="absolute -bottom-6 -right-6 w-[40%] h-[40%] border-r-2 border-b-2 border-amber-400/40 z-10"
            />
            
            <motion.div 
              className="relative h-[480px] rounded-lg overflow-hidden shadow-2xl"
              {...imageHover}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-amber-900/30 to-black/30 mix-blend-multiply z-10" />
              
              <motion.div
                initial={{ opacity: 0, scale: 1.1 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className="absolute inset-0 h-full w-full"
              >
                <Image
                  src="/fotoBarbieri_dietro.jpg"
                  alt="Il nostro salone"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority
                  quality={85}
                />
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1 }}
                className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent py-8 px-6 z-20"
              >
                <p className="text-amber-200 text-lg font-light italic tracking-wider text-center font-serif">
                  "L'eccellenza è una tradizione che rinnoviamo ogni giorno"
                </p>
              </motion.div>
            </motion.div>
            
            {/* Photo corner accents */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.8 }}
              transition={{ duration: 0.6, delay: 1.2 }}
              className="absolute -top-2 -left-2 w-12 h-12 border-t-2 border-l-2 border-amber-400/50 rounded-tl-lg z-20"
            />
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.8 }}
              transition={{ duration: 0.6, delay: 1.3 }}
              className="absolute -bottom-2 -right-2 w-12 h-12 border-b-2 border-r-2 border-amber-400/50 rounded-br-lg z-20"
            />
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
            className="space-y-8"
          >
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: 120 }}
              transition={{ duration: 1, delay: 0.5 }}
              className="h-[2px] bg-gradient-to-r from-amber-500/80 to-amber-500/0"
            />
            
            <motion.h2 
              className="text-4xl font-semibold text-white tracking-wide"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              La Nostra <span className="text-amber-400">Storia</span>
            </motion.h2>
            
            <motion.p 
              className="text-gray-300 leading-relaxed text-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
            >
              <span className="text-amber-300/90 font-medium">Maskio Barber Concept</span> nasce dalla passione per l&apos;arte del barbiere
              e dalla volontà di creare un ambiente dove tradizione e modernità si
              fondono perfettamente. Il nostro obiettivo è offrire non solo un
              servizio, ma un&apos;esperienza completa di grooming maschile.
            </motion.p>
            
            <motion.p 
              className="text-gray-300 leading-relaxed text-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
            >
              Ogni dettaglio del nostro salone è stato pensato per garantire
              comfort e stile, mentre il nostro team di professionisti si dedica
              a soddisfare le esigenze di ogni cliente con cura e attenzione.
            </motion.p>
            
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: 80 }}
              transition={{ duration: 1, delay: 0.9 }}
              className="h-[2px] bg-gradient-to-r from-amber-500/80 to-amber-500/0 ml-auto"
            />
          </motion.div>
        </div>

        <motion.h2 
          className="text-center text-3xl font-semibold text-white mb-16"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.0 }}
        >
          I Nostri <span className="text-amber-400">Valori</span>
        </motion.h2>
        
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="grid md:grid-cols-3 gap-10"
        >
          <motion.div 
            className="relative p-8 rounded-xl bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-800 cursor-pointer overflow-hidden group"
            variants={fadeInUp}
            {...cardHover}
          >
            <motion.div
              className="absolute top-0 left-0 h-1 w-0 bg-gradient-to-r from-amber-300 to-amber-500"
              initial={{ width: 0 }}
              animate={{ width: "30%" }}
              transition={{ duration: 0.8, delay: 1.2 }}
            />
            
            <div className="flex flex-col items-center">
              <motion.div
                className="w-16 h-16 mb-6 rounded-full bg-gradient-to-br from-amber-400/30 to-amber-600/10 flex items-center justify-center"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, type: "spring", delay: 1.3 }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" 
                  className="w-8 h-8 text-amber-400" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <circle cx="12" cy="10" r="3" />
                  <path d="M7 21v-2a4 4 0 0 1 4-4h2a4 4 0 0 1 4 4v2" />
                </svg>
              </motion.div>
              
              <motion.h3 
                className="text-xl font-semibold mb-4 text-white"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 1.0 }}
              >
                Esperienza
              </motion.h3>
              
              <p className="text-gray-300 leading-relaxed text-center">
                Anni di esperienza nel settore e formazione continua per essere
                sempre aggiornati sulle ultime tendenze.
              </p>
            </div>
            
            <motion.div 
              className="absolute bottom-0 left-0 h-full w-full opacity-0 bg-gradient-to-t from-amber-500/20 to-transparent group-hover:opacity-100 transition-opacity duration-500"
            />
          </motion.div>
          
          <motion.div 
            className="relative p-8 rounded-xl bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-800 cursor-pointer overflow-hidden group"
            variants={fadeInUp}
            {...cardHover}
          >
            <motion.div
              className="absolute top-0 left-0 h-1 w-0 bg-gradient-to-r from-amber-300 to-amber-500"
              initial={{ width: 0 }}
              animate={{ width: "30%" }}
              transition={{ duration: 0.8, delay: 1.3 }}
            />
            
            <div className="flex flex-col items-center">
              <motion.div
                className="w-16 h-16 mb-6 rounded-full bg-gradient-to-br from-amber-400/30 to-amber-600/10 flex items-center justify-center"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, type: "spring", delay: 1.4 }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" 
                  className="w-8 h-8 text-amber-400" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
              </motion.div>
              
              <motion.h3 
                className="text-xl font-semibold mb-4 text-white"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 1.1 }}
              >
                Qualità
              </motion.h3>
              
              <p className="text-gray-300 leading-relaxed text-center">
                Utilizziamo solo prodotti di alta qualità per garantire i migliori
                risultati ai nostri clienti.
              </p>
            </div>
            
            <motion.div 
              className="absolute bottom-0 left-0 h-full w-full opacity-0 bg-gradient-to-t from-amber-500/20 to-transparent group-hover:opacity-100 transition-opacity duration-500"
            />
          </motion.div>
          
          <motion.div 
            className="relative p-8 rounded-xl bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-800 cursor-pointer overflow-hidden group"
            variants={fadeInUp}
            {...cardHover}
          >
            <motion.div
              className="absolute top-0 left-0 h-1 w-0 bg-gradient-to-r from-amber-300 to-amber-500"
              initial={{ width: 0 }}
              animate={{ width: "30%" }}
              transition={{ duration: 0.8, delay: 1.4 }}
            />
            
            <div className="flex flex-col items-center">
              <motion.div
                className="w-16 h-16 mb-6 rounded-full bg-gradient-to-br from-amber-400/30 to-amber-600/10 flex items-center justify-center"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, type: "spring", delay: 1.5 }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" 
                  className="w-8 h-8 text-amber-400" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z" />
                  <line x1="16" y1="8" x2="2" y2="22" />
                  <line x1="17.5" y1="15" x2="9" y2="15" />
                </svg>
              </motion.div>
              
              <motion.h3 
                className="text-xl font-semibold mb-4 text-white"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 1.2 }}
              >
                Stile
              </motion.h3>
              
              <p className="text-gray-300 leading-relaxed text-center">
                Un ambiente moderno e accogliente dove rilassarsi e prendersi
                cura del proprio look.
              </p>
            </div>
            
            <motion.div 
              className="absolute bottom-0 left-0 h-full w-full opacity-0 bg-gradient-to-t from-amber-500/20 to-transparent group-hover:opacity-100 transition-opacity duration-500"
            />
          </motion.div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.6 }}
          className="flex justify-center mt-20"
        >
          <div className="inline-block">
            <div className="relative px-6 py-3 border border-amber-500/30 rounded-md overflow-hidden group cursor-pointer">
              <div className="absolute inset-0 w-0 bg-gradient-to-r from-amber-500/20 to-amber-500/10 transition-all duration-500 ease-out group-hover:w-full"></div>
              <a href="/contatti" className="relative text-amber-400 text-sm tracking-widest uppercase">Contattaci</a>
            </div>
          </div>
        </motion.div>
      </div>
    </main>
  );
}