'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import BookingButton from '../../components/BookingButton';
import { barbersFromData } from '../../data/booking'; // Import barbersFromData

export default function Servizi() {
  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 60 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.8, ease: "easeOut" }
    }
  };

  const fadeInLeft = {
    hidden: { opacity: 0, x: -60 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { duration: 0.8, ease: "easeOut" }
    }
  };

  const fadeInRight = {
    hidden: { opacity: 0, x: 60 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { duration: 0.8, ease: "easeOut" }
    }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2
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
    <main className="relative min-h-screen pt-24 pb-16 bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-white">I Nostri Servizi</h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Scopri i servizi personalizzati dei nostri esperti barbieri. Ogni professionista 
            ha le sue specialità per offrirti sempre il miglior risultato.
          </p>
        </motion.div>

        {/* Barbers Comparison */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {barbersFromData.map((barber, index) => ( // Use barbersFromData
            <motion.div
              key={barber.id}              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              variants={index === 0 ? fadeInLeft : fadeInRight}
              className="bg-gray-900 border border-gray-800 rounded-2xl shadow-xl overflow-hidden"
            >              {/* Barber Header */}
              <div className="relative h-64 bg-gradient-to-br from-black to-gray-900">
                <Image
                  src={barber.image}
                  alt={barber.name}
                  fill
                  className="object-cover opacity-80"
                />
                <div className="absolute inset-0 bg-black bg-opacity-40"></div>
                <div className="absolute bottom-6 left-6 text-white">
                  <motion.h2 
                    className="text-3xl font-bold mb-2"
                    variants={fadeInUp}
                  >
                    {barber.name}
                  </motion.h2>
                  <motion.p 
                    className="text-lg opacity-90"
                    variants={fadeInUp}
                  >
                    {barber.experience}
                  </motion.p>
                  <motion.div 
                    className="flex flex-wrap gap-2 mt-3"
                    variants={staggerContainer}
                  >                    {(typeof barber.specialties === 'string' 
                      ? JSON.parse(barber.specialties) 
                      : barber.specialties || []
                    ).map((specialty: string, idx: number) => (
                      <motion.span
                        key={idx}
                        variants={scaleIn}
                        className="px-3 py-1 bg-yellow-400 text-gray-900 text-sm font-medium rounded-full"
                      >
                        {specialty}
                      </motion.span>
                    ))}
                  </motion.div>
                </div>
              </div>

              {/* Services List */}
              <div className="p-6">                <motion.h3 
                  className="text-xl font-bold mb-4 text-white"
                  variants={fadeInUp}
                >
                  Servizi Specializzati
                </motion.h3>
                <motion.div 
                  className="space-y-4"
                  variants={staggerContainer}
                >
                  {(barber.availableServices || []).map((service) => ( // Add null check for availableServices
                    <motion.div                      key={service.id}
                      variants={scaleIn}
                      whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
                      className="border border-gray-700 bg-gray-800/50 rounded-lg p-4 hover:shadow-md hover:border-gray-600 transition-all"
                    >                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold text-white">{service.name}</h4>
                        <span className="text-2xl font-bold text-yellow-400">
                          {service.price === 0 ? '-' : `€${service.price}`}
                        </span>
                      </div>
                      <p className="text-gray-300 text-sm mb-2">{service.description}</p>
                      <div className="flex items-center text-gray-400 text-sm">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.414-1.414L11 9.586V6z" clipRule="evenodd" />
                        </svg>
                        {service.duration} min
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              </div>              {/* CTA Button */}
              <div className="px-6 pb-6">
                <motion.div
                  variants={scaleIn}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="relative z-10"
                >                  <BookingButton 
                    disableAnimation={true}
                    className="w-full bg-black hover:bg-gray-900 border border-yellow-400 text-yellow-400 hover:text-black hover:bg-yellow-400 font-semibold py-3 px-6 rounded-lg transition-colors relative z-10 opacity-100 visible">
                    Prenota con {barber.name}
                  </BookingButton>
                </motion.div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* General CTA Section */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}          variants={fadeInUp}
          className="text-center bg-gray-900 border border-gray-800 rounded-2xl shadow-xl p-12"
        >
          <h2 className="text-3xl font-bold mb-4 text-white">
            Non Sai Quale Scegliere?
          </h2>
          <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto">
            I nostri barbieri sapranno consigliarti il servizio perfetto per le tue esigenze.
            Prenota ora e lasciati guidare dalla loro esperienza.
          </p>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <BookingButton className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold py-4 px-8 rounded-lg text-lg transition-colors">
              Prenota Subito
            </BookingButton>
          </motion.div>
        </motion.div>
      </div>
    </main>
  );
}