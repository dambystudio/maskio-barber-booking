'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { useState } from 'react';

export default function Page() {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  
  // Professional Animation Variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 60 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.8, 
        ease: [0.25, 0.46, 0.45, 0.94],
        type: "spring",
        stiffness: 100
      }
    }
  };

  const fadeInLeft = {
    hidden: { opacity: 0, x: -50, scale: 0.95 },
    visible: { 
      opacity: 1, 
      x: 0,
      scale: 1,
      transition: { 
        duration: 0.7,
        ease: [0.25, 0.46, 0.45, 0.94],
        type: "spring",
        stiffness: 120
      }
    }
  };

  const fadeInRight = {
    hidden: { opacity: 0, x: 50, scale: 0.95 },
    visible: { 
      opacity: 1, 
      x: 0,
      scale: 1,
      transition: { 
        duration: 0.7,
        ease: [0.25, 0.46, 0.45, 0.94],
        type: "spring",
        stiffness: 120
      }
    }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1,
        duration: 0.6
      }
    }
  };

  const scaleIn = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: { 
      scale: 1, 
      opacity: 1,
      transition: { 
        duration: 0.6, 
        ease: [0.25, 0.46, 0.45, 0.94],
        type: "spring",
        stiffness: 150
      }
    }
  };

  const slideInFromBottom = {
    hidden: { y: 50, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.8,
        ease: [0.25, 0.46, 0.45, 0.94],
        type: "spring",
        stiffness: 100
      }
    }
  };

  const parallaxFloat = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.8,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    }
  };

  const magneticHover = {
    rest: { scale: 1, rotateZ: 0 },
    hover: { 
      scale: 1.05, 
      rotateZ: 1,
      transition: {
        duration: 0.3,
        ease: "easeInOut"
      }
    },
    tap: { 
      scale: 0.98,
      transition: {
        duration: 0.1
      }
    }
  };

  const gradientShift = {
    hidden: { 
      background: "linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)"
    },
    visible: {
      background: [
        "linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)",
        "linear-gradient(135deg, #2d2d2d 0%, #1a1a1a 100%)",
        "linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)"
      ],
      transition: {
        duration: 4,
        ease: "easeInOut",
        repeat: Infinity,
        repeatType: "reverse"
      }
    }
  };
  return (
    <main className="min-h-screen bg-black">      {/* Floating Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <motion.div
          initial="hidden"
          className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-gray-600/5 to-gray-500/5 rounded-full blur-xl"
          animate={{
            y: [-10, 10, -10],
            x: [-5, 5, -5],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 8,
            ease: "easeInOut",
            repeat: Infinity,
            repeatType: "reverse"
          }}
        />
        <motion.div
          initial="hidden"
          className="absolute bottom-20 right-10 w-40 h-40 bg-gradient-to-br from-gray-600/5 to-gray-500/5 rounded-full blur-xl"
          animate={{
            y: [10, -10, 10],
            x: [5, -5, 5],
            scale: [1.1, 1, 1.1],
          }}
          transition={{
            duration: 10,
            ease: "easeInOut",
            repeat: Infinity,
            repeatType: "reverse",
            delay: 2
          }}
        />
      </div>

      {/* Hero Section */}
      <motion.section
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
        className="relative z-10 pt-20 pb-16 px-4"
      >
        <div className="max-w-6xl mx-auto">          {/* Animated Background Shape */}
          <motion.div
            initial={{ scale: 0, rotate: 0 }}
            animate={{ 
              scale: 1, 
              rotate: 360,
              borderRadius: ["20%", "50%", "30%", "20%"]
            }}
            transition={{
              scale: { duration: 1.2, ease: [0.25, 0.46, 0.45, 0.94] },
              rotate: { duration: 20, ease: "linear", repeat: Infinity },
              borderRadius: { duration: 8, ease: "easeInOut", repeat: Infinity, repeatType: "reverse" }
            }}
            className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 opacity-5 -z-10"
          />          <motion.div variants={fadeInUp} className="text-center mb-16">
            <motion.h1 
              variants={fadeInUp}
              className="text-4xl md:text-6xl font-bold text-white mb-6"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
            >
              La Nostra 
              <motion.span 
                className="text-amber-500 inline-block"
                animate={{ 
                  textShadow: [
                    "0 0 0px rgba(245, 158, 11, 0)",
                    "0 0 20px rgba(245, 158, 11, 0.5)",
                    "0 0 0px rgba(245, 158, 11, 0)"
                  ]
                }}
                transition={{
                  duration: 3,
                  ease: "easeInOut",
                  repeat: Infinity,
                  repeatType: "reverse"
                }}
              >
                {" "} Sede
              </motion.span>
            </motion.h1>
            
            <motion.p 
              variants={fadeInUp}
              className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed"
            >
              Scopri il nostro barbershop nel cuore della città, dove tradizione e modernità si incontrano per offrirti un'esperienza unica di stile e benessere.
            </motion.p>
          </motion.div>
        </div>
      </motion.section>

      {/* Main Content */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={staggerContainer}
        className="py-16 px-4"
      >
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            
            {/* Image Section with 3D Effects */}
            <motion.div 
              variants={fadeInLeft}
              className="relative"
              onMouseEnter={() => setHoveredCard('image')}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <motion.div
                className="relative overflow-hidden rounded-2xl shadow-2xl"
                whileHover={{ 
                  scale: 1.02,
                  rotateY: 5,
                  rotateX: 2,
                }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                style={{
                  transformStyle: "preserve-3d",
                  perspective: "1000px"
                }}
              >
                <Image
                  src="/barbershop-interior.jpg"
                  alt="Interno del barbershop Maskio"
                  width={600}
                  height={400}
                  className="w-full h-[400px] object-cover"
                />
                
                {/* Overlay with gradient */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-tr from-black/20 via-transparent to-amber-500/20"
                  animate={hoveredCard === 'image' ? {
                    background: [
                      "linear-gradient(45deg, rgba(0,0,0,0.2) 0%, transparent 50%, rgba(245,158,11,0.2) 100%)",
                      "linear-gradient(90deg, rgba(0,0,0,0.1) 0%, transparent 50%, rgba(245,158,11,0.3) 100%)",
                      "linear-gradient(45deg, rgba(0,0,0,0.2) 0%, transparent 50%, rgba(245,158,11,0.2) 100%)"
                    ]
                  } : {}}
                  transition={{ duration: 2, ease: "easeInOut" }}
                />

                {/* Floating decorative elements */}
                <motion.div
                  className="absolute top-4 right-4 w-3 h-3 bg-amber-400 rounded-full"
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.7, 1, 0.7]
                  }}
                  transition={{
                    duration: 2,
                    ease: "easeInOut",
                    repeat: Infinity,
                    repeatType: "reverse"
                  }}
                />
                <motion.div
                  className="absolute bottom-6 left-6 w-2 h-2 bg-amber-300 rounded-full"
                  animate={{
                    scale: [1.2, 1, 1.2],
                    opacity: [1, 0.5, 1]
                  }}
                  transition={{
                    duration: 3,
                    ease: "easeInOut",
                    repeat: Infinity,
                    repeatType: "reverse",
                    delay: 1
                  }}
                />
              </motion.div>

              {/* 3D Shadow Effect */}
              <motion.div
                className="absolute inset-0 bg-black/10 rounded-2xl -z-10"
                animate={hoveredCard === 'image' ? {
                  x: 8,
                  y: 8,
                  scale: 0.98
                } : {
                  x: 4,
                  y: 4,
                  scale: 1
                }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              />
            </motion.div>

            {/* Content Section */}
            <motion.div variants={fadeInRight} className="space-y-8">
              <motion.div
                initial="hidden"
                whileInView="visible"
                variants={staggerContainer}
                viewport={{ once: true }}
                className="space-y-6"
              >                <motion.h2 
                  variants={scaleIn}
                  className="text-3xl md:text-4xl font-bold text-white"
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.3 }}
                >
                  Un'Esperienza di Stile Unica
                </motion.h2>
                
                <motion.p 
                  variants={slideInFromBottom}
                  className="text-lg text-gray-300 leading-relaxed"
                >
                  Il nostro barbershop è più di un semplice salone: è un luogo dove la passione per lo stile incontra l'eccellenza artigianale. Ogni dettaglio è curato per garantirti il massimo comfort e risultati impeccabili.
                </motion.p>
              </motion.div>

              {/* Features List with Animated Icons */}
              <motion.div
                initial="hidden"
                whileInView="visible"
                variants={staggerContainer}
                viewport={{ once: true }}
                className="space-y-4"
              >
                {[
                  { icon: "🪑", text: "Postazioni moderne e confortevoli" },
                  { icon: "✂️", text: "Strumenti professionali di alta qualità" },
                  { icon: "🎯", text: "Ambiente rilassante e accogliente" },
                  { icon: "⭐", text: "Staff esperto e qualificato" }
                ].map((feature, index) => (                  <motion.div
                    key={index}
                    variants={slideInFromBottom}
                    className="flex items-center space-x-4 p-4 rounded-xl hover:bg-gray-900 border border-gray-800 transition-colors duration-300"
                    whileHover={{ x: 10, scale: 1.02 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                  >
                    <motion.div
                      className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-gray-700 to-gray-800 rounded-full flex items-center justify-center text-xl"
                      animate={{
                        background: [
                          "linear-gradient(135deg, #374151 0%, #1f2937 100%)",
                          "linear-gradient(135deg, #1f2937 0%, #111827 100%)",
                          "linear-gradient(135deg, #374151 0%, #1f2937 100%)"
                        ]
                      }}
                      transition={{
                        duration: 4,
                        ease: "easeInOut",
                        repeat: Infinity,
                        repeatType: "reverse",
                        delay: index * 0.5
                      }}
                      whileHover={{ 
                        scale: 1.2, 
                        rotate: 10,
                        boxShadow: "0 10px 25px rgba(75, 85, 99, 0.3)"
                      }}
                    >
                      <motion.span
                        animate={{ rotate: [0, 5, -5, 0] }}
                        transition={{
                          duration: 2,
                          ease: "easeInOut",
                          repeat: Infinity,
                          repeatType: "reverse",
                          delay: index * 0.3
                        }}
                      >
                        {feature.icon}
                      </motion.span>
                    </motion.div>
                    <motion.span 
                      className="text-gray-300 font-medium"
                      whileHover={{ color: "#f59e0b" }}
                      transition={{ duration: 0.2 }}
                    >
                      {feature.text}
                    </motion.span>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          </div>
        </div>
      </motion.section>      {/* Location Information Section */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={staggerContainer}
        className="py-20 bg-gray-900 relative overflow-hidden"
      >
        {/* Animated Background Patterns */}
        <motion.div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `radial-gradient(circle at 20% 20%, #374151 0%, transparent 50%),
                             radial-gradient(circle at 80% 80%, #4b5563 0%, transparent 50%),
                             radial-gradient(circle at 40% 60%, #374151 0%, transparent 50%)`
          }}
          animate={{
            backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"]
          }}
          transition={{
            duration: 20,
            ease: "linear",
            repeat: Infinity
          }}
        />

        <div className="max-w-6xl mx-auto px-4 relative z-10">
          <motion.div variants={fadeInUp} className="text-center mb-16">
            <motion.h2 
              className="text-3xl md:text-4xl font-bold text-white mb-6"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
            >
              Vieni a Trovarci
            </motion.h2>
            <motion.p 
              variants={fadeInUp}
              className="text-xl text-gray-300 max-w-3xl mx-auto"
            >
              Siamo facilmente raggiungibili nel centro città. Prenota il tuo appuntamento e vieni a scoprire l'eccellenza del nostro servizio.
            </motion.p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">            {/* Address Card */}
            <motion.div
              variants={scaleIn}
              className="bg-gray-900 border border-gray-800 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500"
              whileHover={{ 
                y: -10, 
                scale: 1.02,
                boxShadow: "0 25px 50px rgba(0, 0, 0, 0.25)"
              }}
              onMouseEnter={() => setHoveredCard('address')}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <motion.div
                className="w-16 h-16 bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl flex items-center justify-center mb-6 mx-auto"
                animate={hoveredCard === 'address' ? {
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0]
                } : {}}
                transition={{ duration: 0.5, ease: "easeInOut" }}
              >
                <motion.span 
                  className="text-2xl text-white"
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{
                    duration: 4,
                    ease: "easeInOut",
                    repeat: Infinity,
                    repeatType: "reverse"
                  }}
                >
                  📍
                </motion.span>
              </motion.div>
              <h3 className="text-xl font-bold text-white mb-4 text-center">Indirizzo</h3>
              <p className="text-gray-300 text-center leading-relaxed">
                Via Sant'Agata, 24<br />
                71013 San Giovanni Rotondo (FG)<br />
                Italia
              </p>
            </motion.div>

            {/* Hours Card */}
            <motion.div
              variants={scaleIn}
              className="bg-gray-900 border border-gray-800 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500"
              whileHover={{ 
                y: -10, 
                scale: 1.02,
                boxShadow: "0 25px 50px rgba(0, 0, 0, 0.25)"
              }}
              onMouseEnter={() => setHoveredCard('hours')}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <motion.div
                className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center mb-6 mx-auto"
                animate={hoveredCard === 'hours' ? {
                  scale: [1, 1.1, 1],
                  rotate: [0, -5, 5, 0]
                } : {}}
                transition={{ duration: 0.5, ease: "easeInOut" }}
              >
                <motion.span 
                  className="text-2xl text-white"
                  animate={{ rotate: [0, 360] }}
                  transition={{
                    duration: 8,
                    ease: "linear",
                    repeat: Infinity
                  }}
                >
                  🕐
                </motion.span>
              </motion.div>              <h3 className="text-xl font-bold text-white mb-4 text-center">Orari</h3>
              <div className="space-y-2 text-gray-300 text-center">
                <p>Lun - Sab: 9:00 - 13:00 | 15:00 - 18:00</p>
                <p>Giovedì: Chiuso</p>
                <p>Domenica: Chiuso</p>
              </div>
            </motion.div>

            {/* Contact Card */}
            <motion.div
              variants={scaleIn}
              className="bg-gray-900 border border-gray-800 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 md:col-span-2 lg:col-span-1"
              whileHover={{ 
                y: -10, 
                scale: 1.02,
                boxShadow: "0 25px 50px rgba(0, 0, 0, 0.25)"
              }}
              onMouseEnter={() => setHoveredCard('contact')}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <motion.div
                className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl flex items-center justify-center mb-6 mx-auto"
                animate={hoveredCard === 'contact' ? {
                  scale: [1, 1.1, 1],
                  rotate: [0, 10, -10, 0]
                } : {}}
                transition={{ duration: 0.5, ease: "easeInOut" }}
              >
                <motion.span 
                  className="text-2xl text-white"
                  animate={{ 
                    scale: [1, 1.2, 1],
                    opacity: [1, 0.8, 1]
                  }}
                  transition={{
                    duration: 2,
                    ease: "easeInOut",
                    repeat: Infinity,
                    repeatType: "reverse"
                  }}
                >
                  📞
                </motion.span>
              </motion.div>
              <h3 className="text-xl font-bold text-white mb-4 text-center">Contatti</h3>
              <div className="space-y-2 text-gray-300 text-center">
                <p>Tel: +39 333 123 4567</p>
                <p>Email: info@maskio.it</p>
                <p>WhatsApp: +39 333 123 4567</p>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>      {/* Interactive Maps Section */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={staggerContainer}
        className="py-20 px-4 bg-black relative overflow-hidden"
      >
        {/* Background decorative elements */}
        <motion.div
          className="absolute top-10 left-10 w-20 h-20 bg-gradient-to-br from-gray-600/10 to-gray-500/10 rounded-full blur-xl"
          animate={{
            scale: [1, 1.2, 1],
            x: [-10, 10, -10],
            y: [-5, 5, -5],
          }}
          transition={{
            duration: 8,
            ease: "easeInOut",
            repeat: Infinity,
            repeatType: "reverse"
          }}
        />
        
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div variants={fadeInUp} className="text-center mb-16">
            <motion.h2 
              className="text-4xl md:text-5xl font-bold text-white mb-6"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
            >
              📍 Trova la Nostra Sede
            </motion.h2>
            <motion.p 
              variants={fadeInUp}
              className="text-xl text-gray-300 max-w-3xl mx-auto"
            >
              Siamo situati nel cuore di San Giovanni Rotondo, facilmente raggiungibili e con parcheggio disponibile
            </motion.p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Map Container */}
            <motion.div
              variants={fadeInLeft}
              className="relative"
              onMouseEnter={() => setHoveredCard('map')}
              onMouseLeave={() => setHoveredCard(null)}
            >              <motion.div
                className="relative overflow-hidden rounded-3xl shadow-2xl bg-gray-900 border border-gray-800"
                whileHover={{ 
                  scale: 1.02,
                  y: -5,
                }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              >
                {/* Map Header */}
                <div className="bg-gradient-to-r from-gray-700 to-gray-800 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <motion.div
                        className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center"
                        animate={hoveredCard === 'map' ? {
                          rotate: [0, 360],
                          scale: [1, 1.1, 1]
                        } : {}}
                        transition={{ duration: 0.8, ease: "easeInOut" }}
                      >
                        <span className="text-white text-sm">🗺️</span>
                      </motion.div>
                      <h3 className="text-white font-bold text-lg">Maskio Barber Concept</h3>
                    </div>
                    <motion.a
                      href={`https://www.google.com/maps/search/?api=1&query=Via+Sant'Agata+24,+San+Giovanni+Rotondo,+FG,+Italy`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-white/20 hover:bg-white/30 text-white px-3 py-1 rounded-full text-sm font-medium transition-all duration-300"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Apri in Google Maps
                    </motion.a>
                  </div>
                </div>

                {/* Interactive Map */}
                <div className="h-96 relative bg-gray-800">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3033.5397688995833!2d15.6963892!3d41.7069444!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNDHCsDQyJzI1LjAiTiAxNcKwNDEnNDcuMCJF!5e0!3m2!1sit!2sit!4v1640000000000!5m2!1sit!2sit"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen={true}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Mappa Maskio Barber Concept"
                    className="filter hover:brightness-110 transition-all duration-300"
                  />
                  
                  {/* Map Overlay for better interaction */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-gray-900/10 pointer-events-none"
                    animate={hoveredCard === 'map' ? {
                      opacity: [0, 0.3, 0]
                    } : {}}
                    transition={{ duration: 2, ease: "easeInOut" }}
                  />
                </div>

                {/* Map Footer with Quick Actions */}
                <div className="bg-gray-900 p-4 border-t border-gray-700">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-gray-300">
                      <span className="text-amber-500">📍</span>
                      <span>Via Sant'Agata 24, San Giovanni Rotondo (FG)</span>
                    </div>
                    <div className="flex gap-2">
                      <motion.button
                        className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-medium transition-all duration-300"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=Via+Sant'Agata+24,+San+Giovanni+Rotondo,+FG,+Italy`, '_blank')}
                      >
                        Indicazioni
                      </motion.button>
                      <motion.button
                        className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-full text-xs font-medium transition-all duration-300"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => window.open(`tel:+390881234567`)}
                      >
                        Chiama
                      </motion.button>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Floating map markers for visual appeal */}
              <motion.div
                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center shadow-lg"
                animate={{
                  y: [-3, 3, -3],
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 3,
                  ease: "easeInOut",
                  repeat: Infinity,
                  repeatType: "reverse"
                }}
              >
                <span className="text-white text-xs">📍</span>
              </motion.div>
            </motion.div>

            {/* Location Information */}
            <motion.div variants={fadeInRight} className="space-y-8">
              <motion.div
                initial="hidden"
                whileInView="visible"
                variants={staggerContainer}
                viewport={{ once: true }}
                className="space-y-6"
              >                <motion.div 
                  variants={scaleIn}
                  className="bg-gray-900 border border-gray-800 rounded-2xl p-8 shadow-xl"
                  whileHover={{ 
                    y: -5,
                    boxShadow: "0 25px 50px rgba(0, 0, 0, 0.25)"
                  }}
                >
                  <div className="flex items-center gap-4 mb-6">
                    <motion.div
                      className="w-12 h-12 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl flex items-center justify-center"
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.8 }}
                    >
                      <span className="text-white text-xl">🏪</span>
                    </motion.div>
                    <h3 className="text-2xl font-bold text-white">Come Raggiungerci</h3>
                  </div>
                  
                  <div className="space-y-4 text-gray-300">
                    <div className="flex items-start gap-3">
                      <span className="text-amber-500 mt-1">🚗</span>
                      <div>
                        <h4 className="font-semibold text-white mb-1">In Auto</h4>
                        <p>Parcheggio disponibile nelle vicinanze. Facilmente raggiungibile dal centro città.</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <span className="text-blue-500 mt-1">🚌</span>
                      <div>
                        <h4 className="font-semibold text-white mb-1">Mezzi Pubblici</h4>
                        <p>Fermata autobus a 50 metri. Linee urbane disponibili dal centro.</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <span className="text-green-500 mt-1">🚶</span>
                      <div>
                        <h4 className="font-semibold text-white mb-1">A Piedi</h4>
                        <p>Nel cuore della città, a pochi passi dalle principali attrazioni.</p>
                      </div>
                    </div>
                  </div>
                </motion.div>

                <motion.div 
                  variants={scaleIn}
                  className="bg-gray-900 border border-amber-500/20 rounded-2xl p-8"
                  whileHover={{ 
                    scale: 1.02,
                    boxShadow: "0 15px 35px rgba(245, 158, 11, 0.2)"
                  }}
                >
                  <div className="flex items-center gap-4 mb-6">
                    <motion.div
                      className="w-12 h-12 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center"
                      animate={{
                        scale: [1, 1.1, 1],
                        rotate: [0, 5, -5, 0]
                      }}
                      transition={{
                        duration: 4,
                        ease: "easeInOut",
                        repeat: Infinity,
                        repeatType: "reverse"
                      }}
                    >
                      <span className="text-white text-xl">💡</span>
                    </motion.div>
                    <h3 className="text-2xl font-bold text-white">Consigli Utili</h3>
                  </div>
                  
                  <div className="space-y-3 text-gray-300">
                    <p className="flex items-center gap-2">
                      <span className="text-amber-500">✓</span>
                      Prenota in anticipo per garantirti il tuo orario preferito
                    </p>
                    <p className="flex items-center gap-2">
                      <span className="text-amber-500">✓</span>
                      Arrivi 10 minuti prima per un'esperienza rilassante
                    </p>
                    <p className="flex items-center gap-2">
                      <span className="text-amber-500">✓</span>
                      Parcheggio gratuito disponibile nelle strade adiacenti
                    </p>
                    <p className="flex items-center gap-2">
                      <span className="text-amber-500">✓</span>
                      WiFi gratuito disponibile nel nostro locale
                    </p>
                  </div>
                </motion.div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* CTA Section */}
      <motion.section
        initial="hidden"        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={staggerContainer}
        className="py-20 px-4 relative overflow-hidden bg-gradient-to-br from-gray-900 to-black"
        animate="visible"
      >
        {/* Animated Particles */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-amber-400 rounded-full opacity-60"
            style={{
              left: `${20 + i * 15}%`,
              top: `${30 + (i % 3) * 20}%`,
            }}
            animate={{
              y: [-20, 20, -20],
              x: [-10, 10, -10],
              scale: [1, 1.5, 1],
              opacity: [0.6, 1, 0.6]
            }}
            transition={{
              duration: 4 + i,
              ease: "easeInOut",
              repeat: Infinity,
              repeatType: "reverse",
              delay: i * 0.5
            }}
          />
        ))}

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.h2 
            variants={fadeInUp}
            className="text-3xl md:text-4xl font-bold text-white mb-6"
          >
            Prenota il Tuo Appuntamento
          </motion.h2>
          
          <motion.p 
            variants={fadeInUp}
            className="text-xl text-gray-200 mb-10 leading-relaxed"
          >
            Non aspettare, vieni a scoprire l'esperienza Maskio Barber. 
            Il tuo stile ti aspetta.
          </motion.p>
          
          <motion.div
            variants={scaleIn}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >            <motion.button
              className="bg-amber-500 hover:bg-amber-600 text-white font-bold py-4 px-8 rounded-full text-lg transition-all duration-300 shadow-lg"
              variants={magneticHover}
              initial="rest"
              whileTap="tap"
              whileHover={{
                boxShadow: "0 15px 35px rgba(245, 158, 11, 0.4)",
                y: -3
              }}
            >
              Prenota Ora
            </motion.button>
              <motion.button
              className="border-2 border-white text-white hover:bg-white hover:text-gray-900 font-bold py-4 px-8 rounded-full text-lg transition-all duration-300"
              variants={magneticHover}
              initial="rest"
              whileTap="tap"
              whileHover={{
                boxShadow: "0 15px 35px rgba(255, 255, 255, 0.2)",
                y: -3
              }}
            >
              Chiamaci
            </motion.button>
          </motion.div>
        </div>
      </motion.section>
    </main>
  );
}
