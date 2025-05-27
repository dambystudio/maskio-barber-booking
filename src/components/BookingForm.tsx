'use client';

import { useState, useEffect, FormEvent } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Service, Barber, BookingFormData } from '../types/booking';
import { BookingService, validateBookingData } from '../services/bookingService';
import { fabioSpecificServices, micheleSpecificServices } from '../data/booking'; // Import specific services

const steps = ['Barbiere', 'Servizi', 'Data e Ora', 'Dati Personali', 'Conferma'];

export default function BookingForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const [allServices, setAllServices] = useState<Service[]>([]); // All services from API
  const [displayedServices, setDisplayedServices] = useState<Service[]>([]); // Services to show based on barber
  const [barbers, setBarbers] = useState<Barber[]>([]);
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bookingResponse, setBookingResponse] = useState<any>(null);

  // Load services and barbers from API
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Load all services from API
        const servicesResponse = await fetch('/api/services');
        if (!servicesResponse.ok) throw new Error('Failed to fetch services');
        const servicesData = await servicesResponse.json();
        setAllServices(servicesData);
        // Initially, display all services or a subset if no barber is selected yet
        // This might need adjustment based on desired initial state
        setDisplayedServices(servicesData); 

        // Load barbers from API
        const barbersResponse = await fetch('/api/barbers');
        if (!barbersResponse.ok) throw new Error('Failed to fetch barbers');
        const barbersData = await barbersResponse.json();
        
        const updatedBarbers = barbersData.map((barber: any) => ({
          ...barber,
          specialties: typeof barber.specialties === 'string' 
            ? JSON.parse(barber.specialties) 
            : barber.specialties || [],
          image: barber.image || '/placeholder-barber.jpg',
          // Assign the hardcoded specific services for now, until API provides this
          // IMPORTANT: This uses barber.name for matching, ensure names are consistent.
          // Ideally, match by barber.id if the IDs from API match those in booking.ts
          availableServices: barber.name === 'Fabio' ? fabioSpecificServices : barber.name === 'Michele' ? micheleSpecificServices : servicesData
        }));
        setBarbers(updatedBarbers);

      } catch (err: any) {
        console.error("Failed to load initial data", err);
        setError(`Errore nel caricamento dei dati iniziali: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Update displayed services when a barber is selected
  useEffect(() => {
    if (formData.selectedBarber) {
      // Use the pre-assigned availableServices from the barber object
      setDisplayedServices(formData.selectedBarber.availableServices || allServices);
    } else {
      // If no barber is selected, show all services or a default set
      setDisplayedServices(allServices);
    }
    // Reset selected services when barber changes or displayed services list changes
    setFormData(prev => ({ ...prev, selectedServices: [] }));
  }, [formData.selectedBarber, allServices]);

  // Update available slots when date or barber changes
  useEffect(() => {
    const fetchSlots = async () => {
      if (formData.selectedDate && formData.selectedBarber) {
        setLoading(true);
        try {
          const slots = await BookingService.getAvailableSlots(formData.selectedDate, formData.selectedBarber.id);
          setAvailableSlots(slots);
        } catch (err: any) {
          setError('Errore nel caricamento degli orari disponibili');
          setAvailableSlots([]);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchSlots();
  }, [formData.selectedDate, formData.selectedBarber]);

  // Helper function to generate date buttons for the next 2 months (60 days)
  const generateDateButtons = () => {
    const dates = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time for accurate comparison
    
    for (let i = 0; i < 60; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      const dayNames = ['DOM', 'LUN', 'MAR', 'MER', 'GIO', 'VEN', 'SAB'];
      const monthNames = ['GEN', 'FEB', 'MAR', 'APR', 'MAG', 'GIU', 'LUG', 'AGO', 'SET', 'OTT', 'NOV', 'DIC'];
      
      // Domenica chiuso
      const isSunday = date.getDay() === 0;
      const isToday = i === 0;
      const isNextWeek = i >= 7 && i < 14;
      const isNextMonth = i >= 30;
      
      // Fix timezone issue by manually formatting the date instead of using toISOString()
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const dateString = `${year}-${month}-${day}`;
      
      dates.push({
        date: dateString,
        dayName: dayNames[date.getDay()],
        dayNumber: date.getDate(),
        monthName: monthNames[date.getMonth()],
        disabled: isSunday,
        isToday,
        isNextWeek,
        isNextMonth
      });    }
    
    return dates;
  };

  // Helper function to format selected date
  const formatSelectedDate = (dateString: string) => {
    if (!dateString) return '';
    
    // Fix timezone issue by manually parsing the date string
    const [year, month, day] = dateString.split('-').map(Number);
    // Create date object using UTC to avoid any timezone confusion
    const date = new Date(Date.UTC(year, month - 1, day)); // month is 0-indexed in JavaScript
    
    const dayNames = ['Domenica', 'Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato'];
    const monthNames = ['Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno', 'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'];
    
    // Use UTC methods to ensure consistency
    return `${dayNames[date.getUTCDay()]} ${date.getUTCDate()} ${monthNames[date.getUTCMonth()]}`;
  };

  // Handle barber selection
  const handleBarberChange = (barberId: string) => {
    const barber = barbers.find(b => b.id === barberId);
    setFormData(prev => ({
      ...prev,
      selectedBarber: barber || null,
      selectedTime: '' // Reset time as well
    }));
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

  // Handle time selection
  const handleTimeChange = (time: string) => {
    setFormData(prev => ({ ...prev, selectedTime: time }));
  };

  // Handle customer info change
  const handleCustomerInfoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      customerInfo: {
        ...prev.customerInfo,
        [name]: value
      }
    }));
  };

  // Calculate total duration and price
  const totalDuration = formData.selectedServices.reduce((total, service) => total + service.duration, 0);
  const totalPrice = formData.selectedServices.reduce((total, service) => total + service.price, 0);

  // Handle form submission
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!isStepValid(4)) return; // Ensure final step validation passes

    setLoading(true);
    setError(null);
    setBookingResponse(null);    try {      const bookingPayload = {
        barberId: formData.selectedBarber!.id,
        serviceIds: formData.selectedServices.map(s => s.id),
        services: formData.selectedServices, // Add the services array
        date: formData.selectedDate,
        time: formData.selectedTime,
        customerInfo: formData.customerInfo,
        totalPrice: totalPrice,
        duration: totalDuration, // Use totalDuration for the main duration property
        totalDuration: totalDuration // Keep this if it's used elsewhere, or remove if redundant
      };
      
      const response = await BookingService.createBooking(bookingPayload);
      setBookingResponse(response); // Store full response
      setCurrentStep(5); // Move to confirmation step
    } catch (err: any) {
      setError(err.message || 'Errore durante la creazione della prenotazione.');
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

  const nextStep = () => {
    if (isStepValid(currentStep)) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    setCurrentStep(Math.max(1, currentStep - 1));
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

      {/* Loading Initial Data */}
      {barbers.length === 0 && !error && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400 mx-auto"></div>
          <p className="mt-4 text-gray-600">Caricamento barbieri e servizi...</p>
        </div>
      )}

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400 mx-auto"></div>
            <p className="mt-4 text-center">Caricamento...</p>
          </div>        </div>
      )}

      {/* Main Content - Only show when data is loaded */}
      {barbers.length > 0 && (
        <>
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
                onClick={() => handleBarberChange(barber.id)}
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
            {(formData.selectedBarber.availableServices || displayedServices).map((service: Service) => { // Use displayedServices as fallback, explicitly type service
              const isSelected = formData.selectedServices.some(s => s.id === service.id);
              return (
                <motion.div
                  key={service.id}
                  variants={fadeInUp}
                  onClick={() => handleServiceToggle(service)}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                    isSelected
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
              );
            })}
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
                  <span>Totale: €{totalPrice} - {totalDuration} min</span>
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
          </motion.h2>          <motion.div variants={fadeInUp} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">
                Seleziona la data
              </label>              {/* Date buttons */}
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 gap-3 max-h-96 overflow-y-auto scroll-smooth scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                {generateDateButtons().map((dateButton) => (<motion.button
                    key={dateButton.date}
                    onClick={() => !dateButton.disabled && handleDateChange(dateButton.date)}
                    disabled={dateButton.disabled}
                    className={`p-3 rounded-lg border-2 transition-all duration-200 min-h-[80px] flex flex-col items-center justify-center relative ${
                      formData.selectedDate === dateButton.date
                        ? 'border-yellow-400 bg-yellow-400 text-black shadow-lg'
                        : dateButton.disabled
                        ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                        : dateButton.isToday
                        ? 'border-blue-400 bg-blue-50 hover:border-blue-500 hover:shadow-md'
                        : dateButton.isNextWeek
                        ? 'border-green-300 bg-green-50 hover:border-green-400 hover:shadow-md'
                        : dateButton.isNextMonth
                        ? 'border-purple-300 bg-purple-50 hover:border-purple-400 hover:shadow-md'
                        : 'border-gray-300 hover:border-yellow-400 bg-white hover:shadow-md'
                    }`}
                    whileHover={!dateButton.disabled ? { scale: 1.05 } : {}}
                    whileTap={!dateButton.disabled ? { scale: 0.95 } : {}}
                  >
                    {dateButton.isToday && (
                      <div className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs px-1 rounded-full">
                        OGGI
                      </div>
                    )}
                    <div className={`text-xs font-medium ${
                      formData.selectedDate === dateButton.date ? 'text-black' : 
                      dateButton.disabled ? 'text-gray-400' : 
                      dateButton.isToday ? 'text-blue-600' :
                      dateButton.isNextWeek ? 'text-green-600' :
                      dateButton.isNextMonth ? 'text-purple-600' :
                      'text-gray-600'
                    }`}>
                      {dateButton.dayName}
                    </div>
                    <div className={`text-lg font-bold ${
                      formData.selectedDate === dateButton.date ? 'text-black' : 
                      dateButton.disabled ? 'text-gray-400' : 
                      dateButton.isToday ? 'text-blue-700' :
                      dateButton.isNextWeek ? 'text-green-700' :
                      dateButton.isNextMonth ? 'text-purple-700' :
                      'text-gray-900'
                    }`}>
                      {dateButton.dayNumber}
                    </div>
                    <div className={`text-xs ${
                      formData.selectedDate === dateButton.date ? 'text-black' : 
                      dateButton.disabled ? 'text-gray-400' : 
                      dateButton.isToday ? 'text-blue-500' :
                      dateButton.isNextWeek ? 'text-green-500' :
                      dateButton.isNextMonth ? 'text-purple-500' :
                      'text-gray-500'
                    }`}>
                      {dateButton.monthName}
                    </div>
                    {dateButton.disabled && (
                      <div className="text-xs text-red-400 mt-1">Chiuso</div>
                    )}
                  </motion.button>
                ))}              </div>
              
              {/* Legend for date colors */}
              <div className="mt-4 flex flex-wrap gap-4 text-xs">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-blue-200 border border-blue-400 rounded mr-2"></div>
                  <span>Oggi</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-200 border border-green-400 rounded mr-2"></div>
                  <span>Prossima settimana</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-purple-200 border border-purple-400 rounded mr-2"></div>
                  <span>Prossimo mese</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-gray-200 border border-gray-400 rounded mr-2"></div>
                  <span>Domenica (chiuso)</span>
                </div>
              </div>
              
              {formData.selectedDate && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-yellow-800 font-medium">
                    📅 Data selezionata: {formatSelectedDate(formData.selectedDate)}
                  </p>
                </div>
              )}
            </div>

            {formData.selectedDate && availableSlots.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Orari disponibili
                </label>
                <div className="grid grid-cols-3 md:grid-cols-4 gap-3">                  {availableSlots.map((slot) => (
                    <button
                      key={slot.time}
                      onClick={() => slot.available && setFormData(prev => ({ ...prev, selectedTime: slot.time }))}
                      disabled={!slot.available}
                      className={`p-3 rounded-lg border transition-all duration-200 ${
                        formData.selectedTime === slot.time
                          ? 'border-yellow-400 bg-yellow-400 text-black shadow-md'
                          : slot.available
                          ? 'border-gray-300 hover:border-yellow-400 bg-white hover:shadow-sm'
                          : 'border-red-200 bg-red-100 text-red-400 cursor-not-allowed opacity-75'
                      }`}
                    >
                      <span className={!slot.available ? 'line-through' : ''}>{slot.time}</span>
                    </button>
                  ))}
                </div>                <div className="mt-2 text-sm text-gray-600">
                  <p className="font-semibold text-blue-600">🗓️ Esteso! Ora puoi prenotare fino a 2 mesi in anticipo</p>
                  <p>📅 Orari: 9:00-12:30 e 15:00-17:30 (Domenica chiuso)</p>                  <div className="flex flex-wrap gap-4 text-xs mt-2">
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-yellow-400 border border-yellow-500 rounded mr-2"></div>
                      <span>Selezionato</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-white border border-gray-300 rounded mr-2"></div>
                      <span>Disponibile</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-red-100 border border-red-200 rounded mr-2 relative">
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-red-500 text-xs font-bold">X</span>
                        </div>
                      </div>
                      <span className="text-red-500">Occupato</span>
                    </div>
                  </div>
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

      {/* Step 4: Customer Info & Summary */}
      {currentStep === 4 && (
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          <motion.h2 variants={fadeInUp} className="text-2xl font-bold text-center mb-6 text-gray-800">
            Dati Personali e Riepilogo
          </motion.h2>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Customer Info Input Fields */}
            <motion.div variants={fadeInUp} className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
              <h3 className="text-xl font-semibold mb-6 text-gray-800 flex items-center">
                <svg className="w-6 h-6 mr-2 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                I tuoi dati
              </h3>
              
              <div className="space-y-5">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Nome Completo *
                  </label>
                  <input
                    type="text"
                    name="name"
                    id="name"
                    value={formData.customerInfo.name}
                    onChange={handleCustomerInfoChange}
                    required
                    placeholder="Es. Mario Rossi"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all duration-200 text-gray-900 placeholder-gray-400"
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    value={formData.customerInfo.email}
                    onChange={handleCustomerInfoChange}
                    required
                    placeholder="mario.rossi@email.com"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all duration-200 text-gray-900 placeholder-gray-400"
                  />
                </div>
                
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                    Telefono *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    id="phone"
                    value={formData.customerInfo.phone}
                    onChange={handleCustomerInfoChange}
                    required
                    placeholder="+39 123 456 7890"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all duration-200 text-gray-900 placeholder-gray-400"
                  />
                </div>
                
                <div>
                  <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                    Note aggiuntive (opzionale)
                  </label>
                  <textarea
                    name="notes"
                    id="notes"
                    value={formData.customerInfo.notes}
                    onChange={handleCustomerInfoChange}
                    rows={3}
                    placeholder="Eventuali richieste speciali o note..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all duration-200 text-gray-900 placeholder-gray-400 resize-none"
                  ></textarea>
                </div>
              </div>
            </motion.div>

            {/* Booking Summary */}
            <motion.div variants={fadeInUp} className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-6 rounded-xl shadow-lg border border-yellow-200">
              <h3 className="text-xl font-semibold mb-6 text-gray-800 flex items-center">
                <svg className="w-6 h-6 mr-2 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Riepilogo Prenotazione
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center p-3 bg-white rounded-lg shadow-sm">
                  <svg className="w-5 h-5 mr-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <div>
                    <p className="text-sm text-gray-600">Barbiere</p>
                    <p className="font-semibold text-gray-800">{formData.selectedBarber?.name}</p>
                  </div>
                </div>

                <div className="p-3 bg-white rounded-lg shadow-sm">
                  <div className="flex items-center mb-2">
                    <svg className="w-5 h-5 mr-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h8" />
                    </svg>
                    <p className="text-sm text-gray-600">Servizi</p>
                  </div>
                  <ul className="space-y-1 ml-8">
                    {formData.selectedServices.map(s => (
                      <li key={s.id} className="text-sm text-gray-800 flex justify-between">
                        <span>{s.name}</span>
                        <span className="font-medium">€{s.price}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex items-center p-3 bg-white rounded-lg shadow-sm">
                  <svg className="w-5 h-5 mr-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <div>
                    <p className="text-sm text-gray-600">Data e Ora</p>
                    <p className="font-semibold text-gray-800">{formatSelectedDate(formData.selectedDate)} alle {formData.selectedTime}</p>
                  </div>
                </div>

                <div className="border-t pt-4 mt-4">
                  <div className="flex justify-between items-center p-3 bg-yellow-200 rounded-lg">
                    <div className="flex items-center">
                      <svg className="w-5 h-5 mr-3 text-yellow-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="font-semibold text-yellow-800">Durata Totale</span>
                    </div>
                    <span className="font-bold text-yellow-800">{totalDuration} min</span>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-green-200 rounded-lg mt-2">
                    <div className="flex items-center">
                      <svg className="w-5 h-5 mr-3 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                      <span className="font-semibold text-green-800">Prezzo Totale</span>
                    </div>
                    <span className="font-bold text-green-800 text-lg">€{totalPrice}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}

      {/* Step 5: Confirmation / Success Message */}
      {currentStep === 5 && bookingResponse && (
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="text-center space-y-6"
        >
          <motion.div variants={fadeInUp}>
            <svg className="w-16 h-16 mx-auto text-green-500" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          </motion.div>
          <motion.h2 variants={fadeInUp} className="text-3xl font-bold text-green-600">
            Prenotazione Confermata!
          </motion.h2>
          <motion.div variants={fadeInUp} className="bg-gray-50 p-6 rounded-lg shadow text-left space-y-2">
            <p><strong>ID Prenotazione:</strong> {bookingResponse.id || bookingResponse.booking?.id}</p>
            <p><strong>Barbiere:</strong> {formData.selectedBarber?.name}</p>
            <p><strong>Servizi:</strong> {formData.selectedServices.map(s => s.name).join(', ')}</p>
            <p><strong>Data:</strong> {formatSelectedDate(formData.selectedDate)} alle {formData.selectedTime}</p>
            <p><strong>Cliente:</strong> {formData.customerInfo.name}</p>
            <p>Grazie per aver prenotato con Maskio Barber!</p>
          </motion.div>

          <motion.div variants={fadeInUp} className="mt-8 text-center">
            <button
              onClick={() => {
                setCurrentStep(1);
                setFormData({
                  selectedBarber: null,
                  selectedServices: [],
                  selectedDate: '',
                  selectedTime: '',
                  customerInfo: { name: '', email: '', phone: '', notes: '' }
                });
                setBookingResponse(null);
                setAvailableSlots([]);
                setError(null);
              }}
              className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-3 px-8 rounded-lg shadow-md transition-colors duration-300"
            >
              Effettua Nuova Prenotazione
            </button>
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
          onClick={(event) => { // Add event parameter here
            if (currentStep === 4) {
              handleSubmit(event); // Pass event to handleSubmit
            } else {
              // For other steps, nextStep() already handles validation and setError(null)
              nextStep(); 
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
        >          {loading ? 'Caricamento...' : currentStep === 4 ? 'Conferma Prenotazione' : 'Continua'}
        </motion.button>
      </div>
        </>
      )}
    </div>
  );
}
