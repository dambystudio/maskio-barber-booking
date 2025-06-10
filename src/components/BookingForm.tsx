'use client';

import { useState, useEffect, FormEvent } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Service, Barber, BookingFormData } from '../types/booking';
import { BookingService, validateBookingData } from '../services/bookingService';
import { fabioSpecificServices, micheleSpecificServices, barbersFromData } from '../data/booking'; // Import specific services and local barbers data
import { Session } from 'next-auth';

const steps = ['Barbiere', 'Servizi', 'Data e Ora', 'Dati Personali', 'Conferma'];

interface BookingFormProps {
  userSession: Session;
}

export default function BookingForm({ userSession }: BookingFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [allServices, setAllServices] = useState<Service[]>([]); // All services from API
  const [displayedServices, setDisplayedServices] = useState<Service[]>([]); // Services to show based on barber
  const [barbers, setBarbers] = useState<Barber[]>([]);  const [formData, setFormData] = useState<BookingFormData>({
    selectedBarber: null,
    selectedServices: [],
    selectedDate: '',
    selectedTime: '',
    customerInfo: {
      name: userSession.user.name || '',
      email: userSession.user.email || '',
      phone: '', // Will be loaded from profile
      notes: ''
    }
  });
  const [availableSlots, setAvailableSlots] = useState<{time: string, available: boolean}[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bookingResponse, setBookingResponse] = useState<any>(null);
    // Add debouncing state and cache for rate limiting protection
  const [isDebouncing, setIsDebouncing] = useState(false);
  const [slotsCache, setSlotsCache] = useState<{[key: string]: {time: string, available: boolean}[]}>({});
    // Closure system state
  const [closedDays, setClosedDays] = useState<Set<number>>(new Set([0])); // Sunday closed by default
  const [closedDates, setClosedDates] = useState<Set<string>>(new Set()); // Specific closed dates

  // Load closure settings from localStorage
  useEffect(() => {
    const savedClosedDays = localStorage.getItem('maskio-closed-days');
    if (savedClosedDays) {
      try {
        const parsed = JSON.parse(savedClosedDays);
        setClosedDays(new Set(parsed));
      } catch (error) {
        console.error('Error parsing closed days from localStorage:', error);
      }
    }

    const savedClosedDates = localStorage.getItem('maskio-closed-dates');
    if (savedClosedDates) {
      try {
        const parsed = JSON.parse(savedClosedDates);
        setClosedDates(new Set(parsed));
      } catch (error) {
        console.error('Error parsing closed dates from localStorage:', error);
      }
    }  }, []);

  // Load user profile data
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await fetch('/api/user/profile');
        if (response.ok) {
          const data = await response.json();
          setFormData(prev => ({
            ...prev,
            customerInfo: {
              ...prev.customerInfo,
              name: data.profile.name || userSession.user.name || '',
              email: data.profile.email || userSession.user.email || '',
              phone: data.profile.phone || '',
            }
          }));
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    };

    if (userSession?.user?.id) {
      fetchUserProfile();
    }
  }, [userSession]);

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
          const updatedBarbers = barbersData.map((barber: any) => {
          // Find matching local barber data to get experience field
          const localBarberData = barbersFromData.find(local => local.id === barber.id || local.name === barber.name);
          
          return {
            ...barber,
            specialties: typeof barber.specialties === 'string' 
              ? JSON.parse(barber.specialties) 
              : barber.specialties || [],
            image: barber.image || '/placeholder-barber.jpg',
            // Add experience from local data
            experience: localBarberData?.experience,
            // Assign the hardcoded specific services for now, until API provides this
            // IMPORTANT: This uses barber.name for matching, ensure names are consistent.
            // Ideally, match by barber.id if the IDs from API match those in booking.ts
            availableServices: barber.name === 'Fabio' ? fabioSpecificServices : barber.name === 'Michele' ? micheleSpecificServices : servicesData
          };
        });
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
  }, [formData.selectedBarber, allServices]);  // Update available slots when date or barber changes with debouncing
  useEffect(() => {
    const fetchSlots = async () => {
      if (formData.selectedDate && formData.selectedBarber) {
        // Check cache first
        const cacheKey = `${formData.selectedDate}-${formData.selectedBarber.id}`;
        if (slotsCache[cacheKey]) {
          console.log('💾 Using cached slots for:', cacheKey);
          setAvailableSlots(slotsCache[cacheKey]);
          setLoading(false);
          return;
        }
        
        setIsDebouncing(true);
        setLoading(true);
        
        // Debounce API calls by 300ms to prevent rate limiting
        const timeoutId = setTimeout(async () => {
          console.log('⏱️ Fetching slots after debounce...');
          setIsDebouncing(false);
          
          try {
            if (formData.selectedBarber) { // Additional null check
              const slots = await BookingService.getAvailableSlots(formData.selectedDate, formData.selectedBarber.id);
              setAvailableSlots(slots);
              
              // Cache the results
              setSlotsCache(prev => ({
                ...prev,
                [cacheKey]: slots
              }));
            }
          } catch (err: any) {
            console.error('Error fetching slots:', err);
            setError('Errore nel caricamento degli orari disponibili');
            setAvailableSlots([]);
          } finally {
            setLoading(false);
          }
        }, 300);

        // Cleanup timeout on dependency change
        return () => {
          console.log('🧹 Cleaning up slots timeout');
          clearTimeout(timeoutId);
        };
      }
    };
    fetchSlots();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.selectedDate, formData.selectedBarber]);

  // Check if a date is closed (either weekly recurring closure or specific date closure)
  const isDateClosed = (dateString: string) => {
    try {
      // Parse the date string to get the day of week
      const [year, month, day] = dateString.split('-').map(Number);
      const date = new Date(Date.UTC(year, month - 1, day));
      const dayOfWeek = date.getUTCDay(); // 0 = Sunday, 1 = Monday, etc.
      
      // Check if this day of the week is closed
      if (closedDays.has(dayOfWeek)) {
        return true;
      }
      
      // Check if this specific date is closed
      if (closedDates.has(dateString)) {
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error checking if date is closed:', error);
      return false;
    }
  };

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
      const isToday = i === 0;
      
      // Calculate proper week boundaries based on today's date
      const todayDayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
      const daysUntilNextWeek = 7 - todayDayOfWeek; // Days until next Monday
      const isNextWeek = i >= daysUntilNextWeek && i < (daysUntilNextWeek + 7);
      const isNextMonth = i >= 30;
      
      // Fix timezone issue by manually formatting the date instead of using toISOString()
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const dateString = `${year}-${month}-${day}`;
      
      // Check if date is closed using the flexible closure system
      const isClosed = isDateClosed(dateString);
      
      dates.push({
        date: dateString,
        dayName: dayNames[date.getDay()],
        dayNumber: date.getDate(),
        monthName: monthNames[date.getMonth()],
        disabled: isClosed,
        isToday,
        isNextWeek,
        isNextMonth
      });}
    
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
    // Check if it's the special "altri-servizi" service
    if (service.id === 'altri-servizi') {
      // For "altri-servizi", show a message instead of allowing booking
      alert('Per questo servizio contatta direttamente Maskio al numero: +39 334 123 4567');
      return;
    }
    
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
    // Note: Slot fetching is now handled by useEffect with debouncing
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
        // Step 4 now only requires that customer info is available (pre-populated from session)
        // Notes are optional, so step 4 is always valid if we reach it
        return formData.customerInfo.name && formData.customerInfo.email;
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

  const stepLabels = ['Barbiere', 'Servizi', 'Data e Ora', 'Riepilogo'];  return (
    <div className="max-w-4xl mx-auto bg-black rounded-lg shadow-lg p-8 border border-gray-800">
      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-red-900/50 border-l-4 border-red-500 text-red-300"
        >
          <p className="font-medium">⚠️ {error}</p>
        </motion.div>
      )}

      {/* Loading Initial Data */}
      {barbers.length === 0 && !error && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400 mx-auto"></div>
          <p className="mt-4 text-gray-300">Caricamento barbieri e servizi...</p>
        </div>
      )}

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-900 p-6 rounded-lg border border-gray-700">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400 mx-auto"></div>
            <p className="mt-4 text-center text-white">Caricamento...</p>
          </div>        </div>
      )}

      {/* Main Content - Only show when data is loaded */}
      {barbers.length > 0 && (
        <>          {/* Progress Bar */}
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
                  : 'bg-gray-700 text-gray-400'
              }`}
            >
              {step < currentStep ? '✓' : step}
            </div>
          ))}
        </div>
        <div className="w-full bg-gray-800 rounded-full h-2">
          <div
            className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / 4) * 100}%` }}
          />
        </div>
        <div className="flex justify-between text-sm text-gray-400 mt-2">
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
        >          <motion.h2 variants={fadeInUp} className="text-2xl font-bold text-center mb-6 text-white">
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
                    ? 'border-yellow-400 bg-yellow-400/10'
                    : 'border-gray-700 hover:border-gray-600 bg-gray-900/50'
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
                    <h3 className="text-xl font-semibold text-white">{barber.name}</h3>
                    {barber.experience && (
                      <p className="text-gray-300">{barber.experience}</p>
                    )}
                    <div className="mt-2">
                      {barber.specialties.map((specialty, index) => (
                        <span
                          key={index}
                          className="inline-block bg-gray-800 text-gray-300 text-xs px-2 py-1 rounded mr-1 mb-1"
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
        >          <motion.h2 variants={fadeInUp} className="text-2xl font-bold text-center mb-6 text-white">
            Scegli i servizi di {formData.selectedBarber.name}
          </motion.h2>                  <div className="grid md:grid-cols-2 gap-4">
            {(formData.selectedBarber.availableServices || displayedServices).map((service: Service) => { // Use displayedServices as fallback, explicitly type service
              const isSelected = formData.selectedServices.some(s => s.id === service.id);
              const isSpecialService = service.id === 'altri-servizi';
              
              return (
                <motion.div
                  key={service.id}
                  variants={fadeInUp}
                  onClick={() => handleServiceToggle(service)}
                  className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                    isSpecialService
                    ? 'border-blue-400 bg-blue-400/10 cursor-pointer hover:bg-blue-400/20'
                    : isSelected
                    ? 'border-yellow-400 bg-yellow-400/10 cursor-pointer'
                    : 'border-gray-700 hover:border-gray-600 bg-gray-900/50 cursor-pointer'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold text-white">{service.name}</h3>
                      <p className="text-gray-300 text-sm">{service.description}</p>
                      {isSpecialService && (
                        <p className="text-blue-400 text-sm font-medium mt-1">
                          📞 Contattare Maskio
                        </p>
                      )}
                      <p className="text-gray-400 text-sm mt-1">{service.duration} min</p>                    </div>
                    <div className="text-right">
                      <span className="text-xl font-bold text-white">
                        {isSpecialService ? '-' : `€${service.price}`}
                      </span>
                    </div>
                  </div>
                  {isSelected && !isSpecialService && (
                    <div className="mt-2 text-green-400 text-sm">✓ Selezionato</div>
                  )}
                </motion.div>
              );
            })}
          </div>

          {formData.selectedServices.length > 0 && (
            <motion.div
              variants={fadeInUp}
              className="bg-gray-900 p-4 rounded-lg border border-gray-700"
            >
              <h3 className="font-semibold mb-2 text-white">Riepilogo servizi selezionati:</h3>
              <div className="space-y-2">
                {formData.selectedServices.map((service) => (
                  <div key={service.id} className="flex justify-between text-sm text-gray-300">
                    <span>{service.name}</span>
                    <span>€{service.price} - {service.duration} min</span>
                  </div>
                ))}
                <div className="border-t border-gray-700 pt-2 font-semibold flex justify-between text-white">
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
        >          <motion.h2 variants={fadeInUp} className="text-2xl font-bold text-center mb-6 text-white">
            Scegli data e orario
          </motion.h2>          <motion.div variants={fadeInUp} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-4">
                Seleziona la data
              </label>              {/* Date buttons */}
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 gap-3 max-h-96 overflow-y-auto scroll-smooth scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
                {generateDateButtons().map((dateButton) => (<motion.button
                    key={dateButton.date}
                    onClick={() => !dateButton.disabled && handleDateChange(dateButton.date)}
                    disabled={dateButton.disabled}
                    className={`p-3 rounded-lg border-2 transition-all duration-200 min-h-[80px] flex flex-col items-center justify-center relative ${
                      formData.selectedDate === dateButton.date                        ? 'border-yellow-400 bg-yellow-400 text-black shadow-lg'
                        : dateButton.disabled
                        ? 'border-gray-700 bg-gray-800 text-gray-500 cursor-not-allowed'
                        : dateButton.isToday
                        ? 'border-blue-400 bg-blue-900/30 hover:border-blue-500 hover:shadow-md text-blue-300'
                        : dateButton.isNextWeek
                        ? 'border-green-400 bg-green-900/30 hover:border-green-400 hover:shadow-md text-green-300'
                        : dateButton.isNextMonth
                        ? 'border-purple-400 bg-purple-900/30 hover:border-purple-400 hover:shadow-md text-purple-300'
                        : 'border-gray-600 hover:border-yellow-400 bg-gray-900/50 hover:shadow-md text-gray-300'
                    }`}
                    whileHover={!dateButton.disabled ? { scale: 1.05 } : {}}
                    whileTap={!dateButton.disabled ? { scale: 0.95 } : {}}
                  >
                    {dateButton.isToday && (
                      <div className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs px-1 rounded-full">
                        OGGI
                      </div>
                    )}                    <div className={`text-xs font-medium ${
                      formData.selectedDate === dateButton.date ? 'text-black' : 
                      dateButton.disabled ? 'text-gray-500' : 
                      dateButton.isToday ? 'text-blue-300' :
                      dateButton.isNextWeek ? 'text-green-300' :
                      dateButton.isNextMonth ? 'text-purple-300' :
                      'text-gray-300'
                    }`}>
                      {dateButton.dayName}
                    </div>
                    <div className={`text-lg font-bold ${
                      formData.selectedDate === dateButton.date ? 'text-black' : 
                      dateButton.disabled ? 'text-gray-500' : 
                      dateButton.isToday ? 'text-blue-300' :
                      dateButton.isNextWeek ? 'text-green-300' :
                      dateButton.isNextMonth ? 'text-purple-300' :
                      'text-gray-300'
                    }`}>
                      {dateButton.dayNumber}
                    </div>
                    <div className={`text-xs ${
                      formData.selectedDate === dateButton.date ? 'text-black' : 
                      dateButton.disabled ? 'text-gray-500' : 
                      dateButton.isToday ? 'text-blue-300' :
                      dateButton.isNextWeek ? 'text-green-300' :
                      dateButton.isNextMonth ? 'text-purple-300' :
                      'text-gray-300'
                    }`}>
                      {dateButton.monthName}
                    </div>
                    {dateButton.disabled && (
                      <div className="text-xs text-red-400 mt-1">Chiuso</div>
                    )}
                  </motion.button>
                ))}              </div>              {/* Legend for date colors */}
              <div className="mt-4 flex flex-wrap gap-4 text-xs text-gray-300">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-blue-900/30 border border-blue-400 rounded mr-2"></div>
                  <span>Oggi</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-900/30 border border-green-400 rounded mr-2"></div>
                  <span>Prossima settimana</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-purple-900/30 border border-purple-400 rounded mr-2"></div>
                  <span>Prossimo mese</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-gray-800 border border-gray-600 rounded mr-2"></div>
                  <span>Giorni di chiusura</span>
                </div>
              </div>
              
              {formData.selectedDate && (
                <div className="mt-4 p-3 bg-yellow-400/10 border border-yellow-400/30 rounded-lg">
                  <p className="text-yellow-300 font-medium">
                    📅 Data selezionata: {formatSelectedDate(formData.selectedDate)}
                  </p>
                </div>
              )}</div>            {/* Loading/Debouncing indicator */}
            {isDebouncing && formData.selectedDate && formData.selectedBarber && (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-yellow-500 mx-auto"></div>
                <p className="text-sm text-gray-300 mt-2">Caricamento orari...</p>
              </div>
            )}

            {formData.selectedDate && availableSlots.length > 0 && !isDebouncing && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
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
                          ? 'border-gray-600 hover:border-yellow-400 bg-gray-900/50 hover:shadow-sm text-gray-300'
                          : 'border-red-600 bg-red-900/50 text-red-400 cursor-not-allowed opacity-75'
                      }`}
                    >
                      <span className={!slot.available ? 'line-through' : ''}>{slot.time}</span>
                    </button>
                  ))}
                </div>                <div className="mt-2 text-sm text-gray-300">
                  <p className="font-semibold text-blue-400">🗓️ Esteso! Ora puoi prenotare fino a 2 mesi in anticipo</p>
                  <p>📅 Orari: 9:00-12:30 e 15:00-17:30 (Domenica chiuso)</p>                  <div className="flex flex-wrap gap-4 text-xs mt-2">
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-yellow-400 border border-yellow-500 rounded mr-2"></div>
                      <span>Selezionato</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-gray-900/50 border border-gray-600 rounded mr-2"></div>
                      <span>Disponibile</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-red-900/50 border border-red-600 rounded mr-2 relative">
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-red-400 text-xs font-bold">X</span>
                        </div>
                      </div>
                      <span className="text-red-400">Occupato</span>
                    </div>
                  </div>
                </div>
              </div>
            )}            {formData.selectedDate && availableSlots.length === 0 && !loading && !isDebouncing && (
              <div className="text-center py-8 text-gray-400">
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
        >          <motion.h2 variants={fadeInUp} className="text-2xl font-bold text-white mb-6">
            Riepilogo e Note Aggiuntive
          </motion.h2>

          {/* Booking Summary */}
          <motion.div variants={fadeInUp} className="bg-gradient-to-r from-gray-800 to-gray-900 p-6 rounded-lg border border-gray-700">
            <h3 className="text-xl font-semibold text-yellow-400 mb-4 flex items-center">
              📋 Resoconto della Prenotazione
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column - Service Details */}
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-300 mb-1">👨‍💼 Barbiere</h4>
                  <p className="text-white font-semibold">{formData.selectedBarber?.name}</p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-300 mb-1">✂️ Servizi Selezionati</h4>
                  <div className="space-y-2">
                    {formData.selectedServices.map((service, index) => (
                      <div key={service.id} className="flex justify-between items-center bg-gray-800/50 p-2 rounded">
                        <span className="text-white">{service.name}</span>
                        <span className="text-yellow-400 font-semibold">€{service.price}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column - Time & Price */}
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-300 mb-1">📅 Data e Ora</h4>
                  <p className="text-white font-semibold">
                    {formatSelectedDate(formData.selectedDate)} alle {formData.selectedTime}
                  </p>
                  <p className="text-gray-400 text-sm">⏱️ Durata totale: {totalDuration} minuti</p>
                </div>
                
                <div className="bg-yellow-400/10 border border-yellow-400/30 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-yellow-300 mb-1">💰 Totale</h4>
                  <p className="text-2xl font-bold text-yellow-400">€{totalPrice}</p>
                </div>
              </div>
            </div>

            {/* Customer Info Display (Read-only) */}
            <div className="mt-6 pt-4 border-t border-gray-600">
              <h4 className="text-sm font-medium text-gray-300 mb-3">👤 Informazioni Cliente</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="bg-gray-800/30 p-3 rounded">
                  <span className="text-gray-400">Nome:</span>
                  <p className="text-white font-medium">{formData.customerInfo.name}</p>
                </div>
                <div className="bg-gray-800/30 p-3 rounded">
                  <span className="text-gray-400">Email:</span>
                  <p className="text-white font-medium">{formData.customerInfo.email}</p>
                </div>
                <div className="bg-gray-800/30 p-3 rounded">
                  <span className="text-gray-400">Telefono:</span>
                  <p className="text-white font-medium">{formData.customerInfo.phone || 'Da aggiungere'}</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Benefits of your booking */}
          <motion.div variants={fadeInUp} className="bg-gradient-to-r from-yellow-900/20 to-amber-900/20 p-4 rounded-lg border border-yellow-600/30">
            <h4 className="text-yellow-300 font-semibold mb-3 flex items-center">
              ✨ Con la tua prenotazione riceverai:
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div className="flex items-center space-x-2">
                <span className="text-green-400">✓</span>
                <span className="text-gray-300">Conferma immediata via email</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-green-400">✓</span>
                <span className="text-gray-300">Promemoria 24h prima</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-green-400">✓</span>
                <span className="text-gray-300">Possibilità di modifica/cancellazione</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-green-400">✓</span>
                <span className="text-gray-300">Servizio professionale garantito</span>
              </div>
            </div>
          </motion.div>

          {/* Notes Section - Only editable field */}
          <motion.div variants={fadeInUp} className="space-y-4">
            <div>
              <label htmlFor="notes" className="block text-lg font-medium text-white mb-2">
                📝 Note Aggiuntive (Opzionale)
              </label>
              <p className="text-sm text-gray-400 mb-4">
                💡 <strong>Suggerimenti:</strong> Specifica allergie, preferenze di stile, richieste particolari o qualsiasi informazione utile per il barbiere.
              </p>
              <textarea
                name="notes"
                id="notes"
                value={formData.customerInfo.notes}
                onChange={handleCustomerInfoChange}
                rows={4}
                placeholder="Es. Preferisco un taglio più conservativo, allergia ai prodotti con profumo forte, taglio come la volta scorsa..."
                className="w-full px-4 py-3 border border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all duration-200 text-white placeholder-gray-400 bg-gray-800 resize-none"
              />
              <p className="text-xs text-gray-500 mt-2">
                Le note aiutano il barbiere a personalizzare il servizio secondo le tue esigenze
              </p>
            </div>
          </motion.div>
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
          </motion.h2>          <motion.div variants={fadeInUp} className="bg-gray-50 p-6 rounded-lg shadow text-left space-y-2">
            <p><strong>ID Prenotazione:</strong> {bookingResponse.id || bookingResponse.booking?.id}</p>
            <p><strong>Barbiere:</strong> {formData.selectedBarber?.name}</p>
            <p><strong>Servizi:</strong> {formData.selectedServices.map(s => s.name).join(', ')}</p>
            <p><strong>Data:</strong> {formatSelectedDate(formData.selectedDate)} alle {formData.selectedTime}</p>
            <p><strong>Cliente:</strong> {formData.customerInfo.name}</p>
            
            {/* Resoconto finale */}
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <h4 className="font-semibold text-green-800 mb-2">🎉 Resoconto della prenotazione</h4>
              <div className="text-sm text-green-700 space-y-1">
                <p>✅ <strong>Prenotazione confermata</strong> nel nostro sistema</p>
                <p>📧 <strong>Email di conferma inviata</strong> (se disponibile)</p>
                <p>📱 <strong>Promemoria automatico</strong> 24h prima dell'appuntamento</p>
                <p>🏪 <strong>Ti aspettiamo</strong> presso Maskio Barber</p>
                {formData.customerInfo.notes && (
                  <p>📝 <strong>Le tue note speciali</strong> sono state salvate per il barbiere</p>
                )}
                <p className="mt-2 font-medium">💡 <em>In caso di imprevisti, contattaci almeno 2 ore prima dell'appuntamento</em></p>
              </div>
            </div>
            
            <p className="mt-4 font-medium text-gray-700">Grazie per aver scelto Maskio Barber! 🙏</p>
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
