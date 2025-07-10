'use client';

import { useState, useEffect, FormEvent } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Service, Barber, BookingFormData } from '../types/booking';
import { BookingService, validateBookingData } from '../services/bookingService';
import { fabioSpecificServices, micheleSpecificServices, barbersFromData } from '../data/booking'; // Import specific services and local barbers data
import { Session } from 'next-auth';
import { trackEvent, trackConversion } from './GoogleAnalytics';

const steps = ['Barbiere', 'Servizi', 'Data e Ora', 'Dati Personali', 'Conferma'];

interface BookingFormProps {
  userSession: Session;
}

export default function BookingForm({ userSession }: BookingFormProps) {
  const [currentStep, setCurrentStep] = useState(1);  const [allServices, setAllServices] = useState<Service[]>([]); // All services from API
  const [displayedServices, setDisplayedServices] = useState<Service[]>([]); // Services to show based on barber
  const [barbers, setBarbers] = useState<Barber[]>([]);  
  
  // Distinguish between actual barbers and those who can make bookings for others
  const isBarber = userSession?.user?.role === 'barber';
  const isAdmin = userSession?.user?.role === 'admin';
  const canMakeBookingsForOthers = isBarber || isAdmin;
  
  // Debug logging - DA RIMUOVERE DOPO IL TEST
  console.log('🔍 BookingForm Debug:');
  console.log('  userSession:', userSession);
  console.log('  userSession.user:', userSession?.user);
  console.log('  userSession.user.role:', userSession?.user?.role);
  console.log('  isBarber:', isBarber);
  console.log('  isAdmin:', isAdmin);
  console.log('  canMakeBookingsForOthers:', canMakeBookingsForOthers);

  const [formData, setFormData] = useState<BookingFormData>({
    selectedBarber: null,
    selectedService: null, // MODIFICATO: da selectedServices a selectedService (singolo)
    selectedDate: '',
    selectedTime: '',
    customerInfo: {
      // If user can make bookings for others, start with empty fields for manual input
      name: canMakeBookingsForOthers ? '' : (userSession.user.name || ''),
      email: canMakeBookingsForOthers ? '' : (userSession.user.email || ''),
      phone: '', // Will be loaded from profile or left empty for manual input
      notes: ''
    }
  });
  const [availableSlots, setAvailableSlots] = useState<{time: string, available: boolean}[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);  const [bookingResponse, setBookingResponse] = useState<any>(null);
  
  // Add debouncing state and cache for rate limiting protection
  const [isDebouncing, setIsDebouncing] = useState(false);
  const [slotsCache, setSlotsCache] = useState<{[key: string]: {time: string, available: boolean}[]}>({});// Closure system state
  const [closedDays, setClosedDays] = useState<Set<number>>(new Set([0])); // Sunday closed by default
  const [closedDates, setClosedDates] = useState<Set<string>>(new Set()); // Specific closed dates
  const [barberClosedDays, setBarberClosedDays] = useState<Set<number>>(new Set()); // Barber-specific recurring closures
  // Add state for tracking days with no available slots
  const [unavailableDates, setUnavailableDates] = useState<Set<string>>(new Set());
  // Load closure settings from localStorage and server
  useEffect(() => {
    // Prima carica dal localStorage per un'esperienza più veloce
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
    }

    // Poi carica dal server per avere i dati più aggiornati
    fetchClosureSettingsFromServer();
  }, []);  // Funzione per caricare le impostazioni di chiusura dal server
  const fetchClosureSettingsFromServer = async () => {
    try {
      console.log('🔄 Fetching closure settings from server...');
      const response = await fetch('/api/closure-settings');
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const text = await response.text();
      console.log('📄 Raw response from closure-settings API:', text);
      
      if (!text || text.trim() === '') {
        throw new Error('Empty response from server');
      }
      
      let settings;
      try {
        settings = JSON.parse(text);
      } catch (parseError) {
        console.error('❌ JSON parse error:', parseError);
        console.error('🔍 Response text was:', JSON.stringify(text));
        throw new Error('Invalid JSON response from server');
      }
      
      // Validazione e valori di default per evitare errori JSON
      const closedDays = Array.isArray(settings.closedDays) ? settings.closedDays : [0]; // Default: domenica chiusa
      const closedDates = Array.isArray(settings.closedDates) ? settings.closedDates : [];
      
      setClosedDays(new Set(closedDays));
      setClosedDates(new Set(closedDates));
      
      // Aggiorna anche il localStorage con i dati del server
      localStorage.setItem('maskio-closed-days', JSON.stringify(closedDays));
      localStorage.setItem('maskio-closed-dates', JSON.stringify(closedDates));
      
      console.log('✅ Closure settings loaded from server in BookingForm:', { closedDays, closedDates });
      
    } catch (error) {
      console.error('❌ Error loading closure settings from server:', error);
      console.warn('📦 Using localStorage closure settings as fallback');
      
      // Fallback al localStorage
      try {
        const savedClosedDays = localStorage.getItem('maskio-closed-days');
        const savedClosedDates = localStorage.getItem('maskio-closed-dates');
        
        if (savedClosedDays && savedClosedDates) {
          const fallbackClosedDays = JSON.parse(savedClosedDays);
          const fallbackClosedDates = JSON.parse(savedClosedDates);
          
          setClosedDays(new Set(fallbackClosedDays));
          setClosedDates(new Set(fallbackClosedDates));
          
          console.log('📦 Loaded closure settings from localStorage:', { 
            closedDays: fallbackClosedDays, 
            closedDates: fallbackClosedDates 
          });
        } else {
          // Valori di default assoluti
          setClosedDays(new Set([0])); // Domenica chiusa
          setClosedDates(new Set([]));
          console.log('🔧 Using absolute default closure settings');
        }
      } catch (fallbackError) {
        console.error('❌ Fallback loading also failed:', fallbackError);
        // Valori di default assoluti
        setClosedDays(new Set([0])); // Domenica chiusa
        setClosedDates(new Set([]));
        console.log('🔧 Using absolute default closure settings');
      }
    }
  };  // Load user profile data (only for regular users, not barbers)
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        console.log('🔄 Fetching user profile data...');
        const response = await fetch('/api/user/profile');
        console.log('📡 Profile API response status:', response.status);
        
        if (response.ok) {
          const data = await response.json();
          console.log('✅ Profile data received:', data);
            // For users who can make bookings for others, don't overwrite manually entered customer data
          if (!canMakeBookingsForOthers) {
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
          console.log('📞 Phone set to:', data.profile.phone || 'empty');
        } else {
          console.error('❌ Profile API error:', response.status, response.statusText);
          const errorText = await response.text();
          console.error('📄 Error response:', errorText);
        }
      } catch (error) {
        console.error('❌ Error fetching user profile:', error);
      }
    };    if (userSession?.user?.id && !canMakeBookingsForOthers) {
      console.log('👤 User session found, fetching profile for:', userSession.user.email);
      fetchUserProfile();
    } else if (canMakeBookingsForOthers) {
      console.log('💼 User can make bookings for others, skipping profile fetch - using manual input');
    } else {
      console.log('⚠️ No user session or user ID found');
    }
  }, [userSession, canMakeBookingsForOthers]);

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
    setFormData(prev => ({ ...prev, selectedService: null }));
  }, [formData.selectedBarber, allServices]);

  // Load barber-specific recurring closures when barber changes
  useEffect(() => {
    const loadBarberClosures = async () => {      if (!formData.selectedBarber) {
        setBarberClosedDays(new Set());
        console.log('🔄 No barber selected, clearing barber closures');
        return;
      }

      try {
        console.log(`🔄 Loading recurring closures for barber: ${formData.selectedBarber.name} (ID: ${formData.selectedBarber.id})`);
        const response = await fetch(`/api/barber-recurring-closures/public?barberId=${formData.selectedBarber.id}`);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const text = await response.text();
        console.log('📄 Raw response from barber-recurring-closures API:', text);
        
        if (!text || text.trim() === '') {
          console.warn('⚠️ Empty response from barber closures API');
          setBarberClosedDays(new Set());
          return;
        }
        
        let data;
        try {
          data = JSON.parse(text);
        } catch (parseError) {
          console.error('❌ JSON parse error for barber closures:', parseError);
          console.error('🔍 Response text was:', JSON.stringify(text));
          setBarberClosedDays(new Set());
          return;
        }
        
        const closedDays = Array.isArray(data.closedDays) ? data.closedDays : [];
        setBarberClosedDays(new Set(closedDays));
        console.log(`✅ Loaded barber closures for ${formData.selectedBarber.name}:`, closedDays);
        
      } catch (error) {
        console.error('❌ Error loading barber closures:', error);
        setBarberClosedDays(new Set());
      }
    };

    loadBarberClosures();
  }, [formData.selectedBarber]);// Update available slots when date or barber changes with debouncing
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

  // Check if the selected barber is closed on a specific date due to recurring closures
  const isBarberClosedRecurring = (dateString: string) => {
    if (!formData.selectedBarber) return false;
    
    try {
      // Parse the date string to get the day of week
      const [year, month, day] = dateString.split('-').map(Number);
      const date = new Date(Date.UTC(year, month - 1, day));
      const dayOfWeek = date.getUTCDay(); // 0 = Sunday, 1 = Monday, etc.
      
      // Check if this day of the week is in the barber's closed days
      return barberClosedDays.has(dayOfWeek);
    } catch (error) {
      console.error('Error checking if barber is closed:', error);
      return false;    }
  };

  // [DEPRECATED] Old function kept for compatibility - will be removed in next version
  // const checkDayAvailability = async (dateString: string) => {
  //   // This function is no longer used due to optimization with batch API
  //   return false;
  // };
  // Update unavailable dates when barber changes (OPTIMIZED - Single API call)
  useEffect(() => {
    if (!formData.selectedBarber) {
      setUnavailableDates(new Set());
      return;
    }    const updateUnavailableDatesOptimized = async () => {
      try {
        if (!formData.selectedBarber) return; // Additional safety check
        
        console.log('🚀 Starting optimized availability check for barber:', formData.selectedBarber.name);
        
        const today = new Date();
        const dates: string[] = [];
        
        // Generate the next 30 days
        for (let i = 0; i < 30; i++) {
          const date = new Date(today);
          date.setDate(today.getDate() + i);
          
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const day = String(date.getDate()).padStart(2, '0');
          const dateString = `${year}-${month}-${day}`;
          dates.push(dateString);
        }
        
        // Single API call for all dates
        const batchAvailability = await BookingService.getBatchAvailability(
          formData.selectedBarber.id, 
          dates
        );
        
        // Process results
        const newUnavailableDates = new Set<string>();
        for (const [dateString, availability] of Object.entries(batchAvailability)) {
          if (!availability.hasSlots && !isDateClosed(dateString)) {
            newUnavailableDates.add(dateString);
          }
        }
        
        setUnavailableDates(newUnavailableDates);
        console.log(`✅ Optimized availability check completed: ${newUnavailableDates.size} unavailable dates found`);
        
      } catch (error) {
        console.error('❌ Error in optimized availability check:', error);
        setUnavailableDates(new Set()); // Fallback to empty set
      }
    };

    // Debounce the update to avoid too many API calls
    const timeoutId = setTimeout(updateUnavailableDatesOptimized, 500);
    return () => clearTimeout(timeoutId);
  }, [formData.selectedBarber]);
  // Helper function to generate date buttons for the next 2 months (60 days)
  const generateDateButtons = () => {
    const dates = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time for accurate comparison
    
    // Determina la data di partenza
    const currentYear = today.getFullYear();
    const september1st = new Date(currentYear, 8, 1); // 8 = September (0-indexed)
    september1st.setHours(0, 0, 0, 0);
    
    // Se siamo prima del 1 settembre, parti dal 1 settembre
    // Altrimenti parti da oggi
    const startDate = today < september1st ? september1st : today;
    
    let lastMonth = startDate.getMonth();
    
    // Calcola la differenza in giorni tra oggi e la data di partenza
    const daysDifference = Math.floor((startDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    for (let i = 0; i < 60; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      
      // Check if we've moved to a new month and add a month separator
      if (date.getMonth() !== lastMonth && i > 0) {
        const monthNames = ['Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno', 'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'];
        dates.push({
          type: 'monthSeparator',
          monthName: monthNames[date.getMonth()],
          year: date.getFullYear()
        });
        lastMonth = date.getMonth();
      }
        
      const dayNames = ['DOM', 'LUN', 'MAR', 'MER', 'GIO', 'VEN', 'SAB'];
      const monthNames = ['GEN', 'FEB', 'MAR', 'APR', 'MAG', 'GIU', 'LUG', 'AGO', 'SET', 'OTT', 'NOV', 'DIC'];
      // isToday è true solo se la data corrente è effettivamente oggi
      const isToday = date.toDateString() === today.toDateString();
      
      // Calculate proper week boundaries based on start date
      const startDayOfWeek = startDate.getDay(); // 0 = Sunday, 1 = Monday, etc.
      const daysUntilNextWeek = 7 - startDayOfWeek; // Days until next Monday
      const isNextWeek = i >= daysUntilNextWeek && i < (daysUntilNextWeek + 7);
      const isNextMonth = i >= 30;
      
      // Fix timezone issue by manually formatting the date instead of using toISOString()
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');      const dateString = `${year}-${month}-${day}`;
      
      // Check different types of closures
      const isGenerallyClosed = isDateClosed(dateString);
      const isBarberClosed = isBarberClosedRecurring(dateString);
      const hasNoAvailableSlots = formData.selectedBarber && unavailableDates.has(dateString) && !isGenerallyClosed && !isBarberClosed;
      
      dates.push({
        type: 'dateButton',
        date: dateString,
        dayName: dayNames[date.getDay()],
        dayNumber: date.getDate(),
        monthName: monthNames[date.getMonth()],
        disabled: isGenerallyClosed || isBarberClosed || !!hasNoAvailableSlots,
        isToday,
        isNextWeek,
        isNextMonth,
        isClosed: isGenerallyClosed,
        isBarberClosed,
        hasNoAvailableSlots
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
  const handleServiceChange = (service: Service) => {
    setFormData(prev => ({
      ...prev,
      selectedService: service, // Imposta direttamente il servizio selezionato
    }));
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
      customerInfo: {        ...prev.customerInfo,
        [name]: value
      }
    }));
  };

  // Calculate total duration and price
  const totalDuration = formData.selectedService?.duration || 0;
  const totalPrice = formData.selectedService?.price || 0;
  // Handle form submission
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!isStepValid(4)) return; // Ensure final step validation passes

    setLoading(true);
    setError(null);
    setBookingResponse(null);

    try {
      // Verifica che l'utente abbia un ID valido
      console.log('🔍 User session debug:', userSession);
      console.log('🔍 User ID from session:', (userSession.user as any)?.id);
      
      const userId = (userSession.user as any)?.id;
      if (!userId) {
        throw new Error('Sessione utente non valida. Prova a fare logout e login di nuovo.');
      }      // For users who can make bookings for others, phone is optional
      if (!canMakeBookingsForOthers && (!formData.customerInfo.phone || formData.customerInfo.phone.trim().length === 0)) {
        throw new Error('Il numero di telefono è obbligatorio per le prenotazioni.');
      }const bookingPayload = {
        userId: userId,
        barberId: formData.selectedBarber!.id,
        serviceIds: formData.selectedService?.id ? [formData.selectedService.id] : [], // Keep for API compatibility
        services: formData.selectedService ? [formData.selectedService] : [], // Add for type compatibility
        duration: totalDuration, // Add for type compatibility
        customerInfo: formData.customerInfo,
        date: formData.selectedDate,
        time: formData.selectedTime,
        totalPrice: totalPrice,
        totalDuration: totalDuration
      };
      
      console.log('🚀 Booking payload being sent:', JSON.stringify(bookingPayload, null, 2));
      console.log('📋 About to call BookingService.createBooking...');
        const response = await BookingService.createBooking(bookingPayload);
      console.log('✅ BookingService.createBooking completed successfully');
      console.log('📥 Booking response:', response);
      
      // Track successful booking conversion
      trackConversion('booking_completed', {
        currency: 'EUR',
        value: totalPrice,
        transaction_id: response?.id || 'unknown',
        items: formData.selectedService ? [{
          item_id: formData.selectedService.id,
          item_name: formData.selectedService.name,
          category: 'barber_service',
          quantity: 1,
          price: formData.selectedService.price
        }] : []
      });
      
      // Track individual events
      trackEvent('booking_submit', 'engagement', 'booking_form', totalPrice);
      trackEvent('purchase', 'ecommerce', `${formData.selectedBarber?.name} - ${formData.selectedService?.name}`, totalPrice);
      
      setBookingResponse(response); // Store full response
      setCurrentStep(5); // Move to confirmation step
    } catch (err: any) {
      console.error('💥 Error in handleSubmit:', err);
      setError(err.message || 'Errore durante la creazione della prenotazione.');
    } finally {
      setLoading(false);
    }
  };  // Check if current step is valid
  const isStepValid = (step: number) => {
    switch (step) {
      case 1:
        return formData.selectedBarber !== null;
      case 2:
        return formData.selectedService !== null;
      case 3:
        return formData.selectedDate && formData.selectedTime;      case 4:
        // For users who can make bookings for others: only name is required (email and phone are optional)
        // For regular users: name, email, phone required
        if (canMakeBookingsForOthers) {
          return formData.customerInfo.name && formData.customerInfo.name.trim() !== '';
        } else {
          return formData.customerInfo.name && 
                 formData.customerInfo.email &&
                 formData.customerInfo.phone;
        }
      default:
        return false;
    }
  };
  const nextStep = () => {
    if (isStepValid(currentStep)) {
      // Track step progression
      trackEvent('booking_step_completed', 'engagement', `step_${currentStep}`, currentStep);
      
      const nextStepNumber = currentStep + 1;
      setCurrentStep(nextStepNumber);
      
      // Track specific milestones
      if (nextStepNumber === 2) {
        trackEvent('barber_selected', 'engagement', formData.selectedBarber?.name || 'unknown');
      } else if (nextStepNumber === 3) {
        trackEvent('services_selected', 'engagement', formData.selectedService?.name || 'unknown');
      } else if (nextStepNumber === 4) {
        trackEvent('datetime_selected', 'engagement', `${formData.selectedDate} ${formData.selectedTime}`);
      }
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
          </motion.h2>                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(formData.selectedBarber.availableServices || displayedServices).map((service: Service) => (
              <label
                key={service.id}
                className={`p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                  formData.selectedService?.id === service.id
                    ? 'border-amber-500 bg-amber-900/30 shadow-lg'
                    : 'border-gray-700 bg-gray-800/50 hover:border-amber-500/50'
                }`}
              >
                <div className="flex items-center">
                  <input
                    type="radio"
                    name="service"
                    checked={formData.selectedService?.id === service.id}
                    onChange={() => handleServiceChange(service)}
                    className="h-5 w-5 text-amber-600 bg-gray-700 border-gray-600 focus:ring-amber-500 mr-4"
                  />
                  <div className="flex-1">
                    <h4 className="font-bold text-white">{service.name}</h4>
                    <p className="text-sm text-gray-400">{service.description}</p>
                    <div className="text-sm text-amber-400 mt-2 font-semibold">
                      <span>{service.duration} min</span> - <span>€{service.price}</span>
                    </div>
                  </div>
                </div>
              </label>
            ))}
          </div>

          {formData.selectedService && (
            <motion.div
              variants={fadeInUp}
              className="bg-gray-900 p-4 rounded-lg border border-gray-700"
            >
              <h3 className="font-semibold mb-2 text-white">Riepilogo servizi selezionati:</h3>
              <div className="space-y-2">
                <div key={formData.selectedService.id} className="flex justify-between text-sm text-gray-300">
                  <span>{formData.selectedService.name}</span>
                  <span>€{formData.selectedService.price} - {formData.selectedService.duration} min</span>
                </div>
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
                {generateDateButtons().map((item, index) => {
                  // Render month separator
                  if (item.type === 'monthSeparator') {
                    return (
                      <div key={`separator-${index}`} className="col-span-full my-4">
                        <div className="flex items-center">
                          <div className="flex-grow border-t border-gray-600"></div>
                          <div className="px-4 py-2 bg-gray-700 rounded-full">
                            <span className="text-amber-400 font-bold text-sm">
                              {item.monthName} {item.year}
                            </span>
                          </div>
                          <div className="flex-grow border-t border-gray-600"></div>
                        </div>
                      </div>
                    );
                  }
                  
                  // Render date button
                  const dateButton = item;
                  return (
                    <motion.button
                      key={dateButton.date}
                      onClick={() => {
                        if (dateButton.disabled) {
                          if (dateButton.hasNoAvailableSlots) {
                            alert('Tutti gli orari per questo giorno sono già occupati. Prova un altro giorno!');
                          } else if (dateButton.isBarberClosed) {
                            alert(`${formData.selectedBarber?.name || 'Il barbiere'} è chiuso in questo giorno. Scegli un altro giorno!`);
                          } else if (dateButton.isClosed) {
                            alert('Il barbershop è chiuso in questo giorno. Scegli un altro giorno!');
                          }
                          return;
                        }
                        handleDateChange(dateButton.date!);
                      }}
                      disabled={dateButton.disabled}                      className={`p-3 rounded-lg border-2 transition-all duration-200 min-h-[80px] flex flex-col items-center justify-center relative ${
                        formData.selectedDate === dateButton.date
                          ? 'border-yellow-400 bg-yellow-400 text-black shadow-lg'
                          : dateButton.disabled
                          ? dateButton.isClosed
                            ? 'border-red-600 bg-red-900/30 text-red-400 cursor-not-allowed'
                            : dateButton.isBarberClosed
                            ? 'border-red-600 bg-red-900/30 text-red-400 cursor-not-allowed'
                            : dateButton.hasNoAvailableSlots
                            ? 'border-orange-600 bg-orange-900/30 text-orange-400 cursor-not-allowed'
                            : 'border-gray-700 bg-gray-800 text-gray-500 cursor-not-allowed'
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
                      )}

                      <div className={`text-xs font-medium ${
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
                        <div className="text-xs mt-1">
                          {dateButton.isClosed ? (
                            <span className="text-red-500 font-medium">Chiuso</span>
                          ) : dateButton.isBarberClosed ? (
                            <span className="text-red-500 font-medium">Chiuso</span>
                          ) : dateButton.hasNoAvailableSlots ? (
                            <span className="text-orange-400">Tutto occupato</span>
                          ) : (
                            <span className="text-red-500 font-medium">Non disponibile</span>
                          )}
                        </div>
                      )}
                    </motion.button>
                  );
                })}
              </div>{/* Legend for date colors */}
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
                </div>                <div className="flex items-center">
                  <div className="w-3 h-3 bg-red-900/30 border border-red-600 rounded mr-2"></div>
                  <span>Giorni di chiusura</span>
                </div>
                {formData.selectedBarber && (
                  <>
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-red-900/30 border border-red-600 rounded mr-2"></div>
                      <span>Chiuso</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-orange-900/30 border border-orange-600 rounded mr-2"></div>
                      <span>Tutto occupato</span>
                    </div>
                  </>
                )}
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
            {isBarber ? 'Riepilogo e Dati Cliente' : 'Riepilogo e Note Aggiuntive'}
          </motion.h2>

          {/* Info for barbers */}
          {isBarber && (
            <motion.div variants={fadeInUp} className="bg-gradient-to-r from-blue-900/20 to-indigo-900/20 p-4 rounded-lg border border-blue-600/30 mb-6">
              <h4 className="text-blue-300 font-semibold mb-2 flex items-center">
                💼 Modalità Barbiere Attiva
              </h4>
              <p className="text-sm text-gray-300">
                Stai prenotando un appuntamento per un cliente. Controlla i dettagli del servizio e inserisci manualmente i dati del cliente nella sezione sottostante.
              </p>
            </motion.div>
          )}

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
                    {formData.selectedService && (
                      <div className="flex justify-between items-center bg-gray-800/50 p-2 rounded">
                        <span className="text-white">{formData.selectedService.name}</span>
                        <span className="text-yellow-400 font-semibold">€{formData.selectedService.price}</span>
                      </div>
                    )}
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
            </div>            {/* Customer Info - Display for regular users / Input for barbers */}
            <div className="mt-6 pt-4 border-t border-gray-600">
              <h4 className="text-sm font-medium text-gray-300 mb-3">                👤 Informazioni Cliente
                {canMakeBookingsForOthers && <span className="text-yellow-400 ml-2">(Inserisci manualmente)</span>}
              </h4>
              
              {canMakeBookingsForOthers ? (
                /* Editable fields for barbers */
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Nome *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.customerInfo.name}
                      onChange={handleCustomerInfoChange}
                      placeholder="Nome del cliente"
                      className="w-full px-3 py-2 border border-gray-600 rounded bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                      required
                    />
                  </div>                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Email (opzionale)</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.customerInfo.email}
                      onChange={handleCustomerInfoChange}
                      placeholder="email@cliente.com (opzionale)"
                      className="w-full px-3 py-2 border border-gray-600 rounded bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                    />
                  </div>                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Telefono (opzionale)</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.customerInfo.phone}
                      onChange={handleCustomerInfoChange}
                      placeholder="+39 123 456 7890 (opzionale)"
                      className="w-full px-3 py-2 border border-gray-600 rounded bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                    />
                  </div>
                </div>              ) : (
                /* Editable phone for regular users + read-only name/email */
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="bg-gray-800/30 p-3 rounded">
                      <span className="text-gray-400">Nome:</span>
                      <p className="text-white font-medium">{formData.customerInfo.name}</p>
                    </div>
                    <div className="bg-gray-800/30 p-3 rounded">
                      <span className="text-gray-400">Email:</span>
                      <p className="text-white font-medium">{formData.customerInfo.email}</p>
                    </div>
                  </div>
                  
                  {/* Editable phone field for regular users */}
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Telefono *</label>
                    <div className="flex space-x-2">
                      <input
                        type="tel"                        name="phone"
                        value={formData.customerInfo.phone}
                        onChange={handleCustomerInfoChange}
                        placeholder="+39 123 456 7890"
                        className="w-full px-3 py-2 border border-gray-600 rounded bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                        required
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Il numero di telefono è necessario per confermare la prenotazione
                    </p>
                  </div>
                </div>
              )}              {canMakeBookingsForOthers ? (
                <p className="text-xs text-yellow-300 mt-2 bg-yellow-900/20 p-2 rounded border border-yellow-600/30">
                  💼 <strong>{isBarber ? 'Modalità Barbiere' : 'Modalità Amministratore'}:</strong> Stai prenotando per un cliente. Solo il nome è obbligatorio, email e telefono sono opzionali.
                </p>
              ) : (
                <p className="text-xs text-blue-300 mt-2 bg-blue-900/20 p-2 rounded border border-blue-600/30">
                  📱 <strong>Dati Personali:</strong> Inserisci i tuoi dati per completare la prenotazione.
                </p>
              )}
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
        >          <motion.div variants={fadeInUp}>
            <svg className="w-16 h-16 mx-auto text-amber-500" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          </motion.div>          <motion.h2 variants={fadeInUp} className="text-3xl font-bold text-amber-400">
            Prenotazione Confermata!
          </motion.h2>

          <motion.div variants={fadeInUp} className="bg-gray-900 border-2 border-amber-500 p-6 rounded-lg shadow-lg text-left space-y-2">
            <p className="text-white"><strong className="text-amber-400">ID Prenotazione:</strong> {bookingResponse.id || bookingResponse.booking?.id}</p>
            <p className="text-white"><strong className="text-amber-400">Barbiere:</strong> {formData.selectedBarber?.name}</p>
            <p className="text-white"><strong className="text-amber-400">Servizi:</strong> {formData.selectedService?.name}</p>
            <p className="text-white"><strong className="text-amber-400">Data:</strong> {formatSelectedDate(formData.selectedDate)} alle {formData.selectedTime}</p>
            <p className="text-white"><strong className="text-amber-400">Cliente:</strong> {formData.customerInfo.name}</p>
              
            {/* Resoconto finale */}
            <div className="mt-4 p-4 bg-gray-800 border border-amber-400 rounded-lg">
              <h4 className="font-semibold text-amber-300 mb-3 flex items-center gap-2">
                🎉 Resoconto della prenotazione
              </h4>
              <div className="text-sm text-gray-300 space-y-2">
                <p className="flex items-start gap-2">
                  <span className="text-green-400">✅</span>
                  <span><strong className="text-white">Prenotazione confermata</strong> nel nostro sistema</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-purple-400">📱</span>
                  <span><strong className="text-white">Promemoria</strong> prima dell'appuntamento</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-amber-400">🏪</span>
                  <span><strong className="text-white">Ti aspettiamo</strong> presso Maskio Barber Concept</span>
                </p>
                {formData.customerInfo.notes && (
                  <p className="flex items-start gap-2">
                    <span className="text-cyan-400">📝</span>
                    <span><strong className="text-white">Le tue note speciali</strong> sono state salvate per il barbiere</span>
                  </p>
                )}
                <div className="mt-3 pt-3 border-t border-gray-600">
                  <p className="flex items-start gap-2 font-medium text-amber-300">
                    <span className="text-yellow-400">💡</span>
                    <em>In caso di imprevisti, contattaci almeno 48 ore prima dell'appuntamento</em>
                  </p>
                </div>
              </div>
            </div>
            
            <p className="mt-4 font-medium text-amber-300 text-center">
              Grazie per aver scelto Maskio Barber Concept! 🙏
            </p>
          </motion.div>          <motion.div variants={fadeInUp} className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => {
                // Redirect alla home page
                window.location.href = '/';
              }}
              className="bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 px-8 rounded-lg shadow-md transition-colors duration-300"
            >
              🏠 Torna alla Home
            </button>
            <button
              onClick={() => {
                // Redirect all'area personale
                window.location.href = '/area-personale';
              }}
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-8 rounded-lg shadow-md transition-colors duration-300"
            >
              📅 Visualizza i tuoi appuntamenti
            </button>
            <button
              onClick={() => {
                // Reset completo del form per una nuova prenotazione
                setCurrentStep(1);
                setFormData({
                  selectedBarber: null,
                  selectedService: null,
                  selectedDate: '',
                  selectedTime: '',
                  customerInfo: { name: '', email: '', phone: '', notes: '' }
                });
                setBookingResponse(null);
                setAvailableSlots([]);
                setUnavailableDates(new Set());
                setError(null);
                
                // Scroll to top per una migliore UX
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-8 rounded-lg shadow-md transition-colors duration-300"
            >
              ➕ Effettua Nuova Prenotazione
            </button>
          </motion.div>
        </motion.div>
      )}      {/* Navigation Buttons - Hide when booking is confirmed */}
      {!bookingResponse && (
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
          disabled={!isStepValid(currentStep) || loading}          className={`px-8 py-3 rounded-lg font-semibold transition-all duration-200 ${
            !isStepValid(currentStep) || loading
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-amber-500 text-white hover:bg-amber-600'
          }`}
          whileHover={{ scale: isStepValid(currentStep) && !loading ? 1.05 : 1 }}          whileTap={{ scale: isStepValid(currentStep) && !loading ? 0.95 : 1 }}        >          {loading ? 'Caricamento...' : currentStep === 4 ? 'Conferma Prenotazione' : 'Continua'}
        </motion.button>        </div>
      )}
        </>
      )}
    </div>
  );
}
