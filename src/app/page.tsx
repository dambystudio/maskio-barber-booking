'use client';

import { LazyMotion, domAnimation, m } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import BookingButton from '../components/BookingButton';

// Lazy load video component for better LCP
function HeroVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (videoRef.current) {
      observer.observe(videoRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <video
      ref={videoRef}
      src={isVisible ? "/videoLoopCompresso.mp4" : undefined}
      autoPlay={isVisible}
      muted
      loop
      playsInline
      className="absolute inset-0 w-full h-full object-cover brightness-[0.55] filter contrast-110 saturate-[1.02]"
      poster="/sediaOro.webp"
      preload="none"
    />
  );
}

export default function Home() {
  // Simplified Animation Variants for better INP
  const fadeInUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  const fadeInLeft = {
    hidden: { opacity: 0, x: -30 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { duration: 0.5, ease: "easeOut" }
    }
  };

  const fadeInRight = {
    hidden: { opacity: 0, x: 30 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { duration: 0.5, ease: "easeOut" }
    }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    }
  };

  const scaleIn = {
    hidden: { scale: 0.9, opacity: 0 },
    visible: { 
      scale: 1, 
      opacity: 1,
      transition: { duration: 0.4, ease: "easeOut" }
    }
  };

  return (
    <LazyMotion features={domAnimation}>
      <div className="min-h-screen bg-black">
        {/* Simplified Background Elements - Static for performance */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-br from-yellow-300/3 to-yellow-600/2 rounded-full blur-3xl opacity-60" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-br from-yellow-400/2 to-yellow-500/2 rounded-full blur-3xl opacity-40" />
          <div 
            className="absolute inset-0 pointer-events-none opacity-40"
            style={{ background: "radial-gradient(circle at center, transparent 30%, black 140%)" }}
          />
        </div>

        {/* Hero Section */}
        <div className="relative h-screen">
          {/* Hero Video with lazy loading */}
          <m.div 
            className="absolute inset-0 z-0"
            initial={{ scale: 1.02 }}
            animate={{ scale: 1 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          >
            <HeroVideo />
            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-gray-900/50 to-yellow-950/20" />
            
            {/* Decorative elements - static, no animations for performance */}
            <div className="absolute inset-0">
              <div 
                className="absolute top-[25%] right-[7%] h-40 w-3 rounded-full overflow-hidden hidden md:block opacity-50"
                style={{ background: "repeating-linear-gradient(45deg, #ffffff33, #ffffff33 10px, #fb923c33 10px, #fb923c33 20px)" }}
              />
              <div className="absolute top-[10%] left-[5%] w-[2px] h-32 bg-gradient-to-b from-transparent via-yellow-500/40 to-transparent opacity-50" />
              <div className="absolute bottom-[15%] right-[8%] w-[2px] h-40 bg-gradient-to-b from-transparent via-yellow-500/40 to-transparent opacity-50" />
              <div className="absolute top-28 right-28 w-3 h-3 border-2 border-yellow-400/40 rounded-full opacity-50" />
              <div className="absolute bottom-36 left-24 w-2 h-2 border border-yellow-300/50 rounded-full opacity-60" />
            </div>
          </m.div>
          
          {/* Hero Content */}
          <div className="relative z-10 h-full flex flex-col items-center justify-center text-center text-white px-4">
            <m.div
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
              className="space-y-4"
            >
              {/* Logo */}
              <m.div variants={fadeInUp} className="flex flex-col items-center">
                <div className="relative">
                  <div className="absolute -inset-16 opacity-10 blur-[80px] bg-gradient-radial from-yellow-400/20 via-yellow-400/5 to-transparent" />
                  <Image
                    src="/LogoSimboloNome_Bianco(1).png"
                    alt="Maskio Barber Concept"
                    width={320}
                    height={32}
                    className="mb-1 relative z-10 drop-shadow-lg w-64 h-auto sm:w-72 md:w-80 lg:w-96"
                    priority
                  />
                </div>
                
                {/* Decorative line under logo */}
                <div className="relative mt-8 flex flex-col items-center">
                  <div className="mb-2 opacity-80">
                    <svg width="24" height="12" viewBox="0 0 24 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 0L14.5 5H20.5L15.5 8L17.5 12L12 9.5L6.5 12L8.5 8L3.5 5H9.5L12 0Z" fill="rgba(251,191,36,0.6)" />
                    </svg>
                  </div>
                  <m.div 
                    className="h-[1px] w-48 bg-gradient-to-r from-transparent via-yellow-400/80 to-transparent"
                    variants={scaleIn}
                  />
                  <div className="flex items-center justify-center space-x-2 mt-1">
                    <div className="h-[1px] w-8 bg-gradient-to-r from-transparent to-yellow-400/50" />
                    <div className="h-1 w-1 rounded-full bg-yellow-400/70" />
                    <div className="h-[1px] w-8 bg-gradient-to-r from-yellow-400/50 to-transparent" />
                  </div>
                </div>
              </m.div>

              <m.p 
                variants={fadeInUp}
                className="text-xl md:text-2xl max-w-3xl mx-auto leading-relaxed text-gray-100/95 font-light tracking-wider"
              >
                <span className="text-yellow-400/40 font-serif">&quot;</span>
                Una nuova concezione del barbiere, dove{" "}
                <span className="font-medium">tradizione</span>{" "}e{" "}
                <span className="font-medium">innovazione</span>{" "}
                si incontrano per creare il tuo{" "}
                <span className="text-yellow-200 font-normal italic">stile perfetto</span>
                <span className="text-yellow-400/40 font-serif">&quot;</span>
              </m.p>

              {/* Buttons */}
              <m.div
                variants={fadeInUp}
                className="flex flex-col sm:flex-row gap-8 justify-center items-center pt-2"
              >
                <div className="relative group">
                  <div className="absolute -inset-1 rounded-xl bg-yellow-500/30 blur-md -z-10 group-hover:bg-yellow-500/50 transition-colors" />
                  <BookingButton 
                    size="lg" 
                    className="text-base bg-gradient-to-br from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 border-0 shadow-xl px-10 py-5 uppercase tracking-wider font-medium text-white rounded-lg transform hover:scale-105 hover:-translate-y-1 transition-transform duration-300"
                  >
                    <span className="relative flex items-center gap-2 z-10">
                      <span>Prenota Ora</span>
                      <svg 
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
                      >
                        <path d="M5 12h14"></path>
                        <path d="m12 5 7 7-7 7"></path>
                      </svg>
                    </span>
                  </BookingButton>
                </div>

                <Link href="/servizi">
                  <button 
                    className="relative border border-yellow-400/30 text-white px-10 py-5 rounded-lg font-medium text-base transition-all duration-300 hover:border-yellow-300/70 hover:text-yellow-100 hover:shadow-[0_10px_30px_rgba(251,191,36,0.15)] hover:-translate-y-1 uppercase tracking-wider bg-black/50 backdrop-blur-sm overflow-hidden group"
                  >
                    <span className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-400/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                    <span className="absolute top-[3px] left-[3px] w-3 h-3 border-l border-t border-yellow-400/40 group-hover:border-yellow-400/80 transition-colors" />
                    <span className="absolute bottom-[3px] right-[3px] w-3 h-3 border-r border-b border-yellow-400/40 group-hover:border-yellow-400/80 transition-colors" />
                    <span className="relative flex items-center gap-2">
                      <span>Scopri i Servizi</span>
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        width="18" 
                        height="18" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="2" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                        className="opacity-70 group-hover:opacity-100 transition-opacity"
                      >
                        <circle cx="12" cy="12" r="10"></circle>
                        <path d="m12 8 4 4-4 4"></path>
                        <path d="M8 12h8"></path>
                      </svg>
                    </span>
                  </button>
                </Link>
              </m.div>
            </m.div>
          </div>
        </div>

        {/* About Section */}
        <m.section 
          className="py-20 bg-gradient-to-br from-black to-gray-900 relative overflow-hidden"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={staggerContainer}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <m.div 
              className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center"
              variants={staggerContainer}
            >
              <m.div variants={fadeInLeft} className="space-y-8">
                <div className="space-y-6">
                  <h1 className="text-6xl md:text-5xl font-bold text-white font-alien">
                    L&apos;Arte del{" "}
                    <span className="text-yellow-600 font-alien">Barbiere Moderno</span>
                  </h1>
                  <p className="text-lg text-gray-300 leading-relaxed">
                    Maskio Barber Concept rappresenta l&apos;eccellenza nella cura dell&apos;uomo. 
                    Il nostro team di professionisti esperti combina tecniche tradizionali con le ultime 
                    tendenze per offrirti un&apos;esperienza unica e personalizzata.
                  </p>
                  <p className="text-lg text-gray-300 leading-relaxed">
                    Ogni taglio, ogni rasatura, ogni trattamento è pensato per esaltare la tua personalità 
                    e farti sentire al meglio. Perché per noi, ogni cliente è unico.
                  </p>
                </div>

                <Link href="/chi-siamo">
                  <button className="bg-gradient-to-r from-black to-gray-800 text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-lg transition-all duration-300 hover:shadow-[0_20px_40px_rgba(0,0,0,0.2)] hover:-translate-y-1 hover:scale-105">
                    La Nostra Storia
                  </button>
                </Link>
              </m.div>

              <m.div variants={fadeInRight} className="relative group">
                <div className="relative h-96 rounded-2xl overflow-hidden shadow-2xl transition-transform duration-300 group-hover:scale-[1.02]">
                  <Image
                    src="/taglio1.webp"
                    alt="Il nostro barbiere al lavoro"
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-tr from-black/20 via-transparent to-yellow-500/20 group-hover:from-black/10 transition-colors" />
                </div>
                <div className="absolute inset-0 bg-black/10 rounded-2xl -z-10 translate-x-2 translate-y-2 group-hover:translate-x-4 group-hover:translate-y-4 transition-transform" />
              </m.div>
            </m.div>
          </div>
        </m.section>

        {/* Services Preview */}
        <m.section 
          className="py-20 bg-gradient-to-br from-black via-gray-900/30 to-yellow-900/20 relative overflow-hidden"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={staggerContainer}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <m.div className="text-center mb-16" variants={fadeInUp}>
              <h2 className="text-6xl md:text-5xl font-bold text-white mb-4 font-alien">
                I Nostri <span className="text-yellow-600">Servizi</span>
              </h2>
              <p className="text-lg text-gray-200 max-w-3xl mx-auto font-medium">
                Dalla consulenza personalizzata ai trattamenti più avanzati, 
                offriamo una gamma completa di servizi per la cura dell&apos;uomo moderno
              </p>
            </m.div>

            <m.div className="grid grid-cols-1 md:grid-cols-3 gap-8" variants={staggerContainer}>
              {[
                {
                  title: 'Taglio & Styling',
                  description: 'Tagli personalizzati per esaltare la tua personalità e stile',
                  image: '/servizi-taglio.webp',
                  price: 'da 18€',
                  gradient: 'from-rose-200/20 to-slate-100/25'
                },
                {
                  title: 'Taglio Barba',
                  description: 'Taglio barba con rifinitura professionale',
                  image: '/servizi-barba.webp',
                  price: 'da 10€',
                  gradient: 'from-yellow-100/20 to-gray-100/25'
                },
                {
                  title: 'Altri Servizi',
                  description: 'Colore capelli o servizi su richiesta',
                  image: '/servizi-altri.webp',
                  price: 'Contattare Maskio Barber Concept',
                  gradient: 'from-blue-100/20 to-gray-100/25'
                }
              ].map((service, index) => (
                <m.div
                  key={index}
                  variants={scaleIn}
                  className={`relative bg-gradient-to-br ${service.gradient} backdrop-blur-sm p-7 pt-6 pb-9 rounded-2xl text-center group cursor-pointer overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:scale-[1.02]`}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/70 via-white/30 to-yellow-100/30 rounded-2xl" />

                  <div className="h-56 w-full mb-8 relative z-10 overflow-hidden rounded-lg">
                    <Image 
                      src={service.image}
                      alt={service.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                      sizes="(max-width: 768px) 100vw, 33vw"
                      loading="lazy"
                      quality={75}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-black/10 opacity-75"></div>
                  </div>

                  <h3 className="text-xl font-bold text-black mb-4 relative z-10 drop-shadow-sm">{service.title}</h3>
                  <p className="text-gray-900 mb-5 relative z-10 font-medium drop-shadow-sm">{service.description}</p>
                  
                  <div className="text-lg font-semibold text-yellow-900 mb-4 relative z-10">
                    {service.price}
                  </div>

                  <div className="absolute inset-0 bg-black/5 rounded-2xl -z-10 translate-x-1 translate-y-1 group-hover:translate-x-3 group-hover:translate-y-3 transition-transform" />
                  <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-yellow-600/30 transition-colors" />
                </m.div>
              ))}
            </m.div>

            <m.div className="text-center mt-12" variants={fadeInUp}>
              <Link href="/servizi">
                <button className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white px-10 py-4 rounded-xl font-semibold text-lg shadow-lg transition-all duration-300 hover:shadow-[0_20px_40px_rgba(234,179,8,0.3)] hover:-translate-y-1 hover:from-yellow-600 hover:to-yellow-700 relative overflow-hidden group">
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-500" />
                  <span className="relative z-10">Vedi Tutti i Servizi</span>
                </button>
              </Link>
            </m.div>
          </div>
        </m.section>

        {/* Why Choose Us */}
        <m.section 
          className="py-20 bg-gradient-to-br from-black via-gray-900 to-gray-800 text-white relative overflow-hidden"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={staggerContainer}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <m.div className="text-center mb-16" variants={fadeInUp}>
              <h2 className="text-6xl md:text-5xl font-bold mb-4 font-alien">
                Perché Scegliere <span className="text-yellow-400 font-alien">Maskio Barber Concept</span>
              </h2>
              <p className="text-lg text-gray-200 max-w-3xl mx-auto font-medium">
                Non siamo solo un barbiere, siamo i tuoi partner nella cura del tuo stile
              </p>
            </m.div>

            <m.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8" variants={staggerContainer}>
              {[
                {
                  icon: '👨‍💼',
                  title: 'Professionisti Esperti',
                  description: 'Team di barbieri qualificati con anni di esperienza',
                  color: 'from-blue-500/20 to-purple-500/20'
                },
                {
                  icon: '🏆',
                  title: 'Qualità Premium',
                  description: 'Utilizziamo solo prodotti professionali di alta qualità',
                  color: 'from-yellow-500/20 to-yellow-500/20'
                },
                {
                  icon: '🎯',
                  title: 'Stile Personalizzato',
                  description: 'Ogni servizio è studiato per le tue esigenze specifiche',
                  color: 'from-green-500/20 to-emerald-500/20'
                },
                {
                  icon: '🌟',
                  title: 'Esperienza Unica',
                  description: 'Un ambiente moderno e accogliente per il tuo relax',
                  color: 'from-rose-500/20 to-pink-500/20'
                }
              ].map((feature, index) => (
                <m.div
                  key={index}
                  variants={scaleIn}
                  className={`relative text-center p-6 rounded-2xl bg-gradient-to-br ${feature.color} backdrop-blur-sm border border-white/10 group cursor-pointer overflow-hidden transition-all duration-300 hover:scale-105 hover:-translate-y-2`}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-yellow-400/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                  
                  <div className="relative mb-6 flex justify-center">
                    <div className="text-5xl relative z-10 transition-transform group-hover:scale-110">
                      {feature.icon}
                    </div>
                  </div>

                  <h3 className="text-xl font-bold mb-3 text-white relative z-10 group-hover:text-yellow-400 transition-colors">
                    {feature.title}
                  </h3>
                  
                  <p className="text-gray-200 relative z-10 leading-relaxed font-medium">{feature.description}</p>

                  <div className="absolute inset-0 bg-black/20 rounded-2xl -z-10 translate-x-1 translate-y-1 group-hover:translate-x-3 group-hover:translate-y-3 transition-transform" />
                  <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-yellow-500/30 transition-colors" />
                </m.div>
              ))}
            </m.div>
          </div>
        </m.section>

        {/* Gallery Preview */}
        <m.section 
          className="py-20 bg-gradient-to-br from-black via-gray-900/30 to-yellow-900/20 relative overflow-hidden"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={staggerContainer}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <m.div className="text-center mb-16" variants={fadeInUp}>
              <h2 className="text-6xl md:text-5xl font-bold text-white mb-4 font-alien">
                I Nostri <span className="text-yellow-600">Lavori</span>
              </h2>
              <p className="text-lg text-gray-300 max-w-3xl mx-auto">
                Scopri alcune delle nostre creazioni e lasciati ispirare per il tuo prossimo look
              </p>
            </m.div>

            <m.div className="grid grid-cols-2 md:grid-cols-4 gap-6" variants={staggerContainer}>
              {[
                { src: '/taglio1.webp', title: 'Taglio Moderno' },
                { src: '/taglio2.webp', title: 'Styling Classico' },
                { src: '/sediaOro.webp', title: 'Ambiente Premium' },
                { src: '/prodotti.webp', title: 'Prodotti Professionali' }
              ].map((item, index) => (
                <m.div
                  key={index}
                  variants={scaleIn}
                  className="relative group cursor-pointer transition-all duration-300 hover:scale-105 hover:-translate-y-2"
                >
                  <div className="relative aspect-square rounded-2xl overflow-hidden shadow-lg group-hover:shadow-[0_25px_50px_rgba(0,0,0,0.25)] transition-shadow">
                    <Image
                      src={item.src}
                      alt={item.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                      sizes="(max-width: 768px) 50vw, 25vw"
                      loading="lazy"
                    />
                    
                    <div className="absolute inset-0 bg-gradient-to-tr from-black/40 via-transparent to-yellow-500/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <h3 className="text-white text-lg font-semibold text-center px-4 py-2 bg-black/50 rounded-lg backdrop-blur-sm">
                        {item.title}
                      </h3>
                    </div>
                  </div>

                  <div className="absolute inset-0 bg-black/10 rounded-2xl -z-10 translate-x-1 translate-y-1 group-hover:translate-x-4 group-hover:translate-y-4 transition-transform" />
                  <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-yellow-500/30 transition-colors" />
                </m.div>
              ))}
            </m.div>

            <m.div className="text-center mt-12" variants={fadeInUp}>
              <Link href="/testimonianze">
                <button className="bg-gradient-to-r from-black to-gray-900 text-white px-10 py-4 rounded-xl font-semibold text-lg shadow-lg transition-all duration-300 hover:shadow-[0_20px_40px_rgba(0,0,0,0.3)] hover:-translate-y-1 relative overflow-hidden group">
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-500" />
                  <span className="relative z-10">Vedi Tutte le Recensioni</span>
                </button>
              </Link>
            </m.div>
          </div>
        </m.section>

        {/* CTA Section */}
        <m.section 
          className="py-20 bg-gradient-to-br from-black via-gray-900 to-gray-800 text-white relative overflow-hidden"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={staggerContainer}
        >
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <m.div variants={staggerContainer}>
              <m.h2 
                className="text-4xl md:text-5xl font-bold mb-6"
                variants={fadeInUp}
              >
                Pronto per il Tuo <span className="text-yellow-400">Nuovo Look?</span>
              </m.h2>
              
              <m.p 
                className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed"
                variants={fadeInUp}
              >
                Prenota ora il tuo appuntamento e scopri l&apos;esperienza Maskio Barber Concept
              </m.p>
              
              <m.div 
                className="flex flex-col sm:flex-row gap-6 justify-center items-center"
                variants={fadeInUp}
              >
                <div className="relative group">
                  <BookingButton size="lg" className="text-lg px-10 py-4 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 shadow-lg transition-all duration-300 hover:shadow-[0_20px_40px_rgba(234,179,8,0.3)] hover:-translate-y-1">
                    Prenota il Tuo Appuntamento
                  </BookingButton>
                </div>
                
                <Link href="/contatti">
                  <button className="border-2 border-white text-white px-10 py-4 rounded-xl font-semibold text-lg transition-all duration-300 relative overflow-hidden group hover:bg-white hover:text-black hover:shadow-[0_15px_30px_rgba(255,255,255,0.2)] hover:-translate-y-1">
                    <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-500" />
                    <span className="relative z-10">Contattaci</span>
                  </button>
                </Link>
              </m.div>
            </m.div>
          </div>
        </m.section>
      </div>
    </LazyMotion>
  );
}
