'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import BookingButton from '../components/BookingButton';
import ReviewsSection from '../components/ReviewsSection';

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
  };  return (
    <div className="min-h-screen bg-black">      {/* Enhanced Luxury Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">        {/* Primary golden glow - reduced intensity */}
        <motion.div
          initial="hidden"
          className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-br from-amber-300/5 to-amber-600/4 rounded-full blur-3xl"
          animate={{
            y: [-15, 15, -15],
            x: [-8, 8, -8],
            scale: [1, 1.08, 1],
            opacity: [0.5, 0.6, 0.5]
          }}
          transition={{
            duration: 12,
            ease: "easeInOut",
            repeat: Infinity,
            repeatType: "reverse"
          }}
        />
          {/* Secondary warm accent - reduced intensity */}
        <motion.div
          initial="hidden"
          className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-br from-amber-400/4 to-orange-500/4 rounded-full blur-3xl"
          animate={{
            y: [12, -12, 12],
            x: [6, -6, 6],
            scale: [1.1, 1.02, 1.1],
            opacity: [0.4, 0.5, 0.4]
          }}
          transition={{
            duration: 15,
            ease: "easeInOut",
            repeat: Infinity,
            repeatType: "reverse",
            delay: 2
          }}
        />
          {/* Subtle contrast element - reduced intensity */}
        <motion.div
          initial="hidden"
          className="absolute top-1/2 left-1/4 w-60 h-60 bg-gradient-to-br from-gray-500/3 to-gray-700/3 rounded-full blur-3xl"
          animate={{
            y: [18, -18, 18],
            x: [-10, 10, -10],
            scale: [0.9, 1.1, 0.9],
            opacity: [0.3, 0.4, 0.3]
          }}
          transition={{
            duration: 18,
            ease: "easeInOut",
            repeat: Infinity,
            repeatType: "reverse",
            delay: 4
          }}
        />
        
        {/* Soft vignette effect for depth */}
        <div className="absolute inset-0 bg-radial-gradient pointer-events-none opacity-70"
          style={{
            background: "radial-gradient(circle at center, transparent 30%, black 140%)"
          }}
        />
        
        {/* Subtle texture overlay */}
        <div className="absolute inset-0 bg-[url('/subtle-pattern.png')] opacity-[0.02] mix-blend-soft-light"></div>
      </div>

      {/* Hero Section - Design più lussuoso */}
      <div className="relative h-screen">
        {/* Hero Image con overlay più raffinato */}
        <motion.div 
          className="absolute inset-0 z-0"
          initial={{ scale: 1.08 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.8, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <Image
            src="/sediaOro.jpg"
            alt="Maskio Barber Concept"
            fill
            className="object-cover brightness-[0.25] filter contrast-125 saturate-[1.05]"
            priority
          />
            {/* Overlay con gradiente più sofisticato e lussuoso */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-black/95 via-gray-900/75 to-amber-950/35"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 2.2, ease: "easeOut" }}
          />
          
          {/* Additional luxury grain texture */}
          <motion.div
            className="absolute inset-0 mix-blend-soft-light opacity-20"
            style={{
              backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")'
            }}
            animate={{
              opacity: [0.2, 0.25, 0.2]
            }}
            transition={{
              duration: 8,
              ease: "easeInOut",
              repeat: Infinity
            }}
          />
          
          {/* Elementi decorativi più eleganti */}
          <div className="absolute inset-0">            {/* Pattern overlay sottile */}
            <motion.div 
              className="absolute inset-0 bg-[url('/subtle-pattern.png')] bg-repeat opacity-[0.04]"
              animate={{
                opacity: [0.04, 0.05, 0.04]
              }}
              transition={{
                duration: 8,
                ease: "easeInOut",
                repeat: Infinity,
                repeatType: "reverse"
              }}
            />
            
            {/* Barber pole decorative element */}
            <motion.div
              className="absolute top-[25%] right-[7%] h-40 w-3 rounded-full overflow-hidden hidden md:block"
              style={{
                background: "repeating-linear-gradient(45deg, #ffffff33, #ffffff33 10px, #fb923c33 10px, #fb923c33 20px, #ffffff33 20px, #ffffff33 30px)"
              }}
              animate={{
                backgroundPosition: ["0px 0px", "0px 100px"],
                opacity: [0.4, 0.6, 0.4]
              }}
              transition={{
                backgroundPosition: {
                  duration: 4,
                  repeat: Infinity,
                  ease: "linear"
                },
                opacity: {
                  duration: 5,
                  repeat: Infinity,
                  repeatType: "reverse",
                  ease: "easeInOut"
                }
              }}
            />
            
            {/* Linee decorative dorate */}
            <motion.div 
              className="absolute top-[10%] left-[5%] w-[2px] h-32 bg-gradient-to-b from-transparent via-amber-500/40 to-transparent"
              animate={{
                height: [128, 160, 128],
                opacity: [0.4, 0.6, 0.4]
              }}
              transition={{
                duration: 7,
                ease: "easeInOut",
                repeat: Infinity,
                repeatType: "reverse"
              }}
            />
            
            <motion.div 
              className="absolute bottom-[15%] right-[8%] w-[2px] h-40 bg-gradient-to-b from-transparent via-amber-500/40 to-transparent"
              animate={{
                height: [160, 128, 160],
                opacity: [0.4, 0.6, 0.4]
              }}
              transition={{
                duration: 8,
                ease: "easeInOut",
                repeat: Infinity,
                repeatType: "reverse",
                delay: 1.5
              }}
            />
            
            {/* Cerchi decorativi più raffinati */}
            <motion.div
              className="absolute top-28 right-28 w-3 h-3 border-2 border-amber-400/40 rounded-full"
              animate={{
                y: [-15, 15, -15],
                x: [-8, 8, -8],
                opacity: [0.4, 0.7, 0.4]
              }}
              transition={{
                duration: 10,
                ease: "easeInOut",
                repeat: Infinity,
                repeatType: "reverse"
              }}
            />
            
            <motion.div
              className="absolute bottom-36 left-24 w-2 h-2 border border-amber-300/50 rounded-full"
              animate={{
                y: [10, -10, 10],
                x: [5, -5, 5],
                opacity: [0.5, 0.8, 0.5]
              }}
              transition={{
                duration: 12,
                ease: "easeInOut",
                repeat: Infinity,
                repeatType: "reverse",
                delay: 2
              }}
            />
              {/* SVG Decorative scissors icon */}
            <motion.div
              className="absolute top-[30%] right-[15%] text-amber-500/30 w-12 h-12"
              animate={{
                rotate: [0, 45, 0],
                opacity: [0.3, 0.5, 0.3],
                scale: [1, 1.1, 1]
              }}
              transition={{
                duration: 15,
                ease: "easeInOut",
                repeat: Infinity,
                repeatType: "reverse"
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="6" cy="6" r="3" />
                <circle cx="6" cy="18" r="3" />
                <line x1="20" y1="4" x2="8.12" y2="15.88" />
                <line x1="14.47" y1="14.48" x2="20" y2="20" />
                <line x1="8.12" y1="8.12" x2="12" y2="12" />
              </svg>
            </motion.div>
            
            {/* SVG Decorative straight razor icon */}
            <motion.div
              className="absolute bottom-[25%] left-[12%] text-amber-500/30 w-10 h-10"
              animate={{
                rotate: [0, -30, 0],
                opacity: [0.3, 0.6, 0.3],
                scale: [1, 1.05, 1]
              }}
              transition={{
                duration: 18,
                ease: "easeInOut",
                repeat: Infinity,
                repeatType: "reverse"
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4l16 16" />
                <path d="M18 12l2.5 2.5a2.828 2.828 0 1 1-4 4L14 16" />
                <path d="M14 16l-8.5-8.5a2.828 2.828 0 0 1 4-4L12 6" />
              </svg>
            </motion.div>
            
            {/* SVG Decorative comb icon */}
            <motion.div
              className="absolute top-[60%] left-[20%] text-amber-500/20 w-8 h-8"
              animate={{
                rotate: [0, 15, 0],
                opacity: [0.2, 0.4, 0.2],
                scale: [1, 1.08, 1]
              }}
              transition={{
                duration: 20,
                ease: "easeInOut",
                repeat: Infinity,
                repeatType: "reverse"
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 6v14c0 1.1.9 2 2 2h0a2 2 0 0 0 2-2V6M3 6V4c0-1.1.9-2 2-2h0a2 2 0 0 1 2 2v2M7 6h12M7 18h12M19 6v14c0 1.1.9 2 2 2h0a2 2 0 0 0 2-2V6M19 6V4c0-1.1.9-2 2-2h0a2 2 0 0 1 2 2v2" />
                <path d="M11 6v3M15 6v3M11 12v3M15 12v3M11 18v3M15 18v3" />
              </svg>
            </motion.div>
          </div>
        </motion.div>
        
        {/* Hero Content - Layout più elegante */}
        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center text-white px-4">          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="space-y-4" /* Further reduced from space-y-6 to position elements even closer */
          >
            {/* Logo con decorazione sofisticata */}
            <motion.div
              variants={fadeInUp}
              className="flex flex-col items-center"
            >              <motion.div 
                className="relative"                whileHover={{ scale: 1.05 }}
                animate={{ y: [0, -5, 0] }}
                transition={{
                  scale: { duration: 0.3, type: "spring", stiffness: 300 },
                  y: {
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }
                }}
              >
                {/* Multiple glowing layers for more depth */}                <motion.div
                  className="absolute -inset-16 opacity-3 blur-[80px]"
                  animate={{
                    background: [
                      "radial-gradient(ellipse at center, rgba(251,191,36,0.15) 0%, rgba(251,191,36,0.05) 40%, transparent 80%)",
                      "radial-gradient(ellipse at center, rgba(251,191,36,0.12) 0%, rgba(251,191,36,0.04) 40%, transparent 80%)",
                      "radial-gradient(ellipse at center, rgba(251,191,36,0.09) 0%, rgba(251,191,36,0.03) 40%, transparent 80%)",
                      "radial-gradient(ellipse at center, rgba(251,191,36,0.05) 0%, rgba(251,191,36,0.02) 40%, transparent 80%)",
                      "radial-gradient(ellipse at center, rgba(251,191,36,0.07) 0%, rgba(251,191,36,0.025) 40%, transparent 80%)",
                      "radial-gradient(ellipse at center, rgba(251,191,36,0.1) 0%, rgba(251,191,36,0.035) 40%, transparent 80%)",
                      "radial-gradient(ellipse at center, rgba(251,191,36,0.15) 0%, rgba(251,191,36,0.05) 40%, transparent 80%)"
                    ]
                  }}
                  transition={{
                    duration: 8,
                    ease: "easeInOut", 
                    repeat: Infinity,
                    repeatType: "loop"
                  }}
                ></motion.div>                <motion.div
                  className="absolute -inset-12 opacity-3 blur-[60px]"
                  animate={{
                    background: [
                      "radial-gradient(ellipse at center, rgba(251,191,36,0.1) 0%, rgba(251,191,36,0.03) 30%, transparent 70%)",
                      "radial-gradient(ellipse at center, rgba(251,191,36,0.08) 0%, rgba(251,191,36,0.025) 30%, transparent 70%)",
                      "radial-gradient(ellipse at center, rgba(251,191,36,0.06) 0%, rgba(251,191,36,0.02) 30%, transparent 70%)",
                      "radial-gradient(ellipse at center, rgba(251,191,36,0.03) 0%, rgba(251,191,36,0.01) 30%, transparent 70%)",
                      "radial-gradient(ellipse at center, rgba(251,191,36,0.05) 0%, rgba(251,191,36,0.015) 30%, transparent 70%)",
                      "radial-gradient(ellipse at center, rgba(251,191,36,0.07) 0%, rgba(251,191,36,0.02) 30%, transparent 70%)",
                      "radial-gradient(ellipse at center, rgba(251,191,36,0.1) 0%, rgba(251,191,36,0.03) 30%, transparent 70%)"
                    ]
                  }}
                  transition={{
                    duration: 7,
                    ease: "easeInOut", 
                    repeat: Infinity,
                    repeatType: "loop",
                    delay: 0.5
                  }}
                ></motion.div>
                  {/* Enhanced shimmer effect - more subtle */}
                <motion.div
                  className="absolute -inset-1 rounded-full opacity-35 blur-sm"
                  animate={{
                    background: [
                      "linear-gradient(45deg, rgba(251,191,36,0) 0%, rgba(251,191,36,0.3) 50%, rgba(251,191,36,0) 100%)",
                      "linear-gradient(45deg, rgba(251,191,36,0) 0%, rgba(251,191,36,0) 50%, rgba(251,191,36,0.3) 100%)",
                      "linear-gradient(45deg, rgba(251,191,36,0.3) 0%, rgba(251,191,36,0) 50%, rgba(251,191,36,0) 100%)"
                    ],
                    backgroundSize: ["200% 200%", "200% 200%", "200% 200%"],
                    backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"]
                  }}
                  transition={{
                    duration: 6,
                    ease: "easeInOut", 
                    repeat: Infinity
                  }}
                ></motion.div>                  <Image
                  src="/LogoSimboloNome_Bianco(1).png"
                  alt="Maskio Barber Concept"
                  width={220}
                  height={22}
                  className="mb-1 relative z-10 drop-shadow-lg"
                  priority
                />
              </motion.div>                {/* Linea decorativa elegante sotto il logo - Versione migliorata */}
              <div className="relative mt-8 flex flex-col items-center">
                {/* Decorative ornament */}
                <motion.div className="mb-2 opacity-80"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 0.8, scale: 1 }}
                  transition={{ delay: 0.7, duration: 0.8, type: "spring" }}
                >
                  <svg width="24" height="12" viewBox="0 0 24 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 0L14.5 5H20.5L15.5 8L17.5 12L12 9.5L6.5 12L8.5 8L3.5 5H9.5L12 0Z" fill="rgba(251,191,36,0.6)" />
                  </svg>
                </motion.div>
                
                <motion.div 
                  className="h-[1px] w-48 bg-gradient-to-r from-transparent via-amber-400/80 to-transparent"
                  variants={scaleIn}
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 0.5, duration: 1.2 }}
                />
                
                {/* Animated golden dot */}
                <motion.div 
                  className="absolute -top-[2px] left-1/2 transform -translate-x-1/2 h-[3px] w-3 rounded-full bg-amber-400"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 1, 0] }}
                  transition={{ delay: 1.7, duration: 2, repeat: Infinity, repeatDelay: 4 }}
                />
                
                <div className="flex items-center justify-center space-x-2 mt-1">
                  <motion.div 
                    className="h-[1px] w-8 bg-gradient-to-r from-transparent to-amber-400/50"
                    initial={{ scaleX: 0, originX: 1 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: 0.8, duration: 0.6 }}
                  />
                  
                  <motion.div
                    className="h-1 w-1 rounded-full bg-amber-400/70"
                    initial={{ scale: 0 }}
                    animate={{ scale: [0, 1, 0.8, 1] }}
                    transition={{ delay: 1, duration: 0.8 }}
                  />
                  
                  <motion.div 
                    className="h-[1px] w-8 bg-gradient-to-r from-amber-400/50 to-transparent"
                    initial={{ scaleX: 0, originX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: 0.8, duration: 0.6 }}
                  />
                </div>
              </div>
            </motion.div>              <motion.p 
              variants={fadeInUp}
              className="text-xl md:text-2xl max-w-3xl mx-auto leading-relaxed text-gray-100/95 font-light tracking-wider"
            >
              <span className="relative inline-block">
                <motion.span
                  className="absolute -left-3 top-0 text-3xl text-amber-400/40 font-serif"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1, delay: 1.5 }}
                >
                  "
                </motion.span>
              </span>
              Una nuova concezione del barbiere, dove{" "}
              <motion.span 
                className="font-medium relative"
                whileHover={{ color: "#fbbf24" }}
                transition={{ duration: 0.3 }}
              >
                tradizione
                <motion.span
                  className="absolute -bottom-1 left-0 h-[1px] w-full bg-amber-500/30"
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  transition={{ duration: 0.8, delay: 1.8 }}
                />
              </motion.span>{" "}
              e{" "}
              <motion.span 
                className="font-medium relative"
                whileHover={{ color: "#fbbf24" }}
                transition={{ duration: 0.3 }}
              >
                innovazione
                <motion.span
                  className="absolute -bottom-1 left-0 h-[1px] w-full bg-amber-500/30"
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  transition={{ duration: 0.8, delay: 2 }}
                />
              </motion.span>{" "}
              si incontrano per creare il tuo{" "}
              <motion.span 
                className="text-amber-200 font-normal italic relative"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                stile perfetto
                <motion.span 
                  className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-amber-400/10 via-amber-400/70 to-amber-400/10"
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  transition={{ duration: 1, delay: 1.2 }}
                />
              </motion.span>
              <span className="relative inline-block">
                <motion.span
                  className="absolute -right-3 bottom-0 text-3xl text-amber-400/40 font-serif"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1, delay: 1.8 }}
                >
                  "
                </motion.span>
              </span>
            </motion.p>            {/* Pulsanti con design più raffinato */}            <motion.div
              variants={fadeInUp}
              className="flex flex-col sm:flex-row gap-8 justify-center items-center pt-2" /* Further reduced from pt-4 to pt-2 */
            >
              <motion.div
                whileHover={{
                  scale: 1.05,
                  y: -5
                }}
                whileTap={{ scale: 0.97 }}
                className="relative"
              >
                {/* Glow effect behind primary button */}
                <motion.div 
                  className="absolute -inset-1 rounded-xl bg-amber-500/30 blur-md -z-10"
                  animate={{
                    opacity: [0.3, 0.5, 0.3],
                    scale: [1, 1.05, 1]
                  }}
                  transition={{
                    duration: 2.5,
                    ease: "easeInOut",
                    repeat: Infinity
                  }}
                />                <BookingButton size="lg" className="text-base bg-gradient-to-br from-amber-500 to-amber-700 hover:from-amber-600 hover:to-amber-800 border-0 shadow-xl px-10 py-5 uppercase tracking-wider font-medium">
                  <span className="relative flex items-center gap-2 z-10">
                    {/* Small decorative element before text */}
                    <motion.span
                      className="absolute -left-5 top-1/2 transform -translate-y-1/2 w-3 h-[1px] bg-white/70"
                      initial={{ scaleX: 0, opacity: 0 }}
                      animate={{ scaleX: 1, opacity: 1 }}
                      transition={{ delay: 1.5, duration: 0.5 }}
                    />
                    
                    <span>Prenota Subito</span>
                    
                    {/* Animated arrow with enhanced styling */}
                    <motion.svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      width="18" 
                      height="18" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                      className="ml-1"
                      animate={{ x: [0, 3, 0], opacity: [0.7, 1, 0.7] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <path d="M5 12h14"></path>
                      <path d="m12 5 7 7-7 7"></path>
                    </motion.svg>
                    
                    {/* Small decorative element after text */}
                    <motion.span
                      className="absolute -right-5 top-1/2 transform -translate-y-1/2 w-3 h-[1px] bg-white/70"
                      initial={{ scaleX: 0, opacity: 0 }}
                      animate={{ scaleX: 1, opacity: 1 }}
                      transition={{ delay: 1.5, duration: 0.5 }}
                    />
                    
                    {/* Underline animation on hover */}
                    <motion.span
                      className="absolute bottom-0 left-0 w-full h-[1px] bg-white/30"
                      initial={{ scaleX: 0 }}
                      whileHover={{ scaleX: 1 }}
                      transition={{ duration: 0.3 }}
                    />
                  </span>
                </BookingButton>
              </motion.div>
                <Link href="/servizi">                <motion.button 
                  className="relative border border-amber-400/30 text-white px-10 py-5 rounded-lg font-medium text-base transition-all duration-300 hover:border-amber-300/70 hover:text-amber-100 uppercase tracking-wider bg-black/50 backdrop-blur-sm overflow-hidden group"
                  whileHover={{
                    boxShadow: "0 10px 30px rgba(251, 191, 36, 0.15)",
                    borderColor: "rgba(251, 191, 36, 0.5)",
                    y: -5
                  }}
                  whileTap={{ scale: 0.97 }}
                >
                  {/* Enhanced background shine effect */}
                  <motion.span 
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-400/10 to-transparent -z-10" 
                    initial={{ x: '-100%', opacity: 0 }}
                    whileHover={{ x: '100%', opacity: 1 }}
                    transition={{ duration: 0.9, ease: "easeInOut" }}
                  />
                  
                  {/* Corner accent decorations */}
                  <motion.span 
                    className="absolute top-[3px] left-[3px] w-3 h-3 border-l border-t border-amber-400/40"
                    initial={{ opacity: 0.4 }}
                    whileHover={{ opacity: 0.8 }}
                  />
                  <motion.span 
                    className="absolute bottom-[3px] right-[3px] w-3 h-3 border-r border-b border-amber-400/40"
                    initial={{ opacity: 0.4 }}
                    whileHover={{ opacity: 0.8 }}
                  />
                  
                  <span className="relative flex items-center gap-2">
                    {/* Small decorative dot before text */}
                    <motion.span 
                      className="w-[3px] h-[3px] rounded-full bg-amber-400/70 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    />
                    
                    <span>Scopri i Servizi</span>
                    
                    {/* Enhanced animated icon */}
                    <motion.svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      width="18" 
                      height="18" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                      className="opacity-70 group-hover:opacity-100"
                      animate={{ rotate: [0, 0] }}
                      whileHover={{ rotate: [0, 360], transition: { duration: 0.8 } }}
                    >
                      <circle cx="12" cy="12" r="10"></circle>
                      <path d="m12 8 4 4-4 4"></path>
                      <path d="M8 12h8"></path>
                    </motion.svg>
                    
                    {/* Small decorative dot after text */}
                    <motion.span 
                      className="w-[3px] h-[3px] rounded-full bg-amber-400/70 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    />
                    
                    {/* Enhanced underline effect */}
                    <motion.span
                      className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-amber-400/70 to-transparent"
                      initial={{ scaleX: 0 }}
                      whileHover={{ scaleX: 1 }}
                      transition={{ duration: 0.4 }}
                    />
                  </span>
                </motion.button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </div>      {/* About Section with Enhanced Animations */}
      <motion.section 
        className="py-20 bg-gradient-to-br from-black to-gray-900 relative overflow-hidden"
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
              <motion.div className="space-y-6">                <motion.h2 
                  variants={fadeInUp}
                  className="text-4xl md:text-5xl font-bold text-white"
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
                  className="text-lg text-gray-300 leading-relaxed"
                >
                  Maskio Barber Concept rappresenta l'eccellenza nella cura dell'uomo. 
                  Il nostro team di professionisti esperti combina tecniche tradizionali con le ultime 
                  tendenze per offrirti un'esperienza unica e personalizzata.
                </motion.p>
                
                <motion.p 
                  variants={fadeInUp}
                  className="text-lg text-gray-300 leading-relaxed"
                >
                  Ogni taglio, ogni rasatura, ogni trattamento è pensato per esaltare la tua personalità 
                  e farti sentire al meglio. Perché per noi, ogni cliente è unico.
                </motion.p>
              </motion.div>

              <motion.div variants={fadeInUp}>
                <Link href="/chi-siamo">                  <motion.button 
                    className="bg-gradient-to-r from-black to-gray-800 text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-lg transition-all duration-300"
                    whileHover={{
                      boxShadow: "0 20px 40px rgba(0, 0, 0, 0.2)",
                      y: -3,
                      background: "linear-gradient(135deg, #000000 0%, #1f2937 100%)",
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
        className="py-20 bg-gradient-to-br from-black via-gray-900/30 to-amber-900/20 relative overflow-hidden"
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

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">          <motion.div 
            className="text-center mb-16"
            variants={fadeInUp}
          >
            <motion.h2 
              className="text-4xl md:text-5xl font-bold text-white mb-4"
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
              className="text-lg text-gray-300 max-w-3xl mx-auto"
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
                price: 'da 18€',
                gradient: 'from-blue-500/10 to-purple-500/10'
              },
              {
                title: 'Rasatura Tradizionale',
                description: 'L\'arte della rasatura con rasoio a mano libera',
                icon: '🪒',
                price: 'da 10€',
                gradient: 'from-amber-500/10 to-orange-500/10'
              },
              {
                title: 'Trattamenti Barba',
                description: 'Cura completa per una barba sempre perfetta',
                icon: '🧔',
                price: 'da 25€',
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
        className="py-20 bg-gradient-to-br from-black via-gray-900 to-gray-800 text-white relative overflow-hidden"
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
        className="py-20 bg-gradient-to-br from-black via-gray-900/30 to-amber-900/20 relative overflow-hidden"
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

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">          <motion.div 
            className="text-center mb-16"
            variants={fadeInUp}
          >
            <motion.h2 
              className="text-4xl md:text-5xl font-bold text-white mb-4"
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
              className="text-lg text-gray-300 max-w-3xl mx-auto"
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
          >            <Link href="/blog">
              <motion.button                className="bg-gradient-to-r from-black to-gray-900 text-white px-10 py-4 rounded-xl font-semibold text-lg shadow-lg transition-all duration-300 relative overflow-hidden group"
                variants={magneticHover}
                initial="rest"
                whileTap="tap"
                whileHover={{
                  boxShadow: "0 20px 40px rgba(0, 0, 0, 0.3)",
                  y: -3,
                  background: "linear-gradient(135deg, #000000 0%, #111827 100%)"
                }}
              >
                <motion.span
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                  initial={{ x: "-100%" }}
                  whileHover={{ x: "100%" }}
                  transition={{ duration: 0.6, ease: "easeInOut" }}
                />
                <span className="relative z-10">Vedi Tutte le Gallerie</span>
              </motion.button>            </Link>
          </motion.div>
        </div>
      </motion.section>

      {/* Reviews Section */}
      <ReviewsSection />

      {/* CTA Section with Advanced Animations */}
      <motion.section 
        className="py-20 bg-gradient-to-br from-black via-gray-900 to-gray-800 text-white relative overflow-hidden"
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
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
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
