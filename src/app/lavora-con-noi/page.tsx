'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  MapPinIcon, 
  ClockIcon, 
  CurrencyEuroIcon,
  CheckIcon,
  StarIcon,
  HeartIcon,
  UserGroupIcon,
  TrophyIcon,
  AcademicCapIcon,
  SparklesIcon,
  ScissorsIcon,
  EnvelopeIcon,
  PhoneIcon
} from '@heroicons/react/24/outline';

export default function LavoraConNoi() {  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    experience: '',
    message: '',
    cv: null as File | null
  });


  const benefits = [
    {
      icon: CurrencyEuroIcon,
      title: 'Compenso Competitivo',
      description: 'Stipendi allineati al mercato con incentivi e possibilità di crescita economica'
    },
    {
      icon: AcademicCapIcon,
      title: 'Formazione Professionale',
      description: 'Corsi specialistici, workshop e aggiornamenti con i migliori maestri del settore'
    },
    {
      icon: UserGroupIcon,
      title: 'Team di Eccellenza',
      description: 'Lavora con professionisti appassionati in un ambiente collaborativo e stimolante'
    },
    {
      icon: TrophyIcon,
      title: 'Percorso di Carriera',
      description: 'Piani di crescita personalizzati e opportunità di leadership nel team'
    },
    {
      icon: HeartIcon,
      title: 'Equilibrio Vita-Lavoro',
      description: 'Orari rispettosi della vita privata e politiche di benessere aziendale'
    },
    {
      icon: SparklesIcon,
      title: 'Ambiente Premium',
      description: 'Strutture moderne, strumenti professionali e prodotti di alta qualità'
    }
  ];
  // Le foto del team verranno aggiunte manualmente
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData(prev => ({ ...prev, cv: file }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const submitFormData = new FormData();
      submitFormData.append('name', formData.name);
      submitFormData.append('email', formData.email);
      submitFormData.append('phone', formData.phone);
      submitFormData.append('experience', formData.experience);
      submitFormData.append('message', formData.message);
      
      if (formData.cv) {
        submitFormData.append('cv', formData.cv);
      }

      const response = await fetch('/api/careers', {
        method: 'POST',
        body: submitFormData,
      });

      const result = await response.json();

      if (response.ok) {
        alert('🎉 Candidatura inviata con successo! Ti contatteremo presto.');
        // Reset form
        setFormData({
          name: '',
          email: '',
          phone: '',
          experience: '',
          message: '',
          cv: null,
        });
        // Reset file input
        const fileInput = document.getElementById('cv') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
      } else {
        alert(`❌ Errore: ${result.error}`);
      }
    } catch (error) {
      console.error('Errore durante l\'invio:', error);
      alert('❌ Errore durante l\'invio. Riprova più tardi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const slideInLeft = {
    hidden: { opacity: 0, x: -50 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.8 } }
  };

  const slideInRight = {
    hidden: { opacity: 0, x: 50 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.8 } }
  };

  const scaleIn = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.6 } }
  };
  return (
    <div className="min-h-screen bg-black">{/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-black via-gray-900 to-gray-800 pt-20">
        <div className="absolute inset-0 bg-black/40"></div>
        {/* Qui potrai aggiungere la tua immagine hero personalizzata */}
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="text-center"
          >
            <motion.div
              variants={scaleIn}
              className="inline-flex items-center justify-center w-20 h-20 bg-amber-500/20 rounded-full mb-8"
            >
              <ScissorsIcon className="h-10 w-10 text-amber-400" />
            </motion.div>
            <motion.h1 
              variants={fadeInUp}
              className="text-5xl md:text-7xl font-bold text-white mb-6"
            >
              Lavora con <span className="text-amber-400">Noi</span>
            </motion.h1>
            <motion.p 
              variants={fadeInUp}
              className="text-xl md:text-2xl text-gray-200 mb-12 max-w-4xl mx-auto leading-relaxed"
            >
              Unisciti al team di <strong>Maskio Barber Concept</strong> e diventa parte di una nuova era del barbering. 
              Dove la tradizione incontra l'innovazione e la passione diventa professione.
            </motion.p>
            <motion.div
              variants={fadeInUp}
              className="flex flex-wrap justify-center gap-8 text-gray-300"
            >
              <div className="flex items-center gap-3 bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm">
                <MapPinIcon className="h-5 w-5 text-amber-400" />
                <span className="font-medium">San Giovanni Rotondo (FG)</span>
              </div>
              <div className="flex items-center gap-3 bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm">
                <UserGroupIcon className="h-5 w-5 text-amber-400" />
                <span className="font-medium">Team di Eccellenza</span>
              </div>
              <div className="flex items-center gap-3 bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm">
                <TrophyIcon className="h-5 w-5 text-amber-400" />
                <span className="font-medium">Crescita Garantita</span>
              </div>
            </motion.div>
          </motion.div>
        </div>      </section>

      
      {/* Why Choose Us */}
      <section className="py-20 bg-gradient-to-br from-gray-900 via-black to-gray-800">\
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={slideInLeft}
            >
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Perché Scegliere 
                <span className="text-amber-500"> Maskio</span>
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                Non è solo un lavoro, è una carriera in un ambiente che valorizza il talento, 
                promuove la crescita e celebra l'eccellenza del barbering moderno.
              </p>              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 flex items-center justify-center">
                <div className="text-white text-8xl">🪒</div>
                <div className="absolute inset-0 bg-black/20 flex items-end p-6">
                  <div className="text-white">
                    <h3 className="text-xl font-bold mb-1">Ambiente Professionale</h3>
                    <p className="text-amber-100">Qui potrai aggiungere una foto del team al lavoro</p>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={slideInRight}
              className="space-y-6"
            >
              {benefits.map((benefit, index) => {
                const Icon = benefit.icon;
                return (
                  <motion.div
                    key={index}
                    variants={fadeInUp}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-start gap-4 p-6 bg-gray-800 border border-gray-700 rounded-xl hover:bg-gray-700 transition-all duration-300 group"
                  >
                    <div className="flex-shrink-0 w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center group-hover:bg-amber-200 transition-colors">
                      <Icon className="h-6 w-6 text-amber-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-white mb-2">
                        {benefit.title}
                      </h3>                      <p className="text-gray-300 leading-relaxed">
                        {benefit.description}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        </div>
      </section>      {/* Application Form */}
      <section id="application-form" className="py-20 bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center mb-12"
          >
            <motion.h2 variants={fadeInUp} className="text-4xl md:text-5xl font-bold text-white mb-6">
              Inizia il Tuo Viaggio
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-xl text-gray-300">
              Compila il modulo e allega il tuo CV. Il tuo futuro in Maskio inizia qui!
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={scaleIn}
            className="bg-gray-800 border border-gray-700 rounded-3xl p-8 md:p-12 shadow-2xl"
          >
            <form onSubmit={handleSubmit} className="space-y-6">              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-semibold text-white mb-3">
                    Nome Completo *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-4 border border-gray-600 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-300 bg-gray-700 shadow-sm text-white placeholder-gray-400"
                    placeholder="Mario Rossi"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-white mb-3">
                    Email *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-4 border border-gray-600 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-300 bg-gray-700 shadow-sm text-white placeholder-gray-400"
                    placeholder="mario.rossi@email.com"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-semibold text-white mb-3">
                    Telefono *
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-4 border border-gray-600 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-300 bg-gray-700 shadow-sm text-white placeholder-gray-400"
                    placeholder="+39 123 456 7890"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="experience" className="block text-sm font-semibold text-white mb-3">
                  Esperienza Professionale
                </label>
                <input
                  type="text"
                  id="experience"
                  name="experience"
                  value={formData.experience}
                  onChange={handleInputChange}
                  className="w-full px-4 py-4 border border-gray-600 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-300 bg-gray-700 shadow-sm text-white placeholder-gray-400"
                  placeholder="Es. 3 anni nel settore barbering, specializzato in tagli classici"
                />
              </div>

              <div>
                <label htmlFor="cv" className="block text-sm font-semibold text-white mb-3">
                  Curriculum Vitae (PDF) *
                </label>
                <input
                  type="file"
                  id="cv"
                  name="cv"
                  onChange={handleFileChange}
                  accept=".pdf"
                  required
                  className="w-full px-4 py-4 border border-gray-600 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-amber-100 file:text-amber-700 hover:file:bg-amber-200 bg-gray-700 shadow-sm text-white"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-semibold text-white mb-3">
                  Lettera di Presentazione
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  rows={5}
                  className="w-full px-4 py-4 border border-gray-600 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-300 resize-none bg-gray-700 shadow-sm text-white placeholder-gray-400"
                  placeholder="Raccontaci di te, delle tue passioni e perché vorresti far parte del team Maskio..."
                ></textarea>
              </div>              <motion.button
                type="submit"
                disabled={isSubmitting}
                whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
                whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
                className={`w-full font-bold py-5 px-8 rounded-xl transition-all duration-300 text-lg shadow-xl hover:shadow-2xl ${
                  isSubmitting 
                    ? 'bg-gray-600 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white'
                }`}
              >
                {isSubmitting ? '🔄 Invio in corso...' : '🚀 Invia la Tua Candidatura'}
              </motion.button>
            </form>
          </motion.div>
        </div>
      </section>      {/* Contact & CTA */}
      <section className="py-20 bg-gradient-to-br from-gray-900 via-gray-800 to-amber-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/40"></div>
        {/* Qui potrai aggiungere la tua immagine di sfondo personalizzata */}
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <motion.h2 variants={fadeInUp} className="text-4xl md:text-5xl font-bold mb-6">
              Pronto per il Prossimo Passo?
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-xl text-gray-200 mb-12 max-w-3xl mx-auto">
              Il nostro team è sempre disponibile per rispondere alle tue domande e guidarti nel processo di candidatura.
            </motion.p>
            
            <motion.div 
              variants={fadeInUp} 
              className="grid md:grid-cols-3 gap-8 mb-12"
            >
              <div className="flex flex-col items-center gap-3 p-6 bg-white/10 rounded-xl backdrop-blur-sm">
                <div className="w-12 h-12 bg-amber-500 rounded-full flex items-center justify-center">
                  <MapPinIcon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">La Nostra Sede</h3>
                  <p className="text-gray-300">Via Sant'Agata 24, San Giovanni Rotondo (FG)</p>
                </div>
              </div>
              
              <div className="flex flex-col items-center gap-3 p-6 bg-white/10 rounded-xl backdrop-blur-sm">
                <div className="w-12 h-12 bg-amber-500 rounded-full flex items-center justify-center">
                  <EnvelopeIcon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Candidature</h3>
                  <p className="text-gray-300">fabio.cassano97@icloud.com</p>
                </div>
              </div>
              
              <div className="flex flex-col items-center gap-3 p-6 bg-white/10 rounded-xl backdrop-blur-sm">
                <div className="w-12 h-12 bg-amber-500 rounded-full flex items-center justify-center">
                  <PhoneIcon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Chiamaci</h3>
                  <p className="text-gray-300">+39 331 710 0730</p>
                </div>
              </div>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="button"
                onClick={() => document.getElementById('application-form')?.scrollIntoView({ behavior: 'smooth' })}
                className="bg-amber-500 hover:bg-amber-600 text-white font-bold py-4 px-8 rounded-xl transition-all duration-300 shadow-xl hover:shadow-2xl text-lg"
              >
                Candidati Subito
              </motion.button>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}