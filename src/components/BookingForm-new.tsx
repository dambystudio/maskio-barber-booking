'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Service, Barber, BookingFormData } from '../types/booking';
import { services, barbers, generateTimeSlots, isDateAvailable } from '../data/booking';

export default function BookingForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<BookingFormData>({
    selectedBarber: null,
    selectedServices: [],
    selectedDate: '',
    selectedTime: '',
    customerInfo: {
      name: '',
      email: '',
      phone: '',
      notes: ''
    }
  });

  const [availableSlots, setAvailableSlots] = useState<{time: string, available: boolean}[]>([]);

  // Handle date selection and generate time slots
  const handleDateChange = (date: string) => {
    setFormData(prev => ({ ...prev, selectedDate: date, selectedTime: '' }));
    
    if (date) {
      const selectedDate = new Date(date);
      const slots = generateTimeSlots(selectedDate);
      setAvailableSlots(slots);
    }
  };

  // Handle form submission
  const handleSubmit = () => {
    // Here you would typically send the data to your backend
    alert('Prenotazione effettuata con successo! Ti contatteremo presto per confermare.');
    console.log('Booking data:', formData);
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

  const stepVariants = {
    hidden: { opacity: 0, x: 50 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.5 } },
    exit: { opacity: 0, x: -50, transition: { duration: 0.3 } }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
      {/* Progress Bar */}
      <div className="bg-gray-50 px-8 py-6">
        <div className="flex items-center justify-between">
          {[1, 2, 3, 4].map((step) => (
            <div key={step} className="flex items-center">
              <motion.div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                  currentStep >= step ? 'bg-yellow-400 text-black' : 'bg-gray-300 text-gray-500'
                }`}
                animate={{
                  scale: currentStep === step ? 1.1 : 1,
                  backgroundColor: currentStep >= step ? '#FCD34D' : '#D1D5DB'
                }}
                transition={{ duration: 0.3 }}
              >
                {step}
              </motion.div>
              {step < 4 && (
                <div className={`w-16 h-1 mx-2 ${currentStep > step ? 'bg-yellow-400' : 'bg-gray-300'}`} />
              )}
            </div>
          ))}
        </div>
        <div className="mt-4 text-center">
          <h3 className="text-lg font-semibold text-gray-900">
            {currentStep === 1 && 'Seleziona il Servizio'}
            {currentStep === 2 && 'Scegli il Barbiere'}
            {currentStep === 3 && 'Data e Orario'}
            {currentStep === 4 && 'I Tuoi Dati'}
          </h3>
        </div>
      </div>

      <div className="p-8">
        {/* Step 1: Service Selection */}
        {currentStep === 1 && (
          <motion.div
            variants={stepVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              {services.map((service) => (
                <motion.div
                  key={service.id}
                  variants={fadeInUp}
                  className={`p-6 rounded-xl border-2 cursor-pointer transition-all duration-300 ${
                    formData.selectedService?.id === service.id
                      ? 'border-yellow-400 bg-yellow-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setFormData(prev => ({ ...prev, selectedService: service }))}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-xl font-bold text-gray-900">{service.name}</h3>
                    <span className="text-2xl font-bold text-yellow-600">€{service.price}</span>
                  </div>
                  <p className="text-gray-600 mb-3">{service.description}</p>
                  <div className="flex items-center text-sm text-gray-500">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {service.duration} minuti
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        )}

        {/* Step 2: Barber Selection */}
        {currentStep === 2 && (
          <motion.div
            variants={stepVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 md:grid-cols-2 gap-8"
            >
              {barbers.map((barber) => (
                <motion.div
                  key={barber.id}
                  variants={fadeInUp}
                  className={`p-6 rounded-xl border-2 cursor-pointer transition-all duration-300 ${
                    formData.selectedBarber?.id === barber.id
                      ? 'border-yellow-400 bg-yellow-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setFormData(prev => ({ ...prev, selectedBarber: barber }))}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center mb-4">
                    <div className="relative w-16 h-16 rounded-full overflow-hidden mr-4">
                      <Image
                        src={barber.image}
                        alt={barber.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{barber.name}</h3>
                      <p className="text-gray-600">Barbiere Professionista</p>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Specialità:</h4>
                    <div className="flex flex-wrap gap-2">
                      {barber.specialties.map((specialty, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                        >
                          {specialty}
                        </span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        )}

        {/* Step 3: Date and Time Selection */}
        {currentStep === 3 && (
          <motion.div
            variants={stepVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="grid grid-cols-1 lg:grid-cols-2 gap-8"
          >
            {/* Date Selection */}
            <motion.div variants={fadeInUp}>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Seleziona la Data</h3>
              <input
                type="date"
                value={formData.selectedDate}
                onChange={(e) => handleDateChange(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
              />
            </motion.div>

            {/* Time Selection */}
            <motion.div variants={fadeInUp}>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Seleziona l'Orario</h3>
              {formData.selectedDate ? (
                <div className="grid grid-cols-3 gap-3 max-h-64 overflow-y-auto">
                  {availableSlots.map((slot) => (
                    <motion.button
                      key={slot.time}
                      onClick={() => setFormData(prev => ({ ...prev, selectedTime: slot.time }))}
                      disabled={!slot.available}
                      className={`p-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                        formData.selectedTime === slot.time
                          ? 'bg-yellow-400 text-black'
                          : slot.available
                          ? 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                          : 'bg-gray-50 text-gray-400 cursor-not-allowed'
                      }`}
                      whileHover={slot.available ? { scale: 1.05 } : {}}
                      whileTap={slot.available ? { scale: 0.95 } : {}}
                    >
                      {slot.time}
                    </motion.button>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">
                  Seleziona prima una data per vedere gli orari disponibili
                </p>
              )}
            </motion.div>
          </motion.div>
        )}

        {/* Step 4: Customer Information */}
        {currentStep === 4 && (
          <motion.div
            variants={stepVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              className="space-y-6"
            >
              <motion.div variants={fadeInUp} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome Completo *
                  </label>
                  <input
                    type="text"
                    value={formData.customerInfo.name}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      customerInfo: { ...prev.customerInfo, name: e.target.value }
                    }))}
                    className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                    placeholder="Il tuo nome completo"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={formData.customerInfo.email}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      customerInfo: { ...prev.customerInfo, email: e.target.value }
                    }))}
                    className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                    placeholder="la-tua-email@example.com"
                  />
                </div>
              </motion.div>

              <motion.div variants={fadeInUp}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Telefono *
                </label>
                <input
                  type="tel"
                  value={formData.customerInfo.phone}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    customerInfo: { ...prev.customerInfo, phone: e.target.value }
                  }))}
                  className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                  placeholder="+39 123 456 7890"
                />
              </motion.div>

              <motion.div variants={fadeInUp}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Note Aggiuntive
                </label>
                <textarea
                  value={formData.customerInfo.notes}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    customerInfo: { ...prev.customerInfo, notes: e.target.value }
                  }))}
                  rows={4}
                  className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                  placeholder="Eventuali richieste particolari o note per il barbiere..."
                />
              </motion.div>

              {/* Booking Summary */}
              <motion.div variants={fadeInUp} className="bg-gray-50 p-6 rounded-xl">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Riepilogo Prenotazione</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Servizio:</span>
                    <span className="font-semibold">{formData.selectedService?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Barbiere:</span>
                    <span className="font-semibold">{formData.selectedBarber?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Data:</span>
                    <span className="font-semibold">
                      {new Date(formData.selectedDate).toLocaleDateString('it-IT')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Orario:</span>
                    <span className="font-semibold">{formData.selectedTime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Durata:</span>
                    <span className="font-semibold">{formData.selectedService?.duration} min</span>
                  </div>
                  <hr className="my-3" />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Totale:</span>
                    <span>€{formData.selectedService?.price}</span>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
          <motion.button
            onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
            disabled={currentStep === 1}
            className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
              currentStep === 1
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
            }`}
            whileHover={currentStep > 1 ? { scale: 1.05 } : {}}
            whileTap={currentStep > 1 ? { scale: 0.95 } : {}}
          >
            Indietro
          </motion.button>

          <motion.button
            onClick={() => {
              if (currentStep === 4) {
                handleSubmit();
              } else {
                setCurrentStep(prev => prev + 1);
              }
            }}
            disabled={
              (currentStep === 1 && !formData.selectedService) ||
              (currentStep === 2 && !formData.selectedBarber) ||
              (currentStep === 3 && (!formData.selectedDate || !formData.selectedTime)) ||
              (currentStep === 4 && (!formData.customerInfo.name || !formData.customerInfo.email || !formData.customerInfo.phone))
            }
            className={`px-8 py-3 rounded-lg font-semibold transition-all duration-200 ${
              (currentStep === 1 && !formData.selectedService) ||
              (currentStep === 2 && !formData.selectedBarber) ||
              (currentStep === 3 && (!formData.selectedDate || !formData.selectedTime)) ||
              (currentStep === 4 && (!formData.customerInfo.name || !formData.customerInfo.email || !formData.customerInfo.phone))
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-yellow-400 text-black hover:bg-yellow-300'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {currentStep === 4 ? 'Conferma Prenotazione' : 'Continua'}
          </motion.button>
        </div>
      </div>
    </div>
  );
}
