'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Service, Barber, BookingFormData } from '../types/booking';
import { barbers } from '../data/booking';
import { BookingService, validateBookingData } from '../services/bookingService';

export default function BookingForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
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

  // Handle barber selection
  const handleBarberSelection = (barber: Barber) => {
    setFormData(prev => ({ 
      ...prev, 
      selectedBarber: barber,
      selectedServices: [], // Reset services when changing barber
      selectedDate: '',
      selectedTime: ''
    }));
    setAvailableSlots([]);
    setError(null);
  };

  // Handle service selection (multiple services allowed)
  const handleServiceToggle = (service: Service) => {
    setFormData(prev => {
      const isSelected = prev.selectedServices.some(s => s.id === service.id);
      const newServices = isSelected
        ? prev.selectedServices.filter(s => s.id !== service.id)
        : [...prev.selectedServices, service];
      
      return { ...prev, selectedServices: newServices };
    });
  };

  // Handle date selection and generate time slots
  const handleDateChange = async (date: string) => {
    setFormData(prev => ({ ...prev, selectedDate: date, selectedTime: '' }));
    setError(null);
    
    if (date && formData.selectedBarber) {
      setLoading(true);
      try {
        const slots = await BookingService.getAvailableSlots(date, formData.selectedBarber.id);
        setAvailableSlots(slots);
      } catch (err: any) {
        setError('Errore nel caricamento degli orari disponibili');
        setAvailableSlots([]);
      } finally {
        setLoading(false);
      }
    }
  };

  // Calculate total duration and price
  const getTotalDuration = () => {
    return formData.selectedServices.reduce((total, service) => total + service.duration, 0);
  };

  const getTotalPrice = () => {
    return formData.selectedServices.reduce((total, service) => total + service.price, 0);
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!formData.selectedBarber || formData.selectedServices.length === 0) {
      setError('Seleziona barbiere e servizi');
      return;
    }

    const totalDuration = getTotalDuration();
    
    // Crea i dati della prenotazione
    const bookingData = {
      barberId: formData.selectedBarber.id,
      date: formData.selectedDate,
      time: formData.selectedTime,
      duration: totalDuration,
      customerInfo: {
        name: formData.customerInfo.name.trim(),
        email: formData.customerInfo.email.trim(),
        phone: formData.customerInfo.phone.trim()
      },
      services: formData.selectedServices
    };

    // Validazione
    const validationErrors = validateBookingData(bookingData);
    if (validationErrors.length > 0) {
      setError(validationErrors.join(', '));
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const newBooking = await BookingService.createBooking(bookingData);
      
      // Successo!
      alert(`✅ Prenotazione confermata!\n\n📅 Data: ${new Date(formData.selectedDate).toLocaleDateString('it-IT')}\n🕐 Ora: ${formData.selectedTime}\n👨‍💼 Barbiere: ${formData.selectedBarber.name}\n💰 Totale: €${getTotalPrice()}\n\n📧 Riceverai una conferma via email.`);
      
      // Reset del form
      setFormData({
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
      setCurrentStep(1);
      setAvailableSlots([]);
      
    } catch (err: any) {
      setError(err.message || 'Errore nella prenotazione. Riprova.');
    } finally {
      setLoading(false);
    }
  };

  // Check if current step is valid
  const isStepValid = (step: number) => {
    switch (step) {
      case 1:
        return formData.selectedBarber !== null;
      case 2:
        return formData.selectedServices.length > 0;
      case 3:
        return formData.selectedDate && formData.selectedTime;
      case 4:
        return formData.customerInfo.name && formData.customerInfo.email && formData.customerInfo.phone;
      default:
        return false;
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
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const stepLabels = ['Barbiere', 'Servizi', 'Data e Ora', 'Info Cliente'];

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-red-50 border-l-4 border-red-400 text-red-700"
        >
          <p className="font-medium">⚠️ {error}</p>
        </motion.div>
      )}

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400 mx-auto"></div>
            <p className="mt-4 text-center">Caricamento...</p>
          </div>
        </div>
      )}

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          {[1, 2, 3, 4].map((step) => (
            <div
              key={step}
              className={`flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 ${
                step < currentStep
                  ? 'bg-green-500 text-white'
                  : step === currentStep
                  ? 'bg-yellow-400 text-black'
                  : 'bg-gray-200 text-gray-500'
              }`}
            >
              {step < currentStep ? '✓' : step}
            </div>
          ))}
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / 4) * 100}%` }}
          />
        </div>
        <div className="flex justify-between text-sm text-gray-600 mt-2">
          {stepLabels.map((label, index) => (
            <span key={index} className={currentStep === index + 1 ? 'font-semibold text-yellow-600' : ''}>
              {label}
            </span>
          ))}
        </div>
      </div>

      {/* Step 1: Barber Selection */}
      {currentStep === 1 && (
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          <motion.h2 variants={fadeInUp} className="text-2xl font-bold text-center mb-6">
            Scegli il tuo barbiere
          </motion.h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            {barbers.map((barber) => (
              <motion.div
                key={barber.id}
                variants={fadeInUp}
                onClick={() => handleBarberSelection(barber)}
                className={`p-6 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                  formData.selectedBarber?.id === barber.id
                    ? 'border-yellow-400 bg-yellow-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center space-x-4">
                  <Image
                    src={barber.image}
                    alt={barber.name}
                    width={80}
                    height={80}
                    className="rounded-full object-cover"
                  />
                  <div>
                    <h3 className="text-xl font-semibold">{barber.name}</h3>
                    {barber.experience && (
                      <p className="text-gray-600">{barber.experience}</p>
                    )}
                    <div className="mt-2">
                      {barber.specialties.map((specialty, index) => (
                        <span
                          key={index}
                          className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded mr-1 mb-1"
                        >
                          {specialty}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Step 2: Service Selection */}
      {currentStep === 2 && formData.selectedBarber && (
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          <motion.h2 variants={fadeInUp} className="text-2xl font-bold text-center mb-6">
            Scegli i servizi di {formData.selectedBarber.name}
          </motion.h2>
          
          <div className="grid md:grid-cols-2 gap-4">
            {formData.selectedBarber.availableServices.map((service) => (
              <motion.div
                key={service.id}
                variants={fadeInUp}
                onClick={() => handleServiceToggle(service)}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                  formData.selectedServices.some(s => s.id === service.id)
                    ? 'border-yellow-400 bg-yellow-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold">{service.name}</h3>
                    <p className="text-gray-600 text-sm">{service.description}</p>
                    <p className="text-gray-500 text-sm mt-1">{service.duration} min</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xl font-bold">€{service.price}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {formData.selectedServices.length > 0 && (
            <motion.div
              variants={fadeInUp}
              className="bg-gray-50 p-4 rounded-lg"
            >
              <h3 className="font-semibold mb-2">Riepilogo servizi selezionati:</h3>
              <div className="space-y-2">
                {formData.selectedServices.map((service) => (
                  <div key={service.id} className="flex justify-between text-sm">
                    <span>{service.name}</span>
                    <span>€{service.price} - {service.duration} min</span>
                  </div>
                ))}
                <div className="border-t pt-2 font-semibold flex justify-between">
                  <span>Totale: €{getTotalPrice()} - {getTotalDuration()} min</span>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
      )}

      {/* Step 3: Date and Time Selection */}
      {currentStep === 3 && (
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          <motion.h2 variants={fadeInUp} className="text-2xl font-bold text-center mb-6">
            Scegli data e orario
          </motion.h2>

          <motion.div variants={fadeInUp} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Seleziona la data
              </label>
              <input
                type="date"
                value={formData.selectedDate}
                onChange={(e) => handleDateChange(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
            </div>

            {formData.selectedDate && availableSlots.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Orari disponibili
                </label>
                <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                  {availableSlots.map((slot) => (
                    <button
                      key={slot.time}
                      onClick={() => setFormData(prev => ({ ...prev, selectedTime: slot.time }))}
                      disabled={!slot.available}
                      className={`p-3 rounded-lg border transition-all duration-200 ${
                        formData.selectedTime === slot.time
                          ? 'border-yellow-400 bg-yellow-400 text-black'
                          : slot.available
                          ? 'border-gray-300 hover:border-yellow-400 bg-white'
                          : 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      {slot.time}
                    </button>
                  ))}
                </div>
                <div className="mt-2 text-sm text-gray-600">
                  <p>📅 Orari: 9:00-12:30 e 15:00-17:30 (Domenica chiuso)</p>
                  <p className="text-xs mt-1">❌ Gli slot occupati non sono selezionabili</p>
                </div>
              </div>
            )}

            {formData.selectedDate && availableSlots.length === 0 && !loading && (
              <div className="text-center py-8 text-gray-500">
                <p>❌ Spiacenti, la data selezionata non è disponibile.</p>
                <p className="text-sm">Siamo chiusi la domenica.</p>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}

      {/* Step 4: Customer Information */}
      {currentStep === 4 && (
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          <motion.h2 variants={fadeInUp} className="text-2xl font-bold text-center mb-6">
            I tuoi dati
          </motion.h2>

          <motion.div variants={fadeInUp} className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome *
              </label>
              <input
                type="text"
                value={formData.customerInfo.name}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  customerInfo: { ...prev.customerInfo, name: e.target.value }
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400"
                placeholder="Il tuo nome"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <input
                type="email"
                value={formData.customerInfo.email}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  customerInfo: { ...prev.customerInfo, email: e.target.value }
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400"
                placeholder="la.tua@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Telefono *
              </label>
              <input
                type="tel"
                value={formData.customerInfo.phone}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  customerInfo: { ...prev.customerInfo, phone: e.target.value }
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400"
                placeholder="+39 123 456 7890"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Note aggiuntive
              </label>
              <textarea
                value={formData.customerInfo.notes}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  customerInfo: { ...prev.customerInfo, notes: e.target.value }
                }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400"
                placeholder="Eventuali richieste speciali..."
              />
            </div>
          </motion.div>

          {/* Booking Summary */}
          <motion.div variants={fadeInUp} className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">📋 Riepilogo prenotazione</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>👨‍💼 Barbiere:</span>
                <span className="font-medium">{formData.selectedBarber?.name}</span>
              </div>
              <div className="flex justify-between items-start">
                <span>✂️ Servizi:</span>
                <div className="text-right">
                  {formData.selectedServices.map((service, index) => (
                    <div key={service.id}>
                      {service.name} - €{service.price}
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex justify-between">
                <span>📅 Data e ora:</span>
                <span className="font-medium">
                  {new Date(formData.selectedDate).toLocaleDateString('it-IT')} alle {formData.selectedTime}
                </span>
              </div>
              <div className="flex justify-between">
                <span>⏱️ Durata totale:</span>
                <span className="font-medium">{getTotalDuration()} minuti</span>
              </div>
              <div className="border-t pt-2 flex justify-between font-semibold text-lg">
                <span>💰 Totale:</span>
                <span>€{getTotalPrice()}</span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-8">
        <motion.button
          onClick={() => {
            setCurrentStep(Math.max(1, currentStep - 1));
            setError(null);
          }}
          disabled={currentStep === 1 || loading}
          className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
            currentStep === 1 || loading
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-gray-500 text-white hover:bg-gray-600'
          }`}
          whileHover={{ scale: currentStep > 1 && !loading ? 1.05 : 1 }}
          whileTap={{ scale: currentStep > 1 && !loading ? 0.95 : 1 }}
        >
          Indietro
        </motion.button>

        <motion.button
          onClick={() => {
            if (currentStep === 4) {
              handleSubmit();
            } else {
              setCurrentStep(currentStep + 1);
              setError(null);
            }
          }}
          disabled={!isStepValid(currentStep) || loading}
          className={`px-8 py-3 rounded-lg font-semibold transition-all duration-200 ${
            !isStepValid(currentStep) || loading
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-yellow-400 text-black hover:bg-yellow-300'
          }`}
          whileHover={{ scale: isStepValid(currentStep) && !loading ? 1.05 : 1 }}
          whileTap={{ scale: isStepValid(currentStep) && !loading ? 0.95 : 1 }}
        >
          {loading ? 'Caricamento...' : currentStep === 4 ? 'Conferma Prenotazione' : 'Continua'}
        </motion.button>
      </div>
    </div>
  );
}
