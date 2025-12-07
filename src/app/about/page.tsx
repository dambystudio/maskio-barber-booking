import { Metadata } from 'next';
import Image from 'next/image';

export const metadata: Metadata = {
  title: 'Chi Siamo | Maskio Barber Concept',
  description: 'Scopri la storia di Maskio Barber Concept, il nostro team di professionisti e la nostra passione per l\'arte del barbiere.',
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Chi Siamo
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto font-alien">
            La passione per l'arte del barbiere incontra l'innovazione moderna
          </p>
        </div>

        {/* Story Section */}
        <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
              La Nostra Storia
            </h2>
            <div className="space-y-4 text-gray-600 dark:text-gray-300">
              <p>
                Maskio Barber Concept nasce dalla passione per l'arte tradizionale del barbiere, 
                combinata con le tecniche più moderne e innovative del settore.
              </p>
              <p>
                Situati nel cuore di San Giovanni Rotondo, offriamo un'esperienza unica che 
                rispetta la tradizione mentre abbraccia l'innovazione.
              </p>
              <p>
                Il nostro team di professionisti esperti è dedicato a offrire servizi di 
                altissima qualità in un ambiente moderno e accogliente.
              </p>
            </div>
          </div>
          <div className="relative h-96 rounded-2xl overflow-hidden shadow-2xl">
            <Image
              src="/hero-barber.jpg"
              alt="Interno del barbiere"
              fill
              className="object-cover"
            />
          </div>
        </div>

        {/* Values Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
            I Nostri Valori
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg text-center">
              <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                Qualità
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Utilizziamo solo i migliori prodotti e le tecniche più avanzate per garantire risultati eccellenti.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg text-center">
              <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                Professionalità
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Il nostro team è formato da professionisti esperti e appassionati del loro mestiere.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg text-center">
              <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                Passione
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Ogni taglio è realizzato con passione e attenzione ai dettagli per soddisfare ogni cliente.
              </p>
            </div>
          </div>
        </div>

        {/* Team Section */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
            Il Nostro Team
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-8">
            Un team di professionisti dedicati a offrire il meglio dell'arte del barbiere, 
            sempre aggiornati sulle ultime tendenze e tecniche del settore.
          </p>
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg inline-block">
            <p className="text-amber-600 dark:text-amber-400 font-semibold text-lg">
              📍 Via Sant'Agata 24, San Giovanni Rotondo
            </p>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              Vieni a trovarci per un'esperienza unica di bellezza e benessere
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
