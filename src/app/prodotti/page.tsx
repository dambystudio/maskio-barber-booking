'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';

export default function Page() {
  const featuredProducts = [
    {
      name: 'Pomata Modellante Premium',
      description: 'Pomata professionale a tenuta forte per uno styling perfetto che dura tutto il giorno. Texture cremosa e facile da applicare.',
      price: '€32.00',
      image: '/prodotti.jpg'
    },
    {
      name: 'Olio da Barba Artigianale',
      description: 'Olio naturale nutriente per barba con oli essenziali. Ammorbidisce, idrata e profuma delicatamente.',
      price: '€28.00',
      image: '/prodotti.jpg'
    },
    {
      name: 'Kit Barba Completo',
      description: 'Set completo per la cura della barba: olio nutriente, balsamo modellante e pettine in legno di faggio.',
      price: '€65.00',
      image: '/prodotti.jpg'
    }
  ];  return (
    <main className="min-h-screen bg-black py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-4xl font-bold tracking-tight text-white sm:text-5xl mb-8"
          >
            I Nostri Prodotti
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-lg text-gray-300 max-w-3xl mx-auto"
          >
            Scopri la nostra selezione curata di prodotti professionali per la cura dei capelli e della barba. 
            Utilizziamo solo i migliori brand del settore per garantire risultati eccellenti.
          </motion.p>
        </motion.div>

        {/* Professional Section */}
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.6 }}          className="mb-20"
        >
          <div className="bg-gradient-to-r from-black to-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-2">
              {/* Image */}
              <motion.div 
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 1, delay: 0.8 }}
                className="relative h-64 lg:h-auto"
              >
                <Image
                  src="/prodotti.jpg"
                  alt="Prodotti professionali Maskio Barber"
                  fill
                  className="object-cover"
                />
              </motion.div>
              
              {/* Content */}
              <motion.div 
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 1, delay: 1 }}
                className="p-8 lg:p-12 flex items-center"
              >
                <div className="text-white">
                  <motion.h2 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 1.2 }}
                    className="text-3xl font-bold mb-4"
                  >
                    Qualità Professionale
                  </motion.h2>
                  <motion.p 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 1.4 }}
                    className="text-lg text-gray-300 mb-6"
                  >
                    Da Maskio Barber Concept utilizziamo esclusivamente prodotti di alta gamma, 
                    selezionati per le loro proprietà nutritive e la loro efficacia. 
                    Ogni prodotto è testato e approvato dai nostri professionisti.
                  </motion.p>
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 1.6 }}
                    className="flex items-center space-x-4"
                  >
                    <motion.div 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.5, delay: 1.8 }}
                      className="flex items-center"
                    >
                      <div className="w-2 h-2 bg-yellow-400 rounded-full mr-2"></div>
                      <span className="text-sm">Ingredienti naturali</span>
                    </motion.div>
                    <motion.div 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.5, delay: 2 }}
                      className="flex items-center"
                    >
                      <div className="w-2 h-2 bg-yellow-400 rounded-full mr-2"></div>
                      <span className="text-sm">Qualità garantita</span>
                    </motion.div>
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Products Section */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 2.2 }}          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold text-white mb-4">
            Prodotti in Vendita
          </h2>
          <p className="text-gray-300">
            Porta a casa la qualità professionale del nostro salone
          </p>
        </motion.div>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {featuredProducts.map((product, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 2.4 + index * 0.2 }}              whileHover={{ 
                y: -10,
                transition: { duration: 0.3 }
              }}
              className="group relative bg-gray-900 border border-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-xl hover:border-gray-700 transition-all duration-300"
            >
              <div className="aspect-w-4 aspect-h-3 bg-gray-200 relative h-64 overflow-hidden">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.3 }}
                >
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover object-center"
                  />
                </motion.div>
              </div>
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 2.6 + index * 0.2 }}                className="p-6"
              >
                <h3 className="text-xl font-semibold text-white mb-2">{product.name}</h3>
                <p className="text-gray-300 mb-4 text-sm leading-relaxed">{product.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-yellow-400">{product.price}</span>
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-yellow-400 text-black px-4 py-2 rounded-lg hover:bg-yellow-500 transition-colors duration-200 font-semibold"
                  >
                    Acquista
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          ))}
        </div>

        {/* Call to Action */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 3.2 }}
          className="text-center mt-16"
        >          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">
            <motion.h3 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 3.4 }}
              className="text-2xl font-semibold text-white mb-4"
            >
              Vuoi saperne di più?
            </motion.h3>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 3.6 }}
              className="text-gray-300 mb-6"
            >
              I nostri esperti sono a disposizione per consigliarti i prodotti più adatti alle tue esigenze
            </motion.p>
            <motion.a
              href="/contatti"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 3.8 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-block bg-yellow-400 text-black px-8 py-3 rounded-lg font-semibold hover:bg-yellow-500 transition-colors duration-200"
            >
              Contattaci
            </motion.a>
          </div>
        </motion.div>
      </div>
    </main>
  );
}