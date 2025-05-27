'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import BookingButton from '../components/BookingButton';

export default function Home() {  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [hoveredFeature, setHoveredFeature] = useState<string | null>(null);

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
    <div className="min-h-screen bg-white">
      {/* Floating Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">        <motion.div
          initial="hidden"
          className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-amber-200/20 to-amber-400/20 rounded-full blur-xl"
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
        />        <motion.div
          initial="hidden"
          className="absolute bottom-20 right-10 w-40 h-40 bg-gradient-to-br from-amber-300/15 to-orange-400/15 rounded-full blur-xl"
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
        />        <motion.div
          initial="hidden"
          className="absolute top-1/2 left-1/4 w-24 h-24 bg-gradient-to-br from-blue-200/10 to-blue-400/10 rounded-full blur-xl"
          animate={{
            y: [15, -15, 15],
            x: [-8, 8, -8],
            scale: [0.8, 1.2, 0.8],
          }}
          transition={{
            duration: 12,
            ease: "easeInOut",
            repeat: Infinity,
            repeatType: "reverse",
            delay: 4
          }}
        />
      </div>

      {/* Hero Section */}
      <div className="relative h-screen">
        {/* Hero Image with Parallax */}
        <motion.div 
          className="absolute inset-0 z-0"
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.5, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <Image
            src="/sediaOro.jpg"
            alt="Maskio Barber Concept"
            fill
            className="object-cover brightness-[0.3]"
            priority
          />
          
          {/* Animated Overlay */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/40 to-amber-900/30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 2, ease: "easeOut" }}
          />
          
          {/* Floating Decorative Elements */}
          <motion.div
            className="absolute top-20 right-20 w-4 h-4 bg-amber-400 rounded-full opacity-70"
            animate={{
              y: [-20, 20, -20],
              x: [-10, 10, -10],
              scale: [1, 1.5, 1],
              opacity: [0.7, 1, 0.7]
            }}
            transition={{
              duration: 6,
              ease: "easeInOut",
              repeat: Infinity,
              repeatType: "reverse"
            }}
          />
          <motion.div
            className="absolute bottom-32 left-16 w-3 h-3 bg-amber-300 rounded-full opacity-60"
            animate={{
              y: [15, -15, 15],
              x: [8, -8, 8],
              scale: [1.2, 0.8, 1.2],
              opacity: [0.6, 1, 0.6]
            }}
            transition={{
              duration: 8,
              ease: "easeInOut",
              repeat: Infinity,
              repeatType: "reverse",
              delay: 2
            }}
          />
        </motion.div>        {/* Hero Content */}
        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center text-white px-4">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="space-y-8"
          >            <motion.h1 
              variants={fadeInUp}
              className="text-4xl md:text-6xl font-bold tracking-tight"
            >
              Maskio Barber
              <motion.span 
                className="block text-amber-400 mt-2"
                animate={{ 
                  textShadow: [
                    "0 0 0px rgba(245, 158, 11, 0)",
                    "0 0 30px rgba(245, 158, 11, 0.8)",
                    "0 0 0px rgba(245, 158, 11, 0)"
                  ]
                }}
                transition={{
                  duration: 4,
                  ease: "easeInOut",
                  repeat: Infinity,
                  repeatType: "reverse"
                }}
              >
                Concept
              </motion.span>
            </motion.h1>
            
            <motion.p 
              variants={fadeInUp}
              className="text-xl md:text-2xl max-w-4xl mx-auto leading-relaxed text-gray-200"
            >
              Una nuova concezione del barbiere, dove tradizione e innovazione si incontrano per creare il tuo{" "}
              <motion.span 
                className="text-amber-300 font-semibold"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                stile perfetto
              </motion.span>
            </motion.p>

            <motion.div
              variants={fadeInUp}
              className="flex flex-col sm:flex-row gap-6 justify-center items-center pt-4"
            >              <motion.div
                whileHover={{
                  scale: 1.05,
                  rotateZ: 1
                }}
                whileTap={{ scale: 0.98 }}
              >
                <BookingButton size="lg" className="text-lg bg-amber-500 hover:bg-amber-600 border-0 shadow-lg">
                  Prenota Subito
                </BookingButton>
              </motion.div>
              
              <Link href="/servizi">                <motion.button 
                  className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 hover:bg-white hover:text-black"
                  whileHover={{
                    boxShadow: "0 15px 35px rgba(255, 255, 255, 0.2)",
                    y: -3,
                    scale: 1.05
                  }}
                  whileTap={{ scale: 0.98 }}
                >
                  Scopri i Servizi
                </motion.button>
              </Link>
            </motion.div>
          </motion.div>        </div>
      </div>{/* About Section with Enhanced Animations */}
      <motion.section 
        className="py-20 bg-gradient-to-br from-gray-50 to-amber-50/20 relative overflow-hidden"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={staggerContainer}
      >
        {/* Animated Background Patterns */}
        <motion.div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, #f59e0b 0%, transparent 50%),
                             radial-gradient(circle at 75% 75%, #fbbf24 0%, transparent 50%)`
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

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div 
            className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center"
            variants={staggerContainer}
          >
            <motion.div variants={fadeInLeft} className="space-y-8">
              <motion.div className="space-y-6">
                <motion.h2 
                  variants={fadeInUp}
                  className="text-4xl md:text-5xl font-bold text-gray-900"
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.3 }}
                >
                  L'Arte del{" "}
                  <motion.span 
                    className="text-amber-600 inline-block"
                    animate={{ 
                      textShadow: [
                        "0 0 0px rgba(245, 158, 11, 0)",
                        "0 0 20px rgba(245, 158, 11, 0.4)",
                        "0 0 0px rgba(245, 158, 11, 0)"
                      ]
                    }}
                    transition={{
                      duration: 4,
                      ease: "easeInOut",
                      repeat: Infinity,
                      repeatType: "reverse"
                    }}
                  >
                    Barbiere Moderno
                  </motion.span>
                </motion.h2>
                
                <motion.p 
                  variants={fadeInUp}
                  className="text-lg text-gray-600 leading-relaxed"
                >
                  Da oltre 10 anni, Maskio Barber Concept rappresenta l'eccellenza nella cura dell'uomo. 
                  Il nostro team di professionisti esperti combina tecniche tradizionali con le ultime 
                  tendenze per offrirti un'esperienza unica e personalizzata.
                </motion.p>
                
                <motion.p 
                  variants={fadeInUp}
                  className="text-lg text-gray-600 leading-relaxed"
                >
                  Ogni taglio, ogni rasatura, ogni trattamento è pensato per esaltare la tua personalità 
                  e farti sentire al meglio. Perché per noi, ogni cliente è unico.
                </motion.p>
              </motion.div>

              <motion.div variants={fadeInUp}>
                <Link href="/chi-siamo">                  <motion.button 
                    className="bg-gradient-to-r from-gray-900 to-gray-700 text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-lg transition-all duration-300"
                    whileHover={{
                      boxShadow: "0 20px 40px rgba(0, 0, 0, 0.2)",
                      y: -3,
                      background: "linear-gradient(135deg, #374151 0%, #1f2937 100%)",
                      scale: 1.05
                    }}
                    whileTap={{ scale: 0.98 }}
                  >
                    La Nostra Storia
                  </motion.button>
                </Link>
              </motion.div>
            </motion.div>

            <motion.div 
              variants={fadeInRight}
              className="relative"
              onMouseEnter={() => setHoveredCard('about-image')}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <motion.div
                className="relative h-96 rounded-2xl overflow-hidden shadow-2xl"
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
                  src="/taglio1.jpg"
                  alt="Il nostro barbiere al lavoro"
                  fill
                  className="object-cover"
                />
                
                {/* Overlay with gradient */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-tr from-black/20 via-transparent to-amber-500/20"
                  animate={hoveredCard === 'about-image' ? {
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
                animate={hoveredCard === 'about-image' ? {
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
          </motion.div>
        </div>
      </motion.section>      {/* Services Preview with Advanced Animations */}
      <motion.section 
        className="py-20 bg-gradient-to-br from-white via-gray-50/30 to-amber-50/20 relative overflow-hidden"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={staggerContainer}
      >
        {/* Animated Background Particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute top-20 left-10 w-2 h-2 bg-amber-400/30 rounded-full"
            animate={{
              y: [-20, 20, -20],
              x: [-10, 10, -10],
              scale: [1, 2, 1],
              opacity: [0.3, 0.8, 0.3]
            }}
            transition={{
              duration: 8,
              ease: "easeInOut",
              repeat: Infinity,
              repeatType: "reverse"
            }}
          />
          <motion.div
            className="absolute bottom-32 right-16 w-3 h-3 bg-amber-300/20 rounded-full"
            animate={{
              y: [15, -15, 15],
              x: [8, -8, 8],
              scale: [1.5, 1, 1.5],
              opacity: [0.2, 0.6, 0.2]
            }}
            transition={{
              duration: 10,
              ease: "easeInOut",
              repeat: Infinity,
              repeatType: "reverse",
              delay: 3
            }}
          />
          <motion.div
            className="absolute top-1/2 right-1/4 w-1 h-1 bg-amber-500/40 rounded-full"
            animate={{
              scale: [1, 3, 1],
              opacity: [0.4, 1, 0.4],
              rotate: [0, 180, 360]
            }}
            transition={{
              duration: 6,
              ease: "easeInOut",
              repeat: Infinity,
              repeatType: "reverse",
              delay: 1
            }}
          />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div 
            className="text-center mb-16"
            variants={fadeInUp}
          >
            <motion.h2 
              className="text-4xl md:text-5xl font-bold text-gray-900 mb-4"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
            >
              I Nostri{" "}
              <motion.span 
                className="text-amber-600 inline-block"
                animate={{ 
                  textShadow: [
                    "0 0 0px rgba(245, 158, 11, 0)",
                    "0 0 25px rgba(245, 158, 11, 0.6)",
                    "0 0 0px rgba(245, 158, 11, 0)"
                  ]
                }}
                transition={{
                  duration: 4,
                  ease: "easeInOut",
                  repeat: Infinity,
                  repeatType: "reverse"
                }}
              >
                Servizi
              </motion.span>
            </motion.h2>
            <motion.p 
              className="text-lg text-gray-600 max-w-3xl mx-auto"
              variants={fadeInUp}
            >
              Dalla consulenza personalizzata ai trattamenti più avanzati, 
              offriamo una gamma completa di servizi per la cura dell'uomo moderno
            </motion.p>
          </motion.div>

          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
            variants={staggerContainer}
          >
            {[
              {
                title: 'Taglio & Styling',
                description: 'Tagli personalizzati per esaltare la tua personalità e stile',
                icon: '✂️',
                price: 'da 25€',
                gradient: 'from-blue-500/10 to-purple-500/10'
              },
              {
                title: 'Rasatura Tradizionale',
                description: 'L\'arte della rasatura con rasoio a mano libera',
                icon: '🪒',
                price: 'da 20€',
                gradient: 'from-amber-500/10 to-orange-500/10'
              },
              {
                title: 'Trattamenti Barba',
                description: 'Cura completa per una barba sempre perfetta',
                icon: '🧔',
                price: 'da 15€',
                gradient: 'from-green-500/10 to-teal-500/10'
              }
            ].map((service, index) => (
              <motion.div
                key={index}
                variants={scaleIn}
                className={`relative bg-gradient-to-br ${service.gradient} backdrop-blur-sm p-8 rounded-2xl text-center group cursor-pointer overflow-hidden`}
                onMouseEnter={() => setHoveredCard(`service-${index}`)}
                onMouseLeave={() => setHoveredCard(null)}
                whileHover={{ 
                  y: -8,
                  scale: 1.02,
                  rotateY: 5,
                  rotateX: 2,
                }}
                transition={{ 
                  duration: 0.4, 
                  ease: "easeOut",
                  type: "spring",
                  stiffness: 150
                }}
                style={{
                  transformStyle: "preserve-3d",
                  perspective: "1000px"
                }}
              >
                {/* Gradient Background Effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-br from-white/50 via-transparent to-amber-100/20 rounded-2xl"
                  animate={hoveredCard === `service-${index}` ? {
                    background: [
                      "linear-gradient(135deg, rgba(255,255,255,0.5) 0%, transparent 50%, rgba(245,158,11,0.2) 100%)",
                      "linear-gradient(225deg, rgba(255,255,255,0.3) 0%, transparent 50%, rgba(245,158,11,0.4) 100%)",
                      "linear-gradient(135deg, rgba(255,255,255,0.5) 0%, transparent 50%, rgba(245,158,11,0.2) 100%)"
                    ]
                  } : {}}
                  transition={{ duration: 2, ease: "easeInOut" }}
                />

                {/* Floating Icon */}
                <motion.div 
                  className="text-5xl mb-6 relative z-10"
                  animate={hoveredCard === `service-${index}` ? {
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, -5, 0],
                  } : {
                    scale: 1,
                    rotate: 0
                  }}
                  transition={{ 
                    duration: 2, 
                    ease: "easeInOut",
                    repeat: hoveredCard === `service-${index}` ? Infinity : 0
                  }}
                >
                  {service.icon}
                </motion.div>

                <h3 className="text-xl font-bold text-gray-900 mb-3 relative z-10">{service.title}</h3>
                <p className="text-gray-600 mb-4 relative z-10">{service.description}</p>
                
                <motion.div 
                  className="text-lg font-semibold text-amber-600 mb-4 relative z-10"
                  animate={hoveredCard === `service-${index}` ? {
                    scale: [1, 1.05, 1],
                    color: ["#d97706", "#f59e0b", "#d97706"]
                  } : {}}
                  transition={{ duration: 1.5, ease: "easeInOut" }}
                >
                  {service.price}
                </motion.div>

                {/* 3D Shadow Effect */}
                <motion.div
                  className="absolute inset-0 bg-black/5 rounded-2xl -z-10"
                  animate={hoveredCard === `service-${index}` ? {
                    x: 6,
                    y: 6,
                    scale: 0.98
                  } : {
                    x: 2,
                    y: 2,
                    scale: 1
                  }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                />

                {/* Animated Border */}
                <motion.div
                  className="absolute inset-0 rounded-2xl border-2 border-transparent"
                  animate={hoveredCard === `service-${index}` ? {
                    borderColor: ["rgba(245, 158, 11, 0)", "rgba(245, 158, 11, 0.3)", "rgba(245, 158, 11, 0)"]
                  } : {}}
                  transition={{ duration: 2, ease: "easeInOut", repeat: Infinity }}
                />
              </motion.div>
            ))}
          </motion.div>

          <motion.div 
            className="text-center mt-12"
            variants={fadeInUp}
          >
            <Link href="/servizi">              <motion.button 
                className="bg-gradient-to-r from-amber-500 to-amber-600 text-white px-10 py-4 rounded-xl font-semibold text-lg shadow-lg transition-all duration-300 relative overflow-hidden group"
                variants={magneticHover}
                initial="rest"
                whileTap="tap"
                whileHover={{
                  boxShadow: "0 20px 40px rgba(245, 158, 11, 0.3)",
                  y: -3,
                  background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)"
                }}
              >
                <motion.span
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                  initial={{ x: "-100%" }}
                  whileHover={{ x: "100%" }}
                  transition={{ duration: 0.6, ease: "easeInOut" }}
                />
                <span className="relative z-10">Vedi Tutti i Servizi</span>
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </motion.section>      {/* Why Choose Us with Advanced Animations */}
      <motion.section 
        className="py-20 bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white relative overflow-hidden"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={staggerContainer}
      >
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Floating Particles */}
          <motion.div
            className="absolute top-16 left-16 w-2 h-2 bg-amber-400/40 rounded-full"
            animate={{
              y: [-30, 30, -30],
              x: [-15, 15, -15],
              scale: [1, 2.5, 1],
              opacity: [0.4, 1, 0.4]
            }}
            transition={{
              duration: 12,
              ease: "easeInOut",
              repeat: Infinity,
              repeatType: "reverse"
            }}
          />
          <motion.div
            className="absolute bottom-24 right-20 w-3 h-3 bg-amber-300/30 rounded-full"
            animate={{
              y: [20, -20, 20],
              x: [10, -10, 10],
              scale: [1.5, 1, 1.5],
              opacity: [0.3, 0.8, 0.3]
            }}
            transition={{
              duration: 10,
              ease: "easeInOut",
              repeat: Infinity,
              repeatType: "reverse",
              delay: 2
            }}
          />
          <motion.div
            className="absolute top-1/3 right-1/3 w-1 h-1 bg-amber-500/50 rounded-full"
            animate={{
              scale: [1, 4, 1],
              opacity: [0.5, 1, 0.5],
              rotate: [0, 360, 720]
            }}
            transition={{
              duration: 8,
              ease: "easeInOut",
              repeat: Infinity,
              repeatType: "reverse",
              delay: 1
            }}
          />

          {/* Gradient Overlay Animation */}
          <motion.div
            className="absolute inset-0 opacity-10"
            style={{
              background: "radial-gradient(circle at 30% 20%, #f59e0b 0%, transparent 50%), radial-gradient(circle at 70% 80%, #fbbf24 0%, transparent 50%)"
            }}
            animate={{
              background: [
                "radial-gradient(circle at 30% 20%, #f59e0b 0%, transparent 50%), radial-gradient(circle at 70% 80%, #fbbf24 0%, transparent 50%)",
                "radial-gradient(circle at 70% 30%, #f59e0b 0%, transparent 50%), radial-gradient(circle at 30% 70%, #fbbf24 0%, transparent 50%)",
                "radial-gradient(circle at 30% 20%, #f59e0b 0%, transparent 50%), radial-gradient(circle at 70% 80%, #fbbf24 0%, transparent 50%)"
              ]
            }}
            transition={{
              duration: 15,
              ease: "easeInOut",
              repeat: Infinity,
              repeatType: "reverse"
            }}
          />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div 
            className="text-center mb-16"
            variants={fadeInUp}
          >
            <motion.h2 
              className="text-4xl md:text-5xl font-bold mb-4"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
            >
              Perché Scegliere{" "}
              <motion.span 
                className="text-amber-400 inline-block"
                animate={{ 
                  textShadow: [
                    "0 0 0px rgba(245, 158, 11, 0)",
                    "0 0 30px rgba(245, 158, 11, 0.8)",
                    "0 0 0px rgba(245, 158, 11, 0)"
                  ]
                }}
                transition={{
                  duration: 4,
                  ease: "easeInOut",
                  repeat: Infinity,
                  repeatType: "reverse"
                }}
              >
                Maskio
              </motion.span>
            </motion.h2>
            <motion.p 
              className="text-lg text-gray-300 max-w-3xl mx-auto"
              variants={fadeInUp}
            >
              Non siamo solo un barbiere, siamo i tuoi partner nella cura del tuo stile
            </motion.p>
          </motion.div>

          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
            variants={staggerContainer}
          >
            {[
              {
                icon: '👨‍💼',
                title: 'Professionisti Esperti',
                description: 'Team di barbieri qualificati con anni di esperienza',
                color: 'from-blue-500/20 to-purple-500/20',
                accent: 'blue'
              },
              {
                icon: '🏆',
                title: 'Qualità Premium',
                description: 'Utilizziamo solo prodotti professionali di alta qualità',
                color: 'from-amber-500/20 to-yellow-500/20',
                accent: 'amber'
              },
              {
                icon: '🎯',
                title: 'Stile Personalizzato',
                description: 'Ogni servizio è studiato per le tue esigenze specifiche',
                color: 'from-green-500/20 to-emerald-500/20',
                accent: 'green'
              },
              {
                icon: '🌟',
                title: 'Esperienza Unica',
                description: 'Un ambiente moderno e accogliente per il tuo relax',
                color: 'from-rose-500/20 to-pink-500/20',
                accent: 'rose'
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                variants={scaleIn}
                className={`relative text-center p-6 rounded-2xl bg-gradient-to-br ${feature.color} backdrop-blur-sm border border-white/10 group cursor-pointer overflow-hidden`}
                onMouseEnter={() => setHoveredFeature(`feature-${index}`)}
                onMouseLeave={() => setHoveredFeature(null)}
                whileHover={{ 
                  scale: 1.05,
                  y: -8,
                  rotateY: 5,
                  rotateX: 2,
                }}
                transition={{ 
                  duration: 0.4, 
                  ease: "easeOut",
                  type: "spring",
                  stiffness: 150
                }}
                style={{
                  transformStyle: "preserve-3d",
                  perspective: "1000px"
                }}
              >
                {/* Glowing Background Effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-amber-400/10 rounded-2xl"
                  animate={hoveredFeature === `feature-${index}` ? {
                    background: [
                      "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 50%, rgba(245,158,11,0.1) 100%)",
                      "linear-gradient(225deg, rgba(255,255,255,0.05) 0%, transparent 50%, rgba(245,158,11,0.2) 100%)",
                      "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 50%, rgba(245,158,11,0.1) 100%)"
                    ]
                  } : {}}
                  transition={{ duration: 2, ease: "easeInOut" }}
                />

                {/* Animated Icon with Pulsing Circle */}
                <motion.div className="relative mb-6 flex justify-center">
                  <motion.div
                    className="absolute inset-0 w-16 h-16 mx-auto bg-gradient-to-br from-amber-400/20 to-amber-600/20 rounded-full"
                    animate={hoveredFeature === `feature-${index}` ? {
                      scale: [1, 1.3, 1],
                      opacity: [0.2, 0.4, 0.2]
                    } : {}}
                    transition={{ 
                      duration: 2, 
                      ease: "easeInOut",
                      repeat: hoveredFeature === `feature-${index}` ? Infinity : 0
                    }}
                  />
                  <motion.div 
                    className="text-5xl relative z-10"
                    animate={hoveredFeature === `feature-${index}` ? {
                      scale: [1, 1.1, 1],
                      rotate: [0, 10, -10, 0],
                    } : {
                      scale: 1,
                      rotate: 0
                    }}
                    transition={{ 
                      duration: 2, 
                      ease: "easeInOut",
                      repeat: hoveredFeature === `feature-${index}` ? Infinity : 0
                    }}
                  >
                    {feature.icon}
                  </motion.div>
                </motion.div>

                <motion.h3 
                  className="text-xl font-bold mb-3 text-white relative z-10"
                  animate={hoveredFeature === `feature-${index}` ? {
                    color: ["#ffffff", "#fbbf24", "#ffffff"]
                  } : {}}
                  transition={{ duration: 1.5, ease: "easeInOut" }}
                >
                  {feature.title}
                </motion.h3>
                
                <p className="text-gray-300 relative z-10 leading-relaxed">{feature.description}</p>

                {/* 3D Shadow Effect */}
                <motion.div
                  className="absolute inset-0 bg-black/20 rounded-2xl -z-10"
                  animate={hoveredFeature === `feature-${index}` ? {
                    x: 6,
                    y: 6,
                    scale: 0.98
                  } : {
                    x: 2,
                    y: 2,
                    scale: 1
                  }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                />

                {/* Animated Border */}
                <motion.div
                  className="absolute inset-0 rounded-2xl border-2 border-transparent"
                  animate={hoveredFeature === `feature-${index}` ? {
                    borderColor: ["rgba(245, 158, 11, 0)", "rgba(245, 158, 11, 0.5)", "rgba(245, 158, 11, 0)"]
                  } : {}}
                  transition={{ duration: 2, ease: "easeInOut", repeat: Infinity }}
                />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>      {/* Gallery Preview with Advanced 3D Effects */}
      <motion.section 
        className="py-20 bg-gradient-to-br from-white via-gray-50/30 to-amber-50/20 relative overflow-hidden"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={staggerContainer}
      >
        {/* Floating Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute top-32 right-24 w-2 h-2 bg-amber-400/20 rounded-full"
            animate={{
              y: [-25, 25, -25],
              x: [-12, 12, -12],
              scale: [1, 3, 1],
              opacity: [0.2, 0.6, 0.2]
            }}
            transition={{
              duration: 10,
              ease: "easeInOut",
              repeat: Infinity,
              repeatType: "reverse"
            }}
          />
          <motion.div
            className="absolute bottom-40 left-20 w-3 h-3 bg-amber-300/15 rounded-full"
            animate={{
              y: [18, -18, 18],
              x: [9, -9, 9],
              scale: [1.2, 0.8, 1.2],
              opacity: [0.15, 0.4, 0.15]
            }}
            transition={{
              duration: 12,
              ease: "easeInOut",
              repeat: Infinity,
              repeatType: "reverse",
              delay: 4
            }}
          />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div 
            className="text-center mb-16"
            variants={fadeInUp}
          >
            <motion.h2 
              className="text-4xl md:text-5xl font-bold text-gray-900 mb-4"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
            >
              I Nostri{" "}
              <motion.span 
                className="text-amber-600 inline-block"
                animate={{ 
                  textShadow: [
                    "0 0 0px rgba(245, 158, 11, 0)",
                    "0 0 25px rgba(245, 158, 11, 0.6)",
                    "0 0 0px rgba(245, 158, 11, 0)"
                  ]
                }}
                transition={{
                  duration: 4,
                  ease: "easeInOut",
                  repeat: Infinity,
                  repeatType: "reverse"
                }}
              >
                Lavori
              </motion.span>
            </motion.h2>
            <motion.p 
              className="text-lg text-gray-600 max-w-3xl mx-auto"
              variants={fadeInUp}
            >
              Scopri alcune delle nostre creazioni e lasciati ispirare per il tuo prossimo look
            </motion.p>
          </motion.div>

          <motion.div 
            className="grid grid-cols-2 md:grid-cols-4 gap-6"
            variants={staggerContainer}
          >
            {[
              { src: '/taglio1.jpg', title: 'Taglio Moderno' },
              { src: '/taglio2.jpg', title: 'Styling Classico' },
              { src: '/sediaOro.jpg', title: 'Ambiente Premium' },
              { src: '/prodotti.jpg', title: 'Prodotti Professionali' }
            ].map((item, index) => (
              <motion.div
                key={index}
                variants={scaleIn}
                className="relative group cursor-pointer"
                onMouseEnter={() => setHoveredCard(`gallery-${index}`)}
                onMouseLeave={() => setHoveredCard(null)}
                whileHover={{ 
                  scale: 1.05,
                  rotateY: 8,
                  rotateX: 3,
                  z: 50
                }}
                transition={{ 
                  duration: 0.4, 
                  ease: "easeOut",
                  type: "spring",
                  stiffness: 150
                }}
                style={{
                  transformStyle: "preserve-3d",
                  perspective: "1000px"
                }}
              >
                <motion.div
                  className="relative aspect-square rounded-2xl overflow-hidden shadow-lg"
                  whileHover={{
                    boxShadow: "0 25px 50px rgba(0, 0, 0, 0.25)"
                  }}
                >
                  <Image
                    src={item.src}
                    alt={item.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  
                  {/* Overlay with Gradient Animation */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-tr from-black/40 via-transparent to-amber-500/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    animate={hoveredCard === `gallery-${index}` ? {
                      background: [
                        "linear-gradient(45deg, rgba(0,0,0,0.4) 0%, transparent 50%, rgba(245,158,11,0.3) 100%)",
                        "linear-gradient(90deg, rgba(0,0,0,0.2) 0%, transparent 50%, rgba(245,158,11,0.5) 100%)",
                        "linear-gradient(45deg, rgba(0,0,0,0.4) 0%, transparent 50%, rgba(245,158,11,0.3) 100%)"
                      ]
                    } : {}}
                    transition={{ duration: 2, ease: "easeInOut" }}
                  />

                  {/* Title Overlay */}
                  <motion.div
                    className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    initial={{ y: 20 }}
                    whileHover={{ y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <motion.h3 
                      className="text-white text-lg font-semibold text-center px-4 py-2 bg-black/50 rounded-lg backdrop-blur-sm"
                      animate={hoveredCard === `gallery-${index}` ? {
                        scale: [1, 1.05, 1],
                        textShadow: [
                          "0 0 0px rgba(255, 255, 255, 0)",
                          "0 0 10px rgba(255, 255, 255, 0.5)",
                          "0 0 0px rgba(255, 255, 255, 0)"
                        ]
                      } : {}}
                      transition={{ duration: 1.5, ease: "easeInOut" }}
                    >
                      {item.title}
                    </motion.h3>
                  </motion.div>

                  {/* Floating Decorative Elements */}
                  <motion.div
                    className="absolute top-3 right-3 w-2 h-2 bg-amber-400 rounded-full opacity-0 group-hover:opacity-70"
                    animate={hoveredCard === `gallery-${index}` ? {
                      scale: [1, 1.8, 1],
                      opacity: [0.7, 1, 0.7]
                    } : {}}
                    transition={{
                      duration: 2,
                      ease: "easeInOut",
                      repeat: Infinity,
                      repeatType: "reverse"
                    }}
                  />
                </motion.div>

                {/* 3D Shadow Effect */}
                <motion.div
                  className="absolute inset-0 bg-black/10 rounded-2xl -z-10"
                  animate={hoveredCard === `gallery-${index}` ? {
                    x: 8,
                    y: 8,
                    scale: 0.96
                  } : {
                    x: 3,
                    y: 3,
                    scale: 1
                  }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                />

                {/* Glowing Border Effect */}
                <motion.div
                  className="absolute inset-0 rounded-2xl border-2 border-transparent"
                  animate={hoveredCard === `gallery-${index}` ? {
                    borderColor: ["rgba(245, 158, 11, 0)", "rgba(245, 158, 11, 0.4)", "rgba(245, 158, 11, 0)"]
                  } : {}}
                  transition={{ duration: 2, ease: "easeInOut", repeat: Infinity }}
                />
              </motion.div>
            ))}
          </motion.div>

          <motion.div 
            className="text-center mt-12"
            variants={fadeInUp}
          >
            <Link href="/blog">
              <motion.button                className="bg-gradient-to-r from-gray-900 to-black text-white px-10 py-4 rounded-xl font-semibold text-lg shadow-lg transition-all duration-300 relative overflow-hidden group"
                variants={magneticHover}
                initial="rest"
                whileTap="tap"
                whileHover={{
                  boxShadow: "0 20px 40px rgba(0, 0, 0, 0.3)",
                  y: -3,
                  background: "linear-gradient(135deg, #1f2937 0%, #111827 100%)"
                }}
              >
                <motion.span
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                  initial={{ x: "-100%" }}
                  whileHover={{ x: "100%" }}
                  transition={{ duration: 0.6, ease: "easeInOut" }}
                />
                <span className="relative z-10">Vedi Tutte le Gallerie</span>
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </motion.section>      {/* CTA Section with Advanced Animations */}
      <motion.section 
        className="py-20 bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white relative overflow-hidden"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={staggerContainer}
      >
        {/* Animated Background Effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Floating Particles */}
          <motion.div
            className="absolute top-20 left-20 w-3 h-3 bg-amber-400/30 rounded-full"
            animate={{
              y: [-40, 40, -40],
              x: [-20, 20, -20],
              scale: [1, 2, 1],
              opacity: [0.3, 0.8, 0.3]
            }}
            transition={{
              duration: 15,
              ease: "easeInOut",
              repeat: Infinity,
              repeatType: "reverse"
            }}
          />
          <motion.div
            className="absolute bottom-24 right-32 w-2 h-2 bg-amber-300/25 rounded-full"
            animate={{
              y: [25, -25, 25],
              x: [15, -15, 15],
              scale: [1.5, 1, 1.5],
              opacity: [0.25, 0.6, 0.25]
            }}
            transition={{
              duration: 12,
              ease: "easeInOut",
              repeat: Infinity,
              repeatType: "reverse",
              delay: 3
            }}
          />
          <motion.div
            className="absolute top-1/2 right-1/4 w-1 h-1 bg-amber-500/40 rounded-full"
            animate={{
              scale: [1, 5, 1],
              opacity: [0.4, 1, 0.4],
              rotate: [0, 360, 720]
            }}
            transition={{
              duration: 10,
              ease: "easeInOut",
              repeat: Infinity,
              repeatType: "reverse",
              delay: 2
            }}
          />

          {/* Dynamic Gradient Background */}
          <motion.div
            className="absolute inset-0 opacity-10"
            style={{
              background: "radial-gradient(circle at 25% 25%, #f59e0b 0%, transparent 50%), radial-gradient(circle at 75% 75%, #fbbf24 0%, transparent 50%)"
            }}
            animate={{
              background: [
                "radial-gradient(circle at 25% 25%, #f59e0b 0%, transparent 50%), radial-gradient(circle at 75% 75%, #fbbf24 0%, transparent 50%)",
                "radial-gradient(circle at 75% 25%, #f59e0b 0%, transparent 50%), radial-gradient(circle at 25% 75%, #fbbf24 0%, transparent 50%)",
                "radial-gradient(circle at 25% 25%, #f59e0b 0%, transparent 50%), radial-gradient(circle at 75% 75%, #fbbf24 0%, transparent 50%)"
              ]
            }}
            transition={{
              duration: 20,
              ease: "easeInOut",
              repeat: Infinity,
              repeatType: "reverse"
            }}
          />
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.div variants={staggerContainer}>
            <motion.h2 
              className="text-4xl md:text-5xl font-bold mb-6"
              variants={fadeInUp}
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
            >
              Pronto per il Tuo{" "}
              <motion.span 
                className="text-amber-400 inline-block"
                animate={{ 
                  textShadow: [
                    "0 0 0px rgba(245, 158, 11, 0)",
                    "0 0 30px rgba(245, 158, 11, 0.8)",
                    "0 0 0px rgba(245, 158, 11, 0)"
                  ]
                }}
                transition={{
                  duration: 4,
                  ease: "easeInOut",
                  repeat: Infinity,
                  repeatType: "reverse"
                }}
              >
                Nuovo Look?
              </motion.span>
            </motion.h2>
            
            <motion.p 
              className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed"
              variants={fadeInUp}
            >
              Prenota ora il tuo appuntamento e scopri l'esperienza Maskio Barber Concept
            </motion.p>
            
            <motion.div 
              className="flex flex-col sm:flex-row gap-6 justify-center items-center"
              variants={fadeInUp}
            >
              <motion.div
                variants={magneticHover}
                initial="rest"
                whileHover="hover"
                whileTap="tap"
                className="relative"
              >
                <BookingButton size="lg" className="text-lg px-10 py-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 shadow-lg transition-all duration-300">
                  Prenota il Tuo Appuntamento
                </BookingButton>
              </motion.div>
              
              <Link href="/contatti">
                <motion.button 
                  className="border-2 border-white text-white px-10 py-4 rounded-xl font-semibold text-lg transition-all duration-300 relative overflow-hidden group"                  variants={magneticHover}
                  initial="rest"
                  whileTap="tap"
                  whileHover={{
                    backgroundColor: "rgba(255, 255, 255, 1)",
                    color: "#000000",
                    boxShadow: "0 15px 30px rgba(255, 255, 255, 0.2)",
                    y: -2
                  }}
                >
                  <motion.span
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                    initial={{ x: "-100%" }}
                    whileHover={{ x: "100%" }}
                    transition={{ duration: 0.6, ease: "easeInOut" }}
                  />
                  <span className="relative z-10">Contattaci</span>
                </motion.button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>
    </div>
  );
}
