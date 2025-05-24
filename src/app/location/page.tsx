'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';

export default function Page() {
  return (
    <main className="min-h-screen bg-white py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl mb-8">
            La Nostra Location
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Scopri il nostro salone nel cuore di San Giovanni Rotondo, dove tradizione e modernità si incontrano 
            per offrirti un'esperienza unica di bellezza e benessere.
          </p>
        </div>

        {/* Salon Image and Description */}
        <div className="mb-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Image */}
            <div className="relative">
              <div className="aspect-w-4 aspect-h-3 relative h-96 rounded-2xl overflow-hidden shadow-2xl">
                <Image
                  src="/sediaOro.jpg"
                  alt="Interno del salone Maskio Barber Concept"
                  fill
                  className="object-cover"
                />
              </div>
              {/* Decorative elements */}
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-yellow-400 rounded-full opacity-20"></div>
              <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-gray-900 rounded-full opacity-30"></div>
            </div>

            {/* Description */}
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-gray-900">
                Un Ambiente Elegante e Accogliente
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed">
                Il nostro salone è stato progettato con cura per creare un ambiente raffinato dove ogni cliente 
                può rilassarsi e godersi un momento di puro benessere. Arredi di design, atmosfera accogliente 
                e la massima attenzione ai dettagli caratterizzano ogni angolo del nostro spazio.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                  <span className="text-gray-700">Atmosfera rilassante</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                  <span className="text-gray-700">Design moderno</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                  <span className="text-gray-700">Strumenti professionali</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                  <span className="text-gray-700">Igiene garantita</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Location Details */}
        <div className="bg-gray-50 rounded-2xl p-8 lg:p-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Address and Info */}
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Come Raggiungerci</h3>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="bg-black p-3 rounded-lg">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Indirizzo</h4>
                    <p className="text-gray-600">Via Sant'Agata, 24<br />71013 San Giovanni Rotondo FG</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-black p-3 rounded-lg">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Orari</h4>
                    <div className="text-gray-600 space-y-1">
                      <p>Lun - Ven: 09:00 - 19:00</p>
                      <p>Sabato: 09:00 - 18:00</p>
                      <p>Domenica: Chiuso</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-black p-3 rounded-lg">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Contatti</h4>
                    <p className="text-gray-600">+39 123 456 7890</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Map */}
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Mappa</h3>
              <div className="bg-white rounded-xl overflow-hidden shadow-lg">                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3048.558!2d15.7247!3d41.7066!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x133a3d8b8b8b8b8b%3A0x8b8b8b8b8b8b8b8b!2sVia%20Sant'Agata%2C%2024%2C%2071013%20San%20Giovanni%20Rotondo%20FG!5e0!3m2!1sit!2sit!4v1234567890"
                  width="100%"
                  height="300"
                  style={{ border: 0 }}
                  allowFullScreen={true}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="w-full h-80"
                ></iframe>
              </div>
              
              <div className="mt-4">
                <a
                  href="https://www.google.com/maps/dir//Via+Sant'Agata,+24,+71013+San+Giovanni+Rotondo+FG"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-2 bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors duration-200"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                  <span>Ottieni Indicazioni</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-16 text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Facile da Raggiungere
          </h3>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Situato nel centro di San Giovanni Rotondo, il nostro salone è facilmente raggiungibile 
            e dispone di parcheggio nelle vicinanze. Ti aspettiamo per regalarti un momento di relax 
            e bellezza in un ambiente professionale e accogliente.
          </p>
        </div>
      </div>
    </main>
  );
}