'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { useState } from 'react';

export default function Page() {
  const [selectedCategory, setSelectedCategory] = useState('Tutti');
  const [currentImageIndex, setCurrentImageIndex] = useState<{[key: number]: number}>({});
  const blogPosts = [
    {
      id: 1,
      title: 'Tendenze Tagli Uomo 2025',
      excerpt: 'Scopri i tagli più alla moda per la nuova stagione e come mantenere il tuo look sempre perfetto.',
      category: 'Tendenze',
      date: '15 Gennaio 2025',
      image: '/taglio1.jpg',
      readTime: '5 min',
      author: 'Fabio Maskio',
      hasGallery: false
    },
    {
      id: 2,
      title: 'Galleria: I Nostri Migliori Lavori del 2024',
      excerpt: 'Una raccolta fotografica dei tagli e delle trasformazioni più spettacolari realizzate nel nostro salone.',
      category: 'Galleria',
      date: '12 Gennaio 2025',
      gallery: ['/taglio1.jpg', '/taglio2.jpg', '/sediaOro.jpg', '/prodotti.jpg'],
      readTime: '3 min',
      author: 'Team Maskio',
      hasGallery: true
    },
    {
      id: 3,
      title: 'Cura della Barba: Guida Completa',
      excerpt: 'Tutto quello che devi sapere per prenderti cura della tua barba come un vero professionista.',
      category: 'Cura',
      date: '10 Gennaio 2025',
      image: '/sediaOro.jpg',
      readTime: '8 min',
      author: 'Michele Rossi',
      hasGallery: false
    },
    {
      id: 4,
      title: 'Prima e Dopo: Trasformazioni Incredibili',
      excerpt: 'Scopri le trasformazioni più sorprendenti dei nostri clienti attraverso questa galleria fotografica.',
      category: 'Galleria',
      date: '8 Gennaio 2025',
      gallery: ['/taglio2.jpg', '/sediaOro.jpg', '/taglio1.jpg'],
      readTime: '4 min',
      author: 'Fabio Maskio',
      hasGallery: true
    },
    {
      id: 5,
      title: 'Il Taglio Perfetto per il Tuo Viso',
      excerpt: 'Come scegliere il taglio ideale in base alla forma del viso e alle tue caratteristiche.',
      category: 'Consigli',
      date: '5 Gennaio 2025',
      image: '/taglio2.jpg',
      readTime: '6 min',
      author: 'Fabio Maskio',
      hasGallery: false
    },
    {
      id: 6,
      title: 'Prodotti Professionali vs Commerciali',
      excerpt: 'Perché investire in prodotti professionali fa la differenza per la salute dei tuoi capelli.',
      category: 'Prodotti',
      date: '28 Dicembre 2024',
      image: '/prodotti.jpg',
      readTime: '4 min',
      author: 'Michele Rossi',
      hasGallery: false
    }
  ];

  const categories = ['Tutti', 'Tendenze', 'Cura', 'Consigli', 'Prodotti', 'Galleria'];

  const filteredPosts = selectedCategory === 'Tutti' 
    ? blogPosts 
    : blogPosts.filter(post => post.category === selectedCategory);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  const cardHoverVariants = {
    rest: { 
      scale: 1,
      y: 0,
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    },
    hover: {
      scale: 1.05,
      y: -10,
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    }
  };

  const imageHoverVariants = {
    rest: { scale: 1 },
    hover: {
      scale: 1.1,
      transition: {
        duration: 0.4,
        ease: "easeOut"
      }
    }
  };

  return (
    <main className="min-h-screen bg-black py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <motion.h1 
            className="text-4xl font-bold tracking-tight text-white sm:text-5xl mb-8"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Il Nostro Blog
          </motion.h1>
          <motion.p 
            className="text-lg text-gray-300 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Consigli, tendenze e segreti del mestiere direttamente dai nostri esperti. 
            Scopri tutto quello che c'è da sapere sul mondo della barbieria moderna.
          </motion.p>
        </motion.div>

        {/* Category Filter */}
        <motion.div 
          className="flex flex-wrap justify-center gap-4 mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          {categories.map((category, index) => (
            <motion.button
              key={category}
              onClick={() => setSelectedCategory(category)}              className={`px-6 py-3 rounded-full font-medium transition-all duration-300 ${
                selectedCategory === category
                  ? 'bg-yellow-400 text-black shadow-lg'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.7 + index * 0.1 }}
            >
              {category}
            </motion.button>
          ))}
        </motion.div>

        {/* Blog Posts Grid */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {filteredPosts.map((post, index) => (
            <motion.article
              key={post.id}
              className="bg-gray-900 border border-gray-800 rounded-2xl shadow-lg overflow-hidden cursor-pointer"
              variants={itemVariants}
              initial="rest"
              whileHover="hover"
              layout
            >
              <motion.div
                variants={cardHoverVariants}
                className="h-full"
              >                {/* Image or Gallery */}
                <div className="relative h-48 overflow-hidden">
                  {post.hasGallery && post.gallery ? (
                    // Gallery Component
                    <div className="relative w-full h-full">
                      <motion.div
                        variants={imageHoverVariants}
                        className="w-full h-full"
                      >
                        <Image
                          src={post.gallery[currentImageIndex[post.id] || 0]}
                          alt={`${post.title} - Immagine ${(currentImageIndex[post.id] || 0) + 1}`}
                          fill
                          className="object-cover"
                        />
                      </motion.div>
                      
                      {/* Gallery Navigation */}
                      {post.gallery.length > 1 && (
                        <>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              const current = currentImageIndex[post.id] || 0;
                              const newIndex = current > 0 ? current - 1 : post.gallery!.length - 1;
                              setCurrentImageIndex(prev => ({...prev, [post.id]: newIndex}));
                            }}
                            className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors z-10"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              const current = currentImageIndex[post.id] || 0;
                              const newIndex = current < post.gallery!.length - 1 ? current + 1 : 0;
                              setCurrentImageIndex(prev => ({...prev, [post.id]: newIndex}));
                            }}
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors z-10"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </button>
                          
                          {/* Gallery Indicators */}
                          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
                            {post.gallery.map((_, idx) => (
                              <button
                                key={idx}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setCurrentImageIndex(prev => ({...prev, [post.id]: idx}));
                                }}
                                className={`w-2 h-2 rounded-full transition-colors ${
                                  idx === (currentImageIndex[post.id] || 0) 
                                    ? 'bg-white' 
                                    : 'bg-white/50'
                                }`}
                              />
                            ))}
                          </div>
                        </>
                      )}
                      
                      {/* Gallery Badge */}
                      <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs font-medium">
                        {(currentImageIndex[post.id] || 0) + 1}/{post.gallery.length}
                      </div>
                    </div>
                  ) : (
                    // Single Image
                    <motion.div
                      variants={imageHoverVariants}
                      className="w-full h-full"
                    >
                      <Image
                        src={post.image || '/sediaOro.jpg'}
                        alt={post.title}
                        fill
                        className="object-cover"
                      />
                    </motion.div>
                  )}
                  
                  {/* Category Badge */}
                  <motion.div 
                    className="absolute top-4 left-4"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.8 + index * 0.1 }}
                  >
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      post.category === 'Galleria' 
                        ? 'bg-purple-600 text-white' 
                        : 'bg-black text-white'
                    }`}>
                      {post.category}
                    </span>
                  </motion.div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <motion.div 
                    className="flex items-center text-sm text-gray-500 mb-3"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.0 + index * 0.1 }}
                  >
                    <span>{post.date}</span>
                    <span className="mx-2">•</span>
                    <span>{post.readTime}</span>
                    <span className="mx-2">•</span>
                    <span>{post.author}</span>
                  </motion.div>                  <motion.h3 
                    className="text-xl font-bold text-white mb-3"
                    style={{
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.1 + index * 0.1 }}
                  >
                    {post.title}
                  </motion.h3>

                  <motion.p 
                    className="text-gray-300 text-sm leading-relaxed"
                    style={{
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.2 + index * 0.1 }}
                  >
                    {post.excerpt}
                  </motion.p>

                  <motion.div 
                    className="mt-4 pt-4 border-t border-gray-700"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.3 + index * 0.1 }}
                  >
                    <motion.button 
                      className="text-yellow-400 font-medium hover:text-yellow-300 transition-colors duration-200 flex items-center group"
                      whileHover={{ x: 5 }}
                    >
                      Leggi di più
                      <motion.svg 
                        className="w-4 h-4 ml-2 transition-transform duration-200"
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                        initial={{ x: 0 }}
                        whileHover={{ x: 3 }}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </motion.svg>
                    </motion.button>
                  </motion.div>
                </div>
              </motion.div>
            </motion.article>
          ))}
        </motion.div>

        {/* Empty State */}
        {filteredPosts.length === 0 && (
          <motion.div 
            className="text-center py-16"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >            <h3 className="text-xl font-semibold text-white mb-2">
              Nessun articolo trovato
            </h3>
            <p className="text-gray-300">
              Prova a selezionare una categoria diversa
            </p>
          </motion.div>
        )}

        {/* Newsletter Signup */}
        <motion.div 
          className="mt-20 bg-gradient-to-r from-black to-gray-900 border border-gray-800 rounded-2xl p-8 lg:p-12 text-center"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.5 }}
        >
          <motion.h3 
            className="text-3xl font-bold text-white mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.7 }}
          >
            Non Perdere Mai un Articolo
          </motion.h3>
          <motion.p 
            className="text-gray-300 mb-8 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.8 }}
          >
            Iscriviti alla nostra newsletter per ricevere i consigli più aggiornati 
            e le ultime tendenze direttamente nella tua casella email
          </motion.p>
          <motion.div 
            className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.9 }}
          >
            <input
              type="email"
              placeholder="La tua email"
              className="flex-1 px-4 py-3 rounded-lg border-0 focus:ring-2 focus:ring-yellow-400 focus:outline-none"
            />
            <motion.button 
              className="bg-yellow-400 text-black px-8 py-3 rounded-lg font-semibold hover:bg-yellow-300 transition-colors duration-200"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Iscriviti
            </motion.button>
          </motion.div>
        </motion.div>
      </div>
    </main>
  );
}